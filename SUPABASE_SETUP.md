# 🗄️ Configuração do Supabase - Sistema de Histórico

## 📋 Pré-requisitos

1. Conta no Supabase (https://supabase.com)
2. Projeto criado no Supabase
3. Credenciais do projeto (URL e chave anônima)

## 🚀 Configuração Inicial

### 1. Criar Projeto no Supabase

1. Acesse https://supabase.com
2. Clique em "New Project"
3. Escolha sua organização
4. Digite um nome para o projeto
5. Defina uma senha para o banco de dados
6. Escolha a região mais próxima
7. Clique em "Create new project"

### 2. Obter Credenciais

1. No painel do Supabase, vá em **Settings** > **API**
2. Copie:
   - **Project URL** (NEXT_PUBLIC_SUPABASE_URL)
   - **anon public** key (NEXT_PUBLIC_SUPABASE_ANON_KEY)

### 3. Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_projeto
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima

# Outras variáveis
CRON_SECRET=sua_chave_secreta_para_cron
```

## 🗃️ Configurar Banco de Dados

### 1. Executar Migração

1. No painel do Supabase, vá em **SQL Editor**
2. Clique em **New query**
3. Cole o conteúdo do arquivo `app/supabase/migrations/20250127_create_chat_history.sql`
4. Clique em **Run**

### 2. Verificar Estrutura

Após executar a migração, você deve ter:

**Tabelas criadas:**
- `user_chats` - Armazena os chats dos usuários
- `chat_messages` - Armazena mensagens individuais (opcional)

**Views criadas:**
- `chat_with_messages` - View otimizada para consultas

**Políticas RLS:**
- Políticas de segurança para cada tabela
- Usuários só podem acessar seus próprios dados

**Índices:**
- Índices para melhor performance nas consultas

## 🔐 Configurar Autenticação

### 1. Habilitar Auth

1. No painel do Supabase, vá em **Authentication** > **Settings**
2. Configure os provedores de autenticação desejados:
   - **Email** (recomendado)
   - **Google**
   - **GitHub**
   - Outros...

### 2. Configurar URLs

Em **Authentication** > **URL Configuration**:

```
Site URL: http://localhost:3000 (desenvolvimento)
Redirect URLs: 
- http://localhost:3000/auth/callback
- https://seu-dominio.vercel.app/auth/callback (produção)
```

## 🧪 Testar Configuração

### 1. Teste Local

```bash
# Testar estrutura do banco
npm run test:history

# Testar sistema completo
npm run dev
npm run test:chat
```

### 2. Verificar no Supabase

1. **Table Editor** - Verificar se as tabelas foram criadas
2. **Authentication** - Verificar se usuários podem se registrar
3. **Logs** - Verificar se há erros nas operações

## 🔧 Funcionalidades Implementadas

### ✅ Sistema de Histórico Completo

1. **Gravação Automática**
   - Salva mensagens automaticamente
   - Debounce de 2 segundos para otimizar performance
   - Sincronização em tempo real

2. **Listagem Inteligente**
   - Ordenação por data de atualização
   - Busca por título e conteúdo
   - Preview da última mensagem
   - Contagem de mensagens

3. **Visualização Detalhada**
   - Títulos editáveis
   - Informações de data/hora
   - Contexto da lição
   - Interface responsiva

4. **Gerenciamento**
   - Criar novos chats
   - Editar títulos
   - Deletar conversas
   - Limpar mensagens

### 🔄 Sincronização em Tempo Real

- **Realtime Subscriptions** - Atualizações instantâneas
- **Debounce** - Evita muitas requisições
- **Cache Local** - Performance otimizada
- **Fallback** - Funciona offline

### 🛡️ Segurança

- **Row Level Security (RLS)** - Usuários só veem seus dados
- **Políticas Granulares** - Controle fino de acesso
- **Validação de Dados** - Tipos e constraints
- **Auditoria** - Timestamps automáticos

## 🚀 Deploy no Vercel

### 1. Configurar Variáveis no Vercel

1. No painel do Vercel, vá em **Settings** > **Environment Variables**
2. Adicione as mesmas variáveis do `.env.local`

### 2. Deploy

```bash
vercel --prod
```

### 3. Verificar

1. Teste o sistema em produção
2. Verifique os logs no Vercel
3. Monitore o uso no Supabase

## 📊 Monitoramento

### Supabase Dashboard

1. **Database** - Monitorar uso do banco
2. **Auth** - Verificar usuários ativos
3. **Logs** - Identificar problemas
4. **Edge Functions** - Se usar funções serverless

### Métricas Importantes

- **Chats criados por dia**
- **Mensagens por chat**
- **Usuários ativos**
- **Performance das consultas**

## 🔧 Troubleshooting

### Problemas Comuns

1. **Erro de autenticação**
   - Verificar URLs de redirecionamento
   - Confirmar chaves do Supabase

2. **Dados não salvam**
   - Verificar políticas RLS
   - Confirmar se usuário está autenticado

3. **Performance lenta**
   - Verificar índices
   - Otimizar consultas
   - Ajustar debounce

4. **Realtime não funciona**
   - Verificar subscriptions
   - Confirmar configuração de canais

### Logs Úteis

```bash
# Ver logs do Supabase
supabase logs

# Ver logs do Next.js
npm run dev

# Testar conexão
npm run test:history
```

## 📚 Recursos Adicionais

- [Documentação do Supabase](https://supabase.com/docs)
- [Guia de RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [Realtime Subscriptions](https://supabase.com/docs/guides/realtime)
- [Next.js + Supabase](https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs)

---

🎉 **Sistema de histórico configurado e funcionando!**
