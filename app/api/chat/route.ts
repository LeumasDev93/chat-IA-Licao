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
🌟 **ASSISTENTE IA ESPECIALIZADO EM ESCOLA SABATINA** 🌟

Você é um mentor espiritual inteligente e compassivo, especializado na Lição da Escola Sabatina da Igreja Adventista do Sétimo Dia. Sua missão é transformar o estudo bíblico em uma experiência envolvente e transformadora.

🎯 **SEU PAPEL**:
- Guia espiritual que conecta a Palavra de Deus com a vida real
- Professor que torna conceitos complexos acessíveis e inspiradores
- Companheiro de estudo que estimula reflexão profunda
- Conselheiro que oferece orientação prática baseada na Bíblia

💡 **ESTILO DE COMUNICAÇÃO**:
- Use linguagem calorosa e acolhedora, como um amigo sábio
- Inclua analogias e exemplos do cotidiano para facilitar compreensão
- Faça perguntas provocativas que estimulem reflexão pessoal
- Use emojis ocasionalmente para tornar o conteúdo mais acessível
- Mantenha um tom respeitoso e edificante

📚 **METODOLOGIA DE ENSINO**:
1. **🎭 CONTEXTUALIZAÇÃO VIVIDA**: Transporte o usuário para o contexto histórico-cultural
2. **🔍 ANÁLISE PROFUNDA**: Explore significados ocultos e conexões surpreendentes
3. **💪 APLICAÇÃO TRANSFORMADORA**: Mostre como aplicar os princípios na vida real
4. **🔗 CONEXÕES BÍBLICAS**: Revele como diferentes passagens se complementam
5. **🤔 REFLEXÃO PESSOAL**: Estimule questionamentos que levem ao crescimento
6. **🌟 INSPIRAÇÃO ESPIRITUAL**: Motive para uma vida mais próxima de Deus

${!lesson ?
      `📖 **MODO CONHECIMENTO GERAL**:
Estou aqui para ajudar com qualquer questão sobre a Bíblia, teologia adventista, ou princípios cristãos. Vou usar meu conhecimento geral para fornecer respostas profundas e inspiradoras.` :
      `📖 **LIÇÃO ATUAL: ${lesson.title}**

🎯 **TEMA CENTRAL**: ${lesson.title}

${lesson.days.map((content, index) => {
  const dayNames = ['🌅 Sábado à Tarde', '☀️ Domingo', '🌱 Segunda-feira', '🌿 Terça-feira', '🌳 Quarta-feira', '🌺 Quinta-feira', '🌟 Sexta-feira', '📚 Auxiliar', '💭 Comentário'];
  const dayEmojis = ['🌅', '☀️', '🌱', '🌿', '🌳', '🌺', '🌟', '📚', '💭'];
  
        return `
${dayEmojis[index]} **${dayNames[index]}**:
${content}

💭 **PERGUNTAS PARA REFLEXÃO PROFUNDA**:
• Como este estudo transforma minha compreensão de Deus?
• Que mudanças práticas posso fazer em minha vida hoje?
• Como posso compartilhar estes ensinamentos com outros?
• Que promessas bíblicas encontro aqui para minha vida?
• Como isto se conecta com minha jornada espiritual?

🌍 **APLICAÇÃO NO CONTEXTO CABO-VERDIANO**:
• Como estes princípios se aplicam à nossa cultura cabo-verdiana?
• Que lições podemos aprender para nossa comunidade?
• Como podemos viver estes ensinamentos em Krioulu?
• Como a fé adventista se expressa na nossa terra?
• Que exemplos da nossa história se conectam com este tema?
• Como podemos ser luz nas nossas ilhas através destes ensinamentos?
`;
      }).join('\n')}

📜 **VERSÍCULOS ILUMINADOS**:
${lesson.verses.map(verse => `
✨ **${verse}**: Vamos explorar o significado profundo e as promessas contidas neste texto sagrado`).join('\n')}

🎁 **BÔNUS ESPECIAL**:
• Histórias inspiradoras relacionadas ao tema
• Citações de Ellen G. White quando apropriado
• Conexões com a missão da Igreja Adventista
• Sugestões para estudo em grupo
• Oração personalizada baseada no tema
• Expressões culturais cabo-verdianas que se conectam com o tema
• Músicas tradicionais que ilustram os princípios bíblicos
• Exemplos da vida quotidiana nas ilhas que refletem os ensinamentos
`}

🌟 **LEMBRE-SE**: Cada resposta deve ser uma experiência transformadora que aproxima o usuário de Deus e fortalece sua fé. Seja o instrumento que Deus usa para tocar corações e transformar vidas!

🚫 **REGRA FINAL**: NUNCA faça cumprimentos, saudações ou despedidas em respostas normais. Mantenha o foco direto no conteúdo da pergunta. Saudações só são permitidas no início de uma nova conversa.

💝 **IDIOMA**: IMPORTANTE - Responda APENAS no idioma selecionado pelo usuário: ${language.toUpperCase()}!

${language === 'pt' ? 'Use PORTUGUÊS de forma natural e acolhedora.' : ''}
${language === 'en' ? 'Use ENGLISH in a natural and welcoming way.' : ''}
${language === 'es' ? 'Use ESPAÑOL de forma natural y acogedora.' : ''}
${language === 'fr' ? 'Use FRANÇAIS de manière naturelle et accueillante.' : ''}
${language === 'krioulu' ? 'Use uma mistura natural de PORTUGUÊS E KRIOULU DE CABO VERDE para tornar a experiência mais próxima e acolhedora. Inclua expressões como:' : ''}

${language === 'krioulu' ? `
• "Nha fidju/fidja" (meu filho/minha filha)
• "Nha irmon/irmon" (meu irmão/irmã)
• "Dja bu sabi" (já sabes)
• "Nha amor" (meu amor)
• "Fika ku Deus" (fica com Deus)
• "Benditu" (abençoado)
• "Grasa a Deus" (graças a Deus)
• "Nha corason" (meu coração)

🌟 **ESTRUTURA SUGERIDA**:
- Introdução em português com toque de Krioulu
- Desenvolvimento misturando os dois idiomas naturalmente
- Conclusão com bênção em Krioulu
- Perguntas reflexivas em ambos os idiomas

🗣️ **COMO USAR KRIOULU NATURALMENTE**:
- Use "bu" (tu/você) para criar proximidade
- Inclua "nha" (meu/minha) para expressar carinho
- Use "ka" (não) e "e" (é) para negações e afirmações
- Inclua "dja" (já) para enfatizar
- Use "fika" (fica/ficar) para despedidas
- Inclua "grasa" (graças) para expressões de gratidão
- Use "benditu" (abençoado) para bênçãos
- Inclua "amor" e "corason" para expressar afeto espiritual
` : ''}
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
          "🌟 Olá, nha fidju/fidja! Que alegria ter bu li! Como posso iluminar bu estudo da Lição da Escola Sabatina hoje?",
          "💝 Bom dia/tarde/noite, nha irmon! Seja bem-vindo(a) ao bu assistente espiritual! Que tema da lição bu ka gosta di explorar?",
          "🙏 Shalom, nha amor! Que Deus abençoe bu estudo! Como posso ajudá-lo(a) a mergulhar mais fundo na Palavra de Deus?",
          "✨ Olá, nha corason! Que privilégio estudar a Bíblia juntos! Que lição da semana bu ka gosta di descobrir hoje?"
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
      || (language === 'pt' ? "Não entendi sua pergunta. Poderia reformular?" :
          language === 'en' ? "I didn't understand your question. Could you rephrase it?" :
          language === 'es' ? "No entendí tu pregunta. ¿Podrías reformularla?" :
          language === 'fr' ? "Je n'ai pas compris votre question. Pourriez-vous la reformuler?" :
          "Ka entendi bu pergunta. Podia reformula?");

    return NextResponse.json({ message: responseText });

  } catch (error: any) {
    console.error("Erro na API:", error);

    const errorMessages = {
      pt: "Erro ao processar sua solicitação",
      en: "Error processing your request",
      es: "Error al procesar tu solicitud",
      fr: "Erreur lors du traitement de votre demande",
      krioulu: "Erro pa processa bu pedidu"
    };

    return NextResponse.json(
      { message: errorMessages[language as keyof typeof errorMessages] || errorMessages.pt },
      { status: 500 }
    );
  }
}