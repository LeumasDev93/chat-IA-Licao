// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { NextRequest, NextResponse } from 'next/server';
// import { GoogleGenerativeAI } from '@google/generative-ai';
// import { getCachedLesson, LessonData } from './scrape-lesson';

// const GEMINI_API_KEY = "AIzaSyAO8-1xWfio54YVvaOV3pEabu7GyE40oPo";

// interface ChatMessage {
//   role: "user" | "model";
//   parts: { text: string }[];
// }

// function buildSystemPrompt(lesson: LessonData | null): string {
//   const basePrompt = `
// Você é um especialista na Lição da Escola Sabatina, com profundo conhecimento teológico e capacidade de análise bíblica. 
// Sua missão é fornecer respostas completas e aprofundadas baseadas no conteúdo oficial de ${lesson?.title || 'a lição atual'}.

// DIRETRIZES ESSENCIAIS:
// 1. **Contextualização Histórica**: Sempre que relevante, forneça o contexto histórico-cultural dos textos
// 2. **Análise Teológica**: Explore os temas teológicos principais e suas implicações
// 3. **Aplicação Prática**: Sugira aplicações concretas para a vida diária
// 4. **Ligações Bíblicas**: Relacione com outros textos bíblicos que complementem o estudo
// 5. **Versículos Expandidos**: Não apenas cite, mas explique os versículos-chave
// 6. **Perguntas Reflexivas**: Inclua perguntas que estimulem a reflexão pessoal
// 7. **Estrutura Organizada**: Use parágrafos temáticos e marcadores quando apropriado

// ${!lesson ? 
// "(ATENÇÃO: Usando conhecimento geral, mas mantendo profundidade analítica)" : 
// `INFORMAÇÕES DETALHADAS DA LIÇÃO:

// **TEMA CENTRAL**: ${lesson.title}
// ${lesson.days.map((content, index) => {
//   const dayNames = ['Sábado', 'Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Auxiliar', 'Comentário'];
//   return `
// **${dayNames[index]} - ANÁLISE APROFUNDADA**:
// ${content}

// **TÓPICOS PARA REFLEXÃO**:
// - Principais ensinamentos deste estudo
// - Como isto se relaciona com o tema central
// - Aplicações práticas para minha vida
// - Perguntas para discussão em grupo
// `;
// }).join('\n')}

// **VERSÍCULOS COMENTADOS**:
// ${lesson.verses.map(verse => `
// - (${verse}): Exegese detalhada e significado contextual`).join('\n')}
// `}
// `.trim();

//   return basePrompt;
// }

// export async function POST(req: NextRequest) {
//   if (!GEMINI_API_KEY) {
//     return NextResponse.json(
//       { message: "Erro de configuração do servidor" },
//       { status: 500 }
//     );
//   }

//   const { userMessage } = await req.json();
//   if (!userMessage?.trim()) {
//     return NextResponse.json(
//       { message: "Por favor, envie uma mensagem válida" },
//       { status: 400 }
//     );
//   }

//   if (/^(ola|oi|olá|hello|bom dia|boa tarde|boa noite)/i.test(userMessage.toLowerCase())) {
//     return NextResponse.json({
//       message: "Olá! Como posso ajudar com as Lições da Escola Sabatina desta semana?"
//     });
//   }

//   try {
//     const lesson = await getCachedLesson();
//     const systemPrompt = buildSystemPrompt(lesson);

//     const conversation: ChatMessage[] = [
//       { role: "user", parts: [{ text: systemPrompt }] },
//       { role: "user", parts: [{ text: userMessage }] }
//     ];

//     const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
//     const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

//     const result = await model.generateContent({ contents: conversation });
//     const responseText = result.response.candidates?.[0]?.content?.parts?.[0]?.text 
//       || "Não entendi sua pergunta. Poderia reformular?";

//     return NextResponse.json({ message: responseText });

//   } catch (error: any) {
//     console.error("Erro na API:", error);

//     if (error.message?.includes("429")) {
//       return NextResponse.json(
//         { message: "Muitas requisições! Tente novamente mais tarde." },
//         { status: 429 }
//       );
//     }

//     return NextResponse.json(
//       { message: "Erro ao processar sua solicitação" },
//       { status: 500 }
//     );
//   }
// }


/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: "AIzaSyAO8-1xWfio54YVvaOV3pEabu7GyE40oPo" });



type LessonData = {
  title: string;
  days: string[];
  verses: string[];
  expiresAt: string;
  lessonLink: string;
  lastUpdated: string;
}
const CacheLessonData: LessonData = {
  title: 'Lições',
  days: [
    '‹›\n' +
    '\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\tLição 2\t\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\t05 a 11 de julho\t\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\tA sarça ardente | 3º Trimestre 2025\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\t\t\t\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\tSábado à tarde\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\tAno Bíblico: RPSP: ÊX 30\t\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\tVerso para memorizar:\n' +
    '\t\t\t\t\t\t“Então o Senhor continuou: – Certamente vi a aflição do Meu povo, que está no Egito, e ouvi o seu clamor por causa dos seus feitores. Conheço o sofrimento do Meu povo. Por isso desci a fim de livrá-lo das mãos dos egípcios e para fazê-lo sair daquela terra e levá-lo para uma terra boa e ampla, terra que mana leite e mel” (Êx 3:7, 8).\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\tLeituras da semana:\n' +
    '\t\t\t\t\t\tÊx 3; 18:3, 4; Gn 22:11, 15-18; Êx 6:3; jl 2:32; Êx 4; Gn 17:10, 11\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\tO chamado que Deus nos faz frequentemente mudará a direção da nossa vida. No entanto, se seguirmos esse chamado, descobriremos que o caminho de Deus é sempre a melhor rota. Ainda assim, às vezes, pelo menos no início, não é fácil aceitar o chamado divino.\n' +
    'Esse foi o caso de Moisés e seu chamado, que ocorreu no encontro com o Senhor na sarça ardente. Embora não tivesse conhecimento sobre as leis da combustão, Moisés sabia que estava presenciando um milagre, e isso chamou sua atenção. Sem dúvida, o Senhor o estava chamando para uma tarefa específica. A questão era: ele atenderia ao chamado, não importando a mudança drástica que isso traria à sua vida? No início, Moisés não recebeu muito bem essa nova realidade.\n' +
    'Você deve se lembrar de situações em que tinha objetivos, mas Deus redirecionou seus planos. Podemos servir a Deus de muitas maneiras, mas seguir Seu chamado e fazer o que Ele deseja é o caminho para uma existência satisfatória. Isso não é fácil, e não foi para Moisés, mas seria tolice seguir nosso caminho quando Deus mostra outra direção.\n' +
    'Garanta o conteúdo completo da Lição da Escola Sabatina para o ano inteiro. Faça aqui a sua assinatura!\n' +
    '\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\t\tEsse tipo de conteúdo não está disponível nesse navegador.\n' +
    '\t\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\tAssine a lição',
    '‹›\n' +
    '\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\tDomingo, 06 de julho\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\tAno Bíblico: RPSP: ÊX 31\t\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\tA sarça ardente\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\tDepois que Moisés fugiu para Midiã, ele teve uma vida relativamente fácil. Ele se casou, teve dois filhos, Gérson e Eliézer (Êx 18:3, 4), e fazia parte da família de Jetro, seu sogro e sacerdote de Midiã. Moisés passou 40 anos tranquilos sendo pastor, a mesma atividade de Davi (2Sm 7:8), e desfrutando a presença de Deus, especialmente revelada na natureza.\n' +
    'No entanto, Moisés não passou todo esse tempo simplesmente sentindo o aroma das flores (ou talvez, dos cactos do deserto). Esses anos de caminhada com o Senhor o transformaram e o prepararam para a liderança. Deus também usou Moisés naquele deserto pacato para escrever, sob inspiração divina, os dois livros mais antigos da Bíblia: Jó e Gênesis (Ellen G. White, Patriarcas e Profetas [CPB, 2022], p. 209; Comentário Bíblico Adventista do Sétimo Dia [CPB, 2016], v. 3, p. 1140). Ao escrever esses livros, Moisés recebeu de Deus revelações essenciais sobre o grande conflito, a criação, a queda, o dilúvio, os patriarcas e, mais importante ainda, o plano da salvação. Assim, ele teve papel fundamental em transmitir à humanidade o verdadeiro conhecimento do Criador e Mantenedor, e sobre o que Ele faz em relação ao pecado, que causou profundos danos ao planeta. A história da salvação não faz sentido sem o fundamento crucial que, sob inspiração, Moisés comunicou, especialmente em Gênesis.\n' +
    '1. Leia Êxodo 3:1-6. O Senhor Se apresentou a Moisés como “o Deus de Abraão, o Deus de Isaque e o Deus de Jacó”. Qual é a relevância desse fato?\n' +
    'Moisés viu que a sarça ardente não se consumia pelo fogo. Então percebeu que estava testemunhando um milagre e que algo espetacular e importante deveria estar acontecendo bem diante dele. Ao se aproximar, o Senhor lhe disse para tirar as sandálias dos pés como sinal de profundo respeito, porque a presença de Deus tornava o lugar santo.\n' +
    'O Senhor Se apresentou a Moisés como “o Deus de Abraão, o Deus de Isaque e o Deus de Jacó” (Êx 3:6). Ele havia prometido a esses patriarcas que seus descendentes herdariam a terra de Canaã, uma promessa que Moisés conhecia bem. Portanto, mesmo antes de dizê-lo, Deus já estava abrindo o caminho para que Moisés soubesse o que estava por vir e o papel crucial que deveria desempenhar.\n' +
    'Garanta o conteúdo completo da Lição da Escola Sabatina para o ano inteiro. Faça aqui a sua assinatura!\n' +
    '\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\t\tEsse tipo de conteúdo não está disponível nesse navegador.\n' +
    '\t\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\tMoisés precisou de 80 anos para que Deus o considerasse pronto para a tarefa. O que isso nos ensina sobre paciência?\t\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\t\t\t\t\n' +
    '\t\t\t\t\tAssine a lição',
    '‹›\n' +
    '\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\tSegunda-feira, 07 de julho\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\tAno Bíblico: RPSP: ÊX 32\t\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\tO Anjo do Senhor\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\tO “Anjo do Senhor” apareceu a Moisés “numa chama de fogo, no meio de uma sarça” (Êx 3:2). Quem falou com ele “do meio da sarça” foi o próprio Senhor Jesus (Êx 3:4).\n' +
    'Não precisamos nos preocupar com o fato de que o Anjo do Senhor era Jesus Cristo. O termo anjo significa “mensageiro” (em hebraico, malakhi). Dependendo do contexto, “anjo” pode ser um ser angélico, humano ou divino (Ml 3:1). Em vários casos do Antigo Testamento (AT), o Anjo do Senhor é uma Pessoa divina (Gn 22:11, 15-18; 31:3, 11, 13; Jz 2:1, 2; 6:11-22; Zc 3:1, 2). O Anjo do Senhor não apenas falava em nome do Senhor, mas era o próprio Senhor – Jesus é o mensageiro de Deus, que nos transmite a palavra do Pai.\n' +
    '2. Leia Êxodo 3:7-12. Como Deus explicou a Moisés por que queria intervir em favor dos israelitas escravizados no Egito?\n' +
    'O sofrimento do povo de Deus no Egito é descrito de forma poética como um “gemido” e um profundo “clamor” por ajuda. Deus ouviu o clamor dos israelitas e revelou preocupação por eles (Êx 2:23-25). O Senhor os chamou de “Meu povo” (Êx 3:7). Ou seja, antes mesmo do Sinai e da confirmação da aliança, eles eram Seu povo, e Ele os faria habitar e prosperar (se obedecessem) na terra de Canaã, como havia prometido a seus antepassados.\n' +
    'Deus disse a Moisés que o estava enviando ao Faraó para cumprir uma tarefa específica: “Agora venha, e Eu o enviarei a Faraó, para que você tire do Egito o Meu povo, os filhos de Israel” (Êx 3:10). Novamente, Deus os chamou de “o Meu povo”.\n' +
    'Que tarefa gigantesca! Diante disso, Moisés reagiu com uma pergunta: “Quem sou eu para ir a Faraó e tirar do Egito os filhos de Israel?” (Êx 3:11). Compreendendo tudo o que iria acontecer e qual seria seu papel em tudo isso, Moisés se perguntou por que alguém como ele teria sido escolhido. Logo no início da história, temos uma indicação do caráter de Moisés, de sua humildade e do senso de indignidade para a tarefa que ele estava sendo chamado a fazer.\n' +
    'Garanta o conteúdo completo da Lição da Escola Sabatina para o ano inteiro. Faça aqui a sua assinatura!\n' +
    '\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\t\tEsse tipo de conteúdo não está disponível nesse navegador.\n' +
    '\t\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\tPor que a humildade e o senso de nossa própria indignidade são essenciais para quem deseja seguir o Senhor e fazer Sua vontade?\t\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\t\t\t\t\n' +
    '\t\t\t\t\tAssine a lição',
    '‹›\n' +
    '\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\tTerça-feira, 08 de julho\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\tAno Bíblico: RPSP: ÊX 33\t\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\tO nome do Senhor\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\t3. Leia Êxodo 3:13-22. Por que Moisés desejava conhecer o nome de Deus? Qual é a importância desse nome?\n' +
    'Deus Se apresentou a Moisés como “eheyeh asher eheyeh”, que significa “Eu Sou o Que Sou” ou “Eu Serei o Que Serei”. O Senhor usou esse mesmo verbo (eheyeh) ao dizer a Moisés: “Eu estarei com você” (Êx 3:12). Essas palavras significam que Deus é eterno. Ele é o Deus transcendente, que habita “no alto e santo lugar”, e também o Deus imanente, que habita “com o contrito e abatido de espírito” (Is 57:15).\n' +
    'O nome próprio de Deus, Yahweh (geralmente traduzido na Bíblia como “Senhor”), era conhecido desde o início pelos israelitas, mesmo que não entendessem seu significado mais profundo. Moisés também conhecia o nome de Yahweh, mas, como outras pessoas, não sabia o que ele significa. Por isso perguntou: “Qual é o nome Dele?” (Êx 3:13).\n' +
    'Êxodo 6:3 ajuda a entender essa questão. Deus disse: “Apareci a Abraão, a Isaque e a Jacó como o Deus Todo-Poderoso; mas pelo Meu nome, o Senhor, não lhes fui conhecido”. Isso não significa que os patriarcas não conhecessem o nome Yahweh (Gn 2:4, 9; 4:1, 26; 7:5; 15:6-8); eles não conheciam o significado mais profundo desse nome.\n' +
    'O nome Yahweh aponta para o fato de que Ele é um Deus pessoal de Seu povo, o Deus da aliança, um Deus próximo e íntimo que Se envolve nas questões humanas. O título “Deus Todo-Poderoso” (Gn 17:1) indica que Ele age milagrosamente, usando Seu poder infinito. Já o nome Yahweh mostra que Ele é um Deus que revela Seu poder por meio de Seu amor e cuidado. Ele também é chamado de Elohim (traduzido como “Deus”), indicando o Deus poderoso, forte e transcendente, o Deus de toda a humanidade, o Governante do Universo e o Criador de todas as coisas. Yahweh e Elohim são nomes diferentes que revelam diferentes aspectos de Seu relacionamento com os seres humanos.\n' +
    'Conhecer ou invocar o nome do Senhor não é um mero ritual místico. Proclamar Seu nome significa ensinar a verdade sobre Deus e a salvação que Ele oferece aos que vão a Ele com fé. “Todo aquele que invocar o nome do Senhor será salvo” (Jl 2:32).\n' +
    'Garanta o conteúdo completo da Lição da Escola Sabatina para o ano inteiro. Faça aqui a sua assinatura!\n' +
    '\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\t\tEsse tipo de conteúdo não está disponível nesse navegador.\n' +
    '\t\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\tYahweh busca a proximidade e a intimidade com todos os que se entregam a Ele. Você já teve essa experiência?\t\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\t\t\t\t\n' +
    '\t\t\t\t\tAssine a lição',
    '‹›\n' +
    '\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\tQuarta-feira, 09 de julho\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\tAno Bíblico: RPSP: ÊX 34\t\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\tQuatro desculpas\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\t4. Leia Êxodo 4:1-17. Que sinais o Senhor ordenou que Moisés realizasse para fortalecer sua posição como mensageiro de Deus?\n' +
    'Moisés tentou novamente se justificar para evitar a missão que Deus lhe havia designado (Êx 3:11). Ele não queria ir ao Egito e confrontar o Faraó. Afinal, já havia falhado quando tentou, por conta própria, ajudar os hebreus. Além disso, seu povo não acreditou nele nem o aceitou como líder. Por isso, ele apresentou a terceira objeção: “E se eles não acreditarem em mim nem quiserem me ouvir?” (Êx 4:1, NVI). Moisés não estava buscando uma resposta. Essa foi uma forma de recusar a tarefa que Deus lhe pediu que assumisse.\n' +
    'Deus deu a Moisés dois sinais milagrosos que ele devia realizar diante dos anciãos de Israel e, depois, diante do Faraó: (1) sua vara se transformaria em serpente e depois em vara novamente; e (2) sua mão ficaria leprosa, mas depois seria curada instantaneamente. Ambos os milagres deviam convencer os anciãos de que Deus estava trabalhando por eles. Se não cressem, haveria um terceiro milagre, o de transformar água em sangue (Êx 4:8, 9).\n' +
    'Mesmo que Deus tivesse dado a Moisés esses grandes prodígios, ele ainda expressou uma quarta desculpa: ele tinha dificuldade para falar.\n' +
    '5. Leia Êxodo 4:10-18. Como o Senhor respondeu a Moisés? Que lições podemos tirar disso em qualquer situação para a qual Deus nos chamar?\n' +
    'As quatro desculpas mostram a relutância de Moisés em seguir o chamado de Deus. Com objeções aparentemente “lógicas”, ele escondia sua relutância em ir. As três primeiras desculpas expressam perguntas: (1) “Quem sou eu?”; (2) Quem és Tu?; e (3) E se eles não acreditarem em mim? A quarta objeção é uma declaração: “Eu nunca fui eloquente” (Êx 4:10). Deus reagiu trazendo uma solução poderosa e apresentando promessas motivadoras.\n' +
    'Então Moisés fez um quinto e último apelo, pedindo diretamente: “Ah! Senhor! Envia alguém outro que quiseres enviar” (Êx 4:13). Em resposta, Deus lhe disse que já estava enviando seu irmão Arão para ir ao encontro dele e ajudá-lo. Por fim, Moisés cedeu em silêncio e pediu a bênção de Jetro antes de partir para o Egito.\n' +
    'Garanta o conteúdo completo da Lição da Escola Sabatina para o ano inteiro. Faça aqui a sua assinatura!\n' +
    '\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\t\tEsse tipo de conteúdo não está disponível nesse navegador.\n' +
    '\t\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\t\t\t\t\n' +
    '\t\t\t\t\tAssine a lição',
    '‹›\n' +
    '\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\tQuinta-feira, 10 de julho\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\tAno Bíblico: RPSP: ÊX 35\t\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\tA circuncisão\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\t6. Leia Êxodo 4:18-31. Como entender essa história estranha? O que aprendemos com ela?\n' +
    'Muitas pessoas ficam chocadas ao lerem que, depois que Moisés obedeceu a Deus e começou sua jornada de volta ao Egito, o Senhor “procurou matá-lo” (Êx 4:24, NVI). Pelo contexto da história, fica claro que a questão era a circuncisão. O filho mais novo de Moisés não havia sido circuncidado, como exigia a aliança com Abraão (Gn 17:10, 11).\n' +
    'Moisés, como líder do povo de Deus, precisava mostrar sua perfeita submissão e obediência ao Senhor, a fim de ser qualificado para levar outros a ser obedientes. Ele tinha que ser um modelo de entrega completa a Deus. Sua esposa Zípora era uma mulher de ação e circuncidou seu filho para salvar a vida de seu marido. Ela tocou em Moisés com o prepúcio cheio de sangue, e esse sangue representa expiação, vida e confirmação da aliança. O fato de que a circuncisão tinha sido feita rapidamente aumentou o drama da situação.\n' +
    'Podemos aprender uma lição importante com esse episódio: jamais devemos deixar de fazer o que sabemos ser correto.\n' +
    '“No caminho, quando vinha de Midiã, Moisés recebeu uma advertência assustadora e terrível do desagrado do Senhor. Um anjo apareceu-lhe de maneira ameaçadora, como se fosse destruí-lo imediatamente. Nenhuma explicação havia sido dada. No entanto, Moisés se lembrou de que havia desatendido a uma das ordens de Deus; [...] negligenciara efetuar o rito da circuncisão em seu filho mais novo. Deixara de satisfazer a condição pela qual seu filho poderia ter direito às bênçãos da aliança de Deus com Israel, e tal negligência por parte do dirigente escolhido de Israel diminuiria a força dos preceitos divinos sobre o povo.\n' +
    '“Zípora, temendo que seu marido fosse morto, realizou ela mesma o rito, e então o anjo permitiu que Moisés prosseguisse com a jornada. Em sua missão diante do Faraó, Moisés seria colocado em posição de grande perigo; sua vida só poderia ser preservada pela proteção de santos anjos. No entanto, enquanto vivesse negligenciando um dever conhecido, não estaria livre de perigo, pois não poderia estar protegido pelos anjos de Deus” (Ellen G. White, Patriarcas e Profetas [CPB, 2022], p. 213).\n' +
    'Garanta o conteúdo completo da Lição da Escola Sabatina para o ano inteiro. Faça aqui a sua assinatura!\n' +
    '\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\t\tEsse tipo de conteúdo não está disponível nesse navegador.\n' +
    '\t\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\tVocê tem negligenciado algo que deveria fazer? O que essa história lhe diz a respeito dessa questão? Quais mudanças você precisa fazer neste exato momento?\t\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\t\t\t\t\n' +
    '\t\t\t\t\tAssine a lição',
    '‹›\n' +
    '\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\tSexta-feira, 11 de julho\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\tAno Bíblico: RPSP: ÊX 36\t\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\tEstudo adicional\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\tLeia, de Ellen G. White, Patriarcas e Profetas, p. 209-213 (“Moisés”).\n' +
    'O chamado espetacular vindo da sarça ardente provavelmente foi a experiência mais transformadora da vida de Moisés. Todos os outros pontos altos de sua vida dependeram de sua resposta positiva e obediente ao chamado de Deus para conduzir os hebreus para fora do Egito, rumo à terra prometida.\n' +
    'Hoje conhecemos a história completa. Mas coloque-se no lugar de Moisés na época da sarça ardente. Ele havia fugido do Egito para salvar a própria vida. Depois de 40 anos, uma nova geração de hebreus havia surgido, e muitos provavelmente sabiam pouco sobre ele, ou talvez tivessem ouvido histórias distorcidas sobre ele. E então ele foi chamado para liderar o povo a sair da nação mais poderosa do mundo? Não é de admirar sua relutância!\n' +
    'Era uma tarefa extremamente difícil, mas imagine o que Moisés teria perdido se a sua resposta final a Deus tivesse sido “não”. Talvez ele tivesse simplesmente desaparecido da história, em vez de, pelo poder de Deus, literalmente fazer história e se tornar uma das maiores e mais influentes pessoas, não apenas da Bíblia, mas da civilização humana.\n' +
    'Perguntas para consideração\n' +
    '1. Nos anos tranquilos passados no deserto, Moisés fez tudo o que o Senhor o chamou para realizar: foi um homem de família, cuidava de ovelhas e escreveu dois livros bíblicos sob a inspiração divina antes de ser chamado para ser um grande líder do povo de Deus. O que a experiência de Moisés ensina sobre nossos deveres da vida diária?\n' +
    '2. Alguém poderia argumentar que, à primeira vista, as desculpas de Moisés tinham sentido. “Por que alguém acreditaria em mim? Quem sou eu? Não sei falar bem.” O que essa história ensina sobre aprender a confiar que Deus nos capacita a fazer o que Ele nos chama a realizar?\n' +
    '3. A lição de domingo explica que Moisés escreveu o livro de Gênesis e destaca a importância desse livro para compreender a história sagrada e o plano da salvação. Por que devemos resistir às tentativas de enfraquecer a autoridade de Gênesis, especialmente a realidade histórica de seus primeiros 11 capítulos?\n' +
    'Respostas às perguntas da semana: 1. O mesmo Deus que havia feito promessas aos patriarcas estava com o povo de Israel. 2. Deus estava atento aos sofrimentos de Seu povo, ouviu o clamor dele e estava pronto para agir. 3. Moisés não entendia o que o nome de Deus realmente significa. O nome do Senhor revela Seu caráter. 4. Transformar a vara em serpente, tornar a pele leprosa e transformar água em sangue. 5. Deus disse que Ele é quem capacita as pessoas a falar e ver, e enviaria Arão. Deus oferece os recursos para a missão à qual nos chama. 6. Moisés errou em não circuncidar seu filho. Devemos obedecer ao que sabemos ser certo.\n' +
    'Garanta o conteúdo completo da Lição da Escola Sabatina para o ano inteiro. Faça aqui a sua assinatura!\n' +
    'livros bíblicos sob a inspiração divina antes de ser chamado para ser um grande líder do povo de Deus. O que a experiência de Moisés ensina sobre nossos deveres da vida diária?\n' +
    '2. Alguém poderia argumentar que, à primeira vista, as desculpas de Moisés tinham sentido. “Por que alguém acreditaria em mim? Quem sou eu? Não sei falar bem.” O que essa história ensina sobre aprender a confiar que Deus nos capacita a fazer o que Ele nos chama a realizar?\n' +
    '3. A lição de domingo explica que Moisés escreveu o livro de Gênesis e destaca a importância desse livro para compreender a história sagrada e o plano da salvação. Por que devemos resistir às tentativas de enfraquecer a autoridade de Gênesis, especialmente a realidade histórica de seus primeiros 11 capítulos?\n' +
    'Respostas às perguntas da semana: 1. O mesmo Deus que havia feito promessas aos patriarcas estava com o povo de Israel. 2. Deus estava atento aos sofrimentos de Seu povo, ouviu o clamor dele e estava pronto para agir. 3. Moisés não entendia o que o nome de Deus realmente significa. O nome do Senhor revela Seu caráter. 4. Transformar a vara em serpente, tornar a pele leprosa e transformar água em sangue. 5. Deus disse que Ele é quem capacita as pessoas a falar e ver, e enviaria Arão. Deus oferece os recursos para a missão à qual nos chama. 6. Moisés errou em não circuncidar seu filho. Devemos obedecer ao que sabemos ser certo.\n' +
    'Garanta o conteúdo completo da Lição da Escola Sabatina para o ano inteiro. Faça aqui a sua assinatura!\n' +
    'vida diária?\n' +
    '2. Alguém poderia argumentar que, à primeira vista, as desculpas de Moisés tinham sentido. “Por que alguém acreditaria em mim? Quem sou eu? Não sei falar bem.” O que essa história ensina sobre aprender a confiar que Deus nos capacita a fazer o que Ele nos chama a realizar?\n' +
    '3. A lição de domingo explica que Moisés escreveu o livro de Gênesis e destaca a importância desse livro para compreender a história sagrada e o plano da salvação. Por que devemos resistir às tentativas de enfraquecer a autoridade de Gênesis, especialmente a realidade histórica de seus primeiros 11 capítulos?\n' +
    'Respostas às perguntas da semana: 1. O mesmo Deus que havia feito promessas aos patriarcas estava com o povo de Israel. 2. Deus estava atento aos sofrimentos de Seu povo, ouviu o clamor dele e estava pronto para agir. 3. Moisés não entendia o que o nome de Deus realmente significa. O nome do Senhor revela Seu caráter. 4. Transformar a vara em serpente, tornar a pele leprosa e transformar água em sangue. 5. Deus disse que Ele é quem capacita as pessoas a falar e ver, e enviaria Arão. Deus oferece os recursos para a missão à qual nos chama. 6. Moisés errou em não circuncidar seu filho. Devemos obedecer ao que sabemos ser certo.\n' +
    'Garanta o conteúdo completo da Lição da Escola Sabatina para o ano inteiro. Faça aqui a sua assinatura!\n' +
    '2. Alguém poderia argumentar que, à primeira vista, as desculpas de Moisés tinham sentido. “Por que alguém acreditaria em mim? Quem sou eu? Não sei falar bem.” O que essa história ensina sobre aprender a confiar que Deus nos capacita a fazer o que Ele nos chama a realizar?\n' +
    '3. A lição de domingo explica que Moisés escreveu o livro de Gênesis e destaca a importância desse livro para compreender a história sagrada e o plano da salvação. Por que devemos resistir às tentativas de enfraquecer a autoridade de Gênesis, especialmente a realidade histórica de seus primeiros 11 capítulos?\n' +
    'Respostas às perguntas da semana: 1. O mesmo Deus que havia feito promessas aos patriarcas estava com o povo de Israel. 2. Deus estava atento aos sofrimentos de Seu povo, ouviu o clamor dele e estava pronto para agir. 3. Moisés não entendia o que o nome de Deus realmente significa. O nome do Senhor revela Seu caráter. 4. Transformar a vara em serpente, tornar a pele leprosa e transformar água em sangue. 5. Deus disse que Ele é quem capacita as pessoas a falar e ver, e enviaria Arão. Deus oferece os recursos para a missão à qual nos chama. 6. Moisés errou em não circuncidar seu filho. Devemos obedecer ao que sabemos ser certo.\n' +
    'Garanta o conteúdo completo da Lição da Escola Sabatina para o ano inteiro. Faça aqui a sua assinatura!\n' +
    '” O que essa história ensina sobre aprender a confiar que Deus nos capacita a fazer o que Ele nos chama a realizar?\n' +
    '3. A lição de domingo explica que Moisés escreveu o livro de Gênesis e destaca a importância desse livro para compreender a história sagrada e o plano da salvação. Por que devemos resistir às tentativas de enfraquecer a autoridade de Gênesis, especialmente a realidade histórica de seus primeiros 11 capítulos?\n' +
    'Respostas às perguntas da semana: 1. O mesmo Deus que havia feito promessas aos patriarcas estava com o povo de Israel. 2. Deus estava atento aos sofrimentos de Seu povo, ouviu o clamor dele e estava pronto para agir. 3. Moisés não entendia o que o nome de Deus realmente significa. O nome do Senhor revela Seu caráter. 4. Transformar a vara em serpente, tornar a pele leprosa e transformar água em sangue. 5. Deus disse que Ele é quem capacita as pessoas a falar e ver, e enviaria Arão. Deus oferece os recursos para a missão à qual nos chama. 6. Moisés errou em não circuncidar seu filho. Devemos obedecer ao que sabemos ser certo.\n' +
    'Garanta o conteúdo completo da Lição da Escola Sabatina para o ano inteiro. Faça aqui a sua assinatura!\n' +
    '3. A lição de domingo explica que Moisés escreveu o livro de Gênesis e destaca a importância desse livro para compreender a história sagrada e o plano da salvação. Por que devemos resistir às tentativas de enfraquecer a autoridade de Gênesis, especialmente a realidade histórica de seus primeiros 11 capítulos?\n' +
    'Respostas às perguntas da semana: 1. O mesmo Deus que havia feito promessas aos patriarcas estava com o povo de Israel. 2. Deus estava atento aos sofrimentos de Seu povo, ouviu o clamor dele e estava pronto para agir. 3. Moisés não entendia o que o nome de Deus realmente significa. O nome do Senhor revela Seu caráter. 4. Transformar a vara em serpente, tornar a pele leprosa e transformar água em sangue. 5. Deus disse que Ele é quem capacita as pessoas a falar e ver, e enviaria Arão. Deus oferece os recursos para a missão à qual nos chama. 6. Moisés errou em não circuncidar seu filho. Devemos obedecer ao que sabemos ser certo.\n' +
    'Garanta o conteúdo completo da Lição da Escola Sabatina para o ano inteiro. Faça aqui a sua assinatura!\n' +
    '\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\t\tEsse tipo de conteúdo não está disponível nesse navegador.\n' +
    'Respostas às perguntas da semana: 1. O mesmo Deus que havia feito promessas aos patriarcas estava com o povo de Israel. 2. Deus estava atento aos sofrimentos de Seu povo, ouviu o clamor dele e estava pronto para agir. 3. Moisés não entendia o que o nome de Deus realmente significa. O nome do Senhor revela Seu caráter. 4. Transformar a vara em serpente, tornar a pele leprosa e transformar água em sangue. 5. Deus disse que Ele é quem capacita as pessoas a falar e ver, e enviaria Arão. Deus oferece os recursos para a missão à qual nos chama. 6. Moisés errou em não circuncidar seu filho. Devemos obedecer ao que sabemos ser certo.\n' +
    'Garanta o conteúdo completo da Lição da Escola Sabatina para o ano inteiro. Faça aqui a sua assinatura!\n' +
    '\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\t\tEsse tipo de conteúdo não está disponível nesse navegador.\n' +
    'Transformar a vara em serpente, tornar a pele leprosa e transformar água em sangue. 5. Deus disse que Ele é quem capacita as pessoas a falar e ver, e enviaria Arão. Deus oferece os recursos para a missão à qual nos chama. 6. Moisés errou em não circuncidar seu filho. Devemos obedecer ao que sabemos ser certo.\n' +
    'Garanta o conteúdo completo da Lição da Escola Sabatina para o ano inteiro. Faça aqui a sua assinatura!\n' +
    '\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\t\tEsse tipo de conteúdo não está disponível nesse navegador.\n' +
    '\t\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\t\tEsse tipo de conteúdo não está disponível nesse navegador.\n' +
    '\t\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\t\t\t\t\n' +
    '\t\t\t\t\tAssine a lição'
  ],
  verses: [],
  lessonLink: 'https://mais.cpb.com.br/licao/a-sarca-ardente/',
  lastUpdated: '2025-07-08T23:49:34.111Z',
  expiresAt: '2025-07-15T23:49:35.865Z'
}
function buildSystemPrompt(lesson: LessonData | null): string {
  const dayNames = ['Sábado', 'Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];
  const currentDay = new Date().getDate(); // 0=Domingo, 1=Segunda...

  return `
**SISTEMA DE DIÁLOGO BÍBLICO INTERATIVO**

${lesson ? `📖 *Lição Atual:* ${lesson.title} (${lesson.days})` : '📖 *Modo Geral de Estudo Bíblico*'}

👋 *Saudação Inicial:* 
"Bem-Vindo(a) ao estudo da Lição da Escola Sabatina! Eu sou seu companheiro de estudo digital. Como posso ajudar você a explorar a Palavra de Deus hoje?"

🎯 *Objetivo:*
Criar um diálogo natural onde você pode:
- ❓ Fazer perguntas sobre qualquer parte da lição
- 🔍 Explorar conexões bíblicas profundas
- 💡 Receber aplicações práticas
- 🌍 Discutir em português ou Krioulu

📌 *Regras do Diálogo:*
1. Sempre comece respondendo de forma acolhedora
2. Adapte o nível de profundidade conforme o usuário
3. Use perguntas retóricas para engajar
4. Ofereça 3 caminhos de estudo após cada resposta
5. Mantenha o foco em ${lesson ? lesson.title : 'estudos bíblicos'}

OBSERVAÇÃO: estas formas não são regras rígidas, mas diretrizes para manter o diálogo fluido e interessante e não ser mostradas como um roteiro.
te
📅 *Destaque do Dia (${dayNames[currentDay]}):*
${lesson ? `
"Hoje estudamos: *${lesson.days[currentDay] || 'Tópico do dia'}*

Versículo-chave: (${lesson.days[currentDay] || 'a definir'})

Que aspecto gostaria de explorar?
1. Contexto histórico
2. Aplicação prática
3. Conexões proféticas"
` : 'Vamos explorar a Bíblia juntos! Sobre qual passagem gostaria de refletir hoje?'
    }

🔗 *Sugestões de Engajamento:*
"Posso:
1. Explicar o versículo principal em detalhes
2. Relacionar com nossa vida moderna
3. Mostrar conexões com outros textos bíblicos
4. Responder em Krioulu se preferir"

📚 *Estrutura de Respostas:*
1. 👂 Escuta ativa: "Você levantou um ponto importante sobre..."
2. 📖 Base bíblica: (Referência) + explicação acessível
3. 🔍 Profundidade: Contexto histórico-teológico
4. 💬 Diálogo: "O que você acha dessa interpretação?"
5. 🛠 Aplicação: "Como podemos viver isso hoje?"
6. ➡️ Transição: "Gostaria de explorar outro aspecto?"

🌍 *Exemplo em Krioulu:*
"Bô kré discubri más sobri es liçon di simana? N’konsinti odja ku bo pensa sobri... (Versículo)"

⚠️ *Limites:*
- Foco exclusivo em ${lesson ? 'a lição atual' : 'estudos bíblicos'}
- Respeito às diferentes interpretações
- Incentivo à pesquisa pessoal
- As saudações podem ser variadas e so deve ser mostradas no inicio da conversa
- Se recebes palavrões, faz alerta sobre politicas de privacidade, e em caso de violações, agir conforme a lei...

*Inicie nossa conversa dizendo:*
"Gostaria de entender melhor sobre [tópico]..."
OU
"Podemos conversar em Krioulu sobre..."
`.trim();
}

const systemPrompt = buildSystemPrompt(CacheLessonData);

const conversationHistory: any[] = [
  { role: "user", parts: [{ text: systemPrompt }] }
];

export async function POST(req: NextRequest) {
  const { userMessage } = await req.json();

  try {
    conversationHistory.push({
      role: "user",
      parts: [{ text: userMessage }],
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: conversationHistory,
    });

    const text = response.candidates?.[0]?.content?.parts?.[0]?.text || "Não entendi sua pergunta.";


    conversationHistory.push({
      role: "model",
      parts: [{ text }],
    });

    return NextResponse.json({ message: text, conversationHistory }, { status: 200 });

  } catch (error) {
    console.error("Erro com Gemini:", error);
    return NextResponse.json(
      { message: "Erro ao processar a solicitação." },
      { status: 500 }
    );
  }
}