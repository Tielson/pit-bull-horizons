import { supabase } from '@/lib/customSupabaseClient';
import { mapReceiptFromSupabase, mapReceiptToSupabase, mapReceiptsFromSupabase } from '@/utils/dataMapper';

export const receiptsService = {
  /**
   * Buscar todos os comprovantes do usuário logado
   * Otimizado para evitar timeouts com limite reduzido e seleção específica de campos
   */
  async getAll(options = {}) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { limit = 200, offset = 0 } = options;

      // Selecionar campos específicos ao invés de * para melhor performance
      // e usar limite menor para evitar timeouts
      const query = supabase
        .from('receipts')
        .select('id, client_id, client_name, client_type, plan, amount, payment_date, expiry_date, payment_method, receipt_data, user_id, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      const { data, error } = await query;
      
      if (error) {
        // Tratamento específico para timeout
        if (error.code === '57014' || error.message?.includes('timeout')) {
          console.error('⏱️ Timeout ao buscar comprovantes. Tente novamente ou verifique índices no banco.');
          throw new Error('A consulta demorou muito. Tente novamente ou entre em contato com o suporte.');
        }
        throw error;
      }
      return mapReceiptsFromSupabase(data || []);
    } catch (error) {
      console.error('Erro ao buscar comprovantes:', error);
      throw error;
    }
  },

  /**
   * Buscar comprovantes com paginação
   * Retorna os dados e informações de paginação
   */
  async getAllPaginated(page = 1, pageSize = 100) {
    try {
      const offset = (page - 1) * pageSize;
      const data = await this.getAll({ limit: pageSize, offset });
      
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

