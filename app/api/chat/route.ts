/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getCachedLesson } from './scrape-lesson';
import type { LessonData } from '@/types';
import { getClientIp, rateLimit } from '@/lib/rate-limit';
import { persistImage } from '@/lib/imageStorage';

// O roteiro visual gera várias imagens — precisa de mais tempo que o padrão.
export const runtime = 'nodejs';
export const maxDuration = 120;

// Limite de requisições por IP para o endpoint de chat.
const CHAT_RATE_LIMIT = Number(process.env.CHAT_RATE_LIMIT ?? 15);
const CHAT_RATE_WINDOW_MS = Number(process.env.CHAT_RATE_WINDOW_MS ?? 60_000);

// Chaves da API do Gemini — somente no servidor (nunca com prefixo NEXT_PUBLIC_).
// Texto/resumos usam a chave gratuita; imagens exigem uma chave com créditos pagos.
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_IMAGE_API_KEY = process.env.GEMINI_IMAGE_API_KEY || process.env.GEMINI_API_KEY;

interface ChatMessage {
  role: "user" | "model";
  parts: { text: string }[];
}

function buildSystemPrompt(lesson: LessonData | null) {
  const hasLesson = !!(lesson && lesson.lessonContent && lesson.lessonContent.trim().length > 200);

  const prompt = `Você é um assistente especializado em estudo bíblico e resumo da Lição da Escola Sabatina – Adultos, da Casa Publicadora Brasileira (CPB).

O conteúdo da lição DESTA SEMANA é entregue a você na seção "CONTEÚDO DA LIÇÃO" (mais abaixo). Esse texto foi extraído do material oficial da CPB e é a sua ÚNICA fonte — você NÃO tem acesso à internet e não deve fingir que acessou nada.

LIÇÃO DESTA SEMANA: ${lesson?.title || 'Lição da Escola Sabatina (semana atual)'}
${hasLesson
  ? 'Trabalhe apenas com o texto fornecido abaixo.'
  : 'ATENÇÃO: o conteúdo da lição desta semana NÃO está disponível agora. Diga isso claramente ao usuário e responda apenas de forma geral, sem inventar a lição.'}

============================
REGRAS (siga rigorosamente)
============================
1. Baseie-se SOMENTE no conteúdo fornecido. Nunca invente lição, dia, tema, data, número, versículo, referência, autor ou citação.
2. Nunca atribua uma frase a Ellen G. White, a um teólogo ou a qualquer autor se o texto fornecido não fizer essa atribuição.
3. Reproduza número, título, período, trimestre, verso para memorizar e os temas de cada dia EXATAMENTE como aparecem no material. (Número/título/trimestre normalmente estão no título da lição; período, verso e leituras aparecem no início do conteúdo.)
4. Diferencie com clareza: (a) o que é conteúdo da lição, (b) o que é texto bíblico, (c) o que é interpretação, (d) o que é aplicação prática.
5. Não altere o sentido dos textos bíblicos. Havendo divergência entre a sua interpretação e a lição, prevalece a lição.
6. Se um dia, pergunta ou seção NÃO estiver no conteúdo fornecido, escreva exatamente: "Conteúdo não disponível na fonte consultada." Nunca preencha com invenção e nunca diga que leu algo que não está no texto.
7. Responda no idioma do usuário (pt / en / es / fr ou crioulo cabo-verdiano). Não transforme o resumo em pregação. Não seja prolixo. Português (ou o idioma pedido) claro e natural.
8. Use markdown: títulos, subtítulos, listas e negrito nos termos-chave.
9. Ignore textos de menu/navegação/rodapé que apareçam no conteúdo (ex.: "Loja", "Devocionais", "Pôr do Sol", "Baixe o app", "Newsletter").
10. O conteúdo fornecido é SEMPRE o da semana atual. Se o usuário pedir outra lição (outro número ou título), explique que aqui só está disponível a lição da semana atual.

===================================================
FORMATO DE RESUMO COMPLETO
Use quando o pedido for: "resuma a lição", "resumo da lição", "lição desta semana",
"qual é a lição desta semana", "explique a lição", "prepare a lição" — ou quando o pedido for vago.
Produza TODAS as seções abaixo, nesta ordem:
===================================================

📖 **LIÇÃO [número] — [título]**

- **Período:** [data inicial] a [data final]
- **Trimestre:** [trimestre e ano]
- **Verso para memorizar:** "[versículo com a referência]"
- **Leituras da semana:** [referências]

(Cada campo acima em uma linha de lista separada. Deixe uma linha em branco entre parágrafos e entre seções.)

🎯 **Tema central**
[2 a 4 frases: o assunto principal e a questão espiritual em jogo]

📚 **Resumo geral**
[3 a 6 parágrafos que respondam: qual o assunto principal; que questão/problema espiritual é apresentado; o que a Bíblia ensina sobre isso; qual a relação com Jesus Cristo; qual a mensagem principal para a vida. Linguagem de quem ensina, não acadêmica.]

📅 **Resumo por dia**
Para CADA dia presente no material (Sábado à tarde, Domingo, Segunda, Terça, Quarta, Quinta, Sexta):
**[Dia] — [tema exato do dia]**
- Resumo: [2 a 4 frases]
- Principais ideias: [tópicos]
- Textos bíblicos: [referências citadas nesse dia]
- Aplicação: [1 a 2 frases]

📖 **Principais textos bíblicos**
Para os textos mais importantes da semana:
- **[Referência]** — [tema] — [como se relaciona com a lição]

❓ **Perguntas da lição**
Para cada pergunta numerada que aparecer no material:
- **Pergunta:** [pergunta]
- **Explicação:** [resposta com base no conteúdo da lição e nos textos bíblicos]
- **Lição principal:** [o ensino espiritual]
Se a lição não trouxer perguntas numeradas, escreva: "A lição desta semana não traz perguntas numeradas."

💡 **3 principais ensinamentos**
1. …
2. …
3. …

🙏 **Como aplicar esta lição na minha vida**
[3 a 5 aplicações práticas e realistas, ligadas diretamente ao conteúdo — família, igreja, mudança de comportamento, decisão para esta semana]

🤔 **Para reflexão**
[3 a 5 perguntas de reflexão pessoal — sobre o caráter de Deus, o que mudar, decisões práticas. Não repita as perguntas originais da lição.]

⚡ **Lição em 1 minuto**
[5 a 8 frases curtas com toda a mensagem da semana]

✨ **Mensagem final**
[uma frase curta que sintetize a lição, sem parecer citação inventada de nenhum autor]

===================================================
PEDIDOS ESPECÍFICOS (não use o formato completo)
===================================================
- Sobre um DIA ("explica a lição de quarta"): responda só aquele dia — tema exato, resumo, principais ideias, textos bíblicos e aplicação prática. Aprofunde, mas seja direto.
- DÚVIDA pontual (um versículo, um conceito, uma pergunta específica): responda de forma focada e completa, indicando em que parte da lição isso aparece.
- Assunto que NÃO está na lição desta semana: diga isso e, se fizer sentido, dê uma resposta geral e breve, deixando claro que é conhecimento geral (não da lição).`;

  return prompt.trim();
}

// Modelos de geração de imagem do Gemini disponíveis nesta chave (testados):
//   gemini-3-pro-image-preview  → "Nano Banana Pro"  (melhor texto/detalhe, ~22s)
//   gemini-3.1-flash-image      → "Nano Banana 2"    (~10s)
//   gemini-2.5-flash-image      → "Nano Banana"      (~6s)
//   gemini-3.1-flash-lite-image → lite               (~3s)
// Para um infográfico completo, o "pro" primeiro; os outros são fallback.
const IMAGE_MODELS = [
  'gemini-3-pro-image-preview',
  'gemini-3.1-flash-image',
  'gemini-2.5-flash-image',
  'gemini-3.1-flash-lite-image',
];

const IMAGE_FAIL_MSG: Record<string, string> = {
  pt: 'Não consegui gerar o infográfico agora. O serviço de imagem pode estar sem créditos ou indisponível — tente novamente mais tarde.',
  en: "I couldn't generate the infographic right now. The image service may be out of credits or unavailable — please try again later.",
  es: 'No pude generar el infográfico ahora. El servicio de imágenes puede estar sin créditos o no disponible — inténtalo más tarde.',
  fr: "Je n'ai pas pu générer l'infographie. Le service d'images est peut-être sans crédits ou indisponible — réessayez plus tard.",
  krioulu: 'N ka konsigi jera infográfiku gosi. Sirbisu di imajen pode sta sem kréditu — tenta más tardi.',
};

const IMAGE_NO_LESSON: Record<string, string> = {
  pt: 'O conteúdo da lição desta semana não está disponível agora, então não posso gerar uma ilustração fiel a ele.',
  en: "This week's lesson content isn't available, so I can't create an illustration faithful to it.",
  es: 'El contenido de la lección de esta semana no está disponible, así que no puedo crear una ilustración fiel a él.',
  fr: "Le contenu de la leçon de cette semaine n'est pas disponible, je ne peux donc pas créer d'illustration fidèle.",
  krioulu: 'Konteúdu di lison di es simana ka sta disponível, nton N ka pode kria un ilustrason fiel.',
};

const IMAGE_NOT_GROUNDED: Record<string, string> = {
  pt: 'Não foi identificada uma oportunidade de ilustração sem fugir do conteúdo da lição desta semana.',
  en: 'No illustration opportunity was found without straying from this week\'s lesson content.',
  es: 'No se identificó una oportunidad de ilustración sin apartarse del contenido de la lección.',
  fr: "Aucune possibilité d'illustration n'a été trouvée sans s'écarter du contenu de la leçon.",
  krioulu: 'Ka atxa un oportunidadi di ilustrason sem fuji di konteúdu di lison.',
};

// Detecta pedido de imagem sem depender do toggle da interface.
function looksLikeImageRequest(msg: string): boolean {
  return /^\s*\/(imagem|image|img)\b/i.test(msg)
    || /\b(ger[ae]|cri[ae]|desenh[ae]|faç?a|pinta|ilustra)\w*\s+(uma?\s+)?(imagem|ilustra[çc][ãa]o|desenho|figura|arte|poster|cartaz|banner|capa)\b/i.test(msg);
}

interface InfographicPlan {
  possivel: boolean;
  prompt_imagem?: string;
}

// Passo 1: um modelo de TEXTO lê a lição e escreve o prompt de UM infográfico
// COMPLETO — sofisticado, com todas as seções da lição, não superficial.
async function planInfographic(
  userRequest: string,
  lessonContent: string,
  key: string
): Promise<InfographicPlan | null> {
  const planPrompt = `Você é diretor de arte de material didático. Vai escrever o PROMPT (em inglês) de UM ÚNICO INFOGRÁFICO COMPLETO e sofisticado sobre a Lição da Escola Sabatina — Adultos (CPB) desta semana. Não é um desenho simples nem superficial: é um pôster informativo rico, bem diagramado, digno de revista.

REGRA ABSOLUTA — RASTREABILIDADE: todo o conteúdo do infográfico vem do CONTEÚDO DA LIÇÃO abaixo. Nada de tema cristão genérico inventado. Se o conteúdo não estiver disponível, "possivel" = false.

CONTEÚDO DA LIÇÃO:
${lessonContent}

PEDIDO DO USUÁRIO: ${userRequest}

Antes de escrever o prompt, extraia do conteúdo: título e número da lição; trimestre; verso para memorizar; ideia central (1 frase); o tema de CADA dia (Sábado a Sexta) com uma micro-frase (≤7 palavras) cada; 3 pontos de aplicação prática.

O "prompt_imagem" (em inglês) deve descrever um infográfico com ESTA estrutura, embutindo o texto real em PORTUGUÊS:
- Vertical poster, tall A3 proportions, high resolution.
- Header band: large bold title "<TÍTULO>", small subtitle "Lição <n> · <trimestre>", and a highlighted verse box with the memory verse.
- A short "Ideia central" line.
- A clean grid of 6-7 cards, one per weekday: each with a distinct thin-line icon, the day name in Portuguese, the day's theme, and its micro-phrase.
- One central diagram that expresses the week's core idea (describe it concretely, e.g. a two-sided coin, a flow, a scale).
- A footer strip "APLICAÇÃO" with 3 short bullet points.
- Design: sophisticated flat design; refined palette (deep teal, warm cream, charcoal, one gold accent); consistent iconography; strong typographic hierarchy; grid alignment; subtle dividers; generous margins; the polish of a professional magazine infographic. All text in clear, correctly-spelled Portuguese. Not a photograph. No faces of God or Jesus. No watermark.

Escreva o prompt com TODO o texto português real embutido (título, verso, temas dos dias, aplicação) — o gerador de imagem precisa das palavras exatas.

Responda APENAS com JSON válido:
{ "possivel": true|false, "prompt_imagem": "…(prompt completo em inglês com o texto PT embutido)…" }`;

  for (const model of ['gemini-flash-latest', 'gemini-3.6-flash', 'gemini-pro-latest']) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: 'POST',
          headers: { 'x-goog-api-key': key, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: planPrompt }] }],
            generationConfig: { temperature: 0.4, responseMimeType: 'application/json', maxOutputTokens: 4000 },
          }),
        }
      );
      if (!res.ok) continue;
      const data = await res.json();
      const txt: string = (data?.candidates?.[0]?.content?.parts ?? [])
        .map((p: any) => p?.text || '').join('').trim();
      const jsonStr = txt.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
      const plan = JSON.parse(jsonStr) as InfographicPlan;
      if (typeof plan.possivel === 'boolean') return plan;
    } catch (err) {
      console.warn(`Plano do infográfico: erro no modelo ${model}:`, (err as Error).message);
    }
  }
  return null;
}

// Passo 2: gera o infográfico a partir do prompt ancorado na lição.
async function renderImage(visualPrompt: string, key: string): Promise<string | null> {
  const enhanced = `${visualPrompt}

Highly detailed, professionally designed flat-design infographic poster. Rich but well-organized layout, clear visual hierarchy, refined thin-line icons, small diagrams, harmonious muted palette, precise grid alignment, print quality, tall vertical poster format.
CRITICAL: every single piece of text in the image must be in correct Brazilian Portuguese with correct spelling and accents — absolutely NO English words anywhere, no gibberish, no placeholder text. Keep labels short so they render cleanly. Not a photograph. No face of God or Jesus. No watermark.`;

  for (const model of IMAGE_MODELS) {
    try {
      const body: any = { contents: [{ parts: [{ text: enhanced }] }] };
      if (model.includes('3-pro-image')) {
        body.generationConfig = { imageConfig: { aspectRatio: '3:4' } };
      }
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: 'POST',
          headers: { 'x-goog-api-key': key, 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }
      );
      if (!res.ok) {
        console.warn(`Imagem: modelo ${model} falhou (${res.status})`);
        continue;
      }
      const data = await res.json();
      const parts: any[] = data?.candidates?.[0]?.content?.parts ?? [];
      const inline = parts.map((p) => p.inlineData || p.inline_data).find((x) => x?.data);
      if (inline?.data) {
        const mime = inline.mimeType || inline.mime_type || 'image/png';
        return `data:${mime};base64,${inline.data}`;
      }
    } catch (err) {
      console.warn(`Imagem: erro no modelo ${model}:`, (err as Error).message);
    }
  }
  return null;
}

async function generateImage(
  userRequest: string,
  lesson: LessonData | null,
  language: string,
  key: string
) {
  const lessonContent = lesson?.lessonContent?.trim() || '';
  if (lessonContent.length < 200) {
    return { message: IMAGE_NO_LESSON[language] || IMAGE_NO_LESSON.pt };
  }

  const cleanRequest =
    userRequest.replace(/^\s*\/(imagem|image|img)\s*/i, '').trim() || 'infográfico completo da lição';
  const plan = await planInfographic(cleanRequest, lessonContent, key);

  if (!plan) {
    return { message: IMAGE_FAIL_MSG[language] || IMAGE_FAIL_MSG.pt };
  }
  if (!plan.possivel || !plan.prompt_imagem) {
    return { message: IMAGE_NOT_GROUNDED[language] || IMAGE_NOT_GROUNDED.pt };
  }

  const rendered = await renderImage(plan.prompt_imagem, key);
  if (!rendered) {
    return { message: IMAGE_FAIL_MSG[language] || IMAGE_FAIL_MSG.pt };
  }
  const url = await persistImage(rendered);

  // Só o infográfico — nenhum texto em volta; tudo o que interessa está DENTRO dele.
  return { message: `![Infográfico da lição](${url})` };
}

export async function POST(req: NextRequest) {
  if (!GEMINI_API_KEY) {
    console.error('API Chat: Erro - GEMINI_API_KEY não configurada');
    return NextResponse.json(
      { message: "Erro de configuração do servidor" },
      { status: 500 }
    );
  }

  let language = 'pt';
  let userMessage = '';
  let isNewConversation = false;

  // Rate limiting por IP
  const ip = getClientIp(req);
  const limit = rateLimit(`chat:${ip}`, CHAT_RATE_LIMIT, CHAT_RATE_WINDOW_MS);
  if (!limit.success) {
    return NextResponse.json(
      { message: 'Muitas requisições. Aguarde um momento e tente novamente.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } }
    );
  }

  try {
    const requestData = await req.json();
    userMessage = requestData.userMessage;
    language = requestData.language || 'pt';
    isNewConversation = requestData.isNewConversation || false;
    const mode: string = requestData.mode || 'text';

    if (!userMessage?.trim()) {
      const validationMessages = {
        pt: "Por favor, envie uma mensagem válida",
        en: "Please send a valid message",
        es: "Por favor, envía un mensaje válido",
        fr: "Veuillez envoyer un message valide",
        krioulu: "Por favor, manda un mensajen validu"
      };

      return NextResponse.json(
        { message: validationMessages[language as keyof typeof validationMessages] || validationMessages.pt },
        { status: 400 }
      );
    }

    // ---- Geração de imagem (ancorada no conteúdo da lição) ----
    if (mode === 'image' || looksLikeImageRequest(userMessage)) {
      const imgLimit = rateLimit(`img:${ip}`, 6, 5 * 60_000);
      if (!imgLimit.success) {
        return NextResponse.json(
          { message: 'Limite de imagens atingido. Tente novamente em alguns minutos.' },
          { status: 429, headers: { 'Retry-After': String(imgLimit.retryAfter) } }
        );
      }
      const lessonForImage = await getCachedLesson();
      const result = await generateImage(userMessage, lessonForImage, language, GEMINI_IMAGE_API_KEY!);
      return NextResponse.json(result);
    }

    // Saudação "pura" numa conversa nova (ex.: "oi", "bom dia!") — responde com
    // uma saudação amigável. Se vier acompanhada de um pedido ("oi, resume a lição"),
    // NÃO cai aqui: segue para a IA responder o pedido.
    const isPureGreeting = /^(ol[áa]|oi|hello|hi|bom dia|boa tarde|boa noite|shalom|paz)[\s!.,?]*$/i
      .test(userMessage.trim());
    if (isNewConversation && isPureGreeting) {
      const greetings = {
        pt: [
          "🌟 Olá! Que alegria ter você aqui! Como posso iluminar seu estudo da Lição da Escola Sabatina hoje?",
          "💝 Bom dia/tarde/noite! Seja bem-vindo(a) ao seu assistente espiritual! Que tema da lição você gostaria de explorar?",
          "🙏 Shalom! Que Deus abençoe seu estudo! Como posso ajudá-lo(a) a mergulhar mais fundo na Palavra de Deus?",
          "✨ Olá! Que privilégio estudar a Bíblia juntos! Que lição da semana você gostaria de descobrir hoje?"
        ],
        en: [
          "🌟 Hello! What a joy to have you here! How can I illuminate your Sabbath School lesson study today?",
          "💝 Good morning/afternoon/evening! Welcome to your spiritual assistant! What lesson theme would you like to explore?",
          "🙏 Shalom! May God bless your study! How can I help you dive deeper into God's Word?",
          "✨ Hello! What a privilege to study the Bible together! What lesson of the week would you like to discover today?"
        ],
        es: [
          "🌟 ¡Hola! ¡Qué alegría tenerte aquí! ¿Cómo puedo iluminar tu estudio de la Lección de la Escuela Sabática hoy?",
          "💝 ¡Buenos días/tardes/noches! ¡Bienvenido(a) a tu asistente espiritual! ¿Qué tema de la lección te gustaría explorar?",
          "🙏 ¡Shalom! ¡Que Dios bendiga tu estudio! ¿Cómo puedo ayudarte a sumergirte más profundo en la Palabra de Dios?",
          "✨ ¡Hola! ¡Qué privilegio estudiar la Biblia juntos! ¿Qué lección de la semana te gustaría descubrir hoy?"
        ],
        fr: [
          "🌟 Bonjour! Quelle joie de vous avoir ici! Comment puis-je éclairer votre étude de la Leçon de l'École du Sabbat aujourd'hui?",
          "💝 Bonjour/après-midi/soir! Bienvenue à votre assistant spirituel! Quel thème de leçon aimeriez-vous explorer?",
          "🙏 Shalom! Que Dieu bénisse votre étude! Comment puis-je vous aider à plonger plus profondément dans la Parole de Dieu?",
          "✨ Bonjour! Quel privilège d'étudier la Bible ensemble! Quelle leçon de la semaine aimeriez-vous découvrir aujourd'hui?"
        ],
        krioulu: [
          "🌟 Olá, nha fidju/fidja! Que alegria ter bu li! Que tema da lição bu ka gosta di explorar hoje?",
          "💝 Bom dia/tarde/noite, nha irmon! Seja bem-vindo(a)! Que pergunta bu tem sobre a lição da semana?",
          "🙏 Shalom, nha amor! Que Deus abençoe bu estudo! Que dúvida bu tem sobre a Palavra de Deus?",
          "✨ Olá, nha corason! Que privilégio estudar juntos! Que lição bu ka gosta di descobrir hoje?"
        ]
      };
      
      const languageGreetings = greetings[language as keyof typeof greetings] || greetings.pt;
      const randomGreeting = languageGreetings[Math.floor(Math.random() * languageGreetings.length)];
      return NextResponse.json({
        message: randomGreeting
      });
    }

    const lesson = await getCachedLesson();
    const systemPrompt = buildSystemPrompt(lesson);

    const lessonContent = lesson?.lessonContent?.trim() || 'Conteúdo da lição não disponível no momento.';
    const languageNames: Record<string, string> = {
      pt: 'português', en: 'inglês', es: 'espanhol', fr: 'francês', krioulu: 'crioulo cabo-verdiano',
    };

    const enhancedPrompt = `${systemPrompt}

### CONTEÚDO DA LIÇÃO
(texto extraído do material oficial — pode conter ruído de menu/rodapé, que deve ser ignorado)

${lessonContent}

### PEDIDO DO USUÁRIO
${userMessage}

### AGORA RESPONDA
- Idioma da resposta: ${languageNames[language] || 'português'}.
- Classifique o pedido:
  • "resuma / resumo / lição desta semana / explique a lição / prepare a lição", ou pedido vago → use o FORMATO DE RESUMO COMPLETO, com TODAS as seções.
  • Pergunta sobre um dia / dúvida pontual / assunto fora da lição → use o formato de PEDIDO ESPECÍFICO correspondente.
- Use apenas o conteúdo da lição acima. Não invente. Se algo pedido não estiver no material, diga "Conteúdo não disponível na fonte consultada."`;

    // Remover duplicação - usar apenas uma mensagem no conversation array
    const conversation: ChatMessage[] = [
      { role: "user", parts: [{ text: enhancedPrompt }] }
    ];

    // Lista de modelos do Gemini em ordem de preferência (fallback em cascata).
    // Aliases "*-latest" acompanham a versão atual e não ficam obsoletos.
    // Todos funcionam no tier gratuito (exceto o "pro", que pode exigir créditos).
    const modelNames = [
      "gemini-flash-latest",
      "gemini-3.6-flash",
      "gemini-flash-lite-latest",
      "gemini-pro-latest",
    ];

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    let responseText = '';
    let lastError: any = null;

    // Tentar cada modelo em sequência até obter sucesso
    for (let i = 0; i < modelNames.length; i++) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelNames[i],
          generationConfig: {
            temperature: 0.3,
            topP: 0.8,
            topK: 40,
            // Alto o suficiente para o resumo completo (todas as seções).
            maxOutputTokens: 16000,
          }
        });

        const result = await model.generateContent({ contents: conversation });
        const parts = result.response.candidates?.[0]?.content?.parts ?? [];
        responseText = parts.map((p: any) => p?.text || '').join('').trim();

        if (responseText) {
          break; // Sucesso! Sair do loop
        }
      } catch (modelError: any) {
        lastError = modelError;
        console.warn(`Falha com modelo ${modelNames[i]}:`, modelError.message);
      }
    }

    // Se nenhum modelo funcionou, usar mensagem padrão
    if (!responseText) {
      console.error('Todos os modelos Gemini falharam. Último erro:', lastError?.message);
      responseText = language === 'pt' ? "Pode reformular sua pergunta sobre a lição de forma mais específica?" :
          language === 'en' ? "Can you rephrase your question about the lesson more specifically?" :
          language === 'es' ? "¿Puedes reformular tu pregunta sobre la lección más específicamente?" :
          language === 'fr' ? "Pouvez-vous reformuler votre question sur la leçon plus spécifiquement?" :
          "Pode reformular bu pergunta sobre a lição de forma mais específica?";
    }

    return NextResponse.json({ message: responseText });

  } catch (error: any) {
    console.error("Erro na API:", error);

    const errorMessages = {
      pt: "Erro ao processar sua pergunta sobre a lição",
      en: "Error processing your question about the lesson",
      es: "Error al procesar tu pregunta sobre la lección",
      fr: "Erreur lors du traitement de votre question sur la leçon",
      krioulu: "Erro pa processa bu pergunta sobre a lição"
    };

    return NextResponse.json(
      { message: errorMessages[language as keyof typeof errorMessages] || errorMessages.pt },
      { status: 500 }
    );
  }
}