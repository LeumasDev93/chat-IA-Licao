/* eslint-disable @typescript-eslint/no-explicit-any */
interface BotResponse {
  text: string;
}

export const generateBotResponse = async (userMessage: string): Promise<BotResponse> => {
  // const fallbackResponses: { [key: string]: string } = {
  //   direitos:
  //     "Os trabalhadores domésticos têm direito a: salário mínimo, 13º salário, férias remuneradas, FGTS, horas extras, adicional noturno e muito mais. Qual direito específico você gostaria de conhecer melhor?",
  //   registro:
  //     "Para registrar um trabalhador doméstico, são necessários: RG, CPF, carteira de trabalho, comprovante de residência e uma foto 3x4. Posso te explicar o passo a passo do registro.",
  //   salário:
  //     "O salário do trabalhador doméstico não pode ser inferior ao mínimo vigente. Além disso, têm direito a vale-transporte, férias remuneradas e 13º salário.",
  //   inps:
  //     "O pagamento das contribuições sociais é obrigatório em Cabo Verde. O empregador deve contribuir com 15% do salário para o INPS (parte patronal), enquanto o trabalhador contribui com 8%.",
  // };

  // Busca por palavras-chave para resposta hardcoded
  // const lower = userMessage.toLowerCase();
  // for (const key in fallbackResponses) {
  //   if (lower.includes(key)) {
  //     return { text: fallbackResponses[key] };
  //   }
  // }

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userMessage }),
    });

    const data = await res.json();

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
    return { text: "Desculpe, houve um erro ao tentar responder." };
  }
};
