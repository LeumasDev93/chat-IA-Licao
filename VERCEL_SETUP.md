# Configuração do Vercel para Sistema de Lições

Este documento explica como configurar o sistema de agendamento de lições para funcionar corretamente no Vercel.

## Configurações Necessárias

### 1. Variáveis de Ambiente

No painel do Vercel, adicione as seguintes variáveis de ambiente:

```bash
CRON_SECRET=sua_chave_secreta_aqui
```

### 2. Configuração do Cron Job

O arquivo `vercel.json` já está configurado para executar o cron job automaticamente:

- **Frequência**: Todo sábado às 12:00 (0 12 * * 6)
- **Endpoint**: `/api/cron/update-lesson`
- **Duração máxima**: 60 segundos

### 3. Estrutura do Sistema

#### Arquivos Principais:

1. **`app/api/cron/update-lesson.ts`** - Endpoint do cron job
   - Executa scraping automático das lições
   - Gerencia cache em `/tmp` (Vercel) ou arquivo local (desenvolvimento)
   - Suporta atualização manual via POST

2. **`app/api/chat/scrape-lesson.ts`** - Interface para o chat
   - Carrega dados do cache
   - Solicita atualização quando necessário
   - Compatível com ambiente serverless

3. **`components/LessonStatus.tsx`** - Componente de status
   - Mostra status atual da lição
   - Permite atualização manual
   - Interface amigável para o usuário

### 4. Como Funciona

#### Agendamento Automático:
- O Vercel executa o cron job todo sábado às 12:00
- O sistema verifica se o cache está expirado
- Se necessário, faz scraping da nova lição
- Salva os dados no cache temporário

#### Atualização Manual:
- Usuários podem forçar atualização via interface
- Endpoint POST `/api/cron/update-lesson`
- Útil quando o cron job falha ou para testes

#### Cache Inteligente:
- Cache válido por 7 dias
- Diferentes locais de armazenamento:
  - Vercel: `/tmp/lesson-cache.json`
  - Desenvolvimento: `./lesson-cache.json`

### 5. Monitoramento

#### Logs do Vercel:
- Acesse o painel do Vercel
- Vá para "Functions" > "Cron Jobs"
- Monitore execuções e logs

#### Status via Interface:
- Componente `LessonStatus` mostra status em tempo real
- Indica se a lição está atualizada ou expirada
- Mostra tempo restante de validade

### 6. Troubleshooting

#### Problemas Comuns:

1. **Cron job não executa**:
   - Verifique se `CRON_SECRET` está configurado
   - Confirme se o arquivo `vercel.json` está correto
   - Verifique logs no painel do Vercel

2. **Erro de scraping**:
   - Verifique se o site da CPB está acessível
   - Confirme se os seletores CSS ainda são válidos
   - Monitore logs para erros específicos

3. **Cache não persiste**:
   - No Vercel, cache é temporário (resetado periodicamente)
   - Use atualização manual se necessário
   - Considere usar banco de dados para persistência

### 7. Desenvolvimento Local

Para testar localmente:

```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev

# Testar endpoint manualmente
curl -X POST http://localhost:3000/api/cron/update-lesson
```

### 8. Deploy

```bash
# Fazer deploy para Vercel
vercel --prod

# Ou via GitHub (recomendado)
# Conecte seu repositório no painel do Vercel
```

## Notas Importantes

- O sistema é compatível com ambiente serverless
- Não depende de `node-schedule` (não funciona no Vercel)
- Usa Vercel Cron Jobs para agendamento
- Cache é gerenciado de forma inteligente
- Interface permite monitoramento e controle manual
