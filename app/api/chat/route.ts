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