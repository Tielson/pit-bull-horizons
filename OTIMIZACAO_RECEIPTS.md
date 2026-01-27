# 🚀 Otimização de Performance - Tabela Receipts

## Problema Identificado

A consulta de comprovantes estava demorando muito e retornando erro 500 com timeout:
- **Erro**: `57014 - canceling statement due to statement timeout`
- **Causa**: Consulta buscando até 1000 registros de uma vez sem índices otimizados

## Soluções Implementadas

### 1. ✅ Índices Otimizados no Banco de Dados

Criado arquivo `supabase-optimize-receipts.sql` com índices compostos que melhoram significativamente a performance:

- **`idx_receipts_user_id_created_at_desc`**: Índice composto para a query mais comum (user_id + created_at DESC)
- **`idx_receipts_created_at_desc`**: Índice para ordenação geral por data de criação
- **`idx_receipts_user_id_payment_date`**: Índice para buscas por user_id e payment_date

**Como aplicar:**
1. Acesse o SQL Editor no Supabase Dashboard
2. Abra o arquivo `supabase-optimize-receipts.sql`
3. Execute o script completo
4. Aguarde a confirmação de sucesso

### 2. ✅ Otimização do Serviço de Receipts

**Mudanças no `src/services/receiptsService.js`:**

- **Limite reduzido**: De 1000 para 200 registros por padrão
- **Seleção específica de campos**: Ao invés de `select('*')`, agora seleciona apenas os campos necessários
- **Suporte a paginação**: Método `getAll()` agora aceita opções `{ limit, offset }`
- **Novo método `getAllPaginated()`**: Retorna dados com informações de paginação

**Exemplo de uso:**

```javascript
// Buscar primeiros 200 registros (padrão)
const receipts = await receiptsService.getAll();

// Buscar com limite customizado
const receipts = await receiptsService.getAll({ limit: 100, offset: 0 });

// Buscar com paginação completa
const { data, pagination } = await receiptsService.getAllPaginated(1, 100);
```

## Próximos Passos Recomendados

### Se ainda houver problemas de performance:

1. **Implementar carregamento incremental** no frontend:
   - Carregar primeiros 100-200 registros inicialmente
   - Carregar mais registros sob demanda (scroll infinito ou botão "Carregar mais")

2. **Adicionar cache**:
   - Usar React Query para cachear os dados
   - Implementar refetch estratégico

3. **Otimizar ainda mais a query**:
   - Se não precisar de todos os campos, selecionar apenas os necessários
   - Considerar adicionar filtros de data para reduzir o escopo

## Verificação de Performance

Após aplicar os índices, você pode verificar se estão sendo usados:

```sql
EXPLAIN ANALYZE
SELECT * FROM public.receipts
WHERE user_id = 'seu-user-id-aqui'
ORDER BY created_at DESC
LIMIT 200;
```

O resultado deve mostrar `Index Scan` usando o índice `idx_receipts_user_id_created_at_desc`.

## Status

- ✅ Script SQL de otimização criado
- ✅ Serviço de receipts otimizado
- ✅ Método de paginação implementado
- ⏳ **AÇÃO NECESSÁRIA**: Executar o script SQL no Supabase
