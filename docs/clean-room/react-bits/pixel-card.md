# Spec de comportamento: `pixel-card`

> **Proveniência (clean room).** Escrita em 10/10/2026 a partir da demo pública "Pixel Card" em
> `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.

## O que a pessoa vê

Um cartão escuro com um texto no meio. Ao passar o mouse (ou focar), uma grade de **pixels
pequenos** acende **do centro para fora**: cada pixel cresce até seu tamanho e então fica
**cintilando** (oscila de tamanho), em tons da paleta. Ao sair, os pixels encolhem e somem
na ordem inversa (de fora para dentro).

## Por que existe (uso no produto)

Cartões de recurso ou de plano numa landing, com textura viva no hover.

## API (`atoms/display/pixel-card`)

```ts
type PixelCardProps = React.ComponentProps<"div"> & {
  variant?: "default" | "primary" | "accent";   // default "default"
  /** Distância entre pixels em px. Padrão por variante: 5, 6, 5. */
  gap?: number;
  /** Velocidade 0..100. Padrão por variante: 35, 25, 30. */
  speed?: number;
  /** Não reage a foco. */
  noFocus?: boolean;                             // default false
};
```

## Regras

1. **Cores (sem hex nem `rgb(` no fonte).** O `fillStyle` recebe o valor do token como o
   `getComputedStyle(raiz).getPropertyValue("--x").trim()` devolve (o canvas aceita `oklch()`),
   relido quando o ResizeObserver dispara (troca de tema também redesenha). Tokens: `default` → `--muted-foreground`, `--border`, `--muted`; `primary` →
   `--primary`, `--accent`, `--secondary`; `accent` → `--accent`, `--primary`, `--muted`.
2. **Grade (pura `buildPixels(width, height, gap, colorCount, rand)`).** Um pixel a cada `gap` px;
   cada um com `x`, `y`, índice de cor aleatório, `maxSize` entre 0,5 e 2 px, `delay` =
   distância ao centro (px) e `speed` próprio = `random(0.1, 0.9) · fator`, onde `fator =
   speed/100 · 0.1` (`throttledSpeed(speed)` puro, limitado a 0..100).
3. **Animação (canvas 2D).** Estado por pixel: `size`, `counter`, `shimmering`, `reverse`.
   - `appear`: `counter` cresce até passar `delay`; então `size` cresce `0.1` por quadro até
     `maxSize` e passa a cintilar: `size` vai e volta entre `0.5` e `maxSize` no passo `speed`.
   - `disappear`: `counter` zera; `size` diminui `0.1` por quadro até 0; quando todos são 0, o loop
     para.
   Cada pixel é desenhado como quadrado centrado (`fillRect`). Função pura `stepPixel(pixel,
   mode)` cobre esses estados.
4. **Loop.** `useFrameLoop(draw, active, 60)`; ativo de `pointerenter` (mouse/caneta) ou `focus`
   (se não `noFocus`) até todos os pixels sumirem depois do `pointerleave`/`blur`.
5. **Estrutura.** Raiz `relative isolate grid aspect-[4/5] w-72 place-items-center overflow-hidden
   rounded-3xl border bg-card` (variante muda a borda: `border-primary/40`, `border-accent/40`),
   canvas `absolute inset-0 size-full` (`aria-hidden`), filhos `relative z-10`. ResizeObserver
   reconstrói a grade (com `devicePixelRatio`). Se a raiz tiver `tabIndex` ou filho focável, o
   foco ativa.

## Movimento reduzido

Sem cintilar nem crescer: no hover, os pixels aparecem todos no `maxSize` de uma vez (um
quadro) e somem de uma vez.

## Acessibilidade

Decorativo: canvas `aria-hidden`; o conteúdo é o filho.

## Marcação

- Raiz: `data-slot="pixel-card"`, `data-variant`, `data-active`, `ref`, `cn`.
- Canvas: `data-slot="pixel-card-canvas"`.

## Testes mínimos

- `buildPixels`: quantidade = `ceil(w/gap)·ceil(h/gap)`; `delay` 0 no centro; `gap ≤ 0` lança
  erro com o valor.
- `throttledSpeed` limita 0..100 e escala.
- `stepPixel`: aparece depois do `delay`; cintila entre limites; some até 0.
- Com contexto de canvas falso (fake nomeada), `pointerenter` de mouse ativa e desenha;
  `pointerleave` leva a `data-active="false"` quando tudo some (timers falsos com
  `performance`).
- `focus` ativa; `noFocus` não.
- Movimento reduzido: desenha tudo de uma vez.
- `ref`, `className` e variante.
