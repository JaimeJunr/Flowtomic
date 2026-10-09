# Spec de comportamento: `curved-loop`

> **Proveniência (clean room).** Escrita em 05/10/2026 a partir da demo pública "Curved Loop"
> em `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.

## O que a pessoa vê

Uma faixa de texto que corre sem fim ao longo de uma curva suave, como uma fita arqueada.
Dá para agarrar a faixa e arrastar para os lados. Ao soltar, ela continua correndo na direção
do último arrasto.

## API (`atoms/typography/curved-loop`)

```ts
type CurvedLoopProps = Omit<React.ComponentProps<"div">, "children"> & {
  text: string;
  /** Velocidade em px/s. */
  speed?: number;                       // default 60
  /** Quanto a curva desce no meio, em unidades do viewBox. 0 = reta. Negativo = arco para cima. */
  curve?: number;                       // default 120
  direction?: "left" | "right";         // default "left"
  draggable?: boolean;                  // default true
};
```

## Regras

1. **Desenho.**
   - SVG com `viewBox` largo (ex.: 1440 x altura suficiente) e `width: 100%`.
   - Uma curva quadrática de borda a borda, com o ponto de controle no meio, deslocado `curve`
     para baixo.
   - O texto usa `<textPath>` e `fill="currentColor"`, com a fonte herdada.
2. **Repetição.**
   - O texto é repetido (com um separador de espaço) quantas vezes for preciso para cobrir 2x
     o comprimento da curva. O comprimento é medido com `getComputedTextLength`; no jsdom, use
     um fallback.
   - O loop avança o `startOffset` e volta exatamente um "período" (o comprimento de uma
     cópia), sem salto visível.
3. **Arrasto.**
   - Com o ponteiro pressionado, o deslocamento segue o ponteiro.
   - Ao soltar, a direção passa a ser a do último movimento.
   - O cursor é `grab` / `grabbing`.
   - O teclado move com ←/→ quando tem foco (`tabIndex=0`).
4. **Pausa** fora da tela.

## Movimento reduzido

Texto parado na curva. Arrasto e teclado continuam funcionando, mas sem movimento automático.

## Acessibilidade

- O texto vai num `sr-only` uma vez.
- O SVG fica em `aria-hidden`.
- Com `draggable`, a raiz tem `role="group"` e um `aria-roledescription` em português
  ("faixa de texto arrastável").

## Marcação

`data-slot="curved-loop"` na raiz, `ref`, `cn`.

## Testes mínimos

- O path tem o ponto de controle correto para `curve`. Testar a função pura do `d`.
- A função pura de "envolver o offset no período" mantém o valor no intervalo.
- O sr-only tem o texto uma vez.
- Arrasto (pointerdown, pointermove, pointerup) para a direita muda a direção para "right"
  (estado exposto, ex.: `data-direction`).
- A tecla → move o offset.
- Movimento reduzido: sem loop automático.
- Texto vazio lança erro.
