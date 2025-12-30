import { supabase } from '@/lib/customSupabaseClient';
import { mapPixFromSupabase, mapPixToSupabase, mapPixsFromSupabase } from '@/utils/dataMapper';

export const pixService = {
  /**
   * Buscar todas as configurações PIX do usuário logado
   */
  async getAll() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('pix_settings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return mapPixsFromSupabase(data);
    } catch (error) {
      console.error('Erro ao buscar configurações PIX:', error);
      throw error;
    }
  },

  /**
   * Criar nova configuração PIX
   */
  async create(pix) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Usuário não autenticado');

      const mappedPix = mapPixToSupabase(pix);

      const { data, error } = await supabase
        .from('pix_settings')
        .insert([{ 
          ...mappedPix,
          user_id: user.id
        }])
        .select();
      
      if (error) throw error;
      return mapPixFromSupabase(data[0]);
    } catch (error) {
      console.error('Erro ao criar configuração PIX:', error);
      throw error;
    }
  },

  /**
   * Atualizar configuração PIX
   */
  async update(id, pix) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const mappedPix = mapPixToSupabase(pix);

      const { data, error } = await supabase
        .from('pix_settings')
        .update(mappedPix)
        .eq('id', id)
        .eq('user_id', user.id)
        .select();
      
      if (error) throw error;
      return mapPixFromSupabase(data[0]);
    } catch (error) {
      console.error('Erro ao atualizar configuração PIX:', error);
      throw error;
    }
  },

  /**
   * Deletar configuração PIX
   */
  async delete(id) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('pix_settings')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
    } catch (error) {
      console.error('Erro ao deletar configuração PIX:', error);
      throw error;
    }
  }
};

export default pixService;





