import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

/**
 * Página de callback para processar tokens de autenticação
 * (Magic Link, Password Recovery, etc.)
 */
const AuthCallback = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing'); // processing, success, error
  const [message, setMessage] = useState('Processando autenticação...');

  useEffect(() => {
    const processAuth = async () => {
      try {
        // Verificar se há um token na URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const type = hashParams.get('type');

        console.log('🔐 Auth Callback:', { type, hasToken: !!accessToken });

        if (!accessToken) {
          throw new Error('Nenhum token de acesso encontrado');
        }

        // Processar o token
        if (type === 'recovery') {
          setMessage('Token de recuperação detectado. Redirecionando...');
          // Redirecionar para página de reset de senha (futura)
          setTimeout(() => {
            setStatus('success');
            setMessage('✅ Autenticado com sucesso!');
            window.location.href = '/'; // Redireciona para home
          }, 2000);
        } else {
          // Magic Link ou outro tipo
          setMessage('Autenticando...');
          
          // Verificar sessão
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) throw error;
          
          if (session) {
            console.log('✅ Sessão ativa:', session.user.email);
            setStatus('success');
            setMessage(`✅ Bem-vindo, ${session.user.email}!`);
            
            // Redirecionar para a aplicação
            setTimeout(() => {
              window.location.href = '/';
            }, 2000);
          } else {
            throw new Error('Sessão não encontrada');
          }
        }
      } catch (error) {
        console.error('❌ Erro no callback:', error);
        setStatus('error');
        setMessage(`Erro: ${error.message}`);
        
        // Redirecionar para login após 3 segundos
        setTimeout(() => {
          window.location.href = '/';
        }, 3000);
      }
    };

    processAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md glass-effect p-8 rounded-2xl shadow-2xl shadow-yellow-500/10 text-center"
      >
        <div className="mb-6">
          {status === 'processing' && (
            <Loader2 className="w-16 h-16 text-yellow-500 animate-spin mx-auto mb-4" />
          )}
          {status === 'success' && (
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          )}
          {status === 'error' && (
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          )}
        </div>

        <h1 className="text-2xl font-bold gold-text mb-4">
          {status === 'processing' && 'Autenticando...'}
          {status === 'success' && 'Sucesso!'}
          {status === 'error' && 'Erro'}
        </h1>

        <p className="text-gray-400">{message}</p>

        {status === 'success' && (
          <p className="text-sm text-yellow-500 mt-4">
            Redirecionando em instantes...
          </p>
        )}

        {status === 'error' && (
          <p className="text-sm text-red-400 mt-4">
            Você será redirecionado para o login...
          </p>
        )}
      </motion.div>
    </div>
  );
};

export default AuthCallback;

