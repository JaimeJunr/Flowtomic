import { describe, expect, it } from "vitest";
import { assertCodeLength, drainDelays, landingDelays } from "./cascade-code-input-utils";

describe("landingDelays", () => {
  it("um dígito novo pousa sem atraso", () => {
    expect(landingDelays("12", "123", 20)).toEqual({ 2: 0 });
  });

  it("colar o código inteiro escalona 0, 20, ... 100", () => {
    expect(landingDelays("", "123456", 20)).toEqual({ 0: 0, 1: 20, 2: 40, 3: 60, 4: 80, 5: 100 });
  });

  it("sem mudança ou só remoção devolve vazio", () => {
    expect(landingDelays("123", "123", 20)).toEqual({});
    expect(landingDelays("123", "12", 20)).toEqual({});
  });

  it("só conta as casas que mudaram para cheias", () => {
    expect(landingDelays("12", "1999", 10)).toEqual({ 2: 0, 3: 10 });
  });
});

describe("drainDelays", () => {
  it("esvazia da última para a primeira", () => {
    expect(drainDelays(3, 20)).toEqual([40, 20, 0]);
  });
});

describe("assertCodeLength", () => {
  it("aceita inteiro positivo", () => {
    expect(() => assertCodeLength(6)).not.toThrow();
  });

  it("recusa valor inválido citando o recebido e o esperado", () => {
    expect(() => assertCodeLength(0)).toThrow(/received length 0.*expected/);
    expect(() => assertCodeLength(2.5)).toThrow(/received length 2\.5/);
  });
});
