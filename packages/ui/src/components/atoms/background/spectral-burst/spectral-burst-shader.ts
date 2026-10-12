// Raios de luz saindo de um miolo escuro. O ruído angular entra por (cos, sin) do ângulo,
// senão apareceria uma costura em +-pi. Saída pré-multiplicada (contexto WebGL com alpha).
export const SPECTRAL_BURST_FRAGMENT_SHADER = `#version 300 es
precision highp float;
uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColors[2];
uniform float uSpeed;
uniform float uIntensity;
uniform float uSway;
uniform float uDistort;
uniform float uRayCount;
uniform vec2 uCenter;
out vec4 fragColor;

float hash(vec2 x) {
  return fract(sin(dot(x, vec2(127.1, 311.7))) * 43758.5453);
}

float valueNoise(vec2 x) {
  vec2 i = floor(x);
  vec2 f = fract(x);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 x) {
  float sum = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 4; i++) {
    sum += amp * valueNoise(x);
    x = x * 2.03 + vec2(17.0, 9.0);
    amp *= 0.5;
  }
  return sum / 0.9375;
}

void main() {
  vec2 p = (gl_FragCoord.xy - uResolution * (0.5 + uCenter)) / uResolution.y;
  float r = length(p);
  float a = atan(p.y, p.x);
  float t = uTime * uSpeed;

  // Giro contínuo ou balanço, mais a dobra que cresce com a distância.
  a += mix(t * 0.3, sin(t * 0.8) * 0.6, uSway);
  a += uDistort * 0.05 * sin(r * 3.0 - t * 1.5);

  // Só o ângulo entra no ruído: somar o raio curvava os raios em redemoinho.
  vec2 ring = vec2(cos(a), sin(a)) * (24.0 / 3.14159265) + vec2(0.0, t * 0.2);
  float rays = pow(fbm(ring), 2.5);
  if (uRayCount > 0.5) {
    rays *= pow(0.5 + 0.5 * cos(a * uRayCount), 4.0);
  }

  rays *= smoothstep(0.02, 0.35, r) * (0.6 + 0.4 * sin(r * 4.0 - t * 2.0));

  float mixAmount = 0.5 + 0.5 * sin(a * 2.0 + r * 3.0 - t);
  vec3 color = mix(uColors[0], uColors[1], mixAmount) * rays * uIntensity;

  float alpha = clamp(max(color.r, max(color.g, color.b)), 0.0, 1.0);
  // Ruído de meio degrau de 8 bits quebra as faixas do gradiente longo.
  float dither = (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) / 255.0;
  alpha = clamp(alpha + dither, 0.0, 1.0);
  fragColor = vec4(clamp(color, vec3(0.0), vec3(alpha)), alpha);
}`;
