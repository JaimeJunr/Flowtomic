# Spec de comportamento: `light-blinds`

> **Proveniência (clean room).** Escrita em 11/10/2026 a partir da demo pública "Gradient Blinds"
> em `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.
> Segue o contrato `_fundo-webgl.md`. Versão enxuta: o original tem 16 props.

## O que a pessoa vê

Uma **persiana** de lâminas verticais sobre fundo escuro. Cada lâmina tem um lado aceso e outro em
sombra, e o degradê das cores do tema corre pelas lâminas. Um **holofote** redondo segue o mouse:
dentro dele as lâminas brilham, fora delas quase somem. Sem mouse, o holofote fica no centro.

## API (`atoms/background/light-blinds`)

```ts
type LightBlindsProps = React.ComponentProps<"div"> & {
  colors?: string[];          // 1 a 8 tokens; default ["--primary", "--warning"]
  angle?: number;             // giro do degradê e das lâminas, em graus; default 0
  blindCount?: number;        // limite de lâminas; 2–64, default 16
  blindMinWidth?: number;     // largura mínima em px; default 60
  spotlightRadius?: number;   // relativo ao menor lado; 0,1–1,5, default 0.5
  spotlightSoftness?: number; // expoente da borda; 0,2–4, default 1
  shine?: "left" | "right";   // lado aceso de cada lâmina; default "left"
  noise?: number;             // 0–1, default 0.3
  speed?: number;             // velocidade do degradê; default 1
  pointer?: boolean;          // default true
  children?: React.ReactNode;
};
```

## Regras

1. **Número de lâminas** (puro, `effectiveBlindCount(width, blindCount, blindMinWidth)`):
   `max(1, min(blindCount, floor(width / blindMinWidth)))`, com `width` em px CSS.
2. **Coordenadas.** `uv = gl_FragCoord.xy / uResolution`, girado por `angle` em torno de 0,5.
   `t = uTime·uSpeed·0.1`.
3. **Degradê.** `g = fract(uv.x + t)`; cor por interpolação linear entre as cores vizinhas da lista
   (paleta circular). Até 8 cores num array de uniforms, mais `uColorCount`.
4. **Lâmina.** `s = fract(uv.x·N)` (`N` da regra 1); luz da lâmina `pow(s, 1.5)` (ou de `1 − s`
   com `shine = "right"`).
5. **Holofote.** Distância de `gl_FragCoord` ao ponteiro (px), dividida por
   `spotlightRadius·min(uResolution)`; `spot = pow(clamp(1 − d, 0, 1), spotlightSoftness)`.
6. **Saída** pré-multiplicada: `a = luz·spot`; cor = `degradê·a`; mais ruído com sinal
   `noise·0.06` e o dither. Story com raiz `dark bg-background`.
7. **Ponteiro** (contrato regra 8); em repouso e em movimento reduzido, no centro.
8. **Fallback.** `repeating-linear-gradient(90deg, color-mix(in oklch, var(--c1) 50%, transparent)
   0 30px, transparent 30px 60px)` sob uma máscara radial ao centro.

## Testes mínimos

Contrato comum + `effectiveBlindCount`; de 1 a 8 tokens (lança fora disso; 1 token é repetido);
limites de `blindCount`, `spotlightRadius`, `spotlightSoftness`, `noise`.
