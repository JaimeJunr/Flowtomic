import { describe, expect, it, vi } from "vitest";
import {
  ambientPosition,
  BORDER_MASK_STYLE,
  beamGradient,
  follow,
  gradientStops,
  lightColor,
  lightGradient,
  proximityFade,
  subscribePointer,
} from "./spotlight-card-utils";

const RECT = { left: 100, top: 100, right: 300, bottom: 200 };

describe("gradientStops", () => {
  it("softness 0 cola os stops: borda nítida", () => {
    const { solid, end } = gradientStops(0);
    expect(solid).toBe(end);
  });

  it("softness 1 faz o fade desde o centro", () => {
    expect(gradientStops(1)).toEqual({ solid: 0, end: 100 });
  });

  it("limita valores fora de 0..1", () => {
    expect(gradientStops(-3)).toEqual(gradientStops(0));
    expect(gradientStops(7)).toEqual(gradientStops(1));
  });

  it("rejeita NaN dizendo o valor recebido", () => {
    expect(() => gradientStops(Number.NaN)).toThrow(/received NaN.*expected a number/);
  });
});

describe("proximityFade", () => {
  it("dentro do retângulo vale 1", () => {
    expect(proximityFade(RECT, 150, 150, 80)).toBe(1);
  });

  it("na distância proximity vale 0", () => {
    expect(proximityFade(RECT, 380, 150, 80)).toBe(0);
  });

  it("a meio caminho vale 0,5", () => {
    expect(proximityFade(RECT, 340, 150, 80)).toBeCloseTo(0.5);
  });

  it("mede a distância na diagonal", () => {
    expect(proximityFade(RECT, 330, 240, 80)).toBeCloseTo(0.375);
  });

  it("proximity 0 só acende dentro", () => {
    expect(proximityFade(RECT, 150, 150, 0)).toBe(1);
    expect(proximityFade(RECT, 301, 150, 0)).toBe(0);
  });
});

describe("follow", () => {
  it("smoothing 0 vai direto ao alvo", () => {
    expect(follow(0, 100, 0, 16)).toBe(100);
  });

  it("anda parte do caminho e converge", () => {
    const step = follow(0, 100, 0.3, 16);
    expect(step).toBeGreaterThan(0);
    expect(step).toBeLessThan(100);
    let value = 0;
    for (let i = 0; i < 300; i++) value = follow(value, 100, 0.3, 16);
    expect(value).toBeGreaterThan(99.9);
  });

  it("dt 0 não move", () => {
    expect(follow(10, 100, 0.3, 0)).toBe(10);
  });
});

describe("beamGradient", () => {
  it("é determinístico", () => {
    expect(beamGradient(50, 40, 200, 100)).toEqual(beamGradient(50, 40, 200, 100));
  });

  it("inclina o ponto de ancoragem na direção do ponteiro", () => {
    const left = beamGradient(10, 50, 200, 100).anchorX;
    const right = beamGradient(190, 50, 200, 100).anchorX;
    expect(left).toBeLessThan(100);
    expect(right).toBeGreaterThan(100);
  });

  it("é alto e estreito", () => {
    const { radiusX, radiusY } = beamGradient(100, 50, 200, 100);
    expect(radiusY).toBeGreaterThan(radiusX);
  });
});

describe("ambientPosition", () => {
  it("fica dentro do cartão e repete a cada ciclo de 12 s", () => {
    const a = ambientPosition(1234, 200, 100);
    const b = ambientPosition(1234 + 12000, 200, 100);
    expect(a.x).toBeGreaterThanOrEqual(0);
    expect(a.x).toBeLessThanOrEqual(200);
    expect(a.y).toBeGreaterThanOrEqual(0);
    expect(a.y).toBeLessThanOrEqual(100);
    expect(b.x).toBeCloseTo(a.x);
    expect(b.y).toBeCloseTo(a.y);
  });
});

describe("lightGradient e máscara da borda", () => {
  it("só usa variáveis e tokens, sem cor fixa", () => {
    const circle = lightGradient("circle", 0.7, "var(--tint)");
    const beam = lightGradient("beam", 0.7, "var(--tint)");
    for (const css of [circle, beam, ...Object.values(BORDER_MASK_STYLE)]) {
      expect(css).not.toMatch(/#[0-9a-f]{3,8}|rgba?\(|\bblack\b|\bwhite\b/i);
    }
    expect(circle).toContain("radial-gradient(circle");
    expect(circle).toContain("var(--sx)");
    expect(beam).toContain("radial-gradient(ellipse");
    expect(beam).toContain("var(--bx)");
  });

  it("a máscara recorta só a borda com exclude", () => {
    expect(BORDER_MASK_STYLE.maskComposite).toBe("exclude");
    expect(BORDER_MASK_STYLE.WebkitMaskComposite).toBe("xor");
  });
});

describe("subscribePointer", () => {
  it("compartilha um listener no window e o remove com o último", () => {
    const add = vi.spyOn(window, "addEventListener");
    const remove = vi.spyOn(window, "removeEventListener");
    const calls: Array<[number, number]> = [];
    const offA = subscribePointer((x, y) => calls.push([x, y]));
    const offB = subscribePointer(() => {});
    expect(add.mock.calls.filter(([type]) => type === "pointermove")).toHaveLength(1);
    window.dispatchEvent(new MouseEvent("pointermove", { clientX: 7, clientY: 9 }));
    expect(calls).toEqual([[7, 9]]);
    offA();
    expect(remove.mock.calls.filter(([type]) => type === "pointermove")).toHaveLength(0);
    offB();
    expect(remove.mock.calls.filter(([type]) => type === "pointermove")).toHaveLength(1);
    add.mockRestore();
    remove.mockRestore();
  });
});

describe("lightColor", () => {
  it("tom da marca usa --primary e o neutro usa --foreground, sempre por token", () => {
    expect(lightColor("15%", "brand")).toBe("color-mix(in oklab, var(--primary) 15%, transparent)");
    expect(lightColor("15%", "neutral")).toBe(
      "color-mix(in oklab, var(--foreground) 15%, transparent)"
    );
  });
});
