// Tecido acetinado de uma cor: dobras diagonais com crista clara, vale escuro e grão fino.
// Saída pré-multiplicada, porque o contexto WebGL usa alpha padrão (aqui o alfa é 1).
export const SILK_WAVES_FRAGMENT_SHADER = `#version 300 es
precision highp float;
uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColor;
uniform float uSpeed;
uniform float uScale;
uniform float uRotation;
uniform float uGrain;
out vec4 fragColor;

void main() {
  vec2 p = (gl_FragCoord.xy - uResolution * 0.5) / uResolution.y;
  float c = cos(uRotation);
  float s = sin(uRotation);
  p = mat2(c, -s, s, c) * p / max(uScale, 0.001);
  float t = uTime * uSpeed * 0.15;
  // Dobras correm ao longo de x: com rotação 0 ficam deitadas, e o ângulo as inclina a partir daí.
  p.x += 0.12 * sin(p.y * 3.0 + t);
  float f = 0.5 + 0.5 * sin(p.y * 5.0 + 2.0 * sin(p.x * 2.0 + t * 0.6) + t);
  float shade = mix(0.45, 0.95, f) + pow(f, 8.0) * 0.18;
  // Grão estático por pixel; também quebra as faixas do gradiente longo.
  float noise = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5;
  vec3 color = uColor * shade + noise * uGrain * 0.08 + noise / 255.0;
  fragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}`;
