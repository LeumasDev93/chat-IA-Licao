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
    '\t\t\t\t\t\tLição 3\t\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\t12 a 18 de julho\t\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\tComeço difícil | 3º Trimestre 2025\n' +
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
    '\t\t\t\t\t\tAno Bíblico: RPSP: ÊX 37\t\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\tVerso para memorizar:\n' +
    '\t\t\t\t\t\t“Depois Moisés e Arão foram e disseram a Faraó: – Assim diz o Senhor, Deus de Israel: ‘Deixe o Meu povo ir, para que Me celebre uma festa no deserto.’ Faraó respondeu: – Quem é o Senhor para que eu ouça a Sua voz e deixe Israel ir? Não conheço o Senhor e não deixarei Israel ir” (Êx 5:1, 2).\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\tLeituras da semana:\n' +
    '\t\t\t\t\t\tÊx 5; Ap 11:8; Êx 6:1-13; Sl 73:23-26; 2Co 6:16; Êx 6:28-30; 7:1-7\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\tMuitos acreditam que, ao decidir seguir a Deus, experimentarão apenas felicidade e sucesso. No entanto, esse não é o caso, como a Bíblia demonstra. Às vezes, surgem obstáculos e novas dificuldades. Isso pode ser frustrante e levantar questões complexas que nem sempre têm respostas claras ou não têm nenhuma resposta.\n' +
    'Os que confiam em Deus enfrentarão provações. No entanto, quando perseveramos, Ele traz soluções em Seus termos e no Seu tempo. Os caminhos do Senhor muitas vezes entram em conflito com nossas expectativas de soluções imediatas, mas devemos confiar Nele, independentemente das circunstâncias.\n' +
    'O tema do estudo desta semana é Moisés e a ordem de conduzir o povo de Deus para fora do Egito – um chamado tão claro quanto poderia ser. Esse chamado incluiu milagres e até mesmo o próprio Deus falando diretamente a Moisés, mostrando-lhe exatamente o que Ele desejava que fosse feito.\n' +
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
    '\t\t\t\t\tAssine a lição\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\tMoisés foi chamado por Deus e recebeu uma tarefa específica. Não seria de se esperar que o processo fosse simples? Veremos que a realidade não é tão simples.',
    '‹›\n' +
    '\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\tDomingo, 13 de julho\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\tAno Bíblico: RPSP: ÊX 38\t\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\tQuem é o Senhor?\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\tSeguindo a ordem de Deus, Moisés foi até o Faraó para iniciar o processo de libertação, no qual tiraria “do Egito o [Seu] povo, os filhos de Israel” (Êx 3:10).\n' +
    '1. Deus ordenou: “Deixe o Meu povo ir.” Qual foi a resposta do Faraó e o que podemos aprender com isso? Êx 5:1, 2\n' +
    '“Quem é o Senhor [...]?”, perguntou o Faraó, não com o desejo de conhecê-Lo, mas como um ato de desafio ou até mesmo de negação de Deus, a quem ele admitia não conhecer, quase como se orgulhando disso.\n' +
    'Quantas pessoas ao longo da história não fizeram o mesmo questionamento? Isso é trágico, pois, como Jesus disse: “A vida eterna é esta: que conheçam a Ti, o único Deus verdadeiro, e a Jesus Cristo, a quem enviaste” (Jo 17:3).\n' +
    'O Egito, tendo o Faraó como seu rei, representa um poder que nega a presença e a autoridade de Deus, que se opõe a Deus, à Sua Palavra e ao Seu povo.\n' +
    'Faraó disse: “Não deixarei Israel ir”, revelando sua rebelião contra Deus, destacando o Egito como símbolo de um sistema que nega a Deus e luta contra Ele.\n' +
    'Não é surpreendente que muitos cristãos tenham visto essa mesma atitude repetida, milênios depois, na Revolução Francesa, que ocorreu entre 1789 e 1799 (ver Is 30:1-3; Ap 11:8). O Faraó se considerava um deus ou o filho de um deus – uma referência clara à crença em seu poder, força e inteligência supremos.\n' +
    '“De todas as nações apresentadas na história bíblica, o Egito, de maneira mais ousada, negou a existência do Deus vivo e resistiu aos Seus preceitos. Nenhum monarca se atreveu a se rebelar de forma mais aberta e arrogante contra a autoridade do Céu do que o rei do Egito. [...] Isso é ateísmo; e a nação representada pelo Egito [ou seja, a França] expressaria igual negação às reivindicações do Deus vivo, manifestando idêntico espírito de incredulidade e desafio” (Ellen G. White, O Grande Conflito [CPB, 2021], p. 229).\n' +
    'Garanta o conteúdo completo da Lição da Escola Sabatina para o ano inteiro. Faça aqui a sua assinatura!\n' +
    '\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\t\tEsse tipo de conteúdo não está disponível nesse navegador.\n' +
    '\t\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\tSe alguém lhe perguntasse: “Você conhece o Senhor?”, como você responderia? Se a resposta for sim, como você descreveria quem Ele é, e por quê?\t\t\t\t\t\n' +
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
    '\t\t\t\t\tSegunda-feira, 14 de julho\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\tAno Bíblico: RPSP: ÊX 39\t\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\tUm começo difícil\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\tMoisés sabia, desde o início, que sua tarefa não seria fácil (por isso tentou fugir dela). No entanto, ele provavelmente não tinha consciência do que estava por vir.\n' +
    '2. Leia Êxodo 5:3-23. Quais foram os resultados imediatos do primeiro encontro de Moisés e Arão com o Faraó?\n' +
    'Antes de se dirigirem ao Faraó, Moisés e Arão reuniram os anciãos e o povo, transmitiram-lhes as palavras de Deus e fizeram os sinais miraculosos, convencendo os israelitas de que o Senhor os libertaria. Como resultado, eles adoraram o Senhor (Êx 4:29-31). As expectativas eram altas: Deus iria libertar os hebreus da escravidão!\n' +
    'No entanto, quando Moisés foi ao rei do Egito com as exigências de Deus, as coisas pioraram para os israelitas. Seu trabalho diário tornou-se mais árduo e difícil. Eles foram acusados de serem preguiçosos e tratados com maior severidade.\n' +
    'Os líderes dos hebreus ficaram descontentes, e o confronto entre eles e Moisés e Arão foi intenso. Além disso, como veremos mais adiante, isso prenunciou o tipo de conflito que Moisés enfrentaria com seu próprio povo nos anos seguintes.\n' +
    '3. Leia Êxodo 5:21. Coloque-se no lugar desses homens quando confrontaram Moisés e Arão. Por que eles disseram essas palavras?\n' +
    'Não é difícil entender por que eles ficaram tão aborrecidos com Moisés, a ponto de dizerem: “Que o Senhor olhe para vocês e os julgue” (Êx 5:21). Eles esperavam que Moisés viesse para libertá-los dos egípcios, não para tornar ainda mais difícil a vida deles sob o domínio egípcio.\n' +
    'Assim, além de lidar com os egípcios, Moisés e Arão tiveram que enfrentar a oposição de seu próprio povo.\n' +
    'Garanta o conteúdo completo da Lição da Escola Sabatina para o ano inteiro. Faça aqui a sua assinatura!\n' +
    '\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\t\tEsse tipo de conteúdo não está disponível nesse navegador.\n' +
    '\t\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\tQual é a melhor maneira de lidar com os líderes da igreja quando surgirem desentendimentos, que inevitavelmente acontecem?\t\t\t\t\t\n' +
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
    '\t\t\t\t\tTerça-feira, 15 de julho\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\tAno Bíblico: RPSP: ÊX 40\t\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\tO “Eu” divino\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\tPobre Moisés! Foi criticado pelo Faraó e, depois, seu povo quase o amaldiçoou.\n' +
    'Diante disso, Moisés se queixou: “Ó Senhor, por que afligiste este povo? Por que me enviaste? Pois, desde que me apresentei a Faraó, para falar-lhe em Teu nome, ele tem maltratado este povo; e Tu nada fizeste para livrar o Teu povo” (Êx 5:22, 23). Moisés ficou descontente com Deus e, nessas circunstâncias, isso é compreensível.\n' +
    'A resposta de Deus, porém, foi poderosa. Ele prometeu agir de forma decisiva: “Agora você verá o que vou fazer a Faraó” (Êx 6:1).\n' +
    '4. Leia Êxodo 5:22, 23; 6:1-8. Qual foi a resposta de Deus a Moisés? Quais importantes verdades teológicas são reveladas nesse texto?\n' +
    'Em vez de apenas falar, Deus agora interviria poderosamente em favor de Seu povo. Ele lembrou Moisés de alguns fatos importantes: (1) “Eu sou o Senhor”; (2) “apareci” aos patriarcas; (3) “estabeleci a Minha aliança com eles”; (4) prometi “dar-lhes a terra de Canaã”; (5) “ouvi os gemidos dos filhos de Israel”; e (6) “Me lembrei da Minha aliança” de dar a vocês a terra prometida (Êx 6:2-5).\n' +
    'Observe a repetição do pronome “Eu”. Deus estava dizendo, em outras palavras: “Eu sou o Senhor. Fiz determinadas coisas no passado e, portanto, vocês podem confiar que, no futuro, farei por vocês tudo o que prometi.”\n' +
    'O Senhor disse que faria quatro grandes coisas por Israel, porque Ele é o Deus vivo: (1) “vou tirá-los dos trabalhos pesados no Egito”; (2) “vou livrálos da escravidão”; (3) “vou resgatar vocês com braço estendido e com grandes manifestações de juízo”; e (4) “Eu os tomarei por Meu povo e serei o seu Deus” (Êx 6:6, 7).\n' +
    'Essas quatro ações garantem e restabelecem o relacionamento de Deus com Seu povo. É o Senhor que realiza essas ações, e os israelitas recebem esses benefícios. Deus ofereceu essas dádivas por amor aos israelitas e faz isso por nós.\n' +
    'Garanta o conteúdo completo da Lição da Escola Sabatina para o ano inteiro. Faça aqui a sua assinatura!\n' +
    '\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\t\tEsse tipo de conteúdo não está disponível nesse navegador.\n' +
    '\t\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\tPense em personagens que se queixaram diante de Deus – e com boas razões. É errado derramar o coração e reclamar de alguma situação? Por que, no entanto, devemos sempre fazer isso com fé e confiança?\t\t\t\t\t\n' +
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
    '\t\t\t\t\tQuarta-feira, 16 de julho\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\tAno Bíblico: RPSP: LV 1\t\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\tNão sei falar bem\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\tO Senhor havia feito a Moisés promessas poderosas sobre o que Ele faria.\n' +
    'Embora esse encontro devesse ter encorajado Moisés, o entusiasmo provavelmente durou pouco, considerando a resposta que ele recebeu do povo.\n' +
    '5. Leia Êxodo 6:9-13. O que aconteceu em seguida? Que lições podemos tirar dessa história sobre momentos de desapontamento e dificuldades em nossa vida?\n' +
    'Os hebreus estavam tão desanimados pelo sofrimento que não conseguiram ouvir as palavras de Moisés, que garantiam que Deus cumpriria Sua promessa. Eles haviam esperado muito por isso, e suas expectativas não se cumpriram. Por que seria diferente agora? Eles estavam perdendo a esperança, o que deve ter sido ainda mais amargo porque, talvez pela primeira vez, eles viram esperança real de libertação.\n' +
    'Já estivemos em uma situação semelhante? Quem nunca se sentiu, em algum momento, deprimido, desapontado, insatisfeito e até mesmo abandonado por Deus?\n' +
    'Pense na história de Jó e reflita sobre Asafe, um salmista que se questionou sobre a prosperidade dos ímpios e o sofrimento dos justos. No entanto, apesar de suas dúvidas, Asafe escreveu uma das mais belas confissões de fé: “Contudo, sempre estou Contigo; tomas a minha mão direita e me susténs. Tu me diriges com o Teu conselho e depois me receberás com honras. A quem tenho nos Céus senão a Ti? Não há ninguém na Terra que eu deseje mais do que a Ti. O meu corpo e o meu coração poderão fraquejar, mas Deus é a rocha do meu coração e a minha herança para sempre” (Sl 73:23-26, NVI).\n' +
    'Deus assegurou que está com Seu povo (Is 41:13; Mt 28:20) e lhe dá paz e conforto. Ele o fortalece para enfrentar os desafios da vida (Jo 14:27; 16:33; Fp 4:6, 7).\n' +
    'A fórmula da aliança, “Eu os tomarei por Meu povo e serei o seu Deus” (Êx 6:7), expressa o relacionamento profundo que o Senhor deseja ter com Seu povo.\n' +
    'Garanta o conteúdo completo da Lição da Escola Sabatina para o ano inteiro. Faça aqui a sua assinatura!\n' +
    '\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\t\tEsse tipo de conteúdo não está disponível nesse navegador.\n' +
    '\t\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\tReflita sobre esta frase: “Eu os tomarei por Meu povo e serei o seu Deus.” Embora envolvesse Israel como nação, como essa verdade se aplica a cada pessoa? Como esse relacionamento deve se manifestar em nossa vida diária? (2Co 6:16.)\t\t\t\t\t\n' +
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
    '\t\t\t\t\tQuinta-feira, 17 de julho\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\tAno Bíblico: RPSP: LV 2\t\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\tMoisés: como Deus sobre o Faraó\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\t6. Leia Êxodo 6:28-30; 7:1-7. Como o Senhor lidou com as objeções de Moisés?\n' +
    'Deus Se apresentou a Moisés como Yahweh, o que significa que Ele é o Deus pessoal e próximo de Seu povo, o Deus que entrou em aliança com o povo.\n' +
    'Esse Deus imanente, que está presente conosco, ordenou novamente a Moisés que falasse com o Faraó. Com falta de autoconfiança, Moisés mais uma vez apresentou uma objeção: “Como é que Faraó vai me ouvir?” (Êx 6:30). Aqui, vemos não apenas a humildade de Moisés, mas também seu desejo de fugir de uma tarefa que, até então, não havia sido bem-sucedida.\n' +
    '“Quando Deus ordenou que Moisés voltasse ao Faraó, o líder hebreu revelou desconfiança de si mesmo. A expressão aral sephatayim (literalmente, ‘lábios incircuncisos’), usada para expressar a falta de habilidade de comunicação de Moisés (Êx 6:12, 30), é semelhante à encontrada em Êxodo 4:10: ‘pesado de boca’” (Comentário Bíblico Andrews, v. 1: Gênesis a Ester [CPB, 2024], p. 227).\n' +
    'Em Sua misericórdia, Deus providenciou Arão para ajudar Moisés. O líder de Israel falaria com Arão, que então se dirigiria publicamente ao Faraó. Moisés desempenharia o papel de “Deus” diante do rei egípcio, e Arão seria seu “profeta”.\n' +
    'Esse relato apresenta uma excelente definição do que é um profeta: um porta-voz de Deus, que transmite e interpreta Sua palavra ao povo. Assim como Moisés falou a Arão, que então anunciou ao Faraó, Deus Se comunica com um profeta, que proclama Seus ensinamentos ao povo. Isso pode ocorrer pessoalmente, de viva voz, ou, como era mais frequente, o profeta recebia a mensagem e a registrava por escrito.\n' +
    'Deus também advertiu a Moisés que os encontros com o Faraó seriam confrontos tensos e prolongados. Pela segunda vez, Deus destacou que o Faraó seria obstinado e que Ele mesmo endureceria o coração do rei (Êx 4:21; 7:3). O resultado, contudo, seria positivo, pois Deus afirmou: “Os egípcios saberão que Eu sou o Senhor” (Êx 7:5). Em meio ao caos, Deus seria glorificado.\n' +
    'Garanta o conteúdo completo da Lição da Escola Sabatina para o ano inteiro. Faça aqui a sua assinatura!\n' +
    '\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\t\tEsse tipo de conteúdo não está disponível nesse navegador.\n' +
    '\t\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\tMoisés ficou sem desculpas para não cumprir o que Deus o havia chamado a fazer. Que desculpas usamos para escapar do que o Senhor deseja que façamos?\t\t\t\t\t\n' +
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
    '\t\t\t\t\tSexta-feira, 18 de julho\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\tAno Bíblico: RPSP: LV 3\t\t\t\t\t\n' +
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
    '\t\t\t\t\t\tLeia, de Ellen G. White, Patriarcas e Profetas, p. 214-220 (“As pragas do Egito”).\n' +
    'Observe como as coisas começaram mal para Moisés e seu povo depois que ele se apresentou ao Faraó pela primeira vez.\n' +
    '“O rei, profundamente perturbado, suspeitou que os israelitas estivessem armando um plano de revolta no trabalho. Para ele, o descontentamento era resultado da ociosidade; portanto, trataria de fazer com que não sobrasse nenhum tempo para formularem planos perigosos. [...] O material de construção mais comum naquele país era tijolo seco ao sol; dele eram feitas as paredes dos mais belos edifícios, que depois eram recobertos com pedra; e a manufatura do tijolo empregava grande número de escravos. Como o barro era misturado com palha, para dar consistência, grandes quantidades deste último material eram necessárias para o trabalho. O rei determinou então que não mais se fornecesse palha; os trabalhadores deviam procurá-la por si mesmos, sendo, porém, exigida a mesma quantidade de tijolos. [...]\n' +
    '“Os capatazes egípcios tinham indicado oficiais hebreus para fiscalizar o trabalho do povo, e esses oficiais eram responsáveis pelo serviço efetuado por aqueles que estavam sob seu encargo. Quando o mandado do rei entrou em vigor, o povo se espalhou por todo o Egito, para colher restolho em lugar de palha; mas viu que era impossível fabricar a mesma quantidade de tijolo de antes. Por causa desse prejuízo, os encarregados hebreus foram cruelmente espancados” (Ellen G. White, Patriarcas e Profetas [CPB, 2022], p. 215).\n' +
    'Perguntas para consideração\n' +
    '1. Atendendo ao chamado de Deus, você já enfrentou resultados negativos, pelo menos no início? Que lições você aprendeu ao longo do tempo com essa experiência?\n' +
    '2. Como o Senhor interveio em sua vida quando você orou por auxílio, mesmo quando não esperava? Podemos confiar em Deus quando coisas ruins atingem os fiéis?\n' +
    '3. O que você diria a alguém que afirmasse: “Não conheço o Senhor”? Suponha que a pessoa dissesse isso, não como um desafio, mas como um fato sobre sua vida. Como ajudá-la a conhecer o Senhor e explicar por que é importante que ela faça isso?\n' +
    'Respostas às perguntas da semana: 1. O Faraó disse que não conhecia o Senhor e não deixaria o povo ir. Essa atitude indica oposição a Deus e à Sua vontade. 2. O Faraó acusou os hebreus de serem preguiçosos e tornou o trabalho deles mais árduo. 3. Leiam o texto bíblico e comentem na classe. 4. Deus destacou que havia agido no passado e faria isso novamente. A salvação é obra de Deus em favor de Seu povo. 5. Os hebreus não deram ouvidos a Moisés. Em algumas situações difíceis não conseguimos crer que Deus cumprirá Suas promessas. 6. O Senhor providenciou Arão para ajudar Moisés e falar com o Faraó.\n' +
    'Garanta o conteúdo completo da Lição da Escola Sabatina para o ano inteiro. Faça aqui a sua assinatura!\n' +
    '\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\t\tEsse tipo de conteúdo não está disponível nesse navegador.\n' +
    '\t\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\t\t\t\t\n' +
    '\t\t\t\t\tAssine a lição'
  ],
  verses: [],
  lessonLink: 'https://mais.cpb.com.br/licao/comeco-dificil/',
  lastUpdated: '2025-07-12T19:05:14.125Z',
  expiresAt: '2025-07-19T19:05:14.859Z'
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