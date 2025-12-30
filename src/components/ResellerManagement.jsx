import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Trash2, Smartphone, User, Save, X, Users, UserX, UserCheck, Briefcase, Coins, RefreshCw, Receipt, History, Eye, ChevronsUpDown, FlaskConical, Clock, AlertTriangle, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { WhatsAppIcon } from '@/components/ui/icons';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { resellersService } from '@/services/resellersService';
import { getBrasiliaDate, getTodayBrasiliaISO } from '@/utils/dataMapper';

const ResellerManagement = ({
  setActiveSection,
  resellers,
  saveResellers,
  plans,
  receipts,
  saveReceipts,
  onResellerCreated // Callback para recarregar dados após criar/editar/deletar
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false); // Prevenir duplicação
  const [editing, setEditing] = useState(null);
  const [viewingReseller, setViewingReseller] = useState(null);
  const [view, setView] = useState('active'); // 'active', 'inactive', 'test', 'pending', 'expiring_5', 'expiring_2', 'expiring_today'
  const [viewingReceiptsFor, setViewingReceiptsFor] = useState(null);
  const [newReseller, setNewReseller] = useState({
    name: '',
    phone: '',
    credits: 0,
    plan: '',
    expiryDate: '',
    expiryTime: '',
    extraInfo: '',
    status: 'active',
    createdAt: getTodayBrasiliaISO()
  });
  
  const getTodayBrasilia = () => {
    const today = getBrasiliaDate();
    today.setHours(0, 0, 0, 0);
    return today;
  };

  const parseDateToBrasilia = (dateString) => {
    if (!dateString) return null;
    if (typeof dateString !== 'string') return dateString;
    const str = dateString.includes('T') ? dateString.split('T')[0] : dateString;
    const [year, month, day] = str.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    if (isNaN(date.getTime())) return null;
    return date;
  };

  const formatDateForDisplay = dateString => {
    if (!dateString) return 'N/A';
    const date = parseDateToBrasilia(dateString);
    if (!date) return 'N/A';
    return date.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  };
    
  useEffect(() => {
    const viewReceiptsClient = localStorage.getItem('view_receipts_client');
    if (viewReceiptsClient) {
      const client = JSON.parse(viewReceiptsClient);
      const uniqueId = `${client.credits !== undefined ? 'reseller' : 'client'}-${client.id}`;
      setViewingReceiptsFor({ id: uniqueId, name: client.name });
      localStorage.removeItem('view_receipts_client');
    }
  }, []);

  const handleAddReseller = async () => {
    // Prevenir duplicação (React StrictMode executa 2x em desenvolvimento)
    if (isSaving) {
      console.log('⏸️ Salvamento já em andamento, ignorando...');
      return;
    }

    if (!newReseller.name || !newReseller.phone) {
      toast({
        title: "❌ Erro",
        description: "Nome e telefone são obrigatórios!",
        variant: "destructive"
      });
      return;
    }
    
    setIsSaving(true); // Bloquear novas chamadas
    
    try {
      let resellerToAdd = {
        ...newReseller
      };
      const today = getTodayBrasilia();
      if (resellerToAdd.status === 'expiring_today') {
        resellerToAdd.expiryDate = today.toISOString().split('T')[0];
        resellerToAdd.status = 'active';
      } else if (resellerToAdd.status === 'expiring_2') {
        const twoDaysFromNow = new Date(today);
        twoDaysFromNow.setDate(today.getDate() + 2);
        resellerToAdd.expiryDate = twoDaysFromNow.toISOString().split('T')[0];
        resellerToAdd.status = 'active';
      } else if (resellerToAdd.status === 'expiring_5') {
        const fiveDaysFromNow = new Date(today);
        fiveDaysFromNow.setDate(today.getDate() + 5);
        resellerToAdd.expiryDate = fiveDaysFromNow.toISOString().split('T')[0];
        resellerToAdd.status = 'active';
      }

      // Salvar no Supabase (o serviço já faz a conversão)
      const createdReseller = await resellersService.create(resellerToAdd);
      
      // Limpar formulário primeiro
      setNewReseller({
        name: '',
        phone: '',
        credits: 0,
        plan: '',
        expiryDate: '',
        expiryTime: '',
        extraInfo: '',
        status: 'active',
        createdAt: getTodayBrasiliaISO()
      });
      setIsAdding(false);
      
      toast({
        title: "✅ Sucesso!",
        description: "Revendedor adicionado e salvo no banco de dados!"
      });
      
      // Recarregar dados do Supabase para garantir sincronização
      setTimeout(async () => {
        if (onResellerCreated) {
          await onResellerCreated();
        }
        setIsSaving(false); // Liberar bloqueio após recarregar
      }, 500);
    } catch (error) {
      console.error('Erro ao criar revendedor:', error);
      setIsSaving(false); // Liberar bloqueio em caso de erro
      toast({
        title: "❌ Erro ao salvar",
        description: error.message || "Não foi possível salvar o revendedor no banco de dados.",
        variant: "destructive"
      });
    }
  };

  const handleEditReseller = reseller => {
    setEditing({
      ...reseller,
      createdAt: reseller.createdAt ? reseller.createdAt.split('T')[0] : ''
    });
  };

  const handleSaveEdit = async () => {
    try {
      // Atualizar no Supabase (o serviço já faz a conversão)
      const updatedReseller = await resellersService.update(editing.id, editing);
      
      setEditing(null);
      toast({
        title: "✅ Sucesso!",
        description: "Revendedor atualizado e salvo no banco de dados!"
      });
      
      // Recarregar dados do Supabase
      setTimeout(async () => {
        if (onResellerCreated) {
          await onResellerCreated();
        }
      }, 500);
    } catch (error) {
      console.error('Erro ao atualizar revendedor:', error);
      toast({
        title: "❌ Erro ao salvar",
        description: error.message || "Não foi possível atualizar o revendedor no banco de dados.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteReseller = async (resellerId) => {
    try {
      // Deletar no Supabase
      await resellersService.delete(resellerId);
      
      toast({
        title: "✅ Sucesso!",
        description: "Revendedor removido com sucesso!"
      });
      
      // Recarregar dados do Supabase
      setTimeout(async () => {
        if (onResellerCreated) {
          await onResellerCreated();
        }
      }, 500);
    } catch (error) {
      console.error('Erro ao deletar revendedor:', error);
      toast({
        title: "❌ Erro ao deletar",
        description: error.message || "Não foi possível deletar o revendedor.",
        variant: "destructive"
      });
    }
  };

  const handleWhatsAppMessage = reseller => {
    localStorage.setItem('whatsapp_target_client', JSON.stringify(reseller));
    setActiveSection('whatsapp');
  };

  const handleGenerateReceipt = reseller => {
    localStorage.setItem('receipt_target_client', JSON.stringify(reseller));
    setActiveSection('receipts');
  };

  const handleRenewReseller = reseller => {
    const plan = plans.find(p => p.name === reseller.plan);
    if (!plan) {
      toast({
        title: "❌ Erro de Renovação",
        description: `Plano "${reseller.plan}" não encontrado.`,
        variant: "destructive"
      });
      return;
    }
    const duration = parseInt(plan.duration) || 30;
    const monthsToAdd = Math.floor(duration / 30);
    const today = getTodayBrasilia();
    const currentExpiry = reseller.expiryDate ? parseDateToBrasilia(reseller.expiryDate) : today;
    const baseDate = currentExpiry > today ? currentExpiry : today;
    const newExpiryDate = new Date(baseDate);
    newExpiryDate.setMonth(newExpiryDate.getMonth() + monthsToAdd);
    const updatedReseller = {
      ...reseller,
      expiryDate: newExpiryDate.toISOString().split('T')[0],
      status: 'active'
    };
    const safeResellers = Array.isArray(resellers) ? resellers : [];
    const updatedResellers = safeResellers.map(r => r.id === reseller.id ? updatedReseller : r);
    saveResellers(updatedResellers);
    toast({
      title: "🎉 Revendedor Renovado!",
      description: `${reseller.name} foi renovado. Novo vencimento: ${newExpiryDate.toLocaleDateString('pt-BR', {
        timeZone: 'America/Sao_Paulo'
      })}.`
    });
  };

  const handleDeleteReceipt = async receiptId => {
    try {
      await receiptsService.delete(receiptId);
      const updatedReceipts = (Array.isArray(receipts) ? receipts : []).filter(r => r.id !== receiptId);
      saveReceipts(updatedReceipts);
      toast({
        title: "🗑️ Comprovante Excluído",
        description: "O comprovante foi removido do banco de dados."
      });
    } catch (error) {
      console.error('Erro ao deletar comprovante:', error);
      toast({
        title: "❌ Erro ao excluir",
        description: "Não foi possível excluir o comprovante.",
        variant: "destructive"
      });
    }
  };

  const getFilteredResellers = () => {
    return resellers.filter(r => {
      const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) || r.phone.includes(searchTerm);
       if (!matchesSearch) return false;

      const today = getTodayBrasilia();
      const expiry = r.expiryDate ? parseDateToBrasilia(r.expiryDate) : null;
      if (r.status !== 'active' || !expiry) {
         if (view === 'active' && r.status === 'active') return true;
         return r.status === view;
      }
      
      const diffTime = expiry.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      switch (view) {
        case 'active':
          return r.status === 'active';
        case 'expiring_5':
          return diffDays > 2 && diffDays <= 5;
        case 'expiring_2':
          return diffDays > 0 && diffDays <= 2;
        case 'expiring_today':
          return expiry.getTime() === today.getTime();
        case 'pending':
          return r.status === 'pending';
        case 'inactive':
          return r.status === 'inactive';
        case 'test':
          return r.status === 'test';
        default:
          return false;
      }
    });
  };
  const filteredResellers = getFilteredResellers();

  const getCount = (status) => {
    const today = getTodayBrasilia();
    return resellers.filter(r => {
      if (r.status !== 'active') {
        return status === r.status;
      }
      
      const expiry = r.expiryDate ? parseDateToBrasilia(r.expiryDate) : null;
      if (!expiry) return false;

      const diffTime = expiry.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      switch (status) {
        case 'active':
          return r.status === 'active';
        case 'expiring_5':
          return diffDays > 2 && diffDays <= 5;
        case 'expiring_2':
          return diffDays > 0 && diffDays <= 2;
        case 'expiring_today':
          return expiry.getTime() === today.getTime();
        case 'pending':
          return r.status === 'pending';
        case 'inactive':
          return r.status === 'inactive';
        case 'test':
          return r.status === 'test';
        default:
          return false;
      }
    }).length;
  };
  const activeCount = getCount('active');
  const inactiveCount = getCount('inactive');
  const testCount = getCount('test');
  const pendingCount = getCount('pending');
  const expiring5Count = getCount('expiring_5');
  const expiring2Count = getCount('expiring_2');
  const expiringTodayCount = getCount('expiring_today');

  const PlanCombobox = ({
    value,
    onChange
  }) => {
    const [open, setOpen] = useState(false);
    return <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between bg-black/50 border-yellow-500/30 text-white hover:bg-black/70 hover:text-white">
            {value ? plans.find(plan => plan.name === value)?.name : "Selecione um plano..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0 bg-black border-yellow-500/50 text-white">
          <Command>
            <CommandInput placeholder="Buscar plano..." className="h-9 text-white" />
            <CommandEmpty>Nenhum plano encontrado.</CommandEmpty>
            <CommandGroup>
              {(Array.isArray(plans) ? plans : []).map(plan => <CommandItem key={plan.id} value={plan.name} onSelect={() => {
              onChange(plan.name);
              setOpen(false);
            }} className="text-white hover:!bg-yellow-500/20">
                  {plan.name}
                </CommandItem>)}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>;
  };

  const getStatusColorClass = status => {
    switch (status) {
      case 'active':
        return 'border-green-500';
      case 'inactive':
        return 'border-red-500';
      case 'test':
        return 'border-blue-500';
      case 'pending':
        return 'border-yellow-500';
      default:
        return 'border-gray-500';
    }
  };

  const renderFormFields = (state, setState) => <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <input type="text" value={state.name} onChange={e => setState({
      ...state,
      name: e.target.value
    })} placeholder="Nome *" className="w-full p-3 bg-black/50 border border-yellow-500/30 rounded-lg focus:border-yellow-500 focus:outline-none text-white" />
      <input type="text" value={state.phone} onChange={e => setState({
      ...state,
      phone: e.target.value
    })} placeholder="Telefone *" className="w-full p-3 bg-black/50 border border-yellow-500/30 rounded-lg focus:border-yellow-500 focus:outline-none text-white" />
      <PlanCombobox value={state.plan} onChange={value => setState({
      ...state,
      plan: value
    })} />
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Créditos</label>
        <input type="number" min="0" value={state.credits} onChange={e => setState({
        ...state,
        credits: parseInt(e.target.value) || 0
      })} className="w-full p-3 bg-black/50 border border-yellow-500/30 rounded-lg focus:border-yellow-500 focus:outline-none text-white" />
      </div>
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-300 mb-1">Data de Entrada</label>
        <input type="date" value={state.createdAt} onChange={e => setState({
        ...state,
        createdAt: e.target.value
      })} className="w-full p-3 bg-black/50 border border-yellow-500/30 rounded-lg focus:border-yellow-500 focus:outline-none text-white" />
      </div>
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-300 mb-1">Data de Vencimento</label>
        <div className="flex gap-2">
          <input type="date" value={state.expiryDate} onChange={e => setState({
          ...state,
          expiryDate: e.target.value
        })} className="w-full p-3 bg-black/50 border border-yellow-500/30 rounded-lg focus:border-yellow-500 focus:outline-none text-white" />
          <input type="time" value={state.expiryTime} onChange={e => setState({
          ...state,
          expiryTime: e.target.value
        })} className="w-full p-3 bg-black/50 border border-yellow-500/30 rounded-lg focus:border-yellow-500 focus:outline-none text-white" />
        </div>
      </div>
      <select value={state.status} onChange={e => setState({
      ...state,
      status: e.target.value
    })} className="w-full p-3 bg-black/50 border border-yellow-500/30 rounded-lg focus:border-yellow-500 focus:outline-none text-white self-end">
        <option value="active">Ativo</option>
        <option value="inactive">Inativo</option>
        <option value="test">Teste</option>
        <option value="pending">Pendente</option>
        <option value="expiring_today">Vence Hoje</option>
        <option value="expiring_2">Vence em 2 Dias</option>
        <option value="expiring_5">Vence em 5 Dias</option>
      </select>
      <div className="md:col-span-2">
        <textarea value={state.extraInfo} onChange={e => setState({
        ...state,
        extraInfo: e.target.value
      })} placeholder="Informações Extras" className="w-full p-3 bg-black/50 border border-yellow-500/30 rounded-lg focus:border-yellow-500 focus:outline-none text-white" rows="3" />
      </div>
    </div>;

  if (viewingReceiptsFor) {
    const dashIndex = viewingReceiptsFor.id.indexOf('-');
    const type = viewingReceiptsFor.id.substring(0, dashIndex);
    const id = viewingReceiptsFor.id.substring(dashIndex + 1);
    
    console.log('🔍 Filtrando comprovantes para:', { type, id, totalReceipts: receipts?.length });
    
    const resellerReceipts = (Array.isArray(receipts) ? receipts : []).filter(r => {
      const match = r.clientId && id && r.clientId.toString() === id.toString() && r.clientType === type;
      if (match) console.log('✅ Comprovante encontrado:', r.id);
      return match;
    });

    return <motion.div initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }}>
        <div className="flex items-center mb-6">
          <Button onClick={() => setViewingReceiptsFor(null)} variant="outline" className="mr-4 border-yellow-500 text-yellow-500 hover:bg-yellow-500/10">
            &larr; Voltar
          </Button>
          <div>
            <h2 className="text-2xl font-bold gold-text">Comprovantes de {viewingReceiptsFor.name}</h2>
            <p className="text-gray-400">Histórico de todas as renovações.</p>
          </div>
        </div>
        {resellerReceipts.length > 0 ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resellerReceipts.map(receipt => <motion.div key={receipt.id} className="glass-effect p-4 rounded-lg group relative" initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }}>
                <img src={receipt.imageUrl} alt={`Comprovante de ${receipt.date}`} className="rounded-md w-full" />
                <p className="text-center text-white mt-2 font-semibold">Gerado em: {receipt.date}</p>
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Dialog>
                    <DialogTrigger asChild><Button variant="ghost" size="icon" className="text-white hover:bg-white/20"><Eye className="w-6 h-6" /></Button></DialogTrigger>
                    <DialogContent className="max-w-3xl bg-gray-900 border-yellow-500/50"><DialogHeader><DialogTitle className="text-white">Comprovante de {receipt.date}</DialogTitle></DialogHeader><img src={receipt.imageUrl} alt={`Comprovante de ${receipt.date}`} className="rounded-md w-full max-h-[80vh] object-contain" /></DialogContent>
                  </Dialog>
                  <AlertDialog>
                    <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-500/20"><Trash2 className="w-6 h-6" /></Button></AlertDialogTrigger>
                    <AlertDialogContent className="bg-gray-900 border-yellow-500/50 text-white"><AlertDialogHeader><AlertDialogTitle>Você tem certeza?</AlertDialogTitle><AlertDialogDescription className="text-gray-400">Esta ação não pode ser desfeita. Isso excluirá permanentemente o comprovante.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel className="border-gray-600 text-gray-300 hover:bg-gray-700">Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteReceipt(receipt.id)} className="bg-red-600 hover:bg-red-700 text-white">Excluir</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                  </AlertDialog>
                </div>
              </motion.div>)}
          </div> : <div className="text-center py-12"><Receipt className="w-16 h-16 text-gray-600 mx-auto mb-4" /><h3 className="text-xl font-semibold text-gray-400 mb-2">Nenhum comprovante encontrado</h3><p className="text-gray-500">Gere um novo comprovante para este revendedor.</p></div>}
      </motion.div>;
  }
  return <div className="space-y-6">
      <motion.div initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      duration: 0.6
    }} className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold gold-text mb-2">Gerenciador de Revendedores</h2>
          <p className="text-gray-400">Gerencie todos os seus Revendas da TV Digital.</p>
        </div>
        <Button onClick={() => setIsAdding(true)} className="gold-gradient text-black hover:opacity-90"><Plus className="w-4 h-4 mr-2" />Adicionar Revendedor</Button>
      </motion.div>

      <div className="flex flex-wrap gap-x-2 md:gap-x-4 border-b border-yellow-500/20">
        <button onClick={() => setView('active')} className={`py-2 px-3 text-sm font-medium transition-colors ${view === 'active' ? 'border-b-2 border-green-500 text-green-500' : 'text-gray-400 hover:text-white'}`}><UserCheck className="inline w-4 h-4 mr-1" />Ativos ({activeCount})</button>
        <button onClick={() => setView('inactive')} className={`py-2 px-3 text-sm font-medium transition-colors ${view === 'inactive' ? 'border-b-2 border-red-500 text-red-500' : 'text-gray-400 hover:text-white'}`}><UserX className="inline w-4 h-4 mr-1" />Inativos ({inactiveCount})</button>
        <button onClick={() => setView('pending')} className={`py-2 px-3 text-sm font-medium transition-colors ${view === 'pending' ? 'border-b-2 border-yellow-500 text-yellow-500' : 'text-gray-400 hover:text-white'}`}><Clock className="inline w-4 h-4 mr-1" />Pendente ({pendingCount})</button>
        <button onClick={() => setView('test')} className={`py-2 px-3 text-sm font-medium transition-colors ${view === 'test' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-400 hover:text-white'}`}><FlaskConical className="inline w-4 h-4 mr-1" />Teste ({testCount})</button>
        <button onClick={() => setView('expiring_5')} className={`py-2 px-3 text-sm font-medium transition-colors ${view === 'expiring_5' ? 'border-b-2 border-orange-500 text-orange-500' : 'text-gray-400 hover:text-white'}`}><AlertTriangle className="inline w-4 h-4 mr-1" />Vence em 5 dias ({expiring5Count})</button>
        <button onClick={() => setView('expiring_2')} className={`py-2 px-3 text-sm font-medium transition-colors ${view === 'expiring_2' ? 'border-b-2 border-red-600 text-red-600' : 'text-gray-400 hover:text-white'}`}><AlertTriangle className="inline w-4 h-4 mr-1" />Vence em 2 dias ({expiring2Count})</button>
        <button onClick={() => setView('expiring_today')} className={`py-2 px-3 text-sm font-medium transition-colors ${view === 'expiring_today' ? 'border-b-2 border-yellow-400 text-yellow-400' : 'text-gray-400 hover:text-white'}`}><Calendar className="inline w-4 h-4 mr-1" />Vence Hoje ({expiringTodayCount})</button>
      </div>

      <motion.div initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      duration: 0.6,
      delay: 0.1
    }} className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input type="text" placeholder="Buscar por nome ou telefone..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-black/50 border border-yellow-500/30 rounded-lg focus:border-yellow-500 focus:outline-none text-white" />
      </motion.div>

      {isAdding && <motion.div initial={{
      opacity: 0,
      scale: 0.95
    }} animate={{
      opacity: 1,
      scale: 1
    }} transition={{
      duration: 0.3
    }} className="glass-effect p-6 rounded-xl">
          <h3 className="text-xl font-semibold gold-text mb-4">Adicionar Novo Revendedor</h3>
          {renderFormFields(newReseller, setNewReseller)}
          <div className="flex space-x-3 mt-6">
            <Button 
              onClick={handleAddReseller} 
              disabled={isSaving}
              variant="gold"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Salvando...' : 'Salvar Revendedor'}
            </Button>
            <Button onClick={() => setIsAdding(false)} variant="outline" className="border-red-500 text-red-500 hover:bg-red-500/10"><X className="w-4 h-4 mr-2" />Cancelar</Button>
          </div>
        </motion.div>}

      <div className="grid gap-4">
        {filteredResellers.map((reseller, index) => <motion.div key={reseller.id} initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.4,
        delay: index * 0.05
      }} className={`glass-effect p-6 rounded-xl hover-gold border-l-4 ${getStatusColorClass(reseller.status)}`}>
            {editing && editing.id === reseller.id ? <div className="space-y-4">
                {renderFormFields(editing, setEditing)}
                <div className="flex space-x-3"><Button onClick={handleSaveEdit} className="gold-gradient text-black hover:opacity-90" size="sm"><Save className="w-4 h-4 mr-2" />Salvar</Button><Button onClick={() => setEditing(null)} variant="outline" className="border-red-500 text-red-500 hover:bg-red-500/10" size="sm"><X className="w-4 h-4 mr-2" />Cancelar</Button></div>
              </div> : <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center"><Briefcase className="w-6 h-6 text-black" /></div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">{reseller.name}</h3>
                      <div className="flex items-center space-x-2 text-gray-400"><Smartphone className="w-4 h-4" /><span>{reseller.phone}</span></div>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button onClick={() => handleWhatsAppMessage(reseller)} variant="ghost" className="text-green-500 hover:bg-green-500/10" size="icon" title="Enviar WhatsApp"><WhatsAppIcon className="w-5 h-5" /></Button>
                    <Button onClick={() => handleGenerateReceipt(reseller)} variant="ghost" className="text-cyan-500 hover:bg-cyan-500/10" size="icon" title="Gerar Comprovante"><Receipt className="w-4 h-4" /></Button>
                    <Button onClick={() => setViewingReceiptsFor({ id: `reseller-${reseller.id}`, name: reseller.name })} variant="ghost" className="text-purple-500 hover:bg-purple-500/10" size="icon" title="Histórico de Comprovantes"><History className="w-4 h-4" /></Button>
                    <Button onClick={() => setViewingReseller(reseller)} variant="ghost" className="text-indigo-500 hover:bg-indigo-500/10" size="icon" title="Visualizar Detalhes"><Eye className="w-4 h-4" /></Button>
                    <Button onClick={() => handleRenewReseller(reseller)} variant="ghost" className="text-blue-500 hover:bg-blue-500/10" size="icon" title="Renovar Revendedor"><RefreshCw className="w-4 h-4" /></Button>
                    <Button onClick={() => handleEditReseller(reseller)} variant="ghost" className="text-yellow-500 hover:bg-yellow-500/10" size="icon" title="Editar"><Edit className="w-4 h-4" /></Button>
                    <Button onClick={() => handleDeleteReseller(reseller.id)} variant="ghost" className="text-red-500 hover:bg-red-500/10" size="icon" title="Excluir"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                  <div><span className="text-gray-400">Plano:</span><p className="text-white font-medium">{reseller.plan || 'N/A'}</p></div>
                  <div className="flex items-center gap-2"><Coins className="w-4 h-4 text-yellow-400" /><span className="text-gray-400">Créditos:</span><p className="text-white font-medium">{reseller.credits}</p></div>
                  <div><span className="text-gray-400">Data de Entrada:</span><p className="text-white font-medium">{formatDateForDisplay(reseller.createdAt)}</p></div>
                  <div><span className="text-gray-400">Data de Vencimento:</span><p className={`font-medium ${reseller.status === 'inactive' ? 'text-red-500' : 'text-white'}`}>{formatDateForDisplay(reseller.expiryDate)}{reseller.expiryTime && ` às ${reseller.expiryTime}`}</p></div>
                </div>
                {reseller.extraInfo && <div className="mt-4"><span className="text-gray-400">Observações:</span><p className="text-white font-medium">{reseller.extraInfo}</p></div>}
              </div>}
          </motion.div>)}
      </div>

      {filteredResellers.length === 0 && <motion.div initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} transition={{
      duration: 0.6
    }} className="text-center py-12">
          <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">{searchTerm ? 'Nenhum revendedor encontrado' : `Nenhum revendedor nesta categoria`}</h3>
          <p className="text-gray-500">{searchTerm ? 'Tente buscar por outro termo' : 'Adicione ou altere revendedores para preencher esta categoria'}</p>
        </motion.div>}

      <Dialog open={!!viewingReseller} onOpenChange={() => setViewingReseller(null)}>
        <DialogContent className="bg-black/80 backdrop-blur-sm border-yellow-500/50 text-white max-w-lg">
          {viewingReseller && <>
              <DialogHeader>
                <DialogTitle className="gold-text text-2xl flex items-center gap-3"><Briefcase /> {viewingReseller.name}</DialogTitle>
                <DialogDescription className="text-gray-400">{viewingReseller.phone}</DialogDescription>
              </DialogHeader>
              <div className="mt-4 space-y-3 max-h-[60vh] overflow-y-auto pr-2 scrollbar-gold">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="glass-effect p-3 rounded-lg"><p className="text-gray-400">Status</p><p className={`font-semibold ${viewingReseller.status === 'active' ? 'text-green-400' : viewingReseller.status === 'test' ? 'text-blue-400' : viewingReseller.status === 'pending' ? 'text-yellow-400' : 'text-red-400'}`}>{viewingReseller.status}</p></div>
                  <div className="glass-effect p-3 rounded-lg"><p className="text-gray-400">Plano</p><p className="font-semibold">{viewingReseller.plan || 'N/A'}</p></div>
                  <div className="glass-effect p-3 rounded-lg"><p className="text-gray-400">Créditos</p><p className="font-semibold">{viewingReseller.credits}</p></div>
                  <div className="glass-effect p-3 rounded-lg"><p className="text-gray-400">Data de Entrada</p><p className="font-semibold">{formatDateForDisplay(viewingReseller.createdAt)}</p></div>
                  <div className="glass-effect p-3 rounded-lg md:col-span-2"><p className="text-gray-400">Vencimento</p><p className="font-semibold">{viewingReseller.expiryDate ? `${formatDateForDisplay(viewingReseller.expiryDate)} às ${viewingReseller.expiryTime || '00:00'}` : 'N/A'}</p></div>
                </div>
                {viewingReseller.extraInfo && <div>
                    <h4 className="font-semibold text-lg gold-text mb-2 mt-4">Informações Extras</h4>
                    <div className="glass-effect p-4 rounded-lg">
                      <p className="text-white whitespace-pre-wrap">{viewingReseller.extraInfo}</p>
                    </div>
                  </div>}
              </div>
            </>}
        </DialogContent>
      </Dialog>
    </div>;
};
export default ResellerManagement;