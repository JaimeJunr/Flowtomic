# Spec de comportamento: `peel-sticker`

> **Proveniência (clean room).** Escrita em 11/10/2026 a partir da demo pública "Sticker Peel"
> em `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**. A
> versão deles usava gsap; esta usa só `motion` e CSS.

## O que a pessoa vê

Um **adesivo** (ícone ou imagem com borda branca grossa e sombra curta) solto sobre a área. Ao
passar o mouse, **uma ponta descola**: a borda do lado escolhido dobra para cima e para trás,
mostrando o **verso** claro do papel, com uma sombra que cresce embaixo da dobra. Ao pressionar,
descola mais. O adesivo pode ser **arrastado** pela área e gira um pouco enquanto é arrastado;
ao soltar, assenta de novo.

## Por que existe (uso no produto)

Detalhe lúdico em página de onboarding, conquista ("primeiro investimento feito") ou estado vazio.

## API (`atoms/animation/peel-sticker`)

```ts
type PeelStickerProps = Omit<React.ComponentProps<"div">, "children"> & {
  children: React.ReactNode;       // o conteúdo do adesivo (ícone, img, svg)
  label: string;                   // nome acessível
  width?: number;                  // px, default 160
  peelDirection?: number;          // graus 0–360; 0 = descola de baixo para cima. default 0
  peelHover?: number;              // fração 0–1 no hover. default 0.3
  peelActive?: number;             // fração 0–1 pressionado. default 0.45
  dragRotate?: number;             // graus enquanto arrasta. default 8
  draggable?: boolean;             // default true
  shadowIntensity?: number;        // 0–1, default 0.5
  initialPosition?: "center" | "top-left" | "top-right" | "bottom-left" | "bottom-right"; // default "center"
};
```

Borda do adesivo `bg-background` (8 px em volta do conteúdo, `rounded-2xl`), verso
`bg-muted`, sombra com `var(--foreground)` em `color-mix` (sem rgba no fonte).

## Regras

1. **Camadas.** Uma caixa girada por `peelDirection` contém: (a) a frente com
   `clip-path: inset(0 0 P% 0)` — o pedaço que "subiu" é cortado da base; (b) o verso, um clone
   do formato (sem o conteúdo, `bg-muted`) espelhado em Y (`scaleY(-1)`), posicionado logo acima
   da linha de dobra e cortado para mostrar só a altura descolada. O conteúdo de dentro gira
   `-peelDirection` para continuar reto.
2. **Puro `peelGeometry(height, fraction)`** → `{ clipBottomPct, flapHeight, foldY }`:
   `flapHeight = height · fraction`, `foldY = height − flapHeight`,
   `clipBottomPct = fraction · 100`. Fração limitada a [0, 0.9]; erro se `height <= 0`.
3. **Estados.** Repouso 0; hover (mouse/caneta) `peelHover`; pressionado `peelActive`. A fração
   é um `MotionValue` animado com `animate(fração, alvo, { type: "spring", stiffness: 260, damping: 24 })`.
4. **Sombra da dobra.** Gradiente linear na linha de dobra, opacidade `shadowIntensity · fração · 2`
   (limitada a 1). Sombra do adesivo inteiro cresce levemente com a fração.
5. **Arrasto.** `drag` do motion dentro da raiz (`dragConstraints` = raiz, `dragElastic: 0.1`,
   sem momento). Durante o arrasto, `rotate` vai a `dragRotate`; ao soltar, volta a 0 com mola.
   `select-none` e `touch-none` no adesivo.
6. **Teclado.** O adesivo é focável (`tabIndex 0`); setas movem 16 px (Shift: 64 px), limitado à
   raiz; foco também descola com `peelHover`.
7. **Raiz** `relative overflow-hidden` com altura mínima 240 px; `initialPosition` posiciona com
   margem de 16 px.

## Movimento reduzido

Sem descolar (fração fica 0) e sem giro no arrasto; o arrasto continua funcionando.

## Acessibilidade

Adesivo `role="img"` com `aria-label={label}` e `aria-roledescription="adesivo arrastável"`
quando arrastável; verso e sombra `aria-hidden`.

## Marcação

Raiz `data-slot="peel-sticker"`; partes `peel-sticker-face`, `peel-sticker-back`,
`peel-sticker-shadow`; `data-state="rest|hover|pressed"` no adesivo.

## Testes mínimos

- `peelGeometry`: valores, limite de 0.9 e erro com altura inválida.
- `data-state` muda em hover (mouse), pressionar e soltar; toque não aplica hover.
- Setas movem e respeitam o limite; foco descola.
- Movimento reduzido mantém a fração em 0.
- `draggable={false}` não arrasta nem anuncia `aria-roledescription`.
