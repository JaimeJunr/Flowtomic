# Spec de comportamento: `edge-glow-card`

> **Proveniência (clean room).** Escrita em 10/10/2026 a partir da demo pública "Border Glow" em
> `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.

## O que a pessoa vê

Um cartão escuro. Quando o ponteiro chega **perto da borda**, um trecho da borda **acende** com
um gradiente colorido, num **cone** apontando para o ponteiro, com um **brilho** que vaza para
fora do cartão. Quanto mais perto da borda, mais forte. No centro do cartão, nada acende.
Opcionalmente, ao montar, uma luz percorre a borda inteira uma vez.

## Por que existe (uso no produto)

Destaque de um plano, de um recurso novo ou de um alerta importante num painel escuro.

## API (`atoms/display/edge-glow-card`)

```ts
type EdgeGlowCardProps = React.ComponentProps<"div"> & {
  /** Quão perto da borda o brilho começa, 0..100 (% da metade do menor lado). */
  edgeSensitivity?: number;  // default 30
  radius?: number;           // px, default 28
  /** Quanto o brilho vaza para fora, px. */
  glowRadius?: number;       // default 40
  /** Multiplicador de opacidade, 0.1..3. */
  intensity?: number;        // default 1
  /** Largura do cone em %, 5..45. */
  coneSpread?: number;       // default 25
  /** Volta de luz na montagem. */
  animated?: boolean;        // default false
};
```

## Regras

1. **Geometria (pura `edgeState(rect, x, y, sensitivity)` → `{ angle, proximity }`).** `angle`
   em graus do centro até o ponteiro (0 = topo, sentido horário, para casar com
   `conic-gradient(from …)`); `proximity` 0..1: distância normalizada à borda mais próxima,
   `1 - clamp(dist / (sensitivity/100 · min(w,h)/2))`.
2. **Camadas.** Raiz `relative isolate` com `border-radius`; dentro:
   - **Borda colorida**: `absolute inset-0` com `padding: 1.5px`, fundo `conic-gradient` de
     `var(--primary)`, `var(--accent)`, `var(--secondary)`, `var(--primary)`, recortada para ser
     só o anel (`mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)` com
     `mask-composite: exclude` — usar a palavra `black` em vez de hex, ou um gradiente de
     `currentColor`, para não usar hex), e mascarada pelo **cone**: `conic-gradient(from
     calc(var(--angle) - spread) , black 0, black 2·spread, transparent 2·spread)`.
     Opacidade = `proximity · intensity` (limitada a 1).
   - **Brilho externo**: `absolute` com `inset: -glowRadius px`, o mesmo cone, desfocado
     (`blur(glowRadius/2 px)`), opacidade `proximity · intensity · 0.6`.
   - **Corpo**: `absolute inset-[1.5px] bg-card` com raio `radius - 1.5`.
   - Conteúdo `relative z-10`.
3. **Ponteiro.** `pointermove` no `window` enquanto montado (o brilho começa antes do ponteiro
   entrar, perto da borda por fora, até `glowRadius` px fora), escrito por CSS variables
   (`--angle`, `--proximity`) num rAF; `pointerleave` da janela zera.
4. **Volta de luz.** Com `animated`, na montagem `--angle` vai de 0 a 360 em 1,2 s com
   `--proximity` subindo a 1 e voltando a 0 (`animate` do motion sobre `MotionValue`s).

## Movimento reduzido

Sem volta de luz. O brilho segue o ponteiro (é resposta direta, não animação), mas sem
transição.

## Acessibilidade

Camadas `aria-hidden`; o conteúdo é o filho.

## Marcação

- Raiz: `data-slot="edge-glow-card"`, `ref`, `cn`.
- Partes: `edge-glow-card-border`, `edge-glow-card-glow`, `edge-glow-card-body`.

## Testes mínimos

- `edgeState`: centro → `proximity 0`; em cima da borda → 1; topo → ângulo ~0; direita → ~90;
  fora do cartão até `glowRadius` → proximidade positiva; rect zero lança erro com o valor.
- Valores fora de faixa (`coneSpread`, `intensity`, `edgeSensitivity`) lançam erro.
- `pointermove` no window escreve `--angle`/`--proximity` (rect falso).
- `animated` com movimento reduzido não anima; sem reduzido, `--proximity` chega a 0 no fim.
- Sem hex no fonte (o teste de tokens já trava).
- `ref` e `className`.
