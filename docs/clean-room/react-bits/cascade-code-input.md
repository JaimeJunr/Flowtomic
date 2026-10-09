# Spec de comportamento: `cascade-code-input`

> **Proveniência (clean room).** Escrita em 09/10/2026 a partir da demo pública "Code Slots" em
> `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.

## O que a pessoa vê

Seis casas para um código de verificação. Cada dígito digitado **pousa** na casa: um
preenchimento de destaque cresce numa mola e o dígito sobe alguns pixels até o lugar. A casa ativa
tem anel e um cursor piscando. Colar o código inteiro faz os dígitos pousarem **em cascata**
(20 ms entre casas). Se o código for recusado (`status="error"`), as casas **esvaziam da última
para a primeira** tingidas de perigo e o campo limpa. Se for aceito (`status="success"`), os
preenchimentos se fundem numa faixa única e o campo trava.

## API (`atoms/forms/cascade-code-input`)

```ts
type CascadeCodeInputProps = {
  length?: number;                   // default 6
  value?: string;
  defaultValue?: string;             // default ""
  onValueChange?: (code: string) => void;
  onComplete?: (code: string) => void;
  status?: "idle" | "error" | "success"; // default "idle"
  mask?: boolean;                    // default false (mostra • )
  caret?: boolean;                   // default true
  disabled?: boolean;
  autoFocus?: boolean;
  size?: "sm" | "default" | "lg";    // casa 36 / 44 / 52 px
  bounce?: number;                   // default 0.2
  settleS?: number;                  // default 0.3
  rise?: number;                     // default 8
  cascadeMs?: number;                // default 20
  "aria-label"?: string;             // default "Código de verificação"
  className?: string;
  ref?: React.Ref<HTMLInputElement>;
};
```

## Regras

1. **Base:** a lib `input-otp` (já é dependência; o atom `input-otp` usa). Ela dá o `<input>`
   invisível único (colar, autofill de SMS `autocomplete="one-time-code"`, teclado, seleção) e o
   `render` das casas. Só dígitos (`pattern` `^\d+$`).
2. **Cores (só tokens):** casa vazia `bg-muted`, ativa `ring-2 ring-ring`, preenchimento
   `bg-primary`, dígito `text-primary-foreground font-mono`, cursor `bg-foreground`, erro
   `bg-destructive` / `ring-destructive`, sucesso `bg-success`.
3. **Pouso:** casa que ganhou dígito: preenchimento `scale` 0.6 → 1 com mola (`bounce`), dígito
   `y: rise → 0` e opacidade 0 → 1 em `settleS`. Vários dígitos novos no mesmo tick (colar ou
   `value` externo) recebem atraso `índiceNovo * cascadeMs`. Função pura
   `landingDelays(prev, next, cascadeMs)` → mapa casa→atraso só das que mudaram para cheias.
4. **Remoção:** dígito apagado esvazia ao contrário (sem atraso).
5. **Erro:** ao virar `error`, esvazia da última para a primeira (`drainDelays(length, cascadeMs)`),
   tingindo de perigo; ao fim chama `onValueChange("")`. Volta a `idle` visual quando a pessoa
   digita de novo (o pai controla `status`).
6. **Sucesso:** o `gap` entre casas anima para 0 e os cantos internos perdem o raio, formando uma
   faixa; input `disabled`.
7. `onComplete` uma vez quando a última casa é preenchida.
8. `mask`: mostra `•`.

## Movimento reduzido

Sem mola, subida, cascata e fusão animada: estados aparecem direto. O cursor não pisca (fica fixo).

## Acessibilidade

O `<input>` tem o `aria-label`; um `sr-only aria-live="polite"` diz "3 de 6 dígitos" e, no erro,
"Código incorreto".

## Marcação

Raiz: `data-slot="cascade-code-input"`, `data-status`. Casas: `cascade-code-input-slot` com
`data-filled`, `data-active`.

## Testes mínimos

- Puras: `landingDelays` (um dígito → 0; colar 6 → 0,20,…,100; sem mudança → vazio),
  `drainDelays` (última primeiro).
- Digitar "123456" chama `onValueChange` a cada dígito e `onComplete("123456")` uma vez.
- Letras são ignoradas. `mask` mostra pontos. `length=4` renderiza 4 casas.
- `status="error"` → depois dos timers, `onValueChange("")`; `status="success"` desabilita o input.
- Disabled. Movimento reduzido. `ref` chega no `<input>`; `className` na raiz.
