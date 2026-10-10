# Spec de comportamento: `click-spark`

> **Proveniência (clean room).** Escrita em 09/10/2026 a partir da demo pública "Click Spark" em
> `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.

## O que a pessoa vê

Uma área qualquer (um painel, uma página, um botão grande). Cada clique dentro dela solta um
**estalo de faíscas**: N traços curtos saem do ponto do clique em direções igualmente espaçadas
(como os raios de uma roda), andam para fora e encolhem até sumir, em ~400 ms. Cliques seguidos
somam estalos sem cortar os anteriores. O conteúdo de dentro continua clicável normalmente.

## Por que existe (uso no produto)

Retorno de "feito" em ações pequenas e felizes: marcar tarefa, curtir, concluir etapa.

## API (`atoms/animation/click-spark`)

```ts
type ClickSparkProps = React.ComponentProps<"div"> & {
  /** Cor dos traços. Token CSS; padrão a cor da marca. */
  color?: string;          // default "var(--primary)"
  /** Comprimento inicial de cada traço, px. */
  sparkSize?: number;      // default 10
  /** Distância que o traço percorre, px. */
  sparkRadius?: number;    // default 18
  /** Traços por clique. */
  sparkCount?: number;     // default 8
  /** Duração de um estalo, ms. */
  duration?: number;       // default 400
  easing?: "linear" | "ease-in" | "ease-out" | "ease-in-out"; // default "ease-out"
  /** Multiplicador da distância. */
  extraScale?: number;     // default 1
};
```

## Regras

1. **Estrutura.** Raiz `relative` com os `children`. Por cima, um `<canvas>` `absolute inset-0
   pointer-events-none`, `aria-hidden`, do tamanho da raiz (ResizeObserver; respeitar
   `devicePixelRatio`).
2. **Clique.** `pointerdown` na raiz (botão principal) cria um estalo na posição relativa à raiz:
   `sparkCount` traços com ângulo `2π·i/sparkCount`, todos com o mesmo instante inicial.
3. **Animação.** Por `requestAnimationFrame`, só enquanto houver estalo vivo (o loop para quando a
   lista esvazia). Para progresso `p = easing(t/duration)`:
   - distância do início do traço = `p · sparkRadius · extraScale`;
   - comprimento = `sparkSize · (1 - p)`;
   - traço removido quando `t ≥ duration`.
   Isso fica numa função pura `sparkSegment(angle, p, opts) → {x1,y1,x2,y2}`.
4. **Cor.** A string de `color` é resolvida para o canvas lendo `getComputedStyle` de um elemento
   com `color: <valor>` (funciona com `var(--primary)`, que o canvas não entende direto). Só
   tokens no código; nada de hex.
5. **Teclado.** Enter/Espaço num filho focável que gere `click` sem ponteiro (`event.detail === 0`)
   solta o estalo no centro do elemento clicado.

## Movimento reduzido

Nenhum estalo é desenhado (o canvas nem monta). O clique segue funcionando no conteúdo.

## Acessibilidade

O efeito é decorativo: canvas `aria-hidden`, sem anúncio. Não captura foco nem impede eventos.

## Marcação

- Raiz: `data-slot="click-spark"`, `ref`, `cn`, props nativas.
- Canvas: `data-slot="click-spark-canvas"`.

## Testes mínimos

- `sparkSegment` em p = 0, 0,5 e 1 (comprimento some em 1; distância cresce).
- Ângulos igualmente espaçados para `sparkCount` 4 e 8.
- Funções de easing nos extremos (0 → 0, 1 → 1).
- Clique cria estalo (contador interno exposto por `data-sparks` na raiz) e ele some depois de
  `duration` (rAF e tempo falsos).
- Clique em filho continua chegando ao `onClick` do filho.
- Movimento reduzido: sem canvas.
- `ref`, `className` e props nativas na raiz.
