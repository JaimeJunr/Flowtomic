# Spec de comportamento: `scrub-number-field`

> **Proveniência (clean room).** Escrita em 09/10/2026 a partir da demo pública "Scrub Field" em
> `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.

## O que a pessoa vê

Um chip "Raio  24 px". Arrastar horizontalmente em qualquer lugar do chip **muda o número**
(cada 2 px = 1 passo); um fundo de destaque preenche o chip da esquerda proporcional ao valor na
faixa. Enquanto arrasta, uma pilulazinha acompanha o ponteiro mostrando a diferença ("+6").
Passando do limite, o número **estica como borracha** um pouco além e volta ao soltar. Shift
acelera 10×, Alt desacelera 0,1×. Clicar sem mover abre a edição por teclado.

## API (`atoms/forms/scrub-number-field`)

```ts
type ScrubNumberFieldProps = Omit<React.ComponentProps<"div">, "onChange" | "defaultValue"> & {
  label: string;
  suffix?: string;                   // default ""
  value?: number;
  defaultValue?: number;             // default 0
  min?: number;                      // default 0
  max?: number;                      // default 100
  step?: number;                     // default 1 (define as casas decimais)
  size?: "sm" | "default" | "lg";    // 28 / 32 / 40 px
  sensitivity?: number;              // px por passo, default 2
  /** % da faixa que dá para passar do limite. 0 = parada seca. */
  rubberReach?: number;              // default 8
  returnMs?: number;                 // default 300
  coarseMultiplier?: number;         // default 10
  fineMultiplier?: number;           // default 0.1
  showDelta?: boolean;               // default true
  showDirty?: boolean;               // default false
  showFill?: boolean;                // default true
  disabled?: boolean;
  onValueChange?: (value: number) => void;
  onValueCommit?: (value: number) => void;
};
```

## Regras

1. **Acessibilidade:** o número é um `<input type="text" inputMode="decimal" role="spinbutton">`
   com `aria-valuemin/max/now`, `aria-valuetext="24 px"`, `aria-label={label}`. Setas ±step,
   Shift+seta ×coarse, Alt+seta ×fine, PageUp/Down ×coarse, Home/End. O chip inteiro é a área de
   arraste (`cursor-ew-resize`).
2. **Cores (só tokens):** chip `bg-secondary`, rótulo `text-muted-foreground`, número
   `text-foreground font-mono tabular-nums`, preenchimento `bg-primary/15`, anel "sujo"
   `ring-1 ring-primary`, pílula de delta `bg-primary text-primary-foreground`.
3. **Arrastar:** pointer capture; `Δpassos = round(Δx / sensitivity) * multiplicador`
   (modificadores lidos a cada movimento). Função pura `scrubValue(start, dx, opts)` que aplica
   step, multiplicador e casas decimais (fine adiciona uma casa).
4. **Borracha:** fora de `[min, max]` o excesso é comprimido: função pura
   `rubberBand(raw, min, max, reachPct)` → nunca passa de `max + reach` (curva assintótica).
   O valor comprometido é sempre limitado; o exibido durante o arrasto pode estar no excesso.
   Ao soltar, anima de volta ao limite em `returnMs` (sem oscilar).
5. **Delta:** com `showDelta`, pílula absoluta seguindo o X do ponteiro acima do chip, texto
   `+6`/`−3` (sinal de menos verdadeiro), `aria-hidden`.
6. **Clique sem mover** (< 3 px): foca o input e seleciona o texto; Enter ou blur comprometem
   (parse com vírgula ou ponto, limita, arredonda ao step; inválido volta ao anterior); Escape
   cancela. Função pura `parseNumberInput(text, fallback, opts)`.
7. `showDirty`: anel quando `value !== defaultValue`.
8. **Disabled:** `opacity-50`.

## Movimento reduzido

Sem animação de volta da borracha (volta seca). O resto igual.

## Marcação

Raiz: `data-slot="scrub-number-field"`, `data-dirty`, `data-scrubbing`. Partes:
`scrub-number-field-fill`, `scrub-number-field-delta`, `scrub-number-field-input`.

## Testes mínimos

- Puras: `scrubValue` (sensibilidade, coarse, fine com casa extra, step 0.5), `rubberBand`
  (dentro = igual; fora nunca passa do alcance; reach 0 = limite), `parseNumberInput`
  ("12,5", "abc" → fallback, acima do max → max).
- Teclado: setas, Shift+seta, Home/End chamam `onValueChange`/`onValueCommit`.
- Arrasto simulado (pointer events com clientX) muda o valor; clique sem mover entra em edição;
  digitar + Enter compromete; Escape cancela.
- `showDirty` liga/desliga o anel; `showFill` largura proporcional (style).
- Disabled ignora. `ref`/`className`.
