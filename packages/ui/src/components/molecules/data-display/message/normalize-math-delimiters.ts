/**
 * Normaliza fórmulas e moeda antes do Markdown do MessageResponse - Flowtomic UI
 *
 * O `remark-math` só entende `$...$` e `$$...$$`, mas os modelos (OpenAI, Grok,
 * DeepSeek) escrevem muito `\[ ... \]` e `\( ... \)`; o Markdown trata `\[` como `[`
 * escapado e a fórmula sai como texto cru. E, com `$` simples ligado, `R$ 1.331 ...
 * R$ 331` vira math inline entre os dois `$`, engolindo negrito e espaços.
 *
 * O que esta função faz, fora de código (cercas ``` / ~~~ e código inline):
 * - `\[ ... \]` sozinho na linha vira bloco `$$\n...\n$$` (mantendo o recuo);
 *   no meio da linha vira `$...$`, porque `$$` no começo do conteúdo abriria bloco;
 * - `\( ... \)` vira `$...$`;
 * - `R$` e `US$` seguidos de número viram `R\$` e `US\$`, fora de math existente.
 *   Um dólar de moeda nunca abre math. Um dólar aberto fora de moeda, com conteúdo
 *   não vazio e fechamento do mesmo tamanho, protege a região inteira (inclusive
 *   `R$` em `$x \in R$ 5`). Os dois `R$` em negrito continuam sendo moeda.
 * - fórmulas adjacentes recebem um espaço comum: a pequena separação visual evita
 *   fundir delimitadores em `$$`, sem acrescentar caracteres invisíveis à seleção.
 * - destinos e títulos de links, definições de referência e URLs ficam intocados.
 *
 * O `$` simples continua ligado: `$x^2$` legítimo segue funcionando.
 *
 * Feita para streaming: delimitador sem fechar fica como veio, inline nunca atravessa
 * parágrafo, e a varredura é linear (sem regex com backtracking).
 */

const QUOTE_PREFIX = /^(?:[ \t]*>[ \t]?)*/;
const LIST_PREFIX = /^[ \t]*(?:[-+*]|[0-9]{1,9}[.)])[ \t]+/;
const FENCE_OPEN = /^([ \t]*)(`{3,}|~{3,})/;
const FENCE_CLOSE = /^([ \t]*)(`{3,}|~{3,})[ \t]*$/;
const BLANK_LINE = /^[ \t]*$/;
const ONLY_SPACES = /^[ \t]*$/;
const CURRENCY_PREV = /[A-Za-z0-9_\\$]/;
const DIGIT = /[0-9]/;

type CloserCache = { searchedFrom: number; result: number };

export function normalizeMathDelimiters(text: string): string {
  if (!text || (!text.includes("\\") && !text.includes("$"))) {
    return text;
  }

  const out: string[] = [];
  let paragraph: string[] = [];
  let fence: { char: string; len: number; indent: number; quoteDepth: number } | null = null;
  let listIndent = 0;

  const flush = () => {
    if (paragraph.length > 0) {
      out.push(normalizeParagraph(paragraph.join("\n")));
      paragraph = [];
    }
  };

  for (const line of text.split("\n")) {
    const quote = QUOTE_PREFIX.exec(line)?.[0] ?? "";
    const quoteDepth = [...quote].filter((ch) => ch === ">").length;
    const body = line.slice(quote.length);
    if (fence) {
      out.push(line);
      const close = FENCE_CLOSE.exec(body);
      const indent = close ? indentWidth(close[1]) : -1;
      if (
        close &&
        quoteDepth === fence.quoteDepth &&
        indent >= fence.indent &&
        indent <= fence.indent + 3 &&
        close[2][0] === fence.char &&
        close[2].length >= fence.len
      ) {
        fence = null;
      }
      continue;
    }
    let offset = 0;
    let marker = LIST_PREFIX.exec(body);
    while (marker) {
      offset += marker[0].length;
      marker = LIST_PREFIX.exec(body.slice(offset));
    }
    if (offset > 0) listIndent = indentWidth(body.slice(0, offset));
    else if (body.trim() && indentWidth(body.match(/^[ \t]*/)?.[0] ?? "") < listIndent) {
      listIndent = 0;
    }
    const open = FENCE_OPEN.exec(body.slice(offset));
    // "```a```" numa linha é código inline: cerca de crase não aceita crase no info string.
    if (open && !(open[2][0] === "`" && body.slice(offset + open[0].length).includes("`"))) {
      flush();
      out.push(line);
      const indent = indentWidth(body.slice(0, offset) + open[1]);
      fence = {
        char: open[2][0],
        len: open[2].length,
        indent: listIndent || (indent > 3 ? indent : 0),
        quoteDepth,
      };
      continue;
    }
    if (BLANK_LINE.test(line)) {
      flush();
      out.push(line);
      continue;
    }
    paragraph.push(line);
  }
  flush();

  return out.join("\n");
}

function indentWidth(prefix: string): number {
  let width = 0;
  for (const ch of prefix) width += ch === "\t" ? 4 - (width % 4) : 1;
  return width;
}

/** Conta dólares por prefixo e liga cada sequência à próxima do mesmo tamanho. */
function indexDollars(text: string, spans: Array<[number, number]>) {
  const count = new Uint32Array(text.length + 1);
  for (let i = 0; i < text.length; i++) count[i + 1] = count[i] + (text[i] === "$" ? 1 : 0);

  const runs: Array<{ start: number; end: number; close: number }> = [];
  let span = 0;
  for (let i = 0; i < text.length; ) {
    if (span < spans.length && i === spans[span][0]) {
      i = spans[span++][1];
    } else if (text[i] === "\\") {
      let j = i;
      while (text[j] === "\\") j++;
      i = j + ((j - i) % 2);
    } else if (text[i] === "$") {
      let end = i + 1;
      while (text[end] === "$") end++;
      runs.push({ start: i, end, close: -1 });
      i = end;
    } else i++;
  }
  const next = new Map<number, number>();
  const byStart = new Map<number, (typeof runs)[number]>();
  for (let i = runs.length - 1; i >= 0; i--) {
    const run = runs[i];
    const length = run.end - run.start;
    run.close = next.get(length) ?? -1;
    next.set(length, run.start);
    byStart.set(run.start, run);
  }
  return { count, byStart };
}

/** Trechos de código inline `[início, fim)`, pelo pareamento de crases do CommonMark. */
function findCodeSpans(text: string): Array<[number, number]> {
  const runs: Array<{ pos: number; len: number; openPos: number; openLen: number }> = [];
  let slashes = 0;
  for (let i = 0; i < text.length; ) {
    if (text[i] === "`") {
      let j = i;
      while (j < text.length && text[j] === "`") j++;
      const escaped = slashes % 2;
      runs.push({ pos: i, len: j - i, openPos: i + escaped, openLen: j - i - escaped });
      slashes = 0;
      i = j;
    } else {
      slashes = text[i] === "\\" ? slashes + 1 : 0;
      i++;
    }
  }
  if (runs.length < 2) return [];

  const byLen = new Map<number, number[]>();
  runs.forEach((run, k) => {
    const list = byLen.get(run.len);
    if (list) list.push(k);
    else byLen.set(run.len, [k]);
  });

  // Ponteiro por tamanho: a busca só anda para frente, então o total é linear.
  const cursor = new Map<number, number>();
  const spans: Array<[number, number]> = [];
  let k = 0;
  while (k < runs.length) {
    const run = runs[k];
    const list = byLen.get(run.openLen);
    if (!list || run.openLen === 0) {
      k++;
      continue;
    }
    let c = cursor.get(run.openLen) ?? 0;
    while (c < list.length && list[c] <= k) c++;
    cursor.set(run.openLen, c);
    if (c < list.length) {
      const closing = runs[list[c]];
      spans.push([run.openPos, closing.pos + closing.len]);
      k = list[c] + 1;
    } else {
      k++; // crase sem par é texto literal
    }
  }
  return spans;
}

/** Próximo `\]` ou `\)` não escapado a partir de `from`, ou -1. */
function findCloser(text: string, from: number, closeChar: string, cache: CloserCache): number {
  if (cache.searchedFrom <= from && (cache.result === -1 || cache.result >= from)) {
    return cache.result;
  }
  const needle = `\\${closeChar}`;
  let idx = text.indexOf(needle, from);
  while (idx !== -1) {
    let start = idx;
    while (start > 0 && text[start - 1] === "\\") start--;
    if ((idx - start) % 2 === 0) break; // número ímpar de barras: delimitador de verdade
    idx = text.indexOf(needle, idx + 2);
  }
  cache.searchedFrom = from;
  cache.result = idx;
  return idx;
}

function isCurrencyAt(text: string, i: number): number {
  const prefixLen = text.startsWith("R$", i) ? 2 : text.startsWith("US$", i) ? 3 : 0;
  if (prefixLen === 0) return 0;
  if (i > 0 && CURRENCY_PREV.test(text[i - 1])) return 0;
  let j = i + prefixLen;
  while (j < text.length && (text[j] === " " || text[j] === "\t" || text[j] === " ")) j++;
  if (text[j] === "-" || text[j] === "+" || text[j] === "−") j++;
  return j < text.length && DIGIT.test(text[j]) ? prefixLen : 0;
}

const WS = /\s/;
const REFERENCE_LABEL = /[ \t]{0,3}\[[^\]\n]+\]:/y;
const URL_START = /(?:[A-Za-z][A-Za-z0-9+.-]*:\/\/|mailto:|www\.)/y;
const MAX_PAREN_DEPTH = 32; // limite do CommonMark para parênteses aninhados no destino

/**
 * Memória da busca de fechamento de título, por caractere de abertura. O fechamento é sempre o
 * primeiro `"`/`'`/`)` não escapado depois da abertura, então uma busca que começa dentro de um
 * trecho já varrido chega ao mesmo fim (a abertura vem após espaço, nunca no meio de um par `\x`,
 * logo o alinhamento dos escapes coincide). Sem isso, `[a](u (` repetido varria até o mesmo `)`
 * a cada `](`: tempo quadrático.
 */
interface TitleMemo {
  /** Primeira posição de onde a busca já não achou fechamento. */
  fails: Record<string, number>;
  /** Última busca bem-sucedida: abertura em `[0]`, fim exclusivo em `[1]`. */
  found: Record<string, [number, number]>;
}
type TitleFails = TitleMemo;

/** Fim (exclusivo) do título que abre em `from`, ou -1. Resultados lembrados: a busca não repete. */
function titleEnd(text: string, from: number, memo: TitleFails): number {
  const open = text[from];
  if (from >= (memo.fails[open] ?? Number.POSITIVE_INFINITY)) return -1;
  const hit = memo.found[open];
  if (hit && from >= hit[0] && from < hit[1]) return hit[1];
  const close = open === "(" ? ")" : open;
  let i = from + 1;
  while (i < text.length) {
    if (text[i] === "\\") i += 2;
    else if (text[i] === close) {
      memo.found[open] = [from, i + 1];
      return i + 1;
    } else i++;
  }
  memo.fails[open] = from;
  return -1;
}

/** Fim do destino `<...>` ou sem espaço que começa em `from`, ou -1. */
function destinationEnd(text: string, from: number, parens: boolean): number {
  let i = from;
  if (text[i] === "<") {
    for (i++; i < text.length && text[i] !== ">"; i += text[i] === "\\" ? 2 : 1) {
      if (text[i] === "\n" || text[i] === "<") return -1;
    }
    return i < text.length ? i + 1 : -1;
  }
  let depth = 0;
  while (i < text.length && !WS.test(text[i])) {
    const ch = text[i];
    if (ch === "\\") i++;
    else if (parens && ch === "(" && ++depth > MAX_PAREN_DEPTH) return -1;
    else if (parens && ch === ")" && depth-- === 0) {
      depth = 0;
      break;
    }
    i++;
  }
  return depth === 0 ? Math.min(i, text.length) : -1;
}

function skipSpace(text: string, from: number, newlines: boolean): number {
  let i = from;
  while (i < text.length && (newlines ? WS.test(text[i]) : text[i] === " " || text[i] === "\t"))
    i++;
  return i;
}

function lineEnd(text: string, from: number): number {
  const end = text.indexOf("\n", from);
  return end === -1 ? text.length : end;
}

/**
 * Fim de `[rótulo]: destino "título"` que começa em `from` (início de linha), ou -1.
 * Só é definição se, depois do destino e do título opcional, a linha termina.
 */
function referenceDefinitionEnd(text: string, from: number, fails: TitleFails): number {
  REFERENCE_LABEL.lastIndex = from;
  if (!REFERENCE_LABEL.test(text)) return -1;
  const start = skipSpace(text, REFERENCE_LABEL.lastIndex, true);
  const destEnd = destinationEnd(text, start, false);
  if (destEnd === -1 || destEnd === start) return -1;
  const titleStart = skipSpace(text, destEnd, true);
  const quote = text[titleStart];
  if (titleStart > destEnd && (quote === '"' || quote === "'" || quote === "(")) {
    const end = titleEnd(text, titleStart, fails);
    const after = end === -1 ? -1 : skipSpace(text, end, false);
    if (after !== -1 && (after === text.length || text[after] === "\n")) return after;
    // título na mesma linha do destino e com resto depois: não é definição
    if (!text.slice(destEnd, titleStart).includes("\n")) return -1;
  }
  const after = skipSpace(text, destEnd, false);
  return after === text.length || text[after] === "\n" ? lineEnd(text, destEnd) : -1;
}

/** Fim de `(destino "título")` cujo `(` está em `open`, ou -1. Só vale com `[` antes. */
function inlineLinkEnd(text: string, open: number, fails: TitleFails): number {
  const start = skipSpace(text, open + 1, true);
  const destEnd = destinationEnd(text, start, true);
  if (destEnd === -1) return -1;
  const next = skipSpace(text, destEnd, true);
  if (text[next] === ")") return next + 1;
  const quote = text[next];
  if (next > destEnd && (quote === '"' || quote === "'" || quote === "(")) {
    const end = titleEnd(text, next, fails);
    if (end === -1) return -1;
    const close = skipSpace(text, end, true);
    return text[close] === ")" ? close + 1 : -1;
  }
  return -1;
}

/** Fim da URL solta ou autolink que começa em `i` (início de palavra), ou -1. */
function bareUrlEnd(text: string, i: number): number {
  if (i > 0 && /[A-Za-z0-9+.-]/.test(text[i - 1])) return -1;
  URL_START.lastIndex = i;
  if (!URL_START.test(text)) return -1;
  let end = URL_START.lastIndex;
  while (end < text.length && !/[\s<>]/.test(text[end])) end++;
  return end;
}

function normalizeParagraph(text: string): string {
  // Só o código tem precedência sobre tudo. Destinos, referências e URLs são reconhecidos
  // durante a varredura, quando o texto não está dentro de uma região de math.
  const spans = findCodeSpans(text);
  const dollars = indexDollars(text, spans);
  const closers: Record<string, CloserCache> = {
    "]": { searchedFrom: Number.POSITIVE_INFINITY, result: -1 },
    ")": { searchedFrom: Number.POSITIVE_INFINITY, result: -1 },
  };

  let out = "";
  let i = 0;
  let span = 0;
  let lineStart = 0;
  let lineBlank = true; // só espaço desde o começo da linha (no texto de origem)
  let endsWithMath = false;
  let bracketDepth = 0; // `[` não escapados ainda abertos: `](` só é link com `[` antes
  let definitions = true; // linhas anteriores foram só definições: ainda pode abrir outra
  const titleFails: TitleFails = { fails: {}, found: {} };

  // Só olha o trecho consumido [from, to): cada caractere é visto uma vez.
  const trackSource = (from: number, to: number) => {
    let nl = to - 1;
    while (nl >= from && text[nl] !== "\n") nl--;
    if (nl >= from) {
      lineStart = nl + 1;
      lineBlank = ONLY_SPACES.test(text.slice(lineStart, to));
    } else if (lineBlank) {
      lineBlank = ONLY_SPACES.test(text.slice(from, to));
    }
  };
  const copy = (to: number) => {
    if (to > i) endsWithMath = false;
    out += text.slice(i, to);
    trackSource(i, to);
    i = to;
  };

  // Copia um trecho protegido e descarta os trechos de código que ele já cobriu.
  const copyProtected = (to: number) => {
    copy(to);
    while (span < spans.length && spans[span][0] < i) span++;
  };

  while (i < text.length) {
    const limit = span < spans.length ? spans[span][0] : text.length;
    if (i === limit) {
      copy(spans[span][1]);
      span++;
      continue;
    }

    const ch = text[i];

    if (i === 0 || text[i - 1] === "\n") {
      // Definição de referência não interrompe parágrafo: só na abertura ou após outras.
      const end: number = i === 0 || definitions ? referenceDefinitionEnd(text, i, titleFails) : -1;
      definitions = end !== -1;
      if (end !== -1) {
        copyProtected(end);
        continue;
      }
    }

    if (ch === "$") {
      const run = dollars.byStart.get(i);
      if (run && run.close !== -1 && run.close < limit) {
        // Aberturas de moeda são consumidas no ramo R/US abaixo, antes de chegar aqui.
        if (text.slice(run.end, run.close).trim()) {
          if (endsWithMath) out += " ";
          copy(run.close + run.end - run.start);
          endsWithMath = true;
          continue;
        }
      }
    }

    if (ch === "\\") {
      let j = i;
      while (j < limit && text[j] === "\\") j++;
      const kind = text[j];
      if ((j - i) % 2 === 1 && j < limit && (kind === "[" || kind === "(")) {
        copy(j - 1); // barras pares antes do delimitador são escape literal
        const start = i;
        const closeChar = kind === "[" ? "]" : ")";
        const close = findCloser(text, start + 2, closeChar, closers[closeChar]);
        // Rejeita em O(1), antes de slice/trim: muitas aberturas podem ter o mesmo fechamento.
        if (close !== -1 && close < limit && dollars.count[close] === dollars.count[start + 2]) {
          const formula = text.slice(start + 2, close).trim();
          if (!formula) {
            copy(start + 2);
            continue;
          }
          const end = close + 2;
          let rest = end;
          while (rest < text.length && (text[rest] === " " || text[rest] === "\t")) rest++;
          const ownLine =
            kind === "[" && lineBlank && (rest === text.length || text[rest] === "\n");
          if (ownLine) {
            const indent = text.slice(lineStart, start);
            out += `$$\n${indent}${formula}\n${indent}$$`;
            endsWithMath = false;
          } else {
            if (endsWithMath) out += " ";
            out += `$${formula}$`;
            endsWithMath = true;
          }
          trackSource(start, end);
          lineBlank = false;
          i = end;
          continue;
        }
        copy(start + 2); // sem fechamento válido: fica como veio
        continue;
      }
      copy(kind === "]" && (j - i) % 2 === 1 && j < limit ? j + 1 : j);
      continue;
    }

    if (/[A-Za-z]/.test(ch)) {
      const end = bareUrlEnd(text, i);
      if (end !== -1) {
        copyProtected(end);
        continue;
      }
    }

    if (ch === "[") bracketDepth++;
    else if (ch === "]" && bracketDepth > 0) {
      bracketDepth--;
      const end = text[i + 1] === "(" ? inlineLinkEnd(text, i + 1, titleFails) : -1;
      if (end !== -1) {
        copyProtected(end);
        continue;
      }
    }

    if (ch === "R" || ch === "U") {
      const prefixLen = isCurrencyAt(text, i);
      if (prefixLen > 0) {
        out += `${text.slice(i, i + prefixLen - 1)}\\$`;
        endsWithMath = false;
        lineBlank = false;
        i += prefixLen;
        continue;
      }
    }

    copy(i + 1);
  }

  return out;
}
