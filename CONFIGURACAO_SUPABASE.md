# 🚀 Configuração do Supabase - Projeto: ltzbopxmezdanyjejfpy

## 📋 Passo a Passo Completo

### 1. Obter as Chaves do Supabase

1. Acesse: **https://supabase.com/dashboard/project/ltzbopxmezdanyjejfpy**
2. Clique em **Settings** (ícone de engrenagem)
3. Clique em **API**
4. Copie as seguintes informações:

   - **Project URL**: `https://ltzbopxmezdanyjejfpy.supabase.co`
   - **anon public**: (chave pública)
   - **service_role**: (clique em "Show" para ver a chave secreta)

### 2. Criar Arquivo .env.local

Crie um arquivo `.env.local` na raiz do projeto com:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://ltzbopxmezdanyjejfpy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_public_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role_aqui

# Outras variáveis
CRON_SECRET=sua_chave_secreta_aqui
VERCEL_URL=
```

### 3. Criar a Tabela no Supabase

1. Acesse: **https://supabase.com/dashboard/project/ltzbopxmezdanyjejfpy/sql**
2. Clique em **New query**
3. Cole este SQL:

```sql
-- Criar tabela para cache da lição
CREATE TABLE IF NOT EXISTS lesson_cache (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  days JSONB NOT NULL,
  verses JSONB NOT NULL,
  lesson_link TEXT NOT NULL,
  week_number INTEGER NOT NULL,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_lesson_cache_week_number ON lesson_cache(week_number);
CREATE INDEX IF NOT EXISTS idx_lesson_cache_expires_at ON lesson_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_lesson_cache_created_at ON lesson_cache(created_at);
```

4. Clique em **Run**

### 4. Testar a Conexão

Execute no terminal:

```bash
npm run test-supabase
```

### 5. Verificar se Está Funcionando

1. Inicie o servidor: `npm run dev`
2. Faça uma pergunta no chat sobre a lição
3. Verifique os logs no terminal
4. No Supabase, vá em **Table Editor** → **lesson_cache** para ver os dados salvos

## ✅ Logs Esperados

```
Iniciando busca de dados da lição...
Buscando dados da lição no Supabase...
Lição não encontrada, tentando scraping real...
Iniciando scraping real do site da CPB...
HTML obtido com sucesso, tamanho: 12345
Dados extraídos com sucesso: { title: "...", daysCount: 7, versesCount: 5 }
Lição salva no Supabase com sucesso
Retornando lição extraída do site
```

## 🔧 Troubleshooting

### Erro: "Variáveis do Supabase não configuradas"
- Verifique se o arquivo `.env.local` existe
- Confirme se as variáveis estão corretas
- Reinicie o servidor: `npm run dev`

### Erro: "relation 'lesson_cache' does not exist"
- Execute o script SQL no Supabase
- Verifique se a tabela foi criada em **Table Editor**

### Erro: "permission denied"
- Verifique se está usando a **service_role** key (não a anon key)
- Confirme se as chaves estão corretas

## 📊 Monitoramento

Para ver os dados salvos:
1. Supabase Dashboard → **Table Editor**
2. Selecione a tabela **lesson_cache**
3. Veja os dados em tempo real

Para ver logs detalhados:
1. Supabase Dashboard → **Logs**
2. Filtre por "API" para ver as requisições

## 🎯 Links Úteis

- **Dashboard do Projeto**: https://supabase.com/dashboard/project/ltzbopxmezdanyjejfpy
- **SQL Editor**: https://supabase.com/dashboard/project/ltzbopxmezdanyjejfpy/sql
- **Table Editor**: https://supabase.com/dashboard/project/ltzbopxmezdanyjejfpy/editor
- **API Settings**: https://supabase.com/dashboard/project/ltzbopxmezdanyjejfpy/settings/api
