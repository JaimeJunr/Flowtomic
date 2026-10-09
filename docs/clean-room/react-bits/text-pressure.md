# Spec de comportamento: `text-pressure`

> **Proveniência (clean room).** Escrita em 05/10/2026 a partir da demo pública "Text Pressure"
> em `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.

## O que a pessoa vê

Uma palavra que ocupa a largura toda do bloco. Cada letra engorda (ou alarga, ou inclina) quanto
mais perto o ponteiro estiver, como se ele "apertasse" o texto. As letras longe ficam finas.
Opcionalmente, as letras longe também ficam transparentes, ou ganham contorno.

## API (`atoms/typography/text-pressure`)

```ts
type TextPressureProps = Omit<React.ComponentProps<"div">, "children"> & {
  text: string;
  /** Faixa de peso (eixo wght). A fonte precisa ser variável. */
  weightRange?: [number, number];        // default [200, 900]
  /** Faixa de largura (eixo wdth). Só se a fonte tiver o eixo. */
  widthRange?: [number, number];
  /** Eixo ital/slnt: inclina perto do ponteiro. Só se a fonte tiver. */
  italic?: boolean;                      // default false
  /** Opacidade cai com a distância. */
  alpha?: boolean;                       // default false
  /** Contorno nas letras (cor do token da marca). */
  stroke?: boolean;                      // default false
  /** Estica na vertical para preencher a altura do container. */
  scaleToHeight?: boolean;               // default false
  minFontSizePx?: number;                // default 24
};
```

A fonte vem do CSS herdado. Com o tema, Public Sans é variável em wght 100–900 desde
05/10/2026. Os eixos que a fonte não tem são ignorados sem erro.

## Regras

1. **Ajuste.**
   - O tamanho da fonte faz a palavra preencher a largura do container (medida e recalculada
     no resize), com piso em `minFontSizePx`.
   - As letras são distribuídas com `flex` e `justify-between`.
2. **Proximidade.**
   - Para cada letra, `d` = distância do ponteiro ao centro da letra.
   - `t = clamp(1 - d / (largura do container / 2), 0, 1)`.
   - O valor do eixo é `min + (max - min) * t`, aplicado via `font-variation-settings`.
3. **Suavização.** O ponteiro "real" persegue o ponteiro do mouse ou do toque com lerp por
   quadro (~0.15). As letras atualizam no `requestAnimationFrame`, só visível.
4. **Repouso.** Sem ponteiro, o ponteiro virtual vai para o centro do container.
5. **`alpha`:** a opacidade é `0.3 + 0.7 t`.
6. **`stroke`:** `-webkit-text-stroke: 1px var(--primary)` e preenchimento transparente nas
   letras longe (`t < 0.5`).
7. **`scaleToHeight`:** `scaleY` para a altura do texto igualar a do container.
8. **Toque.** O toque também move o ponteiro.

## Movimento reduzido

As letras ficam no meio da faixa, sem reagir ao ponteiro.

## Acessibilidade

- O texto completo vai num `sr-only`.
- As letras animadas ficam em `aria-hidden`.

## Marcação

- Raiz: `data-slot="text-pressure"`, `ref`, `cn`.
- Letra: `data-slot="text-pressure-char"`.

## Testes mínimos

- Funções puras:
  - `t` pela distância (centro = 1, longe = 0);
  - `font-variation-settings` montado só com os eixos ativos;
  - lerp;
  - opacidade com `alpha`;
  - tamanho de fonte que preenche (com piso).
- N letras `aria-hidden` e o sr-only.
- Movimento reduzido: o valor médio da faixa.
- Texto vazio lança erro.
