import { describe, expect, it } from "vitest";
import { filterItems, findTrigger, sparkLayout, typingEnergy } from "./prompt-input-extras-utils";

describe("findTrigger", () => {
  it("acha o gatilho no início do texto", () => {
    expect(findTrigger("@dr", 3, "@")).toEqual({ start: 0, query: "dr" });
  });

  it("acha o gatilho depois de espaço e de quebra de linha", () => {
    expect(findTrigger("oi @dr", 6, "@")).toEqual({ start: 3, query: "dr" });
    expect(findTrigger("oi\n/res", 7, "/")).toEqual({ start: 3, query: "res" });
  });

  it("ignora gatilho no meio de palavra", () => {
    expect(findTrigger("mail@dr", 7, "@")).toBeNull();
    expect(findTrigger("a/b", 3, "/")).toBeNull();
  });

  it("ignora quando a consulta tem espaço", () => {
    expect(findTrigger("@dr ive", 7, "@")).toBeNull();
  });

  it("usa só o texto até o cursor", () => {
    expect(findTrigger("@drive", 3, "@")).toEqual({ start: 0, query: "dr" });
  });

  it("devolve consulta vazia logo depois do gatilho", () => {
    expect(findTrigger("@", 1, "@")).toEqual({ start: 0, query: "" });
  });
});

describe("filterItems", () => {
  const items = [
    { key: "a", label: "Arquivos", description: "anexar do computador" },
    { key: "d", label: "Drive" },
    { key: "w", label: "Web", description: "Busca na internet" },
  ];

  it("filtra por rótulo sem acento e sem caixa", () => {
    expect(filterItems(items, "DR").map((i) => i.key)).toEqual(["d"]);
  });

  it("filtra por descrição ignorando acento", () => {
    expect(filterItems(items, "computádor").map((i) => i.key)).toEqual(["a"]);
    expect(filterItems(items, "INTERNÉT").map((i) => i.key)).toEqual(["w"]);
  });

  it("consulta vazia devolve todos", () => {
    expect(filterItems(items, "")).toHaveLength(3);
  });
});

describe("sparkLayout", () => {
  it("é determinístico e respeita a quantidade", () => {
    const a = sparkLayout(12, 7);
    expect(a).toHaveLength(12);
    expect(sparkLayout(12, 7)).toEqual(a);
    expect(sparkLayout(12, 8)).not.toEqual(a);
  });

  it("mantém posições dentro de 0–100%", () => {
    for (const spark of sparkLayout(14, 3)) {
      expect(spark.left).toBeGreaterThanOrEqual(0);
      expect(spark.left).toBeLessThanOrEqual(100);
      expect(spark.delay).toBeGreaterThanOrEqual(0);
      expect(spark.duration).toBeGreaterThan(0);
    }
  });
});

describe("typingEnergy", () => {
  it("sobe a cada tecla e fica limitada a 1", () => {
    let energy = 0;
    for (let i = 0; i < 20; i++) energy = typingEnergy(energy, 0, true);
    expect(energy).toBe(1);
  });

  it("decai com o tempo parado", () => {
    const start = 1;
    const later = typingEnergy(start, 1000, false);
    expect(later).toBeLessThan(start);
    expect(typingEnergy(start, 3000, false)).toBeLessThan(later);
    expect(typingEnergy(0, 500, false)).toBe(0);
  });
});
