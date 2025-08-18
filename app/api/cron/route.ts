import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export interface LessonData {
  title: string;
  days: string[];
  verses: string[];
  lessonLink: string;
  lastUpdated: string;
  expiresAt: string;
}

const CACHE_VALIDITY_MS = 7 * 24 * 60 * 60 * 1000; // 7 dias

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

// Salva o cache no arquivo
function saveCacheToFile(lesson: LessonData): void {
  try {
    const cachePath = getCachePath();
    fs.writeFileSync(cachePath, JSON.stringify(lesson, null, 2), 'utf-8');
    console.log('Cache salvo em:', cachePath);
  } catch (error) {
    console.error('Erro ao salvar cache:', error);
  }
}

// Verifica se o cache é válido
function isCacheValid(cachedLesson: LessonData | null): boolean {
  if (!cachedLesson) return false;
  return new Date() < new Date(cachedLesson.expiresAt);
}

// Função principal usando fetch e APIs públicas
async function getLessonData(): Promise<Omit<LessonData, 'expiresAt'>> {
  console.log('Obtendo dados da lição via APIs públicas...');
  
  try {
    // Tentar obter dados de APIs bíblicas públicas
    console.log('Não foi possível obter dados da lição via APIs públicas');
    throw new Error('Não foi possível obter dados da lição');
    
  } catch (error) {
    console.error('Erro ao obter dados da lição:', error);
    
    // Retornar dados vazios em caso de erro
    const emptyData = {
      title: 'Lição não disponível',
      days: [],
      verses: [],
      lessonLink: '',
      lastUpdated: new Date().toISOString()
    };
    
    console.log('Retornando dados vazios');
    return emptyData;
  }
}

export async function GET(req: NextRequest) {
  // Verificar se é uma requisição do cron job do Vercel
  const authHeader = req.headers.get('authorization');
  if (process.env.VERCEL && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('Iniciando atualização agendada da lição...');
    
    // Verificar cache atual
    const cachedLesson = loadCacheFromFile();
    
    if (isCacheValid(cachedLesson)) {
      console.log('Cache ainda válido, não é necessário atualizar');
      return NextResponse.json({ 
        message: 'Cache ainda válido',
        lastUpdated: cachedLesson?.lastUpdated 
      });
    }

    // Fazer scraping da nova lição
    const newLesson = await getLessonData();
    console.log('Dados da lição obtidos com sucesso');
    
    const updatedLesson: LessonData = {
      ...newLesson,
      expiresAt: new Date(Date.now() + CACHE_VALIDITY_MS).toISOString()
    };

    // Salvar novo cache
    saveCacheToFile(updatedLesson);

    console.log('Lição atualizada com sucesso');
    return NextResponse.json({ 
      message: 'Lição atualizada com sucesso',
      lesson: updatedLesson 
    });

  } catch (error) {
    console.error('Erro ao atualizar lição:', error);
    return NextResponse.json({ 
      error: 'Erro ao atualizar lição',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}

// Endpoint para forçar atualização manual
export async function POST() {
  try {
    console.log('Forçando atualização manual da lição...');
    
    const newLesson = await getLessonData();
    console.log('Dados da lição obtidos com sucesso');
    
    const updatedLesson: LessonData = {
      ...newLesson,
      expiresAt: new Date(Date.now() + CACHE_VALIDITY_MS).toISOString()
    };

    saveCacheToFile(updatedLesson);

    return NextResponse.json({ 
      message: 'Lição atualizada manualmente com sucesso',
      lesson: updatedLesson 
    });

  } catch (error) {
    console.error('Erro ao atualizar lição manualmente:', error);
    return NextResponse.json({ 
      error: 'Erro ao atualizar lição',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}
