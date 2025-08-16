import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
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
const CPB_LESSON_URL = "https://mais.cpb.com.br/licao-adultos/";
const PUPPETEER_OPTIONS = {
  headless: true,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--disable-web-security',
    '--disable-features=VizDisplayCompositor'
  ]
};

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

// Função principal de scraping
async function scrapeLessonData(): Promise<Omit<LessonData, 'expiresAt'>> {
  console.log('Iniciando scraping da lição...');
  
  const browser = await puppeteer.launch(PUPPETEER_OPTIONS);
  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    await page.setViewport({ width: 1920, height: 1080 });

    console.log('Navegando para:', CPB_LESSON_URL);
    await page.goto(CPB_LESSON_URL, { waitUntil: 'networkidle2', timeout: 60000 });
    
    // Obtém o link da lição
    const lessonLink = await page.evaluate(() => {
      const link = document.querySelector('a[href*="/licao/"]:not([href*="#"])');
      return link?.getAttribute('href') || window.location.href;
    });

    console.log('Link da lição encontrado:', lessonLink);

    // Raspa os dados da lição
    await page.goto(lessonLink, { waitUntil: 'networkidle2', timeout: 60000 });
    
    const lessonData = await page.evaluate(() => {
      const getText = (selector: string) => 
        document.querySelector(selector)?.textContent?.trim() || '';

      const title = getText('h1') || 'Lição da Escola Sabatina';
      
      const days = [
        '#licaoSabado', '#licaoDomingo', '#licaoSegunda',
        '#licaoTerca', '#licaoQuarta', '#licaoQuinta', '#licaoSexta'
      ].map(getText).filter(Boolean);

      const verses = Array.from(document.querySelectorAll('.versiculo'))
        .map(el => el.textContent?.trim())
        .filter(Boolean) as string[];

      return {
        title,
        days,
        verses,
        lessonLink: window.location.href,
        lastUpdated: new Date().toISOString()
      };
    });

    console.log('Dados da lição extraídos com sucesso');
    return lessonData;
  } finally {
    await browser.close();
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
    const newLesson = await scrapeLessonData();
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
    
    const newLesson = await scrapeLessonData();
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
