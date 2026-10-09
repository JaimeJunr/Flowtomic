# Spec de comportamento: `slide-to-confirm`

> **Proveniência (clean room).** Escrita em 09/10/2026 a partir da demo pública "Slide Commit" em
> `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.

## O que a pessoa vê

Uma pílula "Deslize para pagar" com uma alça redonda (seta) à esquerda. Arrastar a alça para a
direita **pinta o caminho** atrás dela (uma cápsula da cor da alça cresce e apaga o texto). Soltar
antes do fim faz a alça voltar com uma batidinha na parede. Chegando ao fim, a ação dispara; se
ela devolve uma promessa, a alça mostra um spinner. Se der certo, a pílula vira "Pago ✓" em cor
de sucesso (com um leve afundar do trilho) e depois de 1,5 s volta. Se falhar, a alça volta para
o começo tingida de perigo e o texto vira "Falha no pagamento".

## API (`atoms/actions/slide-to-confirm`)

```ts
type SlideToConfirmProps = Omit<React.ComponentProps<"div">, "children" | "onError"> & {
  label?: React.ReactNode;           // default "Deslize para confirmar"
  doneLabel?: React.ReactNode;       // default "Confirmado"
  errorLabel?: React.ReactNode;      // default "Não deu certo"
  onConfirm: () => void | Promise<unknown>;
  onDone?: () => void;
  onError?: (reason: unknown) => void;
  size?: "default" | "lg";           // trilho 48 / 56 px de altura; largura 100% do pai (máx. via className)
  /** 0..100: rapidez do desenrolar e da volta. */
  speed?: number;                    // default 50
  returnBounce?: number;             // 0..1, default 0.38
  landingDip?: number;               // default 0.026 (fração de scale)
  holdMs?: number;                   // default 1500; 0 = fica até remontar
  disabled?: boolean;
  icon?: React.ReactNode;            // default lucide ChevronRight
};
```

## Regras

1. **Alça** é um `role="slider"` com `aria-valuemin=0`, `aria-valuemax=100`, `aria-valuenow`
   (progresso), `aria-label` = texto do `label` (ou "Deslize para confirmar"), focável.
   Teclado: `Enter`/`Espaço` ou `End` confirmam direto (atalho acessível; o deslizar é só o gesto);
   setas avançam 10%.
2. **Cores (só tokens):** trilho `bg-muted`, texto `text-muted-foreground`, alça e cápsula
   `bg-primary` / ícone `text-primary-foreground`, sucesso `bg-success text-success-foreground`,
   perigo `text-destructive` e alça `bg-destructive`. (`--success` existe no tema, medido em 09/10/2026.)
3. **Arrastar:** pointer capture; posição limitada a `[0, travel]`
   (`travel = largura do trilho - alça - 2*inset`). Função pura `progress(x, travel)` 0..1.
   A cápsula pintada tem `width = x + alça`. O texto ganha `clip-path` ou opacidade
   `1 - progress*1.5`.
4. **Soltar:** `progress >= 0.95` → confirma; senão volta por mola com `bounce = returnBounce`.
5. **Confirmar:** fase `pending` se `onConfirm` devolver promessa (spinner `Loader2` girando na
   alça, `aria-busy`); `resolve` → fase `done`: a alça "desenrola" ocupando a pílula toda (largura
   animada), ícone `Check` + `doneLabel`, trilho faz `scale [1, 1 - landingDip, 1]`, chama
   `onDone`; depois de `holdMs` volta a `idle`. `reject` → fase `error`: alça volta para 0,
   tingida, texto vira `errorLabel`, chama `onError(reason)` (a rejeição é engolida); o próximo
   arraste limpa o erro. Reducer puro `slideReducer`.
6. **Disabled:** `opacity-50`, sem arrasto nem teclado.

## Movimento reduzido

Sem mola nem batida nem afundar: posições mudam direto; spinner gira (é informação).

## Acessibilidade

`aria-live="polite"` anuncia `doneLabel` / `errorLabel`.

## Marcação

Raiz: `data-slot="slide-to-confirm"`, `data-phase="idle"|"dragging"|"pending"|"done"|"error"`.
Partes: `slide-to-confirm-handle`, `slide-to-confirm-fill`.

## Testes mínimos

- Puras: `progress`, `slideReducer` (todas as transições).
- Teclado: Enter na alça chama `onConfirm`; com promessa resolvida vai a `done`, mostra
  `doneLabel`, chama `onDone`; com `holdMs` (fake timers) volta a `idle`; `holdMs=0` fica.
- Promessa rejeitada → `error`, mostra `errorLabel`, chama `onError(reason)`, nada lançado.
- Promessa pendente → `aria-busy="true"`.
- Arrasto simulado (mock de `getBoundingClientRect`/`offsetWidth`) até o fim confirma; até a
  metade não confirma.
- Disabled ignora. Movimento reduzido confirma. `ref`/`className`.
