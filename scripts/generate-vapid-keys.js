const webpush = require('web-push');

// Gerar chaves VAPID
const vapidKeys = webpush.generateVAPIDKeys();

console.log('VAPID Keys geradas:');
console.log('');
console.log('Public Key (adicione ao .env como NEXT_PUBLIC_VAPID_PUBLIC_KEY):');
console.log(vapidKeys.publicKey);
console.log('');
console.log('Private Key (adicione ao .env como VAPID_PRIVATE_KEY):');
console.log(vapidKeys.privateKey);
console.log('');
console.log('Adicione estas variáveis ao seu arquivo .env:');
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);