-- ============================================
-- VERIFICAR E CORRIGIR TUDO
-- ============================================

-- 1. Verificar se as políticas foram criadas
SELECT 
  '=== POLÍTICAS EXISTENTES ===' as info,
  tablename,
  policyname,
  cmd as operacao
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 2. Verificar se RLS está ativo
SELECT 
  '=== STATUS DO RLS ===' as info,
  tablename,
  CASE WHEN rowsecurity THEN 'ATIVO ✅' ELSE 'INATIVO ❌' END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('clients', 'resellers', 'plans', 'receipts', 'pix_settings', 'message_templates')
ORDER BY tablename;

-- 3. Verificar estrutura das tabelas (se tem coluna user_id)
SELECT 
  '=== ESTRUTURA DAS TABELAS ===' as info,
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('clients', 'resellers', 'plans', 'receipts')
  AND column_name = 'user_id';

-- 4. Verificar se há dados nas tabelas
SELECT '=== DADOS NAS TABELAS ===' as info;
SELECT 'clients' as tabela, COUNT(*) as total FROM public.clients;
SELECT 'resellers' as tabela, COUNT(*) as total FROM public.resellers;
SELECT 'plans' as tabela, COUNT(*) as total FROM public.plans;
SELECT 'receipts' as tabela, COUNT(*) as total FROM public.receipts;

-- 5. SE NÃO HOUVER POLÍTICAS, CRIAR NOVAMENTE
-- (Este bloco só executa se não houver políticas)

DO $$
BEGIN
  -- Verificar se existem políticas
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'clients'
  ) THEN
    -- Criar políticas permissivas para authenticated users
    EXECUTE 'CREATE POLICY "Allow all for authenticated users - clients" ON public.clients FOR ALL TO authenticated USING (true) WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "Allow all for authenticated users - resellers" ON public.resellers FOR ALL TO authenticated USING (true) WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "Allow all for authenticated users - plans" ON public.plans FOR ALL TO authenticated USING (true) WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "Allow all for authenticated users - receipts" ON public.receipts FOR ALL TO authenticated USING (true) WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "Allow all for authenticated users - pix_settings" ON public.pix_settings FOR ALL TO authenticated USING (true) WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "Allow all for authenticated users - message_templates" ON public.message_templates FOR ALL TO authenticated USING (true) WITH CHECK (true)';
    
    RAISE NOTICE 'Políticas permissivas criadas!';
  ELSE
    RAISE NOTICE 'Políticas já existem!';
  END IF;
END $$;

-- 6. Forçar atualização do cache
NOTIFY pgrst, 'reload schema';

-- 7. Mensagem final
SELECT 'Verificação concluída! Veja os resultados acima.' as status;
SELECT 'Se não aparecer nenhuma política, elas foram criadas agora!' as status;
SELECT 'Recarregue a aplicação e faça logout/login!' as status;



