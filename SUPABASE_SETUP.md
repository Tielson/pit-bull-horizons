# 🚀 Configuração do Supabase

## Passo 1: Criar o Projeto no Supabase

1. Acesse: https://app.supabase.com
2. Clique em "New Project"
3. Preencha os dados:
   - **Project name**: Nome do seu projeto
   - **Database Password**: Crie uma senha forte (guarde bem!)
   - **Region**: Escolha a região mais próxima (ex: South America - São Paulo)
4. Clique em "Create new project"
5. Aguarde ~2 minutos até o projeto ser criado

## Passo 2: Obter as Credenciais

1. No dashboard do projeto, vá em **Settings** (⚙️) > **API**
2. Copie as seguintes informações:
   - **Project URL** (algo como: `https://xxxxx.supabase.co`)
   - **anon public** key (chave longa que começa com `eyJ...`)

## Passo 3: Configurar o Arquivo `.env`

1. Na raiz do projeto, crie um arquivo chamado `.env`
2. Adicione as credenciais:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxxxxxxxxxxxxxxxxxxxx
```

3. Salve o arquivo

## Passo 4: Criar o Usuário no Banco

1. No dashboard do Supabase, vá em **SQL Editor** (menu lateral)
2. Clique em **New Query**
3. Abra o arquivo `supabase-setup.sql` deste projeto
4. Copie todo o conteúdo e cole no SQL Editor
5. Clique em **Run** (ou pressione Ctrl+Enter)
6. Você verá a mensagem: "Usuário criado com sucesso!"

## Passo 5: Reiniciar o Servidor

1. Pare o servidor de desenvolvimento (Ctrl+C no terminal)
2. Inicie novamente: `npm run dev`
3. A aplicação estará disponível em: http://localhost:3000

## Passo 6: Fazer Login

Use as credenciais:
- **Usuário**: `tielson`
- **Senha**: `123456`

---

## ✅ Verificar se Funcionou

Ao recarregar a página, abra o console do navegador (F12) e procure por:

```
🔍 TESTE DE CONEXÃO SUPABASE
✅ CONEXÃO ESTABELECIDA COM SUCESSO!
🎉 RESULTADO: Conexão com Supabase funcionando!
```

Se aparecer isso, está tudo funcionando! 🎉

---

## ❌ Problemas Comuns

### "Variáveis de ambiente não configuradas"
- Verifique se o arquivo `.env` existe na raiz do projeto
- Verifique se as variáveis começam com `VITE_`
- Reinicie o servidor após criar/editar o `.env`

### "Erro ao conectar com Supabase"
- Verifique se a URL está correta (sem espaços ou aspas)
- Verifique se a chave está correta e completa
- Verifique se o projeto Supabase está ativo (não pausado)

### "Credenciais inválidas" ao fazer login
- Execute o script SQL novamente
- Verifique se você está usando `tielson` como usuário (sem @app.local)
- A senha é `123456`

---

## 📝 Notas Importantes

- O arquivo `.env` **NÃO** deve ser commitado no Git (já está no `.gitignore`)
- A senha `123456` é apenas para testes. Altere depois em produção.
- Para adicionar mais usuários, você pode usar o painel de Authentication do Supabase

---

## 🔧 Comandos Úteis

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Build para produção
npm run build
```

