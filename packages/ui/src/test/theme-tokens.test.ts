import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

// Guarda a identidade "Urucum" (aprovada em 26/09/2026) contra a volta do tema Untitled UI:
// roxo rgb(105 56 239) e Inter. Lê os CSS do packages/styles, que é o que o CLI e o build copiam.
const STYLES_DIR = path.resolve(__dirname, "../../../styles");
const themeCss = readFileSync(path.join(STYLES_DIR, "theme.css"), "utf8");
const globalsCss = readFileSync(path.join(STYLES_DIR, "globals.css"), "utf8");

type Rgb = [number, number, number];

function readToken(css: string, name: string): string {
  const match = css.match(new RegExp(`${name}:\\s*([^;]+);`));
  if (!match)
    throw new Error(`token ausente: received none for ${name}, expected "${name}: <valor>;"`);
  return match[1].trim();
}

function readBlock(css: string, selector: string): string {
  const start = css.indexOf(`${selector} {`);
  if (start < 0) throw new Error(`bloco ausente: received none for "${selector} {"`);
  return css.slice(start, css.indexOf("\n  }", start));
}

function parseRgb(value: string): Rgb {
  const match = value.match(/^rgb\((\d+) (\d+) (\d+)\)$/);
  if (!match)
    throw new Error(`cor inválida: received ${JSON.stringify(value)}, expected "rgb(r g b)"`);
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

function parseHsl(value: string): Rgb {
  const match = value.match(/^([\d.]+) ([\d.]+)% ([\d.]+)%$/);
  if (!match)
    throw new Error(`cor inválida: received ${JSON.stringify(value)}, expected "H S% L%"`);
  const [h, s, l] = [Number(match[1]), Number(match[2]) / 100, Number(match[3]) / 100];
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
  return [f(0) * 255, f(8) * 255, f(4) * 255];
}

function hue([r, g, b]: Rgb): number {
  const max = Math.max(r, g, b);
  const d = max - Math.min(r, g, b);
  if (d === 0) return 0;
  const raw = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return (raw * 60 + 360) % 360;
}

function contrastWithWhite(rgb: Rgb): number {
  const [r, g, b] = rgb.map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 1.05 / (0.2126 * r + 0.7152 * g + 0.0722 * b + 0.05);
}

function luminance(rgb: Rgb): number {
  const [r, g, b] = rgb.map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: Rgb, b: Rgb): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const isPurple = (rgb: Rgb) => hue(rgb) >= 240 && hue(rgb) <= 300;

describe("Identidade Urucum no tema", () => {
  it("a escala brand saiu do roxo do Untitled UI", () => {
    const brand600 = parseRgb(readToken(themeCss, "--color-brand-600"));
    expect(isPurple(brand600)).toBe(false);
    expect(contrastWithWhite(brand600)).toBeGreaterThanOrEqual(4.5);
  });

  it("o primary do shadcn segue a marca no claro e no escuro, com texto branco legível", () => {
    for (const selector of [":root", ".dark"]) {
      const primary = parseHsl(readToken(readBlock(globalsCss, selector), "--primary"));
      expect(isPurple(primary), selector).toBe(false);
      expect(contrastWithWhite(primary), selector).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("nenhum token de foco ou destaque ficou roxo", () => {
    for (const selector of [":root", ".dark"]) {
      const block = readBlock(globalsCss, selector);
      for (const name of ["--ring", "--secondary", "--accent", "--accent-foreground"]) {
        expect(isPurple(parseHsl(readToken(block, name))), `${selector} ${name}`).toBe(false);
      }
    }
  });

  it("secondary é superfície: texto normal e secondary-foreground legíveis em cima dele", () => {
    // node, progress, task, message e context pintam bg-secondary e escrevem com a cor padrão
    // do texto (convenção do shadcn). Um secondary escuro deixa esses títulos ilegíveis.
    for (const selector of [":root", ".dark"]) {
      const block = readBlock(globalsCss, selector);
      const surface = parseHsl(readToken(block, "--secondary"));
      for (const name of ["--foreground", "--secondary-foreground"]) {
        const text = parseHsl(readToken(block, name));
        expect(contrast(surface, text), `${selector} ${name}`).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it("warning não se confunde com a marca: matiz a pelo menos 20° do brand-500", () => {
    const brand = hue(parseRgb(readToken(themeCss, "--color-brand-500")));
    const warning = hue(parseRgb(readToken(themeCss, "--color-warning-500")));
    expect(Math.abs(warning - brand)).toBeGreaterThanOrEqual(20);
  });
});

describe("Tipografia própria", () => {
  it("corpo e títulos não usam Inter", () => {
    expect(readToken(themeCss, "--font-body")).not.toMatch(/Inter/);
    expect(readToken(themeCss, "--font-display")).not.toMatch(/Inter/);
    expect(readToken(themeCss, "--font-body")).toMatch(/^"Public Sans"/);
    expect(readToken(themeCss, "--font-display")).toMatch(/^"Schibsted Grotesk"/);
  });

  it("o theme.css publica os tokens mesmo sem utilitário que os use", () => {
    // Sem `static`, o Tailwind v4 só emite a variável que algum utilitário usa. Nenhum usa
    // `--font-body`, então o body caía no ui-sans-serif e nem a Inter antiga chegava à tela.
    expect(themeCss.trimStart()).toMatch(/^@theme static \{/);
  });

  it("font-mono começa pela JetBrains Mono que o globals.css já baixa", () => {
    expect(readToken(themeCss, "--font-mono")).toMatch(/^"JetBrains Mono"/);
  });

  it("o globals.css baixa as fontes novas e não baixa mais a Inter", () => {
    expect(globalsCss).not.toMatch(/family=Inter/);
    expect(globalsCss).toMatch(/family=Public\+Sans/);
    expect(globalsCss).toMatch(/family=Schibsted\+Grotesk/);
  });

  it("os títulos usam a fonte display, senão a Schibsted Grotesk nunca aparece", () => {
    expect(globalsCss).toMatch(/h1,\s*h2,\s*h3,\s*h4\s*\{\s*font-family:\s*var\(--font-display\)/);
  });

  it("o body herda a fonte do token, sem Inter fixo", () => {
    const body = readBlock(globalsCss, "body");
    expect(body).toMatch(/font-family:\s*var\(--font-body\)/);
  });
});

describe("Componentes seguem o tema", () => {
  // Cor fixa de Tailwind não acompanha a troca de marca no theme.css: vira roxo órfão.
  const SRC_DIR = path.resolve(__dirname, "..");
  const HARDCODED_PURPLE = /\b(purple|violet|indigo|fuchsia)-\d{2,3}\b|#5B5FED|#7B7FFF/;

  function sourceFiles(dir: string): string[] {
    return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) return sourceFiles(full);
      return /\.tsx?$/.test(entry.name) && !/\.(stories|test)\.tsx?$/.test(entry.name)
        ? [full]
        : [];
    });
  }

  it("nenhum componente ou block usa roxo fixo no lugar dos tokens brand", () => {
    const offenders = sourceFiles(SRC_DIR).filter((file) =>
      HARDCODED_PURPLE.test(readFileSync(file, "utf8"))
    );
    expect(offenders.map((file) => path.relative(SRC_DIR, file))).toEqual([]);
  });
});
