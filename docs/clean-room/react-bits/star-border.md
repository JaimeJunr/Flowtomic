# Spec de comportamento: `star-border`

> **Proveniência (clean room).** Escrita em 09/10/2026 a partir da demo pública "Star Border" em
> `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.

## O que a pessoa vê

Um botão (ou link) com borda fina. Um **ponto de luz** ("estrela") percorre a borda em volta, em
velocidade constante, deixando um **rastro** que se apaga atrás dele, e com um brilho suave que
vaza para fora da borda. A velocidade é a mesma em qualquer formato (retângulo, pílula). Ao passar
o ponteiro ou focar, a estrela dá uma volta rápida. Ao clicar, um pulso de luz corre pela borda
nos dois sentidos a partir do ponto clicado.

## Por que existe (uso no produto)

CTA principal de uma página (assinar, começar), uma vez por tela.

## API (`atoms/actions/star-border`)

```ts
type StarBorderProps<T extends React.ElementType = "button"> = {
  as?: T;                                        // default "button"
  /** Cor da estrela. Token. */
  color?: string;                                // default "var(--primary)"
  /** Segundos por volta. */
  duration?: number;                             // default 4
  direction?: "clockwise" | "counterclockwise";  // default "clockwise"
  /** 1..6, espaçadas igualmente. */
  stars?: number;                                // default 1
  /** Fração do perímetro ocupada pelo rastro, 0..1. */
  trailLength?: number;                          // default 0.3
  /** px */
  thickness?: number;                            // default 1
  /** px; maior que metade da altura vira pílula. */
  radius?: number;                               // default 12
  /** 0..1 */
  glow?: number;                                 // default 0.6
  hover?: "lap" | "brighten" | "reveal" | "none"; // default "lap"
  clickPulse?: boolean;                          // default true
} & Omit<React.ComponentPropsWithoutRef<T>, "as" | "color">;
```

## Regras

1. **Superfície.** `relative inline-flex items-center justify-center px-5 py-2.5 bg-card
   text-card-foreground` com `border-radius: radius`. Borda em repouso: `border` token
   (`var(--border)`), espessura `thickness`.
2. **Trilho.** Um `<svg>` `absolute inset-0 pointer-events-none overflow-visible` com um `<rect>`
   do tamanho medido (ResizeObserver), cantos `rx = min(radius, h/2)`, e `pathLength="1"` (por
   **atributo**, nunca CSS). A estrela e o rastro são o mesmo `rect` desenhado com
   `stroke-dasharray = "<trailLength> <1 - trailLength>"` e `stroke-dashoffset` animado de 0 a -1
   (ou 1 no anti-horário) a cada `duration` s. Gradiente não acompanha o caminho, então o rastro
   que desbota são **3 segmentos sobrepostos** de comprimento `trailLength`, `trailLength·0,6` e `trailLength·0,25` com opacidades 0,25, 0,5 e
   1, alinhados pela ponta (função pura `trailSegments(trailLength, offset)`).
3. **Brilho.** O mesmo grupo com `filter: drop-shadow(0 0 <glow*8>px <color>)`.
4. **Várias estrelas.** `stars` cópias com offset `i/stars`.
5. **Hover/foco.**
   - `lap`: uma volta extra em 0,6 s (acelera o offset) e volta ao ritmo.
   - `brighten`: `glow` × 1,6 e opacidade 1.
   - `reveal`: estrela invisível em repouso, aparece no hover/foco.
   - `none`: nada.
6. **Pulso de clique.** `pointerdown` calcula a fração do perímetro mais próxima do ponto
   (função pura `perimeterFraction(rect, radius, x, y)`) e solta dois segmentos curtos saindo
   dali em sentidos opostos, que somem em 600 ms.
7. **Cores.** Só tokens. `color` aceita qualquer string de cor, mas o padrão é token.

## Movimento reduzido

Sem órbita nem pulso: a estrela fica parada no canto superior esquerdo, com o brilho. A borda
continua visível.

## Acessibilidade

O elemento é o próprio `as` (botão por padrão, `type="button"` se não vier). SVG `aria-hidden`.
Foco com `focus-visible:ring-2 ring-ring`.

## Marcação

- Raiz: `data-slot="star-border"`, `data-hover="<modo>"`, `ref`, `cn`.
- SVG: `data-slot="star-border-track"`; cada estrela `data-slot="star-border-star"`.

## Testes mínimos

- `trailSegments` soma e alinha as pontas; `perimeterFraction` nos 4 lados e cantos.
- Renderiza `button` com `type="button"`; com `as="a"` e `href`, renderiza link.
- `stars={3}` → 3 estrelas; limite 6.
- `pathLength` é atributo do `rect`.
- `hover="reveal"`: estrela com opacidade 0 em repouso e 1 no `pointerenter`/foco.
- Clique chama `onClick` e, com `clickPulse`, cria pulso (`data-slot="star-border-pulse"`).
- Movimento reduzido: sem animação (`data-animated="false"`).
- `ref` e `className`.
