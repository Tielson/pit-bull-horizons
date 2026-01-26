import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { clientsService } from '@/services/clientsService';
import { plansService } from '@/services/plansService';
import { receiptsService } from '@/services/receiptsService';
import { resellersService } from '@/services/resellersService';
import { templatesService } from '@/services/templatesService';
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Hook customizado para gerenciar dados do Supabase
 * Sincroniza dados do localStorage para o Supabase na primeira vez
 */
export const useSupabaseData = () => {
  const { user, loading: authLoading } = useAuth();
  const [clients, setClients] = useState([]);
  const [resellers, setResellers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const isReloadingRef = useRef(false); // Prevenir recarregamentos duplicados (usando ref para evitar dependência circular)
  const hasLoadedForUserRef = useRef(null); // Rastrear se já carregou para este usuário

  /**
   * Carregar dados do Supabase
   */
  const loadData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    // Prevenir recarregamentos duplicados (React StrictMode)
    if (isReloadingRef.current) {
      console.log('⏸️ Recarregamento já em andamento, ignorando...');
      return;
    }

    try {
      isReloadingRef.current = true;
      setLoading(true);
      console.log('📥 Carregando dados do Supabase...');

      // Usar Promise.allSettled para não falhar tudo se uma query der timeout
      const results = await Promise.allSettled([
        clientsService.getAll(),
        resellersService.getAll(),
        plansService.getAll(),
        receiptsService.getAll(),
        templatesService.getAll(),
      ]);

      // Processar resultados, tratando erros individualmente
      const clientsData = results[0].status === 'fulfilled' ? results[0].value : [];
      const resellersData = results[1].status === 'fulfilled' ? results[1].value : [];
      const plansData = results[2].status === 'fulfilled' ? results[2].value : [];
      const receiptsData = results[3].status === 'fulfilled' ? results[3].value : [];
      const templatesData = results[4].status === 'fulfilled' ? results[4].value : [];

      // Log de erros individuais
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          const serviceNames = ['clientes', 'revendedores', 'planos', 'comprovantes', 'templates'];
          console.error(`⚠️ Erro ao carregar ${serviceNames[index]}:`, result.reason);
        }
      });

      // Garantir que todos sejam arrays e remover duplicatas baseado no ID
      const safeClientsData = Array.isArray(clientsData) ? clientsData : [];
      const safeResellersData = Array.isArray(resellersData) ? resellersData : [];
      const safePlansData = Array.isArray(plansData) ? plansData : [];
      const safeReceiptsData = Array.isArray(receiptsData) ? receiptsData : [];
      const safeTemplatesData = Array.isArray(templatesData) ? templatesData : [];

      const uniqueClients = safeClientsData.filter((client, index, self) =>
        client && client.id && index === self.findIndex(c => c && c.id === client.id)
      );
      const uniqueResellers = safeResellersData.filter((reseller, index, self) =>
        reseller && reseller.id && index === self.findIndex(r => r && r.id === reseller.id)
      );
      const uniquePlans = safePlansData.filter((plan, index, self) =>
        plan && plan.id && index === self.findIndex(p => p && p.id === plan.id)
      );
      const uniqueReceipts = safeReceiptsData.filter((receipt, index, self) =>
        receipt && receipt.id && index === self.findIndex(r => r && r.id === receipt.id)
      );
      const uniqueTemplates = safeTemplatesData.filter((template, index, self) =>
        template && template.id && index === self.findIndex(t => t && t.id === template.id)
      );

      setClients(uniqueClients);
      setResellers(uniqueResellers);
      setPlans(uniquePlans);
      setReceipts(uniqueReceipts);
      setTemplates(uniqueTemplates);

      console.log('✅ Dados carregados:', {
        clients: uniqueClients.length,
        resellers: uniqueResellers.length,
        plans: uniquePlans.length,
        receipts: uniqueReceipts.length,
        templates: uniqueTemplates.length
      });

      // Se não há dados no Supabase, tentar migrar do localStorage
      if (uniqueClients.length === 0 && uniquePlans.length === 0 && uniqueTemplates.length === 0) {
        await migrateFromLocalStorage();
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro ao carregar dados",
        description: error.message || "Tente novamente mais tarde",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      isReloadingRef.current = false;
    }
  }, [user]);

  /**
   * Migrar dados do localStorage para o Supabase (primeira vez)
   */
  const migrateFromLocalStorage = async () => {
    try {
      setSyncing(true);
      console.log('🔄 Verificando dados do localStorage para migração...');

      const localClients = JSON.parse(localStorage.getItem('iptv_clients') || '[]');
      const localResellers = JSON.parse(localStorage.getItem('iptv_resellers') || '[]');
      const localPlans = JSON.parse(localStorage.getItem('iptv_plans') || '[]');
      const localReceipts = JSON.parse(localStorage.getItem('iptv_receipts') || '[]');
      const localTemplates = JSON.parse(localStorage.getItem('whatsapp_templates') || '[]');

      const hasLocalData = localClients.length > 0 || localResellers.length > 0 || 
                           localPlans.length > 0 || localReceipts.length > 0 ||
                           localTemplates.length > 0;

      if (!hasLocalData) {
        console.log('ℹ️ Nenhum dado local encontrado para migrar');
        return;
      }

      console.log('📤 Migrando dados do localStorage para Supabase...');

      const results = await Promise.allSettled([
        localClients.length > 0 ? clientsService.syncMultiple(localClients) : Promise.resolve([]),
        localResellers.length > 0 ? resellersService.syncMultiple(localResellers) : Promise.resolve([]),
        localPlans.length > 0 ? plansService.syncMultiple(localPlans) : Promise.resolve([]),
        localReceipts.length > 0 ? receiptsService.syncMultiple(localReceipts) : Promise.resolve([]),
        localTemplates.length > 0 ? templatesService.syncMultiple(localTemplates) : Promise.resolve([]),
      ]);

      console.log('✅ Migração concluída!');

      // Recarregar dados após migração
      await loadData();

      toast({
        title: "✅ Dados migrados!",
        description: "Seus dados foram sincronizados com o Supabase.",
      });

      // Limpar localStorage após migração bem-sucedida
      // localStorage.removeItem('iptv_clients');
      // localStorage.removeItem('iptv_resellers');
      // localStorage.removeItem('iptv_plans');
      // localStorage.removeItem('iptv_receipts');
      // localStorage.removeItem('whatsapp_templates');
    } catch (error) {
      console.error('Erro ao migrar dados:', error);
      toast({
        title: "Aviso",
        description: "Não foi possível migrar todos os dados. Eles foram carregados do servidor.",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  /**
   * Carregar dados apenas uma vez quando usuário fizer login pela primeira vez
   * Não recarrega quando a pessoa sai e volta (navegação, refresh, etc)
   */
  useEffect(() => {
    if (!authLoading && user) {
      // Só carregar se ainda não carregou para este usuário específico
      if (hasLoadedForUserRef.current !== user.id) {
        loadData();
        hasLoadedForUserRef.current = user.id;
      } else {
        // Se já carregou para este usuário, apenas garantir que loading está false
        setLoading(false);
      }
    } else if (!authLoading && !user) {
      // Limpar dados quando deslogar
      setClients([]);
      setResellers([]);
      setPlans([]);
      setReceipts([]);
      setTemplates([]);
      setLoading(false);
      hasLoadedForUserRef.current = null; // Reset para permitir carregar novamente no próximo login
    }
  }, [user, authLoading, loadData]);

  return {
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
    loading,
    syncing,
    reloadData: loadData,
  };
};

export default useSupabaseData;

