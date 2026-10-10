import { describe, expect, it } from "vitest";
import {
  follow,
  formatCoord,
  isHoverPointer,
  lockBox,
  lockLabel,
  sameLockBox,
  segmentTransform,
} from "./crosshair-utils";

describe("follow", () => {
  it("com smoothing 0 vai direto ao alvo", () => {
    expect(follow(10, 200, 0, 16)).toBe(200);
  });

  it("com smoothing 0,5 anda metade do caminho em um quadro de 60 Hz", () => {
    expect(follow(0, 100, 0.5, 1000 / 60)).toBeCloseTo(50, 5);
  });

  it("dois quadros curtos equivalem a um quadro longo", () => {
    const step = 1000 / 120;
    const twice = follow(follow(0, 100, 0.5, step), 100, 0.5, step);
    expect(twice).toBeCloseTo(follow(0, 100, 0.5, step * 2), 5);
  });

  it("não ultrapassa o alvo com smoothing alto", () => {
    expect(follow(0, 100, 5, 16)).toBeLessThanOrEqual(100);
  });

  it("recusa smoothing negativo informando o valor recebido", () => {
    expect(() => follow(0, 1, -1, 16)).toThrow(/received smoothing -1, expected a number >= 0/);
  });
});

describe("formatCoord e lockLabel", () => {
  it("arredonda para inteiro", () => {
    expect(formatCoord(12.6)).toBe("13");
    expect(formatCoord(-0.2)).toBe("0");
  });

  it("recusa valor não finito", () => {
    expect(() => formatCoord(Number.NaN)).toThrow(/received null, expected a finite number/);
  });

  it("monta o rótulo largura x altura", () => {
    expect(lockLabel(80.4, 31.6)).toBe("80 × 32");
  });
});

describe("lockBox", () => {
  const area = { left: 100, top: 50, width: 400, height: 300 };
  const target = { left: 140, top: 90, width: 80, height: 32 };

  it("converte para coordenadas da área e cresce o padding", () => {
    expect(lockBox(target, area, 4)).toEqual({
      x: 36,
      y: 36,
      width: 88,
      height: 40,
      label: "80 × 32",
    });
  });

  it("compara caixas por valor", () => {
    expect(sameLockBox(lockBox(target, area, 4), lockBox(target, area, 4))).toBe(true);
    expect(sameLockBox(lockBox(target, area, 4), lockBox(target, area, 2))).toBe(false);
    expect(sameLockBox(null, null)).toBe(true);
    expect(sameLockBox(null, lockBox(target, area, 4))).toBe(false);
  });
});

describe("isHoverPointer", () => {
  it("aceita mouse e caneta e recusa toque", () => {
    expect(isHoverPointer("mouse")).toBe(true);
    expect(isHoverPointer("pen")).toBe(true);
    expect(isHoverPointer("touch")).toBe(false);
  });
});

describe("segmentTransform", () => {
  it("para a gap px antes e depois do ponteiro", () => {
    expect(segmentTransform("x", "before", 6)).toBe("translateX(calc(var(--cx) - 6px - 100%))");
    expect(segmentTransform("y", "after", 6)).toBe("translateY(calc(var(--cy) + 6px))");
  });

  it("recusa gap negativo informando o valor recebido", () => {
    expect(() => segmentTransform("x", "after", -2)).toThrow(/received gap -2/);
  });
});
