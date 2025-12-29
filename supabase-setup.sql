-- ============================================
-- SCRIPT DE CONFIGURAÇÃO DO SUPABASE
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- (Dashboard do Supabase > SQL Editor > New Query)
--
-- Este script cria o usuário inicial do sistema
-- ============================================

-- 1. Criar o usuário no Auth
-- Usuário: filipe_thielsom
-- Senha: 123456
-- Email: filipe_thielsom@hotmail.com

-- IMPORTANTE: Execute este código no SQL Editor do Supabase
-- Substitua 'YOUR_PROJECT_URL' pela URL do seu projeto

-- Primeiro, vamos verificar se o usuário já existe
DO $$
DECLARE
  user_id uuid;
BEGIN
  -- Tentar encontrar o usuário
  SELECT id INTO user_id
  FROM auth.users
  WHERE email = 'filipe_thielsom@hotmail.com';

  -- Se não existir, criar
  IF user_id IS NULL THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'filipe_thielsom@hotmail.com',
      crypt('123456', gen_salt('bf')), -- Senha: 123456
      NOW(),
      NOW(),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"username":"filipe_thielsom"}',
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    );
    
    RAISE NOTICE 'Usuário criado com sucesso!';
    RAISE NOTICE 'Email: filipe_thielsom@hotmail.com';
    RAISE NOTICE 'Senha: 123456';
  ELSE
    RAISE NOTICE 'Usuário já existe com ID: %', user_id;
  END IF;
END $$;

-- ============================================
-- INSTRUÇÕES DE USO
-- ============================================
-- 1. Acesse: https://app.supabase.com
-- 2. Selecione seu projeto
-- 3. Vá em SQL Editor (menu lateral)
-- 4. Clique em "New Query"
-- 5. Cole este script completo
-- 6. Clique em "Run" (ou Ctrl+Enter)
--
-- Após executar, você poderá fazer login com:
-- Usuário: tielson
-- Senha: 123456
-- ============================================

