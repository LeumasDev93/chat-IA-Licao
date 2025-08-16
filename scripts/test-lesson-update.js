#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Simula o ambiente do Vercel
process.env.VERCEL = 'true';

async function testLessonUpdate() {
  console.log('🧪 Testando sistema de atualização de lições...\n');

  try {
    // Teste 1: Verificar se o endpoint responde
    console.log('1️⃣ Testando endpoint de atualização...');
    const response = await fetch('http://localhost:3000/api/cron', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Endpoint funcionando!');
      console.log('📝 Título da lição:', data.lesson?.title || 'N/A');
      console.log('🕒 Última atualização:', data.lesson?.lastUpdated || 'N/A');
    } else {
      console.log('❌ Erro no endpoint:', response.status, response.statusText);
    }

    // Teste 2: Verificar cache
    console.log('\n2️⃣ Verificando cache...');
    const cachePath = '/tmp/lesson-cache.json';
    if (fs.existsSync(cachePath)) {
      const cacheData = JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
      console.log('✅ Cache encontrado!');
      console.log('📁 Tamanho do cache:', JSON.stringify(cacheData).length, 'bytes');
      console.log('⏰ Expira em:', cacheData.expiresAt);
    } else {
      console.log('⚠️ Cache não encontrado (normal se for primeira execução)');
    }

    // Teste 3: Verificar status
    console.log('\n3️⃣ Testando endpoint de status...');
    const statusResponse = await fetch('http://localhost:3000/api/cron');
    
    if (statusResponse.ok) {
      const statusData = await statusResponse.json();
      console.log('✅ Status endpoint funcionando!');
      console.log('📊 Status:', statusData.message);
    } else {
      console.log('❌ Erro no status endpoint:', statusResponse.status);
    }

    console.log('\n🎉 Testes concluídos!');

  } catch (error) {
    console.error('❌ Erro durante os testes:', error.message);
    console.log('\n💡 Certifique-se de que o servidor está rodando: npm run dev');
  }
}

// Executar testes
testLessonUpdate();
