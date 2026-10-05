# Spec de comportamento: `shimmer` (melhoria do componente existente)

> **Proveniência (clean room).** Escrita em 04/10/2026 comparando o nosso `shimmer` com a demo
> pública "Shiny Text" em `reactbits.dev` (só a aba Preview e a tabela de props). O código do
> React Bits **não foi lido**.

## O que muda

O `shimmer` atual (`atoms/animation/shimmer/shimmer.tsx`) faz um brilho atravessar o texto em
loop. Ele ganha três controles. **Nada muda para quem não passar as props novas.**

```ts
/** Lado de onde o brilho parte. "start" = comportamento atual. */
direction?: "start" | "end";          // default "start"
/** Pausa entre uma passada do brilho e a próxima, em ms. */
repeatDelayMs?: number;               // default 0
/** Congela o brilho enquanto o ponteiro está sobre o texto. */
pauseOnHover?: boolean;               // default false
```

## Regras

1. **`direction="end"`** faz o brilho percorrer o sentido contrário ao atual, trocando as
   posições inicial e final do fundo.
2. **`repeatDelayMs`** vira o `repeatDelay` (em segundos) da transição em loop.
3. **`pauseOnHover`:** no `pointerenter`, o brilho para onde está. No `pointerleave`, continua
   do mesmo ponto, sem pular para o começo.
4. **Movimento reduzido** continua igual a hoje: texto estático, sem brilho.
5. Cores continuam vindo de token. O componente não ganha prop de cor.

## Testes mínimos

- Sem as props novas, o `initial` e o `animate` são os mesmos de antes. Esse é o teste de
  regressão.
- `direction="end"` inverte as posições.
- `repeatDelayMs` aparece na transição.
- `pauseOnHover`: o hover pausa e o leave retoma. Verificar via estado exposto (`data-paused`)
  ou pelos controles de animação.
