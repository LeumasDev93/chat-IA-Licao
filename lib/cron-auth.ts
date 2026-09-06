/**
 * Autoriza requisições a endpoints internos de manutenção (cron / atualização
 * de lição). O Vercel Cron envia `Authorization: Bearer <CRON_SECRET>`.
 * Também aceitamos o header `x-cron-secret` para disparo manual autenticado.
 */
export function isAuthorizedCronRequest(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error('CRON_SECRET não configurado — bloqueando requisição interna');
    return false;
  }

  if (req.headers.get('authorization') === `Bearer ${secret}`) return true;
  if (req.headers.get('x-cron-secret') === secret) return true;

  return false;
}
