// Dobras de luz acetinada em espiral. Saída pré-multiplicada, porque o contexto WebGL usa alpha padrão.
export const SATIN_PLASMA_FRAGMENT_SHADER = `#version 300 es
precision highp float;
uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColor;
uniform float uSpeed;
uniform float uTwist;
uniform float uSoftness;
uniform float uShine;
uniform float uFade;
uniform vec2 uPointer;
uniform float uPointerOn;
uniform float uReveal;
out vec4 fragColor;

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  vec2 p = (uv - 0.5) * vec2(uResolution.x / uResolution.y, 1.0) * 2.0;
  float t = uTime * uSpeed;

  // O ponteiro desloca o padrão (inclina) e acende a região próxima.
  vec2 shift = (uPointer - 0.5) * 0.4 * uPointerOn;
  p += shift;
  float angle = uTwist * 0.6 * length(p) + t * 0.2;
  float c = cos(angle);
  float s = sin(angle);
  p = mat2(c, -s, s, c) * p;

  float v = sin(p.x * 3.0 + t) + sin(p.y * 2.3 - t * 0.7) + sin((p.x + p.y) * 1.7 + t * 0.4);
  float f = 0.5 + 0.5 * sin(v * 2.0);

  float base = pow(f, mix(1.5, 4.0, 1.0 - uSoftness));
  float shine = uShine * pow(f, 24.0) * 0.8;
  vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
  float dist = length((uv - uPointer) * aspect);
  base += uPointerOn * 0.2 * exp(-6.0 * dist * dist);

  float reveal = mix(smoothstep(0.0, 1.2, uTime), 1.0, uReveal);
  float vignette = smoothstep(0.75, 0.2, length(uv - 0.5));
  float edge = mix(1.0, vignette, uFade);

  vec3 color = uColor * base + mix(uColor, vec3(1.0), 0.7) * shine;
  float alpha = clamp(max(base, shine), 0.0, 1.0) * reveal * edge;
  float k = alpha / max(max(base, shine), 0.0001);
  // Ruído de meio degrau de 8 bits quebra as faixas do gradiente longo.
  float dither = (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) / 255.0;
  alpha = clamp(alpha + dither, 0.0, 1.0);
  fragColor = vec4(min(color * k, vec3(alpha)), alpha);
}`;
