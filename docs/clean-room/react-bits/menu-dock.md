# Spec de comportamento: `menu-dock` floating (melhoria do componente existente)

> **Proveniência (clean room).** Escrita em 04/10/2026 comparando o nosso `menu-dock`
> (`animationType="floating"`) com a demo pública "Dock" em `reactbits.dev` (aba Preview e
> tabela de props). O código do React Bits **não foi lido**.

## O que muda

O nosso dock flutuante já tem a "lupa" estilo macOS (o ícone cresce perto do ponteiro). Os
números estão fixos no código. Eles viram props, **com os defaults iguais aos valores de hoje**.

```ts
/** Tamanho do item longe do ponteiro, em px. */
dockItemSize?: number;          // default = valor atual (40)
/** Tamanho do item sob o ponteiro, em px. */
dockMagnification?: number;     // default = valor atual (80)
/** Distância do ponteiro, em px, a partir da qual o item volta ao tamanho base. */
dockMagnifyDistance?: number;   // default = valor atual (150)
```

As props só valem com `animationType="floating"`.

## Regras

1. O ícone interno mantém a proporção atual em relação ao item (hoje é metade).
2. **Movimento reduzido:** sem lupa. O item fica fixo em `dockItemSize`.
3. **Teclado:** o item com foco recebe o tamanho máximo, como se o ponteiro estivesse sobre
   ele. Hoje o foco não amplia; quem usa teclado também merece o retorno.

## Testes mínimos

- Regressão: sem props, as faixas de `useTransform` são as mesmas de hoje. Testar a função
  pura que monta as faixas.
- Props novas alteram as faixas.
- Movimento reduzido: o item fica no tamanho base.
- Foco por teclado amplia o item.
