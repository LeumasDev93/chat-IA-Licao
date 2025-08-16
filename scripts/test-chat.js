#!/usr/bin/env node

async function testChat() {
  console.log('🧪 Testando Chat IA...\n');

  try {
    // Teste 1: Mensagem simples
    console.log('1️⃣ Testando mensagem simples...');
    const response1 = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userMessage: 'Olá, como você pode me ajudar com a lição desta semana?'
      }),
    });

    if (response1.ok) {
      const data1 = await response1.json();
      console.log('✅ Chat funcionando!');
      console.log('🤖 Resposta:', data1.message.substring(0, 100) + '...');
    } else {
      console.log('❌ Erro no chat:', response1.status, response1.statusText);
      const errorData = await response1.json();
      console.log('📝 Detalhes do erro:', errorData);
    }

    // Teste 2: Pergunta sobre a lição
    console.log('\n2️⃣ Testando pergunta sobre a lição...');
    const response2 = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userMessage: 'Qual é o tema principal da lição desta semana?'
      }),
    });

    if (response2.ok) {
      const data2 = await response2.json();
      console.log('✅ Pergunta respondida!');
      console.log('🤖 Resposta:', data2.message.substring(0, 150) + '...');
    } else {
      console.log('❌ Erro na pergunta:', response2.status, response2.statusText);
    }

    console.log('\n🎉 Teste do chat concluído!');

  } catch (error) {
    console.error('❌ Erro durante o teste do chat:', error.message);
    console.log('\n💡 Certifique-se de que o servidor está rodando: npm run dev');
  }
}

// Executar teste
testChat();
