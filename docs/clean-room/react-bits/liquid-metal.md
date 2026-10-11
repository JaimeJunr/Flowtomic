# Spec de comportamento: `liquid-metal`

> **Proveniência (clean room).** Escrita em 11/10/2026 a partir da demo pública "Liquid Chrome" em
> `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.
> Segue o contrato `_fundo-webgl.md`.

## O que a pessoa vê

Uma superfície de **metal líquido escuro** que ondula devagar. Nas cristas aparecem **reflexos
finos e brilhantes**, como cromo; o resto fica em sombra. Passar o mouse faz **ondas concêntricas**
saírem do ponteiro.

## API (`atoms/background/liquid-metal`)

```ts
type LiquidMetalProps = React.ComponentProps<"div"> & {
  color?: string;      // token dos reflexos; default "--foreground"
  speed?: number;      // default 1
  amplitude?: number;  // força da distorção; 0–1, default 0.3
  frequency?: number;  // densidade das ondas; 1–8, default 3
  pointer?: boolean;   // default true
  children?: React.ReactNode;
};
```

## Regras

1. **Coordenadas.** `uv0 = (gl_FragCoord.xy − uResolution/2) / uResolution.y`;
   `t = uTime·uSpeed·0.4`.
2. **Ondas do ponteiro** (contrato regra 8; antes do passo 3). `d = distance(uv0, ponteiro)`;
   `uv0 += normalize(uv0 − ponteiro + 1e-5)·0.02·sin(d·40.0 − uTime·6.0)·exp(−d·6.0)`, com
   ponteiro nas mesmas coordenadas.
3. **Distorção.** `uv = uv0·frequency`; para `i = 1..6`:
   `uv.x += amplitude/i·cos(i·uv.y + t)`; `uv.y += amplitude/i·cos(i·uv.x − t·0.8)`.
4. **Luz.** `v = 0.5 + 0.5·sin(uv.x + uv.y)`; reflexo `h = pow(1.0 − abs(sin(uv.x·1.3 + uv.y)), 12.0)`;
   `shade = 0.12 + 0.35·v + h`.
5. **Saída** pré-multiplicada: cor `uColor·shade`, alfa `clamp(shade, 0, 1)`; mais o dither do
   contrato. Story com raiz `dark bg-background`.
6. **Fallback.** `linear-gradient(160deg, color-mix(in oklch, var(--c) 25%, transparent),
   transparent 60%)`.

## Testes mínimos

Contrato comum + `clampUnit` em `amplitude`; `frequency` limitado a 1–8.
