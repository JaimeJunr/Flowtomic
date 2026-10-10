# Spec de comportamento: `ring-carousel`

> **Proveniência (clean room).** Escrita em 10/10/2026 a partir da demo pública "Circular Carousel" em
> `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.
> Não substitui o atom `carousel` (faixa plana com setas): este é um anel 3D de cartões.

## O que a pessoa vê

Cartões de imagem dispostos num **anel 3D** (cilindro visto de fora, levemente de cima). O anel
**gira devagar** sozinho. A pessoa pode **arrastar e arremessar** o anel; ao soltar ele desliza,
desacelera e **para alinhado** num cartão, depois retoma o giro. Com o mouse em cima, o giro
desacelera até parar. Clicar num cartão o traz para a frente. Cartões que vão para trás escurecem.

## Por que existe (uso no produto)

Vitrine de relatórios, galeria de fundos ou de casos de clientes num hero.

## API (`molecules/data-display/ring-carousel`)

```ts
type RingCarouselItem = { id: string; content: React.ReactNode; label: string };

type RingCarouselProps = Omit<React.ComponentProps<"div">, "onChange"> & {
  items: RingCarouselItem[];               // mínimo 3
  layout?: "cylinder" | "orbit";           // default "cylinder"
  cardWidth?: number;                      // px, default 220
  aspectRatio?: number;                    // largura/altura, default 1
  gap?: number;                            // px entre cartões, default 24
  tilt?: number;                           // graus da câmera (negativo olha de cima), default -6
  perspective?: number;                    // px, default 2400
  autoplay?: "drift" | "step" | "off";     // default "drift"
  speed?: number;                          // graus/s no drift, default 14
  interval?: number;                       // s entre passos no step, default 3
  direction?: "left" | "right";            // default "left"
  draggable?: boolean;                     // default true
  snap?: boolean;                          // default true
  pauseOnHover?: boolean;                  // default true
  focusOnClick?: boolean;                  // default true
  depthFade?: number;                      // 0..1, default 0.55
  onChange?: (index: number) => void;      // cartão da frente mudou
};
```

## Regras

1. **Geometria (funções puras em utils).** `n` cartões, passo angular `step = 360/n`. Raio
   `ringRadius(n, cardWidth, gap) = (cardWidth + gap) / (2·tan(π/n))`. Cartão `i` no ângulo
   `i·step + rotation`. `cylinder`: `rotateY(a) translateZ(r)` (cartão de frente para fora).
   `orbit`: posição igual, mas o cartão desfaz a rotação (`rotateY(-a)` depois do translate) e
   fica sempre de frente.
2. **Estrutura.** Raiz `relative overflow-hidden select-none` com `perspective`. Dentro, um palco
   `preserve-3d` com `rotateX(tilt)` e, nele, o anel `preserve-3d` com `rotateY(rotation)`. Cada
   cartão `absolute rounded-lg overflow-hidden bg-card border shadow-md`, centralizado, com
   `backface-visibility: hidden` em `cylinder`.
3. **Rotação.** Um único `MotionValue` `rotation` (graus) escrito por `useFrameLoop`, sem
   re-render por quadro. Drift: `rotation -= speed·dt` (left) ou `+=` (right).
   Step: a cada `interval` s anima até o próximo múltiplo de `step` (mola).
4. **Arraste.** Pointer capture na raiz; `dx` em px vira graus por `dx · 360 / (2πr)`.
   Ao soltar, velocidade medida (média dos últimos 100 ms) vira inércia com atrito exponencial
   (`v *= 0.95^(dt·60)`); abaixo de 5°/s, com `snap`, anima até o múltiplo de `step` mais
   próximo (`nearestSnap(rotation, step)` pura) e retoma o autoplay. Arremesso define a nova
   `direction` interna. Clique sem arraste (< 4 px) não conta como arraste.
5. **Hover.** Com `pauseOnHover` e mouse/caneta em cima, a velocidade do drift cai a 0 em ~0,4 s
   (interpolação, não corte). Sair retoma.
6. **Foco no clique.** Clique num cartão anima a rotação pelo caminho mais curto até ele ficar na
   frente (`shortestRotationTo(rotation, index, step)` pura).
7. **Frente e profundidade.** Índice da frente `frontIndex(rotation, n)` pura; chama `onChange`
   só quando muda. Cada cartão recebe opacidade de uma camada `bg-background` por cima igual a
   `depthFade · (1 - cos(ângulo relativo))/2` (pura `depthShade`).
8. **Teclado.** A raiz é `role="region"` `aria-roledescription="carrossel"` focável; ←/→ giram um
   cartão (pausam o autoplay até o próximo ponteiro). Um `aria-live="polite"` sr-only anuncia
   "<label>, <i+1> de <n>" quando a frente muda por teclado ou clique.
9. Pausa fora da tela e com a aba oculta (o `useFrameLoop` já trata a aba).

## Movimento reduzido

Sem autoplay nem inércia: o anel fica parado; teclado e clique trocam a frente sem animação.

## Acessibilidade

Cada cartão `role="group"` `aria-roledescription="slide"` `aria-label="<label>"`; cartões que não
estão na metade da frente ficam `aria-hidden` e `inert`.

## Marcação

- Raiz: `data-slot="ring-carousel"`, `data-layout`, `data-dragging`, `ref`, `cn`.
- Partes: `ring-carousel-stage`, `ring-carousel-ring`, `ring-carousel-card` (com `data-front`),
  `ring-carousel-live`.

## Testes mínimos

- `ringRadius` cresce com `n`; `n < 3` lança erro com o valor recebido.
- `nearestSnap`, `shortestRotationTo` (cruza 0/360 pelo lado curto), `frontIndex`, `depthShade`
  (0 na frente, `depthFade` atrás).
- Renderiza `n` cartões com `aria-label`; `items.length < 3` lança erro.
- ←/→ mudam `data-front` e o anúncio ao vivo; `onChange` chamado uma vez por mudança.
- Clique num cartão com `focusOnClick` o leva à frente.
- Movimento reduzido: rotação não muda com o tempo (timers falsos).
- `ref` e `className`.
