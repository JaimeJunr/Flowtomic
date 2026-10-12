// Persiana de lâminas verticais: cada lâmina tem um lado aceso, o degradê das cores corre por elas e
// um holofote em volta do ponteiro decide onde o brilho aparece.
// Saída pré-multiplicada, porque o contexto WebGL usa alpha padrão.
export const LIGHT_BLINDS_FRAGMENT_SHADER = `#version 300 es
precision highp float;
uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColors[8];
uniform int uColorCount;
uniform float uAngle;
uniform float uBlinds;
uniform float uRadius;
uniform float uSoftness;
uniform float uShine;
uniform float uNoise;
uniform float uSpeed;
uniform vec2 uPointer;
out vec4 fragColor;

// Paleta circular: interpola entre vizinhas e a última volta para a primeira.
vec3 paletteColor(float g) {
  float scaled = g * float(uColorCount);
  int i = int(floor(scaled));
  float f = fract(scaled);
  int a = i - (i / uColorCount) * uColorCount;
  int b = a + 1 - ((a + 1) / uColorCount) * uColorCount;
  return mix(uColors[a], uColors[b], f);
}

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  float c = cos(uAngle);
  float s = sin(uAngle);
  vec2 q = uv - 0.5;
  vec2 ruv = vec2(q.x * c - q.y * s, q.x * s + q.y * c) + 0.5;

  float t = uTime * uSpeed * 0.1;
  vec3 gradient = paletteColor(fract(ruv.x + t));

  float blade = fract(ruv.x * uBlinds);
  float lit = uShine > 0.5 ? 1.0 - blade : blade;
  float light = pow(lit, 1.5);

  vec2 pointerPx = uPointer * uResolution;
  float d = distance(gl_FragCoord.xy, pointerPx) / (uRadius * min(uResolution.x, uResolution.y));
  float spot = pow(clamp(1.0 - d, 0.0, 1.0), uSoftness);

  float a = light * spot;
  float grain = (hash(gl_FragCoord.xy) - 0.5) * 2.0;
  a = clamp(a + grain * uNoise * 0.06, 0.0, 1.0);
  // Ruído de meio degrau de 8 bits quebra o degrau visível do gradiente longo.
  float dither = (hash(gl_FragCoord.xy + 7.31) - 0.5) / 255.0;
  a = clamp(a + dither, 0.0, 1.0);
  fragColor = vec4(gradient * a, a);
}`;
