// Rate limiting simples em memória (janela deslizante por chave, geralmente o IP).
//
// Observação: o estado vive no processo. No Vercel, cada instância serverless tem
// o seu próprio mapa, então o limite real é "por instância". Isto é suficiente para
// conter abuso acidental e picos de um mesmo cliente. Para um limite global e
// preciso, migrar para um store compartilhado (ex.: Upstash Redis).

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

// Limpeza periódica para o mapa não crescer indefinidamente.
let lastSweep = 0;
function sweep(now: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  /** Segundos até a janela reiniciar. */
  retryAfter: number;
}

/**
 * Consome uma unidade da cota de `key`.
 * @param key      Identificador do cliente (IP, userId, etc).
 * @param limit    Máximo de requisições permitidas na janela.
 * @param windowMs Duração da janela em milissegundos.
 */
export function rateLimit(key: string, limit = 20, windowMs = 60_000): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, limit, remaining: limit - 1, retryAfter: 0 };
  }

  if (bucket.count >= limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      retryAfter: Math.ceil((bucket.resetAt - now) / 1000),
    };
  }

  bucket.count += 1;
  return {
    success: true,
    limit,
    remaining: limit - bucket.count,
    retryAfter: 0,
  };
}

/** Extrai o IP do cliente a partir dos headers de proxy (Vercel/Next). */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.headers.get('x-real-ip') ?? 'unknown';
}
