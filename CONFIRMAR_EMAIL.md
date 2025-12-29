# ✉️ Como Confirmar o Email no Supabase

## ❌ Problema

Você criou o usuário, mas recebe "Invalid login credentials" ao tentar fazer login.

**Motivo:** O email não foi confirmado automaticamente.

---

## ✅ Solução Rápida (2 minutos)

### Passo 1: Acesse o Supabase Dashboard

1. Vá em https://supabase.com/dashboard
2. Selecione seu projeto: **uaocqjbxlmjrnkzdgsub**
3. No menu lateral, clique em **"Authentication"**
4. Depois clique em **"Users"**

### Passo 2: Confirme o Email

Você verá o usuário:
- **Email:** filipe_thielsom@hotmail.com
- **ID:** 9d6598b4-86cb-4594-96eb-0302a253376a

**Para confirmar:**
1. Clique nos **3 pontinhos (⋮)** ao lado do usuário
2. Selecione **"Confirm email"**
3. Pronto! ✅

### Passo 3: Faça Login

Agora você pode fazer login na aplicação:
- **Email:** filipe_thielsom@hotmail.com
- **Senha:** 123456

---

## 🔧 Desabilitar Confirmação de Email (Opcional)

Para que novos usuários não precisem confirmar email:

### Passo 1: Acesse as Configurações

1. No Supabase Dashboard
2. Vá em **"Authentication"** → **"Providers"**
3. Clique em **"Email"**

### Passo 2: Desabilite a Confirmação

1. Role até **"Confirm email"**
2. **Desmarque** a opção "Enable email confirmations"
3. Clique em **"Save"**

Agora novos usuários serão confirmados automaticamente! 🎉

---

## 📸 Guia Visual

```
Supabase Dashboard
└── Authentication
    └── Users
        └── filipe_thielsom@hotmail.com
            └── ⋮ (3 pontinhos)
                └── ✅ Confirm email
```

---

## ⚡ Checklist Rápido

- [ ] 1. Acessar Supabase Dashboard
- [ ] 2. Ir em Authentication → Users
- [ ] 3. Clicar nos 3 pontinhos do usuário
- [ ] 4. Clicar em "Confirm email"
- [ ] 5. Voltar na aplicação
- [ ] 6. Fazer login com filipe_thielsom@hotmail.com / 123456
- [ ] 7. ✅ Sucesso!

---

**Depois disso, você poderá fazer login normalmente!** 🚀

