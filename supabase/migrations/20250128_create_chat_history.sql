-- Criar tabela para histórico de chat
CREATE TABLE chat_history (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chat_id TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT 'Nova conversa',
  messages JSONB NOT NULL DEFAULT '[]',
  lesson_context JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX idx_chat_history_user_id ON chat_history(user_id);
CREATE INDEX idx_chat_history_chat_id ON chat_history(chat_id);
CREATE INDEX idx_chat_history_updated_at ON chat_history(updated_at DESC);
CREATE INDEX idx_chat_history_user_active ON chat_history(user_id, is_active);

-- Criar constraint única para chat_id por usuário
CREATE UNIQUE INDEX idx_chat_history_user_chat_unique ON chat_history(user_id, chat_id);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_chat_history_updated_at 
    BEFORE UPDATE ON chat_history 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
