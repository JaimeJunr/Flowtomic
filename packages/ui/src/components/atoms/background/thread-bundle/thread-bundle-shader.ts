// Feixe de fios finos que ondulam juntos e se abrem em leque ao longo do caminho.
// Saída pré-multiplicada (alfa = traço), para compor sobre a página nos dois temas.
export const THREAD_BUNDLE_FRAGMENT_SHADER = `#version 300 es
precision highp float;
uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColor;
uniform vec3 uAccent;
uniform float uSpeed;
uniform float uLineCount;
uniform float uThickness;
uniform float uAmplitude;
uniform float uSpread;
uniform float uSplit;
uniform float uAngle;
uniform vec2 uPointer;
uniform float uPointerStrength;
out vec4 fragColor;

void main() {
  float t = uTime * uSpeed;
  // p.y vai de -1 a 1; x segue a proporção. Girar em espaço corrigido não deforma os fios.
  vec2 p = (gl_FragCoord.xy - uResolution * 0.5) / (uResolution.y * 0.5);
  float c = cos(uAngle);
  float sn = sin(uAngle);
  p = mat2(c, -sn, sn, c) * p;

  float s = p.x * 0.5 + 0.5;
  float open = smoothstep(uSplit, uSplit + 0.6, s);

  float amp = uAmplitude + (uPointer.y - 0.5) * 0.3 * uPointerStrength;
  float phase = t + (uPointer.x - 0.5) * 2.0 * uPointerStrength;

  float a = 0.0;
  vec3 color = uColor;
  float last = max(uLineCount - 1.0, 1.0);
  for (int i = 0; i < 160; i++) {
    if (float(i) >= uLineCount) break;
    float k = float(i) / last - 0.5;
    float y = amp * 0.15 * sin(s * 6.0 + phase + k * open * 2.0) + k * uSpread * open * 1.2;
    float d = abs(p.y - y) * uResolution.y * 0.5;
    float w = uThickness * (1.0 + open * abs(k) * 3.0);
    float line = 1.0 - smoothstep(w * 0.5, w + 1.0, d);
    float weight = max(1.0 - 0.85 * abs(k) * 2.0 * open, 0.0);
    float strength = line * weight;
    if (strength > a) {
      a = strength;
      color = mix(uColor, uAccent, abs(k) * 2.0);
    }
  }

  // Ruído de meio degrau de 8 bits no alfa quebra as faixas dos fios que esmaecem.
  float dither = (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) / 255.0;
  a = clamp(a * 1.2 + dither, 0.0, 1.0);
  fragColor = vec4(color * a, a);
}`;
