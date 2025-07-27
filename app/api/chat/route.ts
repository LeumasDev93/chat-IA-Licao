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
    '\t\t\t\t\t\tLição 5\t\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\t26 de julho a 01 de agosto\t\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\tA Páscoa | 3º Trimestre 2025\n' +
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
    '\t\t\t\t\t\tAno Bíblico: RPSP: LV 11\t\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\tVerso para memorizar:\n' +
    '\t\t\t\t\t\t“Quando os seus filhos perguntarem: ‘Que rito é este?’, respondam: ‘É o sacrifício da Páscoa ao Senhor, que passou por cima das casas dos filhos de Israel no Egito, quando matou os egípcios e livrou as nossas casas’” (Êx 12:26, 27).\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\tLeituras da semana:\n' +
    '\t\t\t\t\t\tÊx 11; Mq 6:8; Êx 12:1-30; 1Co 5:7; Êx 13:14-16; hb 11:28\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\tA décima e última praga estava prestes a cair. A última advertência havia sido dada, e a decisão final precisava ser tomada. Era realmente uma questão de vida ou morte: não apenas a vida de um indivíduo, mas a prosperidade de famílias e de toda a nação estava em jogo. O Faraó e seus oficiais eram responsáveis pelo destino de muitas pessoas. A atitude dele em relação ao Deus vivo determinaria não apenas seu próprio futuro, mas também o de sua nação.\n' +
    'Como nos sentimos e o que fazemos quando a gravidade das circunstâncias pesa sobre nós, e precisamos escolher o próximo passo e a direção a seguir? Essa é uma escolha que pode afetar a vida de muitos outros além de nós mesmos. Deus está sempre disposto a nos conceder sabedoria, entendimento e poder para fazermos o que é certo (1Co 1:30; Fp 2:13).\n' +
    'O problema, no entanto, é que, em nosso coração teimoso, nem sempre desejamos fazer o que é certo. Sabemos o que é correto, mas nos recusamos a fazê-lo. No relato de Êxodo, a recusa de um homem em se submeter a Deus, mesmo diante de evidências, trouxe tragédia para muitos outros.\n' +
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
    '\t\t\t\t\tDomingo, 27 de julho\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\tAno Bíblico: RPSP: LV 12\t\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\tMais uma praga\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\tAmós declarou que “certamente o Senhor Deus não fará coisa alguma, sem primeiro revelar o Seu segredo aos Seus servos, os profetas” (Am 3:7). Por meio de Moisés, Deus revelou ao Faraó o que aconteceria a seguir. A advertência mais solene foi dada ao Faraó: seria um justo juízo sobre o orgulho, a exploração, a violência e a idolatria (tudo o que havia desencadeado essas calamidades sobre o Egito).\n' +
    '1. Que advertência o Senhor fez antes de executar o juízo sobre o Egito? Êx 11\n' +
    'Deus deu tempo aos egípcios, três dias de escuridão (Êx 10:22, 23), para refletirem sobre os eventos recentes e compreenderem seu significado. Ele também ofereceu uma última advertência explícita, dando a eles uma derradeira chance de fazer o que era certo.\n' +
    'No entanto, Êxodo 11:8 relata que “enfurecido, Moisés se retirou da presença de Faraó”. Mas por que ele ficou tão enfurecido? Provavelmente porque sabia que a tragédia da décima praga atingiria muitos inocentes – tudo por causa da teimosia do Faraó.\n' +
    'Além disso, o número dez possui um simbolismo significativo na Bíblia, representando plenitude ou completude (por exemplo, os Dez Mandamentos são uma revelação completa da lei moral divina). De forma semelhante, as dez pragas do Egito representam a manifestação plena da justiça e retribuição de Deus.\n' +
    'O Senhor é o Juiz supremo e Se opõe ao orgulho, à injustiça, à discriminação, à arrogância, à exploração, à crueldade e ao egoísmo. Ele está ao lado dos que sofrem, daqueles que enfrentam abusos e maus-tratos e dos perseguidos. Deus aplicará a justiça, o que, na verdade, é uma das expressões de Seu amor (Sl 2:12; 33:5; 85:11; 89:14; 101:1; Is 16:5; Jr 9:24).\n' +
    'Nós também devemos expressar amor e justiça da melhor maneira possível. Contudo, podemos facilmente cair em extremos, seja de um lado ou de outro. Em nome de um suposto “amor”, podemos ignorar erros e questões que precisam ser corrigidos. Por outro lado, podemos aplicar a justiça de maneira fria e inflexível. Nenhum dos extremos é correto. Este é o ideal: “O que o Senhor pede de você? Que pratique a justiça, ame a misericórdia e ande humildemente com o seu Deus” (Mq 6:8).\n' +
    'Garanta o conteúdo completo da Lição da Escola Sabatina para o ano inteiro. Faça aqui a sua assinatura!\n' +
    '\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\t\tEsse tipo de conteúdo não está disponível nesse navegador.\n' +
    '\t\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\tSe não temos o equilíbrio perfeito, preferir o lado da misericórdia seria um erro?\t\t\t\t\t\n' +
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
    '\t\t\t\t\tSegunda-feira, 28 de julho\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\tAno Bíblico: RPSP: LV 13\t\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\tA Páscoa\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\t2. Leia Êxodo 12:1-20. Quais instruções específicas Deus deu a Moisés e Arão antes de Israel deixar o Egito?\n' +
    'Seria de se esperar que Deus instruísse Moisés e Arão sobre como organizar a partida do Egito; ou seja, como fazer os preparativos para a fuga, especialmente para cuidar de idosos, mães com crianças pequenas, animais, entre outros. No entanto, a instrução de Deus foi surpreendente: Ele ensinou como celebrar a Páscoa. Em outras palavras, o foco estava em adorar o Senhor, que iria redimi-los. Todo o resto aconteceria no devido tempo.\n' +
    'Cada família deveria preparar um cordeiro, sem desperdiçar nada. Todos precisavam comer sua porção e, se uma família não conseguisse consumir o cordeiro inteiro, deveriam partilhar a refeição com outra família. \n' +
    '3. Leia Êxodo 12:13, 14. O que o Senhor faria pelo povo quando a última praga viesse? O que tudo isso simbolizava?\n' +
    'O êxodo deveria ser celebrado anualmente, não apenas como uma comemoração do que Deus havia feito pelos antepassados, mas também como uma atualização do ato libertador de Deus para a geração presente. Essa deveria ser uma experiência renovadora para cada grupo.\n' +
    'Êxodo 12:12 e 13 explica o significado da Páscoa: o juízo divino de destruição passaria sobre os israelitas (passaria por cima e não os atingiria); assim, eles deveriam comemorar a Páscoa. Em hebraico, Páscoa é Pesach, que significa “passar sobre”, porque a destruição “passou sobre” as casas cujos batentes das portas foram marcados com o sangue do cordeiro, o símbolo de vida e salvação.\n' +
    'A celebração da Páscoa tinha o propósito de lembrar a cada israelita dos atos de Deus, cheios de poder e de graça, que Ele realizou em favor de Seu povo. Essa celebração ajudaria a reafirmar a identidade nacional de Israel e fortalecer suas convicções religiosas.\n' +
    'Garanta o conteúdo completo da Lição da Escola Sabatina para o ano inteiro. Faça aqui a sua assinatura!\n' +
    '\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\t\tEsse tipo de conteúdo não está disponível nesse navegador.\n' +
    '\t\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\tPor que é tão importante recordar o bem que Deus fez por você no passado e confiar que Ele continuará a fazer o bem no futuro?\t\t\t\t\t\n' +
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
    '\t\t\t\t\tTerça-feira, 29 de julho\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\tAno Bíblico: RPSP: LV 14\t\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\tPesach\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\t4. Leia Êxodo 12:17-23. Qual era o papel do sangue na celebração dessa nova festa?\n' +
    'O sangue do animal sacrificado era um elemento central nessa celebração. Os participantes colocavam o sangue do cordeiro morto nos batentes das portas de suas casas. Dessa forma, demonstravam fé em Deus, crendo que Ele os livraria do destino reservado àqueles que não estavam sob a proteção do sangue. Que expressão poderosa do evangelho!\n' +
    'O cordeiro da Páscoa precisava ser sem defeito, pois simbolizava Jesus Cristo, o “Cordeiro de Deus, que tira o pecado do mundo” (Jo 1:29). O sangue do animal tinha papel crucial: simbolizava proteção e era um sinal de vida em meio à morte iminente.\n' +
    '"O sangue será um sinal para indicar as casas em que vocês se encontram. Quando Eu vir o sangue, passarei por vocês, e não haverá entre vocês praga destruidora, quando Eu ferir a terra do Egito"(Êx 12:13).\n' +
    'O evangelho está ligado à celebração da Páscoa, pois ela apontava não apenas para a libertação da escravidão e a jornada à terra prometida, mas também para o sacrifício de Cristo pelos pecados e para Seus méritos, aplicados aos que são cobertos por Seu sangue.\n' +
    'Séculos depois, fazendo referência à Páscoa, Paulo escreveu: “Joguem fora o velho fermento, para que vocês sejam nova massa, como, de fato, já são, sem fermento. Pois também Cristo, nosso Cordeiro pascal, foi sacrificado” (1Co 5:7).\n' +
    'O fermento era utilizado na preparação de diferentes tipos de massa. Ele é mencionado pela primeira vez na Bíblia na preparação do pão sem fermento, na véspera da saída dos israelitas do Egito. O fermento também precisava ser removido das casas (Êx 12:8, 15-20; 13:3-7). Nesse contexto específico, o fermento simbolizava o pecado (1Co 5:6-8); portanto, não deveria ser usado durante a Páscoa, que durava uma semana.\n' +
    'O pão sem fermento simboliza o Messias sem pecado, que venceu todas as tentações e entregou a vida por nós (Jo 1:29; 1Co 5:7; Hb 4:15). Os “ramos de hissopo” (Êx 12:22), que eram molhados no sangue, simbolizavam a graça purificadora de Deus (Sl 51:7). Em resumo, toda a celebração da Pesach revela a obra redentiva de Jesus.\n' +
    'Garanta o conteúdo completo da Lição da Escola Sabatina para o ano inteiro. Faça aqui a sua assinatura!\n' +
    '\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\t\tEsse tipo de conteúdo não está disponível nesse navegador.\n' +
    '\t\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\tFoi necessário o sangue de Jesus, que é o próprio Deus, para fazer expiação pelo pecado. O que esse fato nos ensina sobre a gravidade do pecado?\t\t\t\t\t\n' +
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
    '\t\t\t\t\tQuarta-feira, 30 de julho\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\tAno Bíblico: RPSP: LV 15\t\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\tPassando a tocha\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\tO salmista descreve como nossos filhos podem conhecer a Deus e Seu cuidado amoroso (Sl 145:4). As famílias devem dialogar sobre Deus, Seus feitos maravilhosos e Seus ensinos, para transmitir o conhecimento bíblico às futuras gerações.\n' +
    '5. Leia Êxodo 12:24-28. Qual é a ideia central desse texto?\n' +
    'Em Israel, os pais eram os primeiros professores e deviam contar a história do êxodo aos filhos. A história não deveria ser narrada apenas como um evento histórico distante, mas como uma experiência pessoal que fazia parte da vida de cada um, mesmo tendo ocorrido muito tempo antes. Ao celebrar a festa, os israelitas deveriam se conectar com seus antepassados, de modo que a história fosse revivida. Séculos depois, um pai poderia dizer à sua família: “Vivi no Egito, presenciei as pragas, vi a derrota dos deuses egípcios e fui libertado.” No Livro de Êxodo, vemos duas vezes como os pais deveriam responder às perguntas dos filhos sobre a Páscoa (Êx 12:26, 27; 13:14-16; compare com Dt 6:6-8).\n' +
    'É notável que os israelitas estavam no Egito quando foram orientados a celebrar a libertação do Egito. Essa celebração foi um ato de fé. Ao receber as instruções, “o povo se inclinou e adorou” seu Redentor. Depois, seguiu as instruções da Páscoa (Êx 12:27).\n' +
    'Em Deuteronômio, os israelitas são lembrados de que deveriam contar a história do êxodo de uma forma que as novas gerações a internalizassem como se fosse a jornada deles. Veja o tom coletivo da narrativa e a ênfase na experiência presente: “Meu pai foi um arameu prestes a perecer. Ele foi para o Egito, e ali viveu como estrangeiro com pouca gente; e ali veio a ser uma nação grande, forte e numerosa. Mas os egípcios nos maltrataram [...]. Clamamos ao Senhor [...]; e o Senhor ouviu a nossa voz e viu a nossa angústia, o nosso trabalho e a nossa opressão. E o Senhor nos tirou do Egito com mão poderosa, com braço estendido, com grande espanto, com sinais e com milagres. Ele nos trouxe a este lugar e nos deu esta terra, terra que mana leite e mel” (Dt 26:5-9).\n' +
    'Ao relembrar e contar aos filhos a história da Páscoa (ou qualquer evento importante da história sagrada), os pais eram ajudados a lembrar o que Deus tinha feito por eles e pelo povo. Contar essas histórias era significativo para quem falava e para quem ouvia.\n' +
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
    '\t\t\t\t\tQuinta-feira, 31 de julho\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\tAno Bíblico: RPSP: LV 16\t\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\tO juízo divino\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\t6. Deus feriu todos primogênitos no Egito. Por que Ele Se concentrou nos primogênitos? Êx 12:29, 30; Hb 11:28\n' +
    'A última praga do Egito atingiu os primogênitos. Esse foi um juízo divino contra todos os deuses do Egito e também contra todas as famílias que adoravam esses falsos deuses, que eram apenas ídolos sem valor, refletindo os sentimentos, desejos e medos do próprio povo.\n' +
    'Como as pragas anteriores já haviam demonstrado, os ídolos eram incapazes de salvar o povo. Sua inutilidade ficou mais evidente com a décima praga, que trouxe as consequências mais graves para os egípcios.\n' +
    '"Por todo o vasto reino do Egito, o orgulho de cada casa tinha sido derrubado. Gritos e choro de lamentação enchiam o ar. O rei e seus oficiais, com rosto pálido e membros trêmulos, estavam apavorados diante do horror que dominava a todos"(Ellen G. White, Patriarcas e Profetas [CPB, 2022], p. 233).\n' +
    'O Faraó era visto como a personificação do poder do Egito e o deus supremo da nação, e seu filho primogênito era considerado filho de um deus. Ísis era uma deusa que protegia as crianças; Heqet, a deusa que assistia as mulheres no parto; e Min, um deus na reprodução. Além desses, havia outros deuses egípcios relacionados à fertilidade. No entanto, eles se mostraram impotentes diante do Deus vivo. Moisés e Jetro fizeram declarações sobre o poder e a superiodade de Deus (Êx 15:11; Êx 18:11).\n' +
    'De acordo com Êxodo 1, o Faraó mandou que as parteiras egípcias matassem os filhos recém-nascidos dos israelitas numa tentativa de enfraquecê-los, dominá-los e humilhá-los. Agora, a punição de Deus recaiu sobre os primogênitos do Egito. Isso ilustra o princípio de que colhemos aquilo que semeamos.\n' +
    'Nossas decisões e comportamentos têm consequências reais. E a dolorosa verdade, que todos nós já experimentamos, é que não sofremos sozinhos as consequências de nossas ações erradas. Outras pessoas, às vezes até mesmo inocentes, também sofrem. Essa é a natureza do pecado.\n' +
    'Garanta o conteúdo completo da Lição da Escola Sabatina para o ano inteiro. Faça aqui a sua assinatura!\n' +
    '\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\t\tEsse tipo de conteúdo não está disponível nesse navegador.\n' +
    '\t\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\tVocê já sofreu por causa dos pecados de outras pessoas? Outras pessoas já sofreram por causa dos seus pecados? Qual é a nossa única esperança?\t\t\t\t\t\n' +
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
    '\t\t\t\t\tSexta-feira, 01 de agosto\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\tAno Bíblico: RPSP: LV 17\t\t\t\t\t\n' +
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
    '\t\t\t\t\t\tLeia, de Ellen G. White, Patriarcas e Profetas, p. 229-233 (“A Páscoa”).\n' +
    '“A Páscoa devia ser tanto comemorativa quanto simbólica, apontando não somente para a libertação do Egito, mas também para o maior livramento que, no futuro, Cristo realizaria libertando Seu povo do cativeiro do pecado. O cordeiro sacrifical representa o ‘Cordeiro de Deus’ (Jo 1:29), em quem se acha nossa única esperança de salvação. O apóstolo escreveu: ‘Cristo, nossa páscoa, foi sacrificado por nós’ (1Co 5:7, ARC). Não bastava que o cordeiro pascal fosse morto; seu sangue devia ser aspergido nos batentes das portas. Assim também, os méritos do sangue de Cristo devem ser aplicados no coração. Devemos crer que Ele morreu não somente pelo mundo, mas também por cada um de nós individualmente. Devemos apropriar-nos dos benefícios do sacrifício expiatório” (Ellen G. White, Patriarcas e Profetas [CPB, 2022], p. 231).\n' +
    'Até hoje, famílias judaicas celebram a Páscoa (em hebraico, Pessach). Elas realizam o que chamam de “sêder de Pesach” – “sêder” significa “ordem” ou “sequência” e, nesse caso, refere-se ao jantar cerimonial. Nesse momento, eles recontam a história do êxodo e depois desfrutam uma refeição especial em família. É impressionante como essa celebração tem sido mantida, literalmente, desde a época do êxodo! Somente o sábado, que também é observado pelos judeus praticantes, é mais antigo.\n' +
    'Perguntas para consideração1. Como entender que o Senhor foi justo ao matar os primogênitos do Egito e o mundo no dilúvio, muitos dos quais eram “inocentes”? É possível conciliar isso com o amor de Deus? \n' +
    '2. O que significa ser coberto pelo sangue de Jesus e que Seu sangue nos purifica do pecado? Como podemos aplicar esse conceito em nossa vida diária? \n' +
    '3. Leia as seguintes palavras: “Os seguidores de Cristo devem ser participantes de Sua experiência. Devem receber e assimilar a Palavra de Deus de modo que ela se torne a força que impulsiona a vida e as ações. Pelo poder de Cristo, devem ser transformados à Sua semelhança e refletir os atributos divinos. [...] O espírito e a obra de Cristo devem se tornar o espírito e a obra de Seus discípulos” (Patriarcas e Profetas, p. 231). Como podemos permitir que Cristo faça em nós o que esse texto descreve?\n' +
    'Respostas às perguntas da semana: 1. Deus deu aos egípcios uma última advertência e uma derradeira chance de se arrepender. 2. O Senhor deu instruções detalhadas para a celebração da Páscoa. 3. Deus passaria sobre as casas dos hebreus que colocassem sangue nas portas, poupando a vida dos israelitas. O sangue simbolizava a salvação divina. 4. O sangue representava proteção e era sinal de vida diante da morte. 5. Os pais deveriam explicar aos filhos o significado da Páscoa, contando o que Deus havia feito por eles. 6. A morte dos primogênitos representava o juízo contra todas as famílias que haviam rejeitado o Senhor.\n' +
    'Garanta o conteúdo completo da Lição da Escola Sabatina para o ano inteiro. Faça aqui a sua assinatura!\n' +
    '\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\t\tEsse tipo de conteúdo não está disponível nesse navegador.\n' +
    'portas, poupando a vida dos israelitas. O sangue simbolizava a salvação divina. 4. O sangue representava proteção e era sinal de vida diante da morte. 5. Os pais deveriam explicar aos filhos o significado da Páscoa, contando o que Deus havia feito por eles. 6. A morte dos primogênitos representava o juízo contra todas as famílias que haviam rejeitado o Senhor.\n' +
    'Garanta o conteúdo completo da Lição da Escola Sabatina para o ano inteiro. Faça aqui a sua assinatura!\n' +
    '\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\t\tEsse tipo de conteúdo não está disponível nesse navegador.\n' +
    'diante da morte. 5. Os pais deveriam explicar aos filhos o significado da Páscoa, contando o que Deus havia feito por eles. 6. A morte dos primogênitos representava o juízo contra todas as famílias que haviam rejeitado o Senhor.\n' +
    'Garanta o conteúdo completo da Lição da Escola Sabatina para o ano inteiro. Faça aqui a sua assinatura!\n' +
    '\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\t\tEsse tipo de conteúdo não está disponível nesse navegador.\n' +
    'dos primogênitos representava o juízo contra todas as famílias que haviam rejeitado o Senhor.\n' +
    'Garanta o conteúdo completo da Lição da Escola Sabatina para o ano inteiro. Faça aqui a sua assinatura!\n' +
    '\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\t\tEsse tipo de conteúdo não está disponível nesse navegador.\n' +
    'Garanta o conteúdo completo da Lição da Escola Sabatina para o ano inteiro. Faça aqui a sua assinatura!\n' +
    '\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\t\tEsse tipo de conteúdo não está disponível nesse navegador.\n' +
    '\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\t\tEsse tipo de conteúdo não está disponível nesse navegador.\n' +
    '\t\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\t\tEsse tipo de conteúdo não está disponível nesse navegador.\n' +
    '\t\t\t\t\t\t\t\tEsse tipo de conteúdo não está disponível nesse navegador.\n' +
    '\t\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\t\t\t\t\n' +
    '\t\t\t\t\tAssine a lição' +
    '\t\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\n' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\t\t\t\t\n' +
    '\t\t\t\t\tAssine a lição' +
    '\t\t\t\t\t\n' +
    '\t\t\t\t\t\t\t\t\t\t\n' +
    '\t\t\t\t\tAssine a lição' +
    '\t\t\t\t\tAssine a lição'
  ],
  verses: [],
  lessonLink: 'https://mais.cpb.com.br/licao/a-pascoa/',
  lastUpdated: '2025-07-27T17:22:00.903Z',
  expiresAt: '2025-08-03T17:22:02.175Z'
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
        const dayNames = ['Sábado', 'Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Auxiliar', 'Comentário', 'Resumo Semanal'];
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