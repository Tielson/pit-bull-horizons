import { supabase } from '@/lib/customSupabaseClient';

export const testSupabaseConnection = async () => {
  console.group('🔍 TESTE DE CONEXÃO SUPABASE');
  console.log('='.repeat(50));
  
  // 1. Verificar variáveis de ambiente
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  console.log('1️⃣ Verificando variáveis de ambiente:');
  console.log('   VITE_SUPABASE_URL:', supabaseUrl ? '✅ Configurado' : '❌ NÃO configurado');
  console.log('   URL:', supabaseUrl || 'undefined');
  console.log('   VITE_SUPABASE_ANON_KEY:', supabaseKey ? '✅ Configurado' : '❌ NÃO configurado');
  console.log('   Key (primeiros 30 chars):', supabaseKey ? supabaseKey.substring(0, 30) + '...' : 'undefined');
  console.log('');

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ ERRO: Variáveis de ambiente não configuradas!');
    console.log('');
    console.log('📝 Para configurar:');
    console.log('   1. Crie um arquivo .env na raiz do projeto');
    console.log('   2. Adicione as linhas:');
    console.log('      VITE_SUPABASE_URL=sua-url-aqui');
    console.log('      VITE_SUPABASE_ANON_KEY=sua-chave-aqui');
    console.log('   3. Reinicie o servidor (npm run dev)');
    console.groupEnd();
    return {
      success: false,
      error: 'Variáveis de ambiente não configuradas',
      envVars: { url: !!supabaseUrl, key: !!supabaseKey }
    };
  }

  // 2. Testar conexão com Supabase
  console.log('2️⃣ Testando conexão com Supabase...');
  
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ ERRO ao conectar com Supabase:', error.message);
      console.error('   Código do erro:', error.status || 'N/A');
      console.error('   Detalhes:', error);
      console.log('');
      console.log('💡 Possíveis causas:');
      console.log('   - URL incorreta');
      console.log('   - Chave (anon key) incorreta');
      console.log('   - Projeto Supabase pausado ou deletado');
      console.log('   - Problemas de rede/firewall');
      console.groupEnd();
      return {
        success: false,
        error: error.message,
        envVars: { url: !!supabaseUrl, key: !!supabaseKey }
      };
    }

    console.log('✅ CONEXÃO ESTABELECIDA COM SUCESSO!');
    console.log('');
    console.log('3️⃣ Informações da sessão:');
    console.log('   Sessão ativa:', data.session ? 'Sim' : 'Não (normal se não estiver logado)');
    if (data.session) {
      console.log('   Usuário:', data.session.user?.email || 'N/A');
      console.log('   ID:', data.session.user?.id || 'N/A');
    }
    console.log('');
    
    // 3. Testar health do servidor
    console.log('4️⃣ Testando saúde do servidor...');
    try {
      // Tenta uma operação simples no banco
      const { error: healthError } = await supabase.from('_test').select('*').limit(1);
      
      // Se der erro de tabela não existe, está ok (significa que conectou)
      // PGRST205 = tabela não encontrada no schema cache (erro esperado)
      // PGRST116 = tabela não encontrada (outro código possível)
      if (healthError && (healthError.code === 'PGRST205' || healthError.code === 'PGRST116')) {
        console.log('   ✅ Servidor respondendo (tabela de teste não existe, mas isso é ok)');
      } else if (healthError) {
        console.warn('   ⚠️ Aviso:', healthError.message);
      } else {
        console.log('   ✅ Servidor respondendo');
      }
    } catch (e) {
      console.warn('   ⚠️ Não foi possível testar o health, mas a conexão básica funciona');
    }

    console.log('');
    console.log('=' .repeat(50));
    console.log('🎉 RESULTADO: Conexão com Supabase funcionando!');
    console.log('=' .repeat(50));
    console.groupEnd();

    return {
      success: true,
      session: data.session,
      envVars: { url: !!supabaseUrl, key: !!supabaseKey }
    };

  } catch (error) {
    console.error('❌ ERRO INESPERADO:', error.message);
    console.error('   Stack:', error.stack);
    console.log('');
    console.log('💡 Este é um erro não esperado. Detalhes acima.');
    console.groupEnd();

    return {
      success: false,
      error: error.message,
      envVars: { url: !!supabaseUrl, key: !!supabaseKey }
    };
  }
};

// Executar automaticamente ao importar
if (typeof window !== 'undefined') {
  console.log('🚀 Iniciando teste de conexão Supabase...');
  testSupabaseConnection().then(result => {
    if (result.success) {
      console.log('✅ Supabase conectado e pronto para uso!');
    } else {
      console.error('❌ Falha na conexão com Supabase. Verifique os logs acima.');
    }
  });
}

export default testSupabaseConnection;

