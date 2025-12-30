import { supabase } from '@/lib/customSupabaseClient';
import { mapReceiptFromSupabase, mapReceiptToSupabase, mapReceiptsFromSupabase } from '@/utils/dataMapper';

export const receiptsService = {
  /**
   * Buscar todos os comprovantes do usuário logado
   */
  async getAll() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('receipts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return mapReceiptsFromSupabase(data);
    } catch (error) {
      console.error('Erro ao buscar comprovantes:', error);
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

