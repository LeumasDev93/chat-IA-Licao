/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

import puppeteer from 'puppeteer';
import schedule from 'node-schedule';
import fs from 'fs';
import path from 'path';
interface LessonData {
  title: string;
  days: string[];
  verses: string[];
  lessonLink: string;
  lastUpdated: string;
  expiresAt: string;
}

const CACHE_VALIDITY_MS = 7 * 24 * 60 * 60 * 1000;
const CPB_LESSON_URL = "https://mais.cpb.com.br/licao-adultos/";
const PUPPETEER_OPTIONS = {
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
};
const CACHE_FILE = path.join(__dirname, 'lesson-cache.json');

let cachedLesson: LessonData | null = null;

// Carrega o cache do arquivo
function loadCacheFromFile(): void {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      cachedLesson = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
      console.log('Cache carregado do arquivo');
    }
  } catch (error) {
    console.error('Erro ao carregar cache:', error);
  }
}

// Salva o cache no arquivo
function saveCacheToFile(lesson: LessonData): void {
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(lesson), 'utf-8');
  } catch (error) {
    console.error('Erro ao salvar cache:', error);
  }
}

// Agenda o scraping semanal
function scheduleWeeklyScraping(): void {
  schedule.scheduleJob('0 12 * * 6', async () => {
    console.log('Iniciando raspagem agendada...');
    try {
      const newLesson = await scrapeLessonData();
      cachedLesson = {
        ...newLesson,
        expiresAt: new Date(Date.now() + CACHE_VALIDITY_MS).toISOString()
      };
      saveCacheToFile(cachedLesson);
      console.log('Raspagem concluída e cache atualizado');
    } catch (error) {
      console.error('Falha na raspagem agendada:', error);
    }
  });
  console.log('Agendamento configurado para sábados ao meio-dia');
}

// Verifica se o cache é válido
function isCacheValid(): boolean {
  return !!cachedLesson && new Date() < new Date(cachedLesson.expiresAt);
}

// Inicialização
loadCacheFromFile();
scheduleWeeklyScraping();

 async function getCachedLesson(): Promise<LessonData> {
  if (isCacheValid() && cachedLesson) {
    console.log("Retornando lição do cache");
    return cachedLesson;
  }

  console.log("Cache expirado, fazendo nova raspagem...");
  try {
    const newLesson = await scrapeLessonData();
    cachedLesson = {
      ...newLesson,
      expiresAt: new Date(Date.now() + CACHE_VALIDITY_MS).toISOString()
    };
    saveCacheToFile(cachedLesson);
    return cachedLesson;
  } catch (error) {
    console.error("Erro ao raspar lição:", error);
    if (cachedLesson) {
      console.log("Usando cache anterior como fallback");
      return cachedLesson;
    }
    throw error;
  }
}

// Função principal de scraping
async function scrapeLessonData(): Promise<Omit<LessonData, 'expiresAt'>> {
  const browser = await puppeteer.launch(PUPPETEER_OPTIONS);
  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

    // Obtém o link da lição
    await page.goto(CPB_LESSON_URL, { waitUntil: 'networkidle2', timeout: 60000 });
    const lessonLink = await page.evaluate(() => {
      const link = document.querySelector('a[href*="/licao/"]:not([href*="#"])');
      return link?.getAttribute('href') || CPB_LESSON_URL;
    });

    // Raspa os dados da lição
    await page.goto(lessonLink, { waitUntil: 'networkidle2', timeout: 60000 });
    const lessonData = await page.evaluate(() => {
      const getText = (selector: string) => 
        document.querySelector(selector)?.textContent?.trim() || '';

      return {
        title: getText('h1') || 'Lição da Escola Sabatina',
        days: [
          '#licaoSabado', '#licaoDomingo', '#licaoSegunda',
          '#licaoTerca', '#licaoQuarta', '#licaoQuinta', '#licaoSexta', '#licaoAuxiliar', '#licaoComentario', '#resumoSemanal'
        ].map(getText).filter(Boolean),
        verses: Array.from(document.querySelectorAll('.versiculo'))
          .map(el => el.textContent?.trim())
          .filter(Boolean) as string[],
        lessonLink: window.location.href,
        lastUpdated: new Date().toISOString()
      };
    });

    return lessonData;
  } finally {
    await browser.close();
  }
}

const GEMINI_API_KEY = "AIzaSyAO8-1xWfio54YVvaOV3pEabu7GyE40oPo";

interface ChatMessage {
  role: "user" | "model";
  parts: { text: string }[];
}

function buildSystemPrompt(lesson: LessonData | null): string {
  const basePrompt = `
Você é um especialista na Lição da Escola Sabatina, com profundo conhecimento teológico e capacidade de análise bíblica. 
Sua missão é fornecer respostas completas e aprofundadas baseadas no conteúdo oficial de ${lesson?.title || 'a lição atual'}.

DIRETRIZES ESSENCIAIS:
1. **Contextualização Histórica**: Sempre que relevante, forneça o contexto histórico-cultural dos textos
2. **Análise Teológica**: Explore os temas teológicos principais e suas implicações
3. **Aplicação Prática**: Sugira aplicações concretas para a vida diária
4. **Ligações Bíblicas**: Relacione com outros textos bíblicos que complementem o estudo
5. **Versículos Expandidos**: Não apenas cite, mas explique os versículos-chave
6. **Perguntas Reflexivas**: Inclua perguntas que estimulem a reflexão pessoal
7. **Estrutura Organizada**: Use parágrafos temáticos e marcadores quando apropriado

${!lesson ? 
"(ATENÇÃO: Usando conhecimento geral, mas mantendo profundidade analítica)" : 
`INFORMAÇÕES DETALHADAS DA LIÇÃO:

**TEMA CENTRAL**: ${lesson.title}
${lesson.days.map((content, index) => {
  const dayNames = ['Sábado', 'Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Auxiliar', 'Comentário'];
  return `
**${dayNames[index]} - ANÁLISE APROFUNDADA**:
${content}

**TÓPICOS PARA REFLEXÃO**:
- Principais ensinamentos deste estudo
- Como isto se relaciona com o tema central
- Aplicações práticas para minha vida
- Perguntas para discussão em grupo
`;
}).join('\n')}

**VERSÍCULOS COMENTADOS**:
${lesson.verses.map(verse => `
- (${verse}): Exegese detalhada e significado contextual`).join('\n')}
`}
`.trim();

  return basePrompt;
}

export async function POST(req: NextRequest) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json(
      { message: "Erro de configuração do servidor" },
      { status: 500 }
    );
  }

  const { userMessage } = await req.json();
  if (!userMessage?.trim()) {
    return NextResponse.json(
      { message: "Por favor, envie uma mensagem válida" },
      { status: 400 }
    );
  }

  if (/^(ola|oi|olá|hello|bom dia|boa tarde|boa noite)/i.test(userMessage.toLowerCase())) {
    return NextResponse.json({
      message: "Olá! Como posso ajudar com as Lições da Escola Sabatina desta semana?"
    });
  }

  try {
    const lesson = await getCachedLesson();
    const systemPrompt = buildSystemPrompt(lesson);

    const conversation: ChatMessage[] = [
      { role: "user", parts: [{ text: systemPrompt }] },
      { role: "user", parts: [{ text: userMessage }] }
    ];

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContent({ contents: conversation });
    const responseText = result.response.candidates?.[0]?.content?.parts?.[0]?.text 
      || "Não entendi sua pergunta. Poderia reformular?";

    return NextResponse.json({ message: responseText });

  } catch (error: any) {
    console.error("Erro na API:", error);

    if (error.message?.includes("429")) {
      return NextResponse.json(
        { message: "Muitas requisições! Tente novamente mais tarde." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { message: "Erro ao processar sua solicitação" },
      { status: 500 }
    );
  }
}


// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { NextRequest, NextResponse } from 'next/server';
// import { GoogleGenAI } from "@google/genai";

// const ai = new GoogleGenAI({ apiKey: "AIzaSyAO8-1xWfio54YVvaOV3pEabu7GyE40oPo" });

// const SYSTEM_PROMPT = `
// Você é um assistente especializado no **nos estudos da lição da escola sabatina baseando neste site "https://mais.cpb.com.br/licao/imagens-do-fim/", faz a busca certa e gtras os conteudos certos**, 
// uma site oficcial de estudos da lição da escola sabatina, onde informações essenciais sobre cada lica para cada dia da semna de sabado a sexta feira e tendo en conta o auxiliar e o comentario. 
// Cada vez que ele recebe uma pergunta, ele responde de acordo com o que foi aprendido no site, tem de explorar o site, entrar em cada dia  neste link https://mais.cpb.com.br/licao/precursores-dos-eventos-finais/ e trazer as informacoes para io usuarios.
// tem aprofundar no tem e trazer mas conteudos e numca deve citar o site. Também tem de trazer os versiculos biblicos para cada dia da semana, bem extruturas dentro de parentese.

// o site ja esta atualizado entao as informacoes que tem de trazer sao as do site, e deve trazer as informacoes de cada dia da semana, e tambem deve trazer o tema central da lição, e os versiculos biblicos que estao no site.
// se um usuario falar contigo no crioulo voce deve responde-lo em kriolu de cabo verde ".

// ### INFORMAÇÕES ESSENCIAIS:
// 1. **Nao deve Responder nada que nao tem a Ver no site https://mais.cpb.com.br/licao/imagens-do-fim/**
// 1. **Resumo Semana: Este ponto so sera apresentado se o usuario ja intergio sobre a licao da semana**

// `;

// const conversationHistory: any[] = [
//   { role: "user", parts: [{ text: SYSTEM_PROMPT }] }
// ];

// export async function POST(req: NextRequest) {
//   const { userMessage } = await req.json();

//   try {
//     conversationHistory.push({
//       role: "user",
//       parts: [{ text: userMessage }],
//     });

//     const response = await ai.models.generateContent({
//       model: "gemini-2.0-flash", 
//       contents: conversationHistory,
//     });

//     const text = response.candidates?.[0]?.content?.parts?.[0]?.text || "Não entendi sua pergunta.";

  
//     conversationHistory.push({
//       role: "model",
//       parts: [{ text }],
//     });

//     return NextResponse.json({ message: text,  conversationHistory }, { status: 200 });

//   } catch (error) {
//     console.error("Erro com Gemini:", error);
//     return NextResponse.json(
//       { message: "Erro ao processar a solicitação." },
//       { status: 500 }
//     );
//   }
// }