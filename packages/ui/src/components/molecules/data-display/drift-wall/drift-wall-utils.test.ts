import { describe, expect, it } from "vitest";
import {
  columnSpeed,
  distribute,
  fadeMask,
  listHeight,
  planeTransform,
  rowsNeeded,
  validateDriftOptions,
  wrapOffset,
} from "./drift-wall-utils";

const make = (n: number) =>
  Array.from({ length: n }, (_, i) => ({ id: `i${i}`, label: `Item ${i}` }));

describe("distribute", () => {
  it("reparte 15 itens em 5 colunas, 3 por coluna completados a 4", () => {
    const cols = distribute(make(15), 5);
    expect(cols).toHaveLength(5);
    for (const col of cols) expect(col).toHaveLength(4);
    expect(cols[0].map((i) => i.id)).toEqual(["i0", "i5", "i10", "i0"]);
    expect(cols[4].map((i) => i.id).slice(0, 3)).toEqual(["i4", "i9", "i14"]);
  });

  it("nao deixa coluna vazia com 2 itens em 5 colunas", () => {
    const cols = distribute(make(2), 5);
    for (const col of cols) {
      expect(col.length).toBeGreaterThanOrEqual(4);
      expect(col.length).toBeGreaterThan(0);
    }
  });

  it("respeita o minimo de linhas pedido", () => {
    const cols = distribute(make(6), 2, 9);
    for (const col of cols) expect(col).toHaveLength(9);
  });

  it("nao corta coluna que ja passa do minimo", () => {
    expect(distribute(make(20), 2)[0]).toHaveLength(10);
  });
});

describe("columnSpeed", () => {
  it("colunas pares e impares andam em sentidos opostos", () => {
    const even = columnSpeed(0, 5, 40, 0.4, "up");
    const odd = columnSpeed(1, 5, 40, 0.4, "up");
    expect(even).toBeLessThan(0);
    expect(odd).toBeGreaterThan(0);
    expect(columnSpeed(0, 5, 40, 0.4, "down")).toBeGreaterThan(0);
  });

  it("variance 0 devolve modulo igual a speed", () => {
    for (let c = 0; c < 5; c++) {
      expect(Math.abs(columnSpeed(c, 5, 42, 0, "up"))).toBeCloseTo(42);
    }
  });

  it("variance muda o modulo entre colunas", () => {
    expect(Math.abs(columnSpeed(1, 5, 40, 0.5, "up"))).not.toBeCloseTo(
      Math.abs(columnSpeed(2, 5, 40, 0.5, "up"))
    );
  });

  it("rejeita coluna fora do intervalo", () => {
    expect(() => columnSpeed(5, 5, 40, 0.4, "up")).toThrow(/5/);
  });
});

describe("wrapOffset", () => {
  it("mantem o offset em (-altura, 0]", () => {
    expect(wrapOffset(-250, 100)).toBeCloseTo(-50);
    expect(wrapOffset(30, 100)).toBeCloseTo(-70);
    expect(wrapOffset(0, 100)).toBe(0);
    expect(wrapOffset(-100, 100)).toBe(0);
  });
});

describe("medidas", () => {
  it("listHeight soma altura e espaco por linha", () => {
    expect(listHeight(4, 132, 18)).toBe(600);
  });

  it("rowsNeeded nunca cai abaixo de 4 e cresce com a area", () => {
    expect(rowsNeeded(0, 132, 18)).toBe(4);
    expect(rowsNeeded(2000, 132, 18)).toBeGreaterThan(4);
  });
});

describe("fadeMask", () => {
  it("sem esmaecer nao ha mascara", () => {
    expect(fadeMask(0)).toBeUndefined();
  });
  it("parada interna segue (1 - fade) * 60%", () => {
    expect(fadeMask(0.5)).toContain("black 30%");
    expect(fadeMask(0.5)).toContain("transparent");
  });
});

describe("planeTransform", () => {
  it("compoe translateZ e rotacoes na ordem da spec", () => {
    expect(planeTransform({ depth: 120, tilt: 16, turn: -14, roll: 0 }, 2, 3)).toBe(
      "translateZ(-120px) rotateX(18deg) rotateY(-11deg) rotateZ(0deg)"
    );
  });
});

describe("validateDriftOptions", () => {
  const ok = { itemCount: 3, columns: 5, variance: 0.45, fade: 0.6, dim: 0.55 };
  it("aceita opcoes validas", () => {
    expect(() => validateDriftOptions(ok)).not.toThrow();
  });
  it("rejeita items vazio", () => {
    expect(() => validateDriftOptions({ ...ok, itemCount: 0 })).toThrow(/items/);
  });
  it("rejeita columns fora de 1..12", () => {
    expect(() => validateDriftOptions({ ...ok, columns: 0 })).toThrow(/0/);
    expect(() => validateDriftOptions({ ...ok, columns: 13 })).toThrow(/13/);
    expect(() => validateDriftOptions({ ...ok, columns: 2.5 })).toThrow(/2.5/);
  });
  it("rejeita variance, fade e dim fora de 0..1", () => {
    expect(() => validateDriftOptions({ ...ok, variance: 1.2 })).toThrow(/variance.*1.2/);
    expect(() => validateDriftOptions({ ...ok, fade: -0.1 })).toThrow(/fade.*-0.1/);
    expect(() => validateDriftOptions({ ...ok, dim: 2 })).toThrow(/dim.*2/);
  });
});
