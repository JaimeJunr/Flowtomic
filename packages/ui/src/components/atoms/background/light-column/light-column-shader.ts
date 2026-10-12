// Coluna de luz inclinada feita de filamentos que se torcem. Saída pré-multiplicada, porque o
// contexto WebGL usa alpha padrão.
export const LIGHT_COLUMN_FRAGMENT_SHADER = `#version 300 es
precision highp float;
uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColors[2];
uniform float uIntensity;
uniform float uWidth;
uniform float uTilt;
uniform float uTwist;
uniform int uDetail;
uniform float uSpeed;
uniform float uGrain;
uniform vec2 uPointer;
uniform float uPulse;
uniform float uReveal;
out vec4 fragColor;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float valueNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

// Turbulência com 'uDetail' oitavas, resultado centrado em zero.
float fbm(vec2 p) {
  float sum = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 6; i++) {
    if (i >= uDetail) break;
    sum += amp * (valueNoise(p) * 2.0 - 1.0);
    p = p * 2.0 + vec2(17.0, 9.0);
    amp *= 0.5;
  }
  return sum;
}

void main() {
  vec2 p = (gl_FragCoord.xy / uResolution - 0.5) * 2.0;
  p.x *= uResolution.x / uResolution.y;
  float angle = radians(uTilt + (uPointer.x - 0.5) * 15.0);
  float cs = cos(angle);
  float sn = sin(angle);
  p = vec2(cs * p.x - sn * p.y, sn * p.x + cs * p.y);
  float y01 = p.y * 0.5 + 0.5;
  float t = uTime * uSpeed;

  vec2 q = p + vec2(fbm(vec2(p.y * 2.0 - t * 0.6, t * 0.2)), 0.0) * uTwist;
  float f = 0.0;
  for (int j = 0; j < 4; j++) {
    float phase = float(j) * 1.7;
    float xj = 0.12 * sin(q.y * 3.0 + t + phase) * uWidth * 3.0;
    // O piso evita o infinito exatamente sobre o filamento.
    f += 0.004 / max(abs(q.x - xj), 0.0015);
  }

  float envelope = smoothstep(uWidth * 1.6, 0.0, abs(q.x)) * smoothstep(1.2, 0.2, p.y);
  float entry = mix(smoothstep(y01 - 0.2, y01, uTime * 0.8), 1.0, uReveal);
  float age = uTime - uPulse;
  float band = uPulse >= 0.0
    ? exp(-pow((y01 - age * 1.2) / 0.05, 2.0)) * exp(-age * 1.5)
    : 0.0;

  vec3 base = mix(uColors[0], uColors[1], smoothstep(0.1, 0.9, y01));
  vec3 core = mix(base, vec3(1.0), clamp(f * 0.15, 0.0, 0.7));
  vec3 halo = base * 0.25 * exp(-abs(q.x) / uWidth * 2.0);

  float grain = (hash(gl_FragCoord.xy + fract(uTime)) - 0.5) * 2.0 * uGrain * 0.04;
  float light = f * envelope + 1.5 * band * envelope;
  vec3 color = (core * light + halo * envelope) * entry + grain;
  color *= uIntensity;
  float dither = (hash(gl_FragCoord.xy * 1.37) - 0.5) / 255.0;
  float alpha = clamp(max(color.r, max(color.g, color.b)) + dither, 0.0, 1.0);
  color = clamp(color, 0.0, alpha);
  fragColor = vec4(color, alpha);
}`;
