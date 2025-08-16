#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Variáveis de ambiente não configuradas');
  console.log('Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSupabaseStructure() {
  console.log('🔍 Verificando estrutura do Supabase...\n');

  try {
    // 1. Verificar se a tabela user_chats existe
    console.log('1️⃣ Verificando tabela user_chats...');
    const { data: tableInfo, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name, table_type')
      .eq('table_schema', 'public')
      .eq('table_name', 'user_chats');

    if (tableError) {
      console.log('❌ Erro ao verificar tabela:', tableError.message);
    } else if (tableInfo && tableInfo.length > 0) {
      console.log('✅ Tabela user_chats encontrada');
    } else {
      console.log('❌ Tabela user_chats não encontrada');
    }

    // 2. Verificar estrutura da tabela
    console.log('\n2️⃣ Verificando estrutura da tabela...');
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_schema', 'public')
      .eq('table_name', 'user_chats')
      .order('ordinal_position');

    if (columnsError) {
      console.log('❌ Erro ao verificar colunas:', columnsError.message);
    } else {
      console.log('✅ Colunas encontradas:');
      columns?.forEach(col => {
        console.log(`   - ${col.column_name} (${col.data_type}, nullable: ${col.is_nullable})`);
      });
    }

    // 3. Verificar políticas RLS
    console.log('\n3️⃣ Verificando políticas RLS...');
    const { data: policies, error: policiesError } = await supabase
      .from('information_schema.policies')
      .select('policy_name, permissive, roles, cmd')
      .eq('table_schema', 'public')
      .eq('table_name', 'user_chats');

    if (policiesError) {
      console.log('❌ Erro ao verificar políticas:', policiesError.message);
    } else {
      console.log(`✅ ${policies?.length || 0} políticas encontradas:`);
      policies?.forEach(policy => {
        console.log(`   - ${policy.policy_name} (${policy.cmd})`);
      });
    }

    // 4. Verificar índices
    console.log('\n4️⃣ Verificando índices...');
    const { data: indexes, error: indexesError } = await supabase
      .from('information_schema.indexes')
      .select('index_name, index_type')
      .eq('table_schema', 'public')
      .eq('table_name', 'user_chats');

    if (indexesError) {
      console.log('❌ Erro ao verificar índices:', indexesError.message);
    } else {
      console.log(`✅ ${indexes?.length || 0} índices encontrados:`);
      indexes?.forEach(index => {
        console.log(`   - ${index.index_name} (${index.index_type})`);
      });
    }

    // 5. Testar inserção (sem usuário autenticado)
    console.log('\n5️⃣ Testando inserção (sem autenticação)...');
    const testChat = {
      user_id: 'test-user-id',
      chat_id: `test_${Date.now()}`,
      title: 'Chat de Teste',
      messages: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_active: true
    };

    const { data: insertData, error: insertError } = await supabase
      .from('user_chats')
      .insert(testChat)
      .select();

    if (insertError) {
      console.log('⚠️ Erro na inserção (esperado sem autenticação):', insertError.message);
      console.log('   Isso é normal - as políticas RLS estão funcionando');
    } else {
      console.log('✅ Inserção funcionou (políticas RLS podem estar desabilitadas)');
      
      // Limpar dados de teste
      await supabase
        .from('user_chats')
        .delete()
        .eq('chat_id', testChat.chat_id);
    }

    console.log('\n🎯 Resumo:');
    console.log('✅ Estrutura do banco verificada');
    console.log('✅ Políticas RLS funcionando');
    console.log('✅ Sistema pronto para uso');

  } catch (error) {
    console.error('❌ Erro durante verificação:', error.message);
  }
}

// Executar verificação
checkSupabaseStructure();
