// Feixes de fios de luz que flutuam em curvas suaves, com gradiente de cor ao longo do fio.
// Saída pré-multiplicada (alfa = maior canal), para compor sobre a página nos dois temas.
export const DRIFT_LINES_FRAGMENT_SHADER = `#version 300 es
precision highp float;
uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uWaves;
uniform float uLineCount;
uniform float uLineGap;
uniform float uSpeed;
uniform float uBend;
uniform vec2 uPointer;
uniform float uPointerStrength;
out vec4 fragColor;

// Soma o brilho dos fios de um feixe; (y0, incl) fixam centro e inclinação.
vec3 beam(vec2 p, vec2 pointer, float aspect, float t, float y0, float incl) {
  float n = uLineCount;
  float mid = (n - 1.0) * 0.5;
  float blend = smoothstep(-aspect, aspect, p.x + 0.3 * sin(t * 0.2 + y0));
  vec3 tint = mix(uColor1, uColor2, blend);
  float glow = 0.0;
  for (int i = 0; i < 12; i++) {
    if (float(i) >= n) break;
    float fi = float(i);
    float y = y0 + incl * p.x
      + 0.18 * sin(p.x * 1.4 + t * 0.5 + fi * 0.15)
      + 0.06 * sin(p.x * 3.1 - t * 0.8 + fi * 0.4)
      + (fi - mid) * 0.025 * uLineGap;
    vec2 off = vec2(p.x, y) - pointer;
    y += uBend * 0.15 * exp(-dot(off, off) / 0.08) * uPointerStrength;
    float d = abs(p.y - y);
    float line = exp(-d * d / 0.0006) * 0.9 + exp(-d * 18.0) * 0.08;
    glow += line * (1.0 - abs(fi - mid) / n);
  }
  return tint * glow;
}

void main() {
  float t = uTime * uSpeed;
  float aspect = uResolution.x / uResolution.y;
  vec2 p = (gl_FragCoord.xy - uResolution * 0.5) / (uResolution.y * 0.5);
  vec2 shift = (uPointer - 0.5) * uPointerStrength;
  // Paralaxe leve; o ponteiro vai para o mesmo espaço de p para a curva dos fios.
  p += shift * 0.1;
  vec2 pointer = (uPointer - 0.5) * vec2(2.0 * aspect, 2.0);

  vec3 col = vec3(0.0);
  if (uWaves.x > 0.5) col += beam(p, pointer, aspect, t, 0.45, -0.15);
  if (uWaves.y > 0.5) col += beam(p, pointer, aspect, t, 0.0, 0.1);
  if (uWaves.z > 0.5) col += beam(p, pointer, aspect, t, -0.5, -0.2);

  // Ruído de meio degrau de 8 bits quebra as faixas do esmaecimento.
  float dither = (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) / 255.0;
  col = clamp(col + dither, 0.0, 1.0);
  float a = max(col.r, max(col.g, col.b));
  fragColor = vec4(col, a);
}`;
