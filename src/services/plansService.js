import { supabase } from '@/lib/customSupabaseClient';
import { mapPlanFromSupabase, mapPlanToSupabase, mapPlansFromSupabase } from '@/utils/dataMapper';

export const plansService = {
  /**
   * Buscar todos os planos do usuário logado
   */
  async getAll() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Converter do formato Supabase para formato do componente
      return mapPlansFromSupabase(data || []);
    } catch (error) {
      console.error('Erro ao buscar planos:', error);
      throw error;
    }
  },

  /**
   * Buscar plano por ID
   */
  async getById(id) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      return mapPlanFromSupabase(data);
    } catch (error) {
      console.error('Erro ao buscar plano:', error);
      throw error;
    }
  },

  /**
   * Criar novo plano
   */
  async create(plan) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Usuário não autenticado');

      // Converter para formato Supabase
      const planToInsert = mapPlanToSupabase(plan);
      
      // Adicionar user_id (não precisa ser convertido, já está em snake_case)
      planToInsert.user_id = user.id;

      const { data, error } = await supabase
        .from('plans')
        .insert([planToInsert])
        .select()
        .single();
      
      if (error) throw error;
      
      // Converter de volta para formato do componente
      return mapPlanFromSupabase(data);
    } catch (error) {
      console.error('Erro ao criar plano:', error);
      throw error;
    }
  },

  /**
   * Atualizar plano
   */
  async update(id, updates) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Converter para formato Supabase
      const updatesToSupabase = mapPlanToSupabase(updates);
      
      const { data, error } = await supabase
        .from('plans')
        .update(updatesToSupabase)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Converter de volta para formato do componente
      return mapPlanFromSupabase(data);
    } catch (error) {
      console.error('Erro ao atualizar plano:', error);
      throw error;
    }
  },

  /**
   * Deletar plano
   */
  async delete(id) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('plans')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
    } catch (error) {
      console.error('Erro ao deletar plano:', error);
      throw error;
    }
  },

  /**
   * Sincronizar múltiplos planos
   */
  async syncMultiple(plans) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Usuário não autenticado');

      const plansToInsert = plans.map(plan => {
        const mapped = mapPlanToSupabase(plan);
        mapped.user_id = user.id;
        mapped.id = undefined; // Remover ID para criar novo registro
        return mapped;
      });

      const { data, error } = await supabase
        .from('plans')
        .insert(plansToInsert)
        .select();
      
      if (error) throw error;
      
      // Converter de volta para formato do componente
      return mapPlansFromSupabase(data || []);
    } catch (error) {
      console.error('Erro ao sincronizar planos:', error);
      throw error;
    }
  }
};

export default plansService;

