// Ondas de ruído suave em pontilhado ordenado. Saída pré-multiplicada.
export const DITHER_WAVES_FRAGMENT_SHADER = `#version 300 es
precision highp float;
uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColor;
uniform float uSpeed;
uniform float uScale;
uniform float uLevels;
uniform float uPixelSize;
uniform float uContrast;
uniform int uPattern;
uniform float uReveal;
uniform vec3 uTrail[12];
uniform int uTrailCount;
out vec4 fragColor;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float sum = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 4; i++) {
    sum += amp * vnoise(p);
    p = p * 2.0 + vec2(17.0, 9.0);
    amp *= 0.5;
  }
  return sum;
}

// Matriz de Bayer por bits: o bit menos significativo pesa mais, como na construção recursiva.
float bayer(vec2 cell, int bits) {
  ivec2 c = ivec2(mod(cell, float(1 << bits)));
  int value = 0;
  for (int i = 0; i < 3; i++) {
    if (i >= bits) break;
    int bx = (c.x >> i) & 1;
    int by = (c.y >> i) & 1;
    int offset = by == 0 ? (bx == 0 ? 0 : 2) : (bx == 0 ? 3 : 1);
    value = offset + 4 * value;
  }
  float total = float(1 << (2 * bits));
  return float(value) / total;
}

void main() {
  // Na entrada o bloco começa grande e cai até o tamanho pedido.
  float grow = mix(mix(8.0, 1.0, smoothstep(0.0, 0.8, uTime)), 1.0, uReveal);
  float block = uPixelSize * grow;
  vec2 cell = floor(gl_FragCoord.xy / block);
  vec2 frag = (cell + 0.5) * block;
  vec2 uv = frag / uResolution.y;

  float t = uTime * uSpeed;
  vec2 p = uv * 3.0 / uScale + vec2(t * 0.05, t * 0.03);
  vec2 warp = vec2(fbm(p + vec2(1.7, 9.2)), fbm(p + vec2(8.3, 2.8)));
  float v = fbm(p + 1.5 * (warp - 0.5));
  v = clamp((v - 0.5) * uContrast + 0.5, 0.0, 1.0);

  // Rastro do ponteiro: cada ponto apaga as ondas e some com a idade.
  vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
  float erase = 0.0;
  for (int i = 0; i < 12; i++) {
    if (i >= uTrailCount) break;
    vec2 d = (frag / uResolution - uTrail[i].xy) * aspect;
    float age = max(uTime - uTrail[i].z, 0.0);
    erase += 0.6 * exp(-dot(d, d) / 0.01) * exp(-age * 2.0);
  }
  v = clamp(v - erase, 0.0, 1.0);

  float b;
  if (uPattern == 0) b = bayer(cell, 2);
  else if (uPattern == 1) b = bayer(cell, 3);
  else b = fract(cell.y / 4.0);

  float steps = uLevels - 1.0;
  float q = clamp(floor(v * steps + b) / steps, 0.0, 1.0);
  fragColor = vec4(uColor * q, q);
}`;
