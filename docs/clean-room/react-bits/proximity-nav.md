# Spec de comportamento: `proximity-nav`

> **Proveniência (clean room).** Escrita em 10/10/2026 a partir da demo pública "Line Sidebar" em
> `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.

## O que a pessoa vê

Uma navegação vertical de itens numerados ("01 Visão geral", "02 Carteiras"...), cada um com uma
**linha marcadora** ao lado e **tracinhos** menores entre os itens, como uma régua. Quando o
ponteiro chega perto (na vertical), os itens próximos **deslizam para o lado** e ganham a cor de
destaque, e as linhas crescem; o efeito cai suavemente com a distância. O item clicado fica ativo.

## Por que existe (uso no produto)

Índice de seções numa página longa (relatório, documentação, landing).

## API (`molecules/navigation/proximity-nav`)

```ts
type ProximityNavProps = Omit<React.ComponentProps<"nav">, "onChange"> & {
  items: string[];
  showIndex?: boolean;               // default true
  showMarker?: boolean;              // default true
  radius?: number;                   // px de alcance vertical, default 100
  maxShift?: number;                 // px de deslize máximo do rótulo, default 30
  falloff?: "linear" | "smooth" | "sharp"; // default "smooth"
  markerLength?: number;             // px, default 60
  tickScale?: number;                // fração do marcador, default 0.5
  itemGap?: number;                  // px, default 20
  /** Controlado. */
  activeIndex?: number | null;
  defaultActiveIndex?: number | null; // default null
  onItemSelect?: (index: number, label: string) => void;
  "aria-label"?: string;              // default "Seções"
};
```

## Regras

1. **Influência (pura `proximity(distance, radius, falloff)` → 0..1).** `u = max(0, 1 -
   |distance|/radius)`; `linear`: `u`; `smooth`: `u²(3 - 2u)`; `sharp`: `u³`.
2. **Cada item** (centro vertical medido com `getBoundingClientRect` no `pointermove` da raiz):
   rótulo com `translateX(influência · maxShift)`; cor por camada: o texto base é
   `text-muted-foreground` e uma cópia `text-primary` por cima (`aria-hidden`) com
   `opacity = influência` (ou 1 no ativo); marcador `h-px bg-border` com `scaleX(0.6 + 0.4 ·
   influência)` e uma cópia `bg-primary` com a mesma opacidade da cor. Escrita por CSS variables
   no item (`--p`), sem re-render por `pointermove`; transições curtas (100 ms) no CSS.
3. **Tracinhos.** Entre itens, um traço `bg-border` de `markerLength · tickScale`, que cresce com a
   média da influência dos dois vizinhos.
4. **Ponteiro fora** (`pointerleave`): todas as influências voltam a 0.
5. **Ativo.** Clique no item torna-o ativo (`aria-current="true"`) e chama `onItemSelect`.
6. **Índice.** `showIndex`: número com dois dígitos (`formatIndex(i)` → `"01"`) em fonte mono.

## Movimento reduzido

Sem deslize nem crescimento: só a cor muda (opacidade da cópia).

## Acessibilidade

`<nav aria-label>` com `<ul>`; cada item é um `<button type="button">` (ou o conteúdo que o
consumidor ligar via `onItemSelect`); foco de teclado aplica influência 1 ao item focado, como
se o ponteiro estivesse nele. Cópias coloridas e marcadores `aria-hidden`.

## Marcação

- Raiz: `data-slot="proximity-nav"`, `ref`, `cn`.
- Partes: `proximity-nav-item` (com `data-active`), `proximity-nav-label`, `proximity-nav-marker`,
  `proximity-nav-tick`.

## Testes mínimos

- `proximity`: 0 na distância ≥ raio, 1 em 0, `smooth` simétrico em 0,5, `sharp` < `linear` < 1
  no meio; raio ≤ 0 lança erro com o valor.
- `formatIndex(0) = "01"`, `formatIndex(11) = "12"`.
- Renderiza `nav` com N botões e índices.
- Clique ativa (`aria-current`) e chama `onItemSelect`; controlado manda.
- `pointermove` sobre um item define `--p` = 1 nele e 0 longe (com rect falso); `pointerleave` zera.
- Foco no botão define `--p` = 1.
- `showMarker={false}` sem marcadores; movimento reduzido sem `translateX`.
- `ref` e `className`.
