# Spec de comportamento: `logo-marquee`

> **Proveniência (clean room).** Escrita em 09/10/2026 a partir da demo pública "Logo Loop" em
> `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.

## O que a pessoa vê

Uma faixa com logos (ou qualquer item) que **rolam sem fim** numa direção, em velocidade
constante, sem emenda visível. Ao passar o ponteiro, a faixa desacelera até parar (ou até uma
velocidade menor) e acelera de volta ao sair. As bordas podem ter um esmaecimento que dissolve os
itens na cor do fundo.

## Por que existe (uso no produto)

"Usado por" em landing, lista de integrações, faixa de bancos/custodiantes suportados.

## API (`atoms/animation/logo-marquee`)

```ts
type LogoMarqueeItem =
  | { node: React.ReactNode; title?: string; href?: string }
  | { src: string; alt: string; title?: string; href?: string };

type LogoMarqueeProps = Omit<React.ComponentProps<"div">, "children"> & {
  items: LogoMarqueeItem[];
  /** px/s; negativo inverte. */
  speed?: number;                                   // default 60
  direction?: "left" | "right" | "up" | "down";     // default "left"
  /** Altura de cada item em px. */
  itemHeight?: number;                              // default 28
  gap?: number;                                     // default 40
  /** Velocidade no hover. 0 = para. undefined = não muda. */
  hoverSpeed?: number;                              // default 0
  fadeEdges?: boolean;                              // default false
  scaleOnHover?: boolean;                           // default false
  renderItem?: (item: LogoMarqueeItem, key: React.Key) => React.ReactNode;
  /** Rótulo da região. */
  "aria-label"?: string;                            // default "Logos de parceiros"
};
```

## Regras

1. **Estrutura.** Raiz `relative overflow-hidden` (`role="region"`, `aria-label`). Dentro, uma
   trilha `flex` (`flex-col` em up/down) com a lista repetida **K vezes**, onde K é o mínimo para
   cobrir 2× a largura visível (função pura `copiesNeeded(trackSize, viewport)`, mínimo 2),
   medido com ResizeObserver.
2. **Movimento.** Por rAF, o deslocamento cresce `velocidade · dt` e é reduzido módulo o tamanho
   de **uma** cópia (função pura `wrapOffset(offset, copySize)`), aplicado com `translate3d`.
   Isso não tem emenda porque as cópias são idênticas.
3. **Velocidade suave.** A velocidade atual persegue a alvo (`speed` ou `hoverSpeed`) com
   amortecimento exponencial (~0,25 s), função pura `approach(current, target, dt, tau)`.
4. **Hover.** Só ponteiro de mouse. `scaleOnHover`: o item sob o ponteiro escala 1,1.
5. **Itens.** Imagem: `<img alt height={itemHeight} loading="lazy" decoding="async"
   draggable={false}>`. Com `href`, envolvido em `<a>`. Cópias além da primeira:
   `aria-hidden="true"` e links com `tabIndex={-1}`.
6. **Fade.** `fadeEdges`: `mask-image: linear-gradient(to right, transparent, currentColor 10%,
   currentColor 90%, transparent)` (ou vertical). Sem hex.
7. Pausa quando a aba está oculta (`document.visibilityState`) ou fora da tela
   (IntersectionObserver).

## Movimento reduzido

Não rola. Mostra uma cópia só, com `flex-wrap` e `justify-center`.

## Acessibilidade

- Só a primeira cópia é lida e focável.
- Foco num link dentro da faixa pausa o movimento (`focus-within`), senão o item foge.

## Marcação

- Raiz: `data-slot="logo-marquee"`, `data-direction`, `ref`, `cn`.
- Trilha: `data-slot="logo-marquee-track"`; item: `data-slot="logo-marquee-item"`.

## Testes mínimos

- `copiesNeeded`, `wrapOffset` (positivo, negativo, exatamente o tamanho), `approach`.
- Renderiza os itens; cópias extras `aria-hidden` e links não focáveis.
- `src` vira `img` com `alt`; `node` é renderizado; `renderItem` substitui.
- Movimento reduzido: uma cópia, sem rAF.
- Foco num link marca `data-paused="true"`.
- `ref` e `className`.
