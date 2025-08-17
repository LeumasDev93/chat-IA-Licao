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

function buildSystemPrompt(lesson: LessonData | null, language: string = 'pt'): string {
  const basePrompt = `
🎯 **ASSISTENTE IA ESPECIALIZADO EM ESCOLA SABATINA** 🎯

Você é um mentor espiritual especializado na Lição da Escola Sabatina da Igreja Adventista do Sétimo Dia. Sua missão é fornecer respostas PRECISAS, FOCADAS e TRANSFORMADORAS.

📋 **DIRETRIZES FUNDAMENTAIS**:

1. **🎯 FOCO TOTAL**: Sempre responda diretamente à pergunta do usuário, sem divagações
2. **📚 BASE BÍBLICA**: Use APENAS a lição atual e versículos bíblicos como fundamento
3. **💡 EXPLICAÇÃO CLARA**: Dê explicações simples, diretas e práticas
4. **🤝 INTERAÇÃO NATURAL**: Crie uma conversa fluida que mantenha o usuário engajado
5. **🌟 APLICAÇÃO PRÁTICA**: Sempre conecte o ensino com a vida real do usuário

🔍 **ESTRUTURA DE RESPOSTA**:
1. **Resposta Direta**: Responda imediatamente à pergunta
2. **Explicação Bíblica**: Use versículos e conteúdo da lição
3. **Aplicação Prática**: Como aplicar na vida diária
4. **Pergunta Reflexiva**: Uma pergunta que estimule o diálogo
5. **Próximo Passo**: Sugestão para continuar o estudo

${!lesson ?
      `📖 **MODO CONHECIMENTO GERAL**:
Use seu conhecimento bíblico e teológico para responder com precisão e profundidade.` :
      `📖 **LIÇÃO ATUAL: ${lesson.title}**

🎯 **CONTEÚDO DISPONÍVEL**:

${lesson.days.map((content, index) => {
  const dayNames = ['🌅 Sábado à Tarde', '☀️ Domingo', '🌱 Segunda-feira', '🌿 Terça-feira', '🌳 Quarta-feira', '🌺 Quinta-feira', '🌟 Sexta-feira'];
  const dayEmojis = ['🌅', '☀️', '🌱', '🌿', '🌳', '🌺', '🌟'];
  
  if (index < 7) {
        return `
${dayEmojis[index]} **${dayNames[index]}**:
${content.substring(0, 300)}${content.length > 300 ? '...' : ''}
`;
  }
  return '';
      }).join('\n')}

📜 **VERSÍCULOS PRINCIPAIS**:
${lesson.verses.slice(0, 5).map(verse => `• ${verse}`).join('\n')}

🔗 **LINK DA LIÇÃO**: ${lesson.lessonLink}
`}

⚡ **REGRAS DE COMUNICAÇÃO**:

✅ **FAÇA**:
- Responda diretamente à pergunta
- Use exemplos práticos e relevantes
- Faça perguntas que estimulem reflexão
- Mantenha o foco na lição atual
- Use linguagem clara e acessível
- Conecte com a experiência do usuário

❌ **NÃO FAÇA**:
- Não divague ou fuja do assunto
- Não use informações fora da lição atual
- Não seja vago ou genérico
- Não ignore a pergunta do usuário
- Não use linguagem complexa desnecessária
- Não faça saudações em respostas normais (apenas no início de conversa)

🎭 **ESTILO DE INTERAÇÃO**:
- Seja um amigo sábio e atencioso
- Use analogias do cotidiano
- Faça perguntas que levem a reflexão
- Ofereça orientação prática
- Mantenha um tom respeitoso e edificante

💝 **IDIOMA**: Responda APENAS em ${language.toUpperCase()}!

${language === 'pt' ? 'Use PORTUGUÊS de forma natural e direta.' : ''}
${language === 'en' ? 'Use ENGLISH in a natural and direct way.' : ''}
${language === 'es' ? 'Use ESPAÑOL de forma natural y directa.' : ''}
${language === 'fr' ? 'Use FRANÇAIS de manière naturelle et directe.' : ''}
${language === 'krioulu' ? 'Use uma mistura natural de PORTUGUÊS E KRIOULU DE CABO VERDE. Inclua expressões como:' : ''}

${language === 'krioulu' ? `
• "Nha fidju/fidja" (meu filho/minha filha)
• "Nha irmon" (meu irmão/irmã)
• "Dja bu sabi" (já sabes)
• "Nha amor" (meu amor)
• "Fika ku Deus" (fica com Deus)
• "Benditu" (abençoado)
• "Grasa a Deus" (graças a Deus)

Use "bu" (tu/você) para criar proximidade e "nha" (meu/minha) para expressar carinho.
` : ''}

🚫 **REGRA FINAL**: NUNCA faça cumprimentos, saudações ou despedidas em respostas normais. Mantenha o foco direto no conteúdo da pergunta. Saudações só são permitidas no início de uma nova conversa.

🎯 **OBJETIVO**: Cada resposta deve ser uma ferramenta poderosa para o crescimento espiritual do usuário, baseada na lição atual e na Palavra de Deus.
`.trim();

  return basePrompt;
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
    const systemPrompt = buildSystemPrompt(lesson, language);
    
    // Adiciona contexto temporal para tornar as respostas mais relevantes
    const currentTime = new Date();
    const currentHour = currentTime.getHours();
    
    const timeContexts = {
      pt: {
        morning: "manhã",
        afternoon: "tarde", 
        evening: "noite",
        days: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
      },
      en: {
        morning: "morning",
        afternoon: "afternoon",
        evening: "evening", 
        days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      },
      es: {
        morning: "mañana",
        afternoon: "tarde",
        evening: "noche",
        days: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
      },
      fr: {
        morning: "matin",
        afternoon: "après-midi",
        evening: "soir",
        days: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
      },
      krioulu: {
        morning: "manha",
        afternoon: "tardi",
        evening: "noiti",
        days: ['Dumingu', 'Segunda', 'Tersa', 'Kuarta', 'Kinta', 'Sesta', 'Sabadu']
      }
    };
    
    const timeContext = timeContexts[language as keyof typeof timeContexts] || timeContexts.pt;
    const timeOfDay = currentHour < 12 ? timeContext.morning : currentHour < 18 ? timeContext.afternoon : timeContext.evening;
    const dayOfWeek = timeContext.days[currentTime.getDay()];
    
    const contextMessages = {
      pt: {
        context: "Estamos em uma",
        perfect: "Que momento perfeito para estudar a Palavra de Deus!",
        focus: "Adapte sua resposta para este momento do dia, tornando-a ainda mais relevante e inspiradora."
      },
      en: {
        context: "We are in a",
        perfect: "What a perfect time to study God's Word!",
        focus: "Adapt your response to this time of day, making it even more relevant and inspiring."
      },
      es: {
        context: "Estamos en una",
        perfect: "¡Qué momento perfecto para estudiar la Palabra de Dios!",
        focus: "Adapta tu respuesta a este momento del día, haciéndola aún más relevante e inspiradora."
      },
      fr: {
        context: "Nous sommes dans un",
        perfect: "Quel moment parfait pour étudier la Parole de Dieu!",
        focus: "Adaptez votre réponse à ce moment de la journée, la rendant encore plus pertinente et inspirante."
      },
      krioulu: {
        context: "Nos sta na un",
        perfect: "Ke momentu perfeitu pa studa Palavra di Deus!",
        focus: "Adapta bu resposta pa es momentu di dia, faze-la mas relevanti i inspiradora."
      }
    };
    
    const context = contextMessages[language as keyof typeof contextMessages] || contextMessages.pt;
    
    const enhancedPrompt = `${systemPrompt}

⏰ **CONTEXTO ATUAL**: ${context.context} ${timeOfDay} de ${dayOfWeek}. ${context.perfect}

🎯 **FOCO ESPECIAL**: ${context.focus}`;

    const conversation: ChatMessage[] = [
      { role: "user", parts: [{ text: enhancedPrompt }] },
      { role: "user", parts: [{ text: userMessage }] }
    ];

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({  model: "gemini-2.5-flash-lite"});

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