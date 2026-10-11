import { describe, expect, it } from "vitest";
import { closestEdge, repeatsFor } from "./marquee-menu-utils";

describe("closestEdge", () => {
  it("devolve top perto do topo", () => {
    expect(closestEdge(10, 100)).toBe("top");
  });

  it("devolve bottom perto da base", () => {
    expect(closestEdge(90, 100)).toBe("bottom");
  });

  it("desempata para top", () => {
    expect(closestEdge(50, 100)).toBe("top");
  });
});

describe("repeatsFor", () => {
  it("cobre duas larguras do item", () => {
    expect(repeatsFor(1000, 100)).toBe(20);
    expect(repeatsFor(1001, 100)).toBe(21);
  });

  it("nunca devolve menos de 4", () => {
    expect(repeatsFor(100, 400)).toBe(4);
  });

  it("lança erro com unitWidth inválido", () => {
    expect(() => repeatsFor(500, 0)).toThrow(/unitWidth.*0.*maior que 0/);
    expect(() => repeatsFor(500, -3)).toThrow(/-3/);
  });
});
