-- Criar tabela para cache da lição
CREATE TABLE lesson_cache (
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

-- Criar índices
CREATE INDEX idx_lesson_cache_week_number ON lesson_cache(week_number);
CREATE INDEX idx_lesson_cache_expires_at ON lesson_cache(expires_at);
