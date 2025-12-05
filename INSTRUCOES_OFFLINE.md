# Como Usar o Convite de Casamento Offline

O aplicativo foi compilado e está pronto para ser usado offline no celular!

## 📱 Opção 1: Enviar Pasta Zipada (Recomendado)

1. **Compacte a pasta `dist`**:
   - Vá até `C:\projetos\wedding-invitation\dist`
   - Selecione todos os arquivos dentro da pasta
   - Clique com botão direito → "Enviar para" → "Pasta compactada"
   - Nomeie como `convite-casamento.zip`

2. **Envie aos noivos**:
   - Envie o arquivo `convite-casamento.zip` por WhatsApp, Email, Google Drive, etc.

3. **Instruções para os noivos**:
   - Baixe e extraia o arquivo ZIP no celular
   - Abra o arquivo `index.html` com qualquer navegador
   - Funciona 100% offline!

## 🌐 Opção 2: Hospedagem Online Grátis

### Vercel (Mais Fácil):
```bash
# Instale o Vercel CLI
npm install -g vercel

# Faça deploy
cd C:\projetos\wedding-invitation
vercel --prod
```

### Netlify:
```bash
# Instale o Netlify CLI
npm install -g netlify-cli

# Faça deploy
cd C:\projetos\wedding-invitation
netlify deploy --prod --dir=dist
```

### GitHub Pages:
1. Crie um repositório no GitHub
2. Faça upload da pasta `dist`
3. Ative GitHub Pages nas configurações

## 📂 Estrutura de Arquivos

A pasta `dist` contém:
- `index.html` - Arquivo principal (abrir este!)
- `assets/` - CSS, JavaScript e imagens
- Tudo está otimizado e minificado

## ✅ Vantagens da Versão Estática

- ✓ Funciona 100% offline
- ✓ Não precisa de servidor
- ✓ Carregamento instantâneo
- ✓ Pode ser aberto em qualquer celular/computador
- ✓ Não expira

## 🎯 Testando Localmente

Para testar antes de enviar:
```bash
cd C:\projetos\wedding-invitation
npm run preview
```

Depois acesse: http://localhost:4173

---

**Dica**: Se os noivos tiverem dificuldade em abrir arquivos ZIP no celular, hospede online (opção 2) e compartilhe apenas o link!
