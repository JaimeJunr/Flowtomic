import { describe, expect, it, vi } from "vitest";
import { compileProgram } from "./compile-program";

class FakeGl {
  VERTEX_SHADER = 35633;
  FRAGMENT_SHADER = 35632;
  COMPILE_STATUS = 35713;
  LINK_STATUS = 35714;
  vertex = { kind: "vertex" };
  fragment = { kind: "fragment" };
  program = {};
  createShader = vi.fn((type: number) =>
    type === this.VERTEX_SHADER ? this.vertex : this.fragment
  );
  shaderSource = vi.fn();
  compileShader = vi.fn();
  getShaderParameter = vi.fn(() => true);
  getShaderInfoLog = vi.fn((): string | null => "shader failed");
  deleteShader = vi.fn();
  createProgram = vi.fn(() => this.program);
  attachShader = vi.fn();
  linkProgram = vi.fn();
  getProgramParameter = vi.fn(() => true);
  getProgramInfoLog = vi.fn((): string | null => "link failed");
  deleteProgram = vi.fn();
  get context() {
    return this as unknown as WebGL2RenderingContext;
  }
}

describe("compileProgram", () => {
  it("compiles, links and deletes both shaders", () => {
    const gl = new FakeGl();
    expect(compileProgram(gl.context, "vertex", "fragment")).toBe(gl.program);
    expect(gl.shaderSource.mock.calls).toEqual([
      [gl.vertex, "vertex"],
      [gl.fragment, "fragment"],
    ]);
    expect(gl.compileShader.mock.calls).toEqual([[gl.vertex], [gl.fragment]]);
    expect(gl.attachShader.mock.calls).toEqual([
      [gl.program, gl.vertex],
      [gl.program, gl.fragment],
    ]);
    expect(gl.linkProgram).toHaveBeenCalledWith(gl.program);
    expect(gl.deleteShader.mock.calls).toEqual([[gl.vertex], [gl.fragment]]);
    expect(gl.deleteProgram).not.toHaveBeenCalled();
  });
  it.each([1, 2])("reports compilation log and cleans up at shader %s", (failureAt) => {
    const gl = new FakeGl();
    if (failureAt === 2) gl.getShaderParameter.mockReturnValueOnce(true);
    gl.getShaderParameter.mockReturnValue(false);
    expect(() => compileProgram(gl.context, "vertex", "fragment")).toThrow(/shader failed/);
    expect(gl.deleteShader).toHaveBeenCalledTimes(failureAt);
  });
  it("reports the link log and deletes all resources", () => {
    const gl = new FakeGl();
    gl.getProgramParameter.mockReturnValue(false);
    expect(() => compileProgram(gl.context, "vertex", "fragment")).toThrow(/link failed/);
    expect(gl.deleteShader).toHaveBeenCalledTimes(2);
    expect(gl.deleteProgram).toHaveBeenCalledWith(gl.program);
  });
  it("reports absent shader allocation", () => {
    const gl = new FakeGl();
    gl.createShader.mockReturnValue(null as unknown as typeof gl.vertex);
    expect(() => compileProgram(gl.context, "vertex", "fragment")).toThrow(/null.*WebGLShader/);
  });
  it("reports absent program allocation and frees shaders", () => {
    const gl = new FakeGl();
    gl.createProgram.mockReturnValue(null as unknown as WebGLProgram);
    expect(() => compileProgram(gl.context, "vertex", "fragment")).toThrow(/null.*WebGLProgram/);
    expect(gl.deleteShader).toHaveBeenCalledTimes(2);
  });
  it.each(["shader", "program"])("handles an empty %s log", (kind) => {
    const gl = new FakeGl();
    if (kind === "shader") {
      gl.getShaderParameter.mockReturnValue(false);
      gl.getShaderInfoLog.mockReturnValue(null);
    } else {
      gl.getProgramParameter.mockReturnValue(false);
      gl.getProgramInfoLog.mockReturnValue(null);
    }
    expect(() => compileProgram(gl.context, "vertex", "fragment")).toThrow(
      /no info log.*expected/i
    );
  });
});
