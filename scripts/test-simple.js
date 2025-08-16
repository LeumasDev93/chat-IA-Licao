#!/usr/bin/env node

async function testSimple() {
  console.log('🧪 Teste simples do sistema...\n');

  try {
    // Teste 1: Verificar se o servidor está rodando
    console.log('1️⃣ Verificando se o servidor está rodando...');
    const response = await fetch('http://localhost:3000/api/cron', {
      method: 'GET',
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Servidor funcionando!');
      console.log('📊 Resposta:', data.message || 'OK');
    } else {
      console.log('❌ Erro no servidor:', response.status, response.statusText);
    }

    // Teste 2: Testar atualização manual
    console.log('\n2️⃣ Testando atualização manual...');
    const updateResponse = await fetch('http://localhost:3000/api/cron', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (updateResponse.ok) {
      const updateData = await updateResponse.json();
      console.log('✅ Atualização funcionando!');
      console.log('📝 Título:', updateData.lesson?.title || 'N/A');
      console.log('🕒 Atualizado em:', updateData.lesson?.lastUpdated || 'N/A');
    } else {
      console.log('❌ Erro na atualização:', updateResponse.status, updateResponse.statusText);
    }

    console.log('\n🎉 Teste concluído!');

  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
    console.log('\n💡 Certifique-se de que o servidor está rodando: npm run dev');
  }
}

// Executar teste
testSimple();
