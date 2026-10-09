# Spec de comportamento: `liquid-gauge`

> **Proveniência (clean room).** Escrita em 09/10/2026 a partir da demo pública "Slosh Gauge" em
> `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.

## O que a pessoa vê

Um tanque de vidro vertical (88×180) com **líquido** até o nível (60%). Quando o nível muda, o
líquido **corre** até lá com inércia: a superfície **inclina** proporcional à velocidade e
balança antes de assentar; bater no fundo ou no topo devolve um respingo. O número no centro troca
de cor exatamente onde a superfície passa. Riscos discretos marcam 25/50/75. No modo interativo,
clicar ou arrastar no tanque define o nível, e as setas ajustam.

## API (`atoms/data-display/liquid-gauge`)

```ts
type LiquidGaugeProps = Omit<React.ComponentProps<"div">, "onChange" | "defaultValue"> & {
  value?: number;                    // 0..100
  defaultValue?: number;             // default 60
  onValueChange?: (value: number) => void;
  interactive?: boolean;             // default false
  showValue?: boolean;               // default true
  disabled?: boolean;
  size?: "sm" | "default" | "lg";    // 64×128 / 88×180 / 112×228
  ticks?: number;                    // default 3 (linhas internas)
  /** 0 = ponteiro rígido; maior = mais lento, balança mais. */
  viscosity?: number;                // default 0.15
  /** Inclinação da superfície por velocidade. */
  tilt?: number;                     // default 0.45
  /** Quanto o topo/fundo devolve. */
  splash?: number;                   // default 0.4
  unit?: string;                     // default "%"
  "aria-label"?: string;             // default "Nível"
};
```

## Regras

1. **Física simples** (pura, testável): `stepLiquid(state, target, dt, opts)` → `{ level, velocity }`
   com mola amortecida (rigidez e amortecimento derivados de `viscosity`; 0 → chega no alvo no
   mesmo passo), limitado a [0,100] com rebote `velocity *= -splash` ao bater nos limites.
   Rodar num rAF só enquanto houver movimento (reaproveitar `@/lib/use-frame-loop`).
2. **Superfície:** `clip-path: polygon(...)` no líquido com a borda de cima inclinada
   `Δy = tilt * velocity` (limitado) mais uma ondulação leve que decai. Função pura
   `surfacePolygon(level, slope, height)`.
3. **Cores (só tokens):** vidro `bg-muted border`, líquido `bg-primary`, riscos `bg-border`,
   número `text-foreground` fora do líquido e `text-primary-foreground` dentro (duas cópias do
   número, a de dentro recortada pelo mesmo polígono).
4. **Interativo:** `role="slider"` focável, `aria-valuemin=0`, `aria-valuemax=100`,
   `aria-valuenow`, `aria-valuetext="60%"`; clique/arrasto vertical define `100 - y/altura*100`
   (inteiro); setas ±1, PageUp/Down ±10, Home/End. Marcador fino no nível. `onValueChange` inteiro.
   Não interativo: `role="meter"` com os mesmos `aria-value*`.
5. **Disabled:** `opacity-50`, sem input; mudanças de valor por fora ainda animam.

## Movimento reduzido

Sem física: nível vai direto, superfície reta.

## Marcação

Raiz `data-slot="liquid-gauge"`. Partes: `liquid-gauge-liquid`, `liquid-gauge-value`,
`liquid-gauge-tick`, `liquid-gauge-marker`.

## Testes mínimos

- Puras: `stepLiquid` (converge para o alvo; viscosidade 0 chega na hora; nunca sai de 0..100;
  splash 0 não volta), `surfacePolygon` (nível 0/100, inclinação muda só a borda de cima).
- `role="meter"` sem interativo; `role="slider"` com; setas e Home/End chamam `onValueChange`.
- Clique com mock de `getBoundingClientRect` define o nível.
- `ticks=0` sem riscos; `showValue=false` sem número; `unit`. Disabled. Movimento reduzido. `ref`/`className`.
