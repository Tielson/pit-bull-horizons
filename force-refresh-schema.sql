-- ============================================
-- FORÇAR ATUALIZAÇÃO DO SCHEMA CACHE
-- ============================================
-- Execute este script se ainda recebe "permission denied"
-- após configurar as políticas RLS
-- ============================================

-- 1. Recarregar o schema cache do PostgREST
NOTIFY pgrst, 'reload schema';

-- 2. Verificar se as políticas foram criadas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 3. Verificar se RLS está ativo
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('clients', 'resellers', 'plans', 'receipts', 'pix_settings', 'message_templates')
ORDER BY tablename;

-- 4. Mensagem de confirmação
SELECT 'Schema cache recarregado! Aguarde 10 segundos e recarregue a aplicação.' as status;



