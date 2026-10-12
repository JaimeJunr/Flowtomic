import { expect } from "vitest";

export type Rgb = [number, number, number];

export function readToken(css: string, name: string): string {
  const match = css.match(new RegExp(`(?:^|\\n)\\s*${name}:\\s*([^;]+);`));
  if (!match)
    throw new Error(`token ausente: received none for ${name}, expected "${name}: <valor>;"`);
  return match[1].trim();
}

export function readBlock(css: string, selector: string): string {
  const start = css.indexOf(`${selector} {`);
  if (start < 0) throw new Error(`bloco ausente: received none for "${selector} {"`);
  return css.slice(start, css.indexOf("\n  }", start));
}

export function parseRgb(value: string): Rgb {
  const match = value.match(/^rgb\((\d+) (\d+) (\d+)\)$/);
  if (!match)
    throw new Error(`cor inválida: received ${JSON.stringify(value)}, expected "rgb(r g b)"`);
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

// OKLCH → OKLab → LMS → sRGB linear → sRGB, pelas matrizes de Björn Ottosson (CSS Color 4).
export function parseOklch(value: string): Rgb {
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

function luminance(rgb: Rgb): number {
  const [r, g, b] = rgb.map((c) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: Rgb, b: Rgb): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

export function parseColor(value: string): Rgb {
  if (value.startsWith("oklch(")) return parseOklch(value);
  if (value.startsWith("rgb(")) return parseRgb(value);
  if (/^#[\da-f]{6}$/i.test(value)) {
    return [1, 3, 5].map((start) => Number.parseInt(value.slice(start, start + 2), 16)) as Rgb;
  }
  throw new Error(`cor opaca inválida: ${value}; use #rrggbb, rgb(r g b) ou oklch(L C H)`);
}

export type BrandColors = Record<
  | "--background"
  | "--foreground"
  | "--primary"
  | "--primary-hover"
  | "--primary-foreground"
  | "--accent"
  | "--accent-hover"
  | "--accent-foreground"
  | "--ring"
  | "--link",
  string
>;

export const BRAND_CONTRAST_RULES = [
  ["--primary-foreground", "--primary", 4.5],
  ["--primary-foreground", "--primary-hover", 4.5],
  ["--primary", "--background", 3],
  ["--link", "--background", 4.5],
  ["--ring", "--background", 3],
  ["--accent-foreground", "--accent", 4.5],
  ["--accent-foreground", "--accent-hover", 4.5],
  ["--foreground", "--background", 4.5],
] as const;

// Helper de teste: recebe os tokens efetivos, depois da cascata, nos dois modos.
// Valida a cor opaca do foco; a visibilidade do anel renderizado ainda exige prova no browser.
export function assertProductBrandContrast(modes: Record<"light" | "dark", BrandColors>): void {
  expect(Object.keys(modes).sort()).toEqual(["dark", "light"]);
  for (const mode of ["light", "dark"] as const) {
    for (const [a, b, minimum] of BRAND_CONTRAST_RULES) {
      expect(
        contrast(parseColor(modes[mode][a]), parseColor(modes[mode][b])),
        `${mode}: ${a} × ${b} (mínimo ${minimum}:1)`
      ).toBeGreaterThanOrEqual(minimum);
    }
  }
}
