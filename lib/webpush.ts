import webpush from "web-push";

// Chaves VAPID (geradas com `npx web-push generate-vapid-keys`).
// A pública também é exposta ao cliente como NEXT_PUBLIC_VAPID_PUBLIC_KEY.
const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;
// Deve ser um mailto: ou uma URL do responsável pelo serviço.
const subject = process.env.VAPID_SUBJECT || "mailto:contato@iasdlicao.cv";

let configured = false;

/**
 * Retorna a instância do web-push já configurada com as chaves VAPID.
 * Lança um erro claro se as variáveis de ambiente não estiverem definidas —
 * assim o build/import não quebra, só a rota que realmente precisa enviar push.
 */
export function getWebPush(): typeof webpush {
  if (!configured) {
    if (!publicKey || !privateKey) {
      throw new Error(
        "Chaves VAPID não configuradas (NEXT_PUBLIC_VAPID_PUBLIC_KEY e VAPID_PRIVATE_KEY)"
      );
    }
    webpush.setVapidDetails(subject, publicKey, privateKey);
    configured = true;
  }
  return webpush;
}

export function isWebPushConfigured(): boolean {
  return !!(publicKey && privateKey);
}

export default webpush;
