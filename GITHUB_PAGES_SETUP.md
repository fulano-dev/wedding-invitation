# 🚀 Como Publicar no GitHub Pages

## Passo 1: Criar Repositório no GitHub

1. Acesse https://github.com/new
2. Nome do repositório: `wedding-invitation` (ou qualquer nome)
3. Deixe como **Public**
4. NÃO inicialize com README
5. Clique em "Create repository"

## Passo 2: Enviar Código para o GitHub

Abra o PowerShell na pasta do projeto e execute:

```powershell
cd C:\projetos\wedding-invitation

# Inicializar git (se ainda não foi feito)
git init

# Adicionar todos os arquivos
git add .

# Fazer o primeiro commit
git commit -m "Initial commit - Wedding invitation"

# Adicionar o repositório remoto (SUBSTITUA SEU-USUARIO pelo seu usuário do GitHub)
git remote add origin https://github.com/SEU-USUARIO/wedding-invitation.git

# Enviar para o GitHub
git branch -M main
git push -u origin main
```

## Passo 3: Ativar GitHub Pages

1. Vá até o repositório no GitHub
2. Clique em **Settings** (Configurações)
3. No menu lateral, clique em **Pages**
4. Em "Source", selecione: **GitHub Actions**
5. Pronto! O deploy será automático

## Passo 4: Aguardar o Deploy

1. Vá em **Actions** no seu repositório
2. Aguarde o workflow completar (ícone verde ✓)
3. Seu site estará em: `https://SEU-USUARIO.github.io/wedding-invitation/`

## 🔄 Atualizações Futuras

Sempre que você fizer alterações:

```powershell
git add .
git commit -m "Descrição da mudança"
git push
```

O site será atualizado automaticamente!

## 🎨 Domínio Personalizado (Opcional)

Se quiser um domínio tipo `casamento-carol-marcelo.com`:

1. Compre um domínio (Registro.br, Hostinger, etc)
2. No GitHub Pages Settings, adicione o domínio customizado
3. Configure os DNS conforme instruções do GitHub

## ⚡ Alternativa Rápida: Vercel

Se preferir algo mais rápido:

```powershell
npm install -g vercel
vercel --prod
```

Você terá um link tipo: `wedding-invitation.vercel.app`

---

**Dúvidas?** O arquivo `.github/workflows/deploy.yml` já está configurado e fará tudo automaticamente! 🎉
