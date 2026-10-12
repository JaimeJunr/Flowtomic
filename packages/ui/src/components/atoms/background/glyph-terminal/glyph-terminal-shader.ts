import { glyphTable } from "./glyph-terminal-utils";

// Terminal antigo: grade de dígitos 3x5 sobre ruído, com varredura, piscar, glitch e vidro curvo.
// Saída pré-multiplicada, porque o contexto WebGL usa alpha padrão.
export const GLYPH_TERMINAL_FRAGMENT_SHADER = `#version 300 es
precision highp float;
uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uTint;
uniform float uSpeed;
uniform float uGlyphSize;
uniform float uScanlines;
uniform float uGlitch;
uniform float uFlicker;
uniform float uCurvature;
uniform vec2 uPointer;
uniform float uPointerOn;
uniform float uReveal;
out vec4 fragColor;

${glyphTable()}

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
  for (int i = 0; i < 4; i++) {
    sum += amp * vnoise(x);
    x *= 2.0;
    amp *= 0.5;
  }
  return sum;
}

// Bit da sub-célula (coluna 0-2, linha 0-4 contada do topo) do glifo.
float glyphBit(int glyph, vec2 local) {
  int col = int(clamp(floor(local.x * 3.0), 0.0, 2.0));
  int row = 4 - int(clamp(floor(local.y * 5.0), 0.0, 4.0));
  return float((glyph >> (row * 3 + col)) & 1);
}

void main() {
  vec2 res = uResolution;
  vec2 uv = (gl_FragCoord.xy / res) * 2.0 - 1.0;
  uv *= 1.0 + uCurvature * dot(uv.yx, uv.yx) * 0.25;
  float inside = step(abs(uv.x), 1.0) * step(abs(uv.y), 1.0);

  // Faixa horizontal que escorrega de vez em quando.
  float band = floor(uv.y * 20.0);
  float tick = floor(uTime * 8.0);
  if (hash(vec2(band, tick)) > 1.0 - 0.05 * uGlitch) {
    uv.x += (hash(vec2(band + 7.0, tick + 3.0)) - 0.5) * 0.1 * uGlitch;
  }

  vec2 unit = uv * 0.5 + 0.5;
  vec2 px = unit * res;
  float t = uTime * uSpeed;

  vec2 scaled = px / uGlyphSize;
  vec2 cell = floor(scaled);
  vec2 local = fract(scaled);
  int glyph = GLYPHS[int(floor(hash(cell + floor(t * 2.0)) * 10.0)) % 10];

  // O dígito ocupa o miolo da célula: a margem separa um glifo do vizinho. Folga por sub-célula
  // apagava as linhas em glifo pequeno (2,4 px por linha num glifo de 12 px).
  vec2 inner = (local - vec2(0.18, 0.12)) / vec2(0.64, 0.76);
  float inside01 = step(0.0, inner.x) * step(inner.x, 1.0) * step(0.0, inner.y) * step(inner.y, 1.0);
  float lit = glyphBit(glyph, clamp(inner, 0.0, 0.999)) * inside01;

  float v = smoothstep(0.35, 0.75, fbm(cell * 0.08 + t * 0.2));
  vec2 d = (unit - uPointer) * vec2(res.x / res.y, 1.0);
  v = clamp(v + 0.5 * exp(-dot(d, d) / 0.02) * uPointerOn, 0.0, 1.0);

  float scan = 1.0 - uScanlines * 0.5 * (0.5 + 0.5 * sin(px.y * 3.1416));
  float flick = 1.0 - uFlicker * 0.04 * hash(vec2(floor(uTime * 30.0), 0.0));
  float reveal = mix(smoothstep(0.0, 1.0, uTime), 1.0, uReveal);

  float glow = v * 0.06;
  float alpha = (lit * v * scan + glow) * flick * reveal * inside;
  vec3 color = uTint * (lit * v * scan * 1.3 + glow) * flick * reveal * inside;
  // Ruído de meio degrau de 8 bits quebra as faixas do brilho de fundo.
  float dither = (hash(gl_FragCoord.xy + 0.5) - 0.5) / 255.0;
  alpha = clamp(alpha + dither * inside, 0.0, 1.0);
  fragColor = vec4(clamp(color, vec3(0.0), vec3(1.0)), alpha);
}`;
