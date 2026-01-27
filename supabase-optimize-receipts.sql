-- ============================================
-- OTIMIZAÇÃO DE PERFORMANCE PARA RECEIPTS
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- para melhorar a performance das consultas de comprovantes
-- ============================================

-- Remover índices antigos se existirem (para recriar)
DROP INDEX IF EXISTS public.idx_receipts_user_id_created_at_desc;
DROP INDEX IF EXISTS public.idx_receipts_created_at_desc;
DROP INDEX IF EXISTS public.idx_receipts_user_id_payment_date;

-- 1. Índice composto otimizado para a query mais comum
-- (user_id + created_at DESC) - usado na busca com ordenação
-- Este é o índice mais importante para a query que está dando timeout
CREATE INDEX idx_receipts_user_id_created_at_desc 
ON public.receipts(user_id, created_at DESC NULLS LAST);

-- 2. Índice adicional em created_at para ordenação geral
CREATE INDEX idx_receipts_created_at_desc 
ON public.receipts(created_at DESC NULLS LAST);

-- 3. Índice composto para buscas por user_id e payment_date
CREATE INDEX idx_receipts_user_id_payment_date 
ON public.receipts(user_id, payment_date DESC NULLS LAST);

-- 4. Verificar se o índice em user_id existe (já deveria existir do setup inicial)
-- Se não existir, criar
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE schemaname = 'public' 
        AND tablename = 'receipts' 
        AND indexname = 'idx_receipts_user_id'
    ) THEN
        CREATE INDEX idx_receipts_user_id ON public.receipts(user_id);
    END IF;
END $$;

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
-- Substitua 'SEU_USER_ID' pelo ID do usuário que está tendo problemas:
-- 
-- EXPLAIN ANALYZE
-- SELECT id, client_id, client_name, client_type, plan, amount, 
--        payment_date, expiry_date, payment_method, user_id, created_at
-- FROM public.receipts
-- WHERE user_id = 'SEU_USER_ID'
-- ORDER BY created_at DESC
-- LIMIT 50;
--
-- O resultado deve mostrar "Index Scan" usando idx_receipts_user_id_created_at_desc
-- 
-- Se ainda mostrar "Seq Scan" (sequential scan), os índices não estão sendo usados.
-- Nesse caso, execute: ANALYZE public.receipts;
-- ============================================

-- Atualizar estatísticas da tabela para o planner usar os índices corretamente
ANALYZE public.receipts;

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
