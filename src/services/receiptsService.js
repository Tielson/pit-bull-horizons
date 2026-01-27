import { supabase } from '@/lib/customSupabaseClient';
import { mapReceiptFromSupabase, mapReceiptToSupabase, mapReceiptsFromSupabase } from '@/utils/dataMapper';

export const receiptsService = {
  /**
   * Buscar todos os comprovantes do usuário logado
   * Otimizado para evitar timeouts:
   * - Limite reduzido para 50 registros por padrão
   * - Receipt_data removido da query inicial (pode ser pesado em JSONB)
   * - Retry automático com limite reduzido em caso de timeout
   */
  async getAll(options = {}) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { limit = 50, offset = 0, includeReceiptData = false, retryOnTimeout = true } = options;

      // Remover receipt_data da query inicial para melhorar performance
      // Ele pode ser buscado sob demanda se necessário
      const fields = includeReceiptData 
        ? 'id, client_id, client_name, client_type, plan, amount, payment_date, expiry_date, payment_method, receipt_data, user_id, created_at'
        : 'id, client_id, client_name, client_type, plan, amount, payment_date, expiry_date, payment_method, user_id, created_at';

      // Construir query base
      let query = supabase
        .from('receipts')
        .select(fields)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      // Usar range para paginação ou limit simples quando offset é 0
      if (offset > 0) {
        query = query.range(offset, offset + limit - 1);
      } else {
        query = query.limit(limit);
      }

      const { data, error } = await query;
      
      if (error) {
        // Tratamento específico para timeout com retry automático
        if (error.code === '57014' || error.message?.includes('timeout')) {
          console.warn('⏱️ Timeout ao buscar comprovantes. Tentando com limite menor...');
          
          // Se ainda não tentou com limite menor e retry está habilitado
          if (retryOnTimeout && limit > 20) {
            console.log(`🔄 Tentando novamente com limite reduzido: ${Math.floor(limit / 2)}`);
            return this.getAll({
              ...options,
              limit: Math.floor(limit / 2),
              retryOnTimeout: false // Evitar loop infinito
            });
          }
          
          console.error('⏱️ Timeout persistente. Verifique índices no banco de dados.');
          throw new Error('A consulta demorou muito. Tente novamente ou verifique índices no banco.');
        }
        throw error;
      }
      
      // Se não incluiu receipt_data, adicionar campo vazio para compatibilidade
      const mappedData = mapReceiptsFromSupabase(data || []);
      if (!includeReceiptData) {
        mappedData.forEach(receipt => {
          if (!receipt.imageUrl) receipt.imageUrl = '';
        });
      }
      
      return mappedData;
    } catch (error) {
      console.error('Erro ao buscar comprovantes:', error);
      throw error;
    }
  },

  /**
   * Buscar comprovante completo por ID (incluindo receipt_data)
   */
  async getById(id) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('receipts')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return mapReceiptFromSupabase(data);
    } catch (error) {
      console.error('Erro ao buscar comprovante:', error);
      throw error;
    }
  },

  /**
   * Buscar comprovantes com paginação
   * Retorna os dados e informações de paginação
   * Usa limite menor por padrão para evitar timeouts
   */
  async getAllPaginated(page = 1, pageSize = 50) {
    try {
      const offset = (page - 1) * pageSize;
      const data = await this.getAll({ limit: pageSize, offset, includeReceiptData: false });
      
      // Buscar total de registros para calcular paginação
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Usar count com head: true para apenas contar sem retornar dados
      const { count, error: countError } = await supabase
        .from('receipts')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (countError) {
        console.warn('Erro ao contar comprovantes:', countError);
      }

      const total = count || 0;

      return {
        data,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
          hasMore: total > offset + pageSize
        }
      };
    } catch (error) {
      console.error('Erro ao buscar comprovantes paginados:', error);
      throw error;
    }
  },

  /**
   * Criar novo comprovante
   */
  async create(receipt) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Usuário não autenticado');

      const mappedReceipt = mapReceiptToSupabase(receipt);

      const { data, error } = await supabase
        .from('receipts')
        .insert([{ 
          ...mappedReceipt,
          user_id: user.id,
          created_at: new Date().toISOString()
        }])
        .select();
      
      if (error) throw error;
      return mapReceiptFromSupabase(data[0]);
    } catch (error) {
      console.error('Erro ao criar comprovante:', error);
      throw error;
    }
  },

  /**
   * Deletar comprovante
   */
  async delete(id) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('receipts')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
    } catch (error) {
      console.error('Erro ao deletar comprovante:', error);
      throw error;
    }
  },

  /**
   * Sincronizar múltiplos comprovantes
   */
  async syncMultiple(receipts) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Usuário não autenticado');

      const receiptsWithUserId = receipts.map(receipt => ({
        ...mapReceiptToSupabase(receipt),
        user_id: user.id
      }));

      const { data, error } = await supabase
        .from('receipts')
        .insert(receiptsWithUserId)
        .select();
      
      if (error) throw error;
      return mapReceiptsFromSupabase(data);
    } catch (error) {
      console.error('Erro ao sincronizar comprovantes:', error);
      throw error;
    }
  }
};

export default receiptsService;

