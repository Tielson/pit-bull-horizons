import { supabase } from '@/lib/customSupabaseClient';

export const templatesService = {
  async getAll() {
    const { data, error } = await supabase
      .from('message_templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar templates:', error);
      throw error;
    }

    return data || [];
  },

  async create(template) {
    console.log('🚀 templatesService.create iniciado:', template);
    // Pegar o ID do usuário logado
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('❌ Usuário não autenticado no templatesService');
      throw new Error('Usuário não autenticado');
    }

    console.log('👤 Usuário identificado:', user.id);

    const { data, error } = await supabase
      .from('message_templates')
      .insert([{
        name: template.name,
        subject: template.subject || '',
        message: template.message,
        type: template.type || 'expiry',
        user_id: user.id
      }])
      .select();

    if (error) {
      console.error('❌ Erro na API do Supabase ao criar template:', error);
      throw error;
    }

    console.log('✅ Template criado com sucesso no Supabase:', data);
    return data ? data[0] : null;
  },

  async update(id, template) {
    const { data, error } = await supabase
      .from('message_templates')
      .update({
        name: template.name,
        subject: template.subject,
        message: template.message,
        type: template.type,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar template:', error);
      throw error;
    }

    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('message_templates')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar template:', error);
      throw error;
    }

    return true;
  },

  async syncMultiple(templates) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const templatesToSync = templates.map(t => ({
      name: t.name,
      subject: t.subject || '',
      message: t.message,
      type: t.type || 'expiry',
      user_id: user.id
    }));

    const { error } = await supabase
      .from('message_templates')
      .upsert(templatesToSync, { onConflict: 'name,user_id' });

    if (error) {
      console.error('Erro ao sincronizar templates:', error);
      throw error;
    }
  }
};

