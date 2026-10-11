import { describe, expect, it } from "vitest";
import { CLOSE_DURATION, layerTone, openSchedule } from "./layered-menu-utils";

describe("openSchedule", () => {
  it("escalona camadas de 0,07 s em 0,07 s", () => {
    const s = openSchedule(3, 2);
    expect(s.layer).toHaveLength(3);
    expect(s.layer[0]).toBeCloseTo(0);
    expect(s.layer[1]).toBeCloseTo(0.07);
    expect(s.layer[2]).toBeCloseTo(0.14);
  });

  it("põe o painel logo depois da última camada", () => {
    expect(openSchedule(2, 1).panel).toBeCloseTo(0.14);
    expect(openSchedule(3, 1).panel).toBeCloseTo(0.21);
  });

  it("começa o primeiro item 0,15 s depois do painel e espaça 0,08 s", () => {
    const s = openSchedule(2, 3);
    expect(s.items[0]).toBeCloseTo(s.panel + 0.15);
    expect(s.items[1]).toBeCloseTo(s.panel + 0.23);
    expect(s.items[2]).toBeCloseTo(s.panel + 0.31);
  });

  it("deixa os links por último, 0,1 s depois do último item", () => {
    const s = openSchedule(2, 4);
    expect(s.links).toBeCloseTo(s.items[3] + 0.1);
  });

  it("mantém camadas, painel, itens e links em ordem crescente", () => {
    const s = openSchedule(3, 5);
    const sequence = [...s.layer, s.panel, ...s.items, s.links];
    expect(sequence).toEqual([...sequence].sort((a, b) => a - b));
    expect(new Set(sequence).size).toBe(sequence.length);
  });

  it("recusa camadas inválidas dizendo o valor recebido e o esperado", () => {
    expect(() => openSchedule(0, 2)).toThrow(/0/);
    expect(() => openSchedule(0, 2)).toThrow(/1, 2 ou 3/);
    expect(() => openSchedule(4, 2)).toThrow(/4/);
  });

  it("recusa lista de itens vazia dizendo o valor recebido e o esperado", () => {
    expect(() => openSchedule(2, 0)).toThrow(/0/);
    expect(() => openSchedule(2, 0)).toThrow(/pelo menos 1/);
  });
});

describe("layerTone", () => {
  it("usa só tokens semânticos, da mais forte à mais suave", () => {
    expect(layerTone(0)).toBe("bg-primary");
    expect(layerTone(1)).toBe("bg-primary/60");
    expect(layerTone(2)).toBe("bg-muted");
  });

  it("recusa índice fora da faixa", () => {
    expect(() => layerTone(3)).toThrow(/3/);
  });
});

describe("CLOSE_DURATION", () => {
  it("fecha em 0,3 s", () => {
    expect(CLOSE_DURATION).toBe(0.3);
  });
});
