// Tinta de três cores girando, com pixelização. Saída pré-multiplicada (alfa 1 aqui).
export const SWIRL_PAINT_FRAGMENT_SHADER = `#version 300 es
precision highp float;
uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColors[3];
uniform float uSpeed;
uniform float uSpin;
uniform float uContrast;
uniform float uPixelSize;
uniform vec2 uPointer;
out vec4 fragColor;

void main() {
  // Todo o resto usa o centro do "pixel grande" no lugar da coordenada real.
  vec2 frag = (floor(gl_FragCoord.xy / uPixelSize) + 0.5) * uPixelSize;
  float t = uTime * uSpeed;
  vec2 p = (frag - uResolution * 0.5) / uResolution.y * 3.0;
  p -= (uPointer - 0.5) * 0.6;

  float r = length(p);
  float angle = uSpin * (1.5 - r) * 1.2 + t * 0.3 * uSpin;
  float c = cos(angle);
  float s = sin(angle);
  p = mat2(c, -s, s, c) * p;

  for (int n = 0; n < 5; n++) {
    float i = float(n);
    p += 0.5 * vec2(sin(p.y * 1.3 + t * 0.2 + i), cos(p.x * 1.1 - t * 0.15 + i * 1.7));
  }
  float f = 0.5 + 0.5 * sin(length(p) * 5.0 + p.x * 1.5);

  float e = 0.25 / uContrast;
  vec3 color = mix(uColors[2], uColors[1], smoothstep(0.35 - e, 0.35 + e, f));
  color = mix(color, uColors[0], smoothstep(0.65 - e, 0.65 + e, f));

  // Ruído de meio degrau de 8 bits quebra as faixas das transições suaves.
  float dither = (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) / 255.0;
  fragColor = vec4(clamp(color + dither, 0.0, 1.0), 1.0);
}`;
