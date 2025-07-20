import webpush from 'web-push';

const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
const privateKey = process.env.VAPID_PRIVATE_KEY!;

if (!publicKey || !privateKey) {
    throw new Error('VAPID keys não configuradas');
}

webpush.setVapidDetails(
    'mailto:nelsonandrade1593@gmail.com',
    publicKey,
    privateKey
);

export default webpush;
