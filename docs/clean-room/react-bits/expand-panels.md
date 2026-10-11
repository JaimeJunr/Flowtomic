# Spec de comportamento: `expand-panels`

> **Proveniência (clean room).** Escrita em 11/10/2026 a partir da demo pública "Accordion
> Gallery" em `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi
> lido**. A versão deles usava gsap; esta usa só `motion`.

## O que a pessoa vê

Uma **fileira de painéis altos** lado a lado. Um deles está **aberto** (largo), os outros são
faixas estreitas, apagadas e levemente giradas em 3D. Ao passar o mouse (ou focar, ou tocar) num
painel, ele **se abre suavemente** e o anterior se fecha; o conteúdo dentro do painel desliza um
pouco (paralaxe) enquanto ele muda de largura. No painel aberto aparece uma **legenda** embaixo,
com uma barrinha de destaque que cresce e o texto subindo logo depois.

## Por que existe (uso no produto)

Vitrine de 3 a 7 temas (classes de ativo, planos, cases) numa landing ou num painel.

## API (`molecules/data-display/expand-panels`)

```ts
type ExpandPanelItem = { id: string; label: string; content: React.ReactNode; href?: string };

type ExpandPanelsProps = Omit<React.ComponentProps<"div">, "onChange"> & {
  items: ExpandPanelItem[];             // 2..10, senão lança erro com o valor
  defaultIndex?: number;                // default 0; fora da faixa lança erro
  value?: number;                       // controlado
  onChange?: (index: number) => void;
  trigger?: "hover" | "click";          // default "hover" (foco e toque sempre abrem)
  orientation?: "horizontal" | "vertical"; // default "horizontal"
  size?: number;                        // altura da fileira (ou largura da coluna), px, default 460
  gap?: number;                         // px, default 10
  expandRatio?: number;                 // 0.2..0.9 da fileira para o aberto, default 0.52
  tilt?: number;                        // graus nos fechados, default 8
  parallax?: number;                    // 0..1, default 0.5
  showLabels?: boolean;                 // default true
  grayscale?: boolean;                  // default true
};
```

## Regras

1. **Larguras (pura `panelBasis(count, active, expandRatio)` → number[] em frações que somam 1).**
   O ativo recebe `expandRatio`; os outros dividem o resto igualmente. Aplicar como `flex-grow`
   animado (motion `animate={{ flexGrow }}`), com `flex-basis: 0`, duração 0,6 s e ease
   `[0.22, 1, 0.36, 1]`.
2. **Painel.** `relative overflow-hidden rounded-2xl border border-border bg-card`. Fechado:
   `rotateY(±tilt)` (sinal pelo lado em relação ao ativo: à esquerda `+tilt`, à direita `-tilt`)
   com `perspective` no pai, véu `bg-background` a 45% de opacidade e `grayscale` se ligado.
   Aberto: `rotateY(0)`, véu 0, cor plena.
3. **Paralaxe.** O conteúdo interno é mais largo que o painel (`width` = largura do aberto) e
   centralizado; ao fechar/abrir, ele se desloca `x = (1 - aberto) · parallax · 40px` para o lado
   oposto do ativo, animado junto.
4. **Legenda** (só no aberto, se `showLabels`): faixa no rodapé com degradê de `transparent` a
   `var(--background)`; barrinha `bg-primary h-0.5` que cresce de `w-0` a `w-8` e o rótulo que
   sobe 8 px com opacidade, com 0,06 s de atraso entre os dois.
5. **Interação.** `hover`: `pointerenter` (mouse/pen) ativa. `click`: clique ativa. Foco por
   teclado ativa sempre; `ArrowLeft/Right` (ou `Up/Down` na vertical) movem o foco entre
   painéis. Com `href`, o painel é `<a>`; senão `<button type="button">`.
6. **Fechados legíveis** (acrescentado em 11/10/2026, depois da medição): nos fechados o conteúdo
   vai a opacidade 0,15 (sem isso, o corte mostrava fragmentos de texto) e aparece o `label` na
   vertical, de baixo para cima, embaixo à esquerda, `aria-hidden`; some no aberto.
7. **Vertical.** Mesmo comportamento trocando largura por altura e `rotateY` por `rotateX`.

## Movimento reduzido

Troca instantânea de tamanho, sem tilt nem paralaxe; a legenda aparece sem animação.

## Acessibilidade

Raiz `role="group"` com `aria-label`. Cada painel `aria-expanded={ativo}` e rótulo acessível
`label`. Conteúdo dos fechados continua na árvore (é só visual).

## Marcação

- Raiz `data-slot="expand-panels"`, `ref`, `cn`; painéis `data-slot="expand-panels-item"`
  com `data-active`; legenda `expand-panels-caption`.

## Testes mínimos

- `panelBasis`: soma 1; ativo com `expandRatio`; `count 2` divide o resto num só.
- Erros: menos de 2 ou mais de 10 itens, `expandRatio` fora de 0.2..0.9, `defaultIndex` fora.
- Hover com mouse ativa (`data-active`); com `trigger "click"` hover não ativa e clique ativa;
  foco ativa; setas movem o foco; `onChange` recebe o índice; modo controlado respeita `value`.
- Movimento reduzido sem tilt (transform sem `rotateY` diferente de 0).
