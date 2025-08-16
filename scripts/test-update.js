const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testLessonUpdate() {
  console.log('🔄 Testando atualização da lição...\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.log('❌ Variáveis do Supabase não configuradas!');
    return;
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // 1. Verificar lição atual
    console.log('📋 Verificando lição atual...');
    const currentDate = new Date();
    const weekNumber = Math.ceil((currentDate.getTime() - new Date(currentDate.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
    
    const { data: currentLesson } = await supabaseAdmin
      .from('lesson_cache')
      .select('*')
      .eq('week_number', weekNumber)
      .single();

    if (currentLesson) {
      console.log(`✅ Lição atual encontrada: ${currentLesson.title}`);
      console.log(`   Dias: ${currentLesson.days.length}`);
      console.log(`   Versículos: ${currentLesson.verses.length}`);
      console.log(`   Última atualização: ${currentLesson.last_updated}`);
    } else {
      console.log('❌ Nenhuma lição encontrada para esta semana');
    }

    // 2. Testar API de atualização
    console.log('\n🔄 Testando API de atualização...');
    
    const response = await fetch('http://localhost:3000/api/chat/update-lesson', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ API de atualização funcionando');
      console.log(`   Título: ${result.data.title}`);
      console.log(`   Dias: ${result.data.days.length}`);
      console.log(`   Versículos: ${result.data.verses.length}`);
    } else {
      console.log('❌ Erro na API de atualização');
      console.log(`   Status: ${response.status}`);
    }

    // 3. Verificar se foi atualizada
    console.log('\n📋 Verificando se foi atualizada...');
    const { data: updatedLesson } = await supabaseAdmin
      .from('lesson_cache')
      .select('*')
      .eq('week_number', weekNumber)
      .single();

    if (updatedLesson) {
      console.log(`✅ Lição atualizada: ${updatedLesson.title}`);
      console.log(`   Dias: ${updatedLesson.days.length}`);
      console.log(`   Versículos: ${updatedLesson.verses.length}`);
      console.log(`   Última atualização: ${updatedLesson.last_updated}`);
      
      // Mostrar alguns dias como exemplo
      console.log('\n📅 Exemplo de dias da semana:');
      updatedLesson.days.slice(0, 3).forEach((day, index) => {
        console.log(`   ${index + 1}. ${day.substring(0, 100)}...`);
      });
      
      console.log('\n📖 Exemplo de versículos:');
      updatedLesson.verses.slice(0, 3).forEach((verse, index) => {
        console.log(`   ${index + 1}. ${verse.substring(0, 80)}...`);
      });
    }

  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

testLessonUpdate();
