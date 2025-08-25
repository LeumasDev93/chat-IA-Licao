-- Adicionar campo para armazenar o conteúdo geral da lição
ALTER TABLE lesson_cache 
ADD COLUMN lesson_content TEXT;

-- Adicionar comentário explicativo
COMMENT ON COLUMN lesson_cache.lesson_content IS 'Conteúdo geral da lição extraído do site oficial para uso da IA';

-- Criar índice para otimizar buscas por conteúdo
CREATE INDEX idx_lesson_cache_content ON lesson_cache(lesson_content) WHERE lesson_content IS NOT NULL;
