import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { motion } from 'framer-motion';
import { Mail, Send, CheckCircle } from 'lucide-react';
import React, { useState } from 'react';

const Login = ({ onLogin, onShowSetup }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSendMagicLink = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Enviar Magic Link via email
      const { data, error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        console.error('Erro ao enviar Magic Link:', error);
        toast({
          title: "❌ Erro ao enviar link",
          description: error.message || "Verifique se o email está correto.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Sucesso! Email enviado
      setEmailSent(true);
      toast({
        title: "✅ Link enviado!",
        description: `Verifique seu email (${email}) e clique no link para fazer login.`,
      });
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        title: "❌ Erro ao enviar link",
        description: "Ocorreu um erro. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md glass-effect p-10 rounded-3xl shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 gold-gradient opacity-50" />
        
        <div className="text-center mb-10">
          <div className="inline-flex p-4 rounded-2xl bg-yellow-500/10 mb-4 border border-yellow-500/20">
            <Mail className="w-10 h-10 text-yellow-500" />
          </div>
          <h1 className="text-4xl font-extrabold gold-text tracking-tighter">Login</h1>
          <p className="text-gray-500 mt-2 font-medium">
            {emailSent 
              ? 'Acesse sua conta através do seu email' 
              : 'Digite seu email para entrar no painel'}
          </p>
        </div>

        {!emailSent ? (
          <form onSubmit={handleSendMagicLink} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-500/50 ml-1">Endereço de E-mail</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-yellow-500 transition-colors w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@gmail.com"
                  className="w-full p-4 pl-12 bg-white/5 border border-white/10 rounded-2xl focus:border-yellow-500/50 focus:bg-white/10 focus:outline-none text-white transition-all font-medium"
                  required
                  disabled={loading}
                />
              </div>
            </div>
            <Button 
              type="submit" 
              variant="gold"
              className="w-full py-7 text-lg"
              disabled={loading || !email}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin mr-3" />
                  Enviando...
                </div>
              ) : (
                <div className="flex items-center">
                  <Send className="w-5 h-5 mr-2" />
                  Acessar Painel
                </div>
              )}
            </Button>
          </form>
        ) : (
          <div className="space-y-8 animate-fade-in">
            <div className="bg-green-500/5 border border-green-500/20 rounded-3xl p-8 text-center">
              <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-green-500/20">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-xl font-extrabold text-white mb-2">
                Link Enviado!
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Enviamos um link de acesso seguro para seu email:<br/>
                <span className="text-yellow-500 font-bold mt-2 block">{email}</span>
              </p>
            </div>
            
            <div className="space-y-4">
              <p className="text-[10px] text-center text-gray-600 font-bold uppercase tracking-widest">
                Não recebeu? Verifique a pasta de spam
              </p>
              <Button 
                onClick={() => {
                  setEmailSent(false);
                  setEmail('');
                }}
                variant="secondary"
                className="w-full py-6"
              >
                Tentar outro e-mail
              </Button>
            </div>
          </div>
        )}
        
        {onShowSetup && (
          <div className="text-center mt-10">
            <button
              onClick={onShowSetup}
              className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-500/30 hover:text-yellow-500 transition-colors"
            >
              Configuração do Sistema
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Login;