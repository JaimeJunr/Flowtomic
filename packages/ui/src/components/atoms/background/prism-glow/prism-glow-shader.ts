// Silhueta 2D de um prisma de luz com faixas de espectro e linha de luz na base.
// Saída pré-multiplicada, porque o contexto WebGL usa alpha padrão.
export const PRISM_GLOW_FRAGMENT_SHADER = `#version 300 es
precision highp float;
uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uTint;
uniform float uSpeed;
uniform float uGlow;
uniform float uBands;
uniform float uHeight;
uniform float uNoise;
uniform vec2 uPointer;
out vec4 fragColor;

float hash(vec2 x) {
  return fract(sin(dot(x, vec2(127.1, 311.7))) * 43758.5453);
}

void main() {
  vec2 p = (gl_FragCoord.xy - uResolution * 0.5) / uResolution.y * 2.0;
  float t = uTime * uSpeed;
  float baseY = -0.35;

  // O ponteiro inclina o prisma: cisalhamento proporcional à altura sobre a base.
  p.x -= (uPointer.x - 0.5) * 0.25 * (p.y - baseY);

  // Distância com sinal ao triângulo isósceles: dois semiplanos laterais e a base.
  float apexY = baseY + uHeight;
  vec2 n = normalize(vec2(uHeight, 0.55));
  float side = dot(vec2(abs(p.x), p.y - apexY), n);
  float dist = max(side, baseY - p.y);
  float inside = smoothstep(0.08, -0.02, dist);
  float edge = exp(-abs(dist) * 40.0) * 0.5;

  float k = (p.y - baseY) * uBands * 3.0 + sin(p.x * 3.0 + t) * 0.4 + t * 0.3;
  vec3 spec = 0.5 + 0.5 * cos(6.2832 * (k + vec3(0.0, 0.33, 0.67)));
  spec = mix(spec, uTint, 0.35);

  float beamY = (p.y - baseY) / 0.02;
  float beam = exp(-beamY * beamY) * (1.0 - smoothstep(0.4, 1.4, abs(p.x)));
  vec3 base = mix(uTint, vec3(1.0), 0.7) * beam * 2.0 * uGlow;

  vec3 color = spec * (inside * 0.55 + edge) * uGlow + base;
  color += uTint * uGlow * 0.15 * exp(-length(p - vec2(0.0, -0.2)) * 2.5);

  float alpha = clamp(max(color.r, max(color.g, color.b)), 0.0, 1.0);
  // Grão com sinal, proporcional ao alfa para não sujar o vazio.
  float grain = (hash(gl_FragCoord.xy) - 0.5) * uNoise * 0.04 * 2.0;
  color += vec3(grain) * alpha;
  // Ruído de meio degrau de 8 bits quebra as faixas do gradiente longo.
  float dither = (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) / 255.0;
  alpha = clamp(alpha + dither, 0.0, 1.0);
  fragColor = vec4(clamp(color, vec3(0.0), vec3(alpha)), alpha);
}`;
