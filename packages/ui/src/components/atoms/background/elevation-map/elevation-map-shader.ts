// Mapa topográfico: curvas de nível de um terreno de seis gaussianas que orbitam, com brilho.
// Saída pré-multiplicada (alfa = maior canal), para compor sobre a página nos dois temas.
export const ELEVATION_MAP_FRAGMENT_SHADER = `#version 300 es
precision highp float;
uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform float uSpeed;
uniform float uMorph;
uniform float uBands;
uniform float uThickness;
uniform float uScale;
uniform float uGlow;
uniform float uFill;
uniform vec2 uPointer;
uniform float uPointerStrength;
out vec4 fragColor;

float hash11(float n) {
  return fract(sin(n * 127.1) * 43758.5453);
}

float hash21(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash21(i), hash21(i + vec2(1.0, 0.0)), u.x),
    mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float sum = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 3; i++) {
    sum += amp * vnoise(p);
    p *= 2.03;
    amp *= 0.5;
  }
  return sum * 2.0 - 1.0;
}

// Soma de gaussianas com sinais alternados: cria ilhas, cristas e vales.
float terrain(vec2 p, float t) {
  float h = 0.0;
  for (int i = 0; i < 6; i++) {
    float fi = float(i);
    vec2 base = (vec2(hash11(fi + 1.0), hash11(fi + 11.0)) - 0.5) * 2.2;
    float k = 0.3 + 0.6 * hash11(fi + 21.0);
    vec2 c = base + 0.35 * uMorph * vec2(sin(t * k + fi), cos(t * k * 0.8 + fi * 1.7));
    float radius = 0.5 + 0.4 * hash11(fi + 31.0);
    float sgn = mod(fi, 2.0) < 0.5 ? 1.0 : -1.0;
    vec2 d = p - c;
    h += sgn * exp(-dot(d, d) / (radius * radius));
  }
  h += 0.35 * fbm(p * 1.2 + t * 0.1);
  return clamp(h * 0.5 + 0.5, 0.0, 1.0);
}

vec3 heightColor(float h) {
  vec3 lowMid = mix(uColor1, uColor2, smoothstep(0.0, 0.6, h));
  return mix(lowMid, uColor3, smoothstep(0.6, 1.0, h));
}

void main() {
  float t = uTime * uSpeed;
  float aspect = uResolution.x / uResolution.y;
  float zoom = 1.5 / uScale;
  vec2 p = (gl_FragCoord.xy - uResolution * 0.5) / (uResolution.y * 0.5) * zoom;
  vec2 pointer = (uPointer - 0.5) * vec2(2.0 * aspect, 2.0) * zoom;

  float h = terrain(p, t);
  vec2 off = p - pointer;
  h = clamp(h + 0.4 * exp(-dot(off, off) / 0.09) * uPointerStrength, 0.0, 1.0);

  float v = h * uBands * 6.0;
  float f = abs(fract(v) - 0.5);
  // fwidth mantém a espessura estável em pixels, qualquer que seja a inclinação do terreno.
  float w = max(fwidth(v), 1e-4);
  float line = 1.0 - smoothstep(uThickness * 60.0 * w, uThickness * 60.0 * w + w, f);
  float halo = exp(-f / max(w * uGlow * 4.0, 1e-4)) * 0.35 * uGlow;

  vec3 tint = heightColor(h);
  vec3 col = tint * (line + halo) + (uFill > 0.5 ? tint * 0.06 : vec3(0.0));

  // Ruído de meio degrau de 8 bits quebra as faixas do esmaecimento.
  float dither = (hash21(gl_FragCoord.xy * 1.37) - 0.5) / 255.0;
  col = clamp(col + dither, 0.0, 1.0);
  float a = max(col.r, max(col.g, col.b));
  fragColor = vec4(col, a);
}`;
