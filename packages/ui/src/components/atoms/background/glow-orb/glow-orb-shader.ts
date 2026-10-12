// Anel de luz com duas cores girando, brilho atrás e uma luz que orbita com cauda. Saída
// pré-multiplicada, porque o contexto WebGL usa alpha padrão.
export const GLOW_ORB_FRAGMENT_SHADER = `#version 300 es
precision highp float;
uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColors[3];
uniform float uSize;
uniform float uGlow;
uniform float uWobble;
uniform float uHighlight;
uniform float uTrail;
uniform float uSpeed;
uniform vec2 uPointer;
uniform float uPointerForce;
uniform float uPulse;
uniform float uCalm;
out vec4 fragColor;

const float PI = 3.14159265359;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

// Diferença angular com sinal em -PI..PI (mesma conta do angleDelta em TypeScript).
float angleDelta(float a, float b) {
  return mod(a - b + PI, 2.0 * PI) - PI;
}

void main() {
  float aspect = uResolution.x / uResolution.y;
  float unit = 0.35 * uSize;
  vec2 p = (gl_FragCoord.xy / uResolution - 0.5) * vec2(aspect, 1.0) / unit;
  vec2 m = (uPointer - 0.5) * vec2(aspect, 1.0) / unit;
  float r = length(p);
  float a = atan(p.y, p.x);
  float t = uTime * uSpeed;
  float aPointer = atan(m.y, m.x);
  float force = uPointerForce;

  // Respiração e deformação; em movimento reduzido o anel fica quieto.
  float calm = 1.0 - uCalm;
  float R = 1.0 + uWobble * calm * (0.04 * sin(t * 1.3) + 0.03 * sin(a * 3.0 + t * 0.9));
  float stretch = max(0.0, cos(a - aPointer));
  R += 0.15 * stretch * stretch * force;

  // Entrada com salto e pulso do clique, ambos no relógio do uTime.
  float entry = 1.0 - exp(-uTime * 6.0) * cos(uTime * 12.0) * 0.3;
  R *= mix(entry, 1.0, uCalm);
  float age = uTime - uPulse;
  if (uPulse >= 0.0 && age < 1.0) {
    R += 0.3 * exp(-age * 4.0) * sin(age * 20.0);
  }

  float d = abs(r - R);
  float core = exp(-d * 40.0) * (1.0 + 0.8 * stretch * stretch * force);
  float halo = exp(-d * (6.0 / max(uGlow, 0.05))) * 0.6;
  // Só dentro do anel: fora dele, max(R - r, 0) zerava e o brilho pintava a área inteira.
  float inner = step(r, R) * exp(-(R - r) * 3.0) * 0.25 * uGlow;

  vec3 ring = mix(uColors[0], uColors[1], 0.5 + 0.5 * sin(a + t * 0.7));

  // Luz que orbita; perto do ponteiro ela é puxada para o ângulo dele.
  float ao = t * 1.1;
  ao += angleDelta(aPointer, ao) * force * 0.7;
  float da = angleDelta(a, ao);
  float head = exp(-da * da * 60.0);
  float tail = exp(-max(-da, 0.0) * (3.0 / max(uTrail, 0.05))) * step(da, 0.0) * 0.6;
  vec3 lightColor = mix(ring, vec3(1.0), 0.6);

  vec3 color = ring * (core + halo) + uColors[2] * inner;
  color += lightColor * (head + tail) * uHighlight * core * 2.0;

  float dither = (hash(gl_FragCoord.xy * 1.37) - 0.5) / 255.0;
  float alpha = clamp(max(color.r, max(color.g, color.b)) + dither, 0.0, 1.0);
  color = clamp(color, 0.0, alpha);
  fragColor = vec4(color, alpha);
}`;
