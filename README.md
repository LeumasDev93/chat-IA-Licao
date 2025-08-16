# Chat IA - Lições da Escola Sabatina

Sistema inteligente para estudo das Lições da Escola Sabatina com atualização automática de conteúdo e compatibilidade total com Vercel.

## 🚀 Funcionalidades

- **Chat IA Inteligente**: Respostas baseadas na lição atual da semana
- **Atualização Automática**: Sistema de cron job que atualiza lições todo sábado
- **Cache Inteligente**: Sistema de cache que funciona tanto localmente quanto no Vercel
- **Interface Moderna**: Design responsivo com suporte a tema escuro/claro
- **Compatibilidade Vercel**: Totalmente otimizado para deploy no Vercel

## 🛠️ Tecnologias

- **Next.js 15** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Puppeteer** - Web scraping
- **Vercel Cron Jobs** - Agendamento automático
- **Google Gemini AI** - Processamento de linguagem natural

## 📋 Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Conta no Vercel (para deploy)

## 🚀 Instalação

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd chat_ia
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp env.example .env.local
# Edite o arquivo .env.local com suas configurações
```

4. **Execute em desenvolvimento**
```bash
npm run dev
```

5. **Teste o sistema de lições**
```bash
npm run test:lesson
```

## ⚙️ Configuração do Vercel

### 1. Variáveis de Ambiente

No painel do Vercel, configure:

```bash
CRON_SECRET=sua_chave_secreta_aqui
```

### 2. Deploy

```bash
# Deploy via CLI
vercel --prod

# Ou conecte seu repositório no painel do Vercel
```

### 3. Monitoramento

- Acesse **Functions > Cron Jobs** no painel do Vercel
- Monitore execuções automáticas (sábados às 12:00)
- Verifique logs para troubleshooting

## 📁 Estrutura do Projeto

```
chat_ia/
├── app/
│   ├── api/
│   │   ├── chat/
│   │   │   ├── route.ts              # API do chat
│   │   │   └── scrape-lesson.ts      # Interface de lições
│   │   └── cron/
│   │       └── update-lesson.ts      # Cron job de atualização
│   └── page.tsx                      # Página principal
├── components/
│   ├── LessonStatus.tsx              # Status das lições
│   └── LessonStatusExample.tsx       # Exemplo de integração
├── scripts/
│   └── test-lesson-update.js         # Script de teste
├── vercel.json                       # Configuração Vercel
└── VERCEL_SETUP.md                   # Documentação detalhada
```

## 🔄 Sistema de Atualização

### Agendamento Automático
- **Frequência**: Todo sábado às 12:00
- **Endpoint**: `/api/cron/update-lesson`
- **Duração**: Máximo 60 segundos
- **Cache**: Válido por 7 dias

### Atualização Manual
- Interface web para forçar atualização
- Endpoint POST `/api/cron/update-lesson`
- Útil para testes e correções

### Cache Inteligente
- **Desenvolvimento**: `./lesson-cache.json`
- **Vercel**: `/tmp/lesson-cache.json`
- **Validação**: Verificação automática de expiração

## 🧪 Testes

```bash
# Teste do sistema de lições
npm run test:lesson

# Teste manual via curl
curl -X POST http://localhost:3000/api/cron/update-lesson
```

## 📊 Monitoramento

### Status da Lição
- Componente `LessonStatus` mostra status em tempo real
- Indica se lição está atualizada ou expirada
- Mostra tempo restante de validade

### Logs
- Logs detalhados no painel do Vercel
- Console logs para debugging
- Tratamento de erros robusto

## 🔧 Troubleshooting

### Problemas Comuns

1. **Cron job não executa**
   - Verifique `CRON_SECRET` no Vercel
   - Confirme configuração do `vercel.json`
   - Monitore logs no painel

2. **Erro de scraping**
   - Verifique conectividade com site da CPB
   - Confirme seletores CSS ainda válidos
   - Verifique logs de erro

3. **Cache não persiste**
   - No Vercel, cache é temporário
   - Use atualização manual se necessário
   - Considere banco de dados para persistência

## 📚 Documentação Adicional

- [VERCEL_SETUP.md](./VERCEL_SETUP.md) - Configuração detalhada do Vercel
- [Documentação Next.js](https://nextjs.org/docs)
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🆘 Suporte

Para suporte e dúvidas:
- Abra uma [issue](../../issues)
- Consulte a [documentação](./VERCEL_SETUP.md)
- Verifique os [logs do Vercel](https://vercel.com/dashboard)
