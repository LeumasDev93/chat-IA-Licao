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
    '\t\t\t\t\t\tLição 4\t\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\t19 a 25 de julho\t\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\tAs pragas | 3º Trimestre 2025\n' +
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
    '\t\t\t\t\t\tAno Bíblico: RPSP: LV 4\t\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\tVerso para memorizar:\n' +
    '\t\t\t\t\t\t“E assim Faraó, de coração endurecido, não deixou ir os filhos de Israel, como o Senhor tinha dito a Moisés” (Êx 9:35).\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\tLeituras da semana:\n' +
    '\t\t\t\t\t\tÊx 7:8-25; 8; 9; 10; Nm 33:4; Rm 1:24-32; Sl 104:27, 28; Is 28:2, 12-17; 44:9, 10, 12-17\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\tUm fazendeiro estava tentando fazer seu jumento se mover, mas não estava tendo sucesso. Então, pegou um galho grosso e bateu no animal. Em seguida, falou novamente com o jumento, que então começou a se mover.\n' +
    'Quando alguém perguntou ao fazendeiro por que isso funcionou, ele respondeu: “Bem, primeiro é necessário chamar a atenção dele.”\n' +
    'Deixando de lado a crueldade com os animais, essa história ilustra uma verdade especial no contexto da saída dos hebreus do Egito. Moisés recebeu suas ordens de marcha e foi ao Faraó com as palavras de Deus, shalach et ami (“Deixe o Meu povo ir!”; Êx 5:1).\n' +
    'O Faraó, no entanto, não queria permitir que o povo de Deus fosse embora. A Bíblia nunca explica explicitamente por que o Faraó estava tão relutante, apesar da ameaça militar que os egípcios temiam que os hebreus pudessem representar (Êx 1:10). Muito provavelmente, como costuma acontecer com a escravidão, era uma questão econômica. Como os israelitas eram uma fonte de mão de obra barata, o Faraó não queria perder as vantagens econômicas que esses escravos lhe proporcionavam. Assim, ele precisaria de algo mais convincente, não apenas para chamar sua atenção, mas também para mudar seus pensamentos.\n' +
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
    '\t\t\t\t\tDomingo, 20 de julho\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\tAno Bíblico: RPSP: LV 5\t\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\tDeus versus deuses\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\t1. Leia Êxodo 7:8-15. Quais lições podemos aprender desse primeiro confronto entre o Deus dos hebreus e os deuses do Egito?\n' +
    'As batalhas que se seguiriam seriam entre o Deus vivo e os “deuses” egípcios. O que agravava a situação era que o Faraó se considerava um desses deuses. O Senhor não lutou simplesmente contra os egípcios ou contra o Egito em si, mas contra suas divindades (os egípcios veneravam mais de 1.500 deuses e deusas). O texto bíblico é claro: “Executarei juízo sobre todos os deuses do Egito. Eu sou o Senhor” (Êx 12:12). Essa verdade foi enfatizada novamente quando a jornada de Israel foi recontada: “Contra os deuses o Senhor executou juízos” (Nm 33:4).\n' +
    'Um exemplo desse juízo sobre os deuses do Egito é o milagre da vara que se transformou em serpente (Êx 7:9-12). No Egito, Uadjet era a deusa do Urel, a representação de uma cobra erguida, colocada nas coroas dos Faraós e deuses do Egito e que simbolizava o poder soberano sobre o Baixo Egito. O símbolo da serpente representava a divindade, realeza e autoridade divina do Faraó, pois essa deusa cuspia veneno em seus inimigos. Os egípcios também acreditavam que a serpente sagrada guiaria o Faraó na vida após a morte.\n' +
    'Quando a vara de Arão se transformou em serpente e devorou as outras serpentes diante do rei, foi demonstrada a supremacia do Deus vivo sobre a magia e feitiçaria egípcias. O emblema do poder do Faraó não apenas foi conquistado, mas Arão e Moisés o seguraram em suas mãos (Êx 7:12, 15). Esse confronto inicial demonstrou o poder e a soberania de Deus sobre o Egito. Moisés, como representante do Senhor, tinha maior autoridade e poder do que o deus Faraó.\n' +
    'Também é significativo que os antigos egípcios adorassem um deusserpente, Nehebkau (que significa “aquele que controla os espíritos”). Segundo a mitologia, esse deus tinha grande poder por ter engolido sete serpentes. Assim, Deus estava dizendo aos egípcios que Ele, e não o deus-serpente, possui o poder e a autoridade supremos. Após um confronto tão intenso, os líderes do Egito foram capazes de compreender essa mensagem de maneira imediata e bastante clara.\n' +
    'Garanta o conteúdo completo da Lição da Escola Sabatina para o ano inteiro. Faça aqui a sua assinatura!\n' +
    '\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\t\tEsse tipo de conteúdo não está disponível nesse navegador.\n' +
    '\t\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\tComo podemos permitir que o Senhor tenha soberania sobre qualquer um dos “deuses” que buscam supremacia em nossa vida?\t\t\t\t\t\n' +
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
    '\t\t\t\t\tSegunda-feira, 21 de julho\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\tAno Bíblico: RPSP: LV 6\t\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\tQuem endureceu o coração do Faraó?\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\t2. Leia Êxodo 7:3, 13, 14, 22. Como podemos entender esses textos?\n' +
    'Nove vezes o livro de Êxodo afirma que Deus endureceu o coração do Faraó (Êx 4:21; 7:3; 9:12; 10:1, 20, 27; 11:10; 14:4, 8; ver Rm 9:17, 18). Outras nove vezes é dito que o próprio Faraó endureceu seu coração (Êx 7:13, 14, 22; 8:15, 19, 32; 9:7, 34, 35).\n' +
    'Afinal, quem endureceu o coração do rei: Deus ou o próprio Faraó?\n' +
    'É significativo que, no relato das dez pragas, nas cinco primeiras, apenas o Faraó seja considerado aquele que endureceu seu próprio coração. Ele começou o processo de endurecimento por sua própria vontade. A partir da sexta praga, no entanto, o texto bíblico afirma que foi Deus quem endureceu o coração do Faraó (Êx 9:12). Isso mostra que Deus fortaleceu ou aprofundou a própria escolha do Faraó, sua decisão voluntária, conforme havia dito a Moisés que faria (Êx 4:21).\n' +
    'Em outras palavras, Deus enviou as pragas com o propósito de ajudar o Faraó a se arrepender e a se libertar da escuridão e do erro em que sua mente se encontrava. Deus não criou o mal ou o pecado no coração do Faraó; ao contrário, simplesmente o entregou aos seus próprios impulsos malignos. Deus o deixou sem Sua graça restritiva, abandonando-o à sua própria maldade (ver Rm 1:24-32).\n' +
    'O Faraó tinha livre-arbítrio, podia escolher a favor de Deus ou contra Ele, e decidiu contra. A lição é clara: recebemos a capacidade de escolher entre o certo e o errado, o bem e o mal, a obediência ou a desobediência. Desde Lúcifer no Céu, passando por Adão e Eva no Éden e o Faraó no Egito, até nós, hoje, onde quer que estejamos, temos que escolher entre a vida e a morte (Dt 30:19).\n' +
    'Uma ilustração pode nos ajudar a compreender esse tema. Imagine a luz do Sol incidindo sobre a manteiga e o barro. A manteiga derrete, mas o barro endurece. O calor do Sol é o mesmo em ambos os casos, mas há duas reações diferentes e dois resultados distintos. O efeito depende da natureza do material. No caso do Faraó, podemos dizer que dependia das atitudes de seu coração em relação a Deus e ao Seu povo.\n' +
    'Garanta o conteúdo completo da Lição da Escola Sabatina para o ano inteiro. Faça aqui a sua assinatura!\n' +
    '\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\t\tEsse tipo de conteúdo não está disponível nesse navegador.\n' +
    '\t\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\tComo você usará seu livre-arbítrio nos próximos dias? Se você sabe qual é a escolha certa, como pode se preparar para fazê-la?\t\t\t\t\t\n' +
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
    '\t\t\t\t\tTerça-feira, 22 de julho\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\tAno Bíblico: RPSP: LV 7\t\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\tAs três primeiras pragas\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\tAs dez pragas do Egito não foram direcionadas ao povo egípcio, mas aos seus deuses. Cada praga atingiu, pelo menos, um deles.\n' +
    '3. Leia Êxodo 7:14-25; 8:1-19. O que aconteceu durante essas pragas?\n' +
    'Deus informou a Moisés que o diálogo com o Faraó seria difícil; na verdade, quase impossível (Êx 7:14). No entanto, Ele queria Se revelar ao Faraó e aos egípcios. Portanto, decidiu Se comunicar com eles de uma forma que pudessem entender. Além disso, os hebreus se beneficiariam desse confronto, pois aprenderiam mais sobre o seu Deus.\n' +
    'A primeira praga foi dirigida contra Hapi, o deus do Nilo (Êx 7:17-25). O Egito dependia das águas do Nilo. Onde havia água, havia vida. A água era vista como a fonte da vida, então os egípcios criaram o deus Hapi e o adoravam como o provedor da vida.\n' +
    'Entretanto, só o Deus vivo é a Fonte da vida, o Criador de todas as coisas, incluindo a água e o alimento (Gn 1:1, 2, 20-22; Sl 104:27, 28; 136:25; Jo 11:25; 14:6). Transformar a água em sangue simbolizava transformar vida em morte. Hapi não foi capaz de prover e proteger a vida; isso só é possível pelo poder do Senhor.\n' +
    'Deus então deu outra chance ao Faraó. A deusa-rã, Heqet, foi confrontada diretamente (Êx 8:1-15). Em vez de vida, o Nilo produziu rãs, que os egípcios temiam e detestavam. Eles queriam se livrar desses animais. O momento exato em que essa praga foi eliminada demonstrou que o poder de Deus estava também por trás desse evento.\n' +
    'A terceira praga tem a descrição mais curta de todas (Êx 8:16-19). A palavra original (em hebraico, kinnim) pode se referir a animais como mosquitos, carrapatos ou piolhos. Essa praga foi direcionada contra Gebe, o deus egípcio da terra. Do pó da terra (remetendo à história bíblica da criação), Deus produziu mosquitos, que se espalharam por toda a terra. Incapazes de imitar esse milagre (pois somente Deus pode criar vida), os magos declararam: “Isto é o dedo de Deus” (Êx 8:19). O Faraó, no entanto, ainda se recusava a ceder.\n' +
    'Garanta o conteúdo completo da Lição da Escola Sabatina para o ano inteiro. Faça aqui a sua assinatura!\n' +
    '\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\t\tEsse tipo de conteúdo não está disponível nesse navegador.\n' +
    '\t\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\tO coração do Faraó era duro. A rejeição das orientações de Deus piorou a situação. Que lições aprendemos dessa história sobre a rejeição das orientações do Senhor?\t\t\t\t\t\n' +
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
    '\t\t\t\t\tQuarta-feira, 23 de julho\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\tAno Bíblico: RPSP: LV 8\t\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\tMoscas, gado e úlceras\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\t4. Leia Êxodo 8:20-32; 9:1-12. Mesmo conhecendo grandes manifestações do poder e da glória de Deus, os seres humanos ainda têm a liberdade de rejeitá-Lo?\n' +
    'A deusa egípcia Uatchit era considerada a deusa das moscas e a senhora dos pântanos e brejos. O deus Khepri (associado ao sol nascente, à criação e ao renascimento) era representado com uma cabeça de escaravelho [besouro]. Esses “deuses” foram derrotados pelo Senhor. Enquanto os egípcios sofriam, os hebreus eram protegidos (Êx 8:20-24). Nenhuma outra praga os afetou.\n' +
    'Tudo isso foi uma tentativa de Deus de mostrar ao Faraó a grande verdade de que Ele é o Senhor no meio da terra (Êx 8:22).\n' +
    'Assim, o Faraó começou a barganhar. A pressão aumentou. Ele se dispôs a permitir que Israel adorasse a Deus e sacrificasse a Ele, mas apenas no Egito (Êx 8:25). Essas condições não podiam ser atendidas porque os egípcios adoravam alguns animais, e sacrificá-los provocaria a ira deles contra os hebreus. Além disso, esse não era o plano de Deus para Israel.\n' +
    'A próxima praga (Êx 9:1-7) atingiu o gado. Hator, a deusa egípcia do amor e da proteção, era retratada com uma cabeça de vaca. O deus-touro Ápis também era muito popular e estimado no Egito. Na quinta praga, outras importantes divindades foram derrotadas quando o gado dos egípcios morreu.\n' +
    'Na sexta praga (Êx 9:8-12), manifestou-se a derrota de Ísis, a deusa da medicina, magia e sabedoria, bem como de Sequemete (deusa da guerra e das epidemias) e Imotepe (deus da medicina e da cura), que foram incapazes de proteger seus adoradores. Ironicamente, os magos e feiticeiros ficaram tão aflitos que não podiam comparecer diante do Faraó, mostrando que eram impotentes contra o Criador do céu e da Terra.\n' +
    'Pela primeira vez no relato das dez pragas, a Bíblia diz que “o Senhor endureceu o coração de Faraó” (Êx 9:12). Por mais difícil que essa frase pareça, quando entendida no contexto, revela que o Senhor nos permite colher as consequências de nossa própria rejeição persistente a Ele.\n' +
    'Garanta o conteúdo completo da Lição da Escola Sabatina para o ano inteiro. Faça aqui a sua assinatura!\n' +
    '\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\t\tEsse tipo de conteúdo não está disponível nesse navegador.\n' +
    '\t\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\tO problema do Faraó não era intelectual, mas espiritual; diante de evidências suficientes, ele fez a escolha errada. Como proteger nosso coração do orgulho, de modo que não resistamos aos apelos de Deus?\t\t\t\t\t\n' +
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
    '\t\t\t\t\tQuinta-feira, 24 de julho\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\tAno Bíblico: RPSP: LV 9\t\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\tGranizo, gafanhotos e escuridão\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\t5. Leia Êxodo 9:13-35; 10:1-29. Essas pragas fizeram o Faraó mudar de ideia?\n' +
    'Nut era a deusa egípcia da atmosfera e do espaço sideral, retratada como aquela que controlava o que ocorria sob o céu e na terra. Osíris era o deus das colheitas e da fertilidade. O granizo é associado ao juízo divino (Is 28:2, 17; Ez 13:11-13). Nessa praga, aqueles que esconderam suas propriedades em um abrigo seguro foram protegidos (Êx 9:20, 21). Todos foram testados: creriam na Palavra de Deus e agiriam de acordo com ela?\n' +
    'A preservação da vida do Faraó tinha como propósito tornar Deus conhecido no mundo (Êx 9:16). O rei confessou que havia pecado, mas logo depois voltou atrás.\n' +
    'Set era o deus da tempestade, guerra e desordem. Junto com Ísis, era considerado uma divindade da agricultura. Shu era o deus da atmosfera. Serápis personificava a majestade divina, fertilidade, cura e vida após a morte. Nenhum dos deuses egípcios impediu os juízos divinos (Êx 10:4-20), pois os ídolos não são nada (Is 44:9, 10, 12-17). Os servos do Faraó insistiram para que ele deixasse Israel ir, mas ele recusou novamente.\n' +
    'O Faraó ofereceu um acordo, que Moisés rejeitou, e com razão, pois mulheres e crianças eram parte vital e inseparável da adoração e da comunidade de fé.\n' +
    'Rá era o principal deus egípcio, o deus-sol, e Tote era o deus-lua. Eles não conseguiram produzir luz. O Faraó tentou negociar, mas em vão. Uma escuridão de três dias cobriu o Egito, mas os israelitas tinham luz. A separação não poderia ser mais clara.\n' +
    'No entanto, independentemente das calamidades que atingiram a nação, o Faraó continuou resistindo e não cedeu. Não conhecemos suas motivações mais profundas, mas, em algum momento, isso pode ter se tornado simplesmente uma questão de orgulho. Não importavam as poderosas evidências, a clareza de tudo o que estava acontecendo e que a escolha correta estivesse bem diante dele – após um pouco de hesitação, o Faraó não se submeteu à vontade de Deus. Por outro lado, seus servos declararam: “Até quando este homem será um perigo para nós? Deixe essa gente ir, para que adorem o Senhor, o Deus deles. Será que o rei ainda não sabe que o Egito está arruinado?” (Êx 10:7).\n' +
    'Esse é um exemplo marcante das palavras: “Antes da ruína vem a soberba, e o espírito orgulhoso precede a queda” (Pv 16:18).\n' +
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
    '\t\t\t\t\tSexta-feira, 25 de julho\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\tAno Bíblico: RPSP: LV 10\t\t\t\t\t\n' +
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
    '\t\t\t\t\t\tLeia, de Ellen G. White, Patriarcas e Profetas, p. 214-227 (“As pragas do Egito”).\n' +
    '“Foi permitido que Seu povo experimentasse a esmagadora crueldade dos egípcios, para que não se enganasse em relação à influência degradante da idolatria. Em Sua maneira de lidar com o Faraó, o Senhor manifestou Seu ódio à idolatria e Sua decisão de punir a crueldade e a opressão. [...] Não se exerceu um poder sobrenatural para endurecer o coração do rei. Deus deu ao Faraó a mais notável evidência do poder divino, mas o rei obstinadamente se recusou a aceitar a luz. Cada manifestação do poder infinito rejeitada por ele tornava-o mais resoluto em sua rebeldia. As sementes de rebelião que semeara quando rejeitou o primeiro milagre produziram sua colheita” (Ellen G. White, Patriarcas e Profetas [CPB, 2022], p. 222, 223).\n' +
    '“O Sol e a Lua eram adorados pelos egípcios. Nessas trevas misteriosas, o povo e seus deuses foram de modo semelhante atingidos pelo poder que havia se comprometido com a causa dos escravos. Contudo, por mais estranho que tivesse sido, esse juízo é uma prova da compaixão de Deus e de Sua indisposição para destruir. Ele deu ao povo tempo para refletir e se arrepender, antes de trazer sobre ele a última e mais terrível das pragas” (Patriarcas e Profetas, p. 226).\n' +
    'Perguntas para consideração\n' +
    '1. Por que o Faraó se permitiu ser tão endurecido que, mesmo diante do que deveria ser a escolha evidente e correta (deixar o povo ir), ele ainda se recusou. Como alguém poderia se enganar tanto a ponto de não enxergar o óbvio? Que advertência isso traz a nós? Podemos ficar tão endurecidos no pecado a ponto de tomar decisões desastrosas quando a decisão correta e o caminho certo estão bem diante de nós o tempo todo? Quais outros personagens bíblicos cometeram o mesmo tipo de erro? Pense, por exemplo, em Judas.\n' +
    '2. Em determinado momento, em meio à devastação que o Faraó havia causado em sua própria terra e ao seu povo, ele declarou: “Desta vez pequei. O Senhor é justo, porém eu e o meu povo somos ímpios” (Êx 9:27). Embora tenha sido uma confissão notável de pecado naquela ocasião, por que sabemos que não foi autêntica?\n' +
    'Respostas às perguntas da semana: 1. Por meio das pragas e do juízo contra os deuses do Egito, Deus revelou que Seu poder e autoridade são supremos. 2. O Faraó decidiu rejeitar a vontade de Deus, e o Senhor o entregou ao seu próprio pecado. 3. Deus enviou as três primeiras pragas: águas transformadas em sangue, rãs e piolhos. 4. O poder de Deus foi revelado de maneira mais notável do que antes, mas o Faraó endureceu seu coração. 5. O Faraó chegou a confessar que havia pecado, e seus servos insistiram para que deixasse Israel ir, mas ele se recusou mais intensamente.\n' +
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
  lessonLink: 'https://mais.cpb.com.br/licao/as-pragas/',
  lastUpdated: '2025-07-19T14:21:00.200Z',
  expiresAt: '2025-07-26T14:21:01.308Z'
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