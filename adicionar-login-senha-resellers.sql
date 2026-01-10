-- ============================================
-- ADICIONAR CAMPOS LOGIN E SENHA NA TABELA RESELLERS
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- (Dashboard do Supabase > SQL Editor > New Query)
-- ============================================

-- Adicionar colunas login e password na tabela resellers
ALTER TABLE public.resellers 
ADD COLUMN IF NOT EXISTS login TEXT,
ADD COLUMN IF NOT EXISTS password TEXT;

-- ============================================
-- VERIFICAÇÃO
-- ============================================
-- Para verificar se as colunas foram adicionadas, execute:
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'resellers' AND table_schema = 'public'
-- ORDER BY ordinal_position;
