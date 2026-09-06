-- Script para criar a tabela lesson_cache no Supabase
-- Execute este script no SQL Editor do Supabase em: https://supabase.com/dashboard/project/ltzbopxmezdanyjejfpy/sql

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

-- Verificar se a tabela foi criada
SELECT 
  table_name, 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'lesson_cache' 
ORDER BY ordinal_position;
