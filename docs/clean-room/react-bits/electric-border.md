# Spec de comportamento: `electric-border`

> **Proveniência (clean room).** Escrita em 09/10/2026 a partir da demo pública "Electric Border"
> em `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.

## O que a pessoa vê

Um card cuja borda é uma **linha elétrica**: o contorno arredondado treme e se deforma o tempo todo
em pequenas ondulações irregulares, como uma descarga, com um brilho suave em volta. A forma geral
continua sendo o retângulo arredondado; só o traço vibra. O conteúdo de dentro fica parado.

## Por que existe (uso no produto)

Destacar um card de estado crítico ou "ao vivo" (alerta de risco, plano em destaque).

## API (`atoms/animation/electric-border`)

```ts
type ElectricBorderProps = React.ComponentProps<"div"> & {
  /** Cor do traço e do brilho. Token. */
  color?: string;          // default "var(--primary)"
  /** Multiplicador de velocidade. */
  speed?: number;          // default 1
  /** Intensidade da deformação, 0 = sem tremor. */
  chaos?: number;          // default 0.12
  /** Raio dos cantos, px. */
  radius?: number;         // default 16
  /** Espessura do traço, px. */
  thickness?: number;      // default 2
};
```

## Regras

1. **Estrutura.** Raiz `relative` com `border-radius: radius` e padding próprio (os filhos ficam
   dentro). Por cima, um `<canvas>` `absolute pointer-events-none aria-hidden` que passa da raiz em
   `pad = 24px` em cada lado (para caber brilho e deformação), medido por ResizeObserver, com
   `devicePixelRatio`.
2. **Contorno base.** Função pura `roundedRectPoints(w, h, r, step)` devolve pontos igualmente
   espaçados (~4 px) ao longo do perímetro do retângulo arredondado, com a normal para fora de
   cada ponto.
3. **Deformação.** Cada ponto anda ao longo da sua normal por
   `noise1D(s · freq + t · speed) · chaos · amplitudeMax`, onde `s` é a posição no perímetro e
   `noise1D` é um ruído de valor suave, determinístico, com 2 oitavas (função pura
   `valueNoise(x, seed)`), sem lib. `amplitudeMax = 40px`. Como o perímetro é fechado, o ruído é
   amostrado de forma periódica (o último ponto encontra o primeiro).
4. **Desenho.** Por quadro (`useFrameLoop`, 60 fps, pausa fora da tela com IntersectionObserver):
   limpar, traçar o caminho fechado com `lineWidth = thickness`, `strokeStyle` resolvido a partir
   de `color` (ler `getComputedStyle` de um elemento com `color: <valor>`, para aceitar
   `var(--primary)`), e um segundo traço com `shadowBlur = 12` e `globalAlpha = 0.6` para o brilho.
5. Só tokens no fonte. `color` padrão é token.

## Movimento reduzido

Sem animação: desenha um quadro só com `chaos = 0` (contorno limpo com brilho).

## Sem canvas (jsdom, ou `getContext` nulo)

A raiz ganha `border` com a cor do token (`border-[color:var(--primary)]` ou estilo inline com a
cor recebida) e nada é desenhado.

## Acessibilidade

Decorativo; canvas `aria-hidden`. Conteúdo segue normal.

## Marcação

- Raiz: `data-slot="electric-border"`, `data-animated`, `ref`, `cn`, props nativas.
- Canvas: `data-slot="electric-border-canvas"`.

## Testes mínimos

- `roundedRectPoints`: número de pontos ~ perímetro/step; normais unitárias; ponto do meio do lado
  de cima tem normal (0, -1).
- `valueNoise`: determinístico, em -1..1, contínuo (pontos próximos dão valores próximos).
- Sem `getContext` (jsdom): fallback de borda, sem erro.
- Com um `FakeCanvasContext` injetado, desenha um caminho fechado por quadro (rAF falso).
- Movimento reduzido: `data-animated="false"`.
- `ref`, `className`, filhos renderizados.
