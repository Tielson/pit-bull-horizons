import ClientManagement from '@/components/ClientManagement';
import Dashboard from '@/components/Dashboard';
import Header from '@/components/Header';
import Login from '@/components/Login';
import PixManagement from '@/components/PixManagement';
import PlanManagement from '@/components/PlanManagement';
import RenewalReceipts from '@/components/RenewalReceipts';
import Reports from '@/components/Reports';
import ResellerManagement from '@/components/ResellerManagement';
import Settings from '@/components/Settings';
import Sidebar from '@/components/Sidebar';
import { Toaster } from '@/components/ui/toaster';
import { toast } from '@/components/ui/use-toast';
import WhatsAppIntegration from '@/components/WhatsAppIntegration';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import SetupPage from '@/pages/SetupPage';
import { clientsService } from '@/services/clientsService';
import { resellersService } from '@/services/resellersService';
import { getBrasiliaDate } from '@/utils/dataMapper';
import { motion } from 'framer-motion';
import React, { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';

function App() {
  const { user, loading: authLoading } = useAuth();
  const {
    clients,
    setClients,
    resellers,
    setResellers,
    plans,
    setPlans,
    receipts,
    setReceipts,
    templates,
    setTemplates,
    loading: dataLoading,
    syncing,
    reloadData
  } = useSupabaseData();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [panelTitle, setPanelTitle] = useState('Manager Pro');
  const [panelLogo, setPanelLogo] = useState('');
  const [view, setView] = useState('login');
  const [showSetup, setShowSetup] = useState(false);
  
  const loading = authLoading || dataLoading;
  
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

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return 'N/A';
    const date = parseDateToBrasilia(dateString);
    if (!date) return 'N/A';
    return date.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  };

  const checkAndApplyStatusUpdates = useCallback((currentClients, currentResellers) => {
    const today = getTodayBrasilia();

    const updateStatus = (item) => {
      if (!item || item.status === 'test' || !item.expiryDate) {
        return item;
      }

      const expiryDate = parseDateToBrasilia(item.expiryDate);
      if (!expiryDate) return item;

      // Se a data de vencimento passou, vai direto para inativo
      if (expiryDate < today) {
        if (item.status !== 'inactive') {
          return { ...item, status: 'inactive' };
        }
      }
      return item;
    };

    const safeClients = Array.isArray(currentClients) ? currentClients : [];
    const safeResellers = Array.isArray(currentResellers) ? currentResellers : [];

    const updatedClients = safeClients.map(updateStatus);
    const updatedResellers = safeResellers.map(updateStatus);

    return { updatedClients, updatedResellers };
  }, []);

  /**
   * Sincronizar autenticação com o usuário do Supabase
   */
  useEffect(() => {
    if (user) {
      setIsAuthenticated(true);
      setView('app');
      sessionStorage.setItem('isAuthenticated', 'true');
      
      // Se veio de um magic link, mostrar mensagem de boas-vindas
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      if (hashParams.get('access_token')) {
        toast({
          title: "✅ Login realizado!",
          description: `Bem-vindo, ${user.email}!`,
        });
        // Limpar hash da URL
        window.history.replaceState(null, '', window.location.pathname);
      }
    } else {
      setIsAuthenticated(false);
      setView('login');
      sessionStorage.removeItem('isAuthenticated');
    }
  }, [user, toast]);

  /**
   * Carregar configurações do painel (localStorage por enquanto)
   */
  useEffect(() => {
    const savedTitle = localStorage.getItem('panel_title');
    const savedLogo = localStorage.getItem('panel_logo');
    if (savedTitle) setPanelTitle(savedTitle);
    if (savedLogo) setPanelLogo(savedLogo);
  }, []);

  /**
   * Verificar clientes com 30 dias para vencer e mostrar toast
   */
  useEffect(() => {
    if (!user || !isAuthenticated) return;

  const check30DaysExpiry = () => {
    const safeClients = Array.isArray(clients) ? clients : [];
    const today = getTodayBrasilia();
    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    // Buscar clientes que vencem em exatamente 30 dias
    const clientsExpiringIn30Days = safeClients.filter(client => {
      if (!client.expiryDate || client.status === 'test' || client.status === 'inactive') {
        return false;
      }

      const expiryDate = parseDateToBrasilia(client.expiryDate);
      if (!expiryDate) return false;

      // Verificar se vence em exatamente 30 dias (com margem de 1 dia para evitar problemas de timezone)
      const diffTime = expiryDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return diffDays >= 29 && diffDays <= 31; // Margem de 1 dia
    });

    if (clientsExpiringIn30Days.length > 0) {
      // Verificar quais clientes já foram notificados hoje
      const todayKey = today.toLocaleDateString('en-CA'); // YYYY-MM-DD format
      const notifiedKey = `expiry_notified_30_${todayKey}`;
      const notifiedIds = JSON.parse(localStorage.getItem(notifiedKey) || '[]');

        clientsExpiringIn30Days.forEach(client => {
          // Só mostrar toast se ainda não foi notificado hoje
          if (!notifiedIds.includes(client.id)) {
            const expiryDate = parseDateToBrasilia(client.expiryDate);
            const diffTime = expiryDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            toast({
              title: "⚠️ Aviso de Vencimento",
              description: `O app do cliente "${client.name}" vence em ${diffDays} dias (${formatDateForDisplay(client.expiryDate)}).`,
              variant: "default",
              duration: 10000, // 10 segundos
            });

            // Marcar como notificado
            notifiedIds.push(client.id);
            localStorage.setItem(notifiedKey, JSON.stringify(notifiedIds));
          }
        });
      }
    };

    // Verificar imediatamente quando os clientes são carregados
    if (clients.length > 0) {
      check30DaysExpiry();
    }

    // Verificar a cada hora
    const interval = setInterval(check30DaysExpiry, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [clients, user, isAuthenticated, toast]);

  /**
   * Atualização automática de status (executada a cada hora)
   * Agora salva no Supabase ao invés de localStorage
   */
  useEffect(() => {
    if (!user) return; // Só executa se estiver logado

    const runStatusUpdate = async () => {
      try {
        const safePrevClients = Array.isArray(clients) ? clients : [];
        const safeResellers = Array.isArray(resellers) ? resellers : [];
        const { updatedClients, updatedResellers } = checkAndApplyStatusUpdates(safePrevClients, safeResellers);
        
        // Verificar se houve mudanças e atualizar no Supabase
        if (JSON.stringify(updatedClients) !== JSON.stringify(safePrevClients)) {
          console.log('🔄 Atualizando status dos clientes...');
          setClients(updatedClients);
          // Atualizar cada cliente alterado no Supabase
          for (const client of updatedClients) {
            const oldClient = safePrevClients.find(c => c.id === client.id);
            if (oldClient && oldClient.status !== client.status) {
              await clientsService.update(client.id, { status: client.status });
            }
          }
        }
        
        if (JSON.stringify(updatedResellers) !== JSON.stringify(safeResellers)) {
          console.log('🔄 Atualizando status dos revendedores...');
          setResellers(updatedResellers);
          // Atualizar cada revendedor alterado no Supabase
          for (const reseller of updatedResellers) {
            const oldReseller = safeResellers.find(r => r.id === reseller.id);
            if (oldReseller && oldReseller.status !== reseller.status) {
              await resellersService.update(reseller.id, { status: reseller.status });
            }
          }
        }
      } catch (error) {
        console.error('Erro ao atualizar status:', error);
      }
    };

    // Rodar uma vez imediatamente (não esperar 1 hora)
    runStatusUpdate();

    const interval = setInterval(runStatusUpdate, 60 * 60 * 1000); // Roda a cada hora

    return () => clearInterval(interval);
  }, [clients, resellers, checkAndApplyStatusUpdates, user]);


  const handleLogin = () => {
    setIsAuthenticated(true);
    sessionStorage.setItem('isAuthenticated', 'true');
    setView('app');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('isAuthenticated');
    setView('login');
  };

  const handleSetPanelTitle = (title) => {
    setPanelTitle(title);
    localStorage.setItem('panel_title', title);
  };

  const handleSetPanelLogo = (logo) => {
    setPanelLogo(logo);
    localStorage.setItem('panel_logo', logo);
  };

  /**
   * Salvar clientes no Supabase
   * NOTA: Esta função apenas atualiza o estado local.
   * O salvamento real no Supabase é feito pelos componentes via services.
   */
  const saveClients = (updatedClients) => {
    // Apenas atualizar estado local
    // O salvamento no Supabase é feito diretamente pelos componentes
    setClients(updatedClients);
    console.log('✅ Estado local atualizado:', updatedClients.length, 'clientes');
  };

  /**
   * Salvar revendedores no Supabase
   */
  const saveResellers = async (updatedResellers) => {
    try {
      setResellers(updatedResellers);
      console.log('✅ Revendedores atualizados:', updatedResellers.length);
    } catch (error) {
      console.error('Erro ao salvar revendedores:', error);
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  /**
   * Salvar planos no Supabase
   */
  const savePlans = async (updatedPlans) => {
    try {
      setPlans(updatedPlans);
      console.log('✅ Planos atualizados:', updatedPlans.length);
    } catch (error) {
      console.error('Erro ao salvar planos:', error);
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  /**
   * Salvar comprovantes no Supabase
   */
  const saveReceipts = async (updatedReceipts) => {
    try {
      setReceipts(updatedReceipts);
      console.log('✅ Comprovantes atualizados:', updatedReceipts.length);
    } catch (error) {
      console.error('Erro ao salvar comprovantes:', error);
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard setActiveSection={setActiveSection} clients={clients} plans={plans} resellers={resellers} />;
      case 'clients':
        return <ClientManagement setActiveSection={setActiveSection} panelTitle={panelTitle} panelLogo={panelLogo} clients={clients} saveClients={saveClients} plans={plans} receipts={receipts} saveReceipts={saveReceipts} onClientCreated={reloadData} />;
      case 'resellers':
        return <ResellerManagement setActiveSection={setActiveSection} resellers={resellers} saveResellers={saveResellers} plans={plans} receipts={receipts} saveReceipts={saveReceipts} onResellerCreated={reloadData} />;
      case 'plans':
        return <PlanManagement plans={plans} savePlans={savePlans} onPlanCreated={reloadData} />;
      case 'whatsapp':
        return <WhatsAppIntegration panelLogo={panelLogo} panelTitle={panelTitle} clients={[...(Array.isArray(clients) ? clients : []), ...(Array.isArray(resellers) ? resellers : [])]} plans={plans} messageTemplates={templates} onTemplateCreated={reloadData} />;
      case 'receipts':
        return <RenewalReceipts panelTitle={panelTitle} panelLogo={panelLogo} setActiveSection={setActiveSection} clients={[...(Array.isArray(clients) ? clients : []), ...(Array.isArray(resellers) ? resellers : [])]} saveReceipts={saveReceipts} onReceiptCreated={reloadData} plans={plans} />;
      case 'pix':
        return <PixManagement panelLogo={panelLogo} panelTitle={panelTitle} />;
      case 'reports':
        return <Reports clients={clients} plans={plans} />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard setActiveSection={setActiveSection} clients={clients} plans={plans} resellers={resellers} />;
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            {syncing && (
              <p className="text-yellow-500 text-sm">
                Sincronizando dados com Supabase...
              </p>
            )}
          </div>
        </div>
      );
    }

    if (showSetup) {
      return <SetupPage onComplete={() => setShowSetup(false)} />;
    }

    if (!isAuthenticated) {
      return <Login onLogin={handleLogin} onShowSetup={() => setShowSetup(true)} />;
    }

    return (
      <div className="flex h-screen bg-black">
        <Sidebar 
          activeSection={activeSection} 
          setActiveSection={setActiveSection} 
          clients={clients}
          resellers={resellers}
          panelLogo={panelLogo}
          panelTitle={panelTitle}
        />
        <div className="flex-1 flex flex-col ml-64">
          <Header 
            panelTitle={panelTitle} 
            setPanelTitle={handleSetPanelTitle}
            panelLogo={panelLogo}
            setPanelLogo={handleSetPanelLogo}
            onLogout={handleLogout}
          />
          <motion.main 
            key={activeSection}
            className="flex-1 p-6 overflow-y-auto scrollbar-gold"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            {renderActiveSection()}
          </motion.main>
        </div>
      </div>
    );
  };

  return (
    <>
      <Helmet>
        <title>{panelTitle} - Painel de Gerenciamento de Clientes</title>
        <meta name="description" content="Sistema completo de gerenciamento de clientes com integração WhatsApp e geração de comprovantes" />
      </Helmet>
      
      <div className="min-h-screen bg-black">
        {renderContent()}
        <Toaster />
      </div>
    </>
  );
}

export default App;