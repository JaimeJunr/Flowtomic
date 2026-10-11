// Faixa de luz que desce do topo; a borda de baixo ondula e a cor varia da esquerda para a direita.
// Saída pré-multiplicada, porque o contexto WebGL usa alpha padrão.
export const AURORA_GLOW_FRAGMENT_SHADER = `#version 300 es
precision highp float;
uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColors[3];
uniform float uAmplitude;
uniform float uBlend;
uniform float uIntensity;
uniform float uSpeed;
out vec4 fragColor;

// Soma de senos com fases diferentes, resultado em [-1, 1].
float waveNoise(float x, float t) {
  float n = sin(x * 1.7 + t * 2.1) * 0.5
          + sin(x * 3.1 - t * 1.3 + 1.7) * 0.3
          + sin(x * 5.3 + t * 0.7 + 4.2) * 0.2;
  return n;
}

vec3 rampColor(float x) {
  // smoothstep evita a quina da rampa linear no meio, que aparecia como faixa vertical.
  float left = smoothstep(0.0, 1.0, x * 2.0);
  float right = smoothstep(0.0, 1.0, x * 2.0 - 1.0);
  return mix(mix(uColors[0], uColors[1], left), uColors[2], right);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  float t = uTime * uSpeed * 0.1;
  float h = 0.55 + uAmplitude * 0.18 * waveNoise(uv.x * 2.0, t);
  float a = smoothstep(h - uBlend * 0.5, h + 0.2, uv.y);
  float alpha = a * uIntensity;
  // Ruído de meio degrau de 8 bits quebra o degrau visível do gradiente longo.
  float dither = (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) / 255.0;
  alpha = clamp(alpha + dither, 0.0, 1.0);
  fragColor = vec4(rampColor(uv.x) * alpha, alpha);
}`;
