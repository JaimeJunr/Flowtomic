# Spec de comportamento: `wave-bar-slider`

> **Proveniência (clean room).** Escrita em 09/10/2026 a partir da demo pública "Wake Slider" em
> `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.

## O que a pessoa vê

Um slider desenhado com uma fileira de barrinhas verticais (32). As barras até o valor ficam
acesas, as outras apagadas, todas baixas em repouso. Quando a alça se move, as barras **perto
dela sobem** formando uma "esteira" (onda) cuja altura depende da **velocidade**: arrastar rápido
levanta muito, devagar quase nada. A esteira é mais larga atrás da alça do que na frente. Parado,
tudo baixa suavemente.

## API (`atoms/forms/wave-bar-slider`)

```ts
type WaveBarSliderProps = Omit<React.ComponentProps<typeof SliderPrimitive.Root>,
  "value" | "defaultValue" | "onValueChange" | "orientation" | "children"> & {
  value?: number;
  defaultValue?: number;             // default 50
  onValueChange?: (value: number) => void;
  bars?: number;                     // default 32
  height?: number;                   // default 48 (teto da onda, px)
  restHeight?: number;               // default 10
  sensitivity?: number;              // default 1
  /** Meia-largura da onda em velocidade máxima, em barras. */
  reach?: number;                    // default 6
  /** 0 = simétrica; >0 = mais larga atrás. */
  skew?: number;                     // default 0.6
  showValue?: boolean;               // default false
  formatValue?: (value: number) => string;
  "aria-label"?: string;             // default "Valor"
};
```
`min` (0), `max` (100), `step` (1), `disabled`, `className`, `ref` do Radix Slider.

## Regras

1. **Base:** `@radix-ui/react-slider` (teclado, `role="slider"`, `aria-valuetext` com
   `formatValue`). O `Track` do Radix fica invisível, ocupando a área das barras; o `Thumb` é uma
   alça fina (`h-full w-1 rounded-full bg-foreground` ou similar) visível só no foco/arrasto.
2. **Cores (só tokens):** acesas `bg-primary`, apagadas `bg-muted`.
3. **Velocidade:** a cada quadro, `v = |Δvalor| / Δt` normalizado pela faixa, suavizado
   exponencialmente (~100 ms). Energia `e = clamp(v * sensitivity * k, 0, 1)`.
4. **Altura de cada barra** (função pura `barHeight(i, handlePos, direction, e, opts)`):
   distância `d` da barra à alça em barras; largura efetiva `w = reach * e` (atrás multiplicada por
   `1 + skew`); se `w=0` ou `d > w` → `restHeight`; senão
   `restHeight + (height - restHeight) * e * cos²(π/2 * d / w)`. "Atrás" = lado oposto ao
   movimento.
5. **Render:** barras com `transform: scaleY` sobre a altura máxima (origem embaixo), atualizado
   por rAF sem re-render do React a cada quadro (refs). Em repouso o loop para.
6. `showValue`: texto `tabular-nums` à direita.
7. **Disabled:** `opacity-50`.

## Movimento reduzido

Sem onda: todas as barras na altura de repouso; só acende/apaga.

## Marcação

Raiz: `data-slot="wave-bar-slider"`. Barras: `wave-bar-slider-bar` com `data-lit`.

## Testes mínimos

- Pura `barHeight`: energia 0 → repouso; na alça com e=1 → `height`; atrás mais larga que na
  frente com skew>0; skew 0 simétrica; fora do alcance → repouso.
- Pura `litCount(value, min, max, bars)`: 0 → 0 barras, máx → todas, meio → metade.
- Teclado: seta direita sobe `step`, chama `onValueChange`; `aria-valuetext` usa `formatValue`.
- Número de barras = `bars`; `data-lit` bate com o valor.
- `showValue` mostra o número. Disabled. Movimento reduzido. `ref`/`className`.
