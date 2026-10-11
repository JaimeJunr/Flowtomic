# Spec de comportamento: `elastic-slider`

> **Proveniência (clean room).** Escrita em 10/10/2026 a partir da demo pública "Elastic Slider" em
> `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.

## O que a pessoa vê

Um slider horizontal com um ícone em cada ponta (menos e mais) e o valor em número logo abaixo.
Ao arrastar **além das pontas**, a trilha **estica como elástico** na direção do puxão (e afina
um pouco), e o ícone daquela ponta cresce; ao soltar, volta com **mola**. Passar o mouse engrossa
a trilha.

## Por que existe (uso no produto)

Ajuste de volume, de aporte mensal, de tolerância a risco — onde o limite físico deve ser
sentido.

## API (`atoms/forms/elastic-slider`)

```ts
type ElasticSliderProps = Omit<React.ComponentProps<"div">, "onChange" | "defaultValue"> & {
  value?: number;                 // controlado
  defaultValue?: number;          // default 50
  onValueChange?: (value: number) => void;
  min?: number;                   // default 0
  max?: number;                   // default 100
  /** 0 = contínuo. */
  step?: number;                  // default 0
  startIcon?: React.ReactNode;    // default <Minus /> do lucide
  endIcon?: React.ReactNode;      // default <Plus /> do lucide
  /** Formata o número exibido. */
  formatValue?: (value: number) => string; // default Math.round
  "aria-label": string;
};
```

## Regras

1. **Valor (puras).** `valueFromPointer(x, rect, min, max, step)` → valor limitado e arredondado
   ao `step` (quando > 0). `overflowFromPointer(x, rect)` → px além da ponta (negativo à
   esquerda, positivo à direita, 0 dentro).
2. **Elástico.** O excesso passa por `decay(overflow, maxOverflow = 50)` (pura, curva
   sigmoide: `maxOverflow · (2/(1+e^(-v/maxOverflow)) - 1)`), assintótico em `±50 px`. A trilha
   ganha `scaleX = 1 + |excesso|/largura` com `transform-origin` na ponta oposta ao puxão, e
   `scaleY` cai até 0,8 conforme o excesso. Ícone da ponta puxada: `scale` até 1,4 e
   `translateX` acompanhando o excesso. Tudo em `MotionValue`s.
3. **Soltar.** O excesso volta a 0 com `animate(mv, 0, { type: "spring", bounce: 0.5 })`.
4. **Hover.** Mouse em cima: trilha de `h-1.5` para `h-3` (escala Y animada) e os ícones
   `text-foreground` (repouso `text-muted-foreground`).
5. **Estrutura.** Raiz `flex w-64 flex-col items-center gap-3 select-none touch-none`. Linha
   `flex w-full items-center gap-3` com ícone, trilha (`relative h-1.5 flex-1 rounded-full
   bg-muted`, preenchimento `absolute inset-y-0 left-0 rounded-full bg-primary` com largura em
   %), ícone. Valor `font-mono text-sm text-muted-foreground tabular-nums`. Pointer capture na
   trilha; clicar na trilha também define o valor.

## Movimento reduzido

Sem elástico nem mola: o valor muda, a trilha não estica.

## Acessibilidade

A trilha é `role="slider"` focável com `aria-label`, `aria-valuemin/max/now` e
`aria-valuetext` (= `formatValue`). Teclado: ←/↓ e →/↑ andam `step` (ou 1% do intervalo
quando `step = 0`), PageUp/PageDown 10×, Home/End. Ícones `aria-hidden`.

## Marcação

- Raiz: `data-slot="elastic-slider"`, `data-dragging`, `ref`, `cn`.
- Partes: `elastic-slider-track`, `elastic-slider-range`, `elastic-slider-start`,
  `elastic-slider-end`, `elastic-slider-value`.

## Testes mínimos

- `valueFromPointer` nas pontas, no meio, com `step` e fora da trilha (limitado).
- `overflowFromPointer` 0 dentro e com sinal fora; `decay` é ímpar, cresce e nunca passa de 50.
- `min >= max` lança erro com os valores.
- Teclado: → aumenta e chama `onValueChange`; End vai ao máximo; Home ao mínimo.
- Arraste com rect falso define o valor; controlado manda.
- `aria-valuetext` usa `formatValue`.
- Movimento reduzido; `ref` e `className`.
