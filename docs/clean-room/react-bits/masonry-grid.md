# Spec de comportamento: `masonry-grid`

> **Proveniência (clean room).** Escrita em 11/10/2026 a partir da demo pública "Masonry" em
> `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**. A
> versão deles usava gsap; esta usa só `motion`.

## O que a pessoa vê

Um mural em **colunas de alturas variadas** (estilo Pinterest), sem buracos: cada item vai para a
coluna mais baixa. Ao montar, os itens **entram de uma direção** (de baixo, por padrão), um após
o outro, saindo de um **desfoque** para o nítido. Ao redimensionar a janela, o número de colunas
muda e os itens **deslizam até a nova posição**. No hover, o item **encolhe levemente**.

## Por que existe (uso no produto)

Mural de relatórios, notícias, prints ou cards de conteúdo com alturas diferentes.

## API (`molecules/data-display/masonry-grid`)

```ts
type MasonryItem = { id: string; height: number; content: React.ReactNode; href?: string };

type MasonryGridProps = React.ComponentProps<"div"> & {
  items: MasonryItem[];
  /** Colunas por largura mínima: [largura px, colunas], do maior para o menor. */
  breakpoints?: Array<[number, number]>; // default [[1500,5],[1000,4],[600,3],[400,2],[0,1]]
  gap?: number;                          // px, default 16
  animateFrom?: "top" | "bottom" | "left" | "right" | "center" | "random"; // default "bottom"
  duration?: number;                     // s, default 0.6
  stagger?: number;                      // s, default 0.05
  blurToFocus?: boolean;                 // default true
  hoverScale?: number | false;           // default 0.95; false desliga
};
```

## Regras

1. **Colunas (pura `columnsFor(width, breakpoints)`).** Primeiro breakpoint com `width >= px`.
2. **Layout (puro `layoutMasonry(items, width, columns, gap)` → `{ id, x, y, w, h }[]` + altura
   total).** `w = (width - gap·(columns-1)) / columns`. Para cada item, na ordem, escolhe a coluna
   de menor altura acumulada (empate: a da esquerda); `x = col · (w + gap)`, `y = altura da
   coluna`; `h = item.height` (px); soma `h + gap` à coluna. Altura total = maior coluna - gap
   (0 se vazio).
3. **Medida.** ResizeObserver na raiz dá `width`; a raiz tem `position: relative` e `height` =
   altura total. Cada item é `absolute` com `width/height` e posição via `x/y` do motion.
4. **Entrada (só na primeira medição).** Posição inicial por `animateFrom`: `bottom` → `y +
   100`, `top` → `y - 100`, `left` → `x - 100`, `right` → `x + 100`, `center` → o centro da raiz,
   `random` → uma das quatro, determinística pelo índice (`index % 4`). Opacidade 0 → 1 e, com
   `blurToFocus`, `filter: blur(10px)` → `blur(0px)`, com atraso `index · stagger`.
5. **Reflow.** Depois da entrada, mudança de largura anima `x/y/width` para o novo layout com a
   mesma duração (sem atraso).
6. **Hover.** `whileHover={{ scale: hoverScale }}` quando não for `false`. Item:
   `overflow-hidden rounded-xl border border-border bg-card`; com `href`, é `<a>`.

## Movimento reduzido

Sem entrada nem reflow animado: posições aplicadas direto; sem escala no hover.

## Acessibilidade

Raiz `role="list"`, itens `role="listitem"`. A ordem no DOM é a de `items` (a ordem de leitura
não depende das colunas).

## Marcação

- Raiz `data-slot="masonry-grid"`, `ref`, `cn`; item `data-slot="masonry-grid-item"`.

## Testes mínimos

- `columnsFor` nos limites dos breakpoints.
- `layoutMasonry`: vai para a coluna mais baixa; empate à esquerda; altura total; vazio dá 0;
  `columns < 1` ou `width < 0` lança erro.
- Com ResizeObserver falso, a raiz recebe a altura total e os itens as posições.
- Movimento reduzido sem estado inicial deslocado.
