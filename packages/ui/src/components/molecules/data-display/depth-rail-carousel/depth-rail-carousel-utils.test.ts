import { describe, expect, it } from "vitest";
import {
  assertCarouselOptions,
  cycleOffset,
  type RailPoseOptions,
  railPose,
  stepIndex,
} from "./depth-rail-carousel-utils";

const opts: RailPoseOptions = {
  side: "right",
  cardWidth: 300,
  depth: 220,
  spread: 90,
  tilt: 22,
  falloff: 0.2,
  blur: 6,
  visibleCards: 4,
};

describe("railPose", () => {
  it("deixa o cartão em foco na origem, nítido e sem véu", () => {
    const pose = railPose(0, opts);
    expect(pose).toMatchObject({
      x: 0,
      z: 0,
      rotateY: 0,
      veil: 0,
      blur: 0,
      opacity: 1,
      zIndex: 100,
    });
  });

  it("recua, desloca, gira, escurece e desfoca conforme o offset cresce", () => {
    const one = railPose(1, opts);
    const two = railPose(2, opts);
    expect(one.x).toBe(90);
    expect(one.z).toBe(-220);
    expect(one.rotateY).toBe(-22);
    expect(one.veil).toBeCloseTo(0.2);
    expect(one.blur).toBeCloseTo(2.4);
    expect(two.x).toBeGreaterThan(one.x);
    expect(two.z).toBeLessThan(one.z);
    expect(two.veil).toBeGreaterThan(one.veil);
    expect(two.blur).toBeGreaterThan(one.blur);
    expect(two.zIndex).toBeLessThan(one.zIndex);
  });

  it("limita a rotação a 3 passos e o blur ao máximo", () => {
    const far = railPose(6, { ...opts, visibleCards: 8 });
    expect(far.rotateY).toBe(-66);
    expect(far.blur).toBe(6);
    expect(far.veil).toBe(1);
  });

  it("tira de cena o cartão que já passou, pelo lado oposto", () => {
    const passed = railPose(-1, opts);
    expect(passed.opacity).toBe(0);
    expect(passed.x).toBeCloseTo(-330);
    expect(passed.rotateY).toBe(22);
  });

  it("espelha tudo com side left", () => {
    const right = railPose(2, opts);
    const left = railPose(2, { ...opts, side: "left" });
    expect(left.x).toBe(-right.x);
    expect(left.rotateY).toBe(-right.rotateY);
    expect(left.z).toBe(right.z);
    expect(railPose(-1, { ...opts, side: "left" }).x).toBeCloseTo(330);
  });

  it("apaga o cartão a partir de visibleCards", () => {
    expect(railPose(3, opts).opacity).toBe(1);
    expect(railPose(4, opts).opacity).toBe(0);
  });
});

describe("cycleOffset", () => {
  it("é linear sem loop e pode ficar negativo", () => {
    expect(cycleOffset(0, 2, 5, false)).toBe(-2);
    expect(cycleOffset(4, 2, 5, false)).toBe(2);
  });

  it("dá a volta com loop", () => {
    expect(cycleOffset(0, 2, 5, true)).toBe(3);
    expect(cycleOffset(2, 2, 5, true)).toBe(0);
  });
});

describe("stepIndex", () => {
  it("trava nas pontas sem loop", () => {
    expect(stepIndex(0, -1, 3, false)).toBe(0);
    expect(stepIndex(2, 1, 3, false)).toBe(2);
  });

  it("dá a volta com loop", () => {
    expect(stepIndex(0, -1, 3, true)).toBe(2);
    expect(stepIndex(2, 1, 3, true)).toBe(0);
  });
});

describe("assertCarouselOptions", () => {
  it("rejeita items vazio citando o valor recebido", () => {
    expect(() => assertCarouselOptions({ count: 0, visibleCards: 4, falloff: 0.2 })).toThrow(
      /items.*pelo menos 1.*0/
    );
  });

  it("rejeita visibleCards fora de 1..8", () => {
    expect(() => assertCarouselOptions({ count: 3, visibleCards: 9, falloff: 0.2 })).toThrow(
      /visibleCards.*1.*8.*9/
    );
    expect(() => assertCarouselOptions({ count: 3, visibleCards: 0, falloff: 0.2 })).toThrow(
      /visibleCards/
    );
  });

  it("rejeita falloff fora de 0..1", () => {
    expect(() => assertCarouselOptions({ count: 3, visibleCards: 4, falloff: 1.5 })).toThrow(
      /falloff.*0.*1.*1.5/
    );
  });

  it("aceita opções válidas", () => {
    expect(() => assertCarouselOptions({ count: 1, visibleCards: 1, falloff: 0 })).not.toThrow();
  });
});
