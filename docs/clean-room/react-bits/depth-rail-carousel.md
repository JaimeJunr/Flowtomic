# Spec de comportamento: `depth-rail-carousel`

> **Proveniência (clean room).** Escrita em 11/10/2026 a partir da demo pública "Depth Carousel"
> em `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**. A
> versão deles usava gsap; esta usa só `motion`.

## O que a pessoa vê

Um cartão alto em foco no centro e, atrás dele, os próximos **recuando em profundidade** num
trilho: cada um mais fundo, deslocado para um lado, **girado** mostrando a borda, mais
**escuro** e mais **desfocado**. Setas à esquerda e à direita, pontos embaixo. Avançar faz o
cartão da frente **sair** para o lado oposto e todos avançarem um passo no trilho. Dá para
arrastar, usar as setas do teclado, e ligar o avanço automático (que pausa no hover/foco).

## Por que existe (uso no produto)

Carrossel de destaques: relatórios do mês, planos, cases.

## API (`molecules/data-display/depth-rail-carousel`)

```ts
type DepthRailItem = { id: string; label: string; content: React.ReactNode };

type DepthRailCarouselProps = Omit<React.ComponentProps<"div">, "onChange"> & {
  items: DepthRailItem[];             // >= 1
  cardWidth?: number;                 // px, default 300
  cardHeight?: number;                // px, default 380
  depth?: number;                     // px por passo, default 220
  spread?: number;                    // px por passo, default 90
  tilt?: number;                      // graus por passo, default 22
  side?: "left" | "right";            // default "right"
  perspective?: number;               // default 1400
  visibleCards?: number;              // 1..8, default 4
  falloff?: number;                   // 0..1, default 0.2
  blur?: number;                      // px máximo, default 6
  duration?: number;                  // ms, default 700
  autoplay?: boolean;                 // default false
  autoplayDelay?: number;             // ms, default 3200
  loop?: boolean;                     // default true
  showControls?: boolean;             // default true
  showIndicators?: boolean;           // default true
  index?: number; defaultIndex?: number; onChange?: (index: number) => void;
};
```

## Regras

1. **Pose (pura `railPose(offset, opts)`, `offset = posição - ativo`).** `s = ±1` pelo
   `side`. `offset >= 0`: `x = s · offset · spread`, `z = -offset · depth`,
   `rotateY = -s · min(offset, 3) · tilt`, `brightness = 1 - min(1, offset · falloff)`
   (véu `bg-background` com opacidade `1 - brightness`), `blur = min(blur, offset · falloff
   · blur · 2)`, `opacity = offset < visibleCards ? 1 : 0`, `zIndex = 100 - offset`.
   `offset < 0` (já passou): `x = -s · cardWidth · 1.1`, `opacity 0`, `rotateY = s · tilt`.
   Com `loop`, `offset` é calculado no ciclo (`(i - ativo + n) % n`).
2. **Transição.** Cada cartão anima até a nova pose em `duration` ms, ease
   `[0.22, 1, 0.36, 1]`. Blur no próprio cartão (nada de `filter` em ancestral 3D).
3. **Navegação.** Setas (botões `ChevronLeft/Right` lucide, `aria-label` "Anterior"/"Próximo";
   sem `loop`, desabilitam nas pontas), pontos (botões com `aria-label` "Ir para <label>",
   `aria-current`), teclado (`ArrowLeft/Right` com foco na raiz) e arrasto horizontal
   (> 60 px ou velocidade > 400 px/s troca; `select-none`, `touch-action: pan-y`).
4. **Autoplay.** Avança a cada `autoplayDelay`; pausa com hover (mouse/pen), foco dentro e aba
   oculta.
5. **Cartão.** `rounded-2xl border border-border bg-card overflow-hidden shadow-xl`, tamanho
   fixo pelas props.

## Movimento reduzido

Sem autoplay; troca instantânea; sem blur.

## Acessibilidade

Raiz `role="region"` `aria-roledescription="carrossel"` `aria-label`, `tabIndex 0`. Cada
cartão `role="group"` `aria-roledescription="slide"` `aria-label="<n> de <total>"`; só o
ativo fica na árvore (os outros `aria-hidden` e `inert`). Região `aria-live="polite"`
anuncia o rótulo do ativo (desligada durante o autoplay).

## Marcação

Raiz `data-slot="depth-rail-carousel"`; partes `depth-rail-carousel-card` (`data-offset`),
`-prev`, `-next`, `-dots`.

## Testes mínimos

- `railPose`: offset 0 na origem; crescer recua, desloca e apaga; passado sai; `side left`
  espelha; acima de `visibleCards` some.
- Erros: `items` vazio, `visibleCards` fora de 1..8, `falloff` fora de 0..1.
- Setas, pontos e teclado trocam; sem `loop` as setas desabilitam nas pontas; `onChange`;
  modo controlado.
- Autoplay com timers reais curtos troca; hover pausa; movimento reduzido não troca sozinho.
