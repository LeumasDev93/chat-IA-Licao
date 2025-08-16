const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testNewScraping() {
  console.log('🔄 Testando novo sistema de scraping...\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.log('❌ Variáveis do Supabase não configuradas!');
    return;
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // 1. Testar detecção da lição atual
    console.log('📋 Testando detecção da lição atual...');
    
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
      console.log(`❌ Erro ao acessar site: ${response.status}`);
      return;
    }

    const html = await response.text();
    console.log(`✅ HTML obtido, tamanho: ${html.length}`);

    // Procurar pelo JSON das lições
    const jsonMatch = html.match(/\[{.*"img":.*"title":.*"verso":.*"periodo":.*"link":.*}\]/);
    
    if (jsonMatch) {
      try {
        const lessonsData = JSON.parse(jsonMatch[0]);
        console.log(`✅ Encontradas ${lessonsData.length} lições no JSON`);
        
        // Mostrar as primeiras 3 lições
        console.log('\n📚 Primeiras 3 lições disponíveis:');
        lessonsData.slice(0, 3).forEach((lesson, index) => {
          console.log(`   ${index + 1}. ${lesson.title}`);
          console.log(`      Período: ${lesson.periodo}`);
          console.log(`      Link: ${lesson.link}`);
          console.log(`      Versículo: ${lesson.verso.substring(0, 80)}...`);
          console.log('');
        });

        // Encontrar lição atual
        const currentDate = new Date();
        const currentLesson = lessonsData.find((lesson) => {
          if (!lesson.periodo) return false;
          
          const periodMatch = lesson.periodo.match(/(\d+)\s+a\s+(\d+)\s+de\s+(\w+)/);
          if (!periodMatch) return false;
          
          const startDay = parseInt(periodMatch[1]);
          const endDay = parseInt(periodMatch[2]);
          const month = periodMatch[3];
          
          const monthMap = {
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
          console.log('🎯 Lição atual detectada:');
          console.log(`   Título: ${currentLesson.title}`);
          console.log(`   Período: ${currentLesson.periodo}`);
          console.log(`   Link: ${currentLesson.link}`);
          console.log(`   Versículo: ${currentLesson.verso}`);
          
          // 2. Testar acesso à página específica da lição
          console.log('\n🔗 Testando acesso à página específica da lição...');
          
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

          if (lessonResponse.ok) {
            const lessonHtml = await lessonResponse.text();
            console.log(`✅ Página da lição acessada, tamanho: ${lessonHtml.length}`);
            
            // Verificar se há conteúdo
            const hasContent = lessonHtml.includes('content') || lessonHtml.includes('lesson') || lessonHtml.includes('article');
            console.log(`   Contém conteúdo: ${hasContent ? '✅' : '❌'}`);
            
            // Verificar se há versículos
            const hasVerses = lessonHtml.includes('versículo') || lessonHtml.includes('versiculo');
            console.log(`   Contém versículos: ${hasVerses ? '✅' : '❌'}`);
            
          } else {
            console.log(`❌ Erro ao acessar página da lição: ${lessonResponse.status}`);
          }
          
        } else {
          console.log('⚠️ Nenhuma lição encontrada para a semana atual');
          console.log('Usando a primeira lição disponível como exemplo');
          
          const firstLesson = lessonsData[0];
          console.log(`   Título: ${firstLesson.title}`);
          console.log(`   Link: ${firstLesson.link}`);
        }
        
      } catch (parseError) {
        console.error('❌ Erro ao fazer parse do JSON:', parseError.message);
      }
    } else {
      console.log('❌ JSON das lições não encontrado no HTML');
    }

    // 3. Testar API de atualização
    console.log('\n🔄 Testando API de atualização...');
    
    try {
      const apiResponse = await fetch('http://localhost:3000/api/chat/update-lesson', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (apiResponse.ok) {
        const result = await apiResponse.json();
        console.log('✅ API de atualização funcionando');
        console.log(`   Título: ${result.data.title}`);
        console.log(`   Dias: ${result.data.days.length}`);
        console.log(`   Versículos: ${result.data.verses.length}`);
        console.log(`   Link: ${result.data.lessonLink}`);
      } else {
        console.log(`❌ Erro na API: ${apiResponse.status}`);
      }
    } catch (apiError) {
      console.log('❌ Erro ao testar API (servidor pode não estar rodando):', apiError.message);
    }

  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

testNewScraping();
