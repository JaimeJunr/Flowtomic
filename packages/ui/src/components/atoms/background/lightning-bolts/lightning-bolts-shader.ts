// Raios que descem do alto: caminho em zigue-zague de ruído de valor 1D, galhos que piscam e um
// raio extra que cai no ponto clicado. Tudo é medido em pixels de dispositivo; uScale converte as
// larguras (núcleo, brilho) de pixels CSS. Saída pré-multiplicada, porque o contexto WebGL usa
// alpha padrão.
export const LIGHTNING_BOLTS_FRAGMENT_SHADER = `#version 300 es
precision highp float;
uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColor;
uniform float uScale;
uniform int uBolts;
uniform float uSpread;
uniform float uBranches;
uniform float uAngle;
uniform float uThickness;
uniform float uGlow;
uniform float uFlicker;
uniform float uSpeed;
// xy: posição do mouse em pixels de dispositivo (y para cima); z: força da atração (0 sem mouse).
uniform vec3 uPointer;
// xy: ponto do clique em pixels de dispositivo; z: instante em segundos de uTime (negativo: nenhum).
uniform vec3 uStrike;
// 1 em movimento reduzido: sem entrada, piscar, galhos nem clique.
uniform float uStatic;
out vec4 fragColor;

vec2 gPointer;
float gPointerV;

float hash(float n) {
  return fract(sin(n * 127.1) * 43758.5453);
}

float hash3(float a, float b, float c) {
  return fract(sin(dot(vec3(a, b, c), vec3(127.1, 311.7, 74.7))) * 43758.5453);
}

float valueNoise(float x) {
  float i = floor(x);
  float f = fract(x);
  float u = f * f * (3.0 - 2.0 * f);
  return mix(hash(i), hash(i + 1.0), u);
}

// Leva do espaço da tela para o espaço do raio: x ao longo da largura, y para cima.
vec2 toBoltSpace(vec2 c) {
  float a = radians(uAngle);
  float cs = cos(a);
  float sn = sin(a);
  return vec2(cs * c.x + sn * c.y, -sn * c.x + cs * c.y);
}

// Deslocamento lateral do caminho, em pixels de dispositivo, com 5 oitavas de ruído.
float wander(float v, float seed, float t) {
  float sum = 0.0;
  float weight = 0.5;
  float freq = 6.0;
  for (int k = 0; k < 5; k++) {
    float n = valueNoise(v * freq + seed * 7.1 + t * 0.4);
    sum += weight * 0.25 * (n - 0.5) * 2.0;
    weight *= 0.5;
    freq *= 2.0;
  }
  return sum * uResolution.y * 0.5;
}

float boltX(float v, float b, float t) {
  float x0 = (b - float(uBolts - 1) * 0.5) * uSpread * 0.6 * uResolution.y * 0.5;
  float x = x0 + wander(v, b, t);
  return x + (gPointer.x - x) * 0.4 * exp(-abs(v - gPointerV) * 3.0) * uPointer.z;
}

// Núcleo e brilho de um traço a 'dist' pixels de dispositivo do centro dele.
vec2 stroke(float dist) {
  float d = dist / max(uScale, 0.0001);
  float core = exp(-d / (1.2 * uThickness));
  float glow = exp(-d / (18.0 * max(uGlow, 0.01))) * 0.5 * step(0.001, uGlow);
  return vec2(core, glow);
}

void main() {
  vec2 center = 0.5 * uResolution;
  vec2 q = toBoltSpace(gl_FragCoord.xy - center);
  float v = 0.5 - q.y / uResolution.y;
  vec2 pq = toBoltSpace(uPointer.xy - center);
  gPointer = vec2(pq.x, 0.0);
  gPointerV = 0.5 - pq.y / uResolution.y;
  float t = uTime * uSpeed;

  vec2 sum = vec2(0.0);
  for (int bi = 0; bi < 4; bi++) {
    if (bi >= uBolts) break;
    float b = float(bi);
    sum += stroke(abs(q.x - boltX(v, b, t)));
    for (int j = 0; j < 3; j++) {
      float fj = float(j);
      float vj = hash3(b, fj, floor(t * 2.0)) * 0.75;
      float local = v - vj;
      float shown = step(hash3(b, fj + 10.0, floor(t * 6.0)), uBranches) * (1.0 - uStatic);
      if (shown > 0.0 && local > 0.0 && local < 0.25) {
        float side = hash3(b, fj + 20.0, floor(t * 2.0)) > 0.5 ? 1.0 : -1.0;
        float bx = boltX(vj, b, t) + side * 0.6 * local * uResolution.y;
        sum += stroke(abs(q.x - bx)) * (0.6 * (1.0 - local / 0.25));
      }
    }
  }

  float flick = 1.0 - uFlicker * 0.5 * hash(floor(uTime * 20.0));
  if (hash(floor(uTime * 3.0) + 50.0) > 1.0 - 0.1 * uFlicker) flick *= 1.8;
  flick = mix(flick, 1.0, uStatic);
  float front = smoothstep(0.0, 0.8, uTime) * 1.1;
  float entry = mix(1.0 - smoothstep(front - 0.03, front, v), 1.0, uStatic);
  sum *= flick * entry;

  float age = uTime - uStrike.z;
  if (uStatic < 0.5 && uStrike.z >= 0.0 && age >= 0.0 && age < 0.6) {
    vec2 cq = toBoltSpace(uStrike.xy - center);
    float cv = 0.5 - cq.y / uResolution.y;
    float reach = cv * clamp(age / 0.08, 0.0, 1.0);
    if (cv > 0.01 && v <= reach) {
      // O seno zera o desvio nas pontas: o raio termina exatamente no clique.
      float x = cq.x + wander(v, 9.0 + uStrike.z, 0.0) * 1.5 * sin(3.14159 * v / cv);
      sum += stroke(abs(q.x - x)) * (exp(-age * 5.0) * 2.0);
    }
  }

  vec3 color = mix(uColor, vec3(1.0), clamp(sum.x * 0.8, 0.0, 1.0)) * (sum.x + sum.y);
  color = clamp(color, 0.0, 1.0);
  float dither = (hash(gl_FragCoord.x * 1.37 + gl_FragCoord.y * 91.7) - 0.5) / 255.0;
  float alpha = clamp(max(color.r, max(color.g, color.b)) + dither, 0.0, 1.0);
  color = min(color, vec3(alpha));
  fragColor = vec4(color, alpha);
}`;
