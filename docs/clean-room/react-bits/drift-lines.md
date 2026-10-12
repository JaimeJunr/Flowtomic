# Spec de comportamento: `drift-lines`

> **Proveniência (clean room).** Escrita em 12/10/2026 a partir da demo pública "Floating Lines"
> em `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.
> Segue o contrato `_fundo-webgl.md`. Versão enxuta: o original tem 15 props.

## O que a pessoa vê

**Feixes de fios finos de luz** que atravessam a tela em curvas suaves, como fitas de seda
flutuando. Há até **três feixes** (alto, meio, baixo), cada um com vários fios paralelos e
próximos. Os fios **ondulam devagar**, brilham mais no miolo do feixe e trocam de cor ao longo
do comprimento num gradiente. Com o mouse, os fios **se curvam perto do ponteiro** e a cena
inteira desliza um pouco (paralaxe).

## API (`atoms/background/drift-lines`)

```ts
type DriftLinesProps = React.ComponentProps<"div"> & {
  colors?: [string, string];   // tokens do gradiente ao longo do fio; default ["--primary", "--info"]
  waves?: Array<"top" | "middle" | "bottom">; // default os três
  lineCount?: number;          // fios por feixe; 1–12, default 6
  lineGap?: number;            // espaço entre fios; 0,2–4, default 1
  speed?: number;              // default 1
  pointer?: boolean;           // curva e paralaxe; default true
  bend?: number;               // força da curva no ponteiro; −2…2, default −0.5
  children?: React.ReactNode;
};
```

## Regras

1. **Coordenadas.** `p` centrado, corrigido pela proporção (x em ±aspecto, y em ±1).
   `t = uTime·uSpeed`. Com ponteiro, `p += (uPointer − 0.5)·0.1` (paralaxe).
2. **Feixes.** Cada feixe tem centro e inclinação fixos: alto `y0 = 0.45`, inclinação `−0.15`;
   meio `0.0`, `0.1`; baixo `−0.5`, `−0.2`. Liga/desliga por `uWaves` (vec3 de 0/1).
3. **Fio.** Para o fio i (0…lineCount−1, máx. 12 no laço com `break`), a curva é
   `y(x) = y0 + incl·x + 0.18·sin(x·1.4 + t·0.5 + i·0.15) + 0.06·sin(x·3.1 − t·0.8 + i·0.4)
   + (i − (n−1)/2)·0.025·lineGap`.
4. **Curva no ponteiro.** `y(x) += bend·0.15·exp(−dist²/0.08)` com `dist` entre `(x, y(x))` e o
   ponteiro em coordenadas de `p`.
5. **Brilho.** `d = abs(p.y − y(x))`; fio `exp(−d·d/ (0.0006))`·`0.9` mais halo `exp(−d·18.0)·0.08`;
   peso do fio `1 − abs(i − (n−1)/2)/n` (miolo mais forte).
6. **Cor.** `mix(c1, c2, smoothstep(−aspecto, aspecto, p.x + 0.3·sin(t·0.2 + y0)))`; soma dos
   fios, `clamp`; alfa = `max3(cor)`, saída pré-multiplicada, dither. Story com raiz `dark bg-background`.
7. **Movimento reduzido.** Sem ponteiro e sem paralaxe.
8. **Fallback.** `linear-gradient(170deg, transparent 40%, color-mix(in oklch, var(--c1) 25%,
   transparent) 50%, transparent 60%)`.

## Testes mínimos

Contrato comum + exatamente dois tokens; `wavesMask(waves)` puro (`["top","bottom"]` → `[1,0,1]`,
vazio → `[0,0,0]`, valor inválido lança); limites de `lineCount`, `lineGap`, `bend`.
