// Lógica compartilhada de detecção e extração da Lição da Escola Sabatina.
// Usada tanto pelo cron (/api/cron) quanto pelo chat (/api/chat).

export type { LessonData } from '@/types';

const CPB_LESSON_LIST_URL = 'https://mais.cpb.com.br/licao-adultos/';

const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
} as const;

export interface DetectedLesson {
  title: string;
  link: string;
  verse: string;
  period: string;
}

/**
 * Detecta a lição da semana lendo o JSON embutido na página de listagem da CPB
 * e comparando o período (ex.: "16 a 22 de agosto") com a data atual.
 */
export async function detectCurrentLesson(): Promise<DetectedLesson | null> {
  try {
    const response = await fetch(CPB_LESSON_LIST_URL, { headers: BROWSER_HEADERS });
    if (!response.ok) {
      throw new Error(`Erro ao acessar site: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    const jsonMatch = html.match(/\[{.*"img":.*"title":.*"verso":.*"periodo":.*"link":.*}\]/);
    if (!jsonMatch) return null;

    const lessons: Array<{ title: string; link: string; verso: string; periodo?: string }> =
      JSON.parse(jsonMatch[0]);

    const monthMap: Record<string, number> = {
      janeiro: 0, fevereiro: 1, 'março': 2, abril: 3, maio: 4, junho: 5,
      julho: 6, agosto: 7, setembro: 8, outubro: 9, novembro: 10, dezembro: 11,
    };

    const now = new Date();
    const year = now.getFullYear();

    const current = lessons.find((lesson) => {
      const m = lesson.periodo?.match(/(\d+)\s+a\s+(\d+)\s+de\s+(\w+)/i);
      if (!m) return false;
      const month = monthMap[m[3].toLowerCase()];
      if (month === undefined) return false;
      const start = new Date(year, month, parseInt(m[1]));
      const end = new Date(year, month, parseInt(m[2]) + 1); // fim do dia
      return now >= start && now < end;
    });

    const chosen = current ?? lessons[0];
    if (!chosen) return null;

    return {
      title: chosen.title,
      link: chosen.link,
      verse: chosen.verso,
      period: chosen.periodo ?? '',
    };
  } catch (error) {
    console.error('Erro ao detectar lição atual:', (error as Error).message);
    return null;
  }
}

/**
 * Remove o "chrome" do site (menu de navegação no topo, rodapé) do texto já
 * sem HTML, para sobrar mais espaço útil da lição dentro do limite de caracteres.
 * Se nenhum marcador for encontrado, devolve o texto original (fallback seguro).
 */
function stripSiteChrome(text: string): string {
  let result = text;

  // Começo real da lição: "Lição 11 ...", "Sábado à tarde", "Verso para memorizar".
  const startMatch = result.match(/(Li[çc][ãa]o\s+\d+\s|S[áa]bado\s+[àa]\s+tarde|Verso\s+para\s+memorizar)/i);
  if (startMatch && startMatch.index !== undefined && startMatch.index > 0) {
    // pega a última "Lição N" antes desse ponto, se houver, senão corta ali mesmo
    const head = result.slice(0, startMatch.index);
    const licaoIdx = head.search(/Li[çc][ãa]o\s+\d+\s[^|]*$/i);
    result = result.slice(licaoIdx >= 0 ? licaoIdx : startMatch.index);
  }

  // Fim: cortar o rodapé do site (menu repetido / links institucionais).
  const endMatch = result.match(
    /(Sites\s+Relacionados|Portal\s+Adventista|Nosso\s+Amiguinho|Baixe\s+o\s+app|Todos\s+os\s+direitos|©\s*\d{4}|CPB\s+Casa\s+Publicadora|Assine\s+a\s+Newsletter)/i
  );
  if (endMatch && endMatch.index !== undefined && endMatch.index > 1000) {
    result = result.slice(0, endMatch.index);
  }

  return result.trim() || text;
}

/**
 * Baixa a página da lição e devolve o texto limpo (sem HTML), truncado.
 * O limite é generoso de propósito: a lição inteira (7 dias + auxiliar +
 * comentário) precisa caber para a IA conseguir resumir tudo. O Gemini
 * aguenta bem esse volume de contexto.
 */
export async function fetchLessonContent(lessonLink: string, maxLength = 45000): Promise<string> {
  try {
    const response = await fetch(lessonLink, { headers: BROWSER_HEADERS });
    if (!response.ok) {
      throw new Error(`Erro ao acessar lição: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    let cleanText = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim();

    cleanText = stripSiteChrome(cleanText);

    return cleanText.length > maxLength
      ? cleanText.substring(0, maxLength) + '... [conteúdo truncado]'
      : cleanText;
  } catch (error) {
    console.error('Erro ao buscar conteúdo da lição:', (error as Error).message);
    return 'Conteúdo da lição não disponível no momento.';
  }
}
