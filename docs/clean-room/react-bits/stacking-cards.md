# Spec de comportamento: `stacking-cards`

> **Proveniência (clean room).** Escrita em 11/10/2026 a partir da demo pública "Scroll Stack"
> em `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**. A
> versão deles usava lenis para rolagem suave; esta usa a rolagem nativa e `motion`.

## O que a pessoa vê

Uma coluna de cartões grandes. Ao rolar, cada cartão **sobe e prende** perto do topo da área
visível; o próximo sobe e **pousa por cima dele**, um pouco mais abaixo, e o de baixo **encolhe e
escurece** levemente — formando um baralho. Quando o último pousa, o baralho fica preso mais um
trecho e depois rola embora junto com a página.

## Por que existe (uso no produto)

Seção "como funciona" em passos, ou planos/recursos apresentados um de cada vez numa landing.

## API (`molecules/layout/stacking-cards`)

```ts
type StackingCardsProps = React.ComponentProps<"div"> & {
  children: React.ReactNode;     // StackingCard[]
  itemGap?: number;              // px entre cartões antes de empilhar. default 100
  stackOffset?: number;          // px que cada cartão fica abaixo do anterior no baralho. default 24
  stackTop?: number | string;    // onde prende: px ou "%" da altura visível. default "15%"
  itemScale?: number;            // encolhe por cartão por cima. default 0.05
  minScale?: number;             // menor escala. default 0.8
  dimAmount?: number;            // 0–1 de escurecer por cartão por cima. default 0.2
  blurAmount?: number;           // px de blur por cartão por cima. default 0
  holdDistance?: number;         // px de rolagem com o baralho completo preso. default 200
  scrollContainer?: React.RefObject<HTMLElement | null>; // default: janela
  onStackComplete?: () => void;  // quando o último pousa (uma vez por descida)
};
type StackingCardProps = React.ComponentProps<"div">;
```

Cartão `rounded-3xl bg-card text-card-foreground border border-border p-8 shadow-xl`, altura
mínima 320 px. Escurecimento por camada `bg-foreground` com opacidade (nunca `rgba`).

## Regras

1. **Prender sem JS de posição.** Cada cartão é `position: sticky` com
   `top: calc(stackTop + i·stackOffset)`; o espaçamento é `margin-bottom: itemGap`. Isso é o que
   dá rolagem estável sem tremor: o JS só calcula escala/escurecimento.
2. **Progresso (puro `coveredCount(i, cards)`).** `cards[j] = { top, pinTop, travel }`, onde
   `top` é o topo atual do cartão `j` (`getBoundingClientRect`), `pinTop` é onde ele prende e
   `travel = itemGap + altura do cartão anterior` (o percurso entre começar a subir sobre o
   anterior e pousar). Resultado contínuo:
   `covered_i = Σ_{j>i} clamp(1 − (top_j − pinTop_j) / travel_j, 0, 1)`.
3. **Efeitos (puro `layerStyle(covered, opts)`):** `scale = max(minScale, 1 − covered·itemScale)`,
   `dim = min(0.8, covered·dimAmount)`, `blur = covered·blurAmount`. Origem da escala no topo.
4. **Medição.** `useScroll` do motion (janela ou `scrollContainer`) dispara o recálculo por quadro;
   os topos vêm de `getBoundingClientRect`. `ResizeObserver` recalcula `pinTop` (porcentagem).
5. **Hold.** Após o último cartão, um espaçador de `holdDistance` px mantém o baralho preso.
6. **`onStackComplete`** chamado quando o último cartão atinge `pinTop`; rearma quando ele volta a
   ficar abaixo (rolar para cima).
7. Sem `overflow: hidden` em nenhum ancestral interno (quebraria o sticky).

## Movimento reduzido

Mantém o sticky (é rolagem, não animação), mas sem escala, escurecimento nem blur.

## Acessibilidade

Raiz `role="list"`, cartões `role="listitem"`; a camada de escurecimento `aria-hidden`. A ordem
de leitura é a ordem dos cartões.

## Marcação

Raiz `data-slot="stacking-cards"`; cartão `data-slot="stacking-card"` com `data-index`; camada
`stacking-card-dim`.

## Testes mínimos

- `layerStyle` (limites de `minScale` e 0.8) e o cálculo de `covered` com retângulos falsos.
- Cartões com `top` sticky calculado (`stackTop` em px e em `%`) e `data-index`.
- `onStackComplete` uma vez por descida (com retângulos falsos via spy de `getBoundingClientRect`).
- Movimento reduzido: sem `transform` de escala nem camada visível.
