import { supabaseAdmin, isSupabaseConfigured } from '../../../lib/supabase';
import { LessonData } from '../cron/route';

// Função para obter dados da lição do Supabase
async function getLessonFromSupabase(): Promise<{ title: string; lessonLink: string; lastUpdated: string; expiresAt: string } | null> {
  if (!isSupabaseConfigured()) {
    console.log('Supabase não configurado, pulando busca no banco...');
    return null;
  }

  try {
    console.log('Buscando link da lição no Supabase...');
    
    // Calcular semana atual
    const currentDate = new Date();
    const weekNumber = Math.ceil((currentDate.getTime() - new Date(currentDate.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
    
    // Buscar apenas o link da lição atual no Supabase
    const { data, error } = await supabaseAdmin
      .from('lesson_cache')
      .select('title, lesson_link, last_updated, expires_at')
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
      console.log('Link da lição encontrado no Supabase:', data.lesson_link);
      return {
        title: data.title,
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

// Função para salvar apenas o link da lição no Supabase
async function saveLessonLinkToSupabase(title: string, lessonLink: string): Promise<boolean> {
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
      // Atualizar apenas o link da lição existente
      const { error } = await supabaseAdmin
        .from('lesson_cache')
        .update({
          title: title,
          lesson_link: lessonLink,
          last_updated: new Date().toISOString(),
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        })
        .eq('week_number', weekNumber);

      if (error) {
        console.error('Erro ao atualizar link da lição no Supabase:', error);
        return false;
      }

      console.log('Link da lição atualizado no Supabase com sucesso');
    } else {
      // Inserir nova entrada apenas com o link
      const { error } = await supabaseAdmin
        .from('lesson_cache')
        .insert({
          title: title,
          lesson_link: lessonLink,
          week_number: weekNumber,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        });

      if (error) {
        console.error('Erro ao salvar link da lição no Supabase:', error);
        return false;
      }

      console.log('Novo link da lição salvo no Supabase com sucesso');
    }

    return true;
  } catch (error) {
    console.error('Erro ao salvar link da lição no Supabase:', error);
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

// Função para fazer scraping em tempo real de uma lição específica
export async function scrapeLessonInRealTime(lessonLink: string): Promise<Omit<LessonData, 'expiresAt'> | null> {
  try {
    console.log('Fazendo scraping em tempo real da lição:', lessonLink);
    
    const lessonResponse = await fetch(lessonLink, {
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
      throw new Error(`Erro ao acessar lição: ${lessonResponse.status} ${lessonResponse.statusText}`);
    }

    const lessonHtml = await lessonResponse.text();
    console.log('HTML da lição obtido em tempo real, tamanho:', lessonHtml.length);

    // Extrair título da lição
    const titleMatch = lessonHtml.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : 'Lição da Escola Sabatina';

    // Extrair versículos
    const verses: string[] = [];
    const verseMatches = lessonHtml.match(/<[^>]*class="[^"]*versiculo[^"]*"[^>]*>([^<]+)<\/[^>]*>/gi) ||
                        lessonHtml.match(/<strong[^>]*>([^<]*versículo[^<]*)<\/strong>/gi) ||
                        lessonHtml.match(/<b[^>]*>([^<]*versículo[^<]*)<\/b>/gi);
    
    if (verseMatches) {
      verseMatches.slice(0, 10).forEach(verse => {
        const cleanVerse = verse.replace(/<[^>]*>/g, '').trim();
        if (cleanVerse.length > 20 && !verses.includes(cleanVerse)) {
          verses.push(cleanVerse);
        }
      });
    }

    // Extrair conteúdo dos dias - NOVA LÓGICA BASEADA NA ESTRUTURA DO SITE
    const dayNames = ['Sábado à Tarde', 'Domingo', 'Segunda-feira', 
                     'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira'];
    
    const days: string[] = [];
    
    // Primeiro, limpar o HTML removendo scripts, styles e tags desnecessárias
    const cleanHtml = lessonHtml
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<link[^>]*>/gi, '')
      .replace(/<meta[^>]*>/gi, '')
      .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, '')
      .replace(/<!--[\s\S]*?-->/gi, '')
      .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '')
      .replace(/<object[^>]*>[\s\S]*?<\/object>/gi, '')
      .replace(/<embed[^>]*>/gi, '')
      .replace(/<form[^>]*>[\s\S]*?<\/form>/gi, '')
      .replace(/<input[^>]*>/gi, '')
      .replace(/<button[^>]*>[\s\S]*?<\/button>/gi, '')
      .replace(/<select[^>]*>[\s\S]*?<\/select>/gi, '')
      .replace(/<textarea[^>]*>[\s\S]*?<\/textarea>/gi, '');
    
    console.log('🔍 Iniciando extração específica por dias...');
    
    // NOVA ESTRATÉGIA: Buscar por seções específicas de cada dia baseado na estrutura do site
    const daySections = [
      {
        name: 'Sábado à Tarde',
        patterns: [
          /sábado\s*à\s*tarde[^<]*<\/[^>]*>([\s\S]*?)(?=<h[1-6]|domingo|$)/gi,
          /sábado\s*à\s*tarde[^<]*<\/[^>]*>([\s\S]*?)(?=domingo|$)/gi,
          /<[^>]*>sábado\s*à\s*tarde[^<]*<\/[^>]*>([\s\S]*?)(?=<h[1-6]|domingo|$)/gi
        ]
      },
      {
        name: 'Domingo',
        patterns: [
          /domingo[^<]*<\/[^>]*>([\s\S]*?)(?=<h[1-6]|segunda-feira|$)/gi,
          /domingo[^<]*<\/[^>]*>([\s\S]*?)(?=segunda-feira|$)/gi,
          /<[^>]*>domingo[^<]*<\/[^>]*>([\s\S]*?)(?=<h[1-6]|segunda-feira|$)/gi
        ]
      },
      {
        name: 'Segunda-feira',
        patterns: [
          /segunda-feira[^<]*<\/[^>]*>([\s\S]*?)(?=<h[1-6]|terça-feira|$)/gi,
          /segunda-feira[^<]*<\/[^>]*>([\s\S]*?)(?=terça-feira|$)/gi,
          /<[^>]*>segunda-feira[^<]*<\/[^>]*>([\s\S]*?)(?=<h[1-6]|terça-feira|$)/gi
        ]
      },
      {
        name: 'Terça-feira',
        patterns: [
          /terça-feira[^<]*<\/[^>]*>([\s\S]*?)(?=<h[1-6]|quarta-feira|$)/gi,
          /terça-feira[^<]*<\/[^>]*>([\s\S]*?)(?=quarta-feira|$)/gi,
          /<[^>]*>terça-feira[^<]*<\/[^>]*>([\s\S]*?)(?=<h[1-6]|quarta-feira|$)/gi
        ]
      },
      {
        name: 'Quarta-feira',
        patterns: [
          /quarta-feira[^<]*<\/[^>]*>([\s\S]*?)(?=<h[1-6]|quinta-feira|$)/gi,
          /quarta-feira[^<]*<\/[^>]*>([\s\S]*?)(?=quinta-feira|$)/gi,
          /<[^>]*>quarta-feira[^<]*<\/[^>]*>([\s\S]*?)(?=<h[1-6]|quinta-feira|$)/gi
        ]
      },
      {
        name: 'Quinta-feira',
        patterns: [
          /quinta-feira[^<]*<\/[^>]*>([\s\S]*?)(?=<h[1-6]|sexta-feira|$)/gi,
          /quinta-feira[^<]*<\/[^>]*>([\s\S]*?)(?=sexta-feira|$)/gi,
          /<[^>]*>quinta-feira[^<]*<\/[^>]*>([\s\S]*?)(?=<h[1-6]|sexta-feira|$)/gi
        ]
      },
      {
        name: 'Sexta-feira',
        patterns: [
          /sexta-feira[^<]*<\/[^>]*>([\s\S]*?)(?=<h[1-6]|auxiliar|comentário|$)/gi,
          /sexta-feira[^<]*<\/[^>]*>([\s\S]*?)(?=auxiliar|comentário|$)/gi,
          /<[^>]*>sexta-feira[^<]*<\/[^>]*>([\s\S]*?)(?=<h[1-6]|auxiliar|comentário|$)/gi
        ]
      }
    ];
    
         // Tentar extrair conteúdo específico de cada dia
     for (const daySection of daySections) {
       let dayContent = '';
       
       for (const pattern of daySection.patterns) {
         const matches = cleanHtml.match(pattern);
         if (matches && matches.length > 0) {
           dayContent = matches[0]
             .replace(/<[^>]*>/g, ' ')
             .replace(/\s+/g, ' ')
             .trim();
           
           if (dayContent.length > 100) {
             // Remover partes introdutórias e capturar apenas o conteúdo específico
             let cleanContent = dayContent;
             
             // Remover introduções comuns
             cleanContent = cleanContent
               .replace(/^(.*?)(leia|leia\s+.*?\.|para onde|talvez você|mesmo que|deus respondeu|quando nos afastamos|o melhor exemplo|deus chama|nosso destino)/gi, '')
               .replace(/^(.*?)(ano bíblico|verso para memorizar|leituras da semana)/gi, '')
               .replace(/^(.*?)(garanta o conteúdo|esse tipo de conteúdo|download|assine a lição)/gi, '')
               .trim();
             
             // Se ainda tem conteúdo significativo após limpeza
             if (cleanContent.length > 150) {
               console.log(`✅ ${daySection.name}: Conteúdo limpo encontrado (${cleanContent.length} chars)`);
               days.push(`${daySection.name}: ${cleanContent.substring(0, 800)}`);
             } else {
               console.log(`⚠️ ${daySection.name}: Conteúdo muito pequeno após limpeza (${cleanContent.length} chars)`);
             }
             break;
           }
         }
       }
       
       if (!dayContent || dayContent.length < 100) {
         console.log(`❌ ${daySection.name}: Conteúdo não encontrado ou muito pequeno`);
       }
     }
    
         // Se não conseguiu extrair por padrões específicos, tentar método alternativo
     if (days.length < 5) {
       console.log('🔄 Tentando método alternativo de extração...');
       
       // Dividir o conteúdo por títulos de dias
       const sections = cleanHtml.split(/<h[1-6][^>]*>/gi);
       
       for (const daySection of daySections) {
         for (let i = 0; i < sections.length; i++) {
           const section = sections[i];
           const dayPattern = new RegExp(daySection.name.replace(/[à-]/g, '[à-]'), 'gi');
           
           if (dayPattern.test(section)) {
             let cleanContent = section
               .replace(/<[^>]*>/g, ' ')
               .replace(/\s+/g, ' ')
               .trim();
             
             // Aplicar a mesma limpeza para remover introduções
             cleanContent = cleanContent
               .replace(/^(.*?)(leia|leia\s+.*?\.|para onde|talvez você|mesmo que|deus respondeu|quando nos afastamos|o melhor exemplo|deus chama|nosso destino)/gi, '')
               .replace(/^(.*?)(ano bíblico|verso para memorizar|leituras da semana)/gi, '')
               .replace(/^(.*?)(garanta o conteúdo|esse tipo de conteúdo|download|assine a lição)/gi, '')
               .trim();
             
             if (cleanContent.length > 200) {
               console.log(`✅ ${daySection.name}: Conteúdo limpo encontrado por seções (${cleanContent.length} chars)`);
               days.push(`${daySection.name}: ${cleanContent.substring(0, 800)}`);
               break;
             }
           }
         }
       }
     }
    
    // Se ainda não conseguiu, tentar extrair conteúdo real da lição
    if (days.length < 5) {
      console.log('🔄 Tentando extração de conteúdo geral...');
      
      // Buscar por conteúdo de texto real
      const textContent = cleanHtml
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .replace(/[^\w\s\.\,\!\?\:\;\(\)\[\]\-\–\—]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      console.log('📝 Conteúdo de texto extraído (primeiros 500 chars):', textContent.substring(0, 500));
      
      // Se temos conteúdo real, dividir em dias
      if (textContent.length > 1000) {
        const contentLength = textContent.length;
        const partLength = Math.floor(contentLength / 7);
        
        for (let i = 0; i < 7; i++) {
          const start = i * partLength;
          const end = start + partLength;
          const dayContent = textContent.substring(start, end);
          
          if (dayContent.length > 100) {
            days.push(`${dayNames[i]}: ${dayContent.substring(0, 800)}`);
          }
        }
      }
    }

    const lessonData = {
      title,
      days,
      verses,
      lessonLink,
      lastUpdated: new Date().toISOString()
    };

    console.log('📊 Dados extraídos em tempo real:', {
      title: lessonData.title,
      daysCount: lessonData.days.length,
      versesCount: lessonData.verses.length,
      link: lessonData.lessonLink
    });

    // Log detalhado dos dias extraídos
    lessonData.days.forEach((day, index) => {
      console.log(`📅 Dia ${index + 1}: ${day.substring(0, 100)}...`);
    });

    return lessonData;

  } catch (error) {
    console.error('Erro no scraping em tempo real:', error);
    return null;
  }
}

// Função para gerar dados de fallback
function generateFallbackData(): LessonData {
  console.log('Não foi possível obter dados da lição. Retornando dados vazios.');
  return {
    title: 'Lição não disponível',
    days: [],
    verses: [],
    lessonLink: '',
    lastUpdated: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  };
}

export async function getCachedLesson(): Promise<LessonData> {
  console.log('Iniciando busca de dados da lição...');
  
  try {
    // 1. Tentar buscar link da lição no Supabase
    const existingLessonLink = await getLessonFromSupabase();
    
    if (existingLessonLink && existingLessonLink.lessonLink) {
      console.log('Link da lição encontrado no Supabase, fazendo scraping em tempo real...');
      
      // Fazer scraping em tempo real usando o link
      const realTimeData = await scrapeLessonInRealTime(existingLessonLink.lessonLink);
      
      if (realTimeData) {
        const lessonWithExpiry: LessonData = {
          ...realTimeData,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        };
        
        console.log('Retornando dados extraídos em tempo real');
        return lessonWithExpiry;
      }
    }

    // 2. Se não existir link ou falhar scraping, tentar detectar nova lição
    console.log('Link não encontrado, detectando nova lição...');
    const currentLesson = await detectCurrentLesson();
    
    if (currentLesson) {
      // Salvar apenas o link no Supabase
      await saveLessonLinkToSupabase(currentLesson.title, currentLesson.link);
      
      // Fazer scraping em tempo real
      const realTimeData = await scrapeLessonInRealTime(currentLesson.link);
      
      if (realTimeData) {
        const lessonWithExpiry: LessonData = {
          ...realTimeData,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        };
        
        console.log('Retornando nova lição detectada');
        return lessonWithExpiry;
      }
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
    const currentLesson = await detectCurrentLesson();
    
    if (currentLesson) {
      await saveLessonLinkToSupabase(currentLesson.title, currentLesson.link);
      
      const realTimeData = await scrapeLessonInRealTime(currentLesson.link);
      
      if (realTimeData) {
        const lessonWithExpiry: LessonData = {
          ...realTimeData,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        };
        
        console.log('Lição atualizada com sucesso');
        return lessonWithExpiry;
      }
    }
    
    return generateFallbackData();
  } catch (error) {
    console.error('Erro ao forçar atualização:', error);
    return generateFallbackData();
  }
}