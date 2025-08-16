# 🚀 Teste Rápido do Sistema

## Como Testar

### 1. Iniciar o Servidor
```bash
npm run dev
```

### 2. Testar o Sistema
```bash
# Teste simples
npm run test:simple

# Teste completo
npm run test:lesson

# Teste do chat IA
npm run test:chat
```

### 3. Testar Manualmente via Browser
- Abra: `http://localhost:3000/api/cron` (GET - verificar status)
- Ou use curl:
```bash
# Verificar status
curl http://localhost:3000/api/cron

# Forçar atualização
curl -X POST http://localhost:3000/api/cron
```

### 4. Testar o Chat
- Abra: `http://localhost:3000`
- Digite uma mensagem no chat
- O sistema deve usar os dados do cache

## ✅ O que deve funcionar:

1. **Endpoint GET `/api/cron`** - Retorna status da lição
2. **Endpoint POST `/api/cron`** - Força atualização da lição
3. **Chat IA** - Usa dados da lição para responder
4. **Cache** - Salva dados em `lesson-cache.json`

## 🔧 Se não funcionar:

1. Verifique se o servidor está rodando
2. Verifique os logs no terminal
3. Confirme se todos os arquivos estão corretos
4. Teste com o script simples primeiro

## 📁 Arquivos Importantes:

- `app/api/cron/route.ts` - Endpoint principal
- `app/api/chat/route.ts` - Chat IA
- `app/api/chat/scrape-lesson.ts` - Interface de cache
- `lesson-cache.json` - Dados da lição
- `vercel.json` - Configuração Vercel
