# Spec de comportamento: `grain-gradient`

> **Proveniência (clean room).** Escrita em 11/10/2026 a partir da demo pública "Grainient" em
> `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.
> Segue o contrato `_fundo-webgl.md`. Versão enxuta: o original tem 22 props; ficam as que mudam
> o resultado.

## O que a pessoa vê

Um **degradê de três cores** que ocupa a área inteira, com manchas grandes e macias que
**escorrem** devagar umas sobre as outras, levemente onduladas. Por cima, um **grão de filme**
fino dá textura de papel impresso. É opaco: funciona como fundo de hero.

## API (`atoms/background/grain-gradient`)

```ts
type GrainGradientProps = React.ComponentProps<"div"> & {
  colors?: [string, string, string]; // tokens; default ["--primary", "--info", "--warning"]
  speed?: number;      // default 1
  warp?: number;       // ondulação; 0–2, default 1
  softness?: number;   // 0 manchas nítidas – 1 tudo misturado; default 0.4
  contrast?: number;   // 0,5–2, default 1.2
  grain?: number;      // 0–1, default 0.1
  zoom?: number;       // default 1
  children?: React.ReactNode;
};
```

## Regras

1. **Coordenadas.** `uv = gl_FragCoord.xy / uResolution`, centrado em 0,5, `x` corrigido pela
   proporção, dividido por `zoom`. `t = uTime·uSpeed·0.25`.
2. **Ondulação.** `uv += warp·0.05·vec2(sin(uv.y·6.0 + t·2.0), cos(uv.x·5.0 − t·1.6))`.
3. **Manchas.** Três centros `c_i = 0.5 + 0.3·vec2(sin(t·a_i + i), cos(t·b_i + 2i))`, com
   `a = (0.9, 1.3, 0.7)` e `b = (1.1, 0.8, 1.5)`, corrigidos pela proporção como o `uv`.
   Peso `w_i = exp(−dist²/(0.04 + softness·0.25))`.
4. **Cor.** `col = Σ w_i·cor_i / Σ w_i` (somar `1e-4` ao divisor); contraste
   `(col − 0.5)·contrast + 0.5`, com `clamp`.
5. **Grão.** Ruído por pixel, estático, com sinal, amplitude `grain·0.25`; mais o dither do
   contrato.
6. **Saída** opaca (alfa 1).
7. **Fallback.** `linear-gradient(135deg, var(--c1), var(--c2), var(--c3))`.

## Testes mínimos

Contrato comum + exatamente três tokens (lança com outra quantidade); `clampUnit` em `softness` e
`grain`; `contrast` limitado a 0,5–2; `warp` a 0–2.
