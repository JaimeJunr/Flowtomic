import { describe, expect, it } from "vitest";
import {
  closedPaperTransform,
  frontTransform,
  magnetOffset,
  paperPose,
  paperPoseTransform,
  paperSize,
} from "./paper-folder-utils";

describe("paperPose", () => {
  it("usa leque de tres folhas", () => {
    expect(paperPose(0, 3)).toEqual({ x: -120, y: -70, rotate: -15 });
    expect(paperPose(1, 3)).toEqual({ x: 10, y: -70, rotate: 15 });
    expect(paperPose(2, 3)).toEqual({ x: -50, y: -100, rotate: 5 });
  });

  it("com duas folhas usa as duas primeiras poses", () => {
    expect(paperPose(0, 2)).toEqual({ x: -120, y: -70, rotate: -15 });
    expect(paperPose(1, 2)).toEqual({ x: 10, y: -70, rotate: 15 });
  });

  it("com uma folha usa só a pose do meio", () => {
    expect(paperPose(0, 1)).toEqual({ x: -50, y: -100, rotate: 5 });
  });

  it("lança erro com o índice recebido", () => {
    expect(() => paperPose(3, 3)).toThrow(/received 3/);
    expect(() => paperPose(-1, 2)).toThrow(/received -1/);
  });
});

describe("transformações", () => {
  it("monta a transform da folha aberta e fechada", () => {
    expect(paperPoseTransform({ x: -120, y: -70, rotate: -15 })).toBe(
      "translate(-120%, -70%) rotate(-15deg)"
    );
    expect(closedPaperTransform(false)).toBe("translate(-50%, 10%)");
    expect(closedPaperTransform(true)).toBe("translate(-50%, -10%)");
  });

  it("calcula a transform da frente por estado", () => {
    expect(frontTransform("closed")).toBe("none");
    expect(frontTransform("hover")).toBe("skew(7.5deg) scaleY(0.8)");
    expect(frontTransform("open")).toBe("skew(15deg) scaleY(0.6)");
  });

  it("dimensiona as folhas por posição", () => {
    expect(paperSize(0, 3)).toEqual({ width: 70, height: 80 });
    expect(paperSize(1, 3)).toEqual({ width: 80, height: 70 });
    expect(paperSize(2, 3)).toEqual({ width: 90, height: 60 });
    expect(paperSize(0, 1)).toEqual({ width: 80, height: 70 });
  });
});

describe("magnetOffset", () => {
  const rect = { left: 100, top: 100, width: 100, height: 60 };

  it("no centro não desloca", () => {
    expect(magnetOffset(rect, 150, 130, 0.15)).toEqual({ x: 0, y: 0 });
  });

  it("na borda direita desloca proporcional à força", () => {
    expect(magnetOffset(rect, 200, 130, 0.15)).toEqual({ x: 7.5, y: 0 });
    expect(magnetOffset(rect, 200, 130, 0.3).x).toBe(15);
  });

  it("lança erro com rect sem área", () => {
    expect(() => magnetOffset({ left: 0, top: 0, width: 0, height: 10 }, 1, 1, 0.15)).toThrow(
      /received/
    );
  });
});
