# Spec de comportamento: `variable-proximity`

> **Proveniência (clean room).** Escrita em 05/10/2026 a partir da demo pública "Variable
> Proximity" em `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi
> lido**.

## O que a pessoa vê

Um texto normal, de tamanho comum. As letras perto do ponteiro ficam mais grossas, numa "bolha"
que acompanha o mouse pelo texto. Longe dele, o texto fica no peso normal.

## API (`atoms/typography/variable-proximity`)

```ts
type VariableProximityProps = Omit<React.ComponentProps<"span">, "children"> & {
  text: string;
  fromWeight?: number;                                   // default 400
  toWeight?: number;                                     // default 800
  /** Eixos extras em formato CSS, interpolados junto (ex.: { opsz: [9, 40] }). */
  extraAxes?: Record<string, [number, number]>;
  radiusPx?: number;                                     // default 80
  falloff?: "linear" | "exponential" | "gaussian";       // default "linear"
  /** Área que escuta o ponteiro (default: a própria raiz). */
  containerRef?: React.RefObject<HTMLElement | null>;
};
```

## Regras

1. **Intensidade.** Para cada letra, `d` = distância do ponteiro ao centro da letra, e
   `t = falloff(d / radiusPx)`:
   - `linear`: `max(0, 1 - x)`;
   - `exponential`: `x >= 1 ? 0 : (1 - x)^2`;
   - `gaussian`: `exp(-(x²) / (2 · 0.35²))` com corte em `x >= 1` (vira 0).
2. **Aplicação.** `font-variation-settings: "wght" <from + (to-from)·t>` mais os
   `extraAxes`. Atualiza no `requestAnimationFrame` só quando o ponteiro mexe dentro da área.
3. **Espaços.** As palavras não quebram no meio (cada palavra fica num `inline-block`
   `whitespace-nowrap`), e os espaços são preservados.
4. **Saída.** Quando o ponteiro sai, tudo volta a `fromWeight`.

## Movimento reduzido

O efeito continua (é resposta direta ao ponteiro, sem animação autônoma), mas sem transição: o
valor é aplicado direto.

## Acessibilidade

- O texto completo vai num `sr-only`.
- As letras ficam em `aria-hidden`.

## Marcação

- Raiz: `data-slot="variable-proximity"`, `ref`, `cn`.
- Letra: `data-slot="variable-proximity-char"`.

## Testes mínimos

- Funções puras: as três curvas (0 → 1, ≥1 → 0, monotônicas), e a montagem do
  `font-variation-settings` com eixos extras.
- `pointermove` sobre uma letra (posições stubadas) aumenta o wght dela e não o de uma letra
  longe.
- `pointerleave` reseta.
- Espaços preservados entre palavras.
- Texto vazio lança erro.
