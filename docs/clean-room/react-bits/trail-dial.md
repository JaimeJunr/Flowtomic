# Spec de comportamento: `trail-dial`

> **Proveniência (clean room).** Escrita em 09/10/2026 a partir da demo pública "Comet Dial" em
> `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.

## O que a pessoa vê

Um mostrador circular grande com o valor no centro ("62 %"). Um arco de 320° (abertura embaixo)
mostra o trilho; a parte acesa vai do início até o valor, terminando numa "conta" (bolinha).
Arrastar em volta move o valor; ao girar rápido, a conta deixa uma **cauda de cometa** que se
afina para trás e some quando para. Soltar depois de um giro rápido deixa o valor **seguir um
pouco** pela inércia e assentar com um pequeno balanço. Clicar num ponto do arco leva o valor até
lá numa mola.

## API (`atoms/forms/trail-dial`)

```ts
type TrailDialProps = Omit<React.ComponentProps<"div">, "onChange" | "defaultValue"> & {
  value?: number;
  defaultValue?: number;             // default 50
  min?: number;                      // 0
  max?: number;                      // 100
  step?: number;                     // 1
  unit?: string;                     // default "%"; "" esconde
  "aria-label"?: string;             // default "Nível"
  size?: number;                     // diâmetro, default 200
  sweep?: number;                    // graus, default 320
  thickness?: number;                // default 6
  speed?: number;                    // 0..100, default 25
  tapBounce?: number;                // default 0.2
  flickBounce?: number;              // default 0.1
  momentum?: number;                 // default 1 (0 = para onde soltou)
  cometReach?: number;               // graus de cauda em velocidade máx., default 180
  cometWidth?: number;               // px extras na cabeça da cauda, default 10
  disabled?: boolean;
  onValueChange?: (value: number) => void;
  onValueCommit?: (value: number, detail: { velocity: number; bounce: number }) => void;
};
```

## Regras

1. **Acessibilidade:** a conta (ou o grupo) é `role="slider"` focável, com `aria-valuemin/max/now`,
   `aria-valuetext="62 %"`. Teclado: setas ±step, PageUp/PageDown ±10 step, Home/End.
2. **Cores (só tokens):** trilho `stroke-muted`, arco aceso e conta `stroke-primary`/`fill-primary`,
   cauda `stroke-primary` com opacidade decrescente, número `text-foreground` (fonte mono,
   `tabular-nums`), unidade `text-muted-foreground`.
3. **Geometria (puras):** ângulo 0 = topo, sentido horário. O arco vai de `-sweep/2` a
   `+sweep/2`, com a abertura centrada embaixo. `valueToAngle(value, min, max, sweep)`;
   `angleToValue(angle, min, max, sweep, step)` com step e limites; `pointToAngle(x, y, cx, cy)`;
   `arcPath(cx, cy, r, a0, a1)` para o `d` do SVG.
4. **Arrastar:** pointer capture; o ângulo do ponteiro vira valor (sem pular de um extremo ao
   outro pela abertura: limitar pelo lado mais próximo). Velocidade angular medida com suavização.
   `onValueChange` a cada valor com step diferente.
5. **Soltar:** destino = valor + velocidade × `momentum` × fator (inércia), limitado; anima numa
   mola cujo bounce interpola entre `tapBounce` (lento) e `flickBounce` (rápido); chama
   `onValueCommit(final, { velocity, bounce })`. Função pura `releaseTarget`.
6. **Clique no arco:** mola até o ponto (bounce `tapBounce`).
7. **Cauda:** arco atrás da conta com comprimento `cometReach * energia` e espessura da cabeça
   `thickness + cometWidth * energia`, desenhado como 6–10 segmentos com opacidade e espessura
   decrescentes. Energia decai a 0 em ~300 ms parado.
8. Valor controlado vindo de fora anima com a mola do toque.
9. **Disabled:** `opacity-50`.

## Movimento reduzido

Sem cauda, sem inércia, sem balanço: o valor vai direto.

## Marcação

Raiz: `data-slot="trail-dial"`. Partes: `trail-dial-arc`, `trail-dial-bead`, `trail-dial-comet`,
`trail-dial-value`.

## Testes mínimos

- Puras: `valueToAngle`/`angleToValue` ida e volta, step e limites; `pointToAngle` nos 4
  quadrantes; `releaseTarget` (momentum 0 = sem inércia, limitado à faixa).
- Teclado: setas, PageUp, Home/End chamam `onValueChange` e `onValueCommit`.
- `aria-valuetext` com unidade; `unit=""` mostra só o número.
- Disabled ignora teclado. Movimento reduzido sem cauda. `ref`/`className`.
