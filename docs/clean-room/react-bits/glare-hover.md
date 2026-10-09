# Spec de comportamento: `glare-hover`

> **Proveniência (clean room).** Escrita em 09/10/2026 a partir da demo pública "Glare Hover" em
> `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.

## O que a pessoa vê

Uma superfície (card, botão grande, tile de produto). Ao passar o ponteiro, um **reflexo**
(faixa clara diagonal, como luz batendo em vidro) **atravessa** a superfície de um canto ao outro
uma vez. Ao tirar o ponteiro, o reflexo volta atravessando no sentido contrário (a não ser que
`playOnce`). O reflexo não segue o ponteiro: é uma varredura com duração fixa.

## Por que existe (uso no produto)

Dar acabamento "brilhante" a cards de plano, cartões de pagamento e tiles de destaque.

## API (`atoms/animation/glare-hover`)

```ts
type GlareHoverProps = React.ComponentProps<"div"> & {
  /** Cor do reflexo. Token; padrão a cor de fundo do tema, que é clara no claro e escura no escuro. */
  glareColor?: string;       // default "var(--background)"
  /** 0..1 */
  glareOpacity?: number;     // default 0.5
  /** Ângulo da faixa em graus. */
  glareAngle?: number;       // default -45
  /** Tamanho do gradiente em % da superfície (maior = faixa mais estreita relativa). */
  glareSize?: number;        // default 250
  /** ms */
  duration?: number;         // default 650
  /** Só varre na entrada; na saída volta sem animar. */
  playOnce?: boolean;        // default false
};
```

## Regras

1. **Superfície.** Raiz `relative overflow-hidden rounded-lg border bg-card text-card-foreground`
   (como o `Card`), `className` sobrescreve. `children` normais por cima.
2. **Reflexo.** Uma camada `absolute inset-0 pointer-events-none` (`aria-hidden`) com
   `linear-gradient(<glareAngle>deg, transparent 60%, <cor> 70%, transparent 80%)`, onde
   `<cor> = color-mix(in oklab, <glareColor> <glareOpacity*100>%, transparent)` (função pura
   `glareGradient(angle, color, opacity)`). `background-size: <glareSize>% <glareSize>%`.
3. **Varredura.** Posição do fundo: repouso `-100% -100%`, hover `100% 100%`. Transição CSS de
   `background-position` com `duration` ms e `ease`. Entrar → vai para hover; sair → volta (com
   `playOnce`, volta sem transição: `transition: none` por um quadro).
4. **Foco.** `:focus-within` também dispara a varredura, para quem navega por teclado.
5. Estado exposto em `data-glare="idle|active"`.

## Movimento reduzido

Sem varredura. O hover só clareia a superfície um pouco (o reflexo aparece estático com metade
da opacidade, sem transição).

## Acessibilidade

Decorativo, `aria-hidden` na camada. Não interfere em foco nem cliques.

## Marcação

- Raiz: `data-slot="glare-hover"`, `ref`, `cn`, props nativas.
- Camada: `data-slot="glare-hover-glare"`.

## Testes mínimos

- `glareGradient` contém o ângulo e o `color-mix` com a opacidade; sem hex nem `rgb(`.
- `pointerenter` → `data-glare="active"` e posição final; `pointerleave` → `idle`.
- `playOnce`: na saída, a transição fica `none`.
- Foco num filho ativa.
- Movimento reduzido: sem transição de `background-position`.
- `ref`, `className`, props nativas.
