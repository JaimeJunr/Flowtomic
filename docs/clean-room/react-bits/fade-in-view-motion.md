# Spec de ampliação: `fade-in-view` com deslocamento e escala

> **Proveniência (clean room).** Escrita em 11/10/2026 a partir da demo pública "Animated
> Content" em `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi
> lido**. Não cria componente novo: amplia o atom existente `atoms/animation/fade-in-view`.

## O que muda para quem vê

Além de aparecer por opacidade (e desfoque), o conteúdo pode **chegar deslizando** de uma
direção (de baixo, de cima, da esquerda, da direita) por uma distância em px, e/ou **crescer**
de uma escala inicial. Ao sumir (`disappearAfter`), ele faz o caminho de volta.

## Props novas (todas opcionais, com default que mantém o comportamento atual)

```ts
direction?: "up" | "down" | "left" | "right"; // de onde vem; default "up" (vem de baixo, sobe)
distance?: number;   // px, default 0 (sem deslocamento, como hoje); >= 0, senão lança erro
scale?: number;      // escala inicial, default 1; > 0, senão lança erro com o valor
```

## Regras

1. **Deslocamento inicial (puro `offsetFor(direction, distance)` → `{ x, y }`).** `up` →
   `{ x: 0, y: distance }` (começa abaixo e sobe); `down` → `{ x: 0, y: -distance }`; `left` →
   `{ x: distance, y: 0 }` (começa à direita, vai para a esquerda); `right` → `{ x: -distance,
   y: 0 }`. Com `distance 0`, `{ x: 0, y: 0 }`.
2. **Variantes.** O estado escondido ganha `x`, `y` e `scale` iniciais; o mostrado,
   `x 0, y 0, scale 1`; o "sumido" volta aos valores iniciais. A transição de entrada e saída
   continua a mesma (`duration`, `ease`, `delay`, `disappear*`).
3. **Nada mais muda:** `once`, `threshold`, `blur`, `initialOpacity`, callbacks e o `ref`
   seguem iguais. Testes existentes continuam passando sem alteração.

## Movimento reduzido

Igual a hoje: aparece direto no estado mostrado, sem deslocamento nem escala.

## Testes mínimos (somar aos atuais)

- `offsetFor` nas quatro direções e com `distance 0`.
- `fadeVariants` com `distance`/`scale` coloca os iniciais no estado escondido e zera no mostrado.
- `distance` negativo e `scale <= 0` lançam erro com o valor.
- Story nova `Slide` (de baixo, 60 px) e `FromLeft` (da esquerda, com `scale 0.95`).
