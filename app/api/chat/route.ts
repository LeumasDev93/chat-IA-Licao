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
const CacheLessonData : LessonData = {
  title: 'Lições',
  days: [
    '‹›\n' +
      '\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\t\n' +
      '\t\t\t\t\t\tLição 1\t\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\t\n' +
      '\t\t\t\t\t\t28 de junho a 04 de julho\t\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\t\n' +
      '\t\t\t\t\t\tO povo oprimido e o nascimento de Moisés | 3º Trimestre 2025\n' +
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
      '\t\t\t\t\t\tAno Bíblico: RPSP: ÊX 23\t\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\t\n' +
      '\t\t\t\t\t\tVerso para memorizar:\n' +
      '\t\t\t\t\t\t“Os filhos de Israel gemiam por causa da sua escravidão. Eles clamaram, e o seu clamor chegou até Deus. Deus ouviu o gemido deles e lembrou-Se da Sua aliança com Abraão, com Isaque e com jacó. E Deus viu os filhos de Israel e atentou e atentou para a situação deles” (Êx 2:23-25).\n' +
      '\t\t\t\t\t\n' +
      '\t\t\t\t\t\n' +
      '\t\t\t\t\t\tLeituras da semana:\n' +
      '\t\t\t\t\t\tÊx 1; Gn 37:26-28; 39:2, 21; At 7:6; Gl 3:16, 17; Êx 2\n' +
      '\t\t\t\t\t\n' +
      '\t\t\t\t\t\n' +
      '\t\t\t\t\t\tO livro de Êxodo está cheio de relatos de pessoas oprimidas, marginalizadas, perseguidas, exploradas e desprezadas. Assim, aqueles que hoje se sentem abandonados, esquecidos e escravizados podem encontrar esperança, pois o mesmo Deus que salvou os hebreus também pode salvá-los.\n' +
      'Êxodo fala das batalhas existenciais e das injustiças da vida. Todos podem ser encorajados pelas histórias das intervenções de Deus em favor de Seu povo. Ele ouve o clamor dos oprimidos, vê suas lutas, observa suas lágrimas e vem em seu auxílio. \n' +
      'Deus toma a iniciativa de libertar aqueles que confiam Nele. Precisamos aceitar, pela fé, o que Ele oferece. É por isso que devemos estudar o livro de Êxodo, pois ele aponta para o que Jesus fez por nós. É um livro que trata da redenção, libertação e salvação – e tudo isso nos pertence, pela fé em Cristo Jesus, com base no que Ele obteve em nosso favor. Em meio à adversidade e à escuridão, se nossos olhos estiverem fixos em Deus, podemos reconhecer Sua presença, cuidado e auxílio enquanto Ele nos guia em direção à eterna “terra prometida”. \n' +
      'Nota do editor: A sigla “RPSP” significa “Reavivados Por Sua Palavra”.\n' +
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
      '\t\t\t\t\tDomingo, 29 de junho\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\t\n' +
      '\t\t\t\t\t\tAno Bíblico: RPSP: ÊX 24\t\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\t\n' +
      '\t\t\t\t\t\tO povo de Deus no Egito\n' +
      '\t\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\t\n' +
      '\t\t\t\t\t\tO livro de Êxodo é chamado em hebraico de shemot, que significa “nomes”. Esse título vem das primeiras palavras do livro: “São estes os nomes dos filhos de Israel que entraram com Jacó no Egito” (Êx 1:1).\n' +
      '1. Leia Êxodo 1:1-7. Que verdade crucial é apresentada nesse texto?\n' +
      'O livro de Êxodo começa com um lembrete da bênção de Deus. Quando o patriarca Jacó e sua família se estabeleceram no Egito, eram apenas 70 pessoas (Gn 46:27; Êx 1:5), mas os israelitas “foram fecundos, aumentaram muito, se multiplicaram e se tornaram extremamente fortes, de maneira que a terra se encheu deles” (Êx 1:7). Quando saíram do Egito, eles já eram “cerca de seiscentos mil a pé, somente de homens, sem contar mulheres e crianças” (Êx 12:37).\n' +
      '2. Leia Êxodo 1:8-11. Qual era a condição dos israelitas na época do êxodo?\n' +
      'O texto bíblico descreve a história dos filhos de Israel no Egito de maneira bastante sombria. O livro de Êxodo começa com a escravidão imposta pelos egípcios e o trabalho opressivo que eles impuseram aos hebreus. O livro termina, no entanto, com a presença serena e reconfortante de Deus no tabernáculo, que estava no centro do acampamento israelita (Êx 40). Entre essas duas situações opostas, é descrito o triunfo de Deus. Quando o Senhor libertou Seu povo da escravidão, ao abrir o Mar Vermelho e derrotar o exército mais poderoso da Terra, foi revelada a vitória espetacular de Deus sobre as forças do mal.\n' +
      'A história destaca paradoxalmente que “quanto mais os afligiam, tanto mais se multiplicavam e tanto mais se espalhavam” (Êx 1:12). Não importa as intrigas humanas, Deus é soberano e salvará Seu povo, mesmo que as circunstâncias pareçam desesperadoras da perspectiva humana.\n' +
      'Garanta o conteúdo completo da Lição da Escola Sabatina para o ano inteiro. Faça aqui a sua assinatura!\n' +
      '\t\t\t\t\t\t\n' +
      '\t\t\t\t\t\t\t\n' +
      '\t\t\t\t\t\t\t\tEsse tipo de conteúdo não está disponível nesse navegador.\n' +
      '\t\t\t\t\t\t\t\n' +
      '\t\t\t\t\t\t\n' +
      '\t\t\t\t\t\n' +
      '\t\t\t\t\t\t\t\t\t\t\n' +
      '\t\t\t\t\t\t“Levantou-se um novo rei sobre o Egito, que não havia conhecido José” (Êx 1:8). Como esse relato nos mostra que jamais devemos acreditar que qualquer circunstância, mesmo as boas, permanecerá a mesma para sempre?\t\t\t\t\t\n' +
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
      '\t\t\t\t\tSegunda-feira, 30 de junho\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\t\n' +
      '\t\t\t\t\t\tAno Bíblico: RPSP: ÊX 25\t\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\t\n' +
      '\t\t\t\t\t\tO contexto histórico\n' +
      '\t\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\t\n' +
      '\t\t\t\t\t\tQuando a família de Jacó chegou ao Egito depois de passar fome em Canaã (Gn 46), o Faraó foi amigável com os hebreus por causa de José e de tudo o que ele havia feito pelos egípcios.\n' +
      '“E Faraó disse mais a José: – Eis que eu o constituo autoridade sobre toda a terra do Egito. Então Faraó tirou o seu anel-sinete da mão e o pôs no dedo de José. Mandou que o vestissem com roupas de linho fino e lhe pôs no pescoço um colar de ouro. E o fez subir na sua segunda carruagem, e clamavam diante dele: ‘Inclinem-se todos!’” (Gn 41:41-43).\n' +
      '3. Qual foi a causa do sucesso surpreendente de José no Egito depois de um começo tão difícil? Gn 37:26-28; 39:2, 21\n' +
      'O contexto histórico mais provável para a história do êxodo é o seguinte: o novo Faraó, “que não havia conhecido José” (Êx 1:8), é Amés I (1570-1546 a.C.). Em seguida, veio Amenotepe I (1546-1526 a.C.), o governante que temia os israelitas e os oprimiu. Mais tarde, Tutemés I (1525-1512 a.C.) emitiu o decreto mandando matar todos os meninos hebreus recém-nascidos. Sua filha Hatshepsut (1503-1482 a.C.) foi a princesa que adotou Moisés. O Faraó Tutemés III (1504-1450 a.C.), que durante algum tempo governou junto com Hatshepsut, foi o Faraó do êxodo.\n' +
      'Segundo os estudos mais confiáveis, o êxodo ocorreu em março de 1450 a.C. (William H. Shea, “Exodus, Date of the”, em International Standard Bible Encyclopedia, ed. Geoffrey W. Bromiley [Eerdmans, 1982], v. 2, p. 230-238). Vários textos nos ajudam a estabelecer a data do êxodo (Gn 15:13-16; Êx 12:40, 41; Jz 11:26; 1Rs 6:1; At 7:6; Gl 3:16, 17).\n' +
      'O primeiro capítulo de Êxodo abrange um longo período, desde que Jacó entrou no Egito com sua família até o decreto de morte emitido pelo Faraó. Embora as datas exatas desses acontecimentos sejam debatidas pelos estudiosos, o mais importante é que, mesmo que o povo de Deus estivesse escravizado em terra estrangeira, Ele jamais o abandonou.\n' +
      'Detalhes históricos sobre o período em que os hebreus estiveram no Egito ainda são desconhecidos (1Co 13:12). No entanto, a revelação do caráter de Deus resplandece nas páginas do livro de Êxodo, como ocorre em toda a Bíblia. Mesmo que alguma situação pareça desesperadora, Deus está sempre presente, e podemos confiar Nele.\n' +
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
      '\t\t\t\t\tTerça-feira, 01 de julho\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\t\n' +
      '\t\t\t\t\t\tAno Bíblico: RPSP: ÊX 26\t\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\t\n' +
      '\t\t\t\t\t\tAs parteiras hebreias\n' +
      '\t\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\t\n' +
      '\t\t\t\t\t\tNão podemos compreender o livro de Êxodo sem pressupor a veracidade dos ensinos de Gênesis. Os israelitas se mudaram para o Egito e, após um período de prosperidade e paz, foram escravizados. No entanto, Deus não abandonou Seu povo em meio às dificuldades, mesmo que pudesse parecer assim. Muitos hebreus estavam desesperados. Contudo, no momento de angústia, Deus veio para ajudar com Sua mão poderosa. Ele encoraja Seus servos: “Invoque-Me no dia da angústia; Eu o livrarei, e você Me glorificará” (Sl 50:15).\n' +
      '4. Leia Êxodo 1:9-21. Qual foi o papel fundamental das parteiras fiéis e por que elas são lembradas na história?\n' +
      'Nenhum Faraó é mencionado por nome no livro de Êxodo. Eles possuem apenas o título de “Faraó”, que significa “rei”. Os egípcios acreditavam que o Faraó era um deus na Terra, filho do deus Rá (e também identificado com os deuses Osíris e Hórus). Rá era considerado a mais importante divindade egípcia, o próprio deus-sol.\n' +
      'Apesar do seu suposto poder, esse “deus” não foi capaz de forçar as parteiras a ir contra suas convicções. Em contraste com o Faraó sem nome, as duas parteiras têm seus nomes mencionados: Sifrá e Puá (Êx 1:15). Elas são altamente estimadas porque temeram ao Senhor. A ordem perversa do Faraó não teve efeito sobre elas, porque respeitavam a Deus mais do que as ordens de um governante terreno (At 5:29). Assim, Deus as abençoou, dando-lhes famílias numerosas. Que testemunho poderoso de fidelidade! Essas mulheres, mesmo que tivessem pouco conhecimento teológico, sabiam o que era certo e agiram corretamente.\n' +
      'Quando o Faraó viu que seu plano havia falhado, ordenou aos egípcios que matassem todos os meninos hebreus recém-nascidos. Eles deveriam jogá-los no rio Nilo, provavelmente como oferta a Hapi, o deus do Nilo, que também era um dos deuses da fertilidade (a propósito, esse é o primeiro registro histórico de judeus sendo mortos apenas por serem judeus). O propósito do decreto de morte era dominar os hebreus, aniquilar os descendentes do sexo masculino e assimilar as mulheres à nação egípcia. Com isso, seria encerrada a ameaça que o Faraó acreditava que os hebreus representavam para sua nação.\n' +
      'Garanta o conteúdo completo da Lição da Escola Sabatina para o ano inteiro. Faça aqui a sua assinatura!\n' +
      '\t\t\t\t\t\t\n' +
      '\t\t\t\t\t\t\t\n' +
      '\t\t\t\t\t\t\t\tEsse tipo de conteúdo não está disponível nesse navegador.\n' +
      '\t\t\t\t\t\t\t\n' +
      '\t\t\t\t\t\t\n' +
      '\t\t\t\t\t\n' +
      '\t\t\t\t\t\t\t\t\t\t\n' +
      '\t\t\t\t\t\tAs parteiras sabiam o que deviam fazer e fizeram. Qual é a lição para nós?\t\t\t\t\t\n' +
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
      '\t\t\t\t\tQuarta-feira, 02 de julho\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\t\n' +
      '\t\t\t\t\t\tAno Bíblico: RPSP: ÊX 27\t\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\t\n' +
      '\t\t\t\t\t\tO nascimento de Moisés\n' +
      '\t\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\t\n' +
      '\t\t\t\t\t\t5. Leia Êxodo 2:1-10. Qual foi o papel da providência e proteção de Deus na história do nascimento de Moisés?\n' +
      'O contexto histórico do nascimento e da vida de Moisés é emocionante, pois ele viveu durante o tempo da famosa 18a dinastia egípcia. Um rei dessa dinastia, Tutemés III, conhecido como o “Napoleão do Egito”, é considerado um dos Faraós mais importantes da história.\n' +
      'Embora estivesse sob ameaça de morte (Êx 1:22), Moisés era um bebê “bonito” (Êx 2:2; em hebraico, tob, literalmente, “bom”). O termo hebraico indica mais do que beleza externa, sendo usado, por exemplo, para descrever a obra de Deus durante a semana da criação, quando Ele declarou que tudo era “bom” (Gn 1:4, 10, 12, 18, 21, 25) e até mesmo “muito bom” (Gn 1:31).\n' +
      'Como uma espécie de nova criação, essa criança “boa” se tornaria, de acordo com o plano de Deus, o adulto que libertaria os hebreus da escravidão. Quando Moisés nasceu, em condições tão difíceis, quem poderia imaginar o futuro que o aguardava? No entanto, Deus cumpriria Suas promessas a Abraão, Isaque e Jacó. O Senhor havia feito uma aliança com eles de que daria a seus descendentes a terra prometida (Êx 2:24, 25). Décadas depois, Ele usaria esse bebê para cumprir Suas promessas.\n' +
      'Até então, a princesa egípcia Hatshepsut adotou Moisés como seu filho. O nome dado a Moisés tem origem egípcia, significando “filho de” ou “nascido de”, conforme refletido nos nomes de Faraós como Amés (“filho de Akh”) e Tutemés (“filho de Tote”). Moisés, em hebraico, é Mosheh, que significa “tirado” ou “puxado”. Sua vida foi milagrosamente poupada quando foi “tirado” do rio.\n' +
      'Sabemos pouco sobre a infância de Moisés. Após ser milagrosamente salvo e adotado por Hatshepsut, ele viveu os primeiros 12 anos com sua família hebreia. Moisés então recebeu a melhor educação egípcia, com o objetivo de prepará-lo para ser o próximo Faraó (Êx 2:7-9; Ellen G. White, Patriarcas e Profetas [CPB, 2022], p. 203, 204). É impressionante que, no final das contas, grande parte dessa educação seria inútil ou até mesmo prejudicial para o que realmente importava: o conhecimento de Deus e de Sua verdade.\n' +
      'Garanta o conteúdo completo da Lição da Escola Sabatina para o ano inteiro. Faça aqui a sua assinatura!\n' +
      '\t\t\t\t\t\t\n' +
      '\t\t\t\t\t\t\t\n' +
      '\t\t\t\t\t\t\t\tEsse tipo de conteúdo não está disponível nesse navegador.\n' +
      '\t\t\t\t\t\t\t\n' +
      '\t\t\t\t\t\t\n' +
      '\t\t\t\t\t\n' +
      '\t\t\t\t\t\t\t\t\t\t\n' +
      '\t\t\t\t\t\tVocê está aprendendo algo que é irrelevante para o que realmente importa?\t\t\t\t\t\n' +
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
      '\t\t\t\t\tQuinta-feira, 03 de julho\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\t\n' +
      '\t\t\t\t\t\tAno Bíblico: RPSP: ÊX 28\t\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\t\n' +
      '\t\t\t\t\t\tMudança de planos\n' +
      '\t\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\t\n' +
      '\t\t\t\t\t\t6. Leia Êxodo 2:11-25. Que fatos ocorridos rapidamente mudaram toda a direção da vida de Moisés? Que lições podemos aprender dessa história?\n' +
      'O que Moisés faria: sucumbiria à atração do Egito e aos prazeres da corte, ou suportaria dificuldades com seu povo aflito? Os acontecimentos logo o forçaram a tomar uma decisão.\n' +
      '“Informado desse caso, Faraó quis matar Moisés; porém Moisés fugiu da presença de Faraó e foi morar na terra de Midiã. Chegando lá, sentou-se junto a um poço” (Êx 2:15).\n' +
      'Após o assassinato, Moisés não teve escolha, pelo menos no que diz respeito a permanecer no Egito. Assim, quaisquer que fossem os planos para que ele ocupasse o trono do Egito e se tornasse um “deus”, esses planos foram rapidamente destruídos. Em vez de se tornar um falso deus, Moisés serviria ao único Deus verdadeiro. Sem dúvida, na época em que fugiu, Moisés não tinha ideia do que o futuro reservava para ele.\n' +
      '“Em pouco tempo, os egípcios ficaram sabendo do caso, e a notícia logo chegou com bastante exagero aos ouvidos do Faraó. Disseram ao rei que esse ato significava muito mais, e que Moisés planejava liderar seu povo contra os egípcios, derrubar o governo e assentar-se no trono. Disseram também que não poderia haver segurança para o reino enquanto Moisés estivesse vivo. O rei determinou que ele deveria morrer imediatamente, mas Moisés, percebendo o perigo que corria, fugiu para a Arábia” (Ellen G. White, Patriarcas e Profetas [CPB, 2022], p. 206).\n' +
      'Moisés viveu 120 anos (Dt 34:7), e sua vida pode ser dividida em três períodos de 40 anos cada. Os primeiros 40 anos foram passados no Egito, muitos deles no palácio real. O segundo período de 40 anos foi vivido na casa de Jetro, em Midiã.\n' +
      'São os últimos 40 anos, no entanto, que ocupam a maior parte dos primeiros cinco livros da Bíblia (e o estudo deste trimestre). Esse período inclui a história do chamado inicial de Israel para testemunhar a um mundo que estava mergulhado na idolatria, revelando a natureza e o caráter do verdadeiro Deus (ver Dt 4:6-8).\n' +
      'Garanta o conteúdo completo da Lição da Escola Sabatina para o ano inteiro. Faça aqui a sua assinatura!\n' +
      '\t\t\t\t\t\t\n' +
      '\t\t\t\t\t\t\t\n' +
      '\t\t\t\t\t\t\t\tEsse tipo de conteúdo não está disponível nesse navegador.\n' +
      '\t\t\t\t\t\t\t\n' +
      '\t\t\t\t\t\t\n' +
      '\t\t\t\t\t\n' +
      '\t\t\t\t\t\t\t\t\t\t\n' +
      '\t\t\t\t\t\tEra plano de Deus que Moisés matasse o egípcio? Se não, o que essa história nos ensina sobre como Ele pode tomar em Suas mãos qualquer situação e usá-la para cumprir Seus propósitos? Como Romanos 8:28 nos ajuda a compreender essa verdade importante?\t\t\t\t\t\n' +
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
      '\t\t\t\t\tSexta-feira, 04 de julho\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\t\n' +
      '\t\t\t\t\t\tAno Bíblico: RPSP: ÊX 29\t\t\t\t\t\n' +
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
      '\t\t\t\t\t\tLeia, de Ellen G. White, Patriarcas e Profetas, p. 201-209 (“Moisés”).\n' +
      'O texto bíblico afirma que as “parteiras, porém, temeram a Deus e não fizeram o que o rei do Egito lhes havia ordenado; pelo contrário, deixaram viver os meninos” (Êx 1:17). Ellen G. White comenta sobre a fidelidade das parteiras e a esperança messiânica: “Foram dadas ordens às parteiras, cujo trabalho permitia o cumprimento desse mandado, para que destruíssem as crianças hebreias do sexo masculino assim que nascessem. Satanás foi o instigador disso. Sabia que um libertador se levantaria entre os israelitas; e, levando o rei a destruir seus filhos, esperava frustrar o propósito divino. No entanto, aquelas mulheres temiam a Deus e não ousaram executar a cruel determinação. O Senhor aprovou o procedimento delas e as fez prosperar” (Patriarcas e Profetas [CPB, 2022], p. 202).\n' +
      'A boa notícia em tudo isso é que, apesar dos planos de Satanás, Deus triunfou e usou pessoas fiéis para frustrar o inimigo. Nós vivemos no território de nosso inimigo, a quem Jesus chamou de “príncipe do mundo” (Jo 14:30; NAA) ou “governante deste mundo” (NVT; ver Ef 2:2). Satanás usurpou essa posição de Adão, mas Jesus Cristo o derrotou em Sua vida e em Sua morte na cruz (Mt 4:1-11; Jo 19:30; Hb 2:14). Embora Satanás ainda esteja vivo e ativo, como fica claro na tentativa de matar aquelas crianças, sua destruição está garantida (Jo 12:31; 16:11; Ap 20:9, 10, 14). A grande notícia é que as dificuldades da vida podem ser superadas pela graça de Deus (Fp 4:13). Essa graça é nossa única esperança.\n' +
      'Perguntas para consideração\n' +
      '1. Por que Deus permitiu que os hebreus vivessem no Egito e fossem oprimidos? Por que demorou tanto para intervir em favor deles? Lembre-se também de que cada pessoa sofre apenas durante o período de sua própria vida. Portanto, o tempo de sofrimento da nação foi longo, mas cada pessoa sofreu apenas durante sua breve existência. Por que fazer essa distinção é importante quando tentamos entender o sofrimento humano em geral?\n' +
      '2. Pense sobre como Deus foi capaz de usar o ato impetuoso de Moisés de matar o egípcio. Suponha que ele não tivesse cometido aquele erro. Isso significaria que os hebreus não teriam escapado do Egito? Explique seu raciocínio.\n' +
      'Respostas às perguntas da semana: 1. No início o povo de Israel era pequeno, mas Deus o abençoou e ele cresceu muito. 2. Eram escravizados pelos egípcios e submetidos a trabalhos pesados. 3. Deus estava com josé e o guiou para cumprir Seus propósitos. 4. Elas salvaram os meninos hebreus, temendo mais a Deus do que ao Faraó. 5. Deus protegeu Moisés no cesto de junco e o guiou até a filha do Faraó. 6. Moisés matou um egípcio e fugiu para Midiã.\n' +
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
  lessonLink: 'https://mais.cpb.com.br/licao/o-povo-oprimido-e-o-nascimento-de-moises/',
  lastUpdated: '2025-06-28T15:12:01.713Z',
  expiresAt: '2025-07-05T15:12:02.433Z'
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
${
  lesson ? `
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

    return NextResponse.json({ message: text,  conversationHistory }, { status: 200 });

  } catch (error) {
    console.error("Erro com Gemini:", error);
    return NextResponse.json(
      { message: "Erro ao processar a solicitação." },
      { status: 500 }
    );
  }
}