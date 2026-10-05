# Spec de comportamento: `encrypted-text` (melhoria do componente existente)

> **Proveniência (clean room).** Escrita em 04/10/2026 comparando o nosso `encrypted-text` com a
> demo pública "Decrypted Text" em `reactbits.dev` (aba Preview e tabela de props). O código do
> React Bits **não foi lido**.

## O que muda

Hoje o texto embaralhado se revela da esquerda para a direita quando entra na tela, uma vez
só. O componente ganha quatro coisas. **Sem as props novas, o comportamento é o de hoje.**

```ts
/** O que dispara a revelação. "view" = comportamento atual. */
trigger?: "view" | "hover" | "click";   // default "view"
/** De onde a revelação começa. "start" = comportamento atual. */
revealFrom?: "start" | "end" | "center"; // default "start"
/** Embaralhar só com os caracteres que já existem no texto (em vez do charset). */
scrambleWithOwnCharacters?: boolean;     // default false
```

E mais: **respeitar movimento reduzido** (hoje não respeita).

## Regras

1. **Disparo.**
   - `trigger="view"`: como hoje, uma vez.
   - `trigger="hover"`: o texto começa legível. Cada `pointerenter` (e `focus`, para teclado)
     embaralha e revela de novo.
   - `trigger="click"`: o texto começa legível. Cada clique (ou Enter/Espaço com foco) embaralha
     e revela de novo.

   Com `hover` e `click`, a raiz recebe `tabIndex=0` para ser alcançável por teclado.
2. **Ordem de revelação.**
   - `start`: índice 0 primeiro.
   - `end`: último índice primeiro.
   - `center`: do meio para as pontas, alternando.
3. **`scrambleWithOwnCharacters`.** Os caracteres aleatórios saem do conjunto dos caracteres
   não-espaço do próprio texto. Espaços nunca são embaralhados (como hoje).
4. **Movimento reduzido** (`useShouldReduceMotion`): texto final direto, sem embaralhar, com
   qualquer trigger.
5. **Acessibilidade:** o `aria-label={text}` atual continua. O conteúdo embaralhado fica em
   `aria-hidden`.

## Testes mínimos

- Regressão: sem props novas, revela em ordem a partir do início.
- `revealFrom="end"` e `"center"`: ordem dos índices revelados. Testar a função pura de ordem.
- `trigger="hover"`: antes do hover o texto é legível; o hover dispara o embaralhamento.
- `trigger="click"` com teclado (Enter).
- `scrambleWithOwnCharacters`: todo caractere embaralhado pertence ao texto.
- Movimento reduzido mostra o texto final.
