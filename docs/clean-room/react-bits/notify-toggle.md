# Spec de comportamento: `notify-toggle`

> **Proveniência (clean room).** Escrita em 09/10/2026 a partir da demo pública "Bell Toggle" em
> `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.

## O que a pessoa vê

Um botão-pílula com um sino e "Avise-me". Ao ligar, o sino **balança** (vai e volta algumas
vezes, cada vez menos, pendurado pelo topo), o fundo e a cor trocam com fade, e o texto vira
"Você será avisado". O botão reserva desde o início a largura do rótulo mais longo, então os
vizinhos nunca mexem. Opcional: um contador em badge no sino, que rola quando aumenta (e o sino
dá uma balançada curta). Opcional: ondas sonoras saindo da borda do sino a cada balanço.

## API (`atoms/actions/notify-toggle`)

```ts
type NotifyToggleProps = Omit<React.ComponentProps<typeof TogglePrimitive.Root>, "children"> & {
  offLabel?: string;                 // default "Avise-me"
  onLabel?: string;                  // default "Você será avisado"
  icon?: React.ReactNode;            // default <Bell /> do lucide-react
  size?: "sm" | "default" | "lg";    // altura 32 / 40 / 48 px
  /** Graus do primeiro balanço. */
  ringAmplitude?: number;            // default 17
  /** Meias-oscilações até parar. */
  ringPasses?: number;               // default 5
  /** 1 = decai igual; 2 = segunda já pequena; 0.5 = continua balançando. */
  ringDecay?: number;                // default 1
  ringDurationMs?: number;           // default 820
  /** Onde o ícone fica pendurado, % da altura (16 = topo). */
  ringPivot?: number;                // default 16
  count?: number;                    // default 0
  showBadge?: boolean;               // default true (mostra com count > 0 e ligado)
  waves?: boolean;                   // default true
};
```
`pressed`, `defaultPressed`, `onPressedChange`, `disabled`, `aria-label`, `ref`, `className` do
Radix Toggle.

## Regras

1. **Base:** `@radix-ui/react-toggle` (`aria-pressed`).
2. **Cores (só tokens):** desligado `bg-secondary text-secondary-foreground`, ligado
   `bg-primary text-primary-foreground`; badge `bg-destructive text-destructive-foreground`;
   ondas `border-current`. Raio `rounded-full`.
3. **Balanço:** keyframes de `rotate` gerados por função pura
   `ringKeyframes(amplitude, passes, decay)`: `[0, +a1, -a2, +a3, ..., 0]` com
   `a_n = amplitude * (1 - (n-1)/passes) ** decay`, sinais alternando, terminando em 0. `passes=0`
   → `[0]`. `transformOrigin: 50% ${ringPivot}%`. Só toca ao **ligar** por interação
   (clique/teclado), não quando `pressed` muda por fora.
4. **Largura fixa:** os dois rótulos ficam empilhados na mesma célula de grid (`[grid-area:1/1]`),
   o inativo `invisible` + `aria-hidden`; troca com fade de 200 ms.
5. **Badge:** com `count > 0`, ligado e `showBadge`, um badge no canto do ícone. Quando `count`
   aumenta estando ligado, o número novo entra rolando de baixo e o sino faz um balanço curto
   (metade dos passes).
6. **Ondas:** com `waves`, a cada balanço 1–2 arcos (`span` com borda) saem do ícone crescendo e
   sumindo (`aria-hidden`).
7. **Disabled:** `opacity-50`; estado mantido.

## Movimento reduzido

Sem balanço, sem ondas, sem rolagem do badge: só a troca de cor e de rótulo (fade).

## Acessibilidade

Nome acessível constante: `aria-label` se vier; senão `offLabel`. O estado vai por `aria-pressed`.
Um `sr-only aria-live="polite"` anuncia o `onLabel` ao ligar.

## Marcação

Raiz: `data-slot="notify-toggle"`, `data-state` do Radix. Partes: `notify-toggle-icon`,
`notify-toggle-badge`, `notify-toggle-wave`.

## Testes mínimos

- Pura `ringKeyframes`: começa e termina em 0, alterna sinal, amplitude decrescente, `passes=0`.
- Clique liga, chama `onPressedChange(true)`, `aria-pressed="true"`; de novo desliga.
- Os dois rótulos estão no DOM; o inativo é `aria-hidden`.
- Nome acessível não muda entre estados.
- Badge aparece com `count=3` ligado; some desligado; `showBadge=false` nunca.
- `waves=false` → sem `notify-toggle-wave`. Movimento reduzido → sem ondas.
- Disabled não alterna. `ref`/`className`.
