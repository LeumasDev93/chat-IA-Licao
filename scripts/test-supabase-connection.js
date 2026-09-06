const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testSupabaseConnection() {
  console.log('🔍 Testando conexão com Supabase...\n');

  // Verificar variáveis de ambiente
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log('📋 Variáveis de ambiente:');
  console.log(`URL: ${supabaseUrl ? '✅ Configurada' : '❌ Não configurada'}`);
  console.log(`Anon Key: ${supabaseAnonKey ? '✅ Configurada' : '❌ Não configurada'}`);
  console.log(`Service Key: ${supabaseServiceKey ? '✅ Configurada' : '❌ Não configurada'}\n`);

  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
    console.log('❌ Variáveis de ambiente não configuradas!');
    console.log('Crie um arquivo .env.local com as seguintes variáveis:');
    console.log('NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase');
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima');
    console.log('SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role');
    return;
  }

  try {
    // Testar conexão com anon key
    console.log('🔗 Testando conexão com anon key...');
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    const { data: anonTest, error: anonError } = await supabase
      .from('lesson_cache')
      .select('count')
      .limit(1);

    if (anonError) {
      console.log(`❌ Erro com anon key: ${anonError.message}`);
    } else {
      console.log('✅ Conexão com anon key funcionando');
    }

    // Testar conexão com service role key
    console.log('\n🔗 Testando conexão com service role key...');
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data: adminTest, error: adminError } = await supabaseAdmin
      .from('lesson_cache')
      .select('count')
      .limit(1);

    if (adminError) {
      console.log(`❌ Erro com service role key: ${adminError.message}`);
      
      // Verificar se a tabela existe
      console.log('\n🔍 Verificando se a tabela lesson_cache existe...');
      const { data: tables, error: tablesError } = await supabaseAdmin
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_name', 'lesson_cache');

      if (tablesError) {
        console.log(`❌ Erro ao verificar tabelas: ${tablesError.message}`);
      } else if (tables && tables.length > 0) {
        console.log('✅ Tabela lesson_cache existe');
      } else {
        console.log('❌ Tabela lesson_cache não existe!');
        console.log('Execute o script SQL em scripts/create-lesson-table.sql no Supabase');
      }
    } else {
      console.log('✅ Conexão com service role key funcionando');
    }

    // Testar inserção de dados
    console.log('\n📝 Testando inserção de dados...');
    const testData = {
      title: 'Teste de Conexão',
      days: ['Dia 1', 'Dia 2'],
      verses: ['Versículo 1', 'Versículo 2'],
      lesson_link: 'https://teste.com',
      week_number: 999,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };

    const { data: insertData, error: insertError } = await supabaseAdmin
      .from('lesson_cache')
      .insert(testData)
      .select();

    if (insertError) {
      console.log(`❌ Erro ao inserir dados: ${insertError.message}`);
    } else {
      console.log('✅ Inserção de dados funcionando');
      
      // Limpar dados de teste
      await supabaseAdmin
        .from('lesson_cache')
        .delete()
        .eq('week_number', 999);
      
      console.log('🧹 Dados de teste removidos');
    }

  } catch (error) {
    console.log(`❌ Erro geral: ${error.message}`);
  }
}

testSupabaseConnection();
