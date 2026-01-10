-- ============================================
-- CONFIGURAÇÃO COMPLETA DO BANCO DE DADOS
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- (Dashboard do Supabase > SQL Editor > New Query)
--
-- Este script cria todas as tabelas e estruturas necessárias
-- ============================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. TABELA DE CLIENTES
-- ============================================
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT,
  plan TEXT,
  screens INTEGER DEFAULT 1,
  servers INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expiry_date DATE,
  expiry_time TEXT,
  credentials JSONB DEFAULT '[]'::jsonb,
  extra_info TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending', 'test')),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. TABELA DE REVENDEDORES
-- ============================================
CREATE TABLE IF NOT EXISTS public.resellers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT,
  login TEXT,
  password TEXT,
  credits INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending', 'test')),
  plan TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expiry_date DATE,
  expiry_time TEXT,
  extra_info TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. TABELA DE PLANOS
-- ============================================
CREATE TABLE IF NOT EXISTS public.plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  duration INTEGER DEFAULT 30,
  description TEXT,
  features TEXT,
  max_devices TEXT,
  quality TEXT,
  channels TEXT,
  support BOOLEAN DEFAULT true,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 4. TABELA DE COMPROVANTES
-- ============================================
CREATE TABLE IF NOT EXISTS public.receipts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID,
  client_name TEXT NOT NULL,
  client_type TEXT DEFAULT 'client' CHECK (client_type IN ('client', 'reseller')),
  plan TEXT,
  amount DECIMAL(10,2) NOT NULL,
  payment_date DATE NOT NULL,
  expiry_date DATE,
  payment_method TEXT,
  receipt_data JSONB,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 5. TABELA DE CONFIGURAÇÕES PIX
-- ============================================
CREATE TABLE IF NOT EXISTS public.pix_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pix_key TEXT NOT NULL,
  pix_type TEXT CHECK (pix_type IN ('cpf', 'cnpj', 'email', 'phone', 'random')),
  recipient_name TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 6. TABELA DE TEMPLATES DE MENSAGEM
-- ============================================
CREATE TABLE IF NOT EXISTS public.message_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'expiry' CHECK (type IN ('expiry', 'welcome', 'renewal', 'custom')),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 7. HABILITAR ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pix_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 8. POLÍTICAS DE SEGURANÇA (RLS POLICIES)
-- ============================================

-- Políticas para CLIENTS
DROP POLICY IF EXISTS "Users can view their own clients" ON public.clients;
CREATE POLICY "Users can view their own clients"
  ON public.clients FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own clients" ON public.clients;
CREATE POLICY "Users can insert their own clients"
  ON public.clients FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own clients" ON public.clients;
CREATE POLICY "Users can update their own clients"
  ON public.clients FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own clients" ON public.clients;
CREATE POLICY "Users can delete their own clients"
  ON public.clients FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas para RESELLERS
DROP POLICY IF EXISTS "Users can view their own resellers" ON public.resellers;
CREATE POLICY "Users can view their own resellers"
  ON public.resellers FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own resellers" ON public.resellers;
CREATE POLICY "Users can insert their own resellers"
  ON public.resellers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own resellers" ON public.resellers;
CREATE POLICY "Users can update their own resellers"
  ON public.resellers FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own resellers" ON public.resellers;
CREATE POLICY "Users can delete their own resellers"
  ON public.resellers FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas para PLANS
DROP POLICY IF EXISTS "Users can view their own plans" ON public.plans;
CREATE POLICY "Users can view their own plans"
  ON public.plans FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own plans" ON public.plans;
CREATE POLICY "Users can insert their own plans"
  ON public.plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own plans" ON public.plans;
CREATE POLICY "Users can update their own plans"
  ON public.plans FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own plans" ON public.plans;
CREATE POLICY "Users can delete their own plans"
  ON public.plans FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas para RECEIPTS
DROP POLICY IF EXISTS "Users can view their own receipts" ON public.receipts;
CREATE POLICY "Users can view their own receipts"
  ON public.receipts FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own receipts" ON public.receipts;
CREATE POLICY "Users can insert their own receipts"
  ON public.receipts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own receipts" ON public.receipts;
CREATE POLICY "Users can delete their own receipts"
  ON public.receipts FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas para PIX_SETTINGS
DROP POLICY IF EXISTS "Users can view their own pix settings" ON public.pix_settings;
CREATE POLICY "Users can view their own pix settings"
  ON public.pix_settings FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own pix settings" ON public.pix_settings;
CREATE POLICY "Users can insert their own pix settings"
  ON public.pix_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own pix settings" ON public.pix_settings;
CREATE POLICY "Users can update their own pix settings"
  ON public.pix_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- Políticas para MESSAGE_TEMPLATES
DROP POLICY IF EXISTS "Users can view their own message templates" ON public.message_templates;
CREATE POLICY "Users can view their own message templates"
  ON public.message_templates FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own message templates" ON public.message_templates;
CREATE POLICY "Users can insert their own message templates"
  ON public.message_templates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own message templates" ON public.message_templates;
CREATE POLICY "Users can update their own message templates"
  ON public.message_templates FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own message templates" ON public.message_templates;
CREATE POLICY "Users can delete their own message templates"
  ON public.message_templates FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 9. FUNÇÕES E TRIGGERS PARA UPDATED_AT
-- ============================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar updated_at
DROP TRIGGER IF EXISTS update_clients_updated_at ON public.clients;
CREATE TRIGGER update_clients_updated_at
    BEFORE UPDATE ON public.clients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_resellers_updated_at ON public.resellers;
CREATE TRIGGER update_resellers_updated_at
    BEFORE UPDATE ON public.resellers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_plans_updated_at ON public.plans;
CREATE TRIGGER update_plans_updated_at
    BEFORE UPDATE ON public.plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_pix_settings_updated_at ON public.pix_settings;
CREATE TRIGGER update_pix_settings_updated_at
    BEFORE UPDATE ON public.pix_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_message_templates_updated_at ON public.message_templates;
CREATE TRIGGER update_message_templates_updated_at
    BEFORE UPDATE ON public.message_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 10. ÍNDICES PARA MELHORAR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_clients_user_id ON public.clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_status ON public.clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_expiry_date ON public.clients(expiry_date);

CREATE INDEX IF NOT EXISTS idx_resellers_user_id ON public.resellers(user_id);
CREATE INDEX IF NOT EXISTS idx_resellers_status ON public.resellers(status);
CREATE INDEX IF NOT EXISTS idx_resellers_expiry_date ON public.resellers(expiry_date);

CREATE INDEX IF NOT EXISTS idx_plans_user_id ON public.plans(user_id);

CREATE INDEX IF NOT EXISTS idx_receipts_user_id ON public.receipts(user_id);
CREATE INDEX IF NOT EXISTS idx_receipts_payment_date ON public.receipts(payment_date);

CREATE INDEX IF NOT EXISTS idx_pix_settings_user_id ON public.pix_settings(user_id);

CREATE INDEX IF NOT EXISTS idx_message_templates_user_id ON public.message_templates(user_id);

-- ============================================
-- FINALIZADO!
-- ============================================

-- Mensagem de sucesso
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '==============================================';
    RAISE NOTICE '✅ BANCO DE DADOS CONFIGURADO COM SUCESSO!';
    RAISE NOTICE '==============================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Tabelas criadas:';
    RAISE NOTICE '  - clients (clientes)';
    RAISE NOTICE '  - resellers (revendedores)';
    RAISE NOTICE '  - plans (planos)';
    RAISE NOTICE '  - receipts (comprovantes)';
    RAISE NOTICE '  - pix_settings (configurações PIX)';
    RAISE NOTICE '  - message_templates (templates de mensagem)';
    RAISE NOTICE '';
    RAISE NOTICE 'Segurança configurada:';
    RAISE NOTICE '  - Row Level Security (RLS) habilitado';
    RAISE NOTICE '  - Políticas de acesso configuradas';
    RAISE NOTICE '  - Dados isolados por usuário';
    RAISE NOTICE '';
    RAISE NOTICE 'Próximo passo:';
    RAISE NOTICE '  - Faça login na aplicação';
    RAISE NOTICE '  - Os dados serão salvos automaticamente no Supabase';
    RAISE NOTICE '';
    RAISE NOTICE '==============================================';
END $$;

