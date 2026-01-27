# 🚨 Otimização Urgente - Timeout em Receipts

## Problema Crítico

A consulta de comprovantes continua dando timeout mesmo após otimizações iniciais:
- **Erro**: `57014 - canceling statement due to statement timeout`
- **Query**: Busca de 200 registros com todos os campos

## Soluções Implementadas (URGENTE)

### 1. ✅ Redução Agressiva do Limite
- **Antes**: 200 registros
- **Agora**: 50 registros por padrão
- **Retry automático**: Se der timeout, tenta novamente com limite reduzido pela metade

### 2. ✅ Remoção de Campo Pesado
- **`receipt_data` removido** da query inicial (campo JSONB pode ser pesado)
- Campo pode ser buscado sob demanda quando necessário
- Novo método `getById()` para buscar comprovante completo quando necessário

### 3. ✅ Script SQL Atualizado
- Índices recriados com `NULLS LAST` para melhor performance
- Comando `ANALYZE` adicionado para atualizar estatísticas
- Verificação automática de índices existentes

## AÇÃO IMEDIATA NECESSÁRIA

### Passo 1: Executar Script SQL (CRÍTICO)

1. Acesse: https://app.supabase.com
2. Vá em **SQL Editor** > **New Query**
3. Abra o arquivo `supabase-optimize-receipts.sql`
4. **Execute o script completo**
5. Aguarde confirmação de sucesso

### Passo 2: Verificar Índices

Execute esta query para verificar se os índices foram criados:

```sql
SELECT 
    indexname, 
    indexdef 
FROM pg_indexes 
WHERE tablename = 'receipts' 
AND schemaname = 'public'
ORDER BY indexname;
```

Você deve ver pelo menos:
- `idx_receipts_user_id`
- `idx_receipts_user_id_created_at_desc`
- `idx_receipts_created_at_desc`
- `idx_receipts_user_id_payment_date`

### Passo 3: Testar Performance

Execute esta query para verificar se está usando os índices:

```sql
EXPLAIN ANALYZE
SELECT id, client_id, client_name, client_type, plan, amount, 
       payment_date, expiry_date, payment_method, user_id, created_at
FROM public.receipts
WHERE user_id = 'e8e47e23-88bc-43be-a870-2ea55237e9db'
ORDER BY created_at DESC
LIMIT 50;
```

**Resultado esperado**: Deve mostrar `Index Scan using idx_receipts_user_id_created_at_desc`

**Se mostrar `Seq Scan`**: Execute `ANALYZE public.receipts;` e tente novamente.

## Mudanças no Código

### Serviço de Receipts (`src/services/receiptsService.js`)

**Mudanças principais:**
- Limite padrão: **50 registros** (era 200)
- `receipt_data` **removido** da query inicial
- Retry automático com limite reduzido em caso de timeout
- Novo método `getById()` para buscar comprovante completo

**Uso:**
```javascript
// Buscar primeiros 50 registros (sem receipt_data)
const receipts = await receiptsService.getAll();

// Buscar com limite customizado
const receipts = await receiptsService.getAll({ limit: 100 });

// Buscar incluindo receipt_data (mais lento)
const receipts = await receiptsService.getAll({ 
  limit: 50, 
  includeReceiptData: true 
});

// Buscar comprovante completo por ID
const receipt = await receiptsService.getById(receiptId);
```

## Se Ainda Houver Problemas

### Opção 1: Reduzir ainda mais o limite
No arquivo `src/services/receiptsService.js`, linha 14, altere:
```javascript
const { limit = 50, offset = 0, includeReceiptData = false, retryOnTimeout = true } = options;
```
Para:
```javascript
const { limit = 20, offset = 0, includeReceiptData = false, retryOnTimeout = true } = options;
```

### Opção 2: Implementar carregamento incremental
- Carregar apenas 20-30 registros inicialmente
- Carregar mais sob demanda (scroll infinito ou botão "Carregar mais")

### Opção 3: Verificar quantidade de registros
Execute para ver quantos registros existem:
```sql
SELECT user_id, COUNT(*) as total 
FROM public.receipts 
WHERE user_id = 'e8e47e23-88bc-43be-a870-2ea55237e9db'
GROUP BY user_id;
```

Se houver **muitos registros** (milhares), considere:
- Implementar paginação no frontend
- Adicionar filtros de data
- Arquivar registros antigos

## Status

- ✅ Código otimizado (limite 50, sem receipt_data)
- ✅ Retry automático implementado
- ✅ Script SQL atualizado
- ⚠️ **AÇÃO NECESSÁRIA**: Executar script SQL no Supabase
- ⚠️ **VERIFICAR**: Se os índices estão sendo usados
