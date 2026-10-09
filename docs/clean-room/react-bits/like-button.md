# Spec de comportamento: `like-button`

> **Proveniência (clean room).** Escrita em 09/10/2026 a partir da demo pública "Pulse Heart" em
> `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.

## O que a pessoa vê

Uma pílula com um coração e um contador ("♥ 1.204"). Ao curtir, o coração **encolhe até virar um
pontinho**, troca de contorno cinza para preenchido na cor de destaque exatamente nesse ponto
(40% do tempo), e volta **passando do tamanho** (rebote) até assentar. A pílula dá uma leve
"batida" (encolhe ~3%) no momento da troca. Só o dígito que mudou no contador rola (o resto fica
parado). Descurtir faz a corrida inversa.

## API (`atoms/actions/like-button`)

```ts
type LikeButtonProps = Omit<React.ComponentProps<typeof TogglePrimitive.Root>, "children" | "onChange"> & {
  liked?: boolean;
  defaultLiked?: boolean;            // default false
  /** Contagem exibida; o clique soma ou tira 1. */
  count?: number;                    // default 0
  onLikedChange?: (liked: boolean, count: number) => void;
  showCount?: boolean;               // default true; false vira círculo
  icon?: "heart" | "star" | "thumb" | React.ReactNode; // default "heart" (lucide Heart/Star/ThumbsUp)
  /** Contorno no estado neutro; false = sólido apagado. */
  idleOutline?: boolean;             // default true
  size?: "sm" | "default" | "lg";    // ícone 16 / 20 / 24 px
  durationMs?: number;               // default 560 (a troca é sempre em 40%)
  /** Fração do tamanho no ponto da troca. */
  dotSize?: number;                  // default 0.3
  /** Quanto passa do tamanho na volta. 0 = sem rebote. */
  overshoot?: number;                // default 1.7
  /** % da batida da pílula. */
  beat?: number;                     // default 3
  rollDurationMs?: number;           // default 350
  /** Nome acessível; a contagem é acrescentada. */
  label?: string;                    // default "Curtir"
};
```
`disabled`, `ref`, `className` do Radix Toggle. O estado é controlado pelo `liked`/`pressed`
internamente mapeado.

## Regras

1. **Base:** `@radix-ui/react-toggle` (`aria-pressed`).
2. **Cores (só tokens):** pílula `bg-secondary`, contador `text-secondary-foreground`, ícone
   neutro `text-muted-foreground`, curtido `text-primary` com `fill-current` (o Urucum é a cor de
   destaque; não usar vermelho cru). Foco `ring-ring`.
3. **Corrida do ícone:** keyframes de `scale` via função pura
   `likeScaleKeyframes(dotSize, overshoot)` → `{ values: [1, dotSize, peak, 1], times: [0, 0.4, 0.7, 1] }`,
   com `peak = 1 + 0.1 * overshoot` (overshoot 0 → peak 1). A troca de preenchimento acontece no
   quadro de 40% (troca de estado visual no `onUpdate` ou dois ícones sobrepostos com opacidade
   trocando em 0.4).
4. **Batida:** pílula `scale [1, 1 - beat/100, 1]` com o pico em 0.4.
5. **Contador:** formatado com `Intl.NumberFormat("pt-BR")`. Função pura
   `diffDigits(prev, next)` devolve os índices (da direita) que mudaram; só esses glifos rolam
   (entra de baixo se aumentou, de cima se diminuiu). Larguras com `tabular-nums`.
6. **Controlado:** mudança de `liked`/`count` por fora assenta sem corrida.
7. **Disabled:** `opacity-50`, ignora.

## Movimento reduzido

Sem corrida, sem batida, sem rolagem: troca direta de ícone e número.

## Acessibilidade

`aria-label = "${label}, ${count formatado}"`; `aria-pressed`. Ícones `aria-hidden`.

## Marcação

Raiz: `data-slot="like-button"`, `data-state`. Partes: `like-button-icon`, `like-button-count`.

## Testes mínimos

- Puras: `likeScaleKeyframes` (overshoot 0 → sem pico; troca em 0.4), `diffDigits`
  (1204→1205 só o último; 999→1000 todos; mesma contagem → nenhum).
- Clique: `aria-pressed` vira true, contador 1.204 → 1.205, `onLikedChange(true, 1205)`; de novo
  volta e chama `(false, 1204)`.
- `showCount=false` não renderiza contador; nome acessível ainda tem a contagem.
- `icon="star"` renderiza outro ícone; ReactNode customizado aparece.
- Controlado não muda sozinho. Disabled ignora. Movimento reduzido funciona. `ref`/`className`.
