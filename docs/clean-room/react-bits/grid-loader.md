# Spec de comportamento: `grid-loader`

> **Proveniência (clean room).** Escrita em 09/10/2026 a partir da demo pública "Lattice Loader" em
> `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.

## O que a pessoa vê

Um indicador de "pensando" para IA: uma grade minúscula 3×3 de pontinhos ao lado do verbo
("Pensando") e de um cronômetro ("1,2 s"). Os pontos acendem em **onda** seguindo um padrão
(órbita, espiral, cobrinha, ondulação…), com a silhueta apagada sempre visível. Quando termina, a
onda congela e os pontos se reorganizam num **✓** (verde) com "Pronto em 3,4 s"; se falha, num
**✕** (vermelho) com "Falhou após 3,4 s". O cronômetro para.

## API (`atoms/feedback/grid-loader`)

```ts
type GridLoaderPattern = "orbit" | "spiral" | "snake" | "ripple" | "arrow" | "dots"   // 3×3
                       | "sweep" | "spin" | "rain" | "pulse";                         // 4×4
type GridLoaderProps = Omit<React.ComponentProps<"div">, "children"> & {
  status?: "working" | "done" | "error";   // default "working"
  label?: string;                           // default "Pensando"
  doneLabel?: string;                       // default "Pronto em"
  errorLabel?: string;                      // default "Falhou após"
  pattern?: GridLoaderPattern | { delays: (number | null)[]; loop?: number };
  grid?: 3 | 4;                             // default 3
  shape?: "round" | "square";               // default "round"
  size?: "sm" | "default" | "lg";           // célula 4 / 6 / 8 px; texto text-xs / text-sm / text-base
  stepMs?: number;                          // default 90
  idleOpacity?: number;                     // default 0.15
  showTimer?: boolean;                      // default true
  /** Segundos controlados; quando passado, o relógio interno não roda. */
  elapsed?: number;
};
```

## Regras

1. **Padrões** (tabela pura `PATTERNS[grid][name]` → array de atrasos em passos por célula,
   `null` = buraco): órbita = anel externo em sentido horário com o centro apagado; espiral;
   cobrinha (zigue-zague por linhas); ondulação (distância ao centro); seta; pontos (diagonais);
   4×4: varredura (colunas), giro, chuva (colunas com atrasos aleatórios fixos), pulso (anéis),
   órbita, cobrinha. Cada célula acende por `keyframes` CSS de opacidade com
   `animation-delay = atraso * stepMs` e duração do ciclo `loop * stepMs`. Padrão inválido para o
   tamanho da grade → lança erro com o nome e a grade recebidos.
2. **Cores (só tokens):** pontos `bg-current` (herda a cor do texto), ✓ `text-success`,
   ✕ `text-destructive`, cronômetro `text-muted-foreground font-mono tabular-nums`.
3. **Fim:** `done`/`error` congela a animação, depois cada célula anima opacidade até a máscara do
   ✓ ou do ✕ (tabelas puras `CHECK_MASK[grid]`, `CROSS_MASK[grid]` com 0/1 por célula) e troca a
   cor.
4. **Cronômetro:** conta desde a montagem ou desde a última volta a `working`, com 1 casa
   (`Intl.NumberFormat("pt-BR")` → "1,2 s"); para em `done`/`error`. Com `elapsed`, mostra o valor
   recebido. Função pura `formatElapsed(seconds)`.
5. Texto: `working` → `label`; `done` → `doneLabel + " " + tempo`; `error` → `errorLabel + " " + tempo`.

## Movimento reduzido

Sem onda: a grade fica parada com um padrão fixo meio aceso (ex. o centro); o fim troca direto
para ✓/✕.

## Acessibilidade

Raiz `role="status"` com `aria-live="polite"`; a grade é `aria-hidden`; o texto anunciado é
"Pensando, em andamento" / "Pronto em 3,4 segundos" / "Falhou após 3,4 segundos" (o cronômetro
ao vivo **não** é anunciado a cada décimo: fica `aria-hidden` enquanto `working`).

## Marcação

Raiz `data-slot="grid-loader"`, `data-status`. Partes: `grid-loader-cell`, `grid-loader-timer`.

## Testes mínimos

- Puras: cada padrão tem `grid*grid` entradas; atrasos ≥ 0 ou null; `CHECK_MASK`/`CROSS_MASK`
  com o tamanho certo; `formatElapsed(1.234)` = "1,2 s"; padrão 4×4 em grade 3 lança erro.
- Renderiza 9 ou 16 células. `status="done"` mostra "Pronto em" e marca células do ✓.
- Fake timers: cronômetro avança em `working` e para em `done`. `elapsed` controlado não avança.
- Padrão customizado. Movimento reduzido sem `animation`. `ref`/`className`.
