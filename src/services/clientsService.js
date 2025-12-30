import { supabase } from '@/lib/customSupabaseClient';
import { mapClientsFromSupabase, mapClientFromSupabase, mapClientToSupabase } from '@/utils/dataMapper';

export const clientsService = {
  /**
   * Buscar todos os clientes do usuário logado
   */
  async getAll() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      // Converter do formato Supabase para formato do componente
      return mapClientsFromSupabase(data || []);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      throw error;
    }
  },

  /**
   * Buscar cliente por ID
   */
  async getById(id) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      
      // Converter do formato Supabase para formato do componente
      return mapClientFromSupabase(data);
    } catch (error) {
      console.error('Erro ao buscar cliente:', error);
      throw error;
    }
  },

  /**
   * Criar novo cliente
   */
  async create(client) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Usuário não autenticado');

      // Converter do formato do componente para formato Supabase
      const supabaseClient = mapClientToSupabase(client);

      const { data, error } = await supabase
        .from('clients')
        .insert([{ 
          ...supabaseClient,
          user_id: user.id
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      // Converter de volta para formato do componente
      return mapClientFromSupabase(data);
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      throw error;
    }
  },

  /**
   * Atualizar cliente
   */
  async update(id, updates) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Converter do formato do componente para formato Supabase
      const supabaseUpdates = mapClientToSupabase(updates);
      
      const { data, error } = await supabase
        .from('clients')
        .update(supabaseUpdates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Converter de volta para formato do componente
      return mapClientFromSupabase(data);
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      throw error;
    }
  },

  /**
   * Deletar cliente
   */
  async delete(id) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
    } catch (error) {
      console.error('Erro ao deletar cliente:', error);
      throw error;
    }
  },

  /**
   * Sincronizar múltiplos clientes (útil para migração do localStorage)
   */
  async syncMultiple(clients) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Usuário não autenticado');

      const clientsWithUserId = clients.map(client => ({
        ...mapClientToSupabase(client),
        user_id: user.id,
        id: undefined // Remove ID local, deixa o Supabase gerar
      }));

      const { data, error } = await supabase
        .from('clients')
        .insert(clientsWithUserId)
        .select();
      
      if (error) throw error;
      return mapClientsFromSupabase(data || []);
    } catch (error) {
      console.error('Erro ao sincronizar clientes:', error);
      throw error;
    }
  }
};

export default clientsService;

