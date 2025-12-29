-- ============================================
-- SOLUÇÃO TEMPORÁRIA: Desabilitar RLS
-- ============================================
-- ATENÇÃO: Isto é TEMPORÁRIO apenas para testar!
-- Em produção, SEMPRE use RLS!
-- ============================================

-- OPÇÃO 1: Desabilitar RLS temporariamente (NÃO RECOMENDADO PARA PRODUÇÃO)
ALTER TABLE public.clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.resellers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pix_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_templates DISABLE ROW LEVEL SECURITY;

SELECT 'RLS DESABILITADO TEMPORARIAMENTE!' as status;
SELECT 'Recarregue a aplicação para testar!' as status;
SELECT 'ATENÇÃO: Isto é apenas para DEBUG! Habilite RLS depois!' as warning;



