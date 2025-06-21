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
      '\t\t\t\t\t\tLição 13\t\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\t\n' +
      '\t\t\t\t\t\t21 a 27 de junho\t\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\t\n' +
      '\t\t\t\t\t\tImagens do fim\n' +
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
      '\t\t\t\t\t\tAno Bíblico: RPSP: EX 16\t\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\t\n' +
      '\t\t\t\t\t\tVerso para memorizar:\n' +
      '\t\t\t\t\t\t“Jonas respondeu: – Eu sou hebreu e temo o Senhor, o Deus do céu, que fez o mar e a terra” (Jn 1:9).\n' +
      '\t\t\t\t\t\n' +
      '\t\t\t\t\t\n' +
      '\t\t\t\t\t\tLeituras da semana:\n' +
      '\t\t\t\t\t\tMt 12:38-42; Jn 3:5-10; Ap 18:4; Dn 5:1-31; Ap 16:12-19; 2Cr 36:22, 23\n' +
      '\t\t\t\t\t\n' +
      '\t\t\t\t\t\n' +
      '\t\t\t\t\t\tNesta semana concluiremos nossos estudos sobre relatos bíblicos que ajudam a elucidar nossa compreensão dos eventos dos últimos dias. Desta vez, veremos a missão de Jonas em Nínive, a queda de Babilônia e a ascensão de Ciro, o rei persa que libertou o povo de Deus e lhe permitiu retornar à terra prometida.\n' +
      'Assim como nas outras histórias que examinamos, esses relatos históricos têm significado profundo para cada geração. Contudo, também têm relevância especial para as gerações que vivem antes do retorno de Cristo. Podemos extrair desses relatos elementos que nos ajudam a compreender o que chamamos de “verdade presente”.\n' +
      'Ao mesmo tempo, em relação a essas histórias que prenunciam os eventos dos últimos dias, ao estudar temas e alusões amplas, não podemos tentar analisar cada detalhe a ponto de criar especulações a respeito das profecias. Assim como nas parábolas de Jesus, devemos nos concentrar nas ideias centrais, em vez de analisar cada detalhe na esperança de encontrar verdades ocultas. Nossa ênfase deve estar nos princípios e nos contornos gerais, e a partir deles descobrimos elementos relevantes para os últimos dias.\n' +
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
      '\t\t\t\t\tDomingo, 22 de junho\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\t\n' +
      '\t\t\t\t\t\tAno Bíblico: RPSP: ÊX 17\t\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\t\n' +
      '\t\t\t\t\t\tO profeta relutante\n' +
      '\t\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\t\n' +
      '\t\t\t\t\t\tA história de Jonas (Jn 1–4), embora breve, é impactante. Muitos crentes veem em si reflexos desse profeta relutante. A história contém lições a respeito de eventos futuros.\n' +
      '1. Leia Mateus 12:38-42. A quais partes da história de Jonas Jesus Se referiu ao Se dirigir aos escribas e fariseus? Quais lições sobre o juízo final são encontradas em Sua declaração?\n' +
      'Jesus declarou que era maior que Jonas. Ele sabia que vir ao mundo envolveria a cruz, e, ainda assim, Ele “veio buscar e salvar o perdido” (Lc 19:10). Jonas passou três dias dentro do grande peixe por causa de seus pecados; Jesus passou três dias no túmulo por causa dos nossos pecados. Isso era necessário para salvar os perdidos.\n' +
      'Hoje, conhecemos Jonas como um profeta relutante, indisposto a ir a Nínive. Da perspectiva humana, é fácil entender a atitude dele: os assírios comandavam um governo violento. Os murais assírios estão repletos de cenas de crueldade incomum: povos conquistados eram mortos pelos métodos mais cruéis imagináveis. Quem gostaria de enfrentar a perspectiva de pregar arrependimento em uma capital assim?\n' +
      'Há um momento importante na história que pode apontar para o movimento remanescente dos últimos dias: ao ser questionado sobre quem era, Jonas respondeu: “Eu sou hebreu e temo o Senhor, o Deus do Céu, que fez o mar e a terra” (Jn 1:9) – uma declaração muito parecida com a mensagem do primeiro anjo (Ap 14:7). De fato, a ênfase de Jonas no Senhor como Aquele “que fez o mar e a terra” obviamente aponta para Ele como o Criador. Esse fato é fundamental para o motivo pelo qual devemos adorá-Lo, e a adoração é central para os eventos dos últimos dias.\n' +
      'Ao mesmo tempo, nós também somos acusados de pregar uma mensagem potencialmente impopular na Babilônia espiritual. Quando Deus diz: “Saiam dela, povo Meu” (Ap 18:4), Ele indica que essas pessoas devem se arrepender; uma mensagem que quase sempre provocou reações negativas de muitas pessoas, mesmo quando transmitida da maneira mais gentil possível. Quem de nós, ao testemunhar, não recebeu respostas negativas ou mesmo hostis? Precisamos entender que isso faz parte do trabalho.\n' +
      'Garanta o conteúdo completo da Lição da Escola Sabatina para o ano inteiro. Faça aqui a sua assinatura!\n' +
      '\t\t\t\t\t\t\n' +
      '\t\t\t\t\t\t\t\n' +
      '\t\t\t\t\t\t\t\tEsse tipo de conteúdo não está disponível nesse navegador.\n' +
      '\t\t\t\t\t\t\t\n' +
      '\t\t\t\t\t\t\n' +
      '\t\t\t\t\t\n' +
      '\t\t\t\t\t\t\t\t\t\t\n' +
      '\t\t\t\t\t\tQuanto de Jonas você encontra em si mesmo? Como vencer essas atitudes erradas?\t\t\t\t\t\n' +
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
      '\t\t\t\t\tSegunda-feira, 23 de junho\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\t\n' +
      '\t\t\t\t\t\tAno Bíblico: RPSP: ÊX 18\t\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\t\n' +
      '\t\t\t\t\t\tObra de arrependimento\n' +
      '\t\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\t\n' +
      '\t\t\t\t\t\tJonas tinha uma mensagem bem distinta para o povo de Nínive. “Jonas começou a percorrer a cidade caminho de um dia, e pregava, dizendo: – Ainda quarenta dias, e Nínive será destruída” (Jn 3:4). Parece claro que o lugar estava condenado. Afinal, essa não era uma palavra enviada diretamente de um profeta do Senhor?\n' +
      'No entanto, o que aconteceu com Nínive?\n' +
      '2. Leia Jonas 3:5-10. Por que essa profecia não se cumpriu?\n' +
      'Toda a cidade se arrependeu, e a condenação profetizada não se concretizou, pelo menos por um tempo. “Sua condenação foi evitada; o Deus de Israel fora exaltado e honrado em todo o mundo pagão, e Sua lei foi reverenciada. Apenas muitos anos mais tarde Nínive caiu presa das nações vizinhas por causa de seu esquecimento de Deus e vaidoso orgulho” (Ellen G. White, Profetas e Reis [CPB, 2021], p. 160).\n' +
      'Podemos esperar algo assim nos últimos dias, com a mensagem final para o mundo caído? Sim e, ao mesmo tempo, não. Em todo o mundo, haverá muitas pessoas que atenderão ao chamado: “Saiam dela, povo Meu, para que vocês não sejam cúmplices em seus pecados e para que os seus flagelos não caiam sobre vocês” (Ap 18:4). Em todo o mundo, as pessoas tomarão posição e, desafiando a besta, guardarão “os mandamentos de Deus e a fé em Jesus” (Ap 14:12). Essas pessoas, como as de Nínive, serão livradas do juízo que recairá sobre os perdidos.\n' +
      'Ao mesmo tempo, devemos lembrar de que algumas profecias, como o anúncio da destruição de Nínive, eram condicionais: ela seria destruída a menos que o povo se afastasse da maldade (Jr 18:7-10). No entanto, outras profecias não são condicionais, ou seja, elas serão cumpridas, não importa a resposta humana: as profecias messiânicas sobre a primeira e a segunda vinda de Cristo, a marca da besta, as últimas pragas e a perseguição do fim dos tempos; elas ocorrerão independentemente do que os seres humanos façam. As obras e as escolhas das pessoas determinarão apenas de que lado estarão quando se cumprirem os eventos finais, preditos pelos profetas.\n' +
      'Garanta o conteúdo completo da Lição da Escola Sabatina para o ano inteiro. Faça aqui a sua assinatura!\n' +
      '\t\t\t\t\t\t\n' +
      '\t\t\t\t\t\t\t\n' +
      '\t\t\t\t\t\t\t\tEsse tipo de conteúdo não está disponível nesse navegador.\n' +
      '\t\t\t\t\t\t\t\n' +
      '\t\t\t\t\t\t\n' +
      '\t\t\t\t\t\n' +
      '\t\t\t\t\t\t\t\t\t\t\n' +
      '\t\t\t\t\t\tQue escolhas atuais ajudarão a fazer as escolhas certas diante da ameaça da besta?\t\t\t\t\t\n' +
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
      '\t\t\t\t\tTerça-feira, 24 de junho\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\t\n' +
      '\t\t\t\t\t\tAno Bíblico: RPSP: ÊX 19\t\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\t\n' +
      '\t\t\t\t\t\tO banquete de Belsazar\n' +
      '\t\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\t\n' +
      '\t\t\t\t\t\tDepois que Nínive foi conquistada (612 a.C.) por um exército de coalizão que incluía medos e babilônios (liderados pelo pai de Nabucodonosor), Babilônia experimentou um renascimento, como a cidade não via desde os dias de Hamurabi, seu grande legislador. Sob Nabucodonosor, que agora estava livre dos ataques assírios, Babilônia cresceu em riqueza e influência a ponto de as nações vizinhas terem pouca escolha a não ser reconhecer de má vontade seu domínio. Ela era a rainha do mundo, e as nações que desejavam prosperar declaravam sua lealdade a ela.\n' +
      'Entretanto, até onde sabemos, Nabucodonosor morreu confessando que o Deus de Daniel é, de fato, o governante legítimo de todas as nações (Dn 4:34-37). O próximo relato que Daniel apresenta é o de seu sucessor, o vice-regente Belsazar.\n' +
      '3. Que mensagens espirituais importantes tiramos de Daniel 5:1-31? O que, no fim das contas, levou Belsazar à destruição?\n' +
      'Talvez a parte mais triste do relato esteja em Daniel 5:22. Depois de relatar ao rei a queda e a restauração de Nabucodonosor, Daniel repreendeu Belsazar. Embora ele pudesse conhecer a verdade e até ter testemunhado em primeira mão o que aconteceu com Nabucodonosor, escolheu ignorar esses eventos e embarcar no mesmo curso que trouxe problemas ao seu antecessor.\n' +
      'Assim como Nabucodonosor fez ao erguer a estátua de ouro, Belsazar estava desafiando o que o Deus de Daniel havia previsto. Ao usar os utensílios do templo de modo profano, ele provavelmente estava ressaltando o fato de que Babilônia havia conquistado os judeus e agora possuía os artigos religiosos de seu Deus. Ou seja, eles ainda tinham supremacia sobre esse Deus que havia previsto a queda do império.\n' +
      'Foi um ato de desafio total, embora Belsazar tivesse evidências mais do que suficientes, e até provas da verdade. Ele tinha conhecimento suficiente para entender a verdade. O problema era seu coração. Nos últimos dias, quando a crise final irromper sobre o mundo, as pessoas também terão a oportunidade de conhecer a verdade. O que determinará sua escolha, assim como aconteceu com Belsazar, será o coração. \n' +
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
      '\t\t\t\t\tQuarta-feira, 25 de junho\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\t\n' +
      '\t\t\t\t\t\tAno Bíblico: RPSP: ÊX 20\t\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\t\n' +
      '\t\t\t\t\t\tO secamento do Eufrates\n' +
      '\t\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\t\n' +
      '\t\t\t\t\t\tUm dos pontos fortes de Babilônia era a maneira como o rio Eufrates passava por baixo de suas muralhas, fornecendo à cidade um suprimento ilimitado de água. Isso também provou ser sua fraqueza. Nitócris, uma antiga rainha babilônica, havia criado obras de terra ao longo do rio para desenvolvê-lo como uma rota para a cidade e, no processo, desviou o rio para um pântano, permitindo que as equipes trabalhassem confortavelmente. Ciro percebeu que poderia fazer a mesma coisa, secando o Eufrates o suficiente para que pudesse marchar confortavelmente com suas tropas sob o muro. Uma vez dentro dos muros da cidade, ele encontrou os muros defensivos que seguiam o rio pela cidade desprotegidos, e a cidade foi tomada em uma única noite. O antigo historiador grego Heródoto relata que “aqueles que viviam no centro de Babilônia não tinham ideia de que os subúrbios haviam caído, pois era uma época de festival, e todos estavam dançando e se entregando aos prazeres” (The Histories [Penguin, 2015], p. 94). Pode haver alguma dúvida de que essa é a mesma festa descrita em Daniel 5?\n' +
      '4. Leia Daniel 5:18-31 e Apocalipse 16:12-19. Que paralelos você encontra entre as últimas pragas do Apocalipse e a história da queda de Babilônia?\n' +
      'Ao explicar como discernir os sinais dos tempos, Jesus advertiu Seus discípulos: “Portanto, vigiem, porque vocês não sabem em que dia virá o Senhor de vocês. Porém, considerem isto: se o pai de família soubesse a que hora viria o ladrão, vigiaria e não deixaria que a sua casa fosse arrombada” (Mt 24:42, 43). Assim como na queda de Babilônia, o súbito aparecimento de Cristo tomará a Babilônia moderna de surpresa. No entanto, não precisa ser assim conosco: recebemos amplas evidências da breve volta de Jesus em inúmeras profecias detalhadas.\n' +
      'O mundo não será pego de surpresa apenas porque ignora o que Deus previu; ficará surpreso porque escolheu não acreditar no que Ele disse que aconteceria.\n' +
      'Garanta o conteúdo completo da Lição da Escola Sabatina para o ano inteiro. Faça aqui a sua assinatura!\n' +
      '\t\t\t\t\t\t\n' +
      '\t\t\t\t\t\t\t\n' +
      '\t\t\t\t\t\t\t\tEsse tipo de conteúdo não está disponível nesse navegador.\n' +
      '\t\t\t\t\t\t\t\n' +
      '\t\t\t\t\t\t\n' +
      '\t\t\t\t\t\n' +
      '\t\t\t\t\t\t\t\t\t\t\n' +
      '\t\t\t\t\t\tLeia Apocalipse 16:15. Em meio a essas advertências sobre o fim dos tempos, que mensagem do evangelho é encontrada nesse texto? O que significa não andar “nu”?\t\t\t\t\t\n' +
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
      '\t\t\t\t\tQuinta-feira, 26 de junho\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\t\n' +
      '\t\t\t\t\t\tAno Bíblico: RPSP: ÊX 21\t\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\t\n' +
      '\t\t\t\t\t\tCiro, o ungido\n' +
      '\t\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\t\n' +
      '\t\t\t\t\t\tQuando Ciro saqueou a cidade de Babilônia, o período de cativeiro do povo de Deus chegou ao fim, e os persas permitiram que os israelitas retornassem à terra prometida e reconstruíssem o templo. Sob o domínio de Ciro, o Império Persa se tornou o maior da história, naquilo que o historiador Tom Holland chama de “a maior aglomeração de territórios que o mundo já vira” (Domínio: O Cristianismo e a Criação da Mentalidade Ocidental [Record, 2022], p. 37).\n' +
      'Como era costume entre os persas, Ciro foi até chamado de “o grande rei” e “rei dos reis”. Ele prenuncia o que acontecerá quando Cristo retornar para Sua igreja: Ele é o Rei que vem do Oriente (compare com Mt 24:27), travando guerra contra Babilônia e libertando Seu povo para escapar de Babilônia e ir para a terra prometida (ver Ap 19:11-16). É por isso que Deus Se refere a Ciro como “Seu ungido” (Is 45:1). Esse famoso persa não apenas libertou o povo de Deus, mas sua campanha contra Babilônia também é um tipo (ou representação) da segunda vinda de Cristo.\n' +
      '5. Leia 2 Crônicas 36:22 e 23. Quais são as semelhanças e as diferenças entre a história de Ciro e a de Nabucodonosor? Qual é o significado desse decreto? Como ele impactou a primeira vinda de Jesus séculos depois?\n' +
      'Em nossas Bíblias, o AT termina em Malaquias, mas, na ordem hebraica, ele termina em 2 Crônicas, com o decreto de Ciro. Portanto, o próximo episódio no cânon das Escrituras é Mateus, que começa com o nascimento de Cristo, o Ciro antitípico. O rei Ciro ordenou a reconstrução do templo terrestre; Jesus inaugurou Seu ministério no santuário celestial – que terminará com Seu retorno e nossa libertação.\n' +
      'É claro, Ciro não era uma representação perfeita de Cristo. Nenhum tipo se encaixa perfeitamente com o antítipo, e devemos ter cuidado para não nos prendermos a cada detalhe. Porém, em termos amplos, Ciro atuou como um “salvador”.\n' +
      'Garanta o conteúdo completo da Lição da Escola Sabatina para o ano inteiro. Faça aqui a sua assinatura!\n' +
      '\t\t\t\t\t\t\n' +
      '\t\t\t\t\t\t\t\n' +
      '\t\t\t\t\t\t\t\tEsse tipo de conteúdo não está disponível nesse navegador.\n' +
      '\t\t\t\t\t\t\t\n' +
      '\t\t\t\t\t\t\n' +
      '\t\t\t\t\t\n' +
      '\t\t\t\t\t\t\t\t\t\t\n' +
      '\t\t\t\t\t\tÉ fascinante que Deus tenha usado um rei pagão de maneira tão marcante para fazer Sua vontade. Apesar das aparências do mundo hoje, o que aprendemos com a verdade de que, em longo prazo, o Senhor realizará os eventos finais conforme profetizado?\t\t\t\t\t\n' +
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
      '\t\t\t\t\tSexta-feira, 27 de junho\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\n' +
      '\t\t\t\t\t\n' +
      '\t\t\t\t\t\tAno Bíblico: RPSP: ÊX 22\t\t\t\t\t\n' +
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
      '\t\t\t\t\t\tLeia, de Ellen G. White, Profetas e Reis [CPB, 2021], p. 311-313 (“A queda de Babilônia”).\n' +
      '“A cada nação que entra em cena tem sido dada a oportunidade de ocupar seu lugar na Terra, para que se avalie se ela cumpriu ou não os objetivos do santo Vigia. A profecia traçou o surgimento e o progresso dos grandes impérios mundiais: Babilônia, Média-Pérsia, Grécia e Roma. Com cada uma delas, bem como com as nações de menor poder, a história tem se repetido. Todas têm tido seu período de prova. Cada uma tem falhado; sua glória tem desaparecido, e seu poder, passado. Embora as nações tenham rejeitado os princípios de Deus, e nessa rejeição tenham causado a própria ruína, um divino e soberano propósito tem atuado claramente ao longo dos séculos” (Profetas e Reis, p. 311).\n' +
      'Jeremias viu um oleiro moldando o barro. Deus usou essa imagem para explicar o princípio de que há profecias condicionais. E, para que entenda-mos, o Senhor explicou: “No momento em que Eu falar a respeito de uma nação ou de um reino para o arrancar, derrubar e destruir, se essa nação se converter da maldade contra a qual Eu falei, também Eu mudarei de ideia a respeito do mal que pensava fazer-lhe. E, no momento em que Eu falar a respeito de uma nação ou de um reino, para o edificar e plantar, se ele fizer o que é mau aos Meus olhos e não obedecer à Minha voz, então Eu mudarei de ideia quanto ao bem que havia prometido fazer” (Jr 18:7-10).\n' +
      'Perguntas para consideração\n' +
      '1. Jesus disse que o juízo será menos rigoroso para Nínive do que para o povo de Deus que se afastou da verdade (Mt 12:39-42). Que lição tiramos dessa advertência?\n' +      
      '2. Ellen G. White disse que, com os impérios que se sucedem, “a história tem se repetido”. Quais elementos em comum há nos impérios listados na profecia? Em que aspecto eles seguiram o mesmo caminho? O mundo atual também segue essa trilha?  \n' +
      '3. Frequentemente não é a mente, o intelecto, que afasta as pessoas da fé, mas o coração. Esse fato impacta sua maneira de testemunhar aos outros?\n' +
      'Respostas às perguntas da semana: 1. Jesus passaria três dias morto, assim como Jonas ficou três dias no ventre do peixe. Ambos pregaram uma mensagem de juízo. 2. Ela não se cumpriu porque o povo se arrependeu de seus pecados. Deus deseja salvar as pessoas, e não condená-las. 3. Deus deu a Belsazar todas as oportunidades de se arrepender; ele sabia tudo o que havia acontecido com Nabucodonosor, mas pereceu por sua própria decisão de afrontar a Deus. 4. Cristo destruirá Babilônia para salvar Seu povo. A queda da Babilônia histórica é um tipo (ou representação) do que Cristo fará nas últimas pragas. 5. Semelhança: Ciro era um rei poderoso que libertou o povo de Deus e destruiu os inimigos dele. Diferença: Ciro era simplesmente um ser humano pecador, e seu livramento foi apenas temporário.\n' +
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
  lessonLink: 'https://mais.cpb.com.br/licao/imagens-do-fim/',
  lastUpdated: '2025-06-21T17:02:51.090Z',
  expiresAt: '2025-06-28T17:02:51.929Z'
}
function buildSystemPrompt(lesson:  LessonData | null ): string {
  console.log("Construindo prompt do sistema com a lição:", lesson);
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
  const dayNames = ['Sábado', 'Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Auxiliar', 'Comentário', 'Resumo da Semana'];
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

    return NextResponse.json({ message: text,  conversationHistory }, { status: 200 });

  } catch (error) {
    console.error("Erro com Gemini:", error);
    return NextResponse.json(
      { message: "Erro ao processar a solicitação." },
      { status: 500 }
    );
  }
}