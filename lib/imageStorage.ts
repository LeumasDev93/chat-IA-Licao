import { supabaseAdmin, isSupabaseConfigured } from './supabase';

const BUCKET = 'chat-images';
let bucketReady = false;

async function ensureBucket() {
  if (bucketReady) return;
  try {
    const { data } = await supabaseAdmin.storage.getBucket(BUCKET);
    if (!data) {
      await supabaseAdmin.storage.createBucket(BUCKET, {
        public: true,
        fileSizeLimit: 10 * 1024 * 1024,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
      });
    }
    bucketReady = true;
  } catch (err) {
    console.warn('Storage: não foi possível garantir o bucket:', (err as Error).message);
  }
}

/**
 * Sobe uma imagem (data URL base64) para o Supabase Storage e devolve a URL
 * pública. Se o Storage não estiver disponível, devolve a própria data URL
 * (a imagem ainda funciona na sessão, só não persiste ao recarregar).
 */
export async function persistImage(dataUrl: string): Promise<string> {
  const match = /^data:(image\/(png|jpe?g|webp));base64,(.+)$/i.exec(dataUrl);
  if (!match || !isSupabaseConfigured()) return dataUrl;

  const mime = match[1];
  const ext = mime.includes('png') ? 'png' : mime.includes('webp') ? 'webp' : 'jpg';
  const buffer = Buffer.from(match[3], 'base64');

  try {
    await ensureBucket();
    const path = `generated/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
    const { error } = await supabaseAdmin.storage.from(BUCKET).upload(path, buffer, {
      contentType: mime,
      cacheControl: '31536000',
      upsert: false,
    });
    if (error) {
      console.warn('Storage: falha no upload da imagem:', error.message);
      return dataUrl;
    }
    const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);
    return data.publicUrl || dataUrl;
  } catch (err) {
    console.warn('Storage: erro ao persistir imagem:', (err as Error).message);
    return dataUrl;
  }
}
