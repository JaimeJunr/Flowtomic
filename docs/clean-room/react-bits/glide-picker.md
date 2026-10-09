# Spec de comportamento: `glide-picker`

> **Proveniência (clean room).** Escrita em 09/10/2026 a partir da demo pública "Glide Select" em
> `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.

## O que a pessoa vê

Um chip compacto com o valor ("PNG") e uma setinha. Ao clicar, um menu **cresce a partir do canto
do chip** (escala + opacidade, origem no canto que ele compartilha com o chip). Dentro, as opções
("PNG · imagem", "SVG · vetor"...) com uma etiqueta discreta à direita. Uma **pílula de destaque
desliza** de linha em linha seguindo o ponteiro (em vez de cada linha acender sozinha). A linha
escolhida tem um ✓ e fica sobre a pílula a 60% quando o ponteiro está fora. O menu sai em 2/3 do
tempo de entrada. Se não couber embaixo, abre em cima.

## API (`molecules/forms/glide-picker`)

```ts
type GlidePickerOption = string | { value: string; label: React.ReactNode; tag?: string };
type GlidePickerProps = {
  options: GlidePickerOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string, option: { value: string; label: React.ReactNode; tag?: string }) => void;
  placeholder?: string;              // default "Selecionar…"
  showTags?: boolean;                // default true
  size?: "sm" | "default" | "lg";    // chip 28 / 32 / 44 px
  menuWidth?: number;                // default 176 (nunca menor que o chip)
  side?: "top" | "bottom";           // default "bottom" (vira se faltar espaço)
  align?: "start" | "end";           // default "start"
  popMs?: number;                    // default 180
  /** ms da pílula entre linhas. 0 = hover comum. */
  glideMs?: number;                  // default 220
  /** A pílula fica na última linha ao sair; reentrar desliza dali. */
  rememberPosition?: boolean;        // default true
  disabled?: boolean;
  "aria-label"?: string;             // default "Selecionar"
  className?: string;
  ref?: React.Ref<HTMLButtonElement>;
};
```

## Regras

1. **Base:** `@radix-ui/react-dropdown-menu` com `DropdownMenu.RadioGroup` +
   `DropdownMenu.RadioItem` (teclado, foco, fechar com Esc/clique fora, `side`/`align`,
   colisão/flip do Radix). Chip = `DropdownMenu.Trigger` (um `button`). Mostrar o rótulo da opção
   escolhida ou o placeholder.
2. **Cores (só tokens):** chip `bg-secondary text-secondary-foreground`, menu
   `bg-popover text-popover-foreground border shadow-md`, pílula `bg-accent`, etiqueta
   `text-muted-foreground`, ✓ `text-primary` (lucide `Check`), seta lucide `ChevronDown`
   (gira 180° aberto).
3. **Crescer do canto:** conteúdo animado com motion (`forceMount` + `AnimatePresence`, ou
   classes `data-[state=open]` com keyframes), `transformOrigin` do Radix
   (`var(--radix-dropdown-menu-content-transform-origin)`), entrada `popMs`, saída `popMs*2/3`.
   Função pura `exitDuration(popMs)`.
4. **Pílula:** um único elemento absoluto atrás das linhas; posição Y/altura animadas até a linha
   destacada (`data-highlighted` do Radix, que segue ponteiro **e** teclado). `glideMs=0` → pula.
   Ao sair do menu: com `rememberPosition`, fica onde estava; sem, volta para a escolhida.
   Ao abrir, começa na escolhida. Função pura `pillTarget(highlightedIndex, selectedIndex, remember, lastIndex)`.
5. **Escolhida em repouso:** sem destaque ativo, a linha escolhida fica sobre a pílula com
   opacidade 60%.
6. **Disabled:** chip `opacity-50`, não abre.

## Movimento reduzido

Menu aparece/some com fade curto, sem escala; pílula pula.

## Marcação

Raiz (o chip): `data-slot="glide-picker"`, `data-state`. Partes: `glide-picker-content`,
`glide-picker-pill`, `glide-picker-option`.

## Testes mínimos

- Puras: `exitDuration`, `pillTarget` (com e sem remember; sem destaque → escolhida).
- Abre no clique (use `userEvent.setup()`; Radix DropdownMenu abre com pointerdown — conferir
  como o projeto testa `dropdown-menu`), lista as opções como `menuitemradio`, escolhe e chama
  `onValueChange(value, option)`, fecha e mostra o rótulo no chip.
- Placeholder sem valor. `showTags=false` esconde etiquetas.
- Teclado: Enter/ArrowDown abre, ArrowDown move o destaque, Enter escolhe.
- Disabled não abre. Movimento reduzido abre. `ref` no chip; `className`.
