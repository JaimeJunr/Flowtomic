# Spec de comportamento: `crosshair`

> **Proveniência (clean room).** Escrita em 09/10/2026 a partir da demo pública "Crosshair" em
> `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.

## O que a pessoa vê

Dentro de uma área (uma seção da página), duas **linhas finas** — uma horizontal e uma vertical —
cruzam no ponteiro e o seguem, um pouco atrasadas. Nas bordas, onde as linhas encostam, aparecem
as **coordenadas** do ponteiro em fonte mono, pequenas. Ao passar sobre um botão ou link, o alvo
ganha **cantoneiras** (quatro cantos em L) que o enquadram, com a medida `L × A` do alvo. Cada
clique solta um **anel** que se expande do ponteiro e some.

## Por que existe (uso no produto)

Hero de ferramenta técnica ("feito no pixel"), páginas de design system, editor visual.

## API (`atoms/animation/crosshair`)

```ts
type CrosshairProps = React.ComponentProps<"div"> & {
  /** Cor das linhas, rótulos e cantoneiras. Token. */
  color?: string;                               // default "var(--muted-foreground)"
  thickness?: number;                           // default 1
  /** 0..1 */
  opacity?: number;                             // default 0.85
  lineStyle?: "solid" | "dashed" | "dotted";    // default "solid"
  /** px vazios em volta do ponteiro. */
  gap?: number;                                 // default 0
  /** 0 = gruda no ponteiro. */
  smoothing?: number;                           // default 0.35
  showCoordinates?: boolean;                    // default true
  targetEffect?: "lock" | "none";               // default "lock"
  targetSelector?: string;                      // default "a, button, [data-crosshair-target]"
  clickPulse?: boolean;                         // default true
  hideCursor?: boolean;                         // default false
};
```

`children` é o conteúdo da área; o crosshair desenha por cima dele.

## Regras

1. **Estrutura.** Raiz `relative overflow-hidden` com os `children`. Por cima, uma camada
   `absolute inset-0 pointer-events-none aria-hidden` com DOM simples (sem canvas): duas linhas
   (`div` de 1 px com `border-top`/`border-left` no `lineStyle`), dois rótulos, as cantoneiras e
   os anéis. `hideCursor`: `cursor-none` na raiz e um ponto de 4 px no ponteiro.
2. **Posição.** `pointermove` na raiz (só mouse/pen) define o alvo; por rAF a posição persegue o
   alvo com `smoothing` (função pura `follow(current, target, smoothing, dt)`). Escrever
   `transform` por ref, sem re-render por quadro. Fora da área, a camada some (opacidade 0, 150 ms).
3. **Gap.** Cada linha vira dois segmentos que param a `gap` px do ponteiro.
4. **Coordenadas.** Rótulos `font-mono text-[10px]` com `x` (na borda de cima) e `y` (na borda
   esquerda), inteiros, relativos à área (função pura `formatCoord`).
5. **Lock.** Se o elemento sob o ponteiro (`event.target.closest(targetSelector)`) está dentro da
   área, as cantoneiras animam (motion, ~150 ms) para o retângulo dele + 4 px, com o rótulo
   `"<w> × <h>"`. Sair do alvo desfaz.
6. **Pulso.** `pointerdown` cria um anel `border` circular que cresce de 0 a 48 px e some em
   500 ms.
7. Só tokens. `color` padrão é token.

## Movimento reduzido

Linhas seguem o ponteiro sem atraso (smoothing 0), sem pulso, cantoneiras sem animação.

## Acessibilidade

Camada `aria-hidden`; não captura eventos. Não muda foco. `hideCursor` só esconde o cursor do
sistema dentro da área.

## Marcação

- Raiz: `data-slot="crosshair"`, `data-visible`, `ref`, `cn`.
- Partes: `crosshair-line-x`, `crosshair-line-y`, `crosshair-label`, `crosshair-lock`,
  `crosshair-pulse` (em `data-slot`).

## Testes mínimos

- `follow` (smoothing 0 = alvo; 0,5 aproxima), `formatCoord`.
- `pointermove` torna visível; `pointerleave` esconde.
- Rótulos mostram coordenadas inteiras.
- Hover sobre `button` filho cria `crosshair-lock` com o texto `"<w> × <h>"` (retângulo mockado
  com `getBoundingClientRect` num fake nomeado).
- `targetEffect="none"`: sem lock.
- Clique cria pulso; `clickPulse={false}` não cria.
- Movimento reduzido: sem pulso.
- `ref` e `className`.
