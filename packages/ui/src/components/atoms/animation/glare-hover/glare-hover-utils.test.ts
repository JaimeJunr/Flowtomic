import { describe, expect, it } from "vitest";
import { glareColorMix, glareGradient, sweepTransition } from "./glare-hover-utils";

describe("glareGradient", () => {
  it("inclui o ângulo e o color-mix com a opacidade, sem hex nem rgb", () => {
    const css = glareGradient(-45, "var(--background)", 0.5);
    expect(css).toContain("linear-gradient(-45deg");
    expect(css).toContain("color-mix(in oklab, var(--background) 50%, transparent)");
    expect(css).not.toMatch(/#[0-9a-f]{3,6}|rgb\(/i);
  });

  it("arredonda a opacidade para porcentagem inteira", () => {
    expect(glareColorMix("var(--primary)", 0.333)).toContain("var(--primary) 33%");
  });

  it("recusa opacidade fora de 0..1 informando o valor recebido", () => {
    expect(() => glareGradient(0, "var(--background)", 1.5)).toThrow(/received 1\.5.*0 to 1/);
    expect(() => glareColorMix("var(--background)", Number.NaN)).toThrow(/received NaN/);
  });
});

describe("sweepTransition", () => {
  it("anima só background-position pela duração", () => {
    expect(sweepTransition(650)).toBe("background-position 650ms ease");
  });
});
