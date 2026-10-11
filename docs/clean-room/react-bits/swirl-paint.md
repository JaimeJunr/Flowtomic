# Spec de comportamento: `swirl-paint`

> **Proveniência (clean room).** Escrita em 11/10/2026 a partir da demo pública "Balatro" em
> `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.
> Segue o contrato `_fundo-webgl.md`. Versão enxuta: o original tem 13 props.

## O que a pessoa vê

**Tinta de três cores girando** como num redemoinho: o centro gira mais rápido que as bordas, e
as cores se esticam em faixas que se enroscam. Os limites entre as cores são nítidos, com leve
**pixelização**, lembrando tela de jogo antigo. O mouse **desloca o centro** do giro.

## API (`atoms/background/swirl-paint`)

```ts
type SwirlPaintProps = React.ComponentProps<"div"> & {
  colors?: [string, string, string]; // tokens; default ["--primary", "--info", "--background"]
  speed?: number;      // default 1
  spin?: number;       // força e sentido do giro; −3–3, default 1
  contrast?: number;   // nitidez entre as cores; 0,5–4, default 2
  pixelSize?: number;  // tamanho do pixel em px de tela, 1 = sem pixelização; 1–12, default 2
  pointer?: boolean;   // default true
  children?: React.ReactNode;
};
```

## Regras

1. **Pixelização.** `frag = (floor(gl_FragCoord.xy / pixelSize) + 0.5)·pixelSize`. Todo o resto
   usa `frag` no lugar de `gl_FragCoord.xy`. `pixelSize` em pixels de tela (multiplicar pelo DPR
   no JS).
2. **Coordenadas.** `p = (frag − uResolution/2) / uResolution.y · 2.0`, menos o deslocamento do
   ponteiro (regra 6). `t = uTime·uSpeed`.
3. **Giro.** `r = length(p)`; girar `p` pelo ângulo `spin·(1.5 − r)·1.2 + t·0.3·spin`.
4. **Tinta.** Cinco passos: `p += 0.5·vec2(sin(p.y·1.3 + t·0.2 + i), cos(p.x·1.1 − t·0.15 + i·1.7))`,
   `i = 0..4`. Depois `f = 0.5 + 0.5·sin(length(p)·2.0 + p.x)`.
5. **Cor.** Com `e = 0.25 / contrast`: `cor = mix(c3, c2, smoothstep(0.35 − e, 0.35 + e, f))`,
   depois `mix(cor, c1, smoothstep(0.65 − e, 0.65 + e, f))`. Alfa 1.
6. **Ponteiro** (contrato regra 8): o centro anda `(uPointer − 0.5)·0.6`.
7. **Fallback.** `conic-gradient(from 0deg, var(--c1), var(--c2), var(--c3), var(--c1))`.

## Testes mínimos

Contrato comum + exatamente três tokens; `spin` limitado a −3–3, `contrast` a 0,5–4, `pixelSize`
inteiro de 1 a 12.
