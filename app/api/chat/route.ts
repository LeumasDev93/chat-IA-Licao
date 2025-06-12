// /* eslint-disable @typescript-eslint/no-unused-vars */
// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { NextRequest, NextResponse } from 'next/server';
// import { GoogleGenerativeAI } from '@google/generative-ai';
// import { GoogleGenAI } from '@google/genai';
// import { getCachedLesson, LessonData } from './scrape-lesson';

// const API_KEY = new GoogleGenAI({ apiKey: "AIzaSyAO8-1xWfio54YVvaOV3pEabu7GyE40oPo" });

// if (API_KEY) {
//   console.log("GoogleGenerativeAI instance created.");
// } else {
//   console.error("Erro: A variável de ambiente GEMINI_API_KEY não foi encontrada ao iniciar.");
// }

// function buildSystemPrompt(lesson: LessonData | null) {
//   let prompt = `
// Você é um assistente especializado no **nos estudos da lição da escola sabatina baseando neste site "https://mais.cpb.com.br/licao-adultos/"**, 
// uma site oficcial de estudos da lição da escola sabatina, onde informações essenciais sobre cada lica para cada dia da semna de sabado a sexta feira e tendo en conta o auxiliar e o comentario. 
// Cada vez que ele recebe uma pergunta, ele responde de acordo com o que foi aprendido no site, tem de explorar o site, entrar em cada dia  neste link https://mais.cpb.com.br/licao/ e trazer as informacoes para io usuarios.
// tem aprofundar no tem e trazer mas conteudos e numca deve citar o site. Também tem de trazer os versiculos biblicos para cada dia da semana, bem extruturas dentro de parentese.

// se um usuario falar contigo no Kriolu de cabu verdi, voce deve responde-lo em kriolu de cabo verde ".

// ### INFORMAÇÕES ESSENCIAIS:
// 1. **Nao deve Responder nada que nao tem a Ver no site https://mais.cpb.com.br/licao-adultos/rute-e-ester**
// 2. **Qundo um usuario te diz para falar de licao de hoje, voce deve responde-lo comparando a data atual e o dia da semana atual para responder exatmente ao dia de hoje, mais voce nao pode perguntar a data de hoje tem de pegar a data do sistema e comparar apenas respondeno a pergunta dele **
// 3. **Nunca deve perguntar para usuario sempre tem de ter a capacidade de responder a pergunta dele,
// 4. **Evite repetir sempre esta introdução**,
// 5. **Tem de ser rapido e eficiente*,
// `;


//   if (lesson) {
//     prompt += `

// Informações mais recentes da lição:
// Título: ${lesson.title || 'Não disponível'}

// Conteúdos diários da lição:
// ${lesson.days.map((d, i) => `- Dia ${i + 1}: ${d || 'Conteúdo não disponível'}`).join('\n') || 'Nenhum conteúdo diário disponível.'}

// Versículos bíblicos para a semana:
// ${lesson.verses.map(v => `- (${v || 'Versículo não disponível'})`).join('\n') || 'Nenhum versículo disponível.'}
// `;
//   } else {
//     prompt += `
// (Atenção: Não foi possível carregar o conteúdo da lição no momento. Posso tentar responder a perguntas gerais sobre a Escola Sabatina.)
// `;
//   }

//   return prompt.trim();
// }

// export async function POST(req: NextRequest) {
//   if (!API_KEY) {
//     return NextResponse.json(
//       { message: "Erro de configuração do servidor: Chave da API do Gemini não disponível ou inválida." },
//       { status: 500 }
//     );
//   }

//   const { userMessage } = await req.json();

//   if (!userMessage || typeof userMessage !== 'string' || userMessage.trim() === '') {
//     return NextResponse.json(
//       { message: "Por favor, envie uma mensagem válida." },
//       { status: 400 }
//     );
//   }

//   try {
//     if (/^(ola|oi|olá|hello|bom dia|boa tarde|boa noite)/i.test(userMessage.toLowerCase())) {
//       return NextResponse.json({
//         message: "Olá! Como posso ajudar com as Lições da Escola Sabatina desta semana?"
//       }, { status: 200 });
//     }

//     let lesson: LessonData | null = null;
//     try {
//       lesson = await getCachedLesson();
//     } catch (scrapingError) {
//       //console.error("Erro ao obter lição (scraping):", scrapingError);
//     }

//     const systemPrompt = buildSystemPrompt(lesson);

//     if (systemPrompt.trim() === '' || userMessage.trim() === '') {
//       return NextResponse.json(
//         { message: "Conteúdo da mensagem ou do prompt de sistema vazio. Por favor, tente novamente com uma mensagem válida." },
//         { status: 400 }
//       );
//     }

//     const conversationHistory: any[] = [
//       { role: "user", parts: [{ text: systemPrompt }] },
//       { role: "user", parts: [{ text: userMessage }] },
//     ];

//     const genAI = new GoogleGenerativeAI("AIzaSyAO8-1xWfio54YVvaOV3pEabu7GyE40oPo");
//     const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

//     if (!model) {
//       return NextResponse.json(
//         { message: "Não foi possível inicializar o modelo Gemini. Verifique a configuração da API." },
//         { status: 500 }
//       );
//     }

//     const response = await model.generateContent({
//       contents: conversationHistory,
//     });

//     const text = response.response.candidates?.[0]?.content?.parts?.[0]?.text || "Não entendi sua pergunta. Poderia reformular?";

//     return NextResponse.json({ message: text }, { status: 200 });

//   } catch (error: unknown) {
//      console.error("Erro geral no manipulador da API:", error);

//     if (
//       error &&
//       typeof error === 'object' &&
//       'message' in error &&
//       typeof (error as any).message === 'string' &&
//       (error as any).message.includes("429") &&
//       (error as any).message.toLowerCase().includes("too many requests")
//     ) {
//       return NextResponse.json(
//         { message: "Muitas requisições! Você excedeu sua cota na API do Gemini. Por favor, tente novamente em alguns minutos." },
//         { status: 429 }
//       );
//     }

//     return NextResponse.json(
//       { message: "Desculpe, estou com problemas técnicos. Por favor, tente novamente mais tarde." },
//       { status: 500 }
//     );
//   }
// }


/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: "AIzaSyAO8-1xWfio54YVvaOV3pEabu7GyE40oPo" });

const SYSTEM_PROMPT = `
Você é um assistente especializado no **nos estudos da lição da escola sabatina baseando nmeste site "https://mais.cpb.com.br/licao-adultos/"**, 
uma site oficcial de estudos da lição da escola sabatina, onde informações essenciais sobre cada lica para cada dia da semna de sabado a sexta feira e tendo en conta o auxiliar e o comentario. 
Cada vez que ele recebe uma pergunta, ele responde de acordo com o que foi aprendido no site, tem de explorar o site, entrar em cada dia  neste link https://mais.cpb.com.br/licao/rute-e-ester/#licaoSabado e trazer as informacoes para io usuarios.
tem aprofundar no tem e trazer mas conteudos e numca deve citar o site. Também tem de trazer os versiculos biblicos para cada dia da semana, bem extruturas dentro de parentese.

se um usuario falar contigo no crioulo voce deve responde-lo em kriolu de cabo verde ".

### INFORMAÇÕES ESSENCIAIS:
1. **Nao deve Responder nada que nao tem a Ver no site https://mais.cpb.com.br/licao-adultos/**

`;

const conversationHistory: any[] = [
  { role: "user", parts: [{ text: SYSTEM_PROMPT }] }
];

export async function POST(req: NextRequest) {
  const { userMessage } = await req.json();

  try {
    conversationHistory.push({
      role: "user",
      parts: [{ text: userMessage }],
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash", 
      contents: conversationHistory,
    });

    const text = response.candidates?.[0]?.content?.parts?.[0]?.text || "Não entendi sua pergunta.";

  
    conversationHistory.push({
      role: "model",
      parts: [{ text }],
    });

    return NextResponse.json({ message: text,  conversationHistory }, { status: 200 });

  } catch (error) {
    console.error("Erro com Gemini:", error);
    return NextResponse.json(
      { message: "Erro ao processar a solicitação." },
      { status: 500 }
    );
  }
}