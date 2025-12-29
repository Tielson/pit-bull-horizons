import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, Save, Eye, EyeOff, ShieldCheck as ShieldKey } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

const PasswordReset = ({ onResetSuccess }) => {
  const [securityKey, setSecurityKey] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const MASTER_KEY = 'Pitbulltv2025';

  const handleReset = () => {
    if (securityKey !== MASTER_KEY) {
      toast({
        title: "❌ Chave de Segurança Inválida",
        description: "A chave de segurança inserida está incorreta.",
        variant: "destructive",
      });
      return;
    }

    if (!newUsername || !newPassword) {
      toast({
        title: "❌ Campos obrigatórios",
        description: "Novo usuário e nova senha não podem estar em branco.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "❌ Senhas não conferem",
        description: "A nova senha e a confirmação devem ser iguais.",
        variant: "destructive",
      });
      return;
    }

    const credentials = {
      savedUsername: newUsername,
      savedPassword: newPassword,
    };
    localStorage.setItem('app_credentials', JSON.stringify(credentials));

    toast({
      title: "✅ Acesso Redefinido!",
      description: "Seu usuário e senha foram atualizados. Faça o login com as novas credenciais.",
    });
    
    onResetSuccess();
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
          <h1 className="text-4xl font-bold gold-text">Redefinir Acesso</h1>
          <p className="text-gray-400 mt-2">Insira a chave de segurança para criar um novo acesso.</p>
        </div>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Chave de Segurança</label>
            <div className="relative">
              <ShieldKey className="absolute left-3 top-1/2 -translate-y-1/2 text-yellow-500/70" />
              <input
                type="password"
                value={securityKey}
                onChange={(e) => setSecurityKey(e.target.value)}
                placeholder="Digite a chave de segurança"
                className="w-full p-3 pl-12 bg-black/50 border border-yellow-500/30 rounded-lg focus:border-yellow-500 focus:outline-none text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Novo Nome de Usuário</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-yellow-500/70" />
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Digite seu novo usuário"
                className="w-full p-3 pl-12 bg-black/50 border border-yellow-500/30 rounded-lg focus:border-yellow-500 focus:outline-none text-white"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Nova Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-yellow-500/70" />
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Digite sua nova senha"
                className="w-full p-3 pl-12 pr-12 bg-black/50 border border-yellow-500/30 rounded-lg focus:border-yellow-500 focus:outline-none text-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Confirmar Nova Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-yellow-500/70" />
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirme sua nova senha"
                className="w-full p-3 pl-12 pr-12 bg-black/50 border border-yellow-500/30 rounded-lg focus:border-yellow-500 focus:outline-none text-white"
              />
            </div>
          </div>

          <Button onClick={handleReset} className="w-full gold-gradient text-black hover:opacity-90 text-lg py-6 mt-4">
            <Save className="w-5 h-5 mr-2" />
            Redefinir e Salvar
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default PasswordReset;