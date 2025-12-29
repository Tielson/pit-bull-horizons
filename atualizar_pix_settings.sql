-- ============================================
-- ATUALIZAÇÃO DA TABELA PIX_SETTINGS
-- ============================================

-- 1. Remover a restrição UNIQUE de user_id para permitir múltiplos PIXs
ALTER TABLE public.pix_settings DROP CONSTRAINT IF EXISTS pix_settings_user_id_key;

-- 2. Adicionar novas colunas se não existirem
ALTER TABLE public.pix_settings ADD COLUMN IF NOT EXISTS bank TEXT;
ALTER TABLE public.pix_settings ADD COLUMN IF NOT EXISTS message TEXT;
ALTER TABLE public.pix_settings ADD COLUMN IF NOT EXISTS label TEXT;

-- 3. Renomear recipient_name para name (se ainda estiver como recipient_name)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pix_settings' AND column_name = 'recipient_name') THEN
    ALTER TABLE public.pix_settings RENAME COLUMN recipient_name TO name;
  END IF;
END $$;

-- 4. Garantir que pix_type aceite valores nulos
ALTER TABLE public.pix_settings ALTER COLUMN pix_type DROP NOT NULL;

-- 5. Atualizar políticas RLS (garantir que estão corretas)
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

DROP POLICY IF EXISTS "Users can delete their own pix settings" ON public.pix_settings;
CREATE POLICY "Users can delete their own pix settings"
  ON public.pix_settings FOR DELETE
  USING (auth.uid() = user_id);

-- Mensagem de sucesso
DO $$
BEGIN
    RAISE NOTICE '✅ Tabela pix_settings atualizada com sucesso!';
END $$;



