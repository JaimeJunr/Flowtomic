# Spec de comportamento: `strike-checkbox`

> **Proveniência (clean room).** Escrita em 09/10/2026 a partir da demo pública "Spring Check" em
> `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.

## O que a pessoa vê

Uma linha de checklist ("Publicar a build"). Ao marcar, um preenchimento **cresce do centro** da
caixa numa mola (passa um pouco do tamanho e volta), o ✓ é desenhado por cima, e um **risco
atravessa o texto** com exatamente a largura do texto, saindo da esquerda (configurável). O texto
fica mais apagado. Desmarcar faz o caminho inverso.

## API (`atoms/forms/strike-checkbox`)

```ts
type StrikeCheckboxProps = Omit<React.ComponentProps<typeof CheckboxPrimitive.Root>, "children"> & {
  label: React.ReactNode;
  size?: "sm" | "default" | "lg";        // caixa 16 / 20 / 24 px, texto text-sm / text-base / text-lg
  /** Quanto o preenchimento passa do tamanho cheio. 0 chega seco. */
  bounce?: number;                       // default 0.2
  /** 0..0.5: em que ponto da mola o risco começa (0 junto do preenchimento). */
  strikeLag?: number;                    // default 0.12
  /** Opacidade do texto quando marcado. */
  doneOpacity?: number;                  // default 0.5
  strike?: "left" | "center" | "right" | "none"; // default "left"
};
```
`checked`, `defaultChecked`, `onCheckedChange`, `disabled`, `id`, `name` vêm do Radix Checkbox.
Estado `indeterminate` não é suportado aqui (tratar como desmarcado e documentar).

## Regras

1. **Base:** `@radix-ui/react-checkbox` para a caixa; a linha inteira é um `<label>` ligado ao
   checkbox, então clicar no texto também marca.
2. **Cores (só tokens):** borda da caixa `border-input`, preenchimento `bg-primary`, ✓
   `text-primary-foreground` (SVG `stroke="currentColor"`), texto `text-foreground`, risco
   `bg-foreground` (ou `currentColor`). Foco `focus-visible:ring-ring`.
3. **Preenchimento:** `scale` 0→1 numa mola cujo amortecimento é derivado de `bounce` (função pura
   `springFromBounce(bounce)`; 0 → criticamente amortecida).
4. **✓:** `path` com `pathLength` 0→1, começando depois que o preenchimento passa de ~50%.
5. **Risco:** uma barra de altura ~1/12 do tamanho da fonte (mín. 1px), posicionada no meio da
   altura do texto, `width` igual ao texto (é um elemento dentro do mesmo inline-block do texto,
   `scaleX` 0→1). Origem: `left` → `origin-left`, `right` → `origin-right`, `center` →
   `origin-center`; `none` não renderiza. Começa com atraso proporcional a `strikeLag`. Função
   pura `strikeOrigin(strike)`.
6. **Texto:** opacidade vai para `doneOpacity` quando marcado.
7. **Disabled:** `opacity-50`, sem interação.

## Movimento reduzido

Sem mola nem desenho: preenchimento, ✓ e risco aparecem de uma vez (ou fade curto). O estado
visual final é o mesmo.

## Acessibilidade

- Nome acessível = texto do `label`. Se `label` não for texto, quem usa passa `aria-label`.
- O risco e o SVG são `aria-hidden`.

## Marcação

Raiz (o `<label>`): `data-slot="strike-checkbox"`, `data-state`. `ref` vai no
`CheckboxPrimitive.Root` (o controle) — documentar isso no JSDoc. `className` na raiz.
Partes: `strike-checkbox-box`, `strike-checkbox-fill`, `strike-checkbox-strike`.

## Testes mínimos

- Puras: `springFromBounce` (0 e 0.5), `strikeOrigin` para as 4 opções.
- Clicar no texto marca; `onCheckedChange` chamado; controlado respeita `checked`.
- Espaço no checkbox alterna.
- `strike="none"` não renderiza o risco; marcado com `left` renderiza com `origin-left`.
- Opacidade `doneOpacity` aplicada quando marcado.
- Disabled não alterna.
- Movimento reduzido marca e mostra o ✓.
- `getByRole("checkbox", { name: "Publicar a build" })`; `ref`/`className`.
