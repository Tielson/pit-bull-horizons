import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { WhatsAppIcon } from '@/components/ui/icons';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from '@/components/ui/use-toast';
import { clientsService } from '@/services/clientsService';
import { receiptsService } from '@/services/receiptsService';
import { getBrasiliaDate, getTodayBrasiliaISO } from '@/utils/dataMapper';
import { motion } from 'framer-motion';
import { AlertTriangle, Calendar, ChevronsUpDown, Clock, Edit, Eye, FlaskConical, History, Plus, Receipt, RefreshCw, Save, ScreenShare, Search, Server, Smartphone, Trash2, User, UserCheck, Users, UserX, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';

const ClientManagement = ({
  setActiveSection,
  clients,
  saveClients,
  plans,
  receipts,
  saveReceipts,
  onClientCreated
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [isSaving, setIsSaving] = useState(false); // Prevenir duplicação
  const [editingClient, setEditingClient] = useState(null);
  const [viewingClient, setViewingClient] = useState(null);
  const [view, setView] = useState('active'); // 'active', 'inactive', 'pending', 'test', 'expiring_5', 'expiring_2', 'expiring_today'
  const [viewingReceiptsFor, setViewingReceiptsFor] = useState(null);

  const [newClient, setNewClient] = useState({
    name: '',
    phone: '',
    plan: '',
    screens: 0,
    servers: 0,
    createdAt: getTodayBrasiliaISO(),
    expiryDate: '',
    expiryTime: '',
    credentials: [{
      login: '',
      password: '',
      appUsed: '',
      deviceUsed: '',
      appEntryDate: '',
      appExpiryDate: ''
    }],
    extraInfo: '',
    status: 'active'
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

  const handleDeleteReceipt = async receiptId => {
    try {
      await receiptsService.delete(receiptId);
      const updatedReceipts = receipts.filter(r => r.id !== receiptId);
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

  const handleAddCredential = (clientState, setClientState) => {
    setClientState({
      ...clientState,
      credentials: [...clientState.credentials, {
        login: '',
        password: '',
        appUsed: '',
        deviceUsed: '',
        appEntryDate: '',
        appExpiryDate: ''
      }]
    });
  };

  const handleRemoveCredential = (index, clientState, setClientState) => {
    const credentials = [...clientState.credentials];
    credentials.splice(index, 1);
    setClientState({
      ...clientState,
      credentials
    });
  };

  const handleCredentialChange = (index, field, value, clientState, setClientState) => {
    const credentials = [...clientState.credentials];
    credentials[index][field] = value;
    setClientState({
      ...clientState,
      credentials
    });
  };

  const handleAddClient = async () => {
    // Prevenir duplicação (React StrictMode executa 2x em desenvolvimento)
    if (isSaving) {
      console.log('⏸️ Salvamento já em andamento, ignorando...');
      return;
    }

    if (!newClient.name || !newClient.phone) {
      toast({
        title: "❌ Erro",
        description: "Nome e telefone são obrigatórios!",
        variant: "destructive"
      });
      return;
    }
    
    setIsSaving(true); // Bloquear novas chamadas
    
    try {
      let clientToAdd = {
        ...newClient
      };
      const today = getTodayBrasilia();
      if (clientToAdd.status === 'expiring_today') {
        clientToAdd.expiryDate = today.toISOString().split('T')[0];
        clientToAdd.status = 'active';
      } else if (clientToAdd.status === 'expiring_2') {
        const twoDaysFromNow = new Date(today);
        twoDaysFromNow.setDate(today.getDate() + 2);
        clientToAdd.expiryDate = twoDaysFromNow.toISOString().split('T')[0];
        clientToAdd.status = 'active';
      } else if (clientToAdd.status === 'expiring_5') {
        const fiveDaysFromNow = new Date(today);
        fiveDaysFromNow.setDate(today.getDate() + 5);
        clientToAdd.expiryDate = fiveDaysFromNow.toISOString().split('T')[0];
        clientToAdd.status = 'active';
      }

      // Salvar no Supabase (o serviço já faz a conversão)
      const createdClient = await clientsService.create(clientToAdd);
      
      // Limpar formulário primeiro
      setNewClient({
        name: '',
        phone: '',
        plan: '',
        screens: 0,
        servers: 0,
        createdAt: getTodayBrasiliaISO(),
        expiryDate: '',
        expiryTime: '',
        credentials: [{
          login: '',
          password: '',
          appUsed: '',
          deviceUsed: '',
          appEntryDate: '',
          appExpiryDate: ''
        }],
        extraInfo: '',
        status: 'active'
      });
      setIsAddingClient(false);
      
      toast({
        title: "✅ Sucesso!",
        description: "Cliente adicionado e salvo no banco de dados!"
      });
      
      // Recarregar dados do Supabase para garantir sincronização
      // Usar setTimeout para evitar chamadas duplicadas do React StrictMode
      setTimeout(async () => {
        if (onClientCreated) {
          await onClientCreated();
        }
        setIsSaving(false); // Liberar bloqueio após recarregar
      }, 500);
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      setIsSaving(false); // Liberar bloqueio em caso de erro
      toast({
        title: "❌ Erro ao salvar",
        description: error.message || "Não foi possível salvar o cliente no banco de dados.",
        variant: "destructive"
      });
    }
  };

  const handleEditClient = client => {
    setEditingClient({
      ...client,
      screens: client.screens || 0,
      servers: client.servers || 0,
      createdAt: client.createdAt ? client.createdAt.split('T')[0] : '',
      credentials: (client.credentials && Array.isArray(client.credentials)) ? client.credentials.map(cred => ({
        ...cred,
        appEntryDate: cred.appEntryDate || '',
        appExpiryDate: cred.appExpiryDate || '',
        deviceUsed: cred.deviceUsed || ''
      })) : [{
        login: '',
        password: '',
        appUsed: '',
        deviceUsed: '',
        appEntryDate: '',
        appExpiryDate: ''
      }]
    });
  };

  const handleSaveEdit = async () => {
    try {
      // Atualizar no Supabase (o serviço já faz a conversão)
      const updatedClient = await clientsService.update(editingClient.id, editingClient);
      
      // Atualizar estado local com o cliente atualizado
      const safeClients = Array.isArray(clients) ? clients : [];
      const updatedClients = safeClients.map(client => 
        client.id === editingClient.id ? updatedClient : client
      );
      saveClients(updatedClients);
      
      setEditingClient(null);
      toast({
        title: "✅ Sucesso!",
        description: "Cliente atualizado e salvo no banco de dados!"
      });
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      toast({
        title: "❌ Erro ao salvar",
        description: error.message || "Não foi possível atualizar o cliente no banco de dados.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteClient = async (clientId) => {
    try {
      // Deletar no Supabase
      await clientsService.delete(clientId);
      
      // Atualizar estado local
      const updatedClients = (Array.isArray(clients) ? clients : []).filter(client => client.id !== clientId);
      saveClients(updatedClients);
      
      toast({
        title: "✅ Sucesso!",
        description: "Cliente removido do banco de dados!"
      });
    } catch (error) {
      console.error('Erro ao deletar cliente:', error);
      toast({
        title: "❌ Erro ao deletar",
        description: error.message || "Não foi possível deletar o cliente do banco de dados.",
        variant: "destructive"
      });
    }
  };

  const handleWhatsAppMessage = client => {
    localStorage.setItem('whatsapp_target_client', JSON.stringify(client));
    setActiveSection('whatsapp');
  };

  const handleGenerateReceipt = client => {
    localStorage.setItem('receipt_target_client', JSON.stringify(client));
    setActiveSection('receipts');
  };

  const handleRenewClient = async client => {
    const plan = plans.find(p => p.name === client.plan);
    if (!plan) {
      toast({
        title: "❌ Erro de Renovação",
        description: `Plano "${client.plan}" não encontrado. Verifique o cadastro de planos.`,
        variant: "destructive"
      });
      return;
    }
    const duration = parseInt(plan.duration) || 30;
    const monthsToAdd = Math.floor(duration / 30);
    const today = getTodayBrasilia();
    const currentExpiry = client.expiryDate ? parseDateToBrasilia(client.expiryDate) : today;
    const baseDate = currentExpiry > today ? currentExpiry : today;
    const newExpiryDate = new Date(baseDate);
    newExpiryDate.setMonth(newExpiryDate.getMonth() + monthsToAdd);
    
    const updatedClientData = {
      ...client,
      expiryDate: newExpiryDate.toISOString().split('T')[0],
      status: 'active'
    };

    try {
      await clientsService.update(client.id, updatedClientData);
      
      const safeClients = Array.isArray(clients) ? clients : [];
      const updatedClients = safeClients.map(c => c.id === client.id ? updatedClientData : c);
      saveClients(updatedClients);
      
      toast({
        title: "🎉 Cliente Renovado!",
        description: `${client.name} foi renovado. Novo vencimento: ${newExpiryDate.toLocaleDateString('pt-BR', {
          timeZone: 'America/Sao_Paulo'
        })}.`
      });
    } catch (error) {
      console.error('Erro ao renovar cliente:', error);
      toast({
        title: "❌ Erro ao renovar",
        description: "Não foi possível salvar a renovação no banco de dados.",
        variant: "destructive"
      });
    }
  };
  
  const getFilteredClients = () => {
    const safeClients = Array.isArray(clients) ? clients : [];
    return safeClients.filter(c => {
      const matchesSearch = (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (c.phone || '').includes(searchTerm);
      if (!matchesSearch) return false;

      const today = getTodayBrasilia();

      // Verificar vencimento do App (qualquer uma das credenciais)
      const getAppExpiryInfo = () => {
        if (!c.credentials || !Array.isArray(c.credentials)) return null;
        let minDiff = Infinity;
        let found = false;
        c.credentials.forEach(cred => {
          const appExpiry = cred.appExpiryDate ? parseDateToBrasilia(cred.appExpiryDate) : null;
          if (appExpiry) {
            const diff = Math.ceil((appExpiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            if (diff < minDiff) minDiff = diff;
            found = true;
          }
        });
        return found ? minDiff : null;
      };

      if (view.startsWith('app_expiring_')) {
        const appDiffDays = getAppExpiryInfo();
        if (appDiffDays === null) return false;
        
        switch (view) {
          case 'app_expiring_5':
            return appDiffDays > 2 && appDiffDays <= 5;
          case 'app_expiring_2':
            return appDiffDays > 0 && appDiffDays <= 2;
          case 'app_expiring_today':
            return appDiffDays === 0;
          default:
            return false;
        }
      }

      const expiry = c.expiryDate ? parseDateToBrasilia(c.expiryDate) : null;
      if (c.status !== 'active' || !expiry) {
         if (view === 'active' && c.status === 'active') return true;
         return c.status === view;
      }
      
      const diffTime = expiry.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      switch (view) {
        case 'active':
          return c.status === 'active';
        case 'expiring_5':
          return diffDays > 2 && diffDays <= 5;
        case 'expiring_2':
          return diffDays > 0 && diffDays <= 2;
        case 'expiring_today':
          return expiry.getTime() === today.getTime();
        case 'pending':
          return c.status === 'pending';
        case 'inactive':
          return c.status === 'inactive';
        case 'test':
          return c.status === 'test';
        default:
          return false;
      }
    });
  };
  const filteredClients = getFilteredClients();

  const getCount = (status) => {
    const today = getTodayBrasilia();
    const safeClients = Array.isArray(clients) ? clients : [];
    return safeClients.filter(c => {
      // Verificar vencimento do App para os novos contadores
      const getAppExpiryInfo = () => {
        if (!c.credentials || !Array.isArray(c.credentials)) return null;
        let minDiff = Infinity;
        let found = false;
        c.credentials.forEach(cred => {
          const appExpiry = cred.appExpiryDate ? parseDateToBrasilia(cred.appExpiryDate) : null;
          if (appExpiry) {
            const diff = Math.ceil((appExpiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            if (diff < minDiff) minDiff = diff;
            found = true;
          }
        });
        return found ? minDiff : null;
      };

      if (status.startsWith('app_expiring_')) {
        const appDiffDays = getAppExpiryInfo();
        if (appDiffDays === null) return false;
        
        switch (status) {
          case 'app_expiring_5':
            return appDiffDays > 2 && appDiffDays <= 5;
          case 'app_expiring_2':
            return appDiffDays > 0 && appDiffDays <= 2;
          case 'app_expiring_today':
            return appDiffDays === 0;
          default:
            return false;
        }
      }

      if (c.status !== 'active') {
        return status === c.status;
      }
      
      const expiry = c.expiryDate ? parseDateToBrasilia(c.expiryDate) : null;
      if (!expiry) return false;

      const diffTime = expiry.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      switch (status) {
        case 'active':
          return c.status === 'active';
        case 'expiring_5':
          return diffDays > 2 && diffDays <= 5;
        case 'expiring_2':
          return diffDays > 0 && diffDays <= 2;
        case 'expiring_today':
          return expiry.getTime() === today.getTime();
        case 'pending':
          return c.status === 'pending';
        case 'inactive':
          return c.status === 'inactive';
        case 'test':
          return c.status === 'test';
        default:
          return false;
      }
    }).length;
  };
  const activeCount = getCount('active');
  const inactiveCount = getCount('inactive');
  const pendingCount = getCount('pending');
  const testCount = getCount('test');
  const expiring5Count = getCount('expiring_5');
  const expiring2Count = getCount('expiring_2');
  const expiringTodayCount = getCount('expiring_today');
  const appExpiring5Count = getCount('app_expiring_5');
  const appExpiring2Count = getCount('app_expiring_2');
  const appExpiringTodayCount = getCount('app_expiring_today');

  const renderCredentialsFields = (clientState, setClientState) => <div className="space-y-4">
      {clientState.credentials.map((cred, index) => <div key={index} className="p-3 bg-black/20 rounded-lg border border-yellow-500/20 relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <input type="text" value={cred.login} onChange={e => handleCredentialChange(index, 'login', e.target.value, clientState, setClientState)} placeholder="Login" className="w-full p-2 bg-black/50 border border-yellow-500/30 rounded focus:border-yellow-500 focus:outline-none text-white" />
            <input type="text" value={cred.password} onChange={e => handleCredentialChange(index, 'password', e.target.value, clientState, setClientState)} placeholder="Senha" className="w-full p-2 bg-black/50 border border-yellow-500/30 rounded focus:border-yellow-500 focus:outline-none text-white" />
            <input type="text" value={cred.appUsed} onChange={e => handleCredentialChange(index, 'appUsed', e.target.value, clientState, setClientState)} placeholder="App Usado" className="w-full p-2 bg-black/50 border border-yellow-500/30 rounded focus:border-yellow-500 focus:outline-none text-white" />
            <input type="text" value={cred.deviceUsed} onChange={e => handleCredentialChange(index, 'deviceUsed', e.target.value, clientState, setClientState)} placeholder="Dispositivo Usado" className="w-full p-2 bg-black/50 border border-yellow-500/30 rounded focus:border-yellow-500 focus:outline-none text-white" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Data Entrada App</label>
              <input type="date" value={cred.appEntryDate} onChange={e => handleCredentialChange(index, 'appEntryDate', e.target.value, clientState, setClientState)} className="w-full p-2 bg-black/50 border border-yellow-500/30 rounded focus:border-yellow-500 focus:outline-none text-white" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Data Vencimento App</label>
              <input type="date" value={cred.appExpiryDate} onChange={e => handleCredentialChange(index, 'appExpiryDate', e.target.value, clientState, setClientState)} className="w-full p-2 bg-black/50 border border-yellow-500/30 rounded focus:border-yellow-500 focus:outline-none text-white" />
            </div>
          </div>
          {clientState.credentials.length > 1 && <Button onClick={() => handleRemoveCredential(index, clientState, setClientState)} variant="ghost" size="sm" className="absolute -top-2 -right-2 text-red-500 hover:bg-red-500/20 rounded-full h-6 w-6 p-0"><X size={14} /></Button>}
        </div>)}
      <Button onClick={() => handleAddCredential(clientState, setClientState)} variant="outline" size="sm" className="border-yellow-500 text-yellow-500 hover:bg-yellow-500/10">Adicionar Login</Button>
    </div>;

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
              {(Array.isArray(plans) ? plans : []).map(plan => <CommandItem key={plan.id} value={plan.name} onSelect={currentValue => {
              onChange(currentValue === value ? "" : plan.name);
              setOpen(false);
            }} className="text-white hover:!bg-yellow-500/20">
                  {plan.name}
                </CommandItem>)}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>;
  };
  if (viewingReceiptsFor) {
    const dashIndex = viewingReceiptsFor.id.indexOf('-');
    const type = viewingReceiptsFor.id.substring(0, dashIndex);
    const id = viewingReceiptsFor.id.substring(dashIndex + 1);
    
    console.log('🔍 Filtrando comprovantes para:', { type, id, totalReceipts: receipts?.length });
    
    const clientReceipts = (Array.isArray(receipts) ? receipts : []).filter(r => {
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
        {clientReceipts.length > 0 ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clientReceipts.map(receipt => <motion.div key={receipt.id} className="glass-effect p-4 rounded-lg group relative" initial={{
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
                    <AlertDialogContent className="bg-gray-900 border-yellow-500/50 text-white"><AlertDialogHeader><AlertDialogTitle>Você tem certeza?</AlertDialogTitle><AlertDialogDescription className="text-gray-400">Esta ação não pode ser desfeita. Isso excluirá permanentemente o comprovante do histórico deste cliente.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel className="border-gray-600 text-gray-300 hover:bg-gray-700">Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteReceipt(receipt.id)} className="bg-red-600 hover:bg-red-700 text-white">Excluir</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                  </AlertDialog>
                </div>
              </motion.div>)}
          </div> : <div className="text-center py-12">
            <Receipt className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">Nenhum comprovante encontrado</h3>
            <p className="text-gray-500">Gere um novo comprovante para este cliente.</p>
          </div>}
      </motion.div>;
  }
  const getViewLabel = (viewKey) => {
    const labels = {
      'active': 'Ativos',
      'pending': 'Pendentes',
      'inactive': 'Inativos',
      'test': 'Teste',
      'expiring_5': 'Vencimento Plano (5 dias)',
      'expiring_2': 'Vencimento Plano (2 dias)',
      'expiring_today': 'Vencimento Plano (Hoje)',
      'app_expiring_5': 'Vencimento App (5 dias)',
      'app_expiring_2': 'Vencimento App (2 dias)',
      'app_expiring_today': 'Vencimento App (Hoje)'
    };
    return labels[viewKey] || viewKey;
  };

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
          <h2 className="text-3xl font-bold gold-text mb-2">Gerenciamento de Clientes</h2>
          <p className="text-gray-400">Gerencie todos os seus Clientes da TV Digital.</p>
        </div>
        <Button onClick={() => setIsAddingClient(true)} className="gold-gradient text-black hover:opacity-90"><Plus className="w-4 h-4 mr-2" />Adicionar Cliente</Button>
      </motion.div>

      <div className="flex flex-col space-y-4 border-b border-yellow-500/20 pb-4">
        <div className="flex flex-wrap gap-x-2 md:gap-x-4">
          <button onClick={() => setView('active')} className={`py-2 px-3 text-sm font-medium transition-colors ${view === 'active' ? 'border-b-2 border-green-500 text-green-500' : 'text-gray-400 hover:text-white'}`}><UserCheck className="inline w-4 h-4 mr-1" />Ativos ({activeCount})</button>
          <button onClick={() => setView('pending')} className={`py-2 px-3 text-sm font-medium transition-colors ${view === 'pending' ? 'border-b-2 border-yellow-500 text-yellow-500' : 'text-gray-400 hover:text-white'}`}><Clock className="inline w-4 h-4 mr-1" />Pendentes ({pendingCount})</button>
          <button onClick={() => setView('inactive')} className={`py-2 px-3 text-sm font-medium transition-colors ${view === 'inactive' ? 'border-b-2 border-red-500 text-red-500' : 'text-gray-400 hover:text-white'}`}><UserX className="inline w-4 h-4 mr-1" />Inativos ({inactiveCount})</button>
          <button onClick={() => setView('test')} className={`py-2 px-3 text-sm font-medium transition-colors ${view === 'test' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-400 hover:text-white'}`}><FlaskConical className="inline w-4 h-4 mr-1" />Teste ({testCount})</button>
        </div>

        <div className="flex flex-wrap gap-x-2 md:gap-x-4 items-center">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mr-2">Vencimento Plano:</span>
          <button onClick={() => setView('expiring_5')} className={`py-2 px-3 text-sm font-medium transition-colors ${view === 'expiring_5' ? 'border-b-2 border-orange-500 text-orange-500' : 'text-gray-400 hover:text-white'}`}><AlertTriangle className="inline w-4 h-4 mr-1" />5 dias ({expiring5Count})</button>
          <button onClick={() => setView('expiring_2')} className={`py-2 px-3 text-sm font-medium transition-colors ${view === 'expiring_2' ? 'border-b-2 border-red-600 text-red-600' : 'text-gray-400 hover:text-white'}`}><AlertTriangle className="inline w-4 h-4 mr-1" />2 dias ({expiring2Count})</button>
          <button onClick={() => setView('expiring_today')} className={`py-2 px-3 text-sm font-medium transition-colors ${view === 'expiring_today' ? 'border-b-2 border-yellow-400 text-yellow-400' : 'text-gray-400 hover:text-white'}`}><Calendar className="inline w-4 h-4 mr-1" />Hoje ({expiringTodayCount})</button>
        </div>

        <div className="flex flex-wrap gap-x-2 md:gap-x-4 items-center">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mr-2">Vencimento App:</span>
          <button onClick={() => setView('app_expiring_5')} className={`py-2 px-3 text-sm font-medium transition-colors ${view === 'app_expiring_5' ? 'border-b-2 border-orange-400 text-orange-400' : 'text-gray-400 hover:text-white'}`}><Smartphone className="inline w-4 h-4 mr-1" />5 dias ({appExpiring5Count})</button>
          <button onClick={() => setView('app_expiring_2')} className={`py-2 px-3 text-sm font-medium transition-colors ${view === 'app_expiring_2' ? 'border-b-2 border-red-400 text-red-400' : 'text-gray-400 hover:text-white'}`}><Smartphone className="inline w-4 h-4 mr-1" />2 dias ({appExpiring2Count})</button>
          <button onClick={() => setView('app_expiring_today')} className={`py-2 px-3 text-sm font-medium transition-colors ${view === 'app_expiring_today' ? 'border-b-2 border-yellow-500 text-yellow-500' : 'text-gray-400 hover:text-white'}`}><Smartphone className="inline w-4 h-4 mr-1" />Hoje ({appExpiringTodayCount})</button>
        </div>
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

      {isAddingClient && <motion.div initial={{
      opacity: 0,
      scale: 0.95
    }} animate={{
      opacity: 1,
      scale: 1
    }} transition={{
      duration: 0.3
    }} className="glass-effect p-6 rounded-xl">
          <h3 className="text-xl font-semibold gold-text mb-4">Adicionar Novo Cliente</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" value={newClient.name} onChange={e => setNewClient({
          ...newClient,
          name: e.target.value
        })} placeholder="Nome *" className="w-full p-3 bg-black/50 border border-yellow-500/30 rounded-lg focus:border-yellow-500 focus:outline-none text-white" />
            <input type="text" value={newClient.phone} onChange={e => setNewClient({
          ...newClient,
          phone: e.target.value
        })} placeholder="Telefone *" className="w-full p-3 bg-black/50 border border-yellow-500/30 rounded-lg focus:border-yellow-500 focus:outline-none text-white" />
            <PlanCombobox value={newClient.plan} onChange={value => setNewClient({
          ...newClient,
          plan: value
        })} />
            <select value={newClient.status} onChange={e => setNewClient({
          ...newClient,
          status: e.target.value
        })} className="w-full p-3 bg-black/50 border border-yellow-500/30 rounded-lg focus:border-yellow-500 focus:outline-none text-white">
              <option value="active">Ativo</option>
              <option value="pending">Pendente</option>
              <option value="inactive">Inativo</option>
              <option value="test">Teste</option>
              <option value="expiring_today">Vence Hoje</option>
              <option value="expiring_2">Vence em 2 Dias</option>
              <option value="expiring_5">Vence em 5 Dias</option>
            </select>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Quantidade de Telas</label>
              <input type="number" min="0" value={newClient.screens} onChange={e => setNewClient({
            ...newClient,
            screens: parseInt(e.target.value) || 0
          })} className="w-full p-3 bg-black/50 border border-yellow-500/30 rounded-lg focus:border-yellow-500 focus:outline-none text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Quantidade de Servidores</label>
              <input type="number" min="0" value={newClient.servers} onChange={e => setNewClient({
            ...newClient,
            servers: parseInt(e.target.value) || 0
          })} className="w-full p-3 bg-black/50 border border-yellow-500/30 rounded-lg focus:border-yellow-500 focus:outline-none text-white" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-1">Data de Entrada</label>
              <input type="date" value={newClient.createdAt} onChange={e => setNewClient({
            ...newClient,
            createdAt: e.target.value
          })} className="w-full p-3 bg-black/50 border border-yellow-500/30 rounded-lg focus:border-yellow-500 focus:outline-none text-white" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-1">Data de Vencimento</label>
              <div className="flex gap-2">
                <input type="date" value={newClient.expiryDate} onChange={e => setNewClient({
              ...newClient,
              expiryDate: e.target.value
            })} className="w-full p-3 bg-black/50 border border-yellow-500/30 rounded-lg focus:border-yellow-500 focus:outline-none text-white" />
                <input type="time" value={newClient.expiryTime} onChange={e => setNewClient({
              ...newClient,
              expiryTime: e.target.value
            })} className="w-full p-3 bg-black/50 border border-yellow-500/30 rounded-lg focus:border-yellow-500 focus:outline-none text-white" />
              </div>
            </div>
            <div className="md:col-span-2">{renderCredentialsFields(newClient, setNewClient)}</div>
            <div className="md:col-span-2"><textarea value={newClient.extraInfo} onChange={e => setNewClient({
            ...newClient,
            extraInfo: e.target.value
          })} placeholder="Informações Extras" className="w-full p-3 bg-black/50 border border-yellow-500/30 rounded-lg focus:border-yellow-500 focus:outline-none text-white" rows="3" /></div>
          </div>
          <div className="flex space-x-3 mt-6">
            <Button 
              onClick={handleAddClient} 
              disabled={isSaving}
              variant="gold"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Salvando...' : 'Salvar Cliente'}
            </Button>
            <Button onClick={() => setIsAddingClient(false)} variant="outline" className="border-red-500 text-red-500 hover:bg-red-500/10"><X className="w-4 h-4 mr-2" />Cancelar</Button>
          </div>
        </motion.div>}

      <div className="grid gap-4">
        {filteredClients.map((client, index) => <motion.div key={client.id} initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.4,
        delay: index * 0.05
      }} className={`glass-effect p-6 rounded-xl hover-gold border-l-4 ${client.status === 'active' ? 'border-green-500' : client.status === 'pending' ? 'border-yellow-500' : client.status === 'test' ? 'border-blue-500' : 'border-red-500'}`}>
            {editingClient && editingClient.id === client.id ? <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" value={editingClient.name} onChange={e => setEditingClient({
              ...editingClient,
              name: e.target.value
            })} placeholder="Nome" className="w-full p-2 bg-black/50 border border-yellow-500/30 rounded focus:border-yellow-500 focus:outline-none text-white" />
                  <input type="text" value={editingClient.phone} onChange={e => setEditingClient({
              ...editingClient,
              phone: e.target.value
            })} placeholder="Telefone" className="w-full p-2 bg-black/50 border border-yellow-500/30 rounded focus:border-yellow-500 focus:outline-none text-white" />
                  <PlanCombobox value={editingClient.plan} onChange={value => setEditingClient({
              ...editingClient,
              plan: value
            })} />
                  <select value={editingClient.status} onChange={e => setEditingClient({
              ...editingClient,
              status: e.target.value
            })} className="w-full p-2 bg-black/50 border border-yellow-500/30 rounded focus:border-yellow-500 focus:outline-none text-white">
                    <option value="active">Ativo</option>
                    <option value="pending">Pendente</option>
                    <option value="inactive">Inativo</option>
                    <option value="test">Teste</option>
                  </select>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Quantidade de Telas</label>
                    <input type="number" min="0" value={editingClient.screens} onChange={e => setEditingClient({
                ...editingClient,
                screens: parseInt(e.target.value) || 0
              })} className="w-full p-2 bg-black/50 border border-yellow-500/30 rounded focus:border-yellow-500 focus:outline-none text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Quantidade de Servidores</label>
                    <input type="number" min="0" value={editingClient.servers} onChange={e => setEditingClient({
                ...editingClient,
                servers: parseInt(e.target.value) || 0
              })} className="w-full p-2 bg-black/50 border border-yellow-500/30 rounded focus:border-yellow-500 focus:outline-none text-white" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-1">Data de Entrada</label>
                    <input type="date" value={editingClient.createdAt} onChange={e => setEditingClient({
                ...editingClient,
                createdAt: e.target.value
              })} className="w-full p-2 bg-black/50 border border-yellow-500/30 rounded focus:border-yellow-500 focus:outline-none text-white" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-1">Data de Vencimento</label>
                    <div className="flex gap-2">
                      <input type="date" value={editingClient.expiryDate} onChange={e => setEditingClient({
                  ...editingClient,
                  expiryDate: e.target.value
                })} className="w-full p-2 bg-black/50 border border-yellow-500/30 rounded focus:border-yellow-500 focus:outline-none text-white" />
                      <input type="time" value={editingClient.expiryTime} onChange={e => setEditingClient({
                  ...editingClient,
                  expiryTime: e.target.value
                })} className="w-full p-2 bg-black/50 border border-yellow-500/30 rounded focus:border-yellow-500 focus:outline-none text-white" />
                    </div>
                  </div>
                  <div className="md:col-span-2">{renderCredentialsFields(editingClient, setEditingClient)}</div>
                  <div className="md:col-span-2"><textarea value={editingClient.extraInfo} onChange={e => setEditingClient({
                ...editingClient,
                extraInfo: e.target.value
              })} placeholder="Informações Extras" className="w-full p-2 bg-black/50 border border-yellow-500/30 rounded focus:border-yellow-500 focus:outline-none text-white" rows="2" /></div>
                </div>
                <div className="flex space-x-3"><Button onClick={handleSaveEdit} className="gold-gradient text-black hover:opacity-90" size="sm"><Save className="w-4 h-4 mr-2" />Salvar</Button><Button onClick={() => setEditingClient(null)} variant="outline" className="border-red-500 text-red-500 hover:bg-red-500/10" size="sm"><X className="w-4 h-4 mr-2" />Cancelar</Button></div>
              </div> : <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center"><User className="w-6 h-6 text-black" /></div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-semibold text-white">{client.name}</h3>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-400"><Smartphone className="w-4 h-4" /><span>{client.phone}</span></div>
                    </div>
                  </div>
                  <div className="flex flex-wrap justify-end gap-1">
                    <Button onClick={() => handleWhatsAppMessage(client)} variant="ghost" className="text-green-500 hover:bg-green-500/10" size="icon" title="Enviar WhatsApp"><WhatsAppIcon className="w-5 h-5" /></Button>
                    <Button onClick={() => handleGenerateReceipt(client)} variant="ghost" className="text-cyan-500 hover:bg-cyan-500/10" size="icon" title="Gerar Comprovante"><Receipt className="w-4 h-4" /></Button>
                    <Button onClick={() => setViewingReceiptsFor({ id: `client-${client.id}`, name: client.name })} variant="ghost" className="text-purple-500 hover:bg-purple-500/10" size="icon" title="Histórico de Comprovantes"><History className="w-4 h-4" /></Button>
                    <Button onClick={() => setViewingClient(client)} variant="ghost" className="text-indigo-500 hover:bg-indigo-500/10" size="icon" title="Visualizar Detalhes"><Eye className="w-4 h-4" /></Button>
                    <Button onClick={() => handleRenewClient(client)} variant="ghost" className="text-blue-500 hover:bg-blue-500/10" size="icon" title="Renovar Cliente"><RefreshCw className="w-4 h-4" /></Button>
                    <Button onClick={() => handleEditClient(client)} variant="ghost" className="text-yellow-500 hover:bg-yellow-500/10" size="icon" title="Editar"><Edit className="w-4 h-4" /></Button>
                    <Button onClick={() => handleDeleteClient(client.id)} variant="ghost" className="text-red-500 hover:bg-red-500/10" size="icon" title="Excluir"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm mb-4">
                  <div><span className="text-gray-400">Plano:</span><p className="text-white font-medium">{client.plan || 'N/A'}</p></div>
                  <div className="flex items-center gap-2"><ScreenShare className="w-4 h-4 text-gray-400" /><span className="text-gray-400">Telas:</span><p className="text-white font-medium">{client.screens || 0}</p></div>
                  <div className="flex items-center gap-2"><Server className="w-4 h-4 text-gray-400" /><span className="text-gray-400">Servidores:</span><p className="text-white font-medium">{client.servers || 0}</p></div>
                  <div><span className="text-gray-400">Data de Entrada:</span><p className="text-white font-medium">{formatDateForDisplay(client.createdAt)}</p></div>
                  <div><span className="text-gray-400">Data de Vencimento:</span><p className={`font-medium ${client.status === 'inactive' ? 'text-red-500' : client.status === 'pending' ? 'text-yellow-500' : 'text-white'}`}>{formatDateForDisplay(client.expiryDate)}{client.expiryTime && ` às ${client.expiryTime}`}</p></div>
                </div>
                {client.credentials && Array.isArray(client.credentials) && client.credentials.map((cred, i) => <div key={i} className="p-3 bg-black/20 rounded-lg border border-yellow-500/20 mb-2">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm mb-2">
                      <div><span className="text-gray-400">Login {i + 1}:</span><p className="text-white font-medium">{cred.login || 'N/A'}</p></div>
                      <div><span className="text-gray-400">Senha {i + 1}:</span><p className="text-white font-medium">{cred.password || 'N/A'}</p></div>
                      <div><span className="text-gray-400">App {i + 1}:</span><p className="text-white font-medium">{cred.appUsed || 'N/A'}</p></div>
                      <div><span className="text-gray-400">Dispositivo {i + 1}:</span><p className="text-white font-medium">{cred.deviceUsed || 'N/A'}</p></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div><p className="text-gray-400">Entrada App</p><p className="font-semibold">{formatDateForDisplay(cred.appEntryDate)}</p></div>
                      <div><p className="text-gray-400">Vencimento App</p><p className="font-semibold">{formatDateForDisplay(cred.appExpiryDate)}</p></div>
                    </div>
                  </div>)}
                {client.extraInfo && <div className="mt-4"><span className="text-gray-400">Observações:</span><p className="text-white font-medium">{client.extraInfo}</p></div>}
              </div>}
          </motion.div>)}
      </div>

      {filteredClients.length === 0 && <motion.div initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} transition={{
      duration: 0.6
    }} className="text-center py-12">
          <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">{searchTerm ? 'Nenhum cliente encontrado' : `Nenhum cliente em "${getViewLabel(view)}"`}</h3>
          <p className="text-gray-500">{searchTerm ? 'Tente buscar por outro termo' : 'Adicione clientes para começar'}</p>
        </motion.div>}

      <Dialog open={!!viewingClient} onOpenChange={() => setViewingClient(null)}>
        <DialogContent className="bg-black/80 backdrop-blur-sm border-yellow-500/50 text-white max-w-2xl">
          {viewingClient && <>
              <DialogHeader>
                <DialogTitle className="gold-text text-2xl flex items-center gap-3"><User /> {viewingClient.name}</DialogTitle>
                <DialogDescription className="text-gray-400">{viewingClient.phone}</DialogDescription>
              </DialogHeader>
              <div className="mt-4 space-y-4 max-h-[70vh] overflow-y-auto pr-2 scrollbar-gold">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="glass-effect p-3 rounded-lg"><p className="text-gray-400">Status</p><p className={`font-semibold ${viewingClient.status === 'active' ? 'text-green-400' : 'text-red-400'}`}>{viewingClient.status}</p></div>
                  <div className="glass-effect p-3 rounded-lg"><p className="text-gray-400">Plano</p><p className="font-semibold">{viewingClient.plan || 'N/A'}</p></div>
                  <div className="glass-effect p-3 rounded-lg"><p className="text-gray-400">Telas</p><p className="font-semibold">{viewingClient.screens || 0}</p></div>
                  <div className="glass-effect p-3 rounded-lg"><p className="text-gray-400">Servidores</p><p className="font-semibold">{viewingClient.servers || 0}</p></div>
                  <div className="glass-effect p-3 rounded-lg md:col-span-2"><p className="text-gray-400">Data de Entrada</p><p className="font-semibold">{formatDateForDisplay(viewingClient.createdAt)}</p></div>
                  <div className="glass-effect p-3 rounded-lg md:col-span-2"><p className="text-gray-400">Vencimento</p><p className="font-semibold">{viewingClient.expiryDate ? `${formatDateForDisplay(viewingClient.expiryDate)} às ${viewingClient.expiryTime || '00:00'}` : 'N/A'}</p></div>
                </div>
                <div>
                  <h4 className="font-semibold text-lg gold-text mb-2 mt-4">Credenciais</h4>
                  {viewingClient.credentials && Array.isArray(viewingClient.credentials) && viewingClient.credentials.map((cred, i) => <div key={i} className="glass-effect p-4 rounded-lg mb-3">
                      <p className="font-bold text-white mb-2">Login {i + 1}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div><p className="text-gray-400">Login</p><p className="font-semibold">{cred.login || 'N/A'}</p></div>
                        <div><p className="text-gray-400">Senha</p><p className="font-semibold">{cred.password || 'N/A'}</p></div>
                        <div><p className="text-gray-400">App Usado</p><p className="font-semibold">{cred.appUsed || 'N/A'}</p></div>
                        <div><p className="text-gray-400">Dispositivo Usado</p><p className="font-semibold">{cred.deviceUsed || 'N/A'}</p></div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm mt-2">
                        <div><p className="text-gray-400">Entrada App</p><p className="font-semibold">{formatDateForDisplay(cred.appEntryDate)}</p></div>
                        <div><p className="text-gray-400">Vencimento App</p><p className="font-semibold">{formatDateForDisplay(cred.appExpiryDate)}</p></div>
                      </div>
                    </div>)}
                </div>
                {viewingClient.extraInfo && <div>
                    <h4 className="font-semibold text-lg gold-text mb-2 mt-4">Informações Extras</h4>
                    <div className="glass-effect p-4 rounded-lg">
                      <p className="text-white whitespace-pre-wrap">{viewingClient.extraInfo}</p>
                    </div>
                  </div>}
              </div>
            </>}
        </DialogContent>
      </Dialog>
    </div>;
};
export default ClientManagement;