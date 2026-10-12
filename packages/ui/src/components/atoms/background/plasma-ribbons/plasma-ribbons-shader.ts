// Duas fitas de plasma que se enroscam no próprio caminho. Saída pré-multiplicada, porque o
// contexto WebGL usa alpha padrão.
export const PLASMA_RIBBONS_FRAGMENT_SHADER = `#version 300 es
precision highp float;
uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColors[2];
uniform float uSpeed;
uniform float uReverse;
uniform vec2 uBend;
uniform float uThickness;
uniform float uRotation;
uniform float uGlow;
uniform float uCore;
uniform float uGrain;
uniform vec2 uPointer;
uniform float uPointerAmount;
uniform float uReveal;
out vec4 fragColor;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

vec2 rotate2(vec2 v, float angle) {
  float cs = cos(angle);
  float sn = sin(angle);
  return vec2(cs * v.x - sn * v.y, sn * v.x + cs * v.y);
}

void main() {
  vec2 p = rotate2((gl_FragCoord.xy - uResolution * 0.5) / uResolution.y * 2.0, uRotation);
  vec2 pointerP = rotate2((uPointer * uResolution - uResolution * 0.5) / uResolution.y * 2.0, uRotation);
  float t = uTime * uSpeed;
  float distSq = dot(p - pointerP, p - pointerP);
  float swell = 1.0 + 0.8 * exp(-distSq * 12.0) * uPointerAmount;

  vec3 total = vec3(0.0);
  for (int k = 0; k < 2; k++) {
    float kf = float(k);
    float dir = (k == 1 && uReverse > 0.5) ? -1.0 : 1.0;
    float center = 0.25 * sin(p.x * 1.6 + dir * t * 0.5 + kf * 2.1)
                 + 0.12 * sin(p.x * 3.1 - dir * t * 0.35 + kf);
    float wobble = uBend[k] * 0.08 * sin(p.x * 9.0 + dir * t * 1.5);
    float th = uThickness * 0.12 * (0.6 + 0.4 * sin(p.x * 2.3 + t * 0.7 + kf)) * swell;
    float d = abs(p.y - center - wobble);
    float body = smoothstep(th, 0.0, d);
    float halo = exp(-d / (th * 2.5 + 0.01)) * 0.5 * uGlow;
    vec3 c = uColors[k] * (body + halo);
    c = mix(c, vec3(1.0), uCore * body * body);
    total += c;
  }

  float entry = mix(smoothstep(0.0, 1.0, uTime * 0.8 - abs(p.x) * 0.4), 1.0, uReveal);
  float grain = (hash(gl_FragCoord.xy + fract(uTime)) - 0.5) * 2.0 * uGrain;
  vec3 color = total * entry + grain;
  float dither = (hash(gl_FragCoord.xy * 1.37) - 0.5) / 255.0;
  float alpha = clamp(max(color.r, max(color.g, color.b)) + dither, 0.0, 1.0);
  color = clamp(color, 0.0, alpha);
  fragColor = vec4(color, alpha);
}`;
