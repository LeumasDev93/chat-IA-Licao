#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase (substitua pelas suas credenciais)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'sua_url_do_supabase';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sua_chave_anonima';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testChatHistory() {
  console.log('🧪 Testando sistema de histórico de chat...\n');

  try {
    // Teste 1: Verificar se as tabelas existem
    console.log('1️⃣ Verificando estrutura das tabelas...');
    
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['user_chats', 'chat_messages']);

    if (tablesError) {
      console.log('❌ Erro ao verificar tabelas:', tablesError.message);
    } else {
      console.log('✅ Tabelas encontradas:', tables.map(t => t.table_name));
    }

    // Teste 2: Verificar se a view existe
    console.log('\n2️⃣ Verificando view chat_with_messages...');
    
    const { data: viewData, error: viewError } = await supabase
      .from('chat_with_messages')
      .select('*')
      .limit(1);

    if (viewError) {
      console.log('❌ Erro na view:', viewError.message);
    } else {
      console.log('✅ View funcionando!');
    }

    // Teste 3: Testar inserção de chat (se houver usuário autenticado)
    console.log('\n3️⃣ Testando operações CRUD...');
    
    // Simular dados de teste
    const testChat = {
      user_id: 'test-user-id',
      chat_id: `test_chat_${Date.now()}`,
      title: 'Chat de Teste',
      messages: [
        {
          id: '1',
          role: 'user',
          content: 'Olá, como você pode me ajudar?',
          timestamp: new Date().toISOString()
        },
        {
          id: '2',
          role: 'assistant',
          content: 'Olá! Posso ajudar com as lições da Escola Sabatina.',
          timestamp: new Date().toISOString()
        }
      ],
      lesson_context: {
        title: 'Lição de Teste',
        week: '1'
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Teste de inserção (pode falhar se não houver usuário autenticado)
    const { data: insertData, error: insertError } = await supabase
      .from('user_chats')
      .insert(testChat)
      .select();

    if (insertError) {
      console.log('⚠️ Erro na inserção (normal se não autenticado):', insertError.message);
    } else {
      console.log('✅ Chat inserido com sucesso!');
      
      // Teste de atualização
      const { error: updateError } = await supabase
        .from('user_chats')
        .update({ title: 'Chat Atualizado' })
        .eq('chat_id', testChat.chat_id);

      if (updateError) {
        console.log('❌ Erro na atualização:', updateError.message);
      } else {
        console.log('✅ Chat atualizado com sucesso!');
      }

      // Teste de exclusão
      const { error: deleteError } = await supabase
        .from('user_chats')
        .delete()
        .eq('chat_id', testChat.chat_id);

      if (deleteError) {
        console.log('❌ Erro na exclusão:', deleteError.message);
      } else {
        console.log('✅ Chat deletado com sucesso!');
      }
    }

    // Teste 4: Verificar políticas RLS
    console.log('\n4️⃣ Verificando políticas de segurança...');
    
    const { data: policies, error: policiesError } = await supabase
      .from('information_schema.policies')
      .select('*')
      .eq('table_schema', 'public')
      .in('table_name', ['user_chats', 'chat_messages']);

    if (policiesError) {
      console.log('❌ Erro ao verificar políticas:', policiesError.message);
    } else {
      console.log('✅ Políticas encontradas:', policies.length);
      policies.forEach(policy => {
        console.log(`   - ${policy.table_name}: ${policy.policy_name}`);
      });
    }

    // Teste 5: Verificar índices
    console.log('\n5️⃣ Verificando índices...');
    
    const { data: indexes, error: indexesError } = await supabase
      .from('information_schema.indexes')
      .select('*')
      .eq('table_schema', 'public')
      .in('table_name', ['user_chats', 'chat_messages']);

    if (indexesError) {
      console.log('❌ Erro ao verificar índices:', indexesError.message);
    } else {
      console.log('✅ Índices encontrados:', indexes.length);
      indexes.forEach(index => {
        console.log(`   - ${index.table_name}: ${index.index_name}`);
      });
    }

    console.log('\n🎉 Teste do sistema de histórico concluído!');
    console.log('\n💡 Para testar completamente, você precisa:');
    console.log('   1. Configurar as variáveis de ambiente do Supabase');
    console.log('   2. Executar a migração no Supabase');
    console.log('   3. Autenticar um usuário');

  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
  }
}

// Executar teste
testChatHistory();
