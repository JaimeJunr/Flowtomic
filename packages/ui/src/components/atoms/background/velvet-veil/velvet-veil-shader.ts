// Véu de luz macia por distorção de domínio sobre fbm. Saída pré-multiplicada, porque o contexto WebGL usa alpha padrão.
export const VELVET_VEIL_FRAGMENT_SHADER = `#version 300 es
precision highp float;
uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColor;
uniform float uSpeed;
uniform float uScale;
uniform float uFlow;
uniform float uSheen;
uniform float uGlow;
uniform float uGrain;
uniform float uFade;
uniform vec2 uPointer;
uniform float uPointerOn;
uniform float uReveal;
out vec4 fragColor;

float hash(vec2 x) {
  return fract(sin(dot(x, vec2(127.1, 311.7))) * 43758.5453);
}

float vnoise(vec2 x) {
  vec2 i = floor(x);
  vec2 f = fract(x);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 x) {
  float sum = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 5; i++) {
    sum += amp * vnoise(x);
    x *= 2.0;
    amp *= 0.5;
  }
  return sum;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  vec2 p = (gl_FragCoord.xy - uResolution * 0.5) / uResolution.y * 2.0 / uScale;
  float t = uTime * uSpeed;

  // O ponteiro vem em 0-1; leva para o mesmo espaço de p. Ao redor dele o véu se enrola.
  vec2 pointer = (uPointer * uResolution - uResolution * 0.5) / uResolution.y * 2.0 / uScale;
  vec2 d = p - pointer;
  float near = uPointerOn;
  p += vec2(-d.y, d.x) * 0.35 * exp(-4.0 * dot(d, d)) * near;

  vec2 q = vec2(fbm(p + t * 0.10 * uFlow), fbm(p + vec2(5.2, 1.3) - t * 0.08 * uFlow));
  float n = fbm(p + 2.0 * q);
  float veil = smoothstep(0.35, 0.85, n) + near * 0.25 * exp(-3.0 * dot(d, d));
  float halo = uGlow * smoothstep(0.6, 1.0, n);
  float sheen = uSheen * pow(0.5 + 0.5 * sin(n * 12.0), 6.0) * veil;

  float reveal = mix(smoothstep(0.0, 1.5, uTime), 1.0, uReveal);
  float vignette = smoothstep(0.75, 0.2, length(uv - 0.5));
  float edge = mix(1.0, vignette, uFade);

  float body = max(veil, sheen);
  float alpha = clamp(body, 0.0, 1.0) * reveal * edge;
  float k = alpha / max(body, 0.0001);
  vec3 color = uColor * (veil + halo) + mix(uColor, vec3(1.0), 0.6) * sheen;
  // Grão estático de filme, proporcional ao alfa para não sujar o vazio.
  float grain = (hash(gl_FragCoord.xy) - 0.5) * uGrain;
  color += vec3(grain) * alpha;
  // Ruído de meio degrau de 8 bits quebra as faixas do gradiente longo.
  float dither = (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) / 255.0;
  alpha = clamp(alpha + dither, 0.0, 1.0);
  fragColor = vec4(clamp(color * k, vec3(0.0), vec3(alpha)), alpha);
}`;
