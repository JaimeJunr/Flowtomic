# Spec de comportamento: `lift-rating`

> **Proveniência (clean room).** Escrita em 09/10/2026 a partir da demo pública "Peek Rating" em
> `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.

## O que a pessoa vê

Uma nota de 1 a 5 estrelas. Ao passar o ponteiro, as estrelas até a do ponteiro **acendem e
sobem** alguns pixels (pré-visualização) e a do ponteiro fica um pouco maior; um balãozinho acima
dela mostra o rótulo da nota ("Bom") ou o número, e pula de estrela em estrela. Tirar o ponteiro
volta para a nota salva. Clicar confirma: a estrela clicada dá um "pop" (escala até 1.3 e volta).
Clicar de novo na nota atual limpa para 0.

## API (`atoms/forms/lift-rating`)

```ts
type LiftRatingProps = Omit<React.ComponentProps<"div">, "onChange" | "defaultValue"> & {
  value?: number;                    // 0..count
  defaultValue?: number;             // default 0
  onValueChange?: (value: number) => void;
  /** Chamado a cada estrela cruzada na pré-visualização; null quando limpa. */
  onPreview?: (value: number | null) => void;
  count?: number;                    // default 5
  shape?: "star" | "heart" | "bolt"; // lucide Star / Heart / Zap. default "star"
  icon?: React.ReactNode;            // substitui o shape
  /** Um rótulo por estrela, mostrado no balão. */
  labels?: string[];                 // default []
  size?: "sm" | "default" | "lg";    // 16 / 24 / 32 px
  /** px que as estrelas pré-visualizadas sobem. 0 = só cor. */
  lift?: number;                     // default 6
  magnify?: number;                  // default 1.15
  riseMs?: number;                   // default 320
  popScale?: number;                 // default 1.3 (1 desliga)
  showTip?: boolean;                 // default true
  allowClear?: boolean;              // default true
  readOnly?: boolean;                // default false
  disabled?: boolean;                // default false
  "aria-label"?: string;             // default "Avaliação"
};
```

## Regras

1. **Base:** `@radix-ui/react-radio-group` com um item por estrela (valor "1".."count");
   setas mudam, Home/End vão ao extremo. Backspace/Delete limpam para 0 se `allowClear`.
   Como o Radix não desmarca, o 0 é tratado no nosso estado (`value` 0 = nenhum item escolhido).
2. **Cores (só tokens):** acesa `text-primary fill-current`, apagada `text-muted-foreground`
   (sem preenchimento), balão `bg-popover text-popover-foreground border shadow-sm`.
3. **Pré-visualização:** `pointerenter`/`pointermove` sobre a estrela i → `preview = i`;
   estrelas `<= preview` acesas e com `y: -lift`; a estrela `preview` com `scale: magnify`.
   Cada estrela anima com atraso pequeno proporcional à distância (ondinha). `pointerleave` do
   grupo → `preview = null` e volta para `value`. `onPreview` só chama quando o valor muda.
   Função pura `litCount(value, preview)` = `preview ?? value`.
4. **Balão:** visível só com `preview != null` e `showTip`; texto = `labels[preview-1]` ou
   `String(preview)`; posição X anima até a estrela (spring). `aria-hidden` (o anúncio vem do
   radio).
5. **Confirmar:** clique em i: se `allowClear && i === value` → 0; senão i. Pop na estrela.
   Função pura `nextRating(current, clicked, allowClear)`.
6. **readOnly:** sem prévia, sem pop, sem interação; o grupo vira `role="img"` com
   `aria-label="Avaliação: 3 de 5"`.
7. **Disabled:** `opacity-50`, ignora.

## Movimento reduzido

Sem subir, sem magnify, sem pop, balão sem deslize (aparece no lugar). A cor da prévia continua.

## Acessibilidade

Cada item: `aria-label` = rótulo se houver, senão "1 estrela"/"N estrelas".

## Marcação

Raiz: `data-slot="lift-rating"`, `data-value`. Partes: `lift-rating-item`, `lift-rating-tip`.

## Testes mínimos

- Puras: `litCount`, `nextRating` (limpa só com allowClear; clicar outra troca).
- Clique na 4ª → `onValueChange(4)`; clicar na 4ª de novo → 0; com `allowClear=false` fica 4.
- Hover na 3ª acende 3 (`data-lit`) e mostra balão com `labels[2]`; `onPreview(3)`; sair → `onPreview(null)`.
- Setas mudam o valor; Backspace limpa.
- `readOnly` → `role="img"` com nome "Avaliação: 3 de 5", clique não muda.
- `showTip=false` sem balão. Disabled ignora. Movimento reduzido funciona. `ref`/`className`.
