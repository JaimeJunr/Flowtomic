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
 * - fórmulas adjacentes são separadas por U+2060 (WORD JOINER), sem espaço
 *   visível nem quebra de linha; juntar fechamento e abertura produziria um delimitador `$$`.
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
  let fence: { char: string; len: number; indent: number; quote: string } | null = null;
  let listIndent = 0;

  const flush = () => {
    if (paragraph.length > 0) {
      out.push(normalizeParagraph(paragraph.join("\n")));
      paragraph = [];
    }
  };

  for (const line of text.split("\n")) {
    const quote = QUOTE_PREFIX.exec(line)?.[0] ?? "";
    const body = line.slice(quote.length);
    if (fence) {
      out.push(line);
      const close = FENCE_CLOSE.exec(body);
      const indent = close ? indentWidth(close[1]) : -1;
      if (
        close &&
        quote.trim() === fence.quote &&
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
        quote: quote.trim(),
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
  const runs: Array<{ pos: number; len: number }> = [];
  for (let i = 0; i < text.length; ) {
    if (text[i] === "`") {
      let j = i;
      while (j < text.length && text[j] === "`") j++;
      runs.push({ pos: i, len: j - i });
      i = j;
    } else {
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
    const list = byLen.get(run.len) as number[];
    let c = cursor.get(run.len) ?? 0;
    while (c < list.length && list[c] <= k) c++;
    cursor.set(run.len, c);
    if (c < list.length) {
      const closing = runs[list[c]];
      spans.push([run.pos, closing.pos + closing.len]);
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

function normalizeParagraph(text: string): string {
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

  while (i < text.length) {
    const limit = span < spans.length ? spans[span][0] : text.length;
    if (i === limit) {
      copy(spans[span][1]);
      span++;
      continue;
    }

    const ch = text[i];

    if (ch === "$") {
      const run = dollars.byStart.get(i);
      if (run && run.close !== -1 && run.close < limit) {
        // Aberturas de moeda são consumidas no ramo R/US abaixo, antes de chegar aqui.
        if (text.slice(run.end, run.close).trim()) {
          if (endsWithMath) out += "\u2060";
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
            if (endsWithMath) out += "\u2060";
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
      copy(j);
      continue;
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
