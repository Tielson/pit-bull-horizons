import { motion } from 'framer-motion';
import {
  Briefcase,
  ChevronRight,
  DollarSign,
  LayoutDashboard,
  MessageCircle,
  Package,
  Receipt,
  Users
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

const Sidebar = ({ activeSection, setActiveSection, clients, resellers, panelLogo, panelTitle }) => {
  const [systemStatus, setSystemStatus] = useState({
    activeClients: 0,
    expiringToday: 0,
    activeResellers: 0,
  });
  
  const getBrasiliaDate = () => {
    const now = new Date();
    const brasiliaDate = new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
    return brasiliaDate;
  };
  
  const getTodayBrasilia = () => {
    const today = getBrasiliaDate();
    today.setHours(0, 0, 0, 0);
    return today;
  };

  const parseDateToBrasilia = (dateString) => {
    if (!dateString) return null;
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
     if (isNaN(date.getTime())) return null;
    return date;
  };

  useEffect(() => {
    const activeClientsCount = clients.filter(c => c.status === 'active').length;
    const activeResellersCount = resellers.filter(r => r.status === 'active').length;
    
    const today = getTodayBrasilia();

    const expiringTodayCount = [...clients, ...resellers].filter(item => {
      if (!item.expiryDate || item.status !== 'active') return false;
      
      const expiryDate = parseDateToBrasilia(item.expiryDate);
      if (!expiryDate) return false;

      return expiryDate.getTime() === today.getTime();
    }).length;

    setSystemStatus({
      activeClients: activeClientsCount,
      expiringToday: expiringTodayCount,
      activeResellers: activeResellersCount,
    });
  }, [clients, resellers]);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'clients', label: 'Clientes', icon: Users },
    { id: 'resellers', label: 'Revendedores', icon: Briefcase },
    { id: 'plans', label: 'Planos', icon: Package },
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
    { id: 'receipts', label: 'Comprovantes', icon: Receipt },
    { id: 'pix', label: 'Gerenciar PIX', icon: DollarSign },
    // { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  return (
    <motion.aside 
      className="fixed left-0 top-0 h-full w-64 glass-effect border-r border-yellow-500/10 p-4 flex flex-col z-50 shadow-[4px_0_24px_rgba(0,0,0,0.5)]"
      initial={{ x: -250, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <div className="flex flex-col items-center pt-6 pb-6 mb-6">
        <motion.div 
          className="relative group"
          whileHover={{ scale: 1.05 }}
        >
          {panelLogo ? (
            <img src={panelLogo} alt="Logo" className="h-20 w-20 object-contain rounded-2xl shadow-xl border border-yellow-500/20" />
          ) : (
            <div className="h-20 w-20 bg-gradient-to-br from-yellow-500/20 to-transparent rounded-2xl flex items-center justify-center border border-yellow-500/30">
              <Briefcase className="h-10 w-10 text-yellow-500 drop-shadow-glow" />
            </div>
          )}
          <div className="absolute -bottom-2 -right-2 bg-yellow-500 text-black text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg uppercase">PRO</div>
        </motion.div>
      </div>

      <nav className="flex-grow space-y-1.5 overflow-y-auto scrollbar-gold pr-1">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <motion.button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                isActive 
                  ? 'text-black font-bold' 
                  : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-500/5'
              }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              {isActive && (
                <motion.div 
                  layoutId="activeNav"
                  className="absolute inset-0 gold-gradient z-0"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              
              <div className="flex items-center space-x-3 relative z-10">
                <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                <span className="text-sm tracking-tight">{item.label}</span>
              </div>
              
              {!isActive && (
                <ChevronRight 
                  className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 relative z-10" 
                />
              )}
            </motion.button>
          );
        })}
      </nav>
      
      <motion.div 
        className="mt-6 p-5 rounded-2xl bg-[#0f0f0f] border border-yellow-500/10 shadow-inner relative overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/5 rounded-full blur-3xl -mr-12 -mt-12" />
        
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-500/50 mb-4">Resumo Geral</h3>
        <div className="space-y-3 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
              <span className="text-xs text-gray-400">Clientes</span>
            </div>
            <span className="text-sm font-bold text-white">{systemStatus.activeClients}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
              <span className="text-xs text-gray-400">Revendas</span>
            </div>
            <span className="text-sm font-bold text-white">{systemStatus.activeResellers}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]" />
              <span className="text-xs text-gray-400">Vencendo</span>
            </div>
            <span className="text-sm font-bold text-yellow-500">{systemStatus.expiringToday}</span>
          </div>
        </div>
      </motion.div>
    </motion.aside>
  );
};

export default Sidebar;