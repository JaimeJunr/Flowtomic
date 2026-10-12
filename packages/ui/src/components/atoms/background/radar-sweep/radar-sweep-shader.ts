// Tela de radar: grade polar, feixe que gira com rastro (ou anéis de sonar), contatos que
// derivam e chuvisco de retornos. Saída pré-multiplicada, porque o contexto WebGL usa alpha padrão.
export const RADAR_SWEEP_FRAGMENT_SHADER = `#version 300 es
precision highp float;
uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColor;
uniform float uMode;
uniform float uSpeed;
uniform float uTrail;
uniform float uScale;
uniform float uRings;
uniform float uSpokes;
uniform float uTargets;
uniform float uClutter;
uniform vec2 uPointer;
uniform float uPointerForce;
uniform float uStatic;
out vec4 fragColor;

const float TAU = 6.28318530718;

float hash(float n) {
  return fract(sin(n * 127.1) * 43758.5453);
}

float hash2(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float posMod(float x, float y) {
  return x - y * floor(x / y);
}

// Linha fina de ~1 px em torno de d == 0; d precisa ser contínuo para o fwidth valer.
float hairline(float d) {
  return 1.0 - smoothstep(0.0, fwidth(d) * 1.2, d);
}

// Distância perpendicular até a linha radial mais próxima entre 'count' igualmente espaçadas.
float spokeDistance(float a, float r, float count, out float index) {
  float unit = TAU / count;
  float q = a / unit + 0.5;
  index = floor(q);
  float da = (fract(q) - 0.5) * unit;
  return cos(da) > 0.0 ? abs(sin(da)) * r : r;
}

// Quanto um ponto (ângulo, raio) está aceso agora: atraso do feixe, ou distância ao anel.
float lit(float ang, float rad, float beam, float pulse, float dir, bool isPulse) {
  if (isPulse) return exp(-abs(rad - pulse) * 12.0) * (1.0 - pulse);
  return exp(-posMod(dir * (beam - ang), TAU) * 3.0);
}

void main() {
  float aspect = uResolution.x / uResolution.y;
  float unit = 0.5 * uScale;
  vec2 p = (gl_FragCoord.xy / uResolution - 0.5) * vec2(aspect, 1.0) / unit;
  float r = length(p);
  if (r > 1.02) {
    fragColor = vec4(0.0);
    return;
  }
  float a = posMod(atan(p.y, p.x), TAU);
  float dir = uSpeed < 0.0 ? -1.0 : 1.0;
  float flow = uStatic > 0.5 ? 0.0 : uTime;

  // Feixe: ângulo e atraso no sentido do giro; o quadro estático para o feixe a 45 graus.
  float beam = uStatic > 0.5 ? 0.785398 : posMod(uTime * uSpeed * 1.2, TAU);
  float pulse = uStatic > 0.5 ? 0.5 : fract(flow * abs(uSpeed) * 0.5);
  bool isPulse = uMode > 0.5;

  // Grade: anéis, rumos e marcas da borda.
  float ringValue = r * uRings;
  float ringLine = hairline(abs(fract(ringValue + 0.5) - 0.5));
  float reveal = uStatic > 0.5 ? 2.0 : uTime / 1.2;
  ringLine *= step(r, reveal) * smoothstep(0.0, 0.03, r);
  float edge = hairline(abs(r - 1.0));

  float spokeLine = 0.0;
  if (uSpokes > 0.5) {
    float idx;
    spokeLine = hairline(spokeDistance(a, r, uSpokes, idx)) * 0.35;
  }

  float tickIndex;
  float tickDist = spokeDistance(a, r, 72.0, tickIndex);
  float longTick = mod(tickIndex, 6.0) < 0.5 ? 1.0 : 0.0;
  float tickStart = mix(0.96, 0.92, longTick);
  float tickLine = hairline(tickDist) * step(tickStart, r) * step(r, 1.0);

  float grid = (ringLine + edge * 0.6 + spokeLine) * 0.25 + tickLine * 0.4;

  // Ponteiro: acende a grade por perto e vira um contato extra.
  vec2 m = (uPointer - 0.5) * vec2(aspect, 1.0) / unit;
  vec2 dm = p - m;
  float d2 = dot(dm, dm);
  float near = exp(-d2 / 0.02) * uPointerForce;
  grid += near * 0.6 * (ringLine + spokeLine + edge * 0.6);

  // Feixe com cabeça e rastro, ou anel de sonar.
  float sweep = 0.0;
  if (isPulse) {
    float dp = r - pulse;
    sweep = exp(-dp * dp * 150.0) * (1.0 - pulse);
  } else {
    float lag = posMod(dir * (beam - a), TAU);
    sweep = exp(-lag * 40.0) + exp(-lag / max(uTrail * 2.5, 0.02)) * 0.6;
  }
  sweep *= step(r, 1.0);

  // Contatos que derivam devagar.
  float contacts = 0.0;
  for (int i = 0; i < 16; i++) {
    if (float(i) >= uTargets) break;
    float fi = float(i);
    float rad = 0.2 + 0.7 * hash(fi + 1.0);
    float side = hash(fi + 13.1) > 0.5 ? 1.0 : -1.0;
    float ang = hash(fi + 7.3) * TAU + 0.05 * flow * side;
    vec2 pos = rad * vec2(cos(ang), sin(ang));
    vec2 dc = p - pos;
    float dd = dot(dc, dc);
    float blip = exp(-dd / 0.0006) + exp(-dd / 0.004) * 0.3;
    contacts += blip * lit(posMod(ang, TAU), rad, beam, pulse, dir, isPulse);
  }
  contacts += (exp(-d2 / 0.0006) + exp(-d2 / 0.004) * 0.3) * uPointerForce;

  // Chuvisco de retornos em células polares.
  vec2 cell = vec2(floor(r * 40.0), floor(a * 60.0 / TAU));
  vec2 inCell = vec2(fract(r * 40.0), fract(a * 60.0 / TAU)) - 0.5;
  float spark = step(1.0 - uClutter * 0.25, hash2(cell));
  float cellAngle = (cell.y + 0.5) * TAU / 60.0;
  float cellRadius = (cell.x + 0.5) / 40.0;
  float clutter = spark * (1.0 - smoothstep(0.25, 0.4, length(inCell))) * 0.7;
  clutter *= lit(cellAngle, cellRadius, beam, pulse, dir, isPulse) * smoothstep(0.04, 0.1, r) * step(r, 1.0);

  float intensity = grid + sweep + contacts + clutter;
  vec3 color = uColor * intensity;
  float dither = (hash2(gl_FragCoord.xy * 1.37) - 0.5) / 255.0;
  float alpha = clamp(max(color.r, max(color.g, color.b)) + dither, 0.0, 1.0);
  color = clamp(color, 0.0, alpha);
  fragColor = vec4(color, alpha);
}`;
