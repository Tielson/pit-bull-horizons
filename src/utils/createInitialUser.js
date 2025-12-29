/**
 * Script para criar o usuário inicial no Supabase
 * Execute este script UMA VEZ para criar o usuário
 */

import { supabase } from '@/lib/customSupabaseClient';

export const createInitialUser = async () => {
  console.group('👤 CRIANDO USUÁRIO INICIAL');
  console.log('='.repeat(50));
  
  try {
    // Criar usuário com email e senha
    const { data, error } = await supabase.auth.signUp({
      email: 'filipe_thielsom@hotmail.com',
      password: '123456',
      options: {
        data: {
          username: 'tielson'
        },
        // IMPORTANTE: Desabilitar confirmação de email
        emailRedirectTo: undefined,
      }
    });

    if (error) {
      console.error('❌ ERRO ao criar usuário:', error.message);
      
      if (error.message.includes('already registered')) {
        console.log('ℹ️ Usuário já existe! Você pode fazer login.');
        console.log('   Email: filipe_thielsom@hotmail.com');
        console.log('   Senha: 123456');
        console.groupEnd();
        return { success: true, exists: true };
      }
      
      console.groupEnd();
      return { success: false, error: error.message };
    }

    if (data.user) {
      console.log('✅ USUÁRIO CRIADO COM SUCESSO!');
      console.log('');
      console.log('📧 Email:', data.user.email);
      console.log('🆔 ID:', data.user.id);
      console.log('');
      console.log('🔑 Credenciais de Login:');
      console.log('   Usuário: tielson');
      console.log('   Senha: 123456');
      console.log('');
      console.log('⚠️ IMPORTANTE: Confirme o email se necessário!');
      if (data.user.email_confirmed_at) {
        console.log('✅ Email já confirmado automaticamente');
      } else {
        console.log('⚠️ Você pode precisar confirmar o email');
        console.log('   Vá em: Supabase Dashboard → Authentication → Users');
        console.log('   Clique nos 3 pontinhos do usuário → Confirm email');
      }
    }

    console.log('='.repeat(50));
    console.groupEnd();
    return { success: true, user: data.user };
    
  } catch (error) {
    console.error('❌ ERRO INESPERADO:', error);
    console.groupEnd();
    return { success: false, error: error.message };
  }
};

// Função auxiliar para verificar se precisa criar o usuário
export const checkAndCreateUser = async () => {
  console.log('🔍 Verificando se usuário inicial existe...');
  
  // Tentar fazer login para verificar se existe
  const { error } = await supabase.auth.signInWithPassword({
    email: 'filipe_thielsom@hotmail.com',
    password: '123456',
  });

  if (error) {
    if (error.message.includes('Invalid login credentials') || 
        error.message.includes('Email not confirmed')) {
      console.log('⚠️ Usuário não encontrado ou não confirmado. Criando...');
      return await createInitialUser();
    }
  } else {
    console.log('✅ Usuário já existe e pode fazer login!');
    // Fazer logout depois da verificação
    await supabase.auth.signOut();
    return { success: true, exists: true };
  }
};

export default createInitialUser;

