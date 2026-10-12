// Campo de estrelas em camadas: cada camada tem uma grade de células com no máximo uma estrela,
// e a escala da grade encolhe de perto para longe, o que dá a sensação de voar para dentro.
// Saída pré-multiplicada, porque o contexto WebGL usa alpha padrão.
export const STAR_WARP_FRAGMENT_SHADER = `#version 300 es
precision highp float;
uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColors[4];
uniform int uColorCount;
uniform float uDensity;
uniform int uLayers;
uniform float uStarSize;
uniform float uFlare;
uniform float uTwinkle;
uniform float uTravel;
uniform float uRotation;
uniform float uSpeed;
uniform vec2 uPointer;
uniform float uPointerAmount;
uniform float uClick;
uniform float uReveal;
out vec4 fragColor;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

vec2 hash2(vec2 p) {
  return vec2(hash(p), hash(p + 19.19));
}

// Distância percorrida: a velocidade de dobra (1 + 20 e^(-3 idade)) é integrada em vez de
// multiplicar o tempo, senão o campo daria um salto no instante do clique.
float travelled(float t) {
  float warp = (1.0 - uReveal) * (20.0 / 3.0) * (1.0 - exp(-3.0 * uTime));
  if (uClick >= 0.0) {
    warp += (20.0 / 3.0) * (1.0 - exp(-3.0 * max(uTime - uClick, 0.0)));
  }
  return t + warp;
}

vec3 starColor(float h) {
  int index = min(int(floor(h * float(uColorCount))), uColorCount - 1);
  return uColors[index];
}

void main() {
  float t = uTime * uSpeed;
  vec2 p = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y;

  vec2 away = p - (uPointer - 0.5) * vec2(uResolution.x / uResolution.y, 1.0);
  float dist = length(away);
  p += (dist > 0.0001 ? away / dist : vec2(0.0)) * 0.08 * exp(-dist * 6.0) * uPointerAmount;

  float angle = t * uRotation * 0.1;
  float c = cos(angle);
  float s = sin(angle);
  p = vec2(p.x * c - p.y * s, p.x * s + p.y * c);

  float layers = float(uLayers);
  float flow = uTravel * 0.05 * travelled(t);
  vec3 color = vec3(0.0);

  for (int i = 0; i < 8; i++) {
    if (i >= uLayers) break;
    float fi = float(i);
    float z = fract(fi / layers + flow);
    float scale = mix(12.0 * uDensity, 0.6, z);
    float layerLight = smoothstep(0.0, 0.3, z) * smoothstep(1.0, 0.85, z);

    vec2 q = p * scale + fi * 17.3;
    vec2 cell = floor(q);
    vec2 local = fract(q) - 0.5;
    vec2 offset = (hash2(cell) - 0.5) * 0.7;
    if (hash(cell + 3.1) >= 0.35 * uDensity) continue;

    float h = hash(cell + 7.7);
    vec2 delta = local - offset;
    float d = length(delta);
    float size = 0.03 * uStarSize * mix(0.5, 1.5, h);
    // Some antes da borda da célula, onde a estrela dos vizinhos já não alcança.
    // Halo curto: a cauda de size/d chegava à borda da célula e desenhava quadrados.
    float edge = 1.0 - smoothstep(size * 2.0, size * 6.0, d);
    float light = min(size * 0.7 / max(d, 0.001), 1.0) * edge;
    if (h > 0.85) {
      light += max(0.0, 1.0 - abs(delta.x * delta.y) * 800.0) * uFlare * 0.3 * edge;
    }
    light *= 1.0 - uTwinkle + uTwinkle * (0.5 + 0.5 * sin(t * 3.0 + h * 50.0));
    color += starColor(hash(cell + 1.9)) * light * layerLight;
  }

  color = min(color, vec3(1.0));
  float alpha = max(color.r, max(color.g, color.b));
  // Ruído de meio degrau de 8 bits quebra o degrau visível dos halos suaves.
  float dither = (hash(gl_FragCoord.xy + 7.31) - 0.5) / 255.0;
  alpha = clamp(alpha + dither, 0.0, 1.0);
  color = clamp(color + dither, 0.0, 1.0) * step(0.0001, alpha);
  fragColor = vec4(color, alpha);
}`;
