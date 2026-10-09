# Spec de comportamento: `elastic-segment`

> **Proveniência (clean room).** Escrita em 09/10/2026 a partir da demo pública "Rubber Segment" em
> `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.

## O que a pessoa vê

Um controle segmentado ("Dia · Semana · Mês · Ano") com um bloco (thumb) que marca o escolhido.
Ao tocar outro segmento, o thumb **estica como borracha** cobrindo o segmento antigo e o novo ao
mesmo tempo, depois a borda de trás se contrai e chega no destino passando um pouquinho e voltando
(achatamento). O rótulo dentro do thumb aparece em outra cor, recortado exatamente pela forma do
thumb (o texto troca de cor onde o thumb passa). O thumb pode ser agarrado, arrastado e lançado:
solto, ele vai para o segmento mais próximo, ou desliza um pouco mais se foi lançado rápido.

## API (`atoms/forms/elastic-segment`)

```ts
type ElasticSegmentItem = string | { value: string; label: React.ReactNode; icon?: React.ReactNode };
type ElasticSegmentProps = Omit<React.ComponentProps<typeof RadioGroupPrimitive.Root>, "children" | "onValueChange"> & {
  items: ElasticSegmentItem[];
  onValueChange?: (value: string, index: number) => void;
  size?: "sm" | "default" | "lg";    // altura 28 / 36 / 44 px
  /** Todos os segmentos com a mesma largura; false = cada um abraça o rótulo. */
  equalSlots?: boolean;              // default true
  /** 0..100: quanto o thumb estica cobrindo antigo e novo. 0 = desliza simples. */
  stretch?: number;                  // default 100
  /** px que a borda de trás passa do destino antes de relaxar. 0 = sem. */
  squash?: number;                   // default 3
  /** Escala todas as fases; 0.25 = câmera lenta. */
  speed?: number;                    // default 1
  /** 0..100: quanto um lançamento carrega o thumb. 0 = sempre o mais próximo. */
  glide?: number;                    // default 75
  draggable?: boolean;               // default true
};
```
`value`, `defaultValue` (primeiro item), `disabled`, `aria-label` (default "Controle segmentado"),
`ref`, `className` do Radix RadioGroup.

## Regras

1. **Base:** `@radix-ui/react-radio-group` (setas, roving tabindex; cada seta chama
   `onValueChange`). Valor mudado por fora → thumb pula sem animação.
2. **Cores (só tokens):** trilho `bg-muted`, thumb `bg-background shadow-sm`, rótulos
   `text-muted-foreground`, rótulo dentro do thumb `text-foreground`. Raio do trilho `rounded-lg`,
   thumb com o raio menos o inset (3 px).
3. **Geometria:** medir os segmentos (`offsetLeft`/`offsetWidth`) num `useLayoutEffect` +
   `ResizeObserver`. Thumb representado por `left` e `right` (duas bordas, cada uma um
   `useSpring`). Ao trocar de A para B (B à direita): a borda da frente (direita) vai para o
   destino primeiro; a de trás (esquerda) só sai depois de um atraso proporcional a `stretch` e
   chega com overshoot de `squash` px. Funções puras: `segmentEdges(rects, index)`;
   `stretchPhases(from, to, stretch, squash)` devolve os alvos e atrasos de cada borda.
4. **Recorte do rótulo:** uma segunda camada de rótulos (cor ativa), `aria-hidden`, com
   `clip-path: inset(0 Rpx 0 Lpx round r)` seguindo as bordas do thumb.
5. **Arrastar:** pointerdown no thumb inicia; o thumb segue o ponteiro (largura do segmento atual).
   Ao soltar: `target = nearestIndex(x + velocity * glideFactor)` (função pura
   `resolveFling(rects, x, velocity, glide)`), anima até lá e chama `onValueChange` uma vez.
   Arrasto sem movimento = clique.
6. **Disabled:** `opacity-50`, ignora.

## Movimento reduzido

Sem esticar nem achatar nem lançar: o thumb vai direto (ou fade) ao destino. Arrastar continua
funcionando, sem inércia.

## Marcação

Raiz: `data-slot="elastic-segment"`. Partes: `elastic-segment-item`, `elastic-segment-thumb`,
`elastic-segment-active-labels`.

## Testes mínimos

- Puras: `segmentEdges`, `stretchPhases` (stretch 0 → bordas juntas; squash 0 sem overshoot;
  direção esquerda e direita), `resolveFling` (velocidade 0 → mais próximo; lançamento rápido
  vai um a mais; glide 0 ignora velocidade; limites 0..n-1).
- Clique escolhe e chama `onValueChange(value, index)`; setas também.
- Sem valor inicial, o primeiro fica escolhido.
- `getByRole("radiogroup", { name: "Controle segmentado" })`; camada ativa é `aria-hidden`.
- Disabled ignora. Movimento reduzido funciona. `ref`/`className`.
- Mock de layout: jsdom mede 0; testar geometria só pelas funções puras.
