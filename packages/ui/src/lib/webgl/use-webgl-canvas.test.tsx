import { act, cleanup, render, renderHook, screen } from "@testing-library/react";
import { MotionConfig } from "motion/react";
import { afterEach, beforeEach, describe, expect, it, type MockInstance, vi } from "vitest";
import { type UseWebglCanvasOptions, useWebglCanvas } from "./index";

class FakeGl {
  VERTEX_SHADER = 35633;
  FRAGMENT_SHADER = 35632;
  COMPILE_STATUS = 35713;
  LINK_STATUS = 35714;
  TRIANGLES = 4;
  program = {};
  createShader = vi.fn(() => ({}));
  shaderSource = vi.fn();
  compileShader = vi.fn();
  getShaderParameter = vi.fn(() => true);
  getShaderInfoLog = vi.fn(() => "bad shader");
  deleteShader = vi.fn();
  createProgram = vi.fn(() => this.program);
  attachShader = vi.fn();
  linkProgram = vi.fn();
  getProgramParameter = vi.fn(() => true);
  getProgramInfoLog = vi.fn(() => "bad link");
  deleteProgram = vi.fn();
  useProgram = vi.fn();
  getUniformLocation = vi.fn((_program: WebGLProgram, name: string) => ({ name }));
  uniform1f = vi.fn();
  uniform2f = vi.fn();
  viewport = vi.fn();
  drawArrays = vi.fn();
  loseContext = vi.fn();
  getExtension = vi.fn((): { loseContext: () => void } | null => ({
    loseContext: this.loseContext,
  }));
  get context() {
    return this as unknown as WebGL2RenderingContext;
  }
}

const fragmentShader =
  "#version 300 es\nprecision highp float; out vec4 color; void main() { color = vec4(1.0); }";
function CanvasDemo(options: UseWebglCanvasOptions) {
  const { canvasRef, isSupported } = useWebglCanvas(options);
  return <canvas ref={canvasRef} data-testid="canvas" data-supported={String(isSupported)} />;
}

let frames: Map<number, FrameRequestCallback>;
let nextId: number;
let requestSpy: MockInstance<typeof window.requestAnimationFrame>;
let cancelSpy: MockInstance<typeof window.cancelAnimationFrame>;
let contextSpy: MockInstance<HTMLCanvasElement["getContext"]> | undefined;
let rectSpy: MockInstance<HTMLCanvasElement["getBoundingClientRect"]>;
let originalDpr: number;

beforeEach(() => {
  frames = new Map();
  nextId = 0;
  requestSpy = vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
    frames.set(++nextId, callback);
    return nextId;
  });
  cancelSpy = vi.spyOn(window, "cancelAnimationFrame").mockImplementation((id) => {
    frames.delete(id);
  });
  rectSpy = vi
    .spyOn(HTMLCanvasElement.prototype, "getBoundingClientRect")
    .mockReturnValue({ width: 120, height: 80 } as DOMRect);
  originalDpr = window.devicePixelRatio;
  Object.defineProperty(window, "devicePixelRatio", { value: 3, configurable: true });
  vi.mocked(IntersectionObserver).mockClear();
  vi.mocked(ResizeObserver).mockClear();
});
afterEach(() => {
  cleanup();
  contextSpy?.mockRestore();
  contextSpy = undefined;
  requestSpy.mockRestore();
  cancelSpy.mockRestore();
  rectSpy.mockRestore();
  Object.defineProperty(window, "devicePixelRatio", { value: originalDpr, configurable: true });
});

function supportCanvas(gl = new FakeGl()): FakeGl {
  contextSpy = vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(gl.context);
  return gl;
}
function frame(time: number) {
  const entry = frames.entries().next().value;
  expect(entry).toBeDefined();
  if (!entry)
    throw new Error("Received no queued frame; expected a requestAnimationFrame callback");
  frames.delete(entry[0]);
  act(() => entry[1](time));
}
function visibility(visible: boolean) {
  const observerMock = vi.mocked(IntersectionObserver);
  const callback = observerMock.mock.calls[0][0];
  const observer = observerMock.mock.results[0].value as IntersectionObserver;
  act(() =>
    callback(
      [
        {
          isIntersecting: visible,
          target: screen.getByTestId("canvas"),
          boundingClientRect: new DOMRect(),
          intersectionRatio: visible ? 1 : 0,
          intersectionRect: new DOMRect(),
          rootBounds: null,
          time: 0,
        },
      ],
      observer
    )
  );
}
function resize() {
  const observerMock = vi.mocked(ResizeObserver);
  const callback = observerMock.mock.calls[0][0];
  act(() => callback([], observerMock.mock.results[0].value as ResizeObserver));
}

describe("useWebglCanvas", () => {
  it("reports unsupported in jsdom without throwing", () => {
    render(<CanvasDemo fragmentShader={fragmentShader} />);
    expect(screen.getByTestId("canvas")).toHaveAttribute("data-supported", "false");
    expect(requestSpy).not.toHaveBeenCalled();
    expect(ResizeObserver).not.toHaveBeenCalled();
    expect(IntersectionObserver).not.toHaveBeenCalled();
  });
  it("handles an unattached canvas ref", () => {
    const { result } = renderHook(() => useWebglCanvas({ fragmentShader }));
    expect(result.current.isSupported).toBe(false);
    expect(result.current.canvasRef.current).toBeNull();
  });
  it("draws exactly one static frame at time zero under reduced motion", () => {
    const gl = supportCanvas();
    const uniforms = vi.fn();
    render(
      <MotionConfig reducedMotion="always">
        <CanvasDemo fragmentShader={fragmentShader} uniforms={uniforms} />
      </MotionConfig>
    );
    expect(screen.getByTestId("canvas")).toHaveAttribute("data-supported", "true");
    expect(gl.drawArrays).toHaveBeenCalledTimes(1);
    expect(gl.uniform1f).toHaveBeenCalledWith({ name: "uTime" }, 0);
    expect(uniforms).toHaveBeenCalledWith(gl.context, gl.program, 0);
    expect(requestSpy).not.toHaveBeenCalled();
    visibility(false);
    visibility(true);
    expect(gl.drawArrays).toHaveBeenCalledTimes(1);
  });
  it("schedules frames when visible, sets uniforms and draws", () => {
    const gl = supportCanvas();
    const uniforms = vi.fn();
    render(<CanvasDemo fragmentShader={fragmentShader} uniforms={uniforms} />);
    expect(frames.size).toBe(1);
    frame(1000);
    frame(2500);
    expect(gl.uniform1f.mock.calls).toEqual([
      [{ name: "uTime" }, 0],
      [{ name: "uTime" }, 1.5],
    ]);
    expect(gl.uniform2f).toHaveBeenCalledWith({ name: "uResolution" }, 240, 160);
    expect(uniforms).toHaveBeenLastCalledWith(gl.context, gl.program, 1.5);
    expect(gl.useProgram).toHaveBeenCalledWith(gl.program);
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLES, 0, 3);
    expect(frames.size).toBe(1);
  });
  it("supports frames without a custom uniform callback", () => {
    const gl = supportCanvas();
    render(<CanvasDemo fragmentShader={fragmentShader} />);
    frame(0);
    expect(gl.drawArrays).toHaveBeenCalledTimes(1);
  });
  it("starts paused and resumes without replacing the context", () => {
    const gl = supportCanvas();
    const view = render(<CanvasDemo fragmentShader={fragmentShader} paused />);
    expect(requestSpy).not.toHaveBeenCalled();
    view.rerender(<CanvasDemo fragmentShader={fragmentShader} paused={false} />);
    expect(frames.size).toBe(1);
    view.rerender(<CanvasDemo fragmentShader={fragmentShader} paused />);
    expect(frames.size).toBe(0);
    expect(gl.drawArrays).not.toHaveBeenCalled();
    expect(contextSpy).toHaveBeenCalledTimes(1);
    expect(gl.loseContext).not.toHaveBeenCalled();
  });
  it("pauses off-screen and resumes on-screen without duplicate requests", () => {
    supportCanvas();
    render(<CanvasDemo fragmentShader={fragmentShader} />);
    visibility(true);
    expect(frames.size).toBe(1);
    visibility(false);
    expect(frames.size).toBe(0);
    visibility(true);
    expect(frames.size).toBe(1);
  });
  it("caps pixel ratio at two and updates the viewport on resize", () => {
    const gl = supportCanvas();
    render(<CanvasDemo fragmentShader={fragmentShader} />);
    const canvas = screen.getByTestId("canvas") as HTMLCanvasElement;
    expect([canvas.width, canvas.height]).toEqual([240, 160]);
    expect(gl.viewport).toHaveBeenCalledWith(0, 0, 240, 160);
    Object.defineProperty(window, "devicePixelRatio", { value: 1.5, configurable: true });
    rectSpy.mockReturnValue({ width: 100, height: 50 } as DOMRect);
    resize();
    expect([canvas.width, canvas.height]).toEqual([150, 75]);
    expect(gl.viewport).toHaveBeenLastCalledWith(0, 0, 150, 75);
  });
  it("clamps zero-sized canvas dimensions to one", () => {
    supportCanvas();
    rectSpy.mockReturnValue({ width: 0, height: 0 } as DOMRect);
    render(<CanvasDemo fragmentShader={fragmentShader} />);
    const canvas = screen.getByTestId("canvas") as HTMLCanvasElement;
    expect([canvas.width, canvas.height]).toEqual([1, 1]);
  });
  it("uses the latest uniform callback without restarting the loop", () => {
    supportCanvas();
    const first = vi.fn();
    const second = vi.fn();
    const view = render(<CanvasDemo fragmentShader={fragmentShader} uniforms={first} />);
    view.rerender(<CanvasDemo fragmentShader={fragmentShader} uniforms={second} />);
    frame(0);
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
    expect(requestSpy).toHaveBeenCalledTimes(2);
  });
  it("switches to reduced motion and back without losing the context", () => {
    const gl = supportCanvas();
    const view = render(
      <MotionConfig reducedMotion="never">
        <CanvasDemo fragmentShader={fragmentShader} />
      </MotionConfig>
    );
    frame(1000);
    view.rerender(
      <MotionConfig reducedMotion="always">
        <CanvasDemo fragmentShader={fragmentShader} />
      </MotionConfig>
    );
    expect(frames.size).toBe(0);
    expect(gl.drawArrays).toHaveBeenCalledTimes(2);
    expect(gl.uniform1f).toHaveBeenLastCalledWith({ name: "uTime" }, 0);
    view.rerender(
      <MotionConfig reducedMotion="never">
        <CanvasDemo fragmentShader={fragmentShader} />
      </MotionConfig>
    );
    expect(frames.size).toBe(1);
    expect(contextSpy).toHaveBeenCalledTimes(1);
  });
  it("replaces a changed shader program without losing the context", () => {
    const gl = supportCanvas();
    const view = render(<CanvasDemo fragmentShader={fragmentShader} />);
    view.rerender(<CanvasDemo fragmentShader={`${fragmentShader}\n// atualizado`} />);
    expect(gl.createProgram).toHaveBeenCalledTimes(2);
    expect(gl.deleteProgram).toHaveBeenCalledTimes(1);
    expect(gl.loseContext).not.toHaveBeenCalled();
    expect(contextSpy).toHaveBeenCalledTimes(1);
  });
  it("cancels frames, disconnects observers, deletes program and loses context on unmount", () => {
    const gl = supportCanvas();
    const view = render(<CanvasDemo fragmentShader={fragmentShader} />);
    const id = nextId;
    view.unmount();
    expect(cancelSpy).toHaveBeenCalledWith(id);
    expect(frames.size).toBe(0);
    const resizeObserver = vi.mocked(ResizeObserver).mock.results[0].value as ResizeObserver;
    const intersectionObserver = vi.mocked(IntersectionObserver).mock.results[0]
      .value as IntersectionObserver;
    expect(resizeObserver.disconnect).toHaveBeenCalledTimes(1);
    expect(intersectionObserver.disconnect).toHaveBeenCalledTimes(1);
    expect(gl.deleteProgram).toHaveBeenCalledWith(gl.program);
    expect(gl.getExtension).toHaveBeenCalledWith("WEBGL_lose_context");
    expect(gl.loseContext).toHaveBeenCalledTimes(1);
  });
  it("ignores queued callbacks after unmount", () => {
    const gl = supportCanvas();
    const view = render(<CanvasDemo fragmentShader={fragmentShader} />);
    const canvas = screen.getByTestId("canvas");
    const animate = frames.get(nextId);
    const intersectionCallback = vi.mocked(IntersectionObserver).mock.calls[0][0];
    const intersectionObserver = vi.mocked(IntersectionObserver).mock.results[0]
      .value as IntersectionObserver;
    const resizeCallback = vi.mocked(ResizeObserver).mock.calls[0][0];
    const resizeObserver = vi.mocked(ResizeObserver).mock.results[0].value as ResizeObserver;
    view.unmount();
    gl.viewport.mockClear();
    act(() => {
      animate?.(1000);
      intersectionCallback(
        [{ target: canvas, isIntersecting: true } as unknown as IntersectionObserverEntry],
        intersectionObserver
      );
      resizeCallback([], resizeObserver);
    });
    expect(gl.drawArrays).not.toHaveBeenCalled();
    expect(gl.viewport).not.toHaveBeenCalled();
    expect(frames.size).toBe(0);
  });
  it.each([
    "compile",
    "link",
  ])("uses fallback on initial %s failure without throwing", (failure) => {
    const gl = supportCanvas();
    if (failure === "compile") gl.getShaderParameter.mockReturnValue(false);
    else gl.getProgramParameter.mockReturnValue(false);
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      expect(() => render(<CanvasDemo fragmentShader={fragmentShader} />)).not.toThrow();
      expect(screen.getByTestId("canvas")).toHaveAttribute("data-supported", "false");
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(String(errorSpy.mock.calls[0][0])).toContain(
        failure === "compile" ? "bad shader" : "bad link"
      );
      expect(gl.loseContext).toHaveBeenCalledTimes(1);
      expect(requestSpy).not.toHaveBeenCalled();
    } finally {
      errorSpy.mockRestore();
    }
  });
  it.each([
    "compile",
    "link",
  ])("uses fallback on changed shader %s failure without throwing", (failure) => {
    const gl = supportCanvas();
    const view = render(<CanvasDemo fragmentShader={fragmentShader} />);
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    if (failure === "compile") gl.getShaderParameter.mockReturnValue(false);
    else gl.getProgramParameter.mockReturnValue(false);
    try {
      expect(() =>
        view.rerender(<CanvasDemo fragmentShader={`${fragmentShader}\n`} />)
      ).not.toThrow();
      expect(screen.getByTestId("canvas")).toHaveAttribute("data-supported", "false");
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(String(errorSpy.mock.calls[0][0])).toContain(
        failure === "compile" ? "bad shader" : "bad link"
      );
      expect(gl.loseContext).toHaveBeenCalledTimes(1);
      expect(frames.size).toBe(0);
      view.rerender(<CanvasDemo fragmentShader={fragmentShader} />);
      view.unmount();
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(gl.loseContext).toHaveBeenCalledTimes(1);
    } finally {
      errorSpy.mockRestore();
    }
  });
  it("redraws a static frame after a size change under reduced motion", () => {
    const gl = supportCanvas();
    render(
      <MotionConfig reducedMotion="always">
        <CanvasDemo fragmentShader={fragmentShader} />
      </MotionConfig>
    );
    rectSpy.mockReturnValue({ width: 200, height: 100 } as DOMRect);
    resize();
    expect(gl.drawArrays).toHaveBeenCalledTimes(2);
    expect(gl.uniform1f).toHaveBeenLastCalledWith({ name: "uTime" }, 0);
    expect(gl.uniform2f).toHaveBeenLastCalledWith({ name: "uResolution" }, 400, 200);
    expect(frames.size).toBe(0);
    resize();
    expect(gl.drawArrays).toHaveBeenCalledTimes(2);
  });
  it("redraws the last drawn time after a size change while paused", () => {
    const gl = supportCanvas();
    const view = render(<CanvasDemo fragmentShader={fragmentShader} />);
    frame(1000);
    frame(2500);
    view.rerender(<CanvasDemo fragmentShader={fragmentShader} paused />);
    rectSpy.mockReturnValue({ width: 200, height: 100 } as DOMRect);
    resize();
    expect(gl.drawArrays).toHaveBeenCalledTimes(3);
    expect(gl.uniform1f).toHaveBeenLastCalledWith({ name: "uTime" }, 1.5);
    expect(frames.size).toBe(0);
  });
  it.each(["reduced", "paused"])("defers %s resize redraw until visible", (mode) => {
    const gl = supportCanvas();
    const view = render(
      <MotionConfig reducedMotion={mode === "reduced" ? "always" : "never"}>
        <CanvasDemo fragmentShader={fragmentShader} />
      </MotionConfig>
    );
    if (mode === "paused") {
      frame(1000);
      frame(2500);
      view.rerender(
        <MotionConfig reducedMotion="never">
          <CanvasDemo fragmentShader={fragmentShader} paused />
        </MotionConfig>
      );
    }
    const count = gl.drawArrays.mock.calls.length;
    visibility(false);
    rectSpy.mockReturnValue({ width: 200, height: 100 } as DOMRect);
    resize();
    expect(gl.drawArrays).toHaveBeenCalledTimes(count);
    visibility(true);
    expect(gl.drawArrays).toHaveBeenCalledTimes(count + 1);
    expect(gl.uniform1f).toHaveBeenLastCalledWith({ name: "uTime" }, mode === "reduced" ? 0 : 1.5);
    expect(frames.size).toBe(0);
  });
  it("cleans up when the lose-context extension is absent", () => {
    const gl = supportCanvas();
    gl.getExtension.mockReturnValue(null);
    const view = render(<CanvasDemo fragmentShader={fragmentShader} paused />);
    expect(() => view.unmount()).not.toThrow();
    expect(cancelSpy).not.toHaveBeenCalled();
    expect(gl.deleteProgram).toHaveBeenCalledTimes(1);
  });
});
