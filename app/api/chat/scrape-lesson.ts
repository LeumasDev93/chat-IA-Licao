import puppeteer from 'puppeteer';
import schedule from 'node-schedule';
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

const CACHE_VALIDITY_MS = 7 * 24 * 60 * 60 * 1000;
const CPB_LESSON_URL = "https://mais.cpb.com.br/licao-adultos/";
const PUPPETEER_OPTIONS = {
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
};
const CACHE_FILE = path.join(__dirname, 'lesson-cache.json');
console.log(CACHE_FILE);
let cachedLesson: LessonData | null = null;

// Carrega o cache do arquivo
function loadCacheFromFile(): void {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      cachedLesson = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
      console.log('Cache carregado do arquivo');
    }
  } catch (error) {
    console.error('Erro ao carregar cache:', error);
  }
}

// Salva o cache no arquivo
function saveCacheToFile(lesson: LessonData): void {
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(lesson), 'utf-8');
  } catch (error) {
    console.error('Erro ao salvar cache:', error);
  }
}

// Agenda o scraping semanal
function scheduleWeeklyScraping(): void {
  schedule.scheduleJob('0 12 * * 6', async () => {
    console.log('Iniciando raspagem agendada...');
    try {
      const newLesson = await scrapeLessonData();
      cachedLesson = {
        ...newLesson,
        expiresAt: new Date(Date.now() + CACHE_VALIDITY_MS).toISOString()
      };
      saveCacheToFile(cachedLesson);
      console.log('Raspagem concluída e cache atualizado');
    } catch (error) {
      console.error('Falha na raspagem agendada:', error);
    }
  });
  console.log('Agendamento configurado para sábados ao meio-dia');
}

// Verifica se o cache é válido
function isCacheValid(): boolean {
  return !!cachedLesson && new Date() < new Date(cachedLesson.expiresAt);
}

// Inicialização
loadCacheFromFile();
scheduleWeeklyScraping();

export async function getCachedLesson(): Promise<LessonData> {
  if (isCacheValid() && cachedLesson) {
    console.log("Retornando lição do cache" , cachedLesson);

    return cachedLesson;
  }

  console.log("Cache expirado, fazendo nova raspagem...");
  try {
    const newLesson = await scrapeLessonData();
    cachedLesson = {
      ...newLesson,
      expiresAt: new Date(Date.now() + CACHE_VALIDITY_MS).toISOString()
    };
    saveCacheToFile(cachedLesson);
    return cachedLesson;
  } catch (error) {
    console.error("Erro ao raspar lição:", error);
    if (cachedLesson) {
      console.log("Usando cache anterior como fallback");
      return cachedLesson;
    }
    throw error;
  }
}

// Função principal de scraping
async function scrapeLessonData(): Promise<Omit<LessonData, 'expiresAt'>> {
  const browser = await puppeteer.launch(PUPPETEER_OPTIONS);
  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

    // Obtém o link da lição
    await page.goto(CPB_LESSON_URL, { waitUntil: 'networkidle2', timeout: 60000 });
    const lessonLink = await page.evaluate(() => {
      const link = document.querySelector('a[href*="/licao/"]:not([href*="#"])');
      return link?.getAttribute('href') || CPB_LESSON_URL;
    });

    // Raspa os dados da lição
    await page.goto(lessonLink, { waitUntil: 'networkidle2', timeout: 60000 });
    const lessonData = await page.evaluate(() => {
      const getText = (selector: string) => 
        document.querySelector(selector)?.textContent?.trim() || '';

      return {
        title: getText('h1') || 'Lição da Escola Sabatina',
        days: [
          '#licaoSabado', '#licaoDomingo', '#licaoSegunda',
          '#licaoTerca', '#licaoQuarta', '#licaoQuinta', '#licaoSexta'
        ].map(getText).filter(Boolean),
        verses: Array.from(document.querySelectorAll('.versiculo'))
          .map(el => el.textContent?.trim())
          .filter(Boolean) as string[],
        lessonLink: window.location.href,
        lastUpdated: new Date().toISOString()
      };
    });

    return lessonData;
  } finally {
    await browser.close();
  }
}