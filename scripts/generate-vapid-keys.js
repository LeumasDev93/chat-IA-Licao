// Script para gerar chaves VAPID para push notifications
// Execute com: node scripts/generate-vapid-keys.js

import crypto from 'crypto';

function generateVAPIDKeys() {
  // Função simples para gerar chaves VAPID
  // Em produção, use uma biblioteca como 'web-push' para gerar chaves reais
  
  // Gerar chaves aleatórias (isso é apenas um exemplo)
  const publicKey = crypto.randomBytes(32).toString('base64url');
  const privateKey = crypto.randomBytes(32).toString('base64url');
  
  console.log('VAPID Keys geradas (EXEMPLO - Use web-push em produção):');
  console.log('');
  console.log('Public Key (adicione ao .env como NEXT_PUBLIC_VAPID_PUBLIC_KEY):');
  console.log(publicKey);
  console.log('');
  console.log('Private Key (adicione ao .env como VAPID_PRIVATE_KEY):');
  console.log(privateKey);
  console.log('');
  console.log('Adicione estas variáveis ao seu arquivo .env:');
  console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${publicKey}`);
  console.log(`VAPID_PRIVATE_KEY=${privateKey}`);
  console.log('');
  console.log('IMPORTANTE: Para produção, use a biblioteca web-push:');
  console.log('npm install web-push');
  console.log('const webpush = require("web-push");');
  console.log('const vapidKeys = webpush.generateVAPIDKeys();');
}

generateVAPIDKeys();