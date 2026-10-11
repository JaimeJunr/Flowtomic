// Papel holográfico: dobras líquidas por deformação de domínio; a cor vem de um arco-íris por cosseno
// indexado pela fase da dobra. Saída pré-multiplicada (alfa 1), como nos demais fundos.
export const IRIDESCENT_FOIL_FRAGMENT_SHADER = `#version 300 es
precision highp float;
uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uTint;
uniform float uSpeed;
uniform float uScale;
uniform float uDetail;
uniform float uSaturation;
uniform vec2 uPointer;
uniform float uPointerStrength;
uniform float uDark;
out vec4 fragColor;

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  float aspect = uResolution.x / uResolution.y;
  float t = uTime * uSpeed * 0.12;
  vec2 p = uv * 3.0 / uScale;
  p.x *= aspect;
  // O ponteiro empurra o padrão na direção dele.
  p += (uPointer - 0.5) * 0.3 * uPointerStrength;
  // Limite fixo do laço: o driver não aceita contagem dinâmica em todo hardware.
  for (int i = 0; i < 8; i++) {
    if (float(i) >= uDetail) break;
    float fi = float(i);
    p += vec2(sin(p.y * 1.3 + t + fi), cos(p.x * 1.1 - t * 0.8 + fi * 1.7)) * 0.6 / (fi + 1.0);
  }
  float h = 0.5 + 0.5 * sin(p.x + p.y);
  vec3 rgb = 0.5 + 0.5 * cos(6.2832 * (h + vec3(0.0, 0.33, 0.67)));
  float luma = dot(rgb, vec3(0.299, 0.587, 0.114));
  rgb = mix(vec3(luma), rgb, uSaturation);
  rgb = mix(rgb, vec3(1.0), 0.35);
  rgb *= uTint;
  vec2 d = (uv - uPointer) * vec2(aspect, 1.0);
  rgb += 0.15 * exp(-8.0 * dot(d, d)) * uPointerStrength;
  rgb *= mix(1.0, 0.35, uDark);
  // Ruído de meio degrau de 8 bits quebra as faixas do gradiente longo.
  float dither = (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) / 255.0;
  rgb = clamp(rgb + dither, 0.0, 1.0);
  fragColor = vec4(rgb, 1.0);
}`;
