// Metal líquido: coordenadas deformadas por seis harmônicos de cosseno, luz difusa suave e um
// reflexo fino nas cristas. O ponteiro empurra ondas concêntricas antes da distorção.
// Saída pré-multiplicada, porque o contexto WebGL usa alpha padrão.
export const LIQUID_METAL_FRAGMENT_SHADER = `#version 300 es
precision highp float;
uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColor;
uniform float uSpeed;
uniform float uAmplitude;
uniform float uFrequency;
// xy: posição normalizada (0-1, y para cima); z: força das ondas (0 sem ponteiro).
uniform vec3 uPointer;
out vec4 fragColor;

void main() {
  vec2 uv0 = (gl_FragCoord.xy - uResolution * 0.5) / uResolution.y;
  float t = uTime * uSpeed * 0.4;

  vec2 pointer = (uPointer.xy - 0.5) * vec2(uResolution.x / uResolution.y, 1.0);
  float d = distance(uv0, pointer);
  vec2 away = normalize(uv0 - pointer + 1e-5);
  uv0 += away * 0.02 * sin(d * 40.0 - uTime * 6.0) * exp(-d * 6.0) * uPointer.z;

  vec2 uv = uv0 * uFrequency;
  for (int n = 1; n <= 6; n++) {
    float i = float(n);
    uv.x += uAmplitude / i * cos(i * uv.y + t);
    uv.y += uAmplitude / i * cos(i * uv.x - t * 0.8);
  }

  float v = 0.5 + 0.5 * sin(uv.x + uv.y);
  float h = pow(1.0 - abs(sin(uv.x * 1.3 + uv.y)), 12.0);
  float shade = 0.12 + 0.35 * v + h;

  // Ruído de meio degrau de 8 bits quebra o degrau visível do gradiente longo.
  float dither = (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) / 255.0;
  float alpha = clamp(shade + dither, 0.0, 1.0);
  fragColor = vec4(uColor * shade, alpha);
}`;
