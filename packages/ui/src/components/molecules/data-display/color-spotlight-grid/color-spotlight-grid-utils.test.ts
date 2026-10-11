import { describe, expect, it } from "vitest";
import {
  gridTemplateColumns,
  proximity,
  radiusStep,
  spotMask,
  stepToward,
  validateSettings,
} from "./color-spotlight-grid-utils";

const OK = { columns: 3, softness: 0.6, damping: 0.45, grayscale: 1, dim: 0.12 };

describe("spotMask", () => {
  it("usa (1 - softness) como raio interno opaco", () => {
    expect(spotMask(0.6)).toBe(
      "radial-gradient(circle var(--r) at var(--x) var(--y), black 40%, transparent 100%)"
    );
  });
  it("softness 0 é disco nítido e 1 some desde o centro", () => {
    expect(spotMask(0)).toContain("black 100%");
    expect(spotMask(1)).toContain("black 0%");
  });
});

describe("stepToward", () => {
  it("damping 0 chega ao alvo em um passo", () => {
    expect(stepToward(10, 50, 0)).toBe(50);
  });
  it("damping 0.5 anda metade", () => {
    expect(stepToward(10, 50, 0.5)).toBe(30);
  });
});

describe("gridTemplateColumns", () => {
  it("combina largura mínima e divisão em colunas", () => {
    expect(gridTemplateColumns(3, 12, 180)).toBe(
      "repeat(auto-fill, minmax(max(180px, calc((100% - 24px) / 3)), 1fr))"
    );
  });
});

describe("proximity", () => {
  const rect = { left: 100, top: 100, right: 300, bottom: 200 };
  it("1 dentro, 0 além do raio, proporcional no meio", () => {
    expect(proximity(rect, 150, 150, 100)).toBe(1);
    expect(proximity(rect, 400, 150, 100)).toBe(0);
    expect(proximity(rect, 350, 150, 100)).toBe(0.5);
  });
  it("raio 0 não divide por zero", () => {
    expect(proximity(rect, 350, 150, 0)).toBe(0);
  });
});

describe("radiusStep", () => {
  it("abre em 0,25 s e fecha em fadeOut", () => {
    expect(radiusStep(0, 200, true, 125, 0.6)).toBe(100);
    expect(radiusStep(200, 200, false, 300, 0.6)).toBe(100);
  });
  it("não passa dos limites", () => {
    expect(radiusStep(190, 200, true, 1000, 0.6)).toBe(200);
    expect(radiusStep(10, 200, false, 1000, 0.6)).toBe(0);
  });
  it("fadeOut 0 apaga na hora", () => {
    expect(radiusStep(200, 200, false, 16, 0)).toBe(0);
  });
});

describe("validateSettings", () => {
  it("aceita os padrões", () => {
    expect(() => validateSettings(OK)).not.toThrow();
  });
  it("rejeita columns fora de 1..6, citando o valor", () => {
    expect(() => validateSettings({ ...OK, columns: 0 })).toThrow(/columns received 0.*1 and 6/);
    expect(() => validateSettings({ ...OK, columns: 7 })).toThrow(/columns received 7/);
    expect(() => validateSettings({ ...OK, columns: 2.5 })).toThrow(/columns received 2.5/);
  });
  it("rejeita softness, grayscale e dim fora de 0..1", () => {
    expect(() => validateSettings({ ...OK, softness: 1.2 })).toThrow(/softness received 1.2/);
    expect(() => validateSettings({ ...OK, grayscale: -0.1 })).toThrow(/grayscale received -0.1/);
    expect(() => validateSettings({ ...OK, dim: 2 })).toThrow(/dim received 2/);
  });
  it("rejeita damping fora de 0..0.95", () => {
    expect(() => validateSettings({ ...OK, damping: 0.96 })).toThrow(/damping received 0.96.*0.95/);
    expect(() => validateSettings({ ...OK, damping: -1 })).toThrow(/damping received -1/);
  });
});
