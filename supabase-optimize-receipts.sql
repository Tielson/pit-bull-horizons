-- ============================================
-- OTIMIZAÇÃO DE PERFORMANCE PARA RECEIPTS
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- para melhorar a performance das consultas de comprovantes
-- ============================================

-- 1. Índice composto otimizado para a query mais comum
-- (user_id + created_at DESC) - usado na busca com ordenação
CREATE INDEX IF NOT EXISTS idx_receipts_user_id_created_at_desc 
ON public.receipts(user_id, created_at DESC);

-- 2. Índice adicional em created_at para ordenação geral
-- (já existe idx_receipts_payment_date, mas created_at é mais usado)
CREATE INDEX IF NOT EXISTS idx_receipts_created_at_desc 
ON public.receipts(created_at DESC);

-- 3. Índice composto para buscas por user_id e payment_date
CREATE INDEX IF NOT EXISTS idx_receipts_user_id_payment_date 
ON public.receipts(user_id, payment_date DESC);

-- 4. Verificar estatísticas da tabela (útil para diagnóstico)
-- Execute este comando para ver quantos registros existem por usuário
-- SELECT user_id, COUNT(*) as total_receipts 
-- FROM public.receipts 
-- GROUP BY user_id 
-- ORDER BY total_receipts DESC;

-- ============================================
-- ANÁLISE DE PERFORMANCE
-- ============================================
-- Após criar os índices, você pode verificar se estão sendo usados:
-- 
-- EXPLAIN ANALYZE
-- SELECT * FROM public.receipts
-- WHERE user_id = 'e8e47e23-88bc-43be-a870-2ea55237e9db'
-- ORDER BY created_at DESC
-- LIMIT 1000;
--
-- O resultado deve mostrar "Index Scan" usando o índice criado
-- ============================================

-- Mensagem de sucesso
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '==============================================';
    RAISE NOTICE '✅ ÍNDICES DE PERFORMANCE CRIADOS COM SUCESSO!';
    RAISE NOTICE '==============================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Índices criados:';
    RAISE NOTICE '  - idx_receipts_user_id_created_at_desc';
    RAISE NOTICE '  - idx_receipts_created_at_desc';
    RAISE NOTICE '  - idx_receipts_user_id_payment_date';
    RAISE NOTICE '';
    RAISE NOTICE 'As consultas de comprovantes devem ser mais rápidas agora!';
    RAISE NOTICE '';
    RAISE NOTICE '==============================================';
END $$;
