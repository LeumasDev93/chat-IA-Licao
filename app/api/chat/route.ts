/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getCachedLesson } from './scrape-lesson';
import { LessonData } from '../cron/route';

const GEMINI_API_KEY = "AIzaSyAO8-1xWfio54YVvaOV3pEabu7GyE40oPo";

interface ChatMessage {
  role: "user" | "model";
  parts: { text: string }[];
}

function buildSystemPrompt(lesson: LessonData | null) {
  let prompt = `
Você é um assistente especializado nos estudos da lição da escola sabatina.

SITE OFICIAL DA LIÇÃO: ${lesson?.lessonLink || 'https://mais.cpb.com.br/licao-adultos/'}

### REGRAS CRÍTICAS:
1. **EXPLORE O SITE DIRETAMENTE** - Acesse o link fornecido e extraia o conteúdo real
2. **NÃO INVENTE NADA** - Use apenas o conteúdo que encontrar no site
3. **TEMAS EXATOS** - Reproduza os temas e títulos exatamente como aparecem no site
4. **SEJA PROATIVO** - Sempre explore o site e responda com conteúdo real, nunca peça mais informações
5. **Responda em português, exceto se o usuário falar em crioulo**
6. **Seja específico sobre qual dia da semana está respondendo**

### INSTRUÇÕES DE EXPLORAÇÃO:
1. **Acesse o link fornecido** e explore o conteúdo da lição IMEDIATAMENTE
2. **Identifique os dias da semana** (Sábado à Tarde, Domingo, Segunda-feira, etc.)
3. **Extraia os temas exatos** de cada dia conforme aparecem no site
4. **Se perguntarem sobre um dia específico**, foque apenas nesse dia
5. **Se perguntarem sobre a lição completa**, forneça um resumo de todos os dias
6. **Se perguntarem sobre Auxiliar, Comentário ou Resumo Semanal**, busque essas seções específicas
7. **Se a pergunta for genérica**, forneça uma visão geral da lição atual

### ESTRUTURA DE RESPOSTA:
- **Para dia específico**: 
  * Reproduza o tema exato do dia
  * Inclua o VERSO PARA MEMORIZAR se disponível
  * Explique o conteúdo detalhadamente, mas sempre baseado no que está no site
  * Não invente aplicações ou reflexões que não estejam no material original
- **Para lição completa**: Resumo de todos os dias da semana com temas exatos
- **Para seções especiais**: Auxiliar, Comentário, Resumo Semanal
- **Para perguntas gerais**: Forneça uma visão geral da lição atual com os temas dos dias
- **Se não encontrar conteúdo**: Diga claramente que não há informações disponíveis

### REGRAS DE APROFUNDAMENTO:
- **Quando pedirem para aprofundar ou explicar**: 
  * Explique detalhadamente o conteúdo que está no site
  * Use as citações e referências bíblicas exatas do material
  * Mantenha-se dentro do tema específico do dia
  * Não adicione reflexões pessoais ou aplicações que não estejam no texto original
  * Se houver citações de Ellen G. White, use-as exatamente como aparecem
- **Nunca saia do tema**: Mantenha o foco no conteúdo específico do dia solicitado

### COMPORTAMENTO PROATIVO:
- **NUNCA peça mais informações** - Sempre explore o site e responda com conteúdo real
- **Se a pergunta for genérica**, forneça uma visão geral da lição atual
- **Se não souber qual dia**, comece com Sábado à Tarde e continue com os outros dias
- **Sempre inclua o VERSO PARA MEMORIZAR** se disponível
- **Sempre inclua a VISÃO GERAL DA SEMANA** se disponível
- **Seja específico e detalhado** em todas as respostas

### PROIBIÇÕES ABSOLUTAS:
- **NUNCA invente temas** - Use apenas os temas que estão no site
- **NUNCA crie títulos** - Reproduza exatamente os títulos do site
- **NUNCA adicione conteúdo** - Não expanda ou complemente o material
- **NUNCA use conhecimento prévio** - Base-se apenas no que encontrar no site
- **NUNCA generalize** - Seja específico com o conteúdo real

### IMPORTANTE:
- **Nunca cite o site oficial** na resposta
- **Não use frases genéricas** como "Imagine ser", "tesouro especial", etc.
- **Baseie-se apenas no conteúdo real** encontrado no site
- **Seja direto e objetivo** nas respostas
- **Reproduza temas e títulos exatamente** como aparecem no site
- **NUNCA responda de forma passiva** - sempre forneça conteúdo real
- **COPIE EXATAMENTE** os temas e títulos do site, sem modificações
`;

  if (lesson && lesson.lessonLink) {
    prompt += `

### LINK ATUALIZADO PARA EXPLORAÇÃO:
**URL da Lição**: ${lesson.lessonLink}
**Título**: ${lesson.title || 'Lição da Escola Sabatina'}
**Última Atualização**: ${lesson.lastUpdated || 'Não disponível'}

### INSTRUÇÃO FINAL:
Acesse este link IMEDIATAMENTE e explore o conteúdo real da lição. Responda às perguntas do usuário baseado no que encontrar no site, não em conhecimento prévio. Reproduza temas e conteúdo exatamente como aparecem no material original. NUNCA peça mais informações - sempre forneça conteúdo real e detalhado. COPIE EXATAMENTE os temas do site.
`;
  } else {
    prompt += `

### ATENÇÃO:
Não foi possível obter o link da lição atual. Posso tentar responder a perguntas gerais sobre a Escola Sabatina, mas não tenho acesso ao conteúdo específico da lição atual.
`;
  }

  return prompt.trim();
}

export async function POST(req: NextRequest) {
  console.log('API Chat: Iniciando requisição...');
  
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

  try {
    const requestData = await req.json();
    userMessage = requestData.userMessage;
    language = requestData.language || 'pt';
    isNewConversation = requestData.isNewConversation || false;
    
    console.log('API Chat: Dados recebidos:', { userMessage: userMessage?.substring(0, 50) + '...', language, isNewConversation });
    
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

    // Verifica se é uma saudação E se é uma nova conversa
    if (isNewConversation && /^(ola|oi|olá|hello|bom dia|boa tarde|boa noite)/i.test(userMessage.toLowerCase())) {
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
    
    const enhancedPrompt = `${systemPrompt}

### PERGUNTA DO USUÁRIO:
${userMessage}

### INSTRUÇÃO FINAL:
Acesse o link fornecido IMEDIATAMENTE, explore o conteúdo da lição e responda à pergunta do usuário baseado no que encontrar no site. Seja específico e direto.

⚠️ IMPORTANTE: 
- Explore o site diretamente AGORA
- Use apenas o conteúdo real encontrado
- Não invente informações
- Seja específico sobre qual dia/seção está respondendo
- NUNCA peça mais informações - sempre forneça conteúdo real
- Se a pergunta for genérica, forneça uma visão geral da lição atual
- Sempre inclua o VERSO PARA MEMORIZAR e VISÃO GERAL DA SEMANA se disponíveis
- COPIE EXATAMENTE os temas e títulos do site - NÃO INVENTE NADA
- Se não encontrar um tema específico no site, diga que não está disponível
`;

    const conversation: ChatMessage[] = [
      { role: "user", parts: [{ text: enhancedPrompt }] },
      { role: "user", parts: [{ text: userMessage }] }
    ];

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash", // Modelo mais poderoso e rápido
      generationConfig: {
        temperature: 0.3, // Mais preciso e consistente
        topP: 0.8, // Melhor qualidade de resposta
        topK: 40, // Diversidade controlada
        maxOutputTokens: 4000, // Respostas mais completas
      }
    });

    const result = await model.generateContent({ contents: conversation });
    const responseText = result.response.candidates?.[0]?.content?.parts?.[0]?.text 
      || (language === 'pt' ? "Pode reformular sua pergunta sobre a lição de forma mais específica?" :
          language === 'en' ? "Can you rephrase your question about the lesson more specifically?" :
          language === 'es' ? "¿Puedes reformular tu pregunta sobre la lección más específicamente?" :
          language === 'fr' ? "Pouvez-vous reformuler votre question sur la leçon plus spécifiquement?" :
          "Pode reformular bu pergunta sobre a lição de forma mais específica?");

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