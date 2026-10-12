// Faixas grossas de luz neon que se dobram e deslizam, com núcleo forte e brilho em volta.
// Saída pré-multiplicada (alfa = maior canal), para compor sobre a página nos dois temas.
export const NEON_BENDS_FRAGMENT_SHADER = `#version 300 es
precision highp float;
uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColors[4];
uniform int uCount;
uniform float uRotation;
uniform float uSpin;
uniform float uSpeed;
uniform float uScale;
uniform float uFrequency;
uniform float uWarp;
uniform float uBandWidth;
uniform float uIntensity;
uniform vec2 uPointer;
uniform float uPointerStrength;
out vec4 fragColor;

// Mesma transformação para o pixel e para o ponteiro: centro, proporção, giro e escala.
vec2 toScene(vec2 centered) {
  float a = uRotation + uSpin * 0.017453292 * uTime;
  float c = cos(a);
  float s = sin(a);
  return mat2(c, -s, s, c) * centered / uScale;
}

void main() {
  float t = uTime * uSpeed;
  float aspect = uResolution.x / uResolution.y;
  vec2 centered = (gl_FragCoord.xy - uResolution * 0.5) / (uResolution.y * 0.5);
  vec2 ptr = toScene((uPointer - 0.5) * vec2(2.0 * aspect, 2.0));
  vec2 p = toScene(centered);
  // Paralaxe leve do conjunto, proporcional à presença do ponteiro.
  p += (uPointer - 0.5) * 0.15 * uPointerStrength;

  vec2 q = p;
  q.x += uWarp * 0.5 * sin(q.y * 1.3 * uFrequency + t);
  q.y += uWarp * 0.4 * sin(q.x * 1.1 * uFrequency - t * 0.8);
  vec2 away = q - ptr;
  float dist2 = dot(away, away);
  // Deslocamento proporcional ao afastamento: o normalize fazia um bico no ponto do ponteiro.
  q += uWarp * 0.8 * away * exp(-dist2 / 0.1) * uPointerStrength;

  float n = float(uCount);
  vec3 col = vec3(0.0);
  for (int i = 0; i < 4; i++) {
    if (i >= uCount) break;
    float fi = float(i);
    float c = q.y - 0.6 * (fi - (n - 1.0) * 0.5)
      - 0.35 * sin(q.x * uFrequency * 0.9 + fi * 1.7 + t * 0.6);
    float d = abs(c);
    float b = exp(-d * uBandWidth * 2.0) + exp(-d * uBandWidth * 0.4) * 0.15;
    col += uColors[i] * b;
  }
  col *= uIntensity;

  // Ruído de meio degrau de 8 bits quebra as faixas do esmaecimento.
  float dither = (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) / 255.0;
  col = clamp(col + dither, 0.0, 1.0);
  float a = max(col.r, max(col.g, col.b));
  fragColor = vec4(col, a);
}`;
