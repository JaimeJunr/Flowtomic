import { describe, expect, it } from "vitest";
import {
  assertDomeProps,
  decayVelocity,
  domeRadius,
  domeTiles,
  dragRotation,
  sphereTransform,
  tileSizePx,
  tileTransform,
} from "./dome-gallery-utils";

describe("domeTiles", () => {
  it("gera segments x 5 posições", () => {
    expect(domeTiles(4, 12)).toHaveLength(60);
  });

  it("repete os itens quando acabam", () => {
    const tiles = domeTiles(3, 8);
    expect(tiles.map((t) => t.item).slice(0, 7)).toEqual([0, 1, 2, 0, 1, 2, 0]);
  });

  it("usa cinco fileiras centradas no equador", () => {
    const rows = new Set(domeTiles(2, 8).map((t) => t.row));
    expect([...rows].sort((a, b) => a - b)).toEqual([-2, -1, 0, 1, 2]);
  });

  it("desloca meia coluna as fileiras ímpares", () => {
    for (const t of domeTiles(2, 8)) {
      expect(t.col % 1).toBe(Math.abs(t.row) % 2 === 1 ? 0.5 : 0);
    }
  });

  it("começa pelo equador, onde a pessoa olha primeiro", () => {
    expect(domeTiles(2, 8)[0].row).toBe(0);
  });

  it("rejeita contagem inválida informando o valor", () => {
    expect(() => domeTiles(0, 8)).toThrow(/0.*>= 1/);
  });
});

describe("domeRadius", () => {
  it("auto usa o maior lado quando a proporção passa de 1.3", () => {
    expect(domeRadius(1000, 500, 0.5, "auto", 0, Infinity)).toBe(500);
  });

  it("auto usa o menor lado em proporção próxima de quadrada", () => {
    expect(domeRadius(1000, 900, 0.5, "auto", 0, Infinity)).toBe(450);
  });

  it("respeita as bases literais", () => {
    expect(domeRadius(800, 400, 1, "min", 0, Infinity)).toBe(400);
    expect(domeRadius(800, 400, 1, "max", 0, Infinity)).toBe(800);
    expect(domeRadius(800, 400, 1, "width", 0, Infinity)).toBe(800);
    expect(domeRadius(800, 400, 1, "height", 0, Infinity)).toBe(400);
  });

  it("limita entre minRadius e maxRadius", () => {
    expect(domeRadius(100, 100, 0.5, "min", 600, Infinity)).toBe(600);
    expect(domeRadius(4000, 4000, 1, "min", 0, 900)).toBe(900);
  });

  it("não quebra com área ainda não medida", () => {
    expect(domeRadius(0, 0, 0.5, "auto", 600, Infinity)).toBe(600);
  });
});

describe("assertDomeProps", () => {
  it("aceita valores válidos", () => {
    expect(() => assertDomeProps(3, 35, 0.5)).not.toThrow();
  });

  it("rejeita items vazio", () => {
    expect(() => assertDomeProps(0, 35, 0.5)).toThrow(/items.*0.*at least 1/);
  });

  it("rejeita segments fora de 8..60", () => {
    expect(() => assertDomeProps(3, 7, 0.5)).toThrow(/segments.*7.*8.*60/);
    expect(() => assertDomeProps(3, 61, 0.5)).toThrow(/segments.*61/);
  });

  it("rejeita fit fora de 0.1..1.5", () => {
    expect(() => assertDomeProps(3, 35, 0.05)).toThrow(/fit.*0\.05.*0\.1.*1\.5/);
    expect(() => assertDomeProps(3, 35, 2)).toThrow(/fit.*2/);
  });
});

describe("transforms", () => {
  it("posiciona o ladrilho por longitude, latitude e raio", () => {
    expect(tileTransform(2, 1, 10, 600)).toBe("rotateY(20deg) rotateX(-10deg) translateZ(-600px)");
  });

  it("gira a esfera em torno do centro, com o sinal natural do arraste", () => {
    expect(sphereTransform(600, 3, 40)).toBe("translateZ(600px) rotateX(-3deg) rotateY(-40deg)");
  });

  it("o ladrilho cobre uma unidade angular no plano tangente", () => {
    const px = tileSizePx(600, 36);
    expect(px).toBeCloseTo(2 * 600 * Math.tan(Math.PI / 36), 5);
  });
});

describe("dragRotation", () => {
  it("soma a rotação horizontal sem limite", () => {
    expect(dragRotation({ x: 0, y: 0 }, 100, 0, 20, 5).y).toBe(5);
    expect(dragRotation({ x: 0, y: 700 }, 100, 0, 20, 5).y).toBe(705);
  });

  it("limita a vertical", () => {
    expect(dragRotation({ x: 0, y: 0 }, 0, -1000, 20, 5).x).toBe(5);
    expect(dragRotation({ x: 0, y: 0 }, 0, 1000, 20, 5).x).toBe(-5);
  });
});

describe("decayVelocity", () => {
  it("decai por 0.95^dampening a cada 16ms", () => {
    expect(decayVelocity(10, 16, 2)).toBeCloseTo(10 * 0.95 ** 2, 6);
    expect(decayVelocity(10, 32, 2)).toBeCloseTo(10 * 0.95 ** 4, 6);
  });

  it("amortecimento maior para mais rápido", () => {
    expect(Math.abs(decayVelocity(10, 16, 5))).toBeLessThan(Math.abs(decayVelocity(10, 16, 1)));
  });
});
