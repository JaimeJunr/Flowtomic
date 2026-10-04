export function compileProgram(
  gl: WebGL2RenderingContext,
  vertexSource: string,
  fragmentSource: string
): WebGLProgram {
  const shaders: WebGLShader[] = [];
  let program: WebGLProgram | null = null;
  try {
    for (const [type, source] of [
      [gl.VERTEX_SHADER, vertexSource],
      [gl.FRAGMENT_SHADER, fragmentSource],
    ] as const) {
      const shader = gl.createShader(type);
      if (!shader)
        throw new Error(
          `Received null for shader type ${type}; expected WebGLShader for source ${JSON.stringify(source)}`
        );
      shaders.push(shader);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw new Error(
          `Received shader compilation failure: ${gl.getShaderInfoLog(shader) ?? "no info log"}; expected valid GLSL source, received ${JSON.stringify(source)}`
        );
      }
    }
    program = gl.createProgram();
    if (!program) throw new Error("Received null; expected WebGLProgram");
    for (const shader of shaders) gl.attachShader(program, shader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(
        `Received program link failure: ${gl.getProgramInfoLog(program) ?? "no info log"}; expected compatible GLSL vertex and fragment sources ${JSON.stringify([vertexSource, fragmentSource])}`
      );
    }
    return program;
  } catch (error) {
    if (program) gl.deleteProgram(program);
    throw error;
  } finally {
    for (const shader of shaders) gl.deleteShader(shader);
  }
}
