// Grade que ondula: ondas saem de pontos (centro, mouse, clique), empurram o pixel na radial e
// acendem as linhas por onde passam. As posições chegam em pixels de dispositivo; uScale converte
// as constantes em pixels CSS. Saída pré-multiplicada, porque o contexto WebGL usa alpha padrão.
export const PULSE_GRID_FRAGMENT_SHADER = `#version 300 es
precision highp float;
uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColor;
uniform float uScale;
uniform float uCellSize;
uniform float uLineWidth;
uniform int uVariant;
uniform float uGlow;
uniform float uRippleStrength;
uniform float uRippleSpeed;
uniform float uFade;
// x, y em pixels de dispositivo (y para cima); z: instante de início, em segundos de uTime.
uniform vec3 uRipples[8];
uniform float uStrengths[8];
uniform int uRippleCount;
// xy: posição em pixels de dispositivo; z: força da luz do mouse (0 sem ponteiro).
uniform vec3 uPointer;
// 1 quando a grade já deve aparecer inteira (movimento reduzido).
uniform float uReveal;
out vec4 fragColor;

void main() {
  vec2 p = gl_FragCoord.xy;
  vec2 displacement = vec2(0.0);
  float wave = 0.0;
  for (int i = 0; i < 8; i++) {
    if (i >= uRippleCount) break;
    vec2 d = p - uRipples[i].xy;
    float r = length(d);
    float age = uTime - uRipples[i].z;
    if (age < 0.0) continue;
    float front = age * uRippleSpeed * 400.0 * uScale;
    float x = (r - front) / (40.0 * uScale);
    float w = exp(-x * x) * exp(-age * 1.2) * uStrengths[i];
    displacement += normalize(d + vec2(1e-5)) * w * uRippleStrength * 12.0 * uScale;
    wave += w;
  }
  vec2 q = p - displacement;

  vec2 cell = fract(q / uCellSize);
  float lineDist = min(min(cell.x, cell.y), 1.0 - max(cell.x, cell.y)) * uCellSize;
  vec2 corner = min(cell, 1.0 - cell) * uCellSize;
  float crossDist = length(corner);
  float grid = 1.0 - smoothstep(0.0, uLineWidth, lineDist);
  if (uVariant == 1) {
    grid = 1.0 - smoothstep(uLineWidth * 0.9, uLineWidth * 1.5, crossDist);
  } else if (uVariant == 2) {
    grid *= 1.0 - smoothstep(uCellSize * 0.13, uCellSize * 0.15, crossDist);
  }

  float pointerDist = length(p - uPointer.xy) / (120.0 * uScale);
  float light = 0.18 + uGlow * 0.6 * wave + uPointer.z * 0.5 * exp(-pointerDist * pointerDist);

  // A primeira onda automática, a partir do centro, revela a grade.
  float revealFront = uTime * uRippleSpeed * 600.0 * uScale;
  float centerDist = length(p - uResolution * 0.5);
  float reveal = max(uReveal, 1.0 - smoothstep(revealFront - 160.0 * uScale, revealFront, centerDist));

  vec2 uv = p / uResolution;
  float vignette = 1.0 - smoothstep(0.2, 0.75, length(uv - 0.5));
  float edge = mix(1.0, vignette, uFade);

  float alpha = clamp(grid * light * reveal * edge, 0.0, 1.0);
  // Ruído de meio degrau de 8 bits quebra o degrau visível do gradiente longo.
  float dither = (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) / 255.0;
  alpha = clamp(alpha + dither, 0.0, 1.0);
  fragColor = vec4(uColor * alpha, alpha);
}`;
