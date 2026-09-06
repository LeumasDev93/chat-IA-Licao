/* eslint-disable @typescript-eslint/no-explicit-any */
interface BotResponse {
  text: string;
  image?: string;
}

export const generateBotResponse = async (
  userMessage: string,
  language: string = 'pt',
  isNewConversation: boolean = false,
  mode: 'text' | 'image' = 'text'
): Promise<BotResponse> => {
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userMessage, language, isNewConversation, mode }),
    });

    const data = await res.json();

    if (data.image) {
      return { text: typeof data.message === "string" ? data.message : "", image: data.image };
    }

    // Se é uma resposta de fallback, adiciona uma nota informativa
    if (data.fallback) {
      return { 
        text: `${data.message}\n\n💡 *Nota: Esta é uma resposta temporária devido ao alto volume de solicitações. Tente novamente em alguns minutos para obter uma resposta mais detalhada.*` 
      };
    }

    // Se é uma resposta do cache, adiciona uma nota sutil
    if (data.cached) {
      return { 
        text: `${data.message}\n\n⚡ *Resposta rápida do cache*` 
      };
    }

    if (typeof data.message === "string") {
      return { text: data.message };
    }

    // Caso seja objeto com .message.parts
    if (data.message && Array.isArray(data.message.parts)) {
      const fullText = data.message.parts.map((part: any) => part.text).join(" ");
      return { text: fullText };
    }

    // Caso a resposta seja apenas um array parts direto (ex: data.parts)
    if (Array.isArray(data.parts)) {
      const fullText = data.parts.map((part: any) => part.text).join(" ");
      return { text: fullText };
    }

    return { text: "Desculpe, não entendi sua pergunta." };
  } catch (error) {
    console.error("Erro:", error);
    return { 
      text: "Desculpe, estou enfrentando dificuldades técnicas no momento. Por favor, tente novamente em alguns minutos ou consulte diretamente o material da lição da Escola Sabatina." 
    };
  }
};
