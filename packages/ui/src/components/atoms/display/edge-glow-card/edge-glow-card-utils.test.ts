import { describe, expect, it } from "vitest";
import {
  coneMask,
  edgeState,
  glowOpacity,
  type Rect,
  RING_GRADIENT,
  ringOpacity,
  spreadDegrees,
  validateEdgeGlowProps,
} from "./edge-glow-card-utils";

const RECT: Rect = { left: 100, top: 100, width: 200, height: 100 };
const DEFAULTS = { edgeSensitivity: 30, coneSpread: 25, intensity: 1 };

describe("edgeState", () => {
  it("no centro não acende nada", () => {
    expect(edgeState(RECT, 200, 150, 30).proximity).toBe(0);
  });

  it("em cima da borda a proximidade é 1", () => {
    expect(edgeState(RECT, 200, 100, 30).proximity).toBe(1);
    expect(edgeState(RECT, 300, 150, 30).proximity).toBe(1);
  });

  it("calcula o ângulo em graus, 0 no topo e sentido horário", () => {
    expect(edgeState(RECT, 200, 100, 30).angle).toBeCloseTo(0);
    expect(edgeState(RECT, 300, 150, 30).angle).toBeCloseTo(90);
    expect(edgeState(RECT, 200, 200, 30).angle).toBeCloseTo(180);
    expect(edgeState(RECT, 100, 150, 30).angle).toBeCloseTo(270);
  });

  it("cai linearmente dentro da zona de sensibilidade", () => {
    // zona = 30% de metade do menor lado (50) = 15px; a 7,5px da borda sobra 0,5
    expect(edgeState(RECT, 200, 107.5, 30).proximity).toBeCloseTo(0.5);
    expect(edgeState(RECT, 200, 115, 30).proximity).toBe(0);
  });

  it("fora do cartão até glowRadius ainda tem proximidade positiva", () => {
    const near = edgeState(RECT, 200, 90, 30, 40).proximity;
    expect(near).toBeCloseTo(0.75);
    expect(edgeState(RECT, 200, 50, 30, 40).proximity).toBe(0);
    expect(edgeState(RECT, 200, 90, 30).proximity).toBe(0);
  });

  it("rect sem tamanho lança erro com o valor recebido", () => {
    expect(() => edgeState({ left: 0, top: 0, width: 0, height: 10 }, 1, 1, 30)).toThrow(
      /width: 0.*expected/s
    );
  });
});

describe("validateEdgeGlowProps", () => {
  it("aceita os valores padrão", () => {
    expect(() => validateEdgeGlowProps(DEFAULTS)).not.toThrow();
  });

  it.each([
    [{ ...DEFAULTS, coneSpread: 4 }, /coneSpread: received 4/],
    [{ ...DEFAULTS, coneSpread: 46 }, /coneSpread: received 46/],
    [{ ...DEFAULTS, intensity: 0.05 }, /intensity: received 0.05/],
    [{ ...DEFAULTS, intensity: 3.1 }, /intensity: received 3.1/],
    [{ ...DEFAULTS, edgeSensitivity: -1 }, /edgeSensitivity: received -1/],
    [{ ...DEFAULTS, edgeSensitivity: 101 }, /edgeSensitivity: received 101/],
  ])("rejeita fora de faixa %#", (props, message) => {
    expect(() => validateEdgeGlowProps(props)).toThrow(message);
  });
});

describe("gradientes e opacidades", () => {
  it("o anel só usa tons que acendem nos dois temas (accent e secondary são escuros no modo escuro)", () => {
    expect(RING_GRADIENT).not.toMatch(/--accent|--secondary/);
    expect(RING_GRADIENT).toContain("var(--primary)");
  });

  it("o cone usa black/transparent, nunca hex", () => {
    const cone = coneMask(45);
    expect(cone).toContain("conic-gradient(from calc(var(--angle) - 45deg)");
    expect(cone).toContain("black 27deg");
    expect(cone).toContain("black 63deg");
    expect(cone).toContain("transparent 90deg");
    expect(cone).not.toMatch(/#[0-9a-f]{3}/i);
  });

  it("converte coneSpread em meia-abertura em graus", () => {
    expect(spreadDegrees(25)).toBe(45);
  });

  it("opacidades são expressões CSS limitadas a 1", () => {
    expect(ringOpacity(2)).toBe("min(1, calc(var(--proximity) * 2))");
    expect(glowOpacity(2)).toBe("min(1, calc(var(--proximity) * 2 * 0.9))");
  });
});
