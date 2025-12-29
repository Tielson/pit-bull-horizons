import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Briefcase,
  Calendar,
  CheckCircle,
  ChevronRight,
  Clock,
  History,
  MessageSquare,
  TrendingUp,
  UserPlus,
  Users
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis, YAxis
} from 'recharts';

const Dashboard = ({ setActiveSection, clients, plans, resellers }) => {
  const [stats, setStats] = useState({
    totalClients: 0,
    clientsExpiringToday: 0,
    totalResellers: 0,
    resellersExpiringToday: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [chartData, setChartData] = useState([]);

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
    const safeClients = Array.isArray(clients) ? clients : [];
    const safeResellers = Array.isArray(resellers) ? resellers : [];

    const activeClients = safeClients.filter(c => c.status === 'active');
    const totalClients = activeClients.length;
    const totalResellers = safeResellers.filter(r => r.status === 'active').length;

    const today = getTodayBrasilia();

    const clientsExpiringToday = safeClients.filter(c => {
      if (!c.expiryDate || c.status !== 'active') return false;
      const expiry = parseDateToBrasilia(c.expiryDate);
      return expiry && expiry.getTime() === today.getTime();
    }).length;

    const resellersExpiringToday = safeResellers.filter(r => {
      if (!r.expiryDate || r.status !== 'active') return false;
      const expiry = parseDateToBrasilia(r.expiryDate);
      return expiry && expiry.getTime() === today.getTime();
    }).length;

    setStats(prev => ({ 
      ...prev, 
      totalClients, 
      clientsExpiringToday, 
      totalResellers, 
      resellersExpiringToday 
    }));

    const fiveDaysFromNow = new Date(today);
    fiveDaysFromNow.setDate(today.getDate() + 5);

    const expiringSoon = [...safeClients, ...safeResellers]
      .filter(c => {
        if (c.status !== 'active' || !c.expiryDate) return false;
        const expiryDate = parseDateToBrasilia(c.expiryDate);
        return expiryDate && expiryDate > today && expiryDate <= fiveDaysFromNow;
      })
      .map(c => {
        const expiryDate = parseDateToBrasilia(c.expiryDate);
        const daysDiff = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return {
          type: 'expiring',
          client: c.name,
          action: `${safeClients.some(client => client.id === c.id) ? 'Cliente' : 'Revenda'} vence em ${daysDiff} ${daysDiff > 1 ? 'dias' : 'dia'}`,
          time: expiryDate,
          status: 'warning'
        };
      });

    const newAdditions = [...safeClients, ...safeResellers]
      .filter(c => {
        const createdAt = parseDateToBrasilia(c.createdAt);
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);
        return createdAt && createdAt >= sevenDaysAgo;
      })
      .map(c => ({
        type: 'new',
        client: c.name,
        action: `Novo ${safeClients.some(client => client.id === c.id) ? 'cliente' : 'revendedor'} adicionado`,
        time: parseDateToBrasilia(c.createdAt),
        status: 'success'
      }));

    const allActivities = [...expiringSoon, ...newAdditions];
    allActivities.sort((a, b) => b.time - a.time);
    setRecentActivities(allActivities.slice(0, 5));

    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateString = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'America/Sao_Paulo' });
      
      const newClientsOnDay = (Array.isArray(clients) ? clients : []).filter(c => {
        const createdAt = parseDateToBrasilia(c.createdAt);
        return createdAt && createdAt.getTime() === date.getTime();
      }).length;

      data.push({ name: dateString, 'Novos Clientes': newClientsOnDay });
    }
    setChartData(data);

  }, [clients, plans, resellers]);

  const statCards = [{
    title: 'Clientes Ativos',
    value: stats.totalClients,
    icon: Users,
    color: 'from-blue-500/20 to-blue-600/5',
    iconColor: 'text-blue-500',
    borderColor: 'border-blue-500/20'
  }, {
    title: 'Vence Hoje (Clientes)',
    value: stats.clientsExpiringToday,
    icon: Calendar,
    color: 'from-yellow-500/20 to-yellow-600/5',
    iconColor: 'text-yellow-500',
    borderColor: 'border-yellow-500/20'
  }, {
    title: 'Revendedores Ativos',
    value: stats.totalResellers,
    icon: Briefcase,
    color: 'from-purple-500/20 to-purple-600/5',
    iconColor: 'text-purple-500',
    borderColor: 'border-purple-500/20'
  }, {
    title: 'Vence Hoje (Revendas)',
    value: stats.resellersExpiringToday,
    icon: Calendar,
    color: 'from-orange-500/20 to-orange-600/5',
    iconColor: 'text-orange-500',
    borderColor: 'border-orange-500/20'
  }];

  const timeSince = (date) => {
    if (!date) return '';
    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " anos atrás";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " meses atrás";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " dias atrás";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " horas atrás";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutos atrás";
    return Math.floor(seconds) + " segundos atrás";
  };

  const getActivityIcon = type => {
    switch (type) {
      case 'renewal': return CheckCircle;
      case 'expiring': return AlertTriangle;
      case 'message': return MessageSquare;
      case 'new': return UserPlus;
      default: return Clock;
    }
  };

  const getStatusColor = status => {
    switch (status) {
      case 'success': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'info': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  const handleQuickAction = section => {
    setActiveSection(section);
  };

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-10">
      <motion.div 
        initial={{ opacity: 0, y: -10 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.6 }}
        className="flex items-end justify-between"
      >
        <div>
          <h2 className="text-4xl font-extrabold gold-text tracking-tighter mb-1">Dashboard</h2>
          <p className="text-gray-500 text-sm font-medium">Bem-vindo ao seu painel de controle, aqui está o que está acontecendo hoje.</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div 
              key={stat.title} 
              className={`glass-effect p-6 rounded-2xl border-l-4 ${stat.borderColor} relative overflow-hidden group cursor-default`}
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">{stat.title}</p>
                  <h3 className="text-4xl font-black text-white tracking-tighter">{stat.value}</h3>
                </div>
                <div className={`p-4 rounded-2xl bg-gradient-to-br ${stat.color} ${stat.iconColor} transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                  <Icon className="w-7 h-7" />
                </div>
              </div>
              <div className={`absolute -right-4 -bottom-4 w-24 h-24 bg-gradient-to-br ${stat.color} blur-3xl opacity-20 group-hover:opacity-40 transition-opacity`} />
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div className="lg:col-span-2 glass-effect p-8 rounded-3xl" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}>
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-yellow-500" />
              Novos Clientes <span className="text-gray-500 text-sm font-normal ml-2">(Últimos 7 dias)</span>
            </h3>
          </div>
          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer>
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.05)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'rgba(255, 255, 255, 0.4)', fontSize: 12, fontWeight: 600 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'rgba(255, 255, 255, 0.4)', fontSize: 12, fontWeight: 600 }}
                  allowDecimals={false}
                />
                <Tooltip 
                  cursor={{ stroke: 'rgba(212, 175, 55, 0.2)', strokeWidth: 2 }}
                  contentStyle={{ 
                    backgroundColor: 'rgba(10, 10, 10, 0.95)', 
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                    padding: '12px'
                  }}
                  itemStyle={{ color: '#D4AF37', fontWeight: 700 }}
                  labelStyle={{ color: '#888', marginBottom: '4px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="Novos Clientes" 
                  stroke="#D4AF37" 
                  strokeWidth={4} 
                  dot={{ r: 4, fill: '#D4AF37', strokeWidth: 2, stroke: '#000' }}
                  activeDot={{ r: 8, fill: '#FFD700', strokeWidth: 0 }} 
                  animationDuration={2000}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div className="space-y-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.6 }}>
          <div 
            onClick={() => handleQuickAction('clients')} 
            className="group glass-effect p-6 rounded-3xl glass-effect-hover cursor-pointer flex items-center space-x-5 relative overflow-hidden"
          >
            <div className="p-4 rounded-2xl bg-blue-500/10 text-blue-500 group-hover:scale-110 transition-transform duration-500">
              <UserPlus className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">Novo Cliente</h4>
              <p className="text-gray-500 text-xs font-medium">Cadastrar agora</p>
            </div>
            <div className="absolute right-6 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-500">
              <ChevronRight className="w-5 h-5 text-blue-500" />
            </div>
          </div>
          
          <div 
            onClick={() => handleQuickAction('resellers')} 
            className="group glass-effect p-6 rounded-3xl glass-effect-hover cursor-pointer flex items-center space-x-5 relative overflow-hidden"
          >
            <div className="p-4 rounded-2xl bg-purple-500/10 text-purple-500 group-hover:scale-110 transition-transform duration-500">
              <Briefcase className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors">Nova Revenda</h4>
              <p className="text-gray-500 text-xs font-medium">Cadastrar agora</p>
            </div>
            <div className="absolute right-6 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-500">
              <ChevronRight className="w-5 h-5 text-purple-500" />
            </div>
          </div>

          <motion.div 
            className="glass-effect p-6 rounded-3xl border-dashed border-yellow-500/30"
            whileHover={{ borderColor: 'rgba(212, 175, 55, 0.6)' }}
          >
            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Meta Mensal</h4>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '65%' }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="h-full gold-gradient"
              />
            </div>
            <div className="mt-2 flex justify-between items-center">
              <span className="text-[10px] text-gray-500 font-bold">65% ATINGIDO</span>
              <span className="text-[10px] text-yellow-500 font-bold">META: 100</span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <motion.div className="glass-effect p-8 rounded-3xl" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }}>
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-yellow-500" />
            Atividades Recentes
          </h3>
          <button className="text-xs font-bold text-yellow-500 hover:text-yellow-400 transition-colors uppercase tracking-widest">Ver tudo</button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recentActivities.length > 0 ? recentActivities.map((activity, index) => {
            const Icon = getActivityIcon(activity.type);
            return (
              <motion.div 
                key={index} 
                className="flex items-center space-x-4 p-4 rounded-2xl bg-white/5 border border-transparent hover:border-yellow-500/10 hover:bg-white/10 transition-all group" 
                initial={{ opacity: 0, x: -20 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <div className={`p-3 rounded-xl bg-gray-900 ${getStatusColor(activity.status)} group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-bold text-sm tracking-tight">{activity.client}</p>
                  <p className="text-gray-500 text-xs font-medium uppercase tracking-tighter">{activity.action}</p>
                </div>
                <div className="text-right">
                  <span className="text-gray-600 text-[10px] font-bold block">{timeSince(activity.time)}</span>
                </div>
              </motion.div>
            );
          }) : (
            <div className="col-span-full text-center py-12 bg-white/5 rounded-3xl border border-dashed border-white/10">
              <Clock className="w-10 h-10 mx-auto mb-3 text-gray-700"/>
              <p className="text-gray-500 font-medium">Nenhuma atividade recente para exibir.</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
