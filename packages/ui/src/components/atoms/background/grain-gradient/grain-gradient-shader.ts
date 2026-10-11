// Três manchas de cor que escorrem, com ondulação leve e grão de filme estático por cima.
// Fundo opaco (alfa 1), então a saída pré-multiplicada é a própria cor.
export const GRAIN_GRADIENT_FRAGMENT_SHADER = `#version 300 es
precision highp float;
uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColors[3];
uniform float uSpeed;
uniform float uWarp;
uniform float uSoftness;
uniform float uContrast;
uniform float uGrain;
uniform float uZoom;
out vec4 fragColor;

void main() {
  float aspect = uResolution.x / uResolution.y;
  vec2 scale = vec2(aspect, 1.0);
  vec2 uv = (gl_FragCoord.xy / uResolution - 0.5) * scale / max(uZoom, 0.001);
  float t = uTime * uSpeed * 0.25;
  uv += uWarp * 0.05 * vec2(sin(uv.y * 6.0 + t * 2.0), cos(uv.x * 5.0 - t * 1.6));

  vec3 a = vec3(0.9, 1.3, 0.7);
  vec3 b = vec3(1.1, 0.8, 1.5);
  float denom = 0.04 + uSoftness * 0.25;
  vec3 sum = vec3(0.0);
  float total = 1e-4;
  for (int i = 0; i < 3; i++) {
    float fi = float(i);
    vec2 c = 0.3 * vec2(sin(t * a[i] + fi), cos(t * b[i] + 2.0 * fi)) * scale;
    vec2 d = uv - c;
    float w = exp(-dot(d, d) / denom);
    sum += w * uColors[i];
    total += w;
  }
  vec3 col = sum / total;
  col = clamp((col - 0.5) * uContrast + 0.5, 0.0, 1.0);

  // Grão com sinal, estático por pixel; o termo /255 é o dither que quebra faixas do gradiente.
  float noise = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5;
  col += noise * uGrain * 0.25 + noise / 255.0;
  fragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}`;
