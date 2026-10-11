// Leque de feixes que sai de um ponto fora da área: três camadas de cosseno elevado a potências
// diferentes, abertura limitada por ângulo e esmaecimento com a distância.
// Saída pré-multiplicada, porque o contexto WebGL usa alpha padrão.
export const LIGHT_BEAMS_FRAGMENT_SHADER = `#version 300 es
precision highp float;
uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColor;
uniform vec2 uOrigin;
uniform vec2 uDirection;
uniform float uAngle;
uniform float uSpread;
uniform float uLength;
uniform float uIntensity;
uniform float uSpeed;
out vec4 fragColor;

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  float aspect = uResolution.x / uResolution.y;
  // Unidade de distância = altura da área; o x é corrigido pela proporção.
  vec2 p = (uv - uOrigin) * vec2(aspect, 1.0);
  float d = length(p);

  vec2 base = normalize(uDirection * vec2(aspect, 1.0));
  float c = cos(uAngle);
  float s = sin(uAngle);
  vec2 dir = vec2(base.x * c - base.y * s, base.x * s + base.y * c);
  float theta = atan(dir.x * p.y - dir.y * p.x, dot(dir, p));

  float t = uTime * uSpeed;
  float k = 1.0 / uSpread;
  float l1 = pow(0.5 + 0.5 * cos(theta * 18.0 * k + t * 0.6), 6.0);
  float l2 = pow(0.5 + 0.5 * cos(theta * 31.0 * k - t * 0.9 + 1.7), 10.0);
  float l3 = pow(0.5 + 0.5 * cos(theta * 47.0 * k + t * 0.4 + 4.1), 16.0);
  float beams = clamp(l1 * 0.5 + l2 * 0.4 + l3 * 0.3, 0.0, 1.0);

  float aperture = 1.0 - smoothstep(0.0, 1.2 * uSpread, abs(theta));
  float fade = 1.0 - smoothstep(0.0, uLength, d);
  float alpha = beams * aperture * fade * uIntensity;
  // Ruído de meio degrau de 8 bits quebra o degrau visível do gradiente longo.
  float dither = (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) / 255.0;
  alpha = clamp(alpha + dither, 0.0, 1.0);
  fragColor = vec4(uColor * alpha, alpha);
}`;
