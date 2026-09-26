import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

// Guarda contra "cara de IA / template" voltando aos componentes: emoji como ícone/decoração,
// copy de template alheio (Download our Mobile App, John/Jane Doe, Totok, Arc Company, Lorem
// ipsum) e eyebrow em uppercase+tracking espaçado. Ver CLAUDE.md, seção "Convenções", sobre os
// tells que contam como cara de IA aqui.
const COMPONENTS_DIR = path.resolve(__dirname, "../components");

// \p{Extended_Pictographic} cobre emoji de verdade, mas também pega ©/®/™ (U+00A9, U+00AE,
// U+2122), que são símbolos tipográficos comuns, não emoji — por isso ficam de fora do match.
// ✕ (U+2715) e ⌘ (U+2318), usados em botões de fechar e atalhos de teclado, já não são
// Extended_Pictographic e não precisam de exclusão.
const EMOJI_RE = /(?![©®™])\p{Extended_Pictographic}/u;

const TEXT_PATTERNS: Array<[RegExp, string]> = [
  [/Lorem/i, "Lorem"],
  [/Download our Mobile App/, "Download our Mobile App"],
  [/John Doe/, "John Doe"],
  [/Jane Doe/, "Jane Doe"],
  [/Totok/, "Totok"],
  [/Arc Company/, "Arc Company"],
  // Nomes do template "Donezo" do Dribbble, de onde veio o flowtomic-dashboard original.
  [/Alexandra Deff|Edwin Adenike|Oluwatemilorun|David Oshodi/, "nomes do template Donezo"],
  [/New message from John/, "New message from John"],
];

// Eyebrow em caixa alta com letter-spacing espaçado (ex.: `uppercase tracking-wide`), na mesma
// string de classe. Não pega `tracking-tight`/`tracking-normal` isolado, que não é eyebrow.
const UPPERCASE_TRACKING_RE = /\buppercase\b[^"'`]*\btracking-(wide|wider|widest)\b/;

// Arquivos cujo próprio propósito é lidar com emoji — não é slop, é o dado do componente.
const ALLOWED_EMOJI_FILES = new Set<string>([
  // nenhum por enquanto: nenhum componente atual é um emoji-picker/reactions
]);

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(full);
    return /\.(ts|tsx)$/.test(entry.name) && !/\.test\.(ts|tsx)$/.test(entry.name) ? [full] : [];
  });
}

describe("Sem slop de template/IA em packages/ui/src/components", () => {
  const files = sourceFiles(COMPONENTS_DIR);

  it("nenhum arquivo usa emoji como ícone/decoração", () => {
    const offenders = files
      .filter((file) => !ALLOWED_EMOJI_FILES.has(path.relative(COMPONENTS_DIR, file)))
      .filter((file) => EMOJI_RE.test(readFileSync(file, "utf8")))
      .map((file) => path.relative(COMPONENTS_DIR, file));
    expect(offenders).toEqual([]);
  });

  it("nenhum arquivo tem copy de template alheio (Lorem, Download our Mobile App, John/Jane Doe, Totok, Arc Company)", () => {
    const offenders = files
      .filter((file) => {
        const content = readFileSync(file, "utf8");
        return TEXT_PATTERNS.some(([re]) => re.test(content));
      })
      .map((file) => path.relative(COMPONENTS_DIR, file));
    expect(offenders).toEqual([]);
  });

  it("nenhum eyebrow usa uppercase + tracking espaçado (caixa alta com letter-spacing)", () => {
    const offenders = files
      .filter((file) => UPPERCASE_TRACKING_RE.test(readFileSync(file, "utf8")))
      .map((file) => path.relative(COMPONENTS_DIR, file));
    expect(offenders).toEqual([]);
  });
});
