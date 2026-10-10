# Spec de comportamento: `goo-tabs`

> **Proveniência (clean room).** Escrita em 10/10/2026 a partir da demo pública "Gooey Nav" em
> `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.

## O que a pessoa vê

Uma barra de navegação horizontal ("Início", "Carteiras", "Relatórios"). O item ativo tem uma
**pílula sólida** atrás. Ao clicar outro item, a pílula **pula** para ele com um efeito de
**gosma** (borda que estica e se funde) e uma **explosão de bolinhas** nasce do item novo, se
espalha e volta, fundindo-se na pílula. O texto do item ativo troca de cor.

## Por que existe (uso no produto)

Abas principais de um painel ou da landing, com personalidade.

## API (`molecules/navigation/goo-tabs`)

```ts
type GooTabsItem = { value: string; label: string; href?: string };

type GooTabsProps = Omit<React.ComponentProps<"nav">, "onChange"> & {
  items: GooTabsItem[];
  value?: string;                    // controlado
  defaultValue?: string;             // default items[0].value
  onValueChange?: (value: string) => void;
  /** Duração do pulo em ms. */
  duration?: number;                 // default 600
  particleCount?: number;            // default 15
  /** Distâncias externa e interna das bolinhas em px. */
  particleDistances?: [number, number]; // default [90, 10]
  "aria-label"?: string;             // default "Navegação principal"
};
```

## Regras

1. **Gosma.** Um `<svg>` oculto com `<filter id>` (de `useId`, sem `:`): `feGaussianBlur
   stdDeviation=8` → `feColorMatrix` com matriz de alfa `0 0 0 20 -8` → `feComposite
   operator="atop"` sobre o original. A camada de efeito (pílula + bolinhas) recebe
   `filter: url(#id)`; o texto fica **fora** dela, para não borrar.
2. **Pílula.** `motion.span` `absolute rounded-full bg-primary` com posição e tamanho do item
   ativo (medidos com `offsetLeft/offsetWidth`, recalculados com ResizeObserver), animados com
   mola (`layout` não serve aqui; animar `x`/`width` com `animate`).
3. **Bolinhas.** No clique, `particleCount` bolinhas (`size-3 rounded-full`, cor alternando
   `bg-primary`, `bg-accent`, `bg-secondary`) nascem no centro do item novo. Para a bolinha `i`
   (pura `particlePath(i, count, distances, rand)`): ângulo `i·360/count + ruído`, sai até
   `distances[0]` com escala 1→0,6, volta até `distances[1]` e some. Duração `duration ± 300 ms`
   aleatórios. Gerador pseudoaleatório injetável (`mulberry32`). Removidas ao terminar.
4. **Texto.** Item ativo `text-primary-foreground`, demais `text-muted-foreground
   hover:text-foreground`; troca no meio do pulo (metade da `duration`).
5. **Itens.** Com `href`, `<a>`; senão `<button type="button">`. Clique no ativo não faz nada.

## Movimento reduzido

Sem bolinhas nem gosma: a pílula troca de lugar sem animação.

## Acessibilidade

`<nav aria-label>` + `<ul>`; ativo com `aria-current="page"`. Teclado: Tab e Enter/Espaço
nativos; ←/→ movem o foco entre itens (sem ativar). Efeitos `aria-hidden`.

## Marcação

- Raiz: `data-slot="goo-tabs"`, `ref`, `cn`.
- Partes: `goo-tabs-item` (com `data-active`), `goo-tabs-pill`, `goo-tabs-particle`,
  `goo-tabs-filter`.

## Testes mínimos

- `particlePath` cobre os ângulos igualmente espaçados e respeita as distâncias; `mulberry32`
  determinístico.
- Renderiza itens; `defaultValue` marca `aria-current`.
- Clique troca o ativo, chama `onValueChange` e cria `particleCount` bolinhas, removidas depois
  (timers falsos ou `waitFor` com duração curta).
- Controlado manda; clique no ativo não chama.
- `href` gera link; ←/→ movem o foco.
- Filtro com id sem `:`; movimento reduzido sem bolinhas.
- `items` vazio lança erro; `ref` e `className`.
