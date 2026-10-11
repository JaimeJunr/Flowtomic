import { describe, expect, it } from "vitest";
import {
  columnsFor,
  DEFAULT_BREAKPOINTS,
  layoutMasonry,
  startPosition,
} from "./masonry-grid-utils";

describe("columnsFor", () => {
  it("usa o primeiro breakpoint com largura >= px", () => {
    expect(columnsFor(1500, DEFAULT_BREAKPOINTS)).toBe(5);
    expect(columnsFor(1499, DEFAULT_BREAKPOINTS)).toBe(4);
    expect(columnsFor(1000, DEFAULT_BREAKPOINTS)).toBe(4);
    expect(columnsFor(999, DEFAULT_BREAKPOINTS)).toBe(3);
    expect(columnsFor(600, DEFAULT_BREAKPOINTS)).toBe(3);
    expect(columnsFor(599, DEFAULT_BREAKPOINTS)).toBe(2);
    expect(columnsFor(400, DEFAULT_BREAKPOINTS)).toBe(2);
    expect(columnsFor(399, DEFAULT_BREAKPOINTS)).toBe(1);
    expect(columnsFor(0, DEFAULT_BREAKPOINTS)).toBe(1);
  });

  it("cai em 1 coluna quando nenhum breakpoint serve", () => {
    expect(columnsFor(100, [[500, 3]])).toBe(1);
  });
});

describe("layoutMasonry", () => {
  const items = [
    { id: "a", height: 100 },
    { id: "b", height: 50 },
    { id: "c", height: 30 },
  ];

  it("calcula a largura da coluna descontando os espaços", () => {
    const { items: out } = layoutMasonry(items, 220, 2, 20);
    expect(out[0].w).toBe(100);
    expect(out[1].x).toBe(120);
  });

  it("manda cada item para a coluna mais baixa", () => {
    const { items: out } = layoutMasonry(items, 220, 2, 20);
    // a na coluna 0 (empate à esquerda), b na 1, c na 1 (50 < 100)
    expect(out.map((i) => [i.x, i.y])).toEqual([
      [0, 0],
      [120, 0],
      [120, 70],
    ]);
  });

  it("desempata pela coluna da esquerda", () => {
    const { items: out } = layoutMasonry(
      [
        { id: "a", height: 10 },
        { id: "b", height: 10 },
        { id: "c", height: 10 },
      ],
      100,
      2,
      0
    );
    expect(out[2].x).toBe(0);
    expect(out[2].y).toBe(10);
  });

  it("altura total é a maior coluna menos o gap final", () => {
    const { height } = layoutMasonry(items, 220, 2, 20);
    expect(height).toBe(100);
  });

  it("vazio dá altura 0", () => {
    expect(layoutMasonry([], 300, 3, 16)).toEqual({ items: [], height: 0 });
  });

  it("repassa a altura do item", () => {
    expect(layoutMasonry(items, 220, 2, 20).items[1].h).toBe(50);
  });

  it("lança com colunas menores que 1, citando o valor", () => {
    expect(() => layoutMasonry(items, 300, 0, 16)).toThrow(/columns.*0/);
  });

  it("lança com largura negativa, citando o valor", () => {
    expect(() => layoutMasonry(items, -5, 2, 16)).toThrow(/width.*-5/);
  });
});

describe("startPosition", () => {
  const target = { x: 50, y: 60, w: 100, h: 40 };
  const root = { width: 400, height: 300 };

  it("bottom, top, left e right deslocam 100px", () => {
    expect(startPosition("bottom", 0, target, root)).toEqual({ x: 50, y: 160 });
    expect(startPosition("top", 0, target, root)).toEqual({ x: 50, y: -40 });
    expect(startPosition("left", 0, target, root)).toEqual({ x: -50, y: 60 });
    expect(startPosition("right", 0, target, root)).toEqual({ x: 150, y: 60 });
  });

  it("center parte do centro da raiz", () => {
    expect(startPosition("center", 0, target, root)).toEqual({ x: 150, y: 130 });
  });

  it("random escolhe por index % 4, de forma determinística", () => {
    expect(startPosition("random", 0, target, root)).toEqual(startPosition("top", 0, target, root));
    expect(startPosition("random", 1, target, root)).toEqual(
      startPosition("bottom", 0, target, root)
    );
    expect(startPosition("random", 2, target, root)).toEqual(
      startPosition("left", 0, target, root)
    );
    expect(startPosition("random", 3, target, root)).toEqual(
      startPosition("right", 0, target, root)
    );
    expect(startPosition("random", 4, target, root)).toEqual(startPosition("top", 0, target, root));
  });
});
