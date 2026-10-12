// Linhas paralelas inclinadas que ondulam juntas, como curvas de nível.
// Saída pré-multiplicada (alfa = traço * brilho), para compor sobre a página nos dois temas.
export const CONTOUR_LINES_FRAGMENT_SHADER = `#version 300 es
precision highp float;
uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColors[3];
uniform float uSpeed;
uniform float uLineCount;
uniform float uWarp;
uniform float uRotation;
uniform float uBrightness;
uniform vec2 uPointer;
uniform float uPointerStrength;
out vec4 fragColor;

vec2 rotate2(vec2 v, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  return mat2(c, -s, s, c) * v;
}

void main() {
  float t = uTime * uSpeed;
  vec2 p = rotate2((gl_FragCoord.xy - uResolution * 0.5) / uResolution.y, uRotation);
  vec2 pointerP = rotate2((uPointer * uResolution - uResolution * 0.5) / uResolution.y, uRotation);

  float h = p.y + uWarp * (0.25 * sin(p.x * 2.0 + t) + 0.12 * sin(p.x * 4.3 - t * 1.3 + p.y * 1.5));
  vec2 d = p - pointerP;
  h += uPointerStrength * 0.3 * exp(-4.0 * dot(d, d));

  // fwidth mantém o traço com cerca de 1,5 px na tela, em qualquer densidade.
  float f = h * uLineCount;
  float dist = abs(fract(f) - 0.5);
  float line = smoothstep(0.5 - fwidth(f) * 1.5, 0.5, dist);

  float density = uBrightness * (0.3 + 0.7 * smoothstep(-0.6, 0.6, sin(p.x * 1.3 + t * 0.5)));
  vec3 color = mix(uColors[0], uColors[1], 0.5 + 0.5 * sin(p.x + t * 0.3));
  color = mix(color, uColors[2], (0.5 + 0.5 * sin(p.y * 1.7 - t * 0.2)) * 0.6);

  // Ruído de meio degrau de 8 bits no alfa quebra as faixas dos trechos que esmaecem.
  float dither = (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) / 255.0;
  float a = clamp(line * density + dither, 0.0, 1.0);
  fragColor = vec4(color * a, a);
}`;
