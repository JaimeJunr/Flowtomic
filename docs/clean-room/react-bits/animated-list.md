# Spec de comportamento: `animated-list`

> **Proveniência (clean room).** Escrita em 10/10/2026 a partir da demo pública "Animated List" em
> `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.

## O que a pessoa vê

Uma lista vertical com rolagem própria, de altura fixa. Cada item **cresce e aparece** (escala
0,7 → 1, opacidade 0 → 1) quando entra na área visível ao rolar. Um item pode ser **selecionado**:
ele fica destacado. As setas do teclado movem a seleção para cima e para baixo, e a lista rola
para manter o item selecionado à vista. Em cima e embaixo, **degradês** dissolvem os itens na cor
do fundo, e somem quando a lista está no topo ou no fim.

## Por que existe (uso no produto)

Escolher uma carteira, um fundo ou uma conta numa lista longa dentro de um painel ou modal.

## API (`molecules/data-display/animated-list`)

```ts
type AnimatedListProps<T> = Omit<React.ComponentProps<"div">, "onSelect"> & {
  items: T[];
  /** Conteúdo de cada item. Padrão: String(item). */
  renderItem?: (item: T, index: number, selected: boolean) => React.ReactNode;
  /** Chave estável. Padrão: o índice. */
  getKey?: (item: T, index: number) => React.Key;
  onItemSelect?: (item: T, index: number) => void;
  /** Controlado. */
  selectedIndex?: number;
  defaultSelectedIndex?: number;        // default -1
  showGradients?: boolean;              // default true
  enableArrowNavigation?: boolean;      // default true
  showScrollbar?: boolean;              // default true
  itemClassName?: string;
  /** Rótulo da lista para leitor de tela. */
  "aria-label": string;
};
```

## Regras

1. **Estrutura.** Raiz `relative` com uma área rolável `max-h-96 overflow-y-auto` que é um
   `role="listbox"` (`aria-label`, `tabIndex=0`, `aria-activedescendant` no item selecionado).
   Cada item é `role="option"` com `id` estável, `aria-selected`, num cartão
   `rounded-md border bg-card px-4 py-3 text-sm` com `mb-2`.
2. **Seleção.** Clique seleciona e chama `onItemSelect`. Selecionado: `bg-accent
   text-accent-foreground border-primary`. Hover: `bg-muted`.
3. **Teclado** (com `enableArrowNavigation`, na lista focada): ↓/↑ movem (limitados aos extremos),
   Home/End vão ao primeiro/último, Enter/Espaço confirmam (`onItemSelect`). Ao mover, o item é
   rolado à vista com `scrollIntoView({ block: "nearest" })` (função isolada para o teste).
4. **Entrada.** Cada item é um `motion.li` com `initial={{ scale: 0.7, opacity: 0 }}` e
   `whileInView={{ scale: 1, opacity: 1 }}` (`viewport: { root: listRef, amount: 0.5 }`),
   transição 0,2 s com atraso 0,05 s.
5. **Degradês.** Duas camadas `pointer-events-none absolute inset-x-0 h-12`, `aria-hidden`, de
   `var(--background)` para transparente (topo e base). Opacidade do topo = `min(scrollTop/50, 1)`;
   da base = `min(restante/50, 1)` (função pura `edgeFade(scrollTop, scrollHeight, clientHeight)`
   → `{ top, bottom }`), recalculada no `scroll`.
6. **Barra.** `showScrollbar={false}` esconde a barra (`[scrollbar-width:none]
   [&::-webkit-scrollbar]:hidden`). Com barra, ela é fina (`[scrollbar-width:thin]`).

## Movimento reduzido

Itens aparecem sem escala nem fade. Rolagem por teclado sem `smooth`.

## Acessibilidade

`listbox`/`option` com `aria-activedescendant`, foco visível na lista
(`focus-visible:ring-2 ring-ring`), degradês `aria-hidden`.

## Marcação

- Raiz: `data-slot="animated-list"`, `ref`, `cn`.
- Partes: `animated-list-viewport`, `animated-list-item` (com `data-selected`),
  `animated-list-fade-top`, `animated-list-fade-bottom`.

## Testes mínimos

- `edgeFade`: no topo `top=0`; no fim `bottom=0`; no meio os dois > 0; limitado a 1.
- Renderiza `listbox` com N `option`s.
- Clique seleciona (`aria-selected`) e chama `onItemSelect(item, index)`.
- ↓ duas vezes a partir de -1 seleciona o índice 1; ↑ no primeiro fica no 0; End vai ao último;
  Enter chama `onItemSelect`.
- `enableArrowNavigation={false}` ignora setas.
- Controlado: `selectedIndex` manda.
- `renderItem` e `getKey` usados.
- Movimento reduzido renderiza itens sem animação.
- `ref` e `className`.
