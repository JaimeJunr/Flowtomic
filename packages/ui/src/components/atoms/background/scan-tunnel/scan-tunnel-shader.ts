// Tunel retangular em perspectiva com grade e uma faixa de luz que vai e volta. Saida
// pre-multiplicada, porque o contexto WebGL usa alpha padrao. `fwidth` e nativo no GLSL ES 3.00.
export const SCAN_TUNNEL_FRAGMENT_SHADER = `#version 300 es
precision highp float;
uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uLineColor;
uniform vec3 uScanColor;
uniform float uGridScale;
uniform float uLineWidth;
uniform float uScanOpacity;
uniform float uScanDuration;
uniform float uScanDelay;
uniform float uSpeed;
uniform vec2 uPointer;
uniform float uStatic;
out vec4 fragColor;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

// Espelha scanPhase() do utils: devolve -1 na pausa final.
float scanPhase(float t, float duration, float delay) {
  float cycle = duration * 2.0 + delay * 2.0;
  float c = mod(t, cycle);
  if (c <= duration) return smoothstep(0.0, 1.0, c / duration);
  if (c <= duration + delay) return 1.0;
  if (c <= duration * 2.0 + delay) return smoothstep(0.0, 1.0, 1.0 - (c - duration - delay) / duration);
  return -1.0;
}

void main() {
  vec2 p = gl_FragCoord.xy / uResolution - 0.5;
  float aspect = uResolution.x / uResolution.y;
  p.x *= aspect;
  p += (uPointer - 0.5) * 0.15;

  float ax = max(abs(p.x), 0.0001);
  float ay = max(abs(p.y), 0.0001);
  float zSide = 0.5 * aspect / ax;
  float zFlat = 0.5 / ay;
  float z = min(zSide, zFlat);
  float u = zSide < zFlat ? p.y * z : p.x * z;

  vec2 g = vec2(u, z) / uGridScale;
  vec2 w = max(fwidth(g) * uLineWidth, vec2(0.0001));
  vec2 q = abs(fract(g - 0.5) - 0.5);
  float line = max(1.0 - smoothstep(0.0, w.x, q.x), 1.0 - smoothstep(0.0, w.y, q.y));

  float fog = exp(-z * 0.35);

  float phase = scanPhase(uTime * uSpeed, uScanDuration, uScanDelay);
  float zs = mix(1.0, 12.0, max(phase, 0.0));
  float band = phase < 0.0 ? 0.0 : exp(-(z - zs) * (z - zs) * 0.25);
  band *= 1.0 - uStatic;

  vec3 color = uLineColor * line * fog * 0.6
    + uScanColor * (line * band * 2.5 + band * 0.35) * uScanOpacity;
  float dither = (hash(gl_FragCoord.xy * 1.37) - 0.5) / 255.0;
  float alpha = clamp(max(color.r, max(color.g, color.b)) + dither, 0.0, 1.0);
  color = clamp(color, 0.0, alpha);
  fragColor = vec4(color, alpha);
}`;
