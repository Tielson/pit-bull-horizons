# 🗄️ Criar Tabelas no Banco de Dados

## ❌ Problema

Você está logado, mas recebe erros:
```
permission denied for table clients
permission denied for table resellers
permission denied for table plans
permission denied for table receipts
```

**Motivo:** As tabelas ainda não foram criadas no banco de dados!

---

## ✅ Solução: Executar Script SQL (5 minutos)

### Passo 1: Abrir o SQL Editor

1. Acesse https://supabase.com/dashboard
2. Selecione seu projeto
3. No menu lateral, clique em **"SQL Editor"**
4. Clique em **"New Query"** (botão verde)

### Passo 2: Colar o Script SQL

1. Abra o arquivo: `supabase-database-setup.sql` (na raiz do projeto)
2. **Copie TODO o conteúdo** (Ctrl+A, Ctrl+C)
3. **Cole** no SQL Editor do Supabase (Ctrl+V)

### Passo 3: Executar

1. Clique no botão **"Run"** (ou pressione Ctrl+Enter)
2. Aguarde a execução (leva cerca de 10-15 segundos)
3. Você verá mensagens de sucesso na parte inferior

### Passo 4: Verificar

1. Vá em **"Table Editor"** (menu lateral)
2. Você deve ver as seguintes tabelas:
   - ✅ `clients`
   - ✅ `resellers`
   - ✅ `plans`
   - ✅ `receipts`
   - ✅ `pix_settings`
   - ✅ `message_templates`

### Passo 5: Testar a Aplicação

1. Volte para a aplicação: http://localhost:3000
2. Recarregue a página (F5)
3. Você deve ver o dashboard sem erros! 🎉

---

## 📋 Checklist Rápido

- [ ] 1. Acessar Supabase Dashboard
- [ ] 2. Ir em SQL Editor
- [ ] 3. Clicar em "New Query"
- [ ] 4. Copiar conteúdo de `supabase-database-setup.sql`
- [ ] 5. Colar no SQL Editor
- [ ] 6. Clicar em "Run"
- [ ] 7. Aguardar execução
- [ ] 8. Verificar em "Table Editor" se as tabelas foram criadas
- [ ] 9. Recarregar a aplicação
- [ ] 10. ✅ Sucesso!

---

## 🎯 O que o Script Faz

O script `supabase-database-setup.sql` cria:

### Tabelas
- **clients** - Armazena clientes
- **resellers** - Armazena revendedores
- **plans** - Armazena planos
- **receipts** - Armazena comprovantes
- **pix_settings** - Configurações PIX
- **message_templates** - Templates de mensagens

### Segurança (RLS - Row Level Security)
- Políticas que garantem que usuários só vejam seus próprios dados
- Triggers que associam automaticamente os dados ao usuário logado

### Funcionalidades
- Campos com valores padrão
- Timestamps automáticos
- Validações de dados
- Índices para performance

---

## 💡 Dica

**Localização do arquivo:**
```
C:\Users\filip\Downloads\horizons-export-bc967c05-dd1b-4926-a823-a13586ebddbb\supabase-database-setup.sql
```

Você pode abrir este arquivo no VS Code e copiar todo o conteúdo!

---

## 🚨 Importante

**NÃO** pule este passo! Sem as tabelas criadas, a aplicação não funcionará.

---

## 📸 Guia Visual

```
Supabase Dashboard
└── SQL Editor
    └── New Query
        └── [Cole o script aqui]
            └── Run
                └── ✅ Tabelas criadas!
```

---

**Depois de executar o script, a aplicação funcionará perfeitamente!** 🚀

Todas as operações (adicionar cliente, plano, etc.) serão salvas no banco de dados do Supabase.

