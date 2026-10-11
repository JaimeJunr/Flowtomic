# Spec de comportamento: `marquee-menu`

> **Proveniência (clean room).** Escrita em 11/10/2026 a partir da demo pública "Flowing Menu"
> em `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**. A
> versão deles usava gsap; esta usa só `motion`.

## O que a pessoa vê

Um menu de tela cheia com **itens grandes em maiúsculas**, um por linha, separados por linhas
finas. Ao passar o mouse num item, uma **faixa de cor invertida entra pelo lado em que o mouse
chegou** (por cima ou por baixo) e cobre a linha; dentro dela corre um **letreiro** (marquee)
infinito com o texto do item alternando com uma miniatura. Ao sair, a faixa **sai pelo lado em
que o mouse saiu**.

## Por que existe (uso no produto)

Menu principal de um site institucional ou índice de seções numa página editorial.

## API (`molecules/navigation/marquee-menu`)

```ts
type MarqueeMenuItem = { label: string; href: string; thumbnail?: React.ReactNode };

type MarqueeMenuProps = React.ComponentProps<"nav"> & {
  items: MarqueeMenuItem[];   // >= 1
  speed?: number;             // s por volta do letreiro, default 15 (> 0, senão erro)
};
```

Cores por token: fundo `bg-background`, texto `text-foreground`, linhas `border-border`; faixa
`bg-foreground text-background`.

## Regras

1. **Borda mais próxima (pura `closestEdge(y, height)` → `"top" | "bottom"`).** Compara a
   distância do ponteiro ao topo e à base do item; empate é `top`.
2. **Entrada.** No `pointerenter`, a faixa é posta fora do item do lado da borda (`y: -101%` se
   `top`, `101%` se `bottom`) e anima a `0%`; o conteúdo do letreiro anima do lado oposto
   (`101%`/`-101%`) a `0%`, juntos, 0,6 s, ease `[0.22, 1, 0.36, 1]`. No `pointerleave`, faz o
   inverso para a borda de saída.
3. **Letreiro.** Uma trilha com o par `[label, thumbnail]` repetido o bastante para cobrir duas
   larguras do item (medido; mínimo 4 repetições), duplicada, animando `x` de 0 a -50% em
   `speed` s, linear, infinito (via `animate` do motion com `repeat: Infinity`). Só roda enquanto
   a faixa está visível. Miniatura: `h-[60%] aspect-[2/1] rounded-full overflow-hidden mx-6`.
4. **Item.** `relative overflow-hidden border-t border-border` (o último também `border-b`); link
   `<a>` ocupando a linha toda, `flex items-center justify-center`, `text-[4vh] font-semibold
   uppercase`. A faixa e o letreiro são `aria-hidden` e `pointer-events-none`.
5. **Teclado.** Foco no link mostra a faixa entrando por cima.

## Movimento reduzido

A faixa aparece/some sem deslizar (opacidade) e o letreiro fica parado.

## Acessibilidade

`<nav aria-label>` com `<ul>`/`<li>`; o nome do link é o `label`; faixa e cópias `aria-hidden`.

## Marcação

- Raiz `data-slot="marquee-menu"`, `ref`, `cn`; item `data-slot="marquee-menu-item"` com
  `data-active`; faixa `marquee-menu-band`; trilha `marquee-menu-track`.

## Testes mínimos

- `closestEdge`: perto do topo, perto da base, empate.
- `repeatsFor(itemWidth, unitWidth)` (mínimo 4; erro com `unitWidth <= 0`).
- `pointerenter` com `clientY` perto da base marca `data-edge="bottom"` e `data-active`; sair
  remove `data-active`.
- `speed <= 0` lança erro; faixa `aria-hidden`; foco ativa o item.
