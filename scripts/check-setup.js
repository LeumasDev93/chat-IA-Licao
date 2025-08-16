const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando configuração do projeto...\n');

// Verificar se o arquivo .env.local existe
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  console.log('✅ Arquivo .env.local encontrado');
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  
  const hasSupabaseUrl = lines.some(line => line.includes('NEXT_PUBLIC_SUPABASE_URL'));
  const hasAnonKey = lines.some(line => line.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY'));
  const hasServiceKey = lines.some(line => line.includes('SUPABASE_SERVICE_ROLE_KEY'));
  
  console.log(`   URL: ${hasSupabaseUrl ? '✅' : '❌'}`);
  console.log(`   Anon Key: ${hasAnonKey ? '✅' : '❌'}`);
  console.log(`   Service Key: ${hasServiceKey ? '✅' : '❌'}`);
  
  if (!hasSupabaseUrl || !hasAnonKey || !hasServiceKey) {
    console.log('\n❌ Variáveis do Supabase não configuradas!');
    console.log('Siga o guia em CONFIGURACAO_SUPABASE.md');
  }
} else {
  console.log('❌ Arquivo .env.local não encontrado!');
  console.log('Crie o arquivo seguindo o guia em CONFIGURACAO_SUPABASE.md');
}

// Verificar se os arquivos necessários existem
const files = [
  'lib/supabase.ts',
  'app/api/chat/scrape-lesson.ts',
  'scripts/create-lesson-table.sql',
  'scripts/test-supabase-connection.js'
];

console.log('\n📁 Verificando arquivos do sistema:');
files.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`   ${file}: ✅`);
  } else {
    console.log(`   ${file}: ❌`);
  }
});

console.log('\n🎯 Próximos passos:');
console.log('1. Configure as variáveis no arquivo .env.local');
console.log('2. Execute: npm run test-supabase');
console.log('3. Crie a tabela no Supabase SQL Editor');
console.log('4. Teste o sistema com: npm run dev');
