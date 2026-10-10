# Spec de comportamento: `pixel-reveal`

> **Proveniência (clean room).** Escrita em 09/10/2026 a partir da demo pública "Pixel Transition"
> em `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.

## O que a pessoa vê

Um card com um conteúdo (uma foto, um número). Ao passar o ponteiro (ou clicar), uma **grade de
pixels** quadrados cobre o card aos poucos, em ordem aleatória; quando cobre tudo, o conteúdo
troca por baixo e os pixels **somem** de novo, revelando o segundo conteúdo. Ao sair, o mesmo
caminho de volta. A ordem pode ser aleatória, em xadrez, em onda a partir do ponteiro, ou em
varredura a partir da borda por onde o ponteiro entrou.

## Por que existe (uso no produto)

Card de "antes/depois", número escondido (saldo), foto com legenda no verso.

## API (`atoms/animation/pixel-reveal`)

```ts
type PixelRevealProps = Omit<React.ComponentProps<"div">, "children"> & {
  firstContent: React.ReactNode;
  secondContent: React.ReactNode;
  /** Pixels na largura; as linhas seguem a proporção. */
  gridSize?: number;                                   // default 10
  /** Cor dos pixels. Token. */
  pixelColor?: string;                                 // default "var(--primary)"
  /** Segundos para cobrir, e de novo para descobrir. */
  stepDuration?: number;                               // default 0.4
  pattern?: "random" | "dither" | "ripple" | "wipe";   // default "random"
  /** Quebra a frente da onda/varredura, 0..1. */
  randomness?: number;                                 // default 0.3
  trigger?: "hover" | "click";                         // default "hover"
  /** Controlado. */
  active?: boolean;
  onActiveChange?: (active: boolean) => void;
  /** Depois de revelar, não volta. */
  once?: boolean;                                      // default false
  /** CSS aspect-ratio. */
  aspectRatio?: string;                                // default "1 / 1"
};
```

## Regras

1. **Estrutura.** Raiz `relative overflow-hidden rounded-lg border bg-card` com `aspect-ratio`.
   Duas camadas `absolute inset-0` com os conteúdos; só uma visível por vez (`hidden` na outra).
   Por cima, a grade `absolute inset-0 pointer-events-none aria-hidden` com `gridSize × linhas`
   células (`linhas = round(gridSize · altura/largura)`, medido com ResizeObserver).
2. **Ordem.** Função pura `revealOrder(cols, rows, pattern, origin, randomness, rng) → number[]`
   devolve, para cada célula, um atraso normalizado 0..1:
   - `random`: embaralhado (rng injetável para teste);
   - `dither`: matriz de Bayer 4×4 repetida;
   - `ripple`: distância até `origin` (ponto do ponteiro) normalizada, + ruído·randomness;
   - `wipe`: distância até a borda de entrada (`origin` diz o lado), + ruído·randomness.
3. **Fase 1 (cobrir).** Cada célula aparece (opacidade 0 → 1, escala 0,6 → 1) no instante
   `atraso · stepDuration`. No fim, troca o conteúdo visível.
4. **Fase 2 (descobrir).** Cada célula some no mesmo esquema de ordem.
5. Se o estado muda no meio, a transição em curso é cancelada e recomeça da cobertura atual
   (sem pular para o fim).
6. **Gatilho.** `hover`: `pointerenter`/`pointerleave` e também `focus`/`blur` (a raiz é
   `tabIndex=0`). `click`: alterna, Enter/Espaço também. Controlado por `active` quando vier.
7. Pixels com `pixelColor`; padrão token.

## Movimento reduzido

Troca de conteúdo direta, com um fade de 150 ms, sem grade.

## Acessibilidade

- O conteúdo invisível fica `hidden` (fora da árvore de acessibilidade).
- `trigger="click"`: a raiz tem `role="button"` e `aria-pressed`.
- `trigger="hover"`: foco por teclado revela.

## Marcação

- Raiz: `data-slot="pixel-reveal"`, `data-state="first|covering|second|uncovering"`, `ref`, `cn`.
- Grade: `data-slot="pixel-reveal-grid"`; célula: `data-slot="pixel-reveal-cell"`.

## Testes mínimos

- `revealOrder`: tamanho `cols·rows`, valores em 0..1, `dither` determinístico, `ripple` com
  célula da origem = menor atraso, `wipe` da esquerda cresce com a coluna.
- Hover: com timers falsos, passa por `covering` e termina em `second`; sair volta a `first`.
- `click`: `role="button"`, alterna `aria-pressed`, Enter funciona.
- Controlado: `active` manda; `onActiveChange` chamado no hover.
- `once`: depois de `second`, sair não volta.
- Movimento reduzido: sem grade, troca direta.
- `ref` e `className`.
