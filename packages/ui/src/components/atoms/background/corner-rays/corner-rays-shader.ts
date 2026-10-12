// Leque de raios que entra por um canto, em duas camadas de cores. Saída pré-multiplicada,
// porque o contexto WebGL usa alpha padrão.
export const CORNER_RAYS_FRAGMENT_SHADER = `#version 300 es
precision highp float;
uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColors[2];
uniform vec2 uOrigin;
uniform vec2 uCorner;
uniform float uIntensity;
uniform float uSpread;
uniform float uTilt;
uniform float uBlend;
uniform float uFalloff;
uniform float uSpeed;
out vec4 fragColor;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

// Diferença angular levada para -pi..pi.
float wrapAngle(float a) {
  return atan(sin(a), cos(a));
}

void main() {
  vec2 unit = gl_FragCoord.xy / uResolution;
  vec2 scale = vec2(uResolution.x / uResolution.y, 1.0);
  vec2 d = (unit - uOrigin) * scale;
  float r = length(d);
  float a = atan(d.y, d.x);

  // O eixo aponta do canto para o centro da tela, girado por uTilt.
  vec2 toCenter = (vec2(0.5) - uCorner) * scale;
  float axis = atan(toCenter.y, toCenter.x) + radians(uTilt);
  float t = uTime * uSpeed;

  vec3 layers[2];
  for (int k = 0; k < 2; k++) {
    float fk = float(k);
    float da = wrapAngle(a - (axis + (fk - 0.5) * 0.25 * uSpread));
    float rays = pow(0.5 + 0.5 * sin(da * (9.0 + 4.0 * fk) + t * (0.6 + 0.3 * fk)
      + sin(da * 23.0 - t) * 0.6), 3.0);
    float window = exp(-da * da * (4.0 / (uSpread * uSpread)));
    layers[k] = uColors[k] * rays * window;
  }

  float fall = exp(-r * uFalloff) + 0.4 * exp(-r * uFalloff * 4.0);
  vec3 color = mix(layers[0], layers[1], uBlend) * fall * uIntensity;
  float dither = (hash(gl_FragCoord.xy * 1.37) - 0.5) / 255.0;
  float alpha = clamp(max(color.r, max(color.g, color.b)) + dither, 0.0, 1.0);
  color = clamp(color, 0.0, alpha);
  fragColor = vec4(color, alpha);
}`;
