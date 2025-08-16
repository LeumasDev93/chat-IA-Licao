import { supabaseAdmin, isSupabaseConfigured } from '../../../lib/supabase';
import { LessonData } from '../cron/route';

// Função para obter dados da lição do Supabase
async function getLessonFromSupabase(): Promise<LessonData | null> {
  if (!isSupabaseConfigured()) {
    console.log('Supabase não configurado, pulando busca no banco...');
    return null;
  }

  try {
    console.log('Buscando dados da lição no Supabase...');
    
    // Calcular semana atual
    const currentDate = new Date();
    const weekNumber = Math.ceil((currentDate.getTime() - new Date(currentDate.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
    
    // Buscar lição atual no Supabase
    const { data, error } = await supabaseAdmin
      .from('lesson_cache')
      .select('*')
      .eq('week_number', weekNumber)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('Erro ao buscar lição no Supabase:', error);
      return null;
    }

    if (data) {
      console.log('Lição encontrada no Supabase:', data.title);
      return {
        title: data.title,
        days: data.days,
        verses: data.verses,
        lessonLink: data.lesson_link,
        lastUpdated: data.last_updated,
        expiresAt: data.expires_at
      };
    }

    return null;
  } catch (error) {
    console.error('Erro ao buscar lição no Supabase:', error);
    return null;
  }
}

// Função para salvar dados da lição no Supabase
async function saveLessonToSupabase(lessonData: Omit<LessonData, 'expiresAt'>): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    console.log('Supabase não configurado, pulando salvamento...');
    return false;
  }

  try {
    const currentDate = new Date();
    const weekNumber = Math.ceil((currentDate.getTime() - new Date(currentDate.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
    
    // Verificar se já existe uma lição para esta semana
    const { data: existingLesson } = await supabaseAdmin
      .from('lesson_cache')
      .select('id')
      .eq('week_number', weekNumber)
      .single();

    if (existingLesson) {
      // Atualizar lição existente
      const { error } = await supabaseAdmin
        .from('lesson_cache')
        .update({
          title: lessonData.title,
          days: lessonData.days,
          verses: lessonData.verses,
          lesson_link: lessonData.lessonLink,
          last_updated: new Date().toISOString(),
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        })
        .eq('week_number', weekNumber);

      if (error) {
        console.error('Erro ao atualizar lição no Supabase:', error);
        return false;
      }

      console.log('Lição atualizada no Supabase com sucesso');
    } else {
      // Inserir nova lição
      const { error } = await supabaseAdmin
        .from('lesson_cache')
        .insert({
          title: lessonData.title,
          days: lessonData.days,
          verses: lessonData.verses,
          lesson_link: lessonData.lessonLink,
          week_number: weekNumber,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        });

      if (error) {
        console.error('Erro ao salvar lição no Supabase:', error);
        return false;
      }

      console.log('Nova lição salva no Supabase com sucesso');
    }

    return true;
  } catch (error) {
    console.error('Erro ao salvar lição no Supabase:', error);
    return false;
  }
}

// Função para detectar a lição atual da semana
async function detectCurrentLesson(): Promise<{ title: string; link: string; verse: string; period: string } | null> {
  try {
    console.log('Detectando lição atual da semana...');
    
    const response = await fetch('https://mais.cpb.com.br/licao-adultos/', {
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
    console.log('HTML da página principal obtido, tamanho:', html.length);

         // Procurar pelo JSON das lições no HTML
     const jsonMatch = html.match(/\[{.*"img":.*"title":.*"verso":.*"periodo":.*"link":.*}\]/);
    
    if (jsonMatch) {
      try {
        const lessonsData = JSON.parse(jsonMatch[0]);
        console.log(`Encontradas ${lessonsData.length} lições no JSON`);
        
                 // Encontrar a lição atual baseada na data
         const currentDate = new Date();
         const currentLesson = lessonsData.find((lesson: { periodo?: string; title: string; link: string; verso: string }) => {
          if (!lesson.periodo) return false;
          
          // Extrair datas do período (ex: "16 a 22 de agosto")
          const periodMatch = lesson.periodo.match(/(\d+)\s+a\s+(\d+)\s+de\s+(\w+)/);
          if (!periodMatch) return false;
          
          const startDay = parseInt(periodMatch[1]);
          const endDay = parseInt(periodMatch[2]);
          const month = periodMatch[3];
          
          // Mapear mês para número
          const monthMap: { [key: string]: number } = {
            'janeiro': 0, 'fevereiro': 1, 'março': 2, 'abril': 3, 'maio': 4, 'junho': 5,
            'julho': 6, 'agosto': 7, 'setembro': 8, 'outubro': 9, 'novembro': 10, 'dezembro': 11
          };
          
          const monthNumber = monthMap[month.toLowerCase()];
          if (monthNumber === undefined) return false;
          
          const year = currentDate.getFullYear();
          const startDate = new Date(year, monthNumber, startDay);
          const endDate = new Date(year, monthNumber, endDay);
          
          return currentDate >= startDate && currentDate <= endDate;
        });
        
        if (currentLesson) {
          console.log('Lição atual detectada:', currentLesson.title);
          return {
            title: currentLesson.title,
            link: currentLesson.link,
            verse: currentLesson.verso,
            period: currentLesson.periodo
          };
        } else {
          console.log('Nenhuma lição encontrada para a semana atual, usando a primeira disponível');
          return {
            title: lessonsData[0].title,
            link: lessonsData[0].link,
            verse: lessonsData[0].verso,
            period: lessonsData[0].periodo
          };
        }
      } catch (parseError) {
        console.error('Erro ao fazer parse do JSON:', parseError);
      }
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao detectar lição atual:', error);
    return null;
  }
}

// Função para fazer scraping completo da lição específica
async function scrapeCompleteLessonData(): Promise<Omit<LessonData, 'expiresAt'> | null> {
  try {
    console.log('Iniciando scraping completo da lição específica...');
    
    // 1. Detectar a lição atual
    const currentLesson = await detectCurrentLesson();
    if (!currentLesson) {
      console.log('Não foi possível detectar a lição atual');
      return null;
    }
    
    console.log(`Acessando lição: ${currentLesson.title}`);
    console.log(`Link: ${currentLesson.link}`);
    
    // 2. Acessar a página específica da lição
    const lessonResponse = await fetch(currentLesson.link, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    });

    if (!lessonResponse.ok) {
      throw new Error(`Erro ao acessar lição específica: ${lessonResponse.status} ${lessonResponse.statusText}`);
    }

    const lessonHtml = await lessonResponse.text();
    console.log('HTML da lição específica obtido, tamanho:', lessonHtml.length);

    // 3. Extrair título da lição
    const title = currentLesson.title;

    // 4. Extrair versículos (usar o versículo principal + buscar outros na página)
    const verses = [currentLesson.verse];
    
    // Buscar versículos adicionais na página da lição
    const additionalVerses = lessonHtml.match(/<[^>]*class="[^"]*versiculo[^"]*"[^>]*>([^<]+)<\/[^>]*>/gi) ||
                            lessonHtml.match(/<strong[^>]*>([^<]*versículo[^<]*)<\/strong>/gi) ||
                            lessonHtml.match(/<b[^>]*>([^<]*versículo[^<]*)<\/b>/gi);
    
    if (additionalVerses) {
      additionalVerses.slice(0, 5).forEach(verse => {
        const cleanVerse = verse.replace(/<[^>]*>/g, '').trim();
        if (cleanVerse.length > 20 && !verses.includes(cleanVerse)) {
          verses.push(cleanVerse);
        }
      });
    }

    // 5. Extrair conteúdo completo de todos os dias da semana
    const dayNames = ['🌅 Sábado à Tarde', '☀️ Domingo', '🌱 Segunda-feira', 
                     '🌿 Terça-feira', '🌳 Quarta-feira', '🌺 Quinta-feira', '🌟 Sexta-feira'];
    
    const days: string[] = [];
    
    // Buscar conteúdo por diferentes seletores
    const contentSelectors = [
      /<div[^>]*class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
      /<div[^>]*class="[^"]*lesson[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
      /<div[^>]*class="[^"]*day[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
      /<article[^>]*>([\s\S]*?)<\/article>/gi,
      /<section[^>]*>([\s\S]*?)<\/section>/gi
    ];
    
    let allContent = '';
    
    for (const selector of contentSelectors) {
      const matches = lessonHtml.match(selector);
      if (matches && matches.length > 0) {
        allContent = matches.join(' ');
        break;
      }
    }
    
    if (allContent) {
      // Limpar HTML e dividir em 7 partes para os dias
      const cleanContent = allContent
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      const contentLength = cleanContent.length;
      const partLength = Math.floor(contentLength / 7);
      
      for (let i = 0; i < 7; i++) {
        const start = i * partLength;
        const end = start + partLength;
        const dayContent = cleanContent.substring(start, end);
        
        if (dayContent.length > 50) {
          days.push(`${dayNames[i]}: ${dayContent.substring(0, 400)}...`);
        }
      }
    }
    
    // Se não conseguiu extrair dias suficientes, usar dados baseados no título
    if (days.length < 5) {
      const baseContent = [
        'Introdução ao tema da semana e preparação para o estudo da Palavra de Deus',
        'Estudo bíblico sobre os princípios fundamentais da fé cristã',
        'Aplicação prática dos ensinamentos na vida diária e relacionamentos',
        'Reflexão sobre a vontade de Deus e nosso papel como discípulos',
        'Meditação sobre a graça e o amor de Deus em nossas vidas',
        'Compartilhamento dos ensinamentos com outros e testemunho',
        'Preparação para o sábado e resumo da semana de estudo espiritual'
      ];
      
      dayNames.forEach((dayName, index) => {
        days.push(`${dayName}: ${baseContent[index]}`);
      });
    }

    const lessonData = {
      title,
      days,
      verses,
      lessonLink: currentLesson.link,
      lastUpdated: new Date().toISOString()
    };

    console.log('Dados completos extraídos com sucesso:', {
      title: lessonData.title,
      daysCount: lessonData.days.length,
      versesCount: lessonData.verses.length,
      link: lessonData.lessonLink
    });

    return lessonData;

  } catch (error) {
    console.error('Erro no scraping completo:', error);
    return null;
  }
}

// Função para gerar dados de fallback
function generateFallbackData(): LessonData {
  console.log('Usando dados de fallback...');
  
  const currentDate = new Date();
  const weekNumber = Math.ceil((currentDate.getTime() - new Date(currentDate.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
  
  return {
    title: `Lição da Escola Sabatina - Semana ${weekNumber}`,
    days: [
      '🌅 Sábado à Tarde: Introdução ao tema da semana e preparação para o estudo da Palavra de Deus',
      '☀️ Domingo: Estudo bíblico sobre os princípios fundamentais da fé cristã',
      '🌱 Segunda-feira: Aplicação prática dos ensinamentos na vida diária e relacionamentos',
      '🌿 Terça-feira: Reflexão sobre a vontade de Deus e nosso papel como discípulos',
      '🌳 Quarta-feira: Meditação sobre a graça e o amor de Deus em nossas vidas',
      '🌺 Quinta-feira: Compartilhamento dos ensinamentos com outros e testemunho',
      '🌟 Sexta-feira: Preparação para o sábado e resumo da semana de estudo espiritual'
    ],
    verses: [
      'João 3:16 - "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna."',
      'Salmo 119:105 - "Lâmpada para os meus pés é a tua palavra e luz para o meu caminho."',
      '2 Timóteo 3:16 - "Toda a Escritura é inspirada por Deus e útil para o ensino, para a repreensão, para a correção, para a educação na justiça."',
      'Mateus 28:19-20 - "Portanto, ide, ensinai todas as nações, batizando-as em nome do Pai, e do Filho, e do Espírito Santo; ensinando-as a guardar todas as coisas que eu vos tenho mandado."',
      'Romanos 12:2 - "E não vos conformeis com este século, mas transformai-vos pela renovação da vossa mente, para que experimenteis qual seja a boa, agradável e perfeita vontade de Deus."',
      'Filipenses 4:13 - "Posso todas as coisas naquele que me fortalece."',
      'Isaías 40:31 - "Mas os que esperam no Senhor renovarão as suas forças; subirão com asas como águias; correrão, e não se cansarão; andarão, e não se fatigarão."'
    ],
    lessonLink: 'https://mais.cpb.com.br/licao-adultos/',
    lastUpdated: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  };
}

export async function getCachedLesson(): Promise<LessonData> {
  console.log('Iniciando busca de dados da lição...');
  
  try {
    // 1. Tentar buscar dados existentes no Supabase
    const existingLesson = await getLessonFromSupabase();
    if (existingLesson) {
      console.log('Retornando lição existente do Supabase');
      return existingLesson;
    }

    // 2. Se não existir, tentar fazer scraping completo
    console.log('Lição não encontrada, tentando scraping completo...');
    const scrapedData = await scrapeCompleteLessonData();
    
    if (scrapedData) {
      // Salvar no Supabase
      await saveLessonToSupabase(scrapedData);
      
      const lessonWithExpiry: LessonData = {
        ...scrapedData,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      };
      
      console.log('Retornando lição completa extraída do site');
      return lessonWithExpiry;
    }

    // 3. Se tudo falhar, usar dados de fallback
    console.log('Usando dados de fallback');
    return generateFallbackData();

  } catch (error) {
    console.error('Erro ao obter dados da lição:', error);
    return generateFallbackData();
  }
}

// Função para forçar atualização da lição
export async function forceUpdateLesson(): Promise<LessonData> {
  console.log('Forçando atualização da lição...');
  
  try {
    const scrapedData = await scrapeCompleteLessonData();
    
    if (scrapedData) {
      await saveLessonToSupabase(scrapedData);
      
      const lessonWithExpiry: LessonData = {
        ...scrapedData,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      };
      
      console.log('Lição atualizada com sucesso');
      return lessonWithExpiry;
    }
    
    return generateFallbackData();
  } catch (error) {
    console.error('Erro ao forçar atualização:', error);
    return generateFallbackData();
  }
}