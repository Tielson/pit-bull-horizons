import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Edit3, Save, X, ImagePlus, Upload, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

const Header = ({ panelTitle, setPanelTitle, panelLogo, setPanelLogo, onLogout }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempTitle, setTempTitle] = useState(panelTitle);
  const [tempLogo, setTempLogo] = useState(panelLogo);
  const fileInputRef = useRef(null);

  const getBrasiliaDate = () => {
    const now = new Date();
    const brasiliaDate = new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
    return brasiliaDate;
  };

  const handleSave = () => {
    setPanelTitle(tempTitle);
    setPanelLogo(tempLogo);
    setIsEditing(false);
    toast({
      title: "✅ Sucesso!",
      description: "Título e logo do painel atualizados com sucesso!",
    });
  };

  const handleCancel = () => {
    setTempTitle(panelTitle);
    setTempLogo(panelLogo);
    setIsEditing(false);
  };

  const handleLogoUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // Limite de 2MB
        toast({
          title: "❌ Arquivo muito grande",
          description: "Por favor, selecione uma imagem com menos de 2MB.",
          variant: "destructive",
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempLogo(reader.result);
        toast({
          title: "🖼️ Imagem Carregada",
          description: "Pré-visualização da logo atualizada. Salve para aplicar.",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <motion.header 
      className="glass-effect border-b border-yellow-500/10 px-6 py-3 sticky top-0 z-40"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-center justify-between max-w-[1600px] mx-auto">
        <div className="flex items-center space-x-4">
          {isEditing ? (
            <div className="flex items-center space-x-4 bg-white/5 p-2 rounded-xl border border-yellow-500/20">
              <div className="flex flex-col">
                <Button onClick={handleLogoUploadClick} variant="ghost" size="sm" className="text-xs text-yellow-500 hover:bg-yellow-500/10 h-8">
                  <Upload className="w-3 h-3 mr-2" />
                  Logo
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/png, image/jpeg, image/gif, image/webp"
                />
              </div>
              <div className="h-8 w-[1px] bg-yellow-500/20"></div>
              <input
                type="text"
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                className="bg-transparent border-none focus:ring-0 text-xl font-bold gold-text min-w-[200px]"
                placeholder="Nome do Painel"
              />
              <div className="flex space-x-1">
                <Button
                  onClick={handleSave}
                  className="gold-gradient text-black h-8 w-8 p-0 rounded-lg"
                >
                  <Save className="w-4 h-4" />
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="ghost"
                  className="text-red-500 hover:bg-red-500/10 h-8 w-8 p-0 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center group cursor-pointer" onClick={() => setIsEditing(true)}>
              <h1 className="text-2xl font-extrabold gold-text tracking-tighter drop-shadow-sm">{panelTitle}</h1>
              <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Edit3 className="w-4 h-4 text-yellow-500/50" />
              </div>
            </div>
          )}
        </div>
        
        <motion.div 
          className="flex items-center space-x-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="text-xs font-medium text-gray-400 flex flex-col items-end text-right">
            <span className="capitalize">
              {getBrasiliaDate().toLocaleDateString('pt-BR', { weekday: 'long', timeZone: 'America/Sao_Paulo' })}
            </span>
            <span>
              {getBrasiliaDate().toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                timeZone: 'America/Sao_Paulo'
              })}
            </span>
          </div>
          
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-green-500">Sistema Online</span>
          </div>

          <Button onClick={onLogout} variant="ghost" size="sm" className="text-red-500 hover:bg-red-500/10 font-bold text-xs uppercase tracking-widest rounded-lg px-4 border border-transparent hover:border-red-500/20 transition-all">
            <LogOut className="w-3.5 h-3.5 mr-2" />
            Sair
          </Button>
        </motion.div>
      </div>
    </motion.header>
  );
};

export default Header;