# Spec de comportamento: `scroll-velocity`

> **Proveniência (clean room).** Escrita em 05/10/2026 a partir da demo pública "Scroll
> Velocity" em `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não
> foi lido**.

## O que a pessoa vê

Faixas de texto grande que correm na horizontal sem parar, cada faixa num sentido. Quando a
pessoa rola a página, as faixas aceleram de acordo com a velocidade do scroll. Se rola para
cima, elas invertem o sentido. Ao parar de rolar, voltam suavemente à velocidade base.

## API (`molecules/animation/scroll-velocity`)

```ts
type ScrollVelocityProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** Uma faixa por item. */
  items: React.ReactNode[];
  /** Velocidade base, em px/s. Faixas de índice ímpar vão no sentido oposto. */
  baseVelocity?: number;                         // default 40
  /** Até quantas vezes a velocidade do scroll multiplica a base. */
  maxBoost?: number;                             // default 5
  /** Velocidade de scroll (px/s) que leva ao `maxBoost`. */
  boostAtScrollSpeed?: number;                   // default 1000
  /** Container de scroll (default: a janela). */
  scrollContainerRef?: React.RefObject<HTMLElement | null>;
  /** Classe aplicada a cada cópia do item. */
  itemClassName?: string;
};
```

## Regras

1. **Cópias.** Cada faixa repete o item o suficiente para cobrir 2x a largura visível (mínimo
   4 cópias). A conta usa a largura **medida** da raiz e de uma cópia (ResizeObserver), não um
   número fixo. A faixa nunca termina antes da borda direita (revisão de 05/10/2026: com 1000px
   de largura, a faixa acabava em ~760px). O deslocamento volta exatamente uma cópia, sem salto.
2. **Velocidade.**
   - Velocidade do scroll via `useScroll` + `useVelocity` + `useSpring` (amortecida).
   - O fator é interpolado de [0, `boostAtScrollSpeed`] para [0, `maxBoost`].
   - A velocidade da faixa é `base * (1 + fator)`.
   - O sentido inverte quando o scroll vai para cima.
3. **Pausa** fora da tela e com a aba escondida.
4. **Item.** Pode ser texto ou qualquer nó (um ícone entre palavras, por exemplo).

## Movimento reduzido

Faixas paradas, sem reagir ao scroll.

## Acessibilidade

- Cada item vai num `sr-only` uma vez.
- As cópias que se movem ficam em `aria-hidden`.

## Marcação

- Raiz: `data-slot="scroll-velocity"`, `overflow-hidden`, `ref`, `cn`.
- Faixa: `data-slot="scroll-velocity-row"`.

## Testes mínimos

- N itens geram N faixas, cada uma com ≥4 cópias `aria-hidden` e o item em sr-only uma vez.
- Funções puras:
  - `wrap(min, max, v)`;
  - o fator de boost (0 → 0, 1000 → 5, acima disso, saturado);
  - o sentido por índice (par e ímpar).
- Movimento reduzido: sem `useAnimationFrame` avançando (estado `data-moving="false"`).
- `itemClassName` é aplicado às cópias.
