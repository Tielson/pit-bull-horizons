import { supabase } from '@/lib/customSupabaseClient';
import { mapResellerFromSupabase, mapResellerToSupabase, mapResellersFromSupabase } from '@/utils/dataMapper';

export const resellersService = {
  /**
   * Buscar todos os revendedores do usuário logado
   */
  async getAll() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Adicionar limite para evitar timeouts e melhorar performance
      const { data, error } = await supabase
        .from('resellers')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(1000); // Limite razoável para evitar timeouts
      
      if (error) {
        // Tratamento específico para timeout
        if (error.code === '57014' || error.message?.includes('timeout')) {
          console.error('⏱️ Timeout ao buscar revendedores. Tente novamente ou verifique índices no banco.');
          throw new Error('A consulta demorou muito. Tente novamente ou entre em contato com o suporte.');
        }
        throw error;
      }
      
      // Converter do formato Supabase para formato do componente
      return mapResellersFromSupabase(data || []);
    } catch (error) {
      console.error('Erro ao buscar revendedores:', error);
      throw error;
    }
  },

  /**
   * Buscar revendedor por ID
   */
  async getById(id) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('resellers')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      return mapResellerFromSupabase(data);
    } catch (error) {
      console.error('Erro ao buscar revendedor:', error);
      throw error;
    }
  },

  /**
   * Criar novo revendedor
   */
  async create(reseller) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Usuário não autenticado');

      // Converter para formato Supabase
      const resellerToInsert = mapResellerToSupabase(reseller);
      
      // Adicionar user_id (não precisa ser convertido, já está em snake_case)
      resellerToInsert.user_id = user.id;

      const { data, error } = await supabase
        .from('resellers')
        .insert([resellerToInsert])
        .select()
        .single();
      
      if (error) throw error;
      
      // Converter de volta para formato do componente
      return mapResellerFromSupabase(data);
    } catch (error) {
      console.error('Erro ao criar revendedor:', error);
      throw error;
    }
  },

  /**
   * Atualizar revendedor
   */
  async update(id, updates) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Converter para formato Supabase
      const updatesToSupabase = mapResellerToSupabase(updates);
      
      const { data, error } = await supabase
        .from('resellers')
        .update(updatesToSupabase)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Converter de volta para formato do componente
      return mapResellerFromSupabase(data);
    } catch (error) {
      console.error('Erro ao atualizar revendedor:', error);
      throw error;
    }
  },

  /**
   * Deletar revendedor
   */
  async delete(id) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('resellers')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
    } catch (error) {
      console.error('Erro ao deletar revendedor:', error);
      throw error;
    }
  },

  /**
   * Sincronizar múltiplos revendedores
   */
  async syncMultiple(resellers) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Usuário não autenticado');

      const resellersToInsert = resellers.map(reseller => {
        const mapped = mapResellerToSupabase(reseller);
        mapped.user_id = user.id;
        mapped.id = undefined; // Remover ID para criar novo registro
        return mapped;
      });

      const { data, error } = await supabase
        .from('resellers')
        .insert(resellersToInsert)
        .select();
      
      if (error) throw error;
      
      // Converter de volta para formato do componente
      return mapResellersFromSupabase(data || []);
    } catch (error) {
      console.error('Erro ao sincronizar revendedores:', error);
      throw error;
    }
  }
};

export default resellersService;

