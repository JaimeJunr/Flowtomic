import { describe, expect, it } from "vitest";
import {
  gridRows,
  nearestEdge,
  parseAspectRatio,
  pointerOrigin,
  revealOrder,
  spiralIndex,
  validatePixelOptions,
} from "./pixel-reveal-utils";

const CENTER = { x: 0.5, y: 0.5 };

function sequence(values: number[]) {
  let i = 0;
  return () => values[i++ % values.length];
}

describe("revealOrder", () => {
  it("devolve cols*rows atrasos entre 0 e 1 em todos os padrões", () => {
    for (const pattern of ["random", "dither", "ripple", "wipe"] as const) {
      const order = revealOrder(7, 5, pattern, CENTER, 0.3, Math.random);
      expect(order).toHaveLength(35);
      for (const delay of order) {
        expect(delay).toBeGreaterThanOrEqual(0);
        expect(delay).toBeLessThanOrEqual(1);
      }
    }
  });

  it("random embaralha com o rng injetado e cobre todos os níveis", () => {
    const a = revealOrder(4, 4, "random", CENTER, 0, sequence([0.1, 0.9, 0.5, 0.3]));
    const b = revealOrder(4, 4, "random", CENTER, 0, sequence([0.1, 0.9, 0.5, 0.3]));
    expect(a).toEqual(b);
    expect([...a].sort((x, y) => x - y)[0]).toBe(0);
    expect(Math.max(...a)).toBe(1);
    expect(new Set(a).size).toBe(16);
  });

  it("dither é determinístico e repete a matriz 4x4", () => {
    const a = revealOrder(8, 8, "dither", CENTER, 0.9, Math.random);
    const b = revealOrder(8, 8, "dither", CENTER, 0.9, Math.random);
    expect(a).toEqual(b);
    expect(a[0]).toBe(a[4]);
    expect(a[0]).toBe(a[4 * 8]);
  });

  it("ripple: a célula da origem tem o menor atraso e o mais longe o maior", () => {
    const order = revealOrder(5, 5, "ripple", { x: 0.1, y: 0.1 }, 0, Math.random);
    expect(order[0]).toBe(0);
    expect(order[0]).toBe(Math.min(...order));
    expect(order[24]).toBe(1);
  });

  it("wipe a partir da esquerda cresce com a coluna", () => {
    const order = revealOrder(6, 3, "wipe", { x: 0, y: 0.5 }, 0, Math.random);
    for (let row = 0; row < 3; row++) {
      for (let col = 1; col < 6; col++) {
        expect(order[row * 6 + col]).toBeGreaterThan(order[row * 6 + col - 1]);
      }
    }
  });

  it("wipe a partir do topo cresce com a linha e da direita decresce com a coluna", () => {
    const top = revealOrder(3, 4, "wipe", { x: 0.5, y: 0 }, 0, Math.random);
    expect(top[3]).toBeGreaterThan(top[0]);
    const right = revealOrder(4, 2, "wipe", { x: 1, y: 0.5 }, 0, Math.random);
    expect(right[3]).toBeLessThan(right[0]);
  });

  it("rejeita grade inválida informando o valor recebido", () => {
    expect(() => revealOrder(0, 3, "random", CENTER, 0, Math.random)).toThrow(/received cols=0/);
    expect(() => revealOrder(3, -1, "random", CENTER, 0, Math.random)).toThrow(/rows=-1/);
  });

  it("grade de uma célula devolve atraso 0", () => {
    expect(revealOrder(1, 1, "random", CENTER, 0, Math.random)).toEqual([0]);
    expect(revealOrder(1, 1, "wipe", CENTER, 0, Math.random)).toEqual([0]);
  });
});

describe("nearestEdge", () => {
  it("escolhe o lado mais próximo do ponto", () => {
    expect(nearestEdge({ x: 0.05, y: 0.5 })).toBe("left");
    expect(nearestEdge({ x: 0.95, y: 0.5 })).toBe("right");
    expect(nearestEdge({ x: 0.5, y: 0.02 })).toBe("top");
    expect(nearestEdge({ x: 0.5, y: 0.99 })).toBe("bottom");
  });
});

describe("gridRows", () => {
  it("segue a proporção do card", () => {
    expect(gridRows(10, 200, 100)).toBe(5);
    expect(gridRows(10, 100, 100)).toBe(10);
  });

  it("nunca devolve menos de uma linha e tolera largura zero", () => {
    expect(gridRows(10, 1000, 1)).toBe(1);
    expect(gridRows(10, 0, 0)).toBe(10);
  });
});

describe("parseAspectRatio", () => {
  it("lê barra, dois pontos e número único", () => {
    expect(parseAspectRatio("16 / 9")).toBeCloseTo(16 / 9);
    expect(parseAspectRatio("4:3")).toBeCloseTo(4 / 3);
    expect(parseAspectRatio("2")).toBe(2);
  });

  it("cai em 1 para valor inválido", () => {
    expect(parseAspectRatio("auto")).toBe(1);
    expect(parseAspectRatio("0 / 3")).toBe(1);
  });
});

describe("pointerOrigin", () => {
  const rect = { left: 100, top: 50, width: 200, height: 100 };

  it("normaliza o ponto dentro do card", () => {
    expect(pointerOrigin(rect, 200, 100)).toEqual({ x: 0.5, y: 0.5 });
  });

  it("limita a 0..1 e usa o centro quando o card não tem tamanho", () => {
    expect(pointerOrigin(rect, 0, 900)).toEqual({ x: 0, y: 1 });
    expect(pointerOrigin({ left: 0, top: 0, width: 0, height: 0 }, 5, 5)).toEqual(CENTER);
  });
});

describe("revealOrder: ordens novas", () => {
  const at = (order: number[], cols: number, col: number, row: number) => order[row * cols + col];
  const run = (pattern: Parameters<typeof revealOrder>[2], cols = 5, rows = 5) =>
    revealOrder(cols, rows, pattern, CENTER, 0, Math.random);

  it("center: menor atraso no meio, maior nos cantos", () => {
    const order = run("center");
    expect(at(order, 5, 2, 2)).toBe(Math.min(...order));
    expect(at(order, 5, 0, 0)).toBe(1);
  });

  it("edges: maior atraso no meio, zero nos cantos", () => {
    const order = run("edges");
    expect(at(order, 5, 2, 2)).toBe(Math.max(...order));
    expect(at(order, 5, 0, 0)).toBe(0);
  });

  it("left-to-right e right-to-left seguem a coluna", () => {
    const ltr = run("left-to-right");
    expect(at(ltr, 5, 0, 3)).toBe(0);
    expect(at(ltr, 5, 4, 3)).toBe(1);
    const rtl = run("right-to-left");
    expect(at(rtl, 5, 0, 3)).toBe(1);
    expect(at(rtl, 5, 4, 3)).toBe(0);
  });

  it("top-to-bottom cresce e bottom-to-top decresce com a linha", () => {
    const ttb = run("top-to-bottom");
    expect(at(ttb, 5, 2, 0)).toBe(0);
    expect(at(ttb, 5, 2, 4)).toBe(1);
    const btt = run("bottom-to-top");
    expect(at(btt, 5, 2, 0)).toBe(1);
    expect(at(btt, 5, 2, 4)).toBe(0);
  });

  it("diagonal: 0 no canto superior esquerdo e 1 no oposto", () => {
    const order = run("diagonal", 4, 3);
    expect(at(order, 4, 0, 0)).toBe(0);
    expect(at(order, 4, 3, 2)).toBe(1);
  });

  it("spiral: 0 no canto e 1 na última célula do percurso", () => {
    const order = run("spiral", 3, 3);
    expect(at(order, 3, 0, 0)).toBe(0);
    expect(at(order, 3, 1, 1)).toBe(1);
    expect(at(order, 3, 2, 0)).toBeCloseTo(2 / 8);
  });

  it("grade 1x1 não gera NaN em nenhuma ordem", () => {
    for (const pattern of [
      "center",
      "edges",
      "left-to-right",
      "right-to-left",
      "top-to-bottom",
      "bottom-to-top",
      "diagonal",
      "spiral",
    ] as const) {
      const [delay] = run(pattern, 1, 1);
      expect(Number.isFinite(delay)).toBe(true);
    }
  });
});

describe("spiralIndex", () => {
  it("3x3 percorre a borda no sentido horário e termina no centro", () => {
    expect(spiralIndex(3, 3)).toEqual([0, 1, 2, 7, 8, 3, 6, 5, 4]);
  });

  it("grade retangular 4x2 é uma permutação", () => {
    expect(spiralIndex(4, 2)).toEqual([0, 1, 2, 3, 7, 6, 5, 4]);
  });
});

describe("validatePixelOptions", () => {
  const ok = { pixelScale: 0.6, gap: 0, pixelRadius: 0 };
  it("aceita valores válidos", () => {
    expect(() => validatePixelOptions(ok)).not.toThrow();
  });

  it("recusa com o valor recebido e o intervalo esperado", () => {
    expect(() => validatePixelOptions({ ...ok, pixelScale: 1.5 })).toThrow(/1\.5.*0.*1/);
    expect(() => validatePixelOptions({ ...ok, gap: -2 })).toThrow(/-2.*>= 0/);
    expect(() => validatePixelOptions({ ...ok, pixelRadius: 60 })).toThrow(/60.*0.*50/);
  });
});
