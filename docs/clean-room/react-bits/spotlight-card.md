# Spec de comportamento: `spotlight-card`

> **Proveniência (clean room).** Escrita em 09/10/2026 a partir da demo pública "Spotlight Card"
> em `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.

## O que a pessoa vê

Um cartão comum (perfil, métrica, plano) sobre o qual uma **luz suave** segue o ponteiro: um
círculo de brilho difuso por cima da superfície, e a **borda do cartão acende** no trecho mais
perto do ponteiro. A luz flutua um pouco atrás do ponteiro (não gruda). A luz começa a alcançar o
cartão um pouco **antes** de o ponteiro entrar (80 px), então cartões lado a lado parecem dividir
a mesma luz. Pressionar o cartão faz a luz **inchar** e clarear. Opcionalmente, a luz pode vagar
sozinha devagar quando ninguém aponta (bom em tela de toque), ou cair do topo como um **feixe** de
palco.

## API (`atoms/display/spotlight-card`)

```ts
type SpotlightCardProps = React.ComponentProps<"div"> & {
  /** Intensidade da luz, 0..1. */
  intensity?: number;          // default 0.15
  /** Raio da luz em px. */
  size?: number;               // default 240
  /** 0 = disco nítido; 1 = brilho que some desde o centro. */
  softness?: number;           // default 0.7
  shape?: "circle" | "beam";   // default "circle"
  /** Quanto a borda acende perto do ponteiro, 0..1. */
  borderGlow?: number;         // default 0.6
  /** px fora do cartão em que a luz já começa. 0 = só com hover. */
  proximity?: number;          // default 80
  /** 0 = gruda no ponteiro; maior = flutua atrás. */
  smoothing?: number;          // default 0.3
  ambient?: boolean;           // default false
  flare?: boolean;             // default true
};
```

## Regras

1. **Superfície (só tokens):** igual ao `Card` da lib (`bg-card text-card-foreground border
   rounded-xl`, ler `atoms/display/card/card.tsx`). A luz usa a cor de primeiro plano do tema
   misturada: `color-mix(in oklab, var(--foreground) <intensity*100>%, transparent)`, então
   funciona em claro e escuro sem prop de tema.
2. **Luz:** camada `absolute inset-0 pointer-events-none rounded-[inherit]` com
   `radial-gradient(circle <size>px at var(--sx) var(--sy), <cor> 0%, transparent <stop>)`, onde o
   ponto final do gradiente vem de `softness` (função pura `gradientStops(softness)`). `beam`:
   gradiente elíptico alto e estreito, ancorado no topo, inclinado em direção ao ponteiro (função
   pura `beamGradient(x, y, w, h)`).
3. **Borda:** segunda camada com o mesmo gradiente, mais forte (`borderGlow`), recortada só na
   borda com `padding: 1px` + `mask` de duas camadas e `mask-composite: exclude`. As camadas da
   máscara não podem usar hex nem `rgb()`: confira no `theme-tokens.test.ts` se `black` passa; se
   não passar, use `linear-gradient(currentColor, currentColor)`.
4. **Ponteiro:** um único listener de `pointermove` no `window` (compartilhado por todos os cartões
   via um módulo singleton, para N cartões não criarem N listeners). Cada cartão calcula a posição
   relativa e a distância até o retângulo; se `distância ≤ proximity`, a luz liga com opacidade
   `1 - distância/proximity` (função pura `proximityFade(rect, x, y, proximity)`). Posição suavizada
   por rAF com fator `smoothing` (função pura `follow(current, target, smoothing, dt)`). Escrever
   `--sx/--sy/--so` direto no `style` por ref (sem re-render por quadro).
5. **Flare:** `pointerdown` no cartão → raio × 1.25 e intensidade × 1.6 por 300 ms (volta ao soltar).
6. **Ambient:** sem ponteiro por perto, a luz percorre uma curva de Lissajous lenta (ciclo ~12 s).
7. **Pausa:** o loop só roda enquanto a luz está visível ou em movimento; sai do loop parado.

## Movimento reduzido

Sem seguir: a luz fica fixa no centro-topo com intensidade baixa enquanto o ponteiro está perto, e
some quando sai. Sem ambient, sem flare.

## Acessibilidade

Puramente decorativo: as camadas de luz são `aria-hidden`. O cartão em si não ganha papel nenhum
(o conteúdo decide). Foco por teclado dentro do cartão não depende da luz.

## Marcação

Raiz `data-slot="spotlight-card"`, `data-lit="true|false"`. Partes: `spotlight-card-light`,
`spotlight-card-border`.

## Testes mínimos

- Puras: `gradientStops` (softness 0 → borda nítida, com os stops colados; 1 → fade desde o centro), `proximityFade`
  (dentro = 1; na distância `proximity` = 0; `proximity=0` só dentro), `follow` (smoothing 0 = alvo;
  converge), `beamGradient` determinístico.
- `pointermove` no window (mock de `getBoundingClientRect`) dentro do cartão → `data-lit="true"`;
  longe → `"false"`; a 40 px com proximity 80 → aceso.
- Dois cartões montados → um único listener no window (spy em `addEventListener`), removido quando
  o último desmonta.
- `pointerdown` → flare (atributo/estilo). Movimento reduzido sem seguir. Camadas `aria-hidden`.
  `ref`, `className` e props nativas na raiz.
