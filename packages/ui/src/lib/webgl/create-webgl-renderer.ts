import { compileProgram } from "./compile-program";
import { drawFullscreenQuad, FULLSCREEN_VERTEX_SHADER } from "./fullscreen-quad";

export type WebglRendererOptions = {
  fragmentShader: string;
  uniforms?: (gl: WebGL2RenderingContext, program: WebGLProgram, time: number) => void;
  paused: boolean;
  reducedMotion: boolean;
  onError: () => void;
};

export type WebglRenderer = {
  sync(): void;
  resize(): void;
  setVisible(visible: boolean): void;
  dispose(): void;
};

class CanvasRenderer implements WebglRenderer {
  private program: WebGLProgram | null = null;
  private source = "";
  private timeLocation: WebGLUniformLocation | null = null;
  private resolutionLocation: WebGLUniformLocation | null = null;
  private frameId: number | null = null;
  private startTime: number | undefined;
  private lastTime = 0;
  private visible = true;
  private staticDrawn = false;
  private needsRedraw = false;
  private initialized = false;
  private disposed = false;
  private resizeObserver: ResizeObserver | undefined;
  private intersectionObserver: IntersectionObserver | undefined;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly gl: WebGL2RenderingContext,
    private readonly getOptions: () => WebglRendererOptions
  ) {}

  initialize(source: string): boolean {
    if (!this.replaceProgram(source)) return false;
    this.observe();
    this.resize();
    this.needsRedraw = false;
    this.initialized = true;
    this.sync();
    return true;
  }

  private replaceProgram(source: string): boolean {
    try {
      const nextProgram = compileProgram(this.gl, FULLSCREEN_VERTEX_SHADER, source);
      if (this.program) this.gl.deleteProgram(this.program);
      this.program = nextProgram;
      this.source = source;
      this.timeLocation = this.gl.getUniformLocation(nextProgram, "uTime");
      this.resolutionLocation = this.gl.getUniformLocation(nextProgram, "uResolution");
      this.staticDrawn = false;
      this.needsRedraw = true;
      return true;
    } catch (error) {
      console.error(error);
      this.dispose();
      this.getOptions().onError();
      return false;
    }
  }

  private observe(): void {
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.intersectionObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === this.canvas) this.setVisible(entry.isIntersecting);
      }
    });
    this.resizeObserver.observe(this.canvas);
    this.intersectionObserver.observe(this.canvas);
  }

  private updateDimensions(): boolean {
    const { width, height } = this.canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio, 2);
    const pixelWidth = Math.max(1, Math.round(width * ratio));
    const pixelHeight = Math.max(1, Math.round(height * ratio));
    if (this.canvas.width === pixelWidth && this.canvas.height === pixelHeight) return false;
    if (this.canvas.width !== pixelWidth) this.canvas.width = pixelWidth;
    if (this.canvas.height !== pixelHeight) this.canvas.height = pixelHeight;
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    return true;
  }

  resize(): void {
    if (this.disposed || !this.updateDimensions()) return;
    // Mudar width/height apaga o buffer, inclusive quando a animação está parada.
    this.needsRedraw = true;
    if (this.initialized) this.sync();
  }

  private draw(time: number): void {
    // biome-ignore lint/correctness/useHookAtTopLevel: useProgram é método WebGL, não hook React.
    this.gl.useProgram(this.program);
    this.gl.uniform1f(this.timeLocation, time);
    this.gl.uniform2f(this.resolutionLocation, this.canvas.width, this.canvas.height);
    this.getOptions().uniforms?.(this.gl, this.program as WebGLProgram, time);
    drawFullscreenQuad(this.gl);
    this.lastTime = time;
    this.needsRedraw = false;
    this.staticDrawn = this.getOptions().reducedMotion;
  }

  private stop(): void {
    if (this.frameId === null) return;
    cancelAnimationFrame(this.frameId);
    this.frameId = null;
  }

  private animate = (timestamp: number): void => {
    this.frameId = null;
    const { paused, reducedMotion } = this.getOptions();
    if (this.disposed || paused || !this.visible || reducedMotion) return;
    this.startTime ??= timestamp;
    this.draw((timestamp - this.startTime) / 1000);
    this.scheduleFrame();
  };

  private scheduleFrame(): void {
    if (this.frameId === null) this.frameId = requestAnimationFrame(this.animate);
  }

  private restoreFrame(): void {
    const { paused, reducedMotion } = this.getOptions();
    if (reducedMotion && (!this.staticDrawn || this.needsRedraw)) this.draw(0);
    else if (paused && this.needsRedraw) this.draw(this.lastTime);
  }

  private updatePlayback(): void {
    const { paused, reducedMotion } = this.getOptions();
    if (!reducedMotion) this.staticDrawn = false;
    if (paused || !this.visible || reducedMotion) this.stop();
    if (!this.visible) return;
    if (paused || reducedMotion) this.restoreFrame();
    else this.scheduleFrame();
  }

  sync(): void {
    if (this.disposed) return;
    const { fragmentShader } = this.getOptions();
    if (this.source !== fragmentShader && !this.replaceProgram(fragmentShader)) return;
    this.updatePlayback();
  }

  setVisible(visible: boolean): void {
    this.visible = visible;
    this.sync();
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.stop();
    this.resizeObserver?.disconnect();
    this.intersectionObserver?.disconnect();
    if (this.program) this.gl.deleteProgram(this.program);
    this.gl.getExtension("WEBGL_lose_context")?.loseContext();
  }
}

export function createWebglRenderer(
  canvas: HTMLCanvasElement,
  gl: WebGL2RenderingContext,
  initialSource: string,
  getOptions: () => WebglRendererOptions
): WebglRenderer | null {
  const renderer = new CanvasRenderer(canvas, gl, getOptions);
  return renderer.initialize(initialSource) ? renderer : null;
}
