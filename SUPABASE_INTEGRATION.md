# 🚀 Integração com Supabase - Guia Completo

## ✅ Status da Integração

O projeto está **totalmente integrado** com o Supabase! Todos os dados agora são salvos e carregados do banco de dados em tempo real.

---

## 📋 O que foi implementado

### 1. **Serviços de Dados** (`src/services/`)

Criamos serviços dedicados para cada entidade do sistema:

- **`clientsService.js`**: Gerencia clientes (CRUD completo)
- **`resellersService.js`**: Gerencia revendedores (CRUD completo)
- **`plansService.js`**: Gerencia planos (CRUD completo)
- **`receiptsService.js`**: Gerencia comprovantes (CRUD completo)

Cada serviço possui métodos para:
- `getAll()` - Buscar todos os registros
- `getById(id)` - Buscar por ID
- `create(data)` - Criar novo registro
- `update(id, data)` - Atualizar registro
- `delete(id)` - Deletar registro
- `syncMultiple(array)` - Sincronizar múltiplos registros (útil para migração)

### 2. **Hook Customizado** (`src/hooks/useSupabaseData.js`)

Criamos um hook React que:
- ✅ Carrega dados do Supabase automaticamente quando o usuário faz login
- ✅ Sincroniza dados do `localStorage` para o Supabase na primeira vez (migração automática)
- ✅ Gerencia estados de loading e syncing
- ✅ Fornece função `reloadData()` para recarregar dados manualmente
- ✅ Limpa dados quando o usuário faz logout

### 3. **Integração no App.jsx**

O `App.jsx` foi atualizado para:
- ✅ Usar o hook `useSupabaseData` para gerenciar todos os dados
- ✅ Usar o hook `useAuth` para gerenciar autenticação
- ✅ Remover dependência do `localStorage` (exceto para configurações do painel)
- ✅ Atualizar status de clientes/revendedores automaticamente no Supabase a cada hora
- ✅ Mostrar indicador de sincronização durante o carregamento inicial

---

## 🔄 Como funciona a migração automática

Quando um usuário faz login pela primeira vez:

1. O sistema verifica se há dados no Supabase
2. Se **não houver dados** no Supabase, mas **houver no localStorage**:
   - Os dados são automaticamente migrados para o Supabase
   - Um toast de confirmação é exibido
   - Os dados são recarregados do Supabase
3. O `localStorage` **não é limpo** automaticamente (por segurança)
   - Você pode descomentar as linhas no `useSupabaseData.js` para limpar após migração

---

## 📊 Estrutura de Dados

### Clientes (`clients`)
```javascript
{
  id: uuid,
  user_id: uuid,
  name: string,
  phone: string,
  plan: string,
  screens: number,
  servers: number,
  created_at: timestamp,
  expiry_date: date,
  expiry_time: string,
  credentials: jsonb[],
  extra_info: text,
  status: string
}
```

### Revendedores (`resellers`)
```javascript
{
  id: uuid,
  user_id: uuid,
  name: string,
  phone: string,
  credits: number,
  status: string,
  plan: string,
  created_at: timestamp,
  expiry_date: date,
  expiry_time: string,
  extra_info: text
}
```

### Planos (`plans`)
```javascript
{
  id: uuid,
  user_id: uuid,
  name: string,
  price: numeric,
  duration: integer,
  description: text,
  features: text,
  max_devices: integer,
  quality: string,
  channels: string,
  support: boolean,
  created_at: timestamp
}
```

### Comprovantes (`receipts`)
```javascript
{
  id: uuid,
  user_id: uuid,
  client_name: string,
  client_phone: string,
  plan: string,
  amount: numeric,
  payment_date: date,
  expiry_date: date,
  payment_method: string,
  receipt_image: text,
  created_at: timestamp
}
```

---

## 🎯 Próximos Passos

### 1. **Executar o Script SQL**

Se ainda não executou, rode o `supabase-database-setup.sql` no SQL Editor do Supabase:

```bash
# Abra o Supabase Dashboard
# Vá em SQL Editor
# Cole o conteúdo do arquivo supabase-database-setup.sql
# Clique em "Run"
```

### 2. **Criar Usuário Inicial**

Se ainda não criou o usuário `tielson`:

1. Faça login na aplicação
2. Clique em "Configuração Inicial"
3. Clique em "Criar Usuário Inicial (tielson / 123456)"
4. Aguarde a confirmação

### 3. **Testar a Aplicação**

1. Faça login com `tielson@app.local` / `123456`
2. Adicione um cliente de teste
3. Verifique no Supabase se o cliente foi criado na tabela `clients`
4. Adicione um plano de teste
5. Verifique no Supabase se o plano foi criado na tabela `plans`

---

## 🔧 Debugging

### Ver logs de sincronização

Abra o console do navegador (F12) e procure por:

```
📥 Carregando dados do Supabase...
✅ Dados carregados: { clients: X, resellers: Y, plans: Z, receipts: W }
🔄 Verificando dados do localStorage para migração...
📤 Migrando dados do localStorage para Supabase...
✅ Migração concluída!
```

### Verificar dados no Supabase

1. Abra o Supabase Dashboard
2. Vá em "Table Editor"
3. Selecione a tabela (`clients`, `resellers`, `plans`, `receipts`)
4. Verifique se os dados estão lá

### Forçar recarga de dados

No console do navegador:

```javascript
// Recarregar dados do Supabase
window.location.reload();
```

---

## 🛡️ Segurança

### Row Level Security (RLS)

Todas as tabelas possuem RLS ativado:

- ✅ Usuários só podem ver seus próprios dados
- ✅ Usuários só podem criar dados associados ao seu `user_id`
- ✅ Usuários só podem atualizar/deletar seus próprios dados

### Políticas de Acesso

```sql
-- Exemplo: Política de SELECT para clients
CREATE POLICY "Users can view their own clients"
ON clients FOR SELECT
USING (auth.uid() = user_id);
```

---

## 📝 Notas Importantes

1. **Migração Automática**: Acontece apenas uma vez, na primeira vez que o usuário faz login
2. **localStorage**: Ainda é usado para configurações do painel (título, logo)
3. **Sincronização**: Os dados são sincronizados em tempo real com o Supabase
4. **Offline**: O app **não funciona offline** (requer conexão com Supabase)

---

## 🎉 Conclusão

Seu projeto está **100% integrado** com o Supabase! 

Todos os dados agora são:
- ✅ Salvos no banco de dados
- ✅ Protegidos por RLS
- ✅ Sincronizados automaticamente
- ✅ Acessíveis de qualquer dispositivo

**Próximo passo**: Teste a aplicação e veja a mágica acontecer! 🚀

---

## 🔑 Credenciais Padrão

- **Email**: `filipe_thielsom@hotmail.com`
- **Senha**: `123456`

> ⚠️ **Importante**: Mude a senha após o primeiro login em produção!

