/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getCachedLesson } from './scrape-lesson';
import { LessonData } from '../cron/route';

// Usar variável de ambiente para a chave da API
const GEMINI_API_KEY = "AIzaSyD8f4_0yajQDw71rYKk6BWhQd5gTqrcE8U";

console.log(GEMINI_API_KEY);
interface ChatMessage {
  role: "user" | "model";
  parts: { text: string }[];
}

function buildSystemPrompt(lesson: LessonData | null) {
  let prompt = `Você é um assistente especializado na Lição da Escola Sabatina, com profundo conhecimento bíblico e capacidade de explicar detalhadamente cada aspecto da lição.

SITE OFICIAL: ${lesson?.lessonLink || 'https://mais.cpb.com.br/licao-adultos/'}

### REGRAS PRINCIPAIS:
1. **Baseie-se apenas no conteúdo fornecido** - Não invente informações
2. **Use temas e títulos exatos** - Reproduza conforme aparecem no material
3. **Seja MUITO específico e detalhado** - Explique profundamente cada conceito
4. **Responda em português** (exceto se o usuário falar em crioulo)
5. **Inclua versos para memorizar** quando disponíveis
6. **Não cite o site oficial** na resposta
7. **APROFUNDE nos temas** - Explique o contexto histórico, significado espiritual e aplicação prática

### ESTRUTURA DE RESPOSTA DETALHADA:
- **Para dia específico**: 
  * Tema exato + explicação profunda do conceito
  * Contexto bíblico e histórico
  * Significado espiritual e teológico
  * Aplicação prática na vida cristã
  * Versos relacionados e sua interpretação

- **Para lição completa**: 
  * Resumo detalhado de todos os dias
  * Conexões entre os temas
  * Progressão do pensamento da lição
  * Principais ensinamentos de cada dia

- **Para seções especiais**: 
  * Auxiliar: Explicação detalhada dos conceitos
  * Comentário: Análise profunda dos textos
  * Resumo Semanal: Síntese dos principais pontos

- **Para perguntas gerais**: 
  * Visão geral completa da lição
  * Temas principais e sua importância
  * Aplicação prática dos ensinamentos`;

  if (lesson && lesson.lessonLink) {
    prompt += `

### INFORMAÇÕES DA LIÇÃO:
**Título**: ${lesson.title || 'Lição da Escola Sabatina'}
**Última Atualização**: ${lesson.lastUpdated || 'Não disponível'}

### INSTRUÇÃO:
Analise o conteúdo fornecido e responda à pergunta do usuário de forma específica e detalhada, baseando-se apenas no material disponível.`;
  } else {
    prompt += `

### ATENÇÃO:
Não foi possível obter o link da lição atual. Posso responder perguntas gerais sobre a Escola Sabatina, mas não tenho acesso ao conteúdo específico da lição atual.`;
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
    
    // Construir prompt otimizado com conteúdo real da lição
    const lessonContent = lesson?.lessonContent || 'Conteúdo da lição não disponível no momento.';
    const enhancedPrompt = `${systemPrompt}

### CONTEÚDO DA LIÇÃO:
${lessonContent}

### PERGUNTA DO USUÁRIO:
${userMessage}

### INSTRUÇÃO DETALHADA:
Analise profundamente o conteúdo da lição fornecido acima e responda à pergunta do usuário de forma EXTREMAMENTE específica e detalhada. 

**IMPORTANTE:**
- Explique cada conceito com profundidade teológica e bíblica
- Forneça contexto histórico quando relevante
- Conecte os temas com a vida cristã prática
- Cite versos específicos e explique seu significado
- Identifique claramente qual dia/seção da lição está sendo abordado
- Aprofunde nos significados espirituais e aplicações práticas
- Baseie-se APENAS nas informações disponíveis no material da lição
- Seja didático e claro em suas explicações`;

    // Remover duplicação - usar apenas uma mensagem no conversation array
    const conversation: ChatMessage[] = [
      { role: "user", parts: [{ text: enhancedPrompt }] }
    ];

    // Lista de modelos do Gemini em ordem de preferência (fallback)
    const modelNames = [
      "gemini-2.5-flash",
      "gemini-2.0-flash",
      "gemini-2.0-flash-exp",
      "gemini-1.5-flash",
      "gemini-1.5-flash-8b",
      "gemini-1.5-pro",
      "gemini-pro"
    ];

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    let responseText = '';
    let lastError: any = null;

    // Tentar cada modelo em sequência até obter sucesso
    for (let i = 0; i < modelNames.length; i++) {
      try {
        console.log(`Tentando modelo: ${modelNames[i]} (tentativa ${i + 1}/${modelNames.length})`);
        
        const model = genAI.getGenerativeModel({ 
          model: modelNames[i],
          generationConfig: {
            temperature: 0.3,
            topP: 0.8,
            topK: 40,
            maxOutputTokens: 8000,
          }
        });

        const result = await model.generateContent({ contents: conversation });
        responseText = result.response.candidates?.[0]?.content?.parts?.[0]?.text || '';
        
        if (responseText) {
          console.log(`✅ Sucesso com modelo: ${modelNames[i]}`);
          break; // Sucesso! Sair do loop
        }
      } catch (modelError: any) {
        lastError = modelError;
        console.warn(`⚠️ Falha com modelo ${modelNames[i]}:`, modelError.message);
        
        // Se não for o último modelo, continuar tentando
        if (i < modelNames.length - 1) {
          console.log(`Tentando próximo modelo...`);
          continue;
        }
      }
    }

    // Se nenhum modelo funcionou, usar mensagem padrão
    if (!responseText) {
      console.error('❌ Todos os modelos falharam. Último erro:', lastError);
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