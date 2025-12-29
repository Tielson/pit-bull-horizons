import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Users, TrendingUp, Calendar } from 'lucide-react';

const Reports = ({ clients, plans }) => {
  const [reportData, setReportData] = useState({
    totalRevenue: 0,
    newClients: 0,
    renewals: 0,
    revenueByPlan: [],
  });

  useEffect(() => {
    // Garantir que clients e plans sejam arrays
    const safeClients = Array.isArray(clients) ? clients : [];
    const safePlans = Array.isArray(plans) ? plans : [];

    // This is a simplified logic. In a real app, you'd filter by date ranges.
    const totalRevenue = safeClients.reduce((acc, client) => {
      const clientPlan = safePlans.find(p => p.name === client.plan);
      if (client.status === 'active' && clientPlan) {
        return acc + parseFloat(clientPlan.price);
      }
      return acc;
    }, 0);

    const newClients = safeClients.length; // Simplified
    const renewals = 0; // Placeholder for more complex logic

    const revenueByPlan = safePlans.map(plan => {
      const clientsOnPlan = safeClients.filter(c => c.plan === plan.name && c.status === 'active');
      const revenue = clientsOnPlan.reduce((acc, c) => acc + parseFloat(plan.price), 0);
      return { name: plan.name, revenue, count: clientsOnPlan.length };
    });

    setReportData({
      totalRevenue,
      newClients,
      renewals,
      revenueByPlan,
    });
  }, [clients, plans]);

  const statCards = [
    { title: 'Receita Total (Ativos)', value: `R$ ${reportData.totalRevenue.toFixed(2)}`, icon: DollarSign, color: 'from-green-500 to-green-600' },
    { title: 'Novos Clientes (Total)', value: reportData.newClients, icon: Users, color: 'from-blue-500 to-blue-600' },
    { title: 'Renovações (Total)', value: reportData.renewals, icon: TrendingUp, color: 'from-purple-500 to-purple-600' },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl font-bold gold-text mb-2">Relatórios</h2>
        <p className="text-gray-400">Análise de vendas e renovações.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              className="glass-effect p-6 rounded-xl hover-gold"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.color} inline-block mb-4`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
              <p className="text-gray-400 text-sm">{stat.title}</p>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        className="glass-effect p-6 rounded-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <h3 className="text-xl font-semibold gold-text mb-4">Receita por Plano (Clientes Ativos)</h3>
        <div className="space-y-4">
          {reportData.revenueByPlan.map((plan, index) => (
            <div key={index} className="p-4 bg-black/20 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-lg font-semibold text-white">{plan.name}</p>
                  <p className="text-sm text-gray-400">{plan.count} cliente(s)</p>
                </div>
                <p className="text-xl font-bold gold-text">R$ {plan.revenue.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Reports;