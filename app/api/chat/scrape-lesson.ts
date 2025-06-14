import puppeteer from 'puppeteer';

export interface LessonData {
  title: string;
  days: string[];
  verses: string[];
  lessonLink: string;
  lastUpdated: string;
}

const CACHE_VALIDITY_MS = 7 * 24 * 60 * 60 * 1000;
const CPB_LESSON_URL = "https://mais.cpb.com.br/licao-adultos/";
const PUPPETEER_OPTIONS = {
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
};

let cachedLesson: LessonData | null = null;

function getCurrentDate(): string {
  return new Date().toISOString();
}

function isCacheValid(cache: LessonData | null): boolean {
  if (!cache) return false;
  return (Date.now() - new Date(cache.lastUpdated).getTime()) < CACHE_VALIDITY_MS;
}

export async function getCachedLesson(): Promise<LessonData> {
  if (isCacheValid(cachedLesson)) {
    console.log("Usando lição do cache");
    return cachedLesson!;
  }

  try {
    console.log("Atualizando cache da lição...");
    cachedLesson = await scrapeLessonData();
    return cachedLesson;
  } catch (error) {
    console.error("Erro ao atualizar lição:", error);
    if (cachedLesson) {
      console.log("Usando lição cacheada anteriormente devido ao erro");
      return cachedLesson;
    }
    throw error;
  }
}

async function scrapeLessonData(): Promise<LessonData> {
  const browser = await puppeteer.launch(PUPPETEER_OPTIONS);
  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

    await page.goto(CPB_LESSON_URL, { waitUntil: 'networkidle2', timeout: 60000 });
    const lessonLink = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a'));
      const lessonLink = links.find(a => a.href.includes('/licao/') && !a.href.includes('#'));
      return lessonLink?.href || null;
    });

    if (!lessonLink) throw new Error('Link da lição não encontrado');

    if (cachedLesson?.lessonLink === lessonLink) {
      console.log('Link da lição não mudou. Mantendo cache existente.');
      return cachedLesson;
    }

    await page.goto(lessonLink, { waitUntil: 'networkidle2', timeout: 60000 });
    
    const lessonData = await page.evaluate(() => {
      const getText = (id: string) => {
        const el = document.getElementById(id);
        return el?.textContent?.trim().replace(/\s+/g, ' ') || '';
      };

      const days = [
        'licaoSabado', 'licaoDomingo', 'licaoSegunda',
        'licaoTerca', 'licaoQuarta', 'licaoQuinta', 'licaoSexta'
      ].map(getText).filter(Boolean);

      const verses = Array.from(document.querySelectorAll('.versiculo'))
        .map(el => el.textContent?.trim())
        .filter(Boolean) as string[];

      return {
        title: document.querySelector('h1')?.textContent?.trim() || 'Lição da Escola Sabatina',
        days,
        verses
      };
    });

    return {
      ...lessonData,
      lessonLink,
      lastUpdated: getCurrentDate()
    };
  } finally {
    await browser.close();
  }
}