# 🔗 Configurar URL de Redirecionamento no Supabase

## ❌ Problema

O link de recuperação/magic link está redirecionando para `pitbulltv.com.br` ao invés de `localhost:3000`.

---

## ✅ Solução: Configurar Site URL

### Passo 1: Acesse as Configurações

1. Vá em https://supabase.com/dashboard
2. Selecione seu projeto
3. No menu lateral, clique em **"Authentication"**
4. Depois clique em **"URL Configuration"**

### Passo 2: Configure as URLs

Configure as seguintes URLs:

#### **Site URL** (URL principal da aplicação)
Para desenvolvimento:
```
http://localhost:3000
```

Para produção (depois):
```
https://pitbulltv.com.br
```

#### **Redirect URLs** (URLs permitidas para redirecionamento)
Adicione ambas:
```
http://localhost:3000/**
https://pitbulltv.com.br/**
```

### Passo 3: Salvar

1. Clique em **"Save"**
2. Aguarde alguns segundos para aplicar

---

## 🔄 Como Fazer Login Agora

### Opção 1: Usar Magic Link (Recomendado)

1. No Supabase Dashboard, vá em **Authentication** → **Users**
2. Clique nos **3 pontinhos (⋮)** do seu usuário
3. Clique em **"Send Magic Link"**
4. Verifique seu email (filipe_thielsom@hotmail.com)
5. Clique no link do email
6. Você será redirecionado e logado automaticamente!

### Opção 2: Confirmar Email Manualmente

1. No Supabase Dashboard, vá em **Authentication** → **Users**
2. Clique nos **3 pontinhos (⋮)** do seu usuário
3. Clique em **"Confirm email"**
4. Volte na aplicação
5. Faça login com:
   - Email: `filipe_thielsom@hotmail.com`
   - Senha: `123456`

---

## 📝 Configuração Completa

### Site URL
```
http://localhost:3000
```

### Redirect URLs (uma por linha)
```
http://localhost:3000/**
https://pitbulltv.com.br/**
http://localhost:3000/auth/callback
https://pitbulltv.com.br/auth/callback
```

### Additional Redirect URLs (opcional)
```
http://localhost:5173/**
http://localhost:5174/**
```

---

## 🎯 Checklist

- [ ] 1. Acessar Supabase Dashboard
- [ ] 2. Ir em Authentication → URL Configuration
- [ ] 3. Definir Site URL como `http://localhost:3000`
- [ ] 4. Adicionar Redirect URLs
- [ ] 5. Salvar
- [ ] 6. Aguardar 10 segundos
- [ ] 7. Tentar login novamente ou solicitar novo Magic Link

---

## 💡 Dica Rápida

**Para fazer login agora mesmo sem esperar:**

No Supabase Dashboard:
1. **Authentication** → **Users**
2. Seu usuário: `filipe_thielsom@hotmail.com`
3. **⋮** → **"Confirm email"**
4. Voltar na app e fazer login com a senha `123456`

---

**Pronto!** Depois disso, os links de email funcionarão corretamente! 🚀

