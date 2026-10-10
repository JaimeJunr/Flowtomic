# Spec de comportamento: `option-wheel`

> **Proveniência (clean room).** Escrita em 10/10/2026 a partir da demo pública "Option Wheel" em
> `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.

## O que a pessoa vê

Uma lista de opções em texto grande dispostas numa **roda** que se curva em volta de uma borda
(esquerda ou direita) do contêiner. A opção do meio está **acesa**; as outras se afastam pela
curva, inclinadas, cada vez mais **borradas e apagadas**. Rolar, arrastar ou usar as setas gira a
roda; ela assenta sempre numa opção.

## Por que existe (uso no produto)

Escolher período ("Diário", "Semanal", "Mensal"...), perfil de investidor ou plano num onboarding.

## API (`molecules/forms/option-wheel`)

```ts
type OptionWheelProps = Omit<React.ComponentProps<"div">, "onChange" | "defaultValue"> & {
  options: string[];
  /** Controlado. */
  value?: number;
  defaultValue?: number;              // default 0
  onValueChange?: (index: number, option: string) => void;
  side?: "left" | "right";            // default "left"
  fontSize?: number;                  // rem, default 3
  spacing?: number;                   // múltiplo do fontSize, default 1.4
  curve?: number;                     // 0 = lista reta, default 1
  tilt?: number;                      // graus entre vizinhos, default 6
  blur?: number;                      // px por passo de distância, default 2
  fade?: number;                      // opacidade perdida por passo, default 0.25
  minOpacity?: number;                // default 0.05
  smoothing?: number;                 // ms da constante de tempo, default 200
  inset?: number;                     // px da borda ao item do meio, default 80
  loop?: boolean;                     // default false
  draggable?: boolean;                // default true
  "aria-label": string;
};
```

## Regras

1. **Posição contínua.** Um valor `position` (float, em índices) persegue o alvo `target` (int)
   com suavização exponencial `position += (target - position)·(1 - e^(-dt/smoothing))`
   (pura `approach`), num `useFrameLoop` que para quando a diferença < 0,001.
2. **Layout de cada opção (pura `optionLayout(d, opts)`, `d = i - position`)**:
   `y = d · fontSize · spacing` (em rem); ângulo `θ = d · tilt`; deslocamento horizontal para
   dentro `x = curve · R · (1 - cos θ)` com `R = fontSize·spacing / (tilt em rad)`; rotação
   `rotate(θ)` (sinal espelhado em `side="right"`); `opacity = max(minOpacity, 1 - |d|·fade)`;
   `blur = |d|·blur` px. Com `loop`, `d` usa a distância circular mais curta.
3. **Cor.** Opção com `|d| < 0.5` usa `text-foreground`; demais `text-muted-foreground`. A
   transição é por `opacity` (sem cor interpolada).
4. **Estrutura.** Raiz `relative overflow-hidden select-none` com altura vinda do `className`
   (story usa `h-96`). Opções `absolute top-1/2` ancoradas à borda `side` com `inset` px,
   origem da transformação na borda oposta, escritas por ref por quadro.
5. **Entrada.** Roda do mouse: acumula `deltaY` e anda 1 opção a cada 60 px (sem
   `preventDefault` quando no extremo sem `loop`, para não prender a página). Arraste vertical:
   `target = round(início - dy / alturaDaOpção)`. Clique numa opção a seleciona.
   Teclado (raiz focada): ↑/↓, Home/End. Sem `loop`, limitado aos extremos.
6. **Mudança.** `onValueChange` só quando o `target` muda (não por quadro).

## Movimento reduzido

`position` salta direto para o `target`; sem blur.

## Acessibilidade

Raiz `role="listbox"` com `aria-label`, `tabIndex=0`, `aria-activedescendant`; cada opção
`role="option"` com `id` e `aria-selected`. Foco visível `focus-visible:ring-2 ring-ring`.

## Marcação

- Raiz: `data-slot="option-wheel"`, `data-side`, `ref`, `cn`.
- Opção: `data-slot="option-wheel-option"`, `data-active`.

## Testes mínimos

- `approach` converge e não ultrapassa; `optionLayout`: `d=0` dá x=0, θ=0, opacidade 1, blur 0;
  `|d|` maior dá mais blur, menos opacidade, nunca abaixo de `minOpacity`; `curve=0` dá x=0;
  espelhamento em `right`.
- Distância circular com `loop`.
- ↓ seleciona o próximo e chama `onValueChange`; ↓ no último sem `loop` fica; com `loop` volta ao 0.
- Clique seleciona; controlado (`value`) manda.
- Roda: 120 px de `deltaY` anda 2.
- Movimento reduzido: posição já no alvo após a tecla.
- `options` vazio lança erro; `ref` e `className`.
