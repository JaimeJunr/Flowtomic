# Spec de comportamento: `thinking-line`

> **Proveniência (clean room).** Escrita em 09/10/2026 a partir da demo pública "Thought Line" em
> `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.

## Decisão

Atom leve para o estado **ao vivo** do raciocínio. O organism `reasoning` continua sendo o
registro completo e expansível (decidido em 09/10/2026).

## O que a pessoa vê

Uma linha "Pensando…" com um brilho (✦) que **respira** (escurece e clareia num ciclo de 1,6 s) e
uma faixa de brilho que **varre o texto**. Abaixo, opcionalmente, uma trilha de passos ("Lendo a
pergunta", "Buscando nas suas notas", "Comparando duas abordagens"): o último é o atual, os
anteriores ganham ✓. Quando termina, a linha **assenta**: o texto troca suavemente (com um leve
desfoque na costura) para "Pensou por 2,7 s", o brilho apaga, e a trilha **dobra** para dentro da
linha, que vira um botão com chevron para reabrir.

## API (`atoms/feedback/thinking-line`)

```ts
type ThinkingLineProps = Omit<React.ComponentProps<"div">, "children"> & {
  label?: string;                    // default "Pensando…"
  /** Vazio = "Pensou por X s" (ou "Pensamento concluído" sem cronômetro). */
  doneLabel?: string;
  glyph?: "sparkle" | "dot" | "none" | React.ReactNode;  // default "sparkle" (lucide Sparkle)
  steps?: string[];                  // default []
  collapsible?: boolean;             // default true
  collapseOnSettle?: boolean;        // default true
  working?: boolean;                 // default true; true de novo reinicia o relógio
  settleAfterS?: number;             // default 0 (espera `working`)
  elapsed?: number;                  // segundos controlados
  showTimer?: boolean;               // default true
  shimmer?: boolean;                 // default true
  onSettle?: (seconds: number) => void;
};
```

## Regras

1. **Respirar:** glifo (e o texto, quando `shimmer=false`) com opacidade `1 → 0.55 → 1` em 1,6 s.
   Com `shimmer`, o texto usa `bg-clip-text` com gradiente `currentColor` → `var(--muted-foreground)`
   → `currentColor` deslizando (1,8 s), e só o glifo respira.
2. **Cronômetro:** conta enquanto `working`, mostra no fim "Pensou por 2,7 s"
   (`Intl.NumberFormat("pt-BR")`, 1 casa; função pura `formatThought(seconds)`). `elapsed` controla.
3. **Assentar** (quando `working` vira false ou passa `settleAfterS`): troca de texto com
   cross-fade + `blur(2px)` na costura, 350 ms; glifo vai para `opacity-40`; chama `onSettle(s)`
   uma vez por assentamento.
4. **Trilha:** lista `<ol>` com `text-muted-foreground text-sm`; passo atual com o mesmo
   brilho/respiração; anteriores com `Check` `text-success`. Com `collapsible`, a linha é um
   `<button aria-expanded aria-controls>` com `ChevronRight` girando; `collapseOnSettle` fecha ao
   assentar.
5. **Cores:** só tokens e `currentColor`.

## Movimento reduzido

Sem respirar e sem varredura; troca de texto direta; dobrar sem animar.

## Acessibilidade

`role="status"` + `aria-live="polite"` na linha; o texto anunciado é o rótulo (não o relógio a cada
décimo — o relógio é `aria-hidden` enquanto trabalha); ao assentar, anuncia "Pensou por 2,7
segundos".

## Marcação

Raiz `data-slot="thinking-line"`, `data-state="working"|"settled"`. Partes: `thinking-line-glyph`,
`thinking-line-label`, `thinking-line-steps`.

## Testes mínimos

- Pura `formatThought` (2.74 → "2,7 s").
- Fake timers: trabalhando mostra o rótulo; `working=false` → "Pensou por X s", `onSettle` uma vez.
- `settleAfterS=2` assenta sozinho. `elapsed` controlado. `showTimer=false` → "Pensamento concluído".
- Passos: o último sem ✓, anteriores com ✓; `collapseOnSettle` esconde a trilha e o botão reabre.
- `glyph="none"` sem glifo. Movimento reduzido. `ref`/`className`.
