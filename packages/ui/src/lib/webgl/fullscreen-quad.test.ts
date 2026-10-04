import { describe, expect, it, vi } from "vitest";
import { drawFullscreenQuad, FULLSCREEN_VERTEX_SHADER } from "./fullscreen-quad";

describe("fullscreen quad", () => {
  it("draws a single triangle without buffers", () => {
    const gl = { TRIANGLES: 4, drawArrays: vi.fn() };
    drawFullscreenQuad(gl as unknown as WebGL2RenderingContext);
    expect(gl.drawArrays).toHaveBeenCalledTimes(1);
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLES, 0, 3);
  });
  it("uses GLSL 300 es, vertex IDs and UV output", () => {
    expect(FULLSCREEN_VERTEX_SHADER).toMatch(/^#version 300 es/);
    expect(FULLSCREEN_VERTEX_SHADER).toContain("gl_VertexID");
    expect(FULLSCREEN_VERTEX_SHADER).toContain("out vec2 vUv;");
    expect(FULLSCREEN_VERTEX_SHADER).toContain("gl_Position");
  });
});
