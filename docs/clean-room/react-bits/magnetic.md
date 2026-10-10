# Spec de comportamento: `magnetic`

> **Proveniência (clean room).** Escrita em 09/10/2026 a partir da demo pública "Magnet" em
> `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.

## O que a pessoa vê

Um elemento (botão, ícone, card) que é **puxado em direção ao ponteiro** quando o ponteiro chega
perto, como um ímã fraco. O elemento se desloca uma fração da distância até o ponteiro, sem
largar o lugar. Ao afastar o ponteiro além do raio, ele volta devagar para a posição original.

## Por que existe (uso no produto)

Chamar atenção para o CTA principal de uma tela vazia ou de um hero, sem animação constante.

## API (`atoms/animation/magnetic`)

```ts
type MagneticProps = React.ComponentProps<"div"> & {
  /** Distância em px, além da borda, em que o ímã liga. */
  padding?: number;          // default 80
  /** Maior = menos deslocamento. Deslocamento = distância / strength. */
  strength?: number;         // default 3
  /** Teto do deslocamento em px, para não fugir do layout. */
  maxOffset?: number;        // default 24
  disabled?: boolean;        // default false
  /** Classe do elemento que se move (a raiz não se move). */
  innerClassName?: string;
};
```

## Regras

1. **Estrutura.** Raiz `inline-block` (fica parada, mede a área); dentro, um `motion.div`
   (`data-slot="magnetic-inner"`) que se move com `x`/`y`.
2. **Zona.** Um `pointermove` no `window` (só `pointerType === "mouse"` ou `"pen"`) calcula o
   centro do retângulo da raiz. O ímã está ativo se o ponteiro está dentro do retângulo expandido
   por `padding` em cada lado. Função pura `isInZone(rect, x, y, padding)`.
3. **Deslocamento.** Ativo: `offset = clamp((ponteiro - centro) / strength, ±maxOffset)`, por eixo
   (função pura `magnetOffset(rect, x, y, strength, maxOffset)`). Inativo: `0, 0`.
4. **Transição.** Mola do motion: ao ativar, rápida (stiffness alta, ~0,3 s); ao soltar, mais
   lenta (~0,5 s). O valor alvo muda por `useMotionValue` + `useSpring`, sem re-render por
   movimento.
5. **Toque.** Em toque não há hover: nada se move.
6. `disabled` zera o deslocamento e remove o listener.

## Movimento reduzido

Não se move; o listener nem é registrado.

## Acessibilidade

Puramente visual. Não altera foco, ordem nem área clicável (a área clicável é a do filho, que
anda junto). O movimento máximo pequeno (`maxOffset`) evita que o alvo fuja do clique.

## Marcação

- Raiz: `data-slot="magnetic"`, `data-active="true|false"`, `ref`, `cn`, props nativas.
- Interno: `data-slot="magnetic-inner"`, `innerClassName`.

## Testes mínimos

- `isInZone`: dentro, na borda do padding, fora.
- `magnetOffset`: centro → 0; à direita → positivo; respeita `maxOffset` e `strength`.
- Ponteiro de mouse perto → `data-active="true"`; longe → `"false"`.
- Ponteiro de toque não ativa.
- `disabled` não ativa.
- Movimento reduzido não ativa.
- `ref`, `className` e `innerClassName`.
