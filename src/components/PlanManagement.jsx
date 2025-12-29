import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Package,
  DollarSign,
  Calendar,
  Save,
  X,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { plansService } from '@/services/plansService';

const PlanManagement = ({ plans, savePlans, onPlanCreated }) => {
  const [isAddingPlan, setIsAddingPlan] = useState(false);
  const [isSaving, setIsSaving] = useState(false); // Prevenir duplicação
  const [editingPlan, setEditingPlan] = useState(null);
  const [newPlan, setNewPlan] = useState({
    name: '',
    price: '',
    duration: '',
    description: '',
    features: '',
    maxDevices: '',
    quality: '',
    channels: '',
    support: false
  });

  const handleAddPlan = async () => {
    // Prevenir duplicação (React StrictMode executa 2x em desenvolvimento)
    if (isSaving) {
      console.log('⏸️ Salvamento já em andamento, ignorando...');
      return;
    }

    if (!newPlan.name || !newPlan.price) {
      toast({
        title: "❌ Erro",
        description: "Nome e preço são obrigatórios!",
        variant: "destructive"
      });
      return;
    }
    
    setIsSaving(true); // Bloquear novas chamadas
    
    try {
      // Salvar no Supabase (o serviço já faz a conversão)
      const createdPlan = await plansService.create(newPlan);
      
      // Limpar formulário primeiro
      setNewPlan({
        name: '',
        price: '',
        duration: '',
        description: '',
        features: '',
        maxDevices: '',
        quality: '',
        channels: '',
        support: false
      });
      setIsAddingPlan(false);
      
      toast({
        title: "✅ Sucesso!",
        description: "Plano adicionado e salvo no banco de dados!"
      });
      
      // Recarregar dados do Supabase para garantir sincronização
      setTimeout(async () => {
        if (onPlanCreated) {
          await onPlanCreated();
        }
        setIsSaving(false); // Liberar bloqueio após recarregar
      }, 500);
    } catch (error) {
      console.error('Erro ao criar plano:', error);
      setIsSaving(false); // Liberar bloqueio em caso de erro
      toast({
        title: "❌ Erro ao salvar",
        description: error.message || "Não foi possível salvar o plano no banco de dados.",
        variant: "destructive"
      });
    }
  };

  const handleEditPlan = (plan) => {
    setEditingPlan({ ...plan });
  };

  const handleSaveEdit = async () => {
    try {
      // Atualizar no Supabase (o serviço já faz a conversão)
      const updatedPlan = await plansService.update(editingPlan.id, editingPlan);
      
      setEditingPlan(null);
      toast({
        title: "✅ Sucesso!",
        description: "Plano atualizado e salvo no banco de dados!"
      });
      
      // Recarregar dados do Supabase
      setTimeout(async () => {
        if (onPlanCreated) {
          await onPlanCreated();
        }
      }, 500);
    } catch (error) {
      console.error('Erro ao atualizar plano:', error);
      toast({
        title: "❌ Erro ao salvar",
        description: error.message || "Não foi possível atualizar o plano no banco de dados.",
        variant: "destructive"
      });
    }
  };

  const handleDeletePlan = async (planId) => {
    try {
      // Deletar no Supabase
      await plansService.delete(planId);
      
      toast({
        title: "✅ Sucesso!",
        description: "Plano removido com sucesso!"
      });
      
      // Recarregar dados do Supabase
      setTimeout(async () => {
        if (onPlanCreated) {
          await onPlanCreated();
        }
      }, 500);
    } catch (error) {
      console.error('Erro ao deletar plano:', error);
      toast({
        title: "❌ Erro ao deletar",
        description: error.message || "Não foi possível deletar o plano.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex justify-between items-center"
      >
        <div>
          <h2 className="text-3xl font-bold gold-text mb-2">Gerenciamento de Planos</h2>
          <p className="text-gray-400">Crie e gerencie os planos IPTV disponíveis</p>
        </div>
        <Button
          onClick={() => setIsAddingPlan(true)}
          className="gold-gradient text-black hover:opacity-90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Plano
        </Button>
      </motion.div>

      {isAddingPlan && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="glass-effect p-6 rounded-xl"
        >
          <h3 className="text-xl font-semibold gold-text mb-4">Adicionar Novo Plano</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Nome do Plano *</label>
              <input
                type="text"
                value={newPlan.name}
                onChange={(e) => setNewPlan({...newPlan, name: e.target.value})}
                className="w-full p-3 bg-black/50 border border-yellow-500/30 rounded-lg focus:border-yellow-500 focus:outline-none text-white"
                placeholder="Ex: Premium, Básico"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Preço (R$) *</label>
              <input
                type="number"
                step="0.01"
                value={newPlan.price}
                onChange={(e) => setNewPlan({...newPlan, price: e.target.value})}
                className="w-full p-3 bg-black/50 border border-yellow-500/30 rounded-lg focus:border-yellow-500 focus:outline-none text-white"
                placeholder="29.90"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Duração (dias)</label>
              <input
                type="number"
                value={newPlan.duration}
                onChange={(e) => setNewPlan({...newPlan, duration: e.target.value})}
                className="w-full p-3 bg-black/50 border border-yellow-500/30 rounded-lg focus:border-yellow-500 focus:outline-none text-white"
                placeholder="30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Máx. Dispositivos</label>
              <input
                type="text"
                value={newPlan.maxDevices}
                onChange={(e) => setNewPlan({...newPlan, maxDevices: e.target.value})}
                className="w-full p-3 bg-black/50 border border-yellow-500/30 rounded-lg focus:border-yellow-500 focus:outline-none text-white"
                placeholder="1, 3, Ilimitado"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Qualidade</label>
              <input
                type="text"
                value={newPlan.quality}
                onChange={(e) => setNewPlan({...newPlan, quality: e.target.value})}
                className="w-full p-3 bg-black/50 border border-yellow-500/30 rounded-lg focus:border-yellow-500 focus:outline-none text-white"
                placeholder="Ex: 4K de alta qualidade"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Canais</label>
              <input
                type="text"
                value={newPlan.channels}
                onChange={(e) => setNewPlan({...newPlan, channels: e.target.value})}
                className="w-full p-3 bg-black/50 border border-yellow-500/30 rounded-lg focus:border-yellow-500 focus:outline-none text-white"
                placeholder="500+"
              />
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium text-gray-300 mb-2">Descrição</label>
              <input
                type="text"
                value={newPlan.description}
                onChange={(e) => setNewPlan({...newPlan, description: e.target.value})}
                className="w-full p-3 bg-black/50 border border-yellow-500/30 rounded-lg focus:border-yellow-500 focus:outline-none text-white"
                placeholder="Descrição do plano"
              />
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium text-gray-300 mb-2">Recursos</label>
              <textarea
                value={newPlan.features}
                onChange={(e) => setNewPlan({...newPlan, features: e.target.value})}
                className="w-full p-3 bg-black/50 border border-yellow-500/30 rounded-lg focus:border-yellow-500 focus:outline-none text-white"
                placeholder="Liste os recursos inclusos no plano..."
                rows="3"
              />
            </div>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={newPlan.support}
                  onChange={(e) => setNewPlan({...newPlan, support: e.target.checked})}
                  className="w-4 h-4 text-yellow-500 bg-black border-yellow-500/30 rounded focus:ring-yellow-500"
                />
                <span className="text-gray-300">Suporte 24h</span>
              </label>
            </div>
          </div>
          <div className="flex space-x-3 mt-6">
            <Button
              onClick={handleAddPlan}
              disabled={isSaving}
              variant="gold"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Salvando...' : 'Salvar Plano'}
            </Button>
            <Button
              onClick={() => setIsAddingPlan(false)}
              variant="outline"
              className="border-red-500 text-red-500 hover:bg-red-500/10"
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(Array.isArray(plans) ? plans : []).map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="glass-effect p-6 rounded-xl hover-gold"
          >
            {editingPlan && editingPlan.id === plan.id ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Nome</label>
                  <input
                    type="text"
                    value={editingPlan.name}
                    onChange={(e) => setEditingPlan({...editingPlan, name: e.target.value})}
                    className="w-full p-2 bg-black/50 border border-yellow-500/30 rounded focus:border-yellow-500 focus:outline-none text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Preço</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingPlan.price}
                    onChange={(e) => setEditingPlan({...editingPlan, price: e.target.value})}
                    className="w-full p-2 bg-black/50 border border-yellow-500/30 rounded focus:border-yellow-500 focus:outline-none text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Duração (dias)</label>
                  <input
                    type="number"
                    value={editingPlan.duration}
                    onChange={(e) => setEditingPlan({...editingPlan, duration: e.target.value})}
                    className="w-full p-2 bg-black/50 border border-yellow-500/30 rounded focus:border-yellow-500 focus:outline-none text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Descrição</label>
                  <input
                    type="text"
                    value={editingPlan.description}
                    onChange={(e) => setEditingPlan({...editingPlan, description: e.target.value})}
                    className="w-full p-2 bg-black/50 border border-yellow-500/30 rounded focus:border-yellow-500 focus:outline-none text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Recursos</label>
                  <textarea
                    value={editingPlan.features}
                    onChange={(e) => setEditingPlan({...editingPlan, features: e.target.value})}
                    className="w-full p-2 bg-black/50 border border-yellow-500/30 rounded focus:border-yellow-500 focus:outline-none text-white"
                    rows="2"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Dispositivos</label>
                    <input
                      type="text"
                      value={editingPlan.maxDevices}
                      onChange={(e) => setEditingPlan({...editingPlan, maxDevices: e.target.value})}
                      className="w-full p-2 bg-black/50 border border-yellow-500/30 rounded focus:border-yellow-500 focus:outline-none text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Qualidade</label>
                    <input
                      type="text"
                      value={editingPlan.quality}
                      onChange={(e) => setEditingPlan({...editingPlan, quality: e.target.value})}
                      className="w-full p-2 bg-black/50 border border-yellow-500/30 rounded focus:border-yellow-500 focus:outline-none text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Canais</label>
                  <input
                    type="text"
                    value={editingPlan.channels}
                    onChange={(e) => setEditingPlan({...editingPlan, channels: e.target.value})}
                    className="w-full p-2 bg-black/50 border border-yellow-500/30 rounded focus:border-yellow-500 focus:outline-none text-white"
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={editingPlan.support}
                      onChange={(e) => setEditingPlan({...editingPlan, support: e.target.checked})}
                      className="w-4 h-4 text-yellow-500 bg-black border-yellow-500/30 rounded focus:ring-yellow-500"
                    />
                    <span className="text-gray-300 text-sm">Suporte 24h</span>
                  </label>
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={handleSaveEdit}
                    className="gold-gradient text-black hover:opacity-90 flex-1"
                    size="sm"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Salvar
                  </Button>
                  <Button
                    onClick={() => setEditingPlan(null)}
                    variant="outline"
                    className="border-red-500 text-red-500 hover:bg-red-500/10 flex-1"
                    size="sm"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                      <Package className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">{plan.name}</h3>
                      <p className="text-gray-400 text-sm">{plan.description}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleEditPlan(plan)}
                      variant="ghost"
                      className="text-yellow-500 hover:bg-yellow-500/10"
                      size="sm"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleDeletePlan(plan.id)}
                      variant="ghost"
                      className="text-red-500 hover:bg-red-500/10"
                      size="sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-green-500" />
                      <span className="text-gray-400">Preço:</span>
                    </div>
                    <span className="text-2xl font-bold gold-text">R$ {plan.price}</span>
                  </div>

                  {plan.duration && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        <span className="text-gray-400">Duração:</span>
                      </div>
                      <span className="text-white font-medium">{plan.duration} dias</span>
                    </div>
                  )}

                  {plan.maxDevices && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-purple-500" />
                        <span className="text-gray-400">Dispositivos:</span>
                      </div>
                      <span className="text-white font-medium">{plan.maxDevices}</span>
                    </div>
                  )}

                  {plan.quality && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Qualidade:</span>
                      <span className="text-white font-medium">{plan.quality}</span>
                    </div>
                  )}

                  {plan.channels && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Canais:</span>
                      <span className="text-white font-medium">{plan.channels}</span>
                    </div>
                  )}

                  {plan.features && (
                    <div className="mt-4">
                      <span className="text-gray-400 text-sm">Recursos:</span>
                      <p className="text-white text-sm mt-1">{plan.features}</p>
                    </div>
                  )}

                  <div className="flex space-x-4 mt-4">
                    {plan.support && (
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-blue-500 text-xs">Suporte 24h</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {plans.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center py-12"
        >
          <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">Nenhum plano cadastrado</h3>
          <p className="text-gray-500">Adicione seu primeiro plano para começar</p>
        </motion.div>
      )}
    </div>
  );
};

export default PlanManagement;