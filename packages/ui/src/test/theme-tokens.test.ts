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

// OKLCH → OKLab → LMS → sRGB linear → sRGB, pelas matrizes de Björn Ottosson (CSS Color 4).
function parseOklch(value: string): Rgb {
  const match = value.match(/^oklch\(([\d.]+) ([\d.]+) ([\d.]+)\)$/);
  if (!match)
    throw new Error(`cor inválida: received ${JSON.stringify(value)}, expected "oklch(L C H)"`);
  const [l, c, h] = [Number(match[1]), Number(match[2]), (Number(match[3]) * Math.PI) / 180];
  const [a, b] = [c * Math.cos(h), c * Math.sin(h)];
  const lms = [
    (l + 0.3963377774 * a + 0.2158037573 * b) ** 3,
    (l - 0.1055613458 * a - 0.0638541728 * b) ** 3,
    (l - 0.0894841775 * a - 1.291485548 * b) ** 3,
  ];
  const linear = [
    4.0767416621 * lms[0] - 3.3077115913 * lms[1] + 0.2309699292 * lms[2],
    -1.2684380046 * lms[0] + 2.6097574011 * lms[1] - 0.3413193965 * lms[2],
    -0.0041960863 * lms[0] - 0.7034186147 * lms[1] + 1.707614701 * lms[2],
  ];
  const gamma = (x: number) => (x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055);
  return linear.map((x) => Math.min(1, Math.max(0, gamma(x))) * 255) as Rgb;
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
      const primary = parseOklch(readToken(readBlock(globalsCss, selector), "--primary"));
      expect(isPurple(primary), selector).toBe(false);
      expect(contrastWithWhite(primary), selector).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("nenhum token de foco ou destaque ficou roxo", () => {
    for (const selector of [":root", ".dark"]) {
      const block = readBlock(globalsCss, selector);
      for (const name of ["--ring", "--secondary", "--accent", "--accent-foreground"]) {
        expect(isPurple(parseOklch(readToken(block, name))), `${selector} ${name}`).toBe(false);
      }
    }
  });

  it("secondary é superfície: texto normal e secondary-foreground legíveis em cima dele", () => {
    // node, progress, task, message e context pintam bg-secondary e escrevem com a cor padrão
    // do texto (convenção do shadcn). Um secondary escuro deixa esses títulos ilegíveis.
    for (const selector of [":root", ".dark"]) {
      const block = readBlock(globalsCss, selector);
      const surface = parseOklch(readToken(block, "--secondary"));
      for (const name of ["--foreground", "--secondary-foreground"]) {
        const text = parseOklch(readToken(block, name));
        expect(contrast(surface, text), `${selector} ${name}`).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it("os quatro tons de status servem de texto no fundo e de fundo sólido com o foreground", () => {
    // A mesma cor vira texto (text-success na variação do StatsGrid) e botão/badge sólido
    // (bg-destructive text-destructive-foreground). As duas leituras precisam passar AA.
    for (const selector of [":root", ".dark"]) {
      const block = readBlock(globalsCss, selector);
      const background = parseOklch(readToken(block, "--background"));
      for (const name of ["--success", "--destructive", "--warning", "--info"]) {
        const tone = parseOklch(readToken(block, name));
        const onTone = parseOklch(readToken(block, `${name}-foreground`));
        expect(contrast(tone, background), `${selector} ${name}`).toBeGreaterThanOrEqual(4.5);
        expect(contrast(tone, onTone), `${selector} ${name}-foreground`).toBeGreaterThanOrEqual(
          4.5
        );
      }
    }
  });

  it("texto no próprio tom passa AA sobre o tom tingido a 10% (Alert, tag)", () => {
    // Tingido = 10% do tom sobre o background. Medido pela revisão de 26/09/2026: 4,1–4,4 no claro.
    for (const selector of [":root", ".dark"]) {
      const block = readBlock(globalsCss, selector);
      const background = parseOklch(readToken(block, "--background"));
      for (const name of ["--success", "--destructive", "--warning", "--info"]) {
        const tone = parseOklch(readToken(block, name));
        const tinted = tone.map((c, i) => c * 0.1 + background[i] * 0.9) as Rgb;
        expect(contrast(tone, tinted), `${selector} ${name}`).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it("as cores do Tailwind leem a variável na hora, senão `dark` num painel não muda nada", () => {
    // Com `@theme` sem `inline`, `--color-background: var(--background)` é resolvido uma vez
    // no :root; um painel com a classe `dark` herdava o valor claro (terminal do script-editor).
    const start = globalsCss.indexOf("--color-background: var(--background)");
    const opener = globalsCss.lastIndexOf("@theme", start);
    expect(globalsCss.slice(opener, globalsCss.indexOf("{", opener)).trim()).toBe("@theme inline");
  });

  it("as cores do tema são oklch(), como no shadcn desde fev/2025", () => {
    // Valor triplo ("16 80% 39%") só funcionava embrulhado em hsl(var(...)). Com a cor inteira na
    // variável, var(--x) basta e o Tailwind mistura transparência (bg-primary/10) em oklch.
    const colorLine = /^\s*(--[a-z0-9-]+):\s*([^;]+);/gm;
    for (const selector of [":root", ".dark"]) {
      const block = readBlock(globalsCss, selector);
      for (const [, name, value] of block.matchAll(colorLine)) {
        if (/^[\d.]+ [\d.]+% [\d.]+%$/.test(value) || value.startsWith("hsl")) {
          throw new Error(`${selector} ${name}: received ${value}, expected oklch(L C H) ou var()`);
        }
      }
    }
    expect(globalsCss).not.toMatch(/hsl\(var\(--/);
  });

  it("nenhum componente embrulha token em hsl()", () => {
    const offenders: string[] = [];
    const walk = (dir: string) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(full);
        else if (/\.(tsx?|css)$/.test(entry.name) && full !== __filename) {
          if (/hsl\(var\(--/.test(readFileSync(full, "utf8"))) offenders.push(full);
        }
      }
    };
    walk(path.resolve(__dirname, ".."));
    expect(offenders).toEqual([]);
  });

  it("o link passa AA como texto sobre o background nos dois modos", () => {
    // text-primary mede 3,45:1 no escuro (medido em 26/09/2026) — --link segue o --primary no
    // claro, mas no escuro precisa de um tom mais claro pra passar AA como texto.
    for (const selector of [":root", ".dark"]) {
      const block = readBlock(globalsCss, selector);
      const background = parseOklch(readToken(block, "--background"));
      const link = parseOklch(readToken(block, "--link"));
      expect(contrast(link, background), selector).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("a sidebar herda os tokens do tema, não os cinzas do shadcn", () => {
    // Até 27/09/2026 os --sidebar-* eram hsl() fixos do shadcn: o item ativo saía cinza, não no
    // wash de urucum do DESIGN.md. O .dark repete as referências porque custom property que usa
    // var() é resolvida onde é declarada — sem isso, um painel `dark` herdaria o valor claro.
    const expected: Record<string, string> = {
      "--sidebar": "var(--surface)",
      "--sidebar-foreground": "var(--foreground)",
      "--sidebar-accent": "var(--accent)",
      "--sidebar-accent-foreground": "var(--accent-foreground)",
      "--sidebar-border": "var(--border)",
      "--sidebar-ring": "var(--ring)",
    };
    const blocks = [...globalsCss.matchAll(/\n(:root|\.dark) \{\n([^}]*--sidebar:[^}]*)\}/g)];
    expect(blocks.map((b) => b[1])).toEqual([":root", ".dark"]);
    for (const [, selector, block] of blocks) {
      for (const [name, value] of Object.entries(expected)) {
        expect(readToken(block, `${name}`), `${selector} ${name}`).toBe(value);
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

  // Cor fixa não troca no modo escuro nem com o tema de quem instala: `text-gray-900` do
  // form-layout passou pelo guarda de roxo até 26/09/2026. A escala crua do theme.css
  // (`bg-brand-600`) também fica de fora: no Storybook ela saía transparente, sem erro. Use background/foreground, muted,
  // border, primary, accent e os tons de status (success, destructive, warning, info).
  const FIXED_COLOR =
    /\b(?:text|bg|border|ring|from|to|via|fill|stroke|outline|divide|shadow|placeholder|caret|decoration)-(?:gray|slate|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|black|white)(?:-\d{2,3})?\b|\b(?:text|bg|border|ring|from|to|via|fill|stroke|shadow)-(?:brand|error|success|warning|info)-\d{2,3}\b|#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)/g;
  // Véu atrás de modal (dialog, sheet, drawer): preto translúcido nos dois modos, padrão shadcn.
  const SCRIM = /\bbg-black\/\d+\b/g;
  const ALLOWED_FILES: Record<string, string> = {
    "components/atoms/data-display/qr-code/qr-code.tsx": "fundo transparente passado à lib do QR",
    "components/atoms/animation/backdrop-blur/backdrop-blur.tsx": "converte a cor que vem por prop",
    "components/atoms/data-display/chart/chart.tsx":
      "seletores internos do Recharts ([stroke='#ccc'])",
    "components/molecules/forms/text-editor/text-editor.tsx":
      "paleta que a pessoa escolhe no texto",
  };

  it("todo token de hover usado num componente existe como cor do Tailwind", () => {
    // `--primary-hover` e irmãos existiam no :root sem `--color-*`, então `hover:bg-success-hover`
    // do Button não gerava CSS nenhum (medido em 26/09/2026).
    const used = new Set(
      sourceFiles(SRC_DIR).flatMap((file) =>
        [...readFileSync(file, "utf8").matchAll(/\b(?:bg|text|border)-([a-z]+-hover)\b/g)].map(
          (match) => match[1]
        )
      )
    );
    const missing = [...used].filter(
      (name) => !globalsCss.includes(`--color-${name}:`) && !themeCss.includes(`--color-${name}:`)
    );
    expect(missing).toEqual([]);
  });

  it("nenhum componente ou block usa cor fixa no lugar dos tokens", () => {
    const offenders = sourceFiles(SRC_DIR).flatMap((file) => {
      const relative = path.relative(SRC_DIR, file);
      if (relative in ALLOWED_FILES || relative.startsWith("test/")) return [];
      const source = readFileSync(file, "utf8").replace(SCRIM, "");
      const hits = source.match(FIXED_COLOR) ?? [];
      return hits.length > 0 ? [`${relative}: ${[...new Set(hits)].join(" ")}`] : [];
    });
    expect(offenders).toEqual([]);
  });
});
