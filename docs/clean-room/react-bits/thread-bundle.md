# Spec de comportamento: `thread-bundle`

> **Proveniência (clean room).** Escrita em 11/10/2026 a partir da demo pública "Threads" em
> `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.
> Segue o contrato `_fundo-webgl.md`. Versão enxuta: o original tem 21 props.

## O que a pessoa vê

Um **feixe de dezenas de fios finos** atravessa a tela na diagonal, ondulando junto como uma
fita de seda. Num ponto do caminho os fios **se soltam** uns dos outros e se abrem em leque; os de
fora ficam mais fracos e mais macios. O feixe ondula devagar; o mouse empurra a onda.

## API (`atoms/background/thread-bundle`)

```ts
type ThreadBundleProps = React.ComponentProps<"div"> & {
  color?: string;        // token; default "--foreground"
  accentColor?: string;  // token para onde os fios de fora puxam; opcional
  lineCount?: number;    // 8–160, default 90
  thickness?: number;    // px; 0,3–3, default 0.6
  amplitude?: number;    // altura da onda; 0–3, default 1.7
  spread?: number;       // abertura entre fios; 0–1, default 0.4
  split?: number;        // onde o feixe começa a se abrir, 0–1 ao longo do caminho; default 0.04
  angle?: number;        // graus; default 25
  speed?: number;        // default 0.6
  pointer?: boolean;     // default false
  children?: React.ReactNode;
};
```

## Regras

1. **Coordenadas.** `p` centrado, corrigido pela proporção, girado por `angle`; `s = p.x·0.5 + 0.5`
   é a posição ao longo do caminho (0 a 1). `t = uTime·uSpeed`.
2. **Abertura.** `open = smoothstep(split, split + 0.6, s)`.
3. **Fio `i`** (`i = 0..lineCount−1`, laço até 160 com `break`), `k = i/(lineCount−1) − 0.5`:
   `y_i = amplitude·0.15·sin(s·6.0 + t + k·open·2.0) + k·spread·open·1.2`.
4. **Traço.** `d = abs(p.y − y_i)` em px (multiplicar por `uResolution.y/2`); largura
   `w = thickness·(1 + open·abs(k)·3.0)`; `a_i = smoothstep(w + 1.0, w·0.5, d)`; peso dos de fora
   `1 − 0.85·abs(k)·2.0·open`.
5. **Cor.** Acumula `a = max(a, a_i·peso)` e a mistura `mix(uColor, uAccent, abs(k)·2.0)` (sem
   `accentColor`, `uAccent = uColor`). Brilho total `·1.2`.
6. **Ponteiro** (contrato regra 8): soma `(uPointer.y − 0.5)·0.3` à amplitude e desloca a fase
   em `(uPointer.x − 0.5)·2.0`.
7. **Saída** pré-multiplicada, mais o dither. Story com raiz `dark bg-background`.
8. **Fallback.** `linear-gradient(155deg, transparent 40%, color-mix(in oklch, var(--c) 25%,
   transparent) 50%, transparent 60%)`.

## Testes mínimos

Contrato comum + limites de `lineCount` (inteiro), `thickness`, `amplitude`, `spread`, `split`;
`accentColor` ausente usa a cor principal.
