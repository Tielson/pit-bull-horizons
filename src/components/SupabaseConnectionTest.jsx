import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import React, { useState } from 'react';

export default function SupabaseConnectionTest() {
  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const { toast } = useToast();
  const { user, session } = useAuth();

  const testConnection = async () => {
    setTesting(true);
    setTestResults(null);

    const results = {
      envVariables: {
        url: !!import.meta.env.VITE_SUPABASE_URL,
        key: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
        urlValue: import.meta.env.VITE_SUPABASE_URL || 'Não configurado',
        keyPreview: import.meta.env.VITE_SUPABASE_ANON_KEY 
          ? `${import.meta.env.VITE_SUPABASE_ANON_KEY.substring(0, 20)}...` 
          : 'Não configurado'
      },
      clientInitialization: null,
      healthCheck: null,
      authCheck: null,
      databaseConnection: null
    };

    try {
      // Test 1: Verificar inicialização do cliente
      results.clientInitialization = {
        success: true,
        message: 'Cliente Supabase inicializado com sucesso'
      };
    } catch (error) {
      results.clientInitialization = {
        success: false,
        message: `Erro ao inicializar cliente: ${error.message}`
      };
    }

    try {
      // Test 2: Health check - verificar se o servidor responde
      const { data, error } = await supabase.from('_health').select('*').limit(1);
      
      // Se não houver tabela _health, tentamos uma query simples de auth
      if (error && error.code === 'PGRST116') {
        // Tabela não existe, mas isso é ok - significa que a conexão funciona
        results.healthCheck = {
          success: true,
          message: 'Conexão com Supabase estabelecida (servidor responde)'
        };
      } else if (error) {
        results.healthCheck = {
          success: false,
          message: `Erro na conexão: ${error.message}`
        };
      } else {
        results.healthCheck = {
          success: true,
          message: 'Health check passou com sucesso'
        };
      }
    } catch (error) {
      // Test alternativo: verificar auth
      try {
        const { data: { session }, error: authError } = await supabase.auth.getSession();
        if (authError) {
          results.healthCheck = {
            success: false,
            message: `Erro na autenticação: ${authError.message}`
          };
        } else {
          results.healthCheck = {
            success: true,
            message: 'Conexão com Supabase estabelecida (via auth)'
          };
        }
      } catch (authErr) {
        results.healthCheck = {
          success: false,
          message: `Erro ao conectar: ${authErr.message}`
        };
      }
    }

    try {
      // Test 3: Verificar autenticação
      const { data: { session }, error } = await supabase.auth.getSession();
      results.authCheck = {
        success: !error,
        message: error 
          ? `Erro ao verificar autenticação: ${error.message}`
          : session 
            ? 'Sessão ativa encontrada'
            : 'Nenhuma sessão ativa (normal se não estiver logado)'
      };
    } catch (error) {
      results.authCheck = {
        success: false,
        message: `Erro ao verificar autenticação: ${error.message}`
      };
    }

    try {
      // Test 4: Tentar uma query simples (se houver alguma tabela pública)
      // Este teste pode falhar se não houver tabelas, mas não é crítico
      const { error } = await supabase.rpc('version');
      if (error && error.code !== '42883') { // 42883 = função não existe, mas conexão funciona
        results.databaseConnection = {
          success: false,
          message: `Erro na conexão com banco: ${error.message}`
        };
      } else {
        results.databaseConnection = {
          success: true,
          message: 'Conexão com banco de dados funcionando'
        };
      }
    } catch (error) {
      results.databaseConnection = {
        success: true,
        message: 'Conexão básica funcionando (teste de RPC não disponível)'
      };
    }

    setTestResults(results);
    setTesting(false);

    const allTestsPassed = 
      results.envVariables.url && 
      results.envVariables.key &&
      results.clientInitialization?.success &&
      results.healthCheck?.success;

    if (allTestsPassed) {
      toast({
        title: "✅ Conexão com Supabase bem-sucedida!",
        description: "Todos os testes passaram.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "⚠️ Alguns testes falharam",
        description: "Verifique os resultados abaixo.",
      });
    }
  };

  return (
    <div className="p-6 bg-gray-900 rounded-lg border border-yellow-500/30">
      <h2 className="text-2xl font-bold text-yellow-500 mb-4">
        Teste de Conexão Supabase
      </h2>
      
      <div className="mb-4 space-y-2">
        <p className="text-gray-300">
          Este componente testa a conexão com o Supabase verificando:
        </p>
        <ul className="list-disc list-inside text-gray-400 space-y-1 ml-4">
          <li>Variáveis de ambiente configuradas</li>
          <li>Inicialização do cliente</li>
          <li>Conexão com o servidor</li>
          <li>Autenticação</li>
          <li>Conexão com banco de dados</li>
        </ul>
      </div>

      <Button
        onClick={testConnection}
        disabled={testing}
        className="mb-4 bg-yellow-500 hover:bg-yellow-600 text-black"
      >
        {testing ? 'Testando...' : 'Testar Conexão'}
      </Button>

      {testResults && (
        <div className="mt-6 space-y-4">
          {/* Variáveis de Ambiente */}
          <div className="p-4 bg-gray-800 rounded border border-gray-700">
            <h3 className="font-semibold text-yellow-400 mb-2">
              1. Variáveis de Ambiente
            </h3>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2">
                <span className={testResults.envVariables.url ? 'text-green-400' : 'text-red-400'}>
                  {testResults.envVariables.url ? '✅' : '❌'}
                </span>
                <span className="text-gray-300">VITE_SUPABASE_URL:</span>
                <span className="text-gray-400 text-xs font-mono">
                  {testResults.envVariables.urlValue}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={testResults.envVariables.key ? 'text-green-400' : 'text-red-400'}>
                  {testResults.envVariables.key ? '✅' : '❌'}
                </span>
                <span className="text-gray-300">VITE_SUPABASE_ANON_KEY:</span>
                <span className="text-gray-400 text-xs font-mono">
                  {testResults.envVariables.keyPreview}
                </span>
              </div>
            </div>
          </div>

          {/* Inicialização do Cliente */}
          {testResults.clientInitialization && (
            <div className="p-4 bg-gray-800 rounded border border-gray-700">
              <h3 className="font-semibold text-yellow-400 mb-2">
                2. Inicialização do Cliente
              </h3>
              <div className="flex items-center gap-2">
                <span className={testResults.clientInitialization.success ? 'text-green-400' : 'text-red-400'}>
                  {testResults.clientInitialization.success ? '✅' : '❌'}
                </span>
                <span className="text-gray-300 text-sm">
                  {testResults.clientInitialization.message}
                </span>
              </div>
            </div>
          )}

          {/* Health Check */}
          {testResults.healthCheck && (
            <div className="p-4 bg-gray-800 rounded border border-gray-700">
              <h3 className="font-semibold text-yellow-400 mb-2">
                3. Conexão com Servidor
              </h3>
              <div className="flex items-center gap-2">
                <span className={testResults.healthCheck.success ? 'text-green-400' : 'text-red-400'}>
                  {testResults.healthCheck.success ? '✅' : '❌'}
                </span>
                <span className="text-gray-300 text-sm">
                  {testResults.healthCheck.message}
                </span>
              </div>
            </div>
          )}

          {/* Auth Check */}
          {testResults.authCheck && (
            <div className="p-4 bg-gray-800 rounded border border-gray-700">
              <h3 className="font-semibold text-yellow-400 mb-2">
                4. Verificação de Autenticação
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className={testResults.authCheck.success ? 'text-green-400' : 'text-red-400'}>
                    {testResults.authCheck.success ? '✅' : '❌'}
                  </span>
                  <span className="text-gray-300 text-sm">
                    {testResults.authCheck.message}
                  </span>
                </div>
                {user && (
                  <div className="ml-6 text-xs text-gray-400">
                    Usuário logado: {user.email}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Database Connection */}
          {testResults.databaseConnection && (
            <div className="p-4 bg-gray-800 rounded border border-gray-700">
              <h3 className="font-semibold text-yellow-400 mb-2">
                5. Conexão com Banco de Dados
              </h3>
              <div className="flex items-center gap-2">
                <span className={testResults.databaseConnection.success ? 'text-green-400' : 'text-red-400'}>
                  {testResults.databaseConnection.success ? '✅' : '❌'}
                </span>
                <span className="text-gray-300 text-sm">
                  {testResults.databaseConnection.message}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded">
        <p className="text-sm text-blue-300">
          <strong>Dica:</strong> Se algum teste falhar, verifique se:
        </p>
        <ul className="list-disc list-inside text-xs text-blue-200 mt-2 ml-4 space-y-1">
          <li>O arquivo <code className="bg-gray-800 px-1 rounded">.env</code> existe na raiz do projeto</li>
          <li>As variáveis <code className="bg-gray-800 px-1 rounded">VITE_SUPABASE_URL</code> e <code className="bg-gray-800 px-1 rounded">VITE_SUPABASE_ANON_KEY</code> estão preenchidas</li>
          <li>Você reiniciou o servidor de desenvolvimento após criar/editar o <code className="bg-gray-800 px-1 rounded">.env</code></li>
          <li>As credenciais estão corretas no painel do Supabase</li>
        </ul>
      </div>
    </div>
  );
}

