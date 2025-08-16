import fs from 'fs';
import path from 'path';
import { LessonData } from '../cron/route';

// Função para obter o caminho do cache baseado no ambiente
function getCachePath(): string {
  if (process.env.VERCEL) {
    // No Vercel, usar /tmp para arquivos temporários
    return '/tmp/lesson-cache.json';
  }
  // Em desenvolvimento, usar o diretório atual
  return path.join(process.cwd(), 'lesson-cache.json');
}

// Carrega o cache do arquivo
function loadCacheFromFile(): LessonData | null {
  try {
    const cachePath = getCachePath();
    if (fs.existsSync(cachePath)) {
      const cachedData = JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
      console.log('Cache carregado do arquivo:', cachePath);
      return cachedData;
    }
  } catch (error) {
    console.error('Erro ao carregar cache:', error);
  }
  return null;
}

// Verifica se o cache é válido
function isCacheValid(cachedLesson: LessonData | null): boolean {
  if (!cachedLesson) return false;
  return new Date() < new Date(cachedLesson.expiresAt);
}

let cachedLesson: LessonData | null = null;

// Inicialização
cachedLesson = loadCacheFromFile();

export async function getCachedLesson(): Promise<LessonData> {
  // Recarregar cache do arquivo a cada chamada para garantir dados atualizados
  cachedLesson = loadCacheFromFile();
  
  if (isCacheValid(cachedLesson) && cachedLesson) {
    console.log("Retornando lição do cache");
    return cachedLesson;
  }

  console.log("Cache expirado ou inexistente, fazendo nova raspagem...");
  
  try {
    // Fazer requisição para o endpoint de atualização
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000';
    
    const response = await fetch(`${baseUrl}/api/cron`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erro ao atualizar lição: ${response.statusText}`);
    }

    await response.json();
    
    // Recarregar cache após atualização
    cachedLesson = loadCacheFromFile();
    
    if (cachedLesson) {
      return cachedLesson;
    }
    
    throw new Error('Falha ao carregar lição atualizada');
    
  } catch (error) {
    console.error("Erro ao raspar lição:", error);
    if (cachedLesson) {
      console.log("Usando cache anterior como fallback");
      return cachedLesson;
    }
    throw error;
  }
}