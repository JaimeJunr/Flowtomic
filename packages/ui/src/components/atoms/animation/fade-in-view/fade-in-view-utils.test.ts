import { describe, expect, it } from "vitest";
import { disappearTimerSeconds, fadeVariants } from "./fade-in-view-utils";

const base = {
  blur: false,
  initialOpacity: 0,
  duration: 0.8,
  delay: 0.2,
  ease: "easeOut" as const,
  disappearDuration: 0.5,
  disappearEase: "easeIn" as const,
};

describe("fadeVariants", () => {
  it("sem blur não define filter", () => {
    const v = fadeVariants(base);
    expect(v.hidden.opacity).toBe(0);
    expect(v.hidden.filter).toBeUndefined();
    expect(v.shown).toMatchObject({
      opacity: 1,
      transition: { duration: 0.8, delay: 0.2, ease: "easeOut" },
    });
    expect(v.gone).toMatchObject({
      opacity: 0,
      transition: { duration: 0.5, ease: "easeIn" },
    });
  });

  it("com blur desfoca o estado oculto e limpa no exibido", () => {
    const v = fadeVariants({ ...base, blur: true });
    expect(v.hidden.filter).toBe("blur(10px)");
    expect(v.shown.filter).toBe("blur(0px)");
  });

  it("respeita initialOpacity", () => {
    expect(fadeVariants({ ...base, initialOpacity: 0.3 }).hidden.opacity).toBe(0.3);
  });
});

describe("disappearTimerSeconds", () => {
  it("soma delay, duração e espera", () => {
    expect(disappearTimerSeconds(0.2, 0.8, 3)).toBeCloseTo(4);
  });
});
