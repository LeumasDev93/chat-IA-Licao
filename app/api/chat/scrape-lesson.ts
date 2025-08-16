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

// Função para gerar dados da lição sem depender de requisições externas
function generateLessonData(): LessonData {
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
    lastUpdated: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 dias
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

  console.log("Cache expirado ou inexistente, gerando novos dados...");
  
  try {
    // Gerar novos dados da lição
    const newLesson = generateLessonData();
    
    // Salvar no cache
    try {
      const cachePath = getCachePath();
      fs.writeFileSync(cachePath, JSON.stringify(newLesson, null, 2), 'utf-8');
      console.log('Novos dados salvos em cache:', cachePath);
    } catch (error) {
      console.error('Erro ao salvar cache:', error);
    }
    
    return newLesson;
    
  } catch (error) {
    console.error("Erro ao gerar dados da lição:", error);
    
    // Se tudo falhar, retornar dados básicos
    if (cachedLesson) {
      console.log("Usando cache anterior como fallback");
      return cachedLesson;
    }
    
    // Dados de emergência
    console.log("Usando dados de emergência");
    return generateLessonData();
  }
}