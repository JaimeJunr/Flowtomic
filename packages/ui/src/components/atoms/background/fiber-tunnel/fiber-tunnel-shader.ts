// Túnel de fibras: cabos finos saem de um ponto de fuga e carregam pulsos de luz. Saída
// pré-multiplicada, porque o contexto WebGL usa alpha padrão. O índice do cabo é tomado
// módulo `uCables` para a costura do atan não mudar o sorteio de nenhum cabo.
export const FIBER_TUNNEL_FRAGMENT_SHADER = `#version 300 es
precision highp float;
uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uCableColor;
uniform vec3 uPulseColor;
uniform float uSpeed;
uniform float uCables;
uniform float uThickness;
uniform float uPulseLength;
uniform float uWaviness;
uniform float uDirection;
uniform vec2 uPointer;
out vec4 fragColor;

const float TAU = 6.28318530718;

float hash(float n) {
  return fract(sin(n * 127.1 + 11.7) * 43758.5453);
}

float hash2(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

void main() {
  float t = uTime * uSpeed;
  vec2 vanish = (uPointer - 0.5) * 0.1;
  vec2 p = (gl_FragCoord.xy - uResolution * 0.5) / uResolution.y - vanish;
  float r = length(p);
  float z = 0.25 / max(r, 0.001);

  float a = atan(p.y, p.x) + 0.15 * sin(t * 0.4) + uWaviness * 0.3 * sin(z * 2.0 - t * 0.5);
  float sector = a * uCables / TAU;
  float k = mod(floor(sector), uCables);
  float s = fract(sector) - 0.5;

  float w = uThickness * 0.18;
  float core = 1.0 - smoothstep(w * 0.6, w, abs(s));
  float rim = exp(-abs(abs(s) - w) * 40.0) * 0.5;

  float rate = 0.7 + 0.6 * hash(k + 3.0);
  float u = fract(z * 0.35 + uDirection * t * 0.25 * rate + hash(k));
  float half_ = uPulseLength * 0.5;
  float pulse = smoothstep(0.0, half_, u) * (1.0 - smoothstep(half_, uPulseLength, u));

  float fade = smoothstep(0.04, 0.25, r) * (1.0 - smoothstep(0.9, 1.4, r));
  float tint = 0.85 + 0.3 * hash(k + 7.0);

  vec3 color = (uCableColor * (core * 0.25 + rim) * fade + uPulseColor * pulse * core * 1.6 * fade) * tint;
  float dither = (hash2(gl_FragCoord.xy * 1.37) - 0.5) / 255.0;
  float alpha = clamp(max(color.r, max(color.g, color.b)) + dither, 0.0, 1.0);
  color = clamp(color, 0.0, alpha);
  fragColor = vec4(color, alpha);
}`;
