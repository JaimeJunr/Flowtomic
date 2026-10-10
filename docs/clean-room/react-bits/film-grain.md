# Spec de comportamento: `film-grain`

> **Proveniência (clean room).** Escrita em 10/10/2026 a partir da demo pública "Noise" em
> `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.

## O que a pessoa vê

Uma camada fina de **granulado de filme** por cima de uma área (ou da tela toda): pontinhos claros
e escuros que mudam algumas vezes por segundo, dando textura de papel ou película. Opcionalmente,
**poeira** (pontos e fiapos que piscam), **riscos** verticais finos que correm de cima a baixo por
alguns segundos, **linhas de varredura** horizontais e um leve **tremor** de intensidade.

## Por que existe (uso no produto)

Textura em hero, tela de login e capas, para tirar a cara de "chapado" de fundos lisos.

## API (`atoms/animation/film-grain`)

```ts
type FilmGrainProps = React.ComponentProps<"div"> & {
  /** Força do grão, 0..1. */
  opacity?: number;        // default 0.15
  /** Tamanho do grão em px CSS. */
  size?: number;           // default 1
  /** Trocas por segundo. 0 = grão parado. */
  fps?: number;            // default 24
  blendMode?: "normal" | "overlay" | "soft-light" | "multiply" | "screen"; // default "overlay"
  /** 0 = grão fino e suave; 1 = duro. */
  contrast?: number;       // default 0.6
  dust?: number;           // default 0
  scratches?: number;      // default 0
  scanlines?: number;      // default 0
  flicker?: number;        // default 0
  /** Cobre a tela toda (position: fixed) em vez do pai posicionado. */
  fixed?: boolean;         // default false
};
```

## Regras

1. **Estrutura.** Um `<div>` `pointer-events-none absolute inset-0` (ou `fixed inset-0` com
   `fixed`), `aria-hidden`, `mix-blend-mode` = `blendMode`, `opacity` = `opacity`. Dentro, um
   `<canvas>` `size-full` com `image-rendering: pixelated`.
2. **Grão.** O canvas tem resolução `ceil(largura/size) × ceil(altura/size)` (ResizeObserver), e
   o CSS estica. A cada troca, preencher um `ImageData` com cinza por pixel: valor
   `128 + (r - 0.5)·255·k`, onde `k = 0.4 + 0.6·contrast` e `r` vem de um gerador pseudoaleatório
   **injetável** (função pura `grainValue(r, contrast)`; gerador `mulberry32(seed)` em utils). O
   canal alfa é 255. Cinza puro não é "cor" no código: os números são intensidade de pixel, não
   tokens de tema, e não usam `rgb(` nem hex.
3. **Ritmo.** `useFrameLoop(draw, active, fps)`; com `fps = 0`, desenha uma vez e para.
4. **Poeira.** Com `dust > 0`, a cada troca desenhar `round(dust · área / 4000)` pontos (1–2 px) e
   alguns fiapos (segmentos curvos curtos) em tons extremos, sobre o grão.
5. **Riscos.** Com `scratches > 0`, a cada segundo há probabilidade `scratches · 0.3` de nascer um
   risco: linha vertical de 1 px numa coluna aleatória que dura 1–3 s e treme ±1 px por troca.
6. **Varredura.** `scanlines > 0`: linhas horizontais escuras a cada 3 px com alfa
   `scanlines · 0.25`, rolando 1 px por troca.
7. **Tremor.** `flicker > 0`: a opacidade do contêiner varia `opacity · (1 ± flicker · 0.2 · r)`
   por troca (escrita por ref).
8. Pausa fora da tela (IntersectionObserver) além da aba oculta.

## Movimento reduzido

Grão desenhado uma vez e parado (como `fps = 0`), sem riscos, varredura nem tremor. Poeira
estática fica.

## Acessibilidade

Puramente decorativo: `aria-hidden`, sem foco, não intercepta eventos.

## Marcação

- Raiz: `data-slot="film-grain"`, `data-fixed`, `ref`, `cn`, props nativas.
- Canvas: `data-slot="film-grain-canvas"`.

## Testes mínimos

- `mulberry32` é determinístico para a mesma semente e fica em 0..1.
- `grainValue`: r=0,5 dá 128; contraste maior afasta do meio; sempre dentro de 0..255.
- `gridSize(width, height, size)` arredonda para cima e lança erro com `size ≤ 0`.
- Renderiza `aria-hidden`, `pointer-events-none`, `mix-blend-mode` e opacidade nas props.
- `fixed` troca para `fixed`.
- Com contexto de canvas falso (fake nomeada), `fps=0` desenha uma vez só; com fps > 0 e timers
  falsos desenha de novo.
- Movimento reduzido: desenha uma vez.
- `ref` e `className`.
