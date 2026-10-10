# Spec de comportamento: `cursor-grid`

> **Proveniência (clean room).** Escrita em 09/10/2026 a partir da demo pública "Cursor Grid" em
> `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.

## O que a pessoa vê

Uma área com uma **grade invisível** de quadrados. Onde o ponteiro passa, as células próximas
**acendem** (contorno, e opcionalmente preenchimento leve), mais fortes perto do ponteiro e mais
fracas na borda do raio. Depois que o ponteiro sai, cada célula fica acesa um instante e **apaga
devagar**, deixando um rastro. Um clique solta um **anel** de células acesas que se expande.

## Por que existe (uso no produto)

Fundo vivo para hero, tela de login ou estado vazio, em tom técnico.

## API (`atoms/animation/cursor-grid`)

```ts
type CursorGridProps = React.ComponentProps<"div"> & {
  /** px */
  cellSize?: number;                          // default 56
  /** Cor dos traços. Token. */
  color?: string;                             // default "var(--primary)"
  /** px em volta do ponteiro que acendem. */
  radius?: number;                            // default 140
  falloff?: "linear" | "smooth" | "sharp";    // default "smooth"
  /** ms aceso antes de começar a apagar. */
  holdTime?: number;                          // default 400
  /** ms para apagar do máximo a 0. */
  fadeDuration?: number;                      // default 800
  lineWidth?: number;                         // default 1
  maxOpacity?: number;                        // default 1
  /** 0 = sem preenchimento. */
  fillOpacity?: number;                       // default 0
  /** Grade fraca sempre visível; 0 = escondida. */
  gridOpacity?: number;                       // default 0
  /** Raio dos cantos da célula, px. */
  cellRadius?: number;                        // default 0
  clickPulse?: boolean;                       // default true
  /** px/s */
  pulseSpeed?: number;                        // default 600
};
```

`children` fica por cima da grade (a grade é fundo).

## Regras

1. **Estrutura.** Raiz `relative overflow-hidden`. Primeiro filho: `<canvas>` `absolute inset-0
   pointer-events-none aria-hidden` (ResizeObserver, `devicePixelRatio`). Depois, `children` num
   `relative`.
2. **Brilho de uma célula.** Para a célula com centro `c` e ponteiro `p`:
   `t = 1 - dist(c, p)/radius` (0 fora do raio), e `brightness = curve(t)` com
   `linear: t`, `smooth: t²(3 - 2t)`, `sharp: t³` (função pura `falloffCurve(kind, t)`).
3. **Memória.** Cada célula guarda `(peak, lastLitAt)`. A cada quadro, `peak` vira
   `max(peak_atual_decaído, brightness)`. O valor desenhado é `cellAlpha(peak, agora - lastLitAt,
   holdTime, fadeDuration)`: igual a `peak` até `holdTime`, depois cai linear até 0 em
   `fadeDuration` (função pura).
4. **Pulso.** Clique cria um anel com raio `r = pulseSpeed · t`, largura `cellSize`; células cujo
   centro está a menos de `cellSize/2` do anel acendem com brilho 1. Some quando `r` passa a
   diagonal da área.
5. **Desenho.** Por quadro (`useFrameLoop`), só enquanto houver célula acesa ou pulso vivo (com
   `gridOpacity = 0` e nada aceso, o loop para). Cor resolvida a partir de `color` via
   `getComputedStyle` (aceita `var(--...)`).
6. Ponteiro: `pointermove`/`pointerleave` na raiz, só mouse e pen. Toque acende no `pointerdown`.

## Movimento reduzido

Sem rastro nem pulso: só a grade fraca (`gridOpacity`, ou 0,08 se for 0) desenhada uma vez.

## Sem canvas

Nada é desenhado; filhos normais.

## Acessibilidade

Decorativo; canvas `aria-hidden`. Não mexe em foco nem eventos dos filhos.

## Marcação

- Raiz: `data-slot="cursor-grid"`, `ref`, `cn`.
- Canvas: `data-slot="cursor-grid-canvas"`.

## Testes mínimos

- `falloffCurve` nos três tipos (0 → 0, 1 → 1, meio ordenado sharp < linear < smooth).
- `cellAlpha` antes de `holdTime`, no meio do fade e depois.
- Função de células no raio (`cellsInRadius(cols, rows, cellSize, p, radius)`).
- Com `FakeCanvasContext`, `pointermove` desenha células (rAF falso) e para o loop depois do fade.
- Clique cria pulso; `clickPulse={false}` não cria.
- Movimento reduzido: um desenho só, sem loop.
- `ref`, `className`, filhos.
