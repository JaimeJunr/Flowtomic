import { describe, expect, it, vi } from "vitest";
import { createGlContext } from "./create-gl-context";

describe("createGlContext", () => {
  it("returns null in jsdom", () => {
    expect(createGlContext(document.createElement("canvas"))).toBeNull();
  });
  it("returns null when getContext throws", () => {
    const spy = vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(() => {
      throw new Error("unavailable");
    });
    try {
      expect(createGlContext(document.createElement("canvas"))).toBeNull();
    } finally {
      spy.mockRestore();
    }
  });
  it("requests WebGL2 with the supplied options", () => {
    const context = {} as WebGL2RenderingContext;
    const spy = vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(context);
    const canvas = document.createElement("canvas");
    const options = { alpha: false };
    try {
      expect(createGlContext(canvas, options)).toBe(context);
      expect(spy).toHaveBeenCalledWith("webgl2", options);
    } finally {
      spy.mockRestore();
    }
  });
});
