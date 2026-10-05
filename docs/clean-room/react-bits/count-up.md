# Spec de comportamento: `count-up`

> **Proveniência (clean room).** Escrita em 04/10/2026 a partir da demo pública "Count Up" em
> `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.
> É diferente do nosso `sliding-number`: lá os dígitos rolam como odômetro, aqui o número
> **conta** de um valor a outro.

## O que a pessoa vê

Um número que sobe (ou desce) rapidamente do valor inicial até o final quando entra na tela,
desacelerando perto do fim. A largura não tremula enquanto conta.

## API (`atoms/typography/count-up`)

```ts
type CountUpProps = Omit<React.ComponentProps<"span">, "children"> & {
  to: number;
  from?: number;                         // default 0
  durationMs?: number;                   // default 1500
  delayMs?: number;                      // default 0
  /** Casas decimais fixas. Default: a maior quantidade entre `from` e `to`. */
  decimalPlaces?: number;
  /** Formatação via Intl.NumberFormat (separador de milhar, moeda, %). */
  locale?: string;                       // default "pt-BR"
  formatOptions?: Intl.NumberFormatOptions;
  /** Portão externo: só começa quando true E visível. */
  start?: boolean;                       // default true
  onStart?: () => void;
  onEnd?: () => void;
};
```

## Regras

1. **Disparo.** Começa na primeira vez que entra no viewport (uma vez só) e com `start=true`.
   Se `start` vira true depois, começa nesse momento (desde que visível).
2. **Curva** ease-out. Termina exatamente em `to`, sem arredondamento acumulado.
3. **Contagem para baixo.** Se `from > to`, conta para baixo. Não existe prop de direção.
4. **Formato.** Sempre `Intl.NumberFormat(locale, { minimumFractionDigits: d,
   maximumFractionDigits: d, ...formatOptions })`. Default pt-BR: 1234567 → "1.234.567".
5. **Largura.** A raiz usa `tabular-nums` para os dígitos terem largura fixa.
6. **Mudança de `to` com o componente montado.** Conta do valor atual até o novo.
7. **Callbacks.** `onStart` uma vez no início de cada contagem; `onEnd` uma vez no fim.

## Movimento reduzido

Mostra `to` formatado direto, sem contar, e chama `onEnd` uma vez.

## Acessibilidade

- O leitor de tela não pode ouvir cada número intermediário.
- O valor final formatado fica num `sr-only`, e o número que conta fica num `aria-hidden`.
- Com movimento reduzido, fica só o texto.

## Marcação

`data-slot="count-up"` na raiz, `ref` como prop, `cn` em `className`.

## Testes mínimos

- O sr-only mostra o valor final formatado em pt-BR.
- Com `MotionGlobalConfig.skipAnimations`, o visível termina em `to`, e `onStart` e `onEnd` são
  chamados uma vez cada.
- `from > to` termina em `to`.
- `decimalPlaces` default vem do maior número de casas: `to=12.5` dá "12,5".
- `formatOptions={{ style: "percent" }}` formata como porcentagem.
- `start=false` não começa e não chama `onStart`; trocar para true começa.
- Movimento reduzido: texto final direto e `onEnd` chamado.
- `ref` e `className` na raiz.
