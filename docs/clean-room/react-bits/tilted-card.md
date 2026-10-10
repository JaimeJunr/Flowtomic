# Spec de comportamento: `tilted-card`

> **Proveniência (clean room).** Escrita em 10/10/2026 a partir da demo pública "Tilted Card" em
> `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.

## O que a pessoa vê

Um cartão com uma imagem (capa, print, cartão de crédito). Com o mouse em cima, o cartão **inclina
em 3D** seguindo o ponteiro, como se fosse uma peça física na mão, e cresce um pouco. Uma
**legenda** pequena acompanha o ponteiro e inclina de leve na direção do movimento. Ao sair, tudo
volta ao lugar com mola. Opcionalmente, um conteúdo fica por cima da imagem, um pouco "à frente"
dela (profundidade).

## Por que existe (uso no produto)

Mostrar o cartão de crédito do cliente, a capa de um relatório ou um print do produto com
presença física.

## API (`molecules/data-display/tilted-card`)

```ts
type TiltedCardProps = Omit<React.ComponentProps<"figure">, "children"> & {
  /** A imagem ou qualquer conteúdo visual do cartão. */
  media: React.ReactNode;
  /** Texto da legenda que segue o ponteiro (e figcaption acessível). */
  caption?: string;
  /** Inclinação máxima em graus. */
  rotateAmplitude?: number;   // default 12
  scaleOnHover?: number;      // default 1.05
  showTooltip?: boolean;      // default true
  /** Conteúdo sobre a mídia, à frente dela. */
  overlay?: React.ReactNode;
};
```

## Regras

1. **Estrutura.** Raiz `<figure>` `relative grid place-items-center [perspective:800px]`.
   Dentro, o cartão `motion.div` (`data-slot="tilted-card-inner"`) com
   `[transform-style:preserve-3d] rounded-lg overflow-hidden shadow-md`, a mídia ocupando tudo e o
   `overlay` numa camada `absolute inset-0` com `translateZ(30px)`.
2. **Inclinação.** `pointermove` na raiz (só mouse/caneta): com o ponteiro em `(dx, dy)`
   normalizado em -1..1 a partir do centro (função pura `tiltAngles(rect, x, y, amplitude) →
   { rotateX, rotateY }`, com `rotateX = -dy · amplitude` e `rotateY = dx · amplitude`). Os ângulos
   vão para `MotionValue`s animados por evento com `animate(mv, alvo, { type: "spring", stiffness:
   200, damping: 30 })` (não trocar config de `useSpring` entre renders).
3. **Hover.** Entrar: escala vai a `scaleOnHover`. Sair: ângulos e escala voltam a 0 e 1, e a
   legenda some.
4. **Legenda.** Com `showTooltip` e `caption`, um rótulo `pointer-events-none absolute rounded-sm
   bg-popover text-popover-foreground border px-2 py-1 text-xs` posicionado no ponteiro (por
   `MotionValue` x/y, relativo à raiz), com `rotate` proporcional à velocidade horizontal do
   ponteiro (função pura `captionTilt(velocityX)`, limitada a ±12°), e opacidade 1 só no hover.
   É `aria-hidden`.
5. **`figcaption`.** Sempre que houver `caption`, um `<figcaption className="sr-only">` com o
   mesmo texto (o rótulo visual é decorativo).
6. **Toque.** Sem inclinação nem legenda.

## Movimento reduzido

Sem inclinação, sem escala, sem legenda que segue; o cartão fica plano.

## Acessibilidade

`figure` + `figcaption`; o conteúdo de `media` traz seu próprio `alt`. Nada focável é criado.

## Marcação

- Raiz: `data-slot="tilted-card"`, `data-hovered`, `ref`, `cn`, props nativas.
- Partes: `tilted-card-inner`, `tilted-card-overlay`, `tilted-card-caption`.

## Testes mínimos

- `tiltAngles`: centro → 0/0; canto superior direito → `rotateX > 0` e `rotateY > 0`; respeita a
  amplitude; retângulo de tamanho zero lança erro com o valor recebido.
- `captionTilt` limita a ±12.
- Renderiza `figure` e `figcaption` sr-only com a legenda.
- `pointerenter` de mouse → `data-hovered="true"`; `pointerleave` → `"false"`.
- Toque não ativa.
- `showTooltip={false}` não renderiza o rótulo visual.
- `overlay` renderizado na camada própria.
- Movimento reduzido não ativa.
- `ref` e `className`.
