import { describe, expect, it } from "vitest";
import {
  assertBounciness,
  assertItemCount,
  entrySpring,
  focusPose,
  restPose,
  stackOrder,
} from "./fan-cards-utils";

const opts = { spread: 85, rotation: 10, arc: 20 };

describe("restPose", () => {
  it("o cartão do meio fica em x 0 e y 0", () => {
    const pose = restPose(2, 5, opts);
    expect(pose.x).toBe(0);
    expect(pose.y).toBe(0);
  });

  it("x é simétrico em volta do meio", () => {
    expect(restPose(0, 5, opts).x).toBe(-restPose(4, 5, opts).x);
    expect(restPose(1, 5, opts).x).toBe(-85);
  });

  it("arc desce as pontas e não mexe no meio", () => {
    expect(restPose(0, 5, opts).y).toBe(20);
    expect(restPose(4, 5, opts).y).toBe(20);
    expect(restPose(2, 5, { ...opts, arc: -20 }).y).toBe(0);
    expect(restPose(0, 5, { ...opts, arc: -20 }).y).toBe(-20);
  });

  it("é determinístico", () => {
    expect(restPose(3, 7, opts)).toEqual(restPose(3, 7, opts));
  });

  it("com um único cartão não divide por zero", () => {
    expect(restPose(0, 1, opts)).toEqual({ x: 0, y: 0, rotate: -10 });
  });
});

describe("focusPose", () => {
  const rest = (i: number) => restPose(i, 5, opts);

  it("sem foco devolve o repouso", () => {
    expect(focusPose(1, null, rest(1), 160)).toEqual(rest(1));
  });

  it("o focado zera rotação e y e mantém x", () => {
    const pose = focusPose(0, 0, rest(0), 160);
    expect(pose).toEqual({ x: rest(0).x, y: 0, rotate: 0 });
  });

  it("vizinhos se afastam para os lados", () => {
    expect(focusPose(1, 2, rest(1), 160).x).toBe(rest(1).x - 160);
    expect(focusPose(3, 2, rest(3), 160).x).toBe(rest(3).x + 160);
  });

  it("os outros mantêm rotação e y de repouso", () => {
    const pose = focusPose(4, 2, rest(4), 160);
    expect(pose.rotate).toBe(rest(4).rotate);
    expect(pose.y).toBe(rest(4).y);
  });
});

describe("stackOrder", () => {
  it("o meio fica na frente em repouso", () => {
    expect(stackOrder(2, 5, null)).toBeGreaterThan(stackOrder(1, 5, null));
    expect(stackOrder(1, 5, null)).toBeGreaterThan(stackOrder(0, 5, null));
  });

  it("o focado fica acima de todos", () => {
    expect(stackOrder(0, 5, 0)).toBeGreaterThan(stackOrder(2, 5, 0));
  });
});

describe("entrySpring", () => {
  it("interpola o amortecimento de 26 a 9", () => {
    expect(entrySpring(0).damping).toBe(26);
    expect(entrySpring(1).damping).toBe(9);
    expect(entrySpring(0.5).stiffness).toBe(260);
  });
});

describe("validação", () => {
  it("assertItemCount informa o valor recebido", () => {
    expect(() => assertItemCount(0)).toThrow(/received 0/);
    expect(() => assertItemCount(13)).toThrow(/received 13/);
    expect(() => assertItemCount(12)).not.toThrow();
  });

  it("assertBounciness informa o valor recebido", () => {
    expect(() => assertBounciness(1.2)).toThrow(/received 1.2/);
    expect(() => assertBounciness(-0.1)).toThrow(/received -0.1/);
    expect(() => assertBounciness(0)).not.toThrow();
  });
});
