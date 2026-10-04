export function createGlContext(
  canvas: HTMLCanvasElement,
  options?: WebGLContextAttributes
): WebGL2RenderingContext | null {
  try {
    return canvas.getContext("webgl2", options);
  } catch {
    return null;
  }
}
