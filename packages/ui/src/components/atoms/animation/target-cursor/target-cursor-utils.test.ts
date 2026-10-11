import { describe, expect, it } from "vitest";
import {
  cornerOrigin,
  cornerTargets,
  freeCornerOrigins,
  lockedCornerOrigins,
  nearestQuarter,
  parallaxOffset,
  parseRadius,
  rotateQuarter,
  spinStep,
} from "./target-cursor-utils";

describe("cornerTargets", () => {
  it("põe cada canto a meia largura/altura mais a folga do centro", () => {
    expect(cornerTargets({ width: 100, height: 40 }, 6)).toEqual({
      tl: { x: -56, y: -26 },
      tr: { x: 56, y: -26 },
      br: { x: 56, y: 26 },
      bl: { x: -56, y: 26 },
    });
  });

  it("recusa folga negativa dizendo o valor recebido", () => {
    expect(() => cornerTargets({ width: 10, height: 10 }, -1)).toThrow(/-1/);
  });
});

describe("nearestQuarter", () => {
  it.each([
    [0, 0],
    [44, 0],
    [46, 90],
    [359, 360],
    [-46, -90],
    [-10, 0],
    [725, 720],
  ])("%d graus vira %d", (input, expected) => {
    expect(nearestQuarter(input)).toBe(expected);
  });

  it("nunca devolve zero negativo", () => {
    expect(Object.is(nearestQuarter(-10), 0)).toBe(true);
  });
});

describe("parallaxOffset", () => {
  it("aplica 0,08 do deslocamento", () => {
    expect(parallaxOffset(50, -25)).toEqual({ x: 4, y: -2 });
  });

  it("limita a 8 px em cada eixo", () => {
    expect(parallaxOffset(1000, -1000)).toEqual({ x: 8, y: -8 });
  });
});

describe("rotateQuarter", () => {
  it("gira no sentido horário da tela", () => {
    expect(rotateQuarter({ x: -1, y: -1 }, 1)).toEqual({ x: 1, y: -1 });
    expect(rotateQuarter({ x: -1, y: -1 }, 2)).toEqual({ x: 1, y: 1 });
  });

  it("aceita quartos negativos e voltas completas", () => {
    expect(rotateQuarter({ x: 3, y: 5 }, -1)).toEqual(rotateQuarter({ x: 3, y: 5 }, 3));
    expect(rotateQuarter({ x: 3, y: 5 }, 4)).toEqual({ x: 3, y: 5 });
  });
});

describe("cornerOrigin", () => {
  it("recua o braço para dentro nos cantos direito e inferior", () => {
    const p = { x: 10, y: 20 };
    expect(cornerOrigin("tl", p, 12)).toEqual({ x: 10, y: 20 });
    expect(cornerOrigin("tr", p, 12)).toEqual({ x: -2, y: 20 });
    expect(cornerOrigin("br", p, 12)).toEqual({ x: -2, y: 8 });
    expect(cornerOrigin("bl", p, 12)).toEqual({ x: 10, y: 8 });
  });
});

describe("freeCornerOrigins", () => {
  it("monta o quadrado de lado size", () => {
    const o = freeCornerOrigins(36, 12);
    expect(o.tl).toEqual({ x: -18, y: -18 });
    expect(o.br).toEqual({ x: 6, y: 6 });
  });
});

describe("lockedCornerOrigins", () => {
  const rect = { width: 100, height: 40 };

  it("sem giro, é o canto do alvo", () => {
    const o = lockedCornerOrigins(rect, 6, 12, 0);
    expect(o.tl).toEqual({ x: -56, y: -26 });
    expect(o.br).toEqual({ x: 44, y: 14 });
  });

  it("com um quarto de giro, o grupo girado cai de volta nos cantos certos", () => {
    const o = lockedCornerOrigins(rect, 6, 12, 1);
    // O braço "tl" ocupa o slot "tr": rotacionado 90 graus, o ponto precisa cair em (56, -26).
    const point = rotateQuarter(
      { x: o.tl.x, y: o.tl.y }, // origem do braço tl = o próprio ponto
      1
    );
    expect(point).toEqual({ x: 56, y: -26 });
  });
});

describe("spinStep", () => {
  it("dá 360/duração graus por segundo", () => {
    expect(spinStep(0.5, 2)).toBe(90);
  });

  it("duração zero não gira", () => {
    expect(spinStep(1, 0)).toBe(0);
  });

  it("recusa duração negativa dizendo o valor recebido", () => {
    expect(() => spinStep(1, -2)).toThrow(/-2/);
  });
});

describe("parseRadius", () => {
  it("lê o primeiro valor em px e limita ao máximo", () => {
    expect(parseRadius("8px", 12)).toBe(8);
    expect(parseRadius("30px 4px", 12)).toBe(12);
  });

  it("vazio e inválido viram zero; porcentagem vira o máximo", () => {
    expect(parseRadius("", 12)).toBe(0);
    expect(parseRadius("abc", 12)).toBe(0);
    expect(parseRadius("50%", 12)).toBe(12);
  });
});
