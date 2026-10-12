import { readFileSync } from "node:fs";
import path from "node:path";
import tailwind from "@tailwindcss/postcss";
import postcss from "postcss";
import { describe, expect, it } from "vitest";
import {
  assertProductBrandContrast,
  type BrandColors,
  contrast,
  parseColor,
} from "./brand-contrast";
import defaults from "./fixtures/product-brand-defaults.json";

const ROOT = path.resolve(__dirname, "../../../..");
const cssFiles = ["globals.css", "theme.css"].map((file) =>
  postcss.parse(readFileSync(path.join(ROOT, "packages/styles", file), "utf8"))
);
const normalize = (value: string) => value.replace(/\s+/g, " ").trim();

function tokensFor(selector: ":root" | ".dark"): Record<string, string> {
  const tokens: Record<string, string> = {};
  for (const css of cssFiles) {
    css.walkRules((rule) => {
      if (!rule.selectors.includes(selector)) return;
      rule.walkDecls((decl) => {
        if (decl.prop.startsWith("--")) tokens[decl.prop] = normalize(decl.value);
      });
    });
  }
  return tokens;
}

const contract = [
  "--primary",
  "--primary-hover",
  "--primary-foreground",
  "--accent",
  "--accent-hover",
  "--accent-foreground",
  "--ring",
  "--link",
  "--background",
  "--foreground",
  "--card",
  "--card-foreground",
  "--popover",
  "--popover-foreground",
  "--surface",
  "--surface-hover",
  "--muted",
  "--muted-foreground",
  "--secondary",
  "--secondary-hover",
  "--secondary-foreground",
  "--text-primary",
  "--text-secondary",
  "--border",
  "--border-hover",
  "--input",
  "--radius",
  "--border-width",
  "--shadow-xs",
  "--shadow-sm",
  "--shadow-md",
  "--shadow-lg",
  "--shadow-xl",
  "--shadow-2xl",
  "--shadow-3xl",
  "--font-display",
  "--font-body",
  "--font-mono",
  "--control-height",
] as const;
const light = tokensFor(":root");
const dark = tokensFor(".dark");

// Recorte opaco de /mnt/xs1000/me/constelacao/src/styles/constelacao.css (12/10/2026).
// No claro --background/--foreground são herdados do Flowtomic; no escuro --foreground também.
const constelacao = {
  light: {
    "--background": "#ffffff",
    "--foreground": defaults.light["--foreground"],
    "--primary": "#2b3aa0",
    "--primary-hover": "#1f2a7a",
    "--primary-foreground": "#ffffff",
    "--accent": "#e6e9fb",
    "--accent-hover": "#d5dbf7",
    "--accent-foreground": "#1f2a7a",
    "--ring": "#2b3aa0",
    "--link": "#2b3aa0",
  },
  dark: {
    "--background": "#0b1026",
    "--foreground": defaults.dark["--foreground"],
    "--primary": "#8f9cff",
    "--primary-hover": "#aab4ff",
    "--primary-foreground": "#0b1026",
    "--accent": "#1d2660",
    "--accent-hover": "#26307a",
    "--accent-foreground": "#c9cfff",
    "--ring": "#8f9cff",
    "--link": "#9aa6ff",
  },
} satisfies Record<"light" | "dark", BrandColors>;

function brandColors(tokens: Record<string, string>): BrandColors {
  return tokens as BrandColors;
}

// 39 tokens × 2 modos. A fixture conserva os valores de origin/main ec26b23;
// os dois tokens novos conservam a borda de 1px e o Button padrão de 36px.
describe("Camada de marca do produto", () => {
  it("todos os tokens documentados estão definidos explicitamente nos dois modos", () => {
    expect(contract.length).toBe(39);
    const design = readFileSync(path.join(ROOT, "DESIGN.md"), "utf8");
    const section = design
      .split("### Tokens que o produto pode sobrescrever")[1]
      ?.split("### Limites e acessibilidade")[0];
    expect(section).toBeTruthy();
    const documented = [...new Set(section?.match(/--[a-z][a-z0-9-]*/g) ?? [])].sort();
    expect(documented).toEqual([...contract].sort());
    for (const [mode, tokens] of Object.entries({ light, dark })) {
      for (const token of contract) expect(tokens[token], `${mode} ${token}`).toBeTruthy();
    }
  });

  it("os padrões preservam os valores visuais anteriores nos dois modos", () => {
    for (const [mode, tokens] of Object.entries({ light, dark })) {
      const actual = Object.fromEntries(contract.map((token) => [token, tokens[token]]));
      expect(actual, mode).toEqual(defaults[mode as keyof typeof defaults]);
    }
  });

  it("Flowtomic satisfaz as oito regras de contraste em claro e escuro", () => {
    assertProductBrandContrast({ light: brandColors(light), dark: brandColors(dark) });
  });

  it("Constelação satisfaz as oito regras de contraste em claro e escuro", () => {
    assertProductBrandContrast(constelacao);
  });

  it("reprova o anil claro reutilizado sobre o céu escuro", () => {
    expect(() =>
      assertProductBrandContrast({
        light: constelacao.light,
        dark: {
          ...constelacao.dark,
          "--primary": "#2b3aa0",
          "--primary-hover": "#1f2a7a",
          "--primary-foreground": "#ffffff",
        },
      })
    ).toThrow(/dark: --primary × --background/);
  });

  it("reprova texto branco na variante clara da marca escura", () => {
    expect(() =>
      assertProductBrandContrast({
        light: constelacao.light,
        dark: { ...constelacao.dark, "--primary-foreground": "#ffffff" },
      })
    ).toThrow(/dark: --primary-foreground × --primary/);
  });

  it("o CSS compilado lê os tokens de forma, tipo e sombras no elemento", async () => {
    const radii = ["xs", "sm", "md", "lg", "xl", "2xl", "3xl"];
    const borders = {
      border: "border-width",
      "border-x": "border-inline-width",
      "border-y": "border-block-width",
      "border-t": "border-top-width",
      "border-r": "border-right-width",
      "border-b": "border-bottom-width",
      "border-l": "border-left-width",
      "border-s": "border-inline-start-width",
      "border-e": "border-inline-end-width",
    };
    const fonts = ["body", "display", "mono"];
    const candidates = [
      ...Object.keys(borders),
      ...radii.map((name) => `rounded-${name}`),
      ...radii.map((name) => `shadow-${name}`),
      ...fonts.map((name) => `font-${name}`),
    ];
    expect(candidates).toHaveLength(26);
    const globals = readFileSync(path.join(ROOT, "packages/styles/globals.css"), "utf8")
      .replace('@import "tailwindcss";', '@import "tailwindcss" source(none);')
      .replace(/@import url\([^\n]+\);/g, "");
    const theme = readFileSync(path.join(ROOT, "packages/styles/theme.css"), "utf8");
    const result = await postcss([tailwind({ base: ROOT })]).process(
      `${globals}\n${theme}\n@source inline("${candidates.join(" ")}");`,
      { from: path.join(ROOT, "packages/styles/brand-test.css") }
    );
    const compiled = postcss.parse(result.css);
    function declaration(selector: string, property: string): string {
      let value = "";
      compiled.walkRules((rule) => {
        if (rule.selector !== selector) return;
        rule.walkDecls(property, (decl) => {
          value = decl.value;
        });
      });
      expect(value, `${selector} ${property}`).not.toBe("");
      return value;
    }
    for (const [name, property] of Object.entries(borders)) {
      expect(declaration(`.${name}`, property)).toBe("var(--border-width)");
    }
    for (const name of radii) {
      expect(declaration(`.rounded-${name}`, "border-radius")).toContain("var(--radius)");
      expect(declaration(`.shadow-${name}`, "--tw-shadow")).toBe(`var(--shadow-${name})`);
    }
    for (const name of fonts) {
      expect(declaration(`.font-${name}`, "font-family")).toBe(`var(--font-${name})`);
    }
  });

  it("o cálculo tem referências conhecidas e recusa cores não suportadas", () => {
    expect(contrast(parseColor("#000000"), parseColor("#ffffff"))).toBe(21);
    expect(contrast(parseColor("#2b3aa0"), parseColor("#2b3aa0"))).toBe(1);
    expect(contrast(parseColor("#ffffff"), parseColor("#2b3aa0"))).toBeCloseTo(9.478443, 5);
    expect(() => parseColor("transparent")).toThrow(/cor opaca inválida/);
  });
});
