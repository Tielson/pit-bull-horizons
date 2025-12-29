import { Button } from '@/components/ui/button';
import { createInitialUser } from '@/utils/createInitialUser';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, UserPlus } from 'lucide-react';
import React, { useState } from 'react';

const SetupPage = ({ onComplete }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleCreateUser = async () => {
    setLoading(true);
    setResult(null);
    
    const response = await createInitialUser();
    setResult(response);
    setLoading(false);

    if (response.success) {
      setTimeout(() => {
        onComplete();
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md glass-effect p-8 rounded-2xl shadow-2xl shadow-yellow-500/10"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold gold-text mb-2">Configuração Inicial</h1>
          <p className="text-gray-400">
            Clique no botão abaixo para criar o usuário inicial
          </p>
        </div>

        <div className="space-y-6">
          {!result && (
            <Button
              onClick={handleCreateUser}
              disabled={loading}
              className="w-full gold-gradient text-black hover:opacity-90 text-lg py-6"
            >
              <UserPlus className="w-5 h-5 mr-2" />
              {loading ? 'Criando usuário...' : 'Criar Usuário Inicial'}
            </Button>
          )}

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-lg border ${
                result.success
                  ? 'bg-green-900/20 border-green-500/30'
                  : 'bg-red-900/20 border-red-500/30'
              }`}
            >
              {result.success ? (
                <>
                  <div className="flex items-center gap-2 text-green-400 font-semibold mb-2">
                    <CheckCircle className="w-5 h-5" />
                    Usuário Criado com Sucesso!
                  </div>
                  <div className="text-sm text-gray-300 space-y-1">
                    <p>📧 Email: filipe_thielsom@hotmail.com</p>
                    <p>👤 Usuário: filipe_thielsom</p>
                    <p>🔑 Senha: 123456</p>
                    <p className="text-green-400 mt-3">
                      Redirecionando para o login...
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-red-400 font-semibold mb-2">
                    <AlertCircle className="w-5 h-5" />
                    Erro ao Criar Usuário
                  </div>
                  <div className="text-sm text-gray-300">
                    <p>{result.error}</p>
                    {result.error?.includes('Email rate limit exceeded') && (
                      <p className="text-yellow-400 mt-2">
                        ⚠️ Aguarde alguns minutos e tente novamente
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={handleCreateUser}
                    className="w-full mt-4 bg-red-500 hover:bg-red-600 text-white"
                  >
                    Tentar Novamente
                  </Button>
                </>
              )}
            </motion.div>
          )}

          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 text-sm text-blue-300">
            <p className="font-semibold mb-2">ℹ️ Informação:</p>
            <p>
              Este usuário será criado automaticamente no Supabase.
              Após a criação, você poderá fazer login normalmente.
            </p>
          </div>

          <div className="text-center">
            <button
              onClick={onComplete}
              className="text-sm text-gray-400 hover:text-yellow-500 underline"
            >
              Pular (usuário já existe)
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SetupPage;

