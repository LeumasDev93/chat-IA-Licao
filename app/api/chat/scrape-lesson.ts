import puppeteer from 'puppeteer';

// --- Cache da lição para evitar scraping excessivo
export interface LessonData {
  title: string;
  days: string[];
  verses: string[];
  lastUpdated: string;
}

let cachedLesson: LessonData | null = null;
const CACHE_VALIDITY_MS = 7 * 24 * 60 * 60 * 1000; // 1 semana

export async function getCachedLesson(): Promise<LessonData> {
  if (
    cachedLesson &&
    (Date.now() - new Date(cachedLesson.lastUpdated).getTime()) < CACHE_VALIDITY_MS
  ) {
   // console.log("Usando lição do cache.");
    return cachedLesson;
  }
  //console.log("Raspando e cacheando nova lição...");
  cachedLesson = await scrapeAndCacheLesson();
  return cachedLesson;
}

async function scrapeAndCacheLesson(): Promise<LessonData> {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    );

    await page.goto('https://mais.cpb.com.br/licao-adultos/', { waitUntil: 'networkidle2', timeout: 60000 });

    const latestLessonLink = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a'));
      const lessonLink = links.find(a => a.href.includes('/licao/') && !a.href.includes('#'));
      return lessonLink ? lessonLink.href : null;
    });

    if (!latestLessonLink) {
     // console.error('ERRO: Link da lição mais recente não encontrado. A estrutura do site pode ter mudado.');
      throw new Error('Link da lição mais recente não encontrado no site da CPB.');
    }

    console.log(`Link da lição encontrado: ${latestLessonLink}`);
    await page.goto(latestLessonLink, { waitUntil: 'networkidle2', timeout: 60000 });

    const lessonContent = await page.evaluate(() => {
      function getText(id: string) {
        const el = document.getElementById(id);
        return el ? el.textContent?.trim().replace(/\s+/g, ' ') : '';
      }

      const days = [
        'licaoSabado',
        'licaoDomingo',
        'licaoSegunda',
        'licaoTerca',
        'licaoQuarta',
        'licaoQuinta',
        'licaoSexta'
      ].map(getText).filter((d): d is string => !!d);

      const verses = Array.from(document.querySelectorAll('.versiculo'))
        .map(el => el.textContent?.trim())
        .filter((v): v is string => !!v);

      return {
        title: document.querySelector('h1')?.textContent?.trim() || 'Lição da Escola Sabatina',
        days,
        verses
      };
    });

    return {
      ...lessonContent,
      lastUpdated: new Date().toISOString()
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
