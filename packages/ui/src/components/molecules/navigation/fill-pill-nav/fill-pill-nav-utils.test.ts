import { describe, expect, it } from "vitest";
import { fillCircle, isCompactWidth, isHoverPointer } from "./fill-pill-nav-utils";

describe("fillCircle", () => {
  function corners(w: number, h: number) {
    const { diameter, bottom, left } = fillCircle(w, h);
    const radius = diameter / 2;
    const cx = left + radius;
    const cy = bottom + radius; // altura do centro acima da base da pílula
    return {
      radius,
      distances: [
        [0, 0],
        [w, 0],
        [0, h],
        [w, h],
      ].map(([x, y]) => Math.hypot(x - cx, y - cy)),
    };
  }

  it("cobre os quatro cantos da pílula, inclusive os de baixo", () => {
    const { radius, distances } = corners(120, 36);
    for (const d of distances) expect(d).toBeLessThanOrEqual(radius);
  });

  it("fica centrado na pílula com diâmetro igual à diagonal mais 2 px", () => {
    const { diameter, bottom, left } = fillCircle(100, 40);
    expect(diameter).toBeCloseTo(Math.hypot(100, 40) + 2, 6);
    expect(left).toBeCloseTo((100 - diameter) / 2, 6);
    expect(bottom).toBeCloseTo((40 - diameter) / 2, 6);
  });

  it("cresce a partir da base da pílula", () => {
    const { diameter, originY } = fillCircle(100, 40);
    // origem = base da pílula medida de cima do círculo
    expect(originY).toBeCloseTo((40 + diameter) / (2 * diameter), 6);
  });

  it("recusa altura zero ou negativa com o valor recebido", () => {
    expect(() => fillCircle(100, 0)).toThrow(/height must be > 0, received 0/);
    expect(() => fillCircle(100, -4)).toThrow(/received -4/);
  });

  it("recusa largura negativa", () => {
    expect(() => fillCircle(-1, 10)).toThrow(/width must be >= 0, received -1/);
  });
});

describe("isCompactWidth", () => {
  it("só é compacto entre 0 e 768 exclusivos", () => {
    expect(isCompactWidth(null)).toBe(false);
    expect(isCompactWidth(0)).toBe(false);
    expect(isCompactWidth(360)).toBe(true);
    expect(isCompactWidth(768)).toBe(false);
  });
});

describe("isHoverPointer", () => {
  it("aceita mouse e caneta, recusa toque", () => {
    expect(isHoverPointer("mouse")).toBe(true);
    expect(isHoverPointer("pen")).toBe(true);
    expect(isHoverPointer("touch")).toBe(false);
    expect(isHoverPointer("")).toBe(false);
  });
});
