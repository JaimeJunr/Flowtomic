# Spec de comportamento: `target-cursor`

> **Proveniência (clean room).** Escrita em 11/10/2026 a partir da demo pública "Target Cursor"
> em `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**. A
> versão deles usava gsap; esta usa só `motion`.

## O que a pessoa vê

O cursor vira uma **mira**: quatro cantoneiras (cantos em "L") formando um quadrado de 36 px
com um ponto no centro. Enquanto o mouse anda livre, a mira **gira devagar** (uma volta a cada
2 s). Ao passar sobre um elemento-alvo, a rotação para e as quatro cantoneiras **se abrem e
encaixam nos cantos do alvo**, com uma folga, acompanhando o raio da borda dele. Com o alvo
travado, as cantoneiras se inclinam um pouco na direção do mouse (paralaxe) e um rótulo curto
aparece acima. Ao segurar o botão, a mira se aperta. Ao sair do alvo, ela volta ao quadrado e
retoma o giro.

## Por que existe (uso no produto)

Landing ou página de portfólio que quer destacar CTAs e cards; nunca em telas de trabalho denso.

## API (`atoms/animation/target-cursor`)

```ts
type TargetCursorProps = React.ComponentProps<"div"> & {
  targetSelector?: string;      // default "[data-cursor-target]"
  spinDuration?: number;        // s por volta livre; 0 = sem giro. default 2
  snapDuration?: number;        // s para encaixar no alvo. default 0.2
  size?: number;                // px da mira livre. default 36
  cornerSize?: number;          // px de cada braço. default 12
  thickness?: number;           // px do traço. default 3
  padding?: number;             // px de folga em volta do alvo. default 6
  dotSize?: number;             // px; 0 esconde. default 4
  parallax?: boolean;           // default true
  matchRadius?: boolean;        // default true
  showLabel?: boolean;          // lê data-cursor-label do alvo. default true
  pressEffect?: boolean;        // default true
  hideNativeCursor?: boolean;   // default true
  container?: React.RefObject<HTMLElement | null>; // default: página inteira
};
```

Cor: `text-primary` (as peças usam `currentColor`); rótulo `bg-foreground text-background text-xs
font-mono`. Sem prop de cor livre: quem quiser outra cor passa `className`. Medido em 11/10/2026:
a primeira versão usava `var(--foreground)` com `mix-blend-mode: difference`, e a mira sumia no
tema claro (foreground escuro em modo diferença sobre fundo claro vira quase branco).

## Regras

1. **Raiz** `fixed inset-0 pointer-events-none z-50` (com `container`, `absolute` dentro dele),
   renderizada só depois do primeiro `pointermove` de mouse/caneta (toque nunca ativa: em
   dispositivo de toque o componente não aparece).
2. **Posição** segue o ponteiro com `MotionValue` direto (sem mola) quando livre.
3. **Encaixe.** Em `pointerover`, procurar `closest(targetSelector)`. Puro
   `cornerTargets(rect, padding)` → posição de cada canto (tl, tr, br, bl) em px relativos ao
   centro do alvo: `±(w/2 + padding)`, `±(h/2 + padding)`. Cada cantoneira anima até ali com
   `animate(..., { duration: snapDuration, ease: "easeOut" })`; o centro da mira vai ao centro
   do alvo. Livre, os cantos ficam em `±size/2`.
4. **Giro.** Livre: rotação contínua `360 / spinDuration` graus/s (via `useFrameLoop`). Ao travar,
   a rotação anima até o múltiplo de 90° mais próximo (puro `nearestQuarter(deg)`), para as
   cantoneiras caírem nos cantos certos; ao soltar, o giro recomeça dali.
5. **Paralaxe.** Travado, deslocamento do conjunto = `(ponteiro − centro do alvo) · 0.08`, limitado
   a 8 px em cada eixo (puro `parallaxOffset(dx, dy)`).
6. **Raio.** Com `matchRadius`, a curva da cantoneira usa o `border-radius` computado do alvo
   (`getComputedStyle`), limitado a `cornerSize`.
7. **Rótulo.** `data-cursor-label` do alvo, acima do canto superior esquerdo, com fade.
8. **Pressionar.** `pointerdown` escala a mira para 0,85 e o ponto para 1,5; `pointerup` volta.
9. **Rolagem/redimensionar** com alvo travado: recalcular o retângulo (o alvo pode ter se movido).
   Se o alvo sair do DOM, soltar.
10. **Cursor nativo.** Com `hideNativeCursor`, aplicar `cursor: none` no `container` (ou no
    `document.body`) enquanto montado e ativo; restaurar no unmount.

## Movimento reduzido

Sem giro e sem paralaxe; o encaixe acontece sem animação (pula para a posição).

## Acessibilidade

Tudo `aria-hidden`; não muda foco nem ordem de leitura. O cursor nativo só some depois que a
mira está ativa (evita página sem cursor se o JS falhar).

## Marcação

Raiz `data-slot="target-cursor"`; partes `target-cursor-corner` (com `data-corner`),
`target-cursor-dot`, `target-cursor-label`; `data-locked` na raiz quando travada.

## Testes mínimos

- `cornerTargets`, `nearestQuarter` (incluindo negativos e 359°), `parallaxOffset` (limite de 8).
- Não renderiza antes do primeiro movimento; não ativa com toque.
- `pointerover` num `[data-cursor-target]` liga `data-locked` e mostra o rótulo; sair desliga.
- `cursor: none` aplicado e restaurado no unmount.
- Movimento reduzido: sem `useFrameLoop` ativo (giro parado).
