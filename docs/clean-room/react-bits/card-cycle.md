# Spec de comportamento: `card-cycle`

> **Proveniência (clean room).** Escrita em 11/10/2026 a partir da demo pública "Card Swap" em
> `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**. A
> versão deles usava gsap; esta usa só `motion`.

## O que a pessoa vê

Uma **pilha de cartões em 3D**: o da frente embaixo à esquerda, e cada cartão de trás um degrau
**para a direita e para cima**, mais fundo (menor) e mais apagado, todos levemente **inclinados**
(skew). Cada cartão tem uma **barra de título** (ícone + título) e um corpo grande. De tempos em
tempos o cartão da frente **cai para baixo e some**, e reaparece **no fundo da pilha**; os outros
avançam um degrau com uma mola leve. Dá para **arrastar/arremessar** o da frente para mandá-lo ao
fundo. No hover a pilha **abre um pouco** (degraus maiores) e o timer pausa; o ponteiro move a
pilha em profundidade (paralaxe).

## Por que existe (uso no produto)

Vitrine de recursos de um produto numa landing ("Conciliação automática", "Relatórios", …),
trocando sozinha.

## API (`molecules/data-display/card-cycle`)

```ts
type CardCycleItem = { id: string; title: string; icon?: React.ReactNode; content: React.ReactNode };

type CardCycleHandle = { next: () => void; prev: () => void };

type CardCycleProps = Omit<React.ComponentProps<"div">, "onChange" | "ref"> & {
  ref?: React.Ref<HTMLDivElement>;
  controlRef?: React.Ref<CardCycleHandle>;
  items: CardCycleItem[];      // >= 2, senão lança erro com o valor
  width?: number;              // px, default 460
  height?: number;             // px, default 340
  stepX?: number;              // px por degrau, default 60
  stepY?: number;              // px por degrau (para cima), default 70
  depth?: number;              // px de translateZ por degrau, default 90
  skew?: number;               // graus, default 6
  visibleCards?: number;       // 1..8, default 4 (os demais esperam escondidos no fundo)
  interval?: number;           // ms entre trocas, default 4000
  autoplay?: boolean;          // default true
  pauseOnHover?: boolean;      // default true
  draggable?: boolean;         // default true
  bounce?: number;             // 0..1, default 0.35
  parallax?: number;           // 0..1, default 0.5
  hoverSpread?: number;        // 0..1, default 0.12
  dim?: number;                // 0..1, default 0.5
  onCardClick?: (index: number) => void;
  onChange?: (frontIndex: number) => void;
};
```

## Regras

1. **Ordem.** Estado `order: number[]` (índices de `items`), `order[0]` é o da frente.
   `next()` move o primeiro para o fim; `prev()` traz o último para a frente.
2. **Pose por degrau (pura `slotPose(slot, opts, spread)` → `{ x, y, z, skewY, opacity, zIndex }`).**
   `k = slot` (0 na frente). Fator de abertura `f = 1 + spread` (spread = `hoverSpread` no hover,
   0 fora). `x = k · stepX · f`, `y = -k · stepY · f`, `z = -k · depth`, `skewY = skew`
   (o mesmo para todos), `opacity = slot < visibleCards ? 1 : 0`, brilho do véu
   `= dim · k / max(1, visibleCards - 1)`, `zIndex = 100 - k`.
3. **Troca (`next`).** O cartão da frente anima em 2 fases: **cai** (`y +` 1,2·altura, opacidade
   1 → 0, 350 ms/`speed`), depois **reposiciona** no último degrau visível com `opacity` 0 → 1
   enquanto os outros avançam um degrau com mola (`stiffness 220`, `damping` de 30 a 12 conforme
   `bounce`). Durante a troca, outra troca é ignorada (não enfileira). `onChange(order[0])`
   depois de mudar.
4. **Timer.** Com `autoplay`, `setTimeout` de `interval` após cada troca; pausa com hover
   (`pauseOnHover`, só mouse/pen), com foco dentro e quando a aba fica oculta
   (`document.visibilityState`).
5. **Arrasto.** Com `draggable`, o cartão da frente segue o ponteiro (`select-none`,
   `touch-action: none`). Soltar com deslocamento > 80 px ou velocidade > 500 px/s dispara
   `next()` a partir da posição atual; senão volta com mola.
6. **Paralaxe.** Ponteiro normalizado -1..1 inclina a pilha até `parallax · 10` graus em
   rotateX/rotateY (via `animate` do motion em MotionValues, nunca trocando config de
   `useSpring`).
7. **Clique.** Clique num cartão de trás o traz para a frente (gira `order` até ele) e chama
   `onCardClick(index)`; no da frente só chama `onCardClick`. Arrasto real não conta como clique.
8. **Visual.** Cartão `rounded-2xl border border-border bg-card shadow-xl overflow-hidden`;
   barra de título `flex items-center gap-2 border-b border-border px-4 py-2.5 text-sm
   font-medium`; corpo `flex-1`. Véu de profundidade: `absolute inset-0 bg-background
   pointer-events-none` com a opacidade do degrau. Palco com `perspective: 900px` e
   `preserve-3d`; nada de `filter` em ancestral da cadeia 3D.

## Movimento reduzido

Sem autoplay, sem paralaxe e sem mola: a troca (por arrasto, clique, `next`/`prev` ou teclado)
é instantânea.

## Acessibilidade

Raiz `role="region"` `aria-roledescription="carrossel"` com `aria-label`. Só o cartão da frente
fica na árvore acessível; os de trás `aria-hidden` e `inert`. Uma região `aria-live="polite"`
`sr-only` anuncia "<título>, <n> de <total>" após cada troca (não anuncia trocas do autoplay:
`aria-live="off"` enquanto o autoplay roda). Teclado com foco na raiz: `ArrowRight` → `next`,
`ArrowLeft` → `prev`.

## Marcação

- Raiz `data-slot="card-cycle"`, `ref`, `cn`.
- Partes: `card-cycle-stage`, `card-cycle-card` (`data-slot-position`), `card-cycle-header`.

## Testes mínimos

- `slotPose`: degrau 0 na origem; degraus crescem para direita/cima/fundo; `spread` aumenta o
  degrau; acima de `visibleCards` com opacidade 0.
- `rotate`/`next`/`prev` puros sobre `order`; trazer o índice `i` para a frente.
- Erros: `items` com menos de 2; `visibleCards`, `bounce`, `dim`, `parallax`, `hoverSpread` fora
  da faixa.
- Autoplay com timers reais curtos (`interval` 50) chama `onChange`; hover pausa; movimento
  reduzido não troca sozinho.
- `controlRef.current.next()` troca; setas do teclado trocam; clique num cartão de trás o traz
  para a frente.
- Cartões de trás com `aria-hidden`.
