# 🗄️ Configuração do Banco de Dados Supabase

## 📋 Passo a Passo

### 1. Acessar o SQL Editor

1. Acesse: https://app.supabase.com
2. Selecione seu projeto
3. No menu lateral, clique em **SQL Editor** (ícone 📊)
4. Clique em **New Query**

### 2. Executar o Script SQL

1. Abra o arquivo `supabase-database-setup.sql` deste projeto
2. **Copie TODO o conteúdo** do arquivo (Ctrl+A, Ctrl+C)
3. **Cole no SQL Editor** do Supabase (Ctrl+V)
4. Clique em **Run** (ou pressione Ctrl+Enter)
5. Aguarde até ver a mensagem de sucesso:

```
✅ BANCO DE DADOS CONFIGURADO COM SUCESSO!
```

### 3. Verificar se as Tabelas foram Criadas

1. No menu lateral, clique em **Table Editor** (ícone 📋)
2. Você deve ver as seguintes tabelas:
   - ✅ `clients` (clientes)
   - ✅ `resellers` (revendedores)
   - ✅ `plans` (planos)
   - ✅ `receipts` (comprovantes)
   - ✅ `pix_settings` (configurações PIX)
   - ✅ `message_templates` (templates de mensagem)

### 4. Pronto para Usar!

Agora você pode:
- ✅ Fazer login na aplicação
- ✅ Adicionar clientes, revendedores e planos
- ✅ Os dados serão salvos automaticamente no Supabase
- ✅ Cada usuário verá apenas seus próprios dados (isolamento por RLS)

---

## 📊 Estrutura das Tabelas

### 🧑‍💼 Tabela: `clients` (Clientes)

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID | Identificador único |
| name | TEXT | Nome do cliente |
| phone | TEXT | Telefone |
| plan | TEXT | Plano contratado |
| screens | INTEGER | Número de telas |
| servers | INTEGER | Número de servidores |
| created_at | TIMESTAMP | Data de criação |
| expiry_date | DATE | Data de vencimento |
| expiry_time | TEXT | Hora de vencimento |
| credentials | JSONB | Credenciais de acesso |
| extra_info | TEXT | Informações extras |
| status | TEXT | Status (active, inactive, pending, test) |
| user_id | UUID | ID do usuário (FK) |

### 👥 Tabela: `resellers` (Revendedores)

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID | Identificador único |
| name | TEXT | Nome do revendedor |
| phone | TEXT | Telefone |
| credits | INTEGER | Créditos disponíveis |
| status | TEXT | Status (active, inactive, pending, test) |
| plan | TEXT | Plano |
| created_at | TIMESTAMP | Data de criação |
| expiry_date | DATE | Data de vencimento |
| expiry_time | TEXT | Hora de vencimento |
| extra_info | TEXT | Informações extras |
| user_id | UUID | ID do usuário (FK) |

### 📦 Tabela: `plans` (Planos)

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID | Identificador único |
| name | TEXT | Nome do plano |
| price | DECIMAL | Preço |
| duration | INTEGER | Duração em dias |
| description | TEXT | Descrição |
| features | TEXT | Recursos |
| max_devices | TEXT | Dispositivos máximos |
| quality | TEXT | Qualidade |
| channels | TEXT | Canais |
| support | BOOLEAN | Suporte incluído |
| user_id | UUID | ID do usuário (FK) |

### 🧾 Tabela: `receipts` (Comprovantes)

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID | Identificador único |
| client_id | UUID | ID do cliente |
| client_name | TEXT | Nome do cliente |
| client_type | TEXT | Tipo (client, reseller) |
| plan | TEXT | Plano |
| amount | DECIMAL | Valor |
| payment_date | DATE | Data do pagamento |
| expiry_date | DATE | Data de vencimento |
| payment_method | TEXT | Método de pagamento |
| receipt_data | JSONB | Dados do comprovante |
| user_id | UUID | ID do usuário (FK) |

### 💳 Tabela: `pix_settings` (Configurações PIX)

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID | Identificador único |
| pix_key | TEXT | Chave PIX |
| pix_type | TEXT | Tipo (cpf, cnpj, email, phone, random) |
| recipient_name | TEXT | Nome do destinatário |
| user_id | UUID | ID do usuário (FK) |

### 💬 Tabela: `message_templates` (Templates de Mensagem)

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID | Identificador único |
| name | TEXT | Nome do template |
| subject | TEXT | Assunto |
| message | TEXT | Mensagem |
| type | TEXT | Tipo (expiry, welcome, renewal, custom) |
| user_id | UUID | ID do usuário (FK) |

---

## 🔒 Segurança

### Row Level Security (RLS)

Todas as tabelas estão protegidas com **Row Level Security (RLS)**:

- ✅ Cada usuário vê apenas **seus próprios dados**
- ✅ Não é possível acessar dados de outros usuários
- ✅ As políticas são aplicadas automaticamente
- ✅ Proteção contra acesso não autorizado

### Políticas Configuradas

Para cada tabela, foram criadas políticas de:
- 👁️ **SELECT**: Ver apenas seus dados
- ➕ **INSERT**: Criar apenas com seu user_id
- ✏️ **UPDATE**: Atualizar apenas seus dados
- 🗑️ **DELETE**: Deletar apenas seus dados

---

## ❓ Problemas Comuns

### "relation does not exist"
- Execute o script SQL novamente
- Verifique se você está no projeto correto

### "permission denied"
- Verifique se você está logado
- Certifique-se de que o user_id está sendo enviado corretamente

### "Dados não aparecem"
- Verifique se você está logado na aplicação
- Os dados são isolados por usuário (RLS)
- Cada usuário vê apenas o que criou

---

## ✅ Checklist de Verificação

- [ ] Script SQL executado com sucesso
- [ ] 6 tabelas criadas no Table Editor
- [ ] RLS habilitado em todas as tabelas
- [ ] Usuário criado (via `supabase-setup.sql`)
- [ ] `.env` configurado com URL e chave
- [ ] Servidor reiniciado após configurar `.env`
- [ ] Login funcionando na aplicação

---

## 🚀 Próximos Passos

1. ✅ Faça login na aplicação
2. ✅ Adicione alguns clientes de teste
3. ✅ Crie planos
4. ✅ Verifique se os dados aparecem no Supabase
5. ✅ Teste todas as funcionalidades

---

**Tudo pronto! Seu banco de dados está configurado! 🎉**

