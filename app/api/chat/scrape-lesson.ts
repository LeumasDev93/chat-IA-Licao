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

// Função para fazer scraping real do site da CPB
async function scrapeRealLessonData(): Promise<Omit<LessonData, 'expiresAt'>> {
  console.log('Iniciando scraping real do site da CPB...');
  
  try {
    // URL base da lição
    const baseUrl = 'https://mais.cpb.com.br/licao-adultos/';
    
    // Fazer requisição para obter o HTML da página
    const response = await fetch(baseUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    });

    if (!response.ok) {
      throw new Error(`Erro ao acessar site: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    console.log('HTML obtido com sucesso, tamanho:', html.length);

    // Extrair informações básicas usando regex
    const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/i) || 
                      html.match(/<title[^>]*>([^<]+)<\/title>/i) ||
                      html.match(/Lição[^<]*/i);
    
    const title = titleMatch ? titleMatch[1].trim() : 'Lição da Escola Sabatina';

    // Extrair versículos usando regex
    const verseMatches = html.match(/<span[^>]*class="[^"]*versiculo[^"]*"[^>]*>([^<]+)<\/span>/gi) ||
                        html.match(/<div[^>]*class="[^"]*versiculo[^"]*"[^>]*>([^<]+)<\/div>/gi) ||
                        html.match(/<p[^>]*class="[^"]*versiculo[^"]*"[^>]*>([^<]+)<\/p>/gi);
    
    const verses = verseMatches ? 
      verseMatches.map(v => v.replace(/<[^>]*>/g, '').trim()).filter(v => v.length > 0) :
      [
        'João 3:16 - "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito..."',
        'Salmo 119:105 - "Lâmpada para os meus pés é a tua palavra e luz para o meu caminho."',
        '2 Timóteo 3:16 - "Toda a Escritura é inspirada por Deus e útil para o ensino..."'
      ];

    // Extrair conteúdo dos dias da semana
    const daySelectors = [
      'licaoSabado', 'licaoDomingo', 'licaoSegunda', 'licaoTerca', 
      'licaoQuarta', 'licaoQuinta', 'licaoSexta'
    ];

    const days = daySelectors.map(selector => {
      const regex = new RegExp(`<[^>]*id="${selector}"[^>]*>([\\s\\S]*?)<\\/[^>]*>`, 'i');
      const match = html.match(regex);
      if (match && match[1]) {
        // Limpar HTML e extrair texto
        const cleanText = match[1]
          .replace(/<[^>]*>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .substring(0, 200) + '...';
        
        const dayNames = ['🌅 Sábado à Tarde', '☀️ Domingo', '🌱 Segunda-feira', 
                         '🌿 Terça-feira', '🌳 Quarta-feira', '🌺 Quinta-feira', '🌟 Sexta-feira'];
        const dayIndex = daySelectors.indexOf(selector);
        return `${dayNames[dayIndex]}: ${cleanText}`;
      }
      return null;
    }).filter(Boolean) as string[];

    // Se não conseguiu extrair dias específicos, usar conteúdo geral
    if (days.length === 0) {
      const contentMatches = html.match(/<div[^>]*class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/gi);
      if (contentMatches) {
        const dayNames = ['🌅 Sábado à Tarde', '☀️ Domingo', '🌱 Segunda-feira', 
                         '🌿 Terça-feira', '🌳 Quarta-feira', '🌺 Quinta-feira', '🌟 Sexta-feira'];
        
        contentMatches.slice(0, 7).forEach((content, index) => {
          const cleanText = content
            .replace(/<[^>]*>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .substring(0, 150) + '...';
          
          days.push(`${dayNames[index]}: ${cleanText}`);
        });
      }
    }

    // Se ainda não tem dias, usar dados padrão
    if (days.length === 0) {
      days.push(
        '🌅 Sábado à Tarde: Introdução ao tema da semana e preparação para o estudo',
        '☀️ Domingo: Estudo bíblico sobre os princípios fundamentais',
        '🌱 Segunda-feira: Aplicação prática dos ensinamentos na vida diária',
        '🌿 Terça-feira: Reflexão sobre a vontade de Deus e nosso papel',
        '🌳 Quarta-feira: Meditação sobre a graça e o amor de Deus',
        '🌺 Quinta-feira: Compartilhamento dos ensinamentos com outros',
        '🌟 Sexta-feira: Preparação para o sábado e resumo da semana'
      );
    }

    const lessonData = {
      title,
      days,
      verses,
      lessonLink: baseUrl,
      lastUpdated: new Date().toISOString()
    };

    console.log('Dados extraídos com sucesso:', {
      title: lessonData.title,
      daysCount: lessonData.days.length,
      versesCount: lessonData.verses.length
    });

    return lessonData;

  } catch (error) {
    console.error('Erro no scraping real:', error);
    
    // Em caso de erro, usar dados de fallback
    return generateFallbackData();
  }
}

// Função de fallback para quando o scraping falhar
function generateFallbackData(): Omit<LessonData, 'expiresAt'> {
  console.log('Usando dados de fallback...');
  
  const currentDate = new Date();
  const weekNumber = Math.ceil((currentDate.getTime() - new Date(currentDate.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
  
  return {
    title: `Lição da Escola Sabatina - Semana ${weekNumber}`,
    days: [
      '🌅 Sábado à Tarde: Introdução ao tema da semana e preparação para o estudo',
      '☀️ Domingo: Estudo bíblico sobre os princípios fundamentais',
      '🌱 Segunda-feira: Aplicação prática dos ensinamentos na vida diária',
      '🌿 Terça-feira: Reflexão sobre a vontade de Deus e nosso papel',
      '🌳 Quarta-feira: Meditação sobre a graça e o amor de Deus',
      '🌺 Quinta-feira: Compartilhamento dos ensinamentos com outros',
      '🌟 Sexta-feira: Preparação para o sábado e resumo da semana'
    ],
    verses: [
      'João 3:16 - "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna."',
      'Salmo 119:105 - "Lâmpada para os meus pés é a tua palavra e luz para o meu caminho."',
      '2 Timóteo 3:16 - "Toda a Escritura é inspirada por Deus e útil para o ensino, para a repreensão, para a correção, para a educação na justiça."',
      'Mateus 28:19-20 - "Portanto, ide, ensinai todas as nações, batizando-as em nome do Pai, e do Filho, e do Espírito Santo; ensinando-as a guardar todas as coisas que eu vos tenho mandado."',
      'Romanos 12:2 - "E não vos conformeis com este século, mas transformai-vos pela renovação da vossa mente, para que experimenteis qual seja a boa, agradável e perfeita vontade de Deus."'
    ],
    lessonLink: 'https://mais.cpb.com.br/licao-adultos/',
    lastUpdated: new Date().toISOString()
  };
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

  console.log("Cache expirado ou inexistente, fazendo scraping real...");
  
  try {
    // Tentar fazer scraping real
    const newLesson = await scrapeRealLessonData();
    
    const updatedLesson: LessonData = {
      ...newLesson,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 dias
    };
    
    // Salvar no cache
    saveCacheToFile(updatedLesson);
    
    return updatedLesson;
    
  } catch (error) {
    console.error("Erro ao fazer scraping real:", error);
    
    // Se tudo falhar, retornar dados básicos
    if (cachedLesson) {
      console.log("Usando cache anterior como fallback");
      return cachedLesson;
    }
    
    // Dados de emergência
    console.log("Usando dados de emergência");
    const fallbackData = generateFallbackData();
    return {
      ...fallbackData,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };
  }
}