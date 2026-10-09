# Spec de comportamento: `stretch-switch`

> **Proveniência (clean room).** Escrita em 09/10/2026 a partir da demo pública "Squish Switch" em
> `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.

## O que a pessoa vê

Um interruptor liga/desliga com um rótulo ao lado ("Modo avião"). O botão redondo (thumb) corre
de um lado ao outro numa mola. Enquanto corre, ele **estica na direção do movimento** e afina na
outra, mantendo a área (como uma gota). Pode ser arrastado: soltar depois do meio troca o estado.
No hover o thumb incha um pouco. A cor do trilho troca com um fade.

## API (`atoms/forms/stretch-switch`)

```ts
type StretchSwitchProps = Omit<React.ComponentProps<typeof SwitchPrimitive.Root>, "onChange"> & {
  /** Rótulo ao lado, ligado ao switch por id/htmlFor. */
  label?: React.ReactNode;
  onCheckedChange?: (checked: boolean) => void; // nome do Radix
  size?: "sm" | "default" | "lg";   // default "default": trilho 40x22 / 52x28 / 64x34 px
  /** 0..100. Rigidez da mola de assentar. Baixo = preguiçoso. */
  speed?: number;                   // default 50
  /** 0..100. Quanto o thumb estica com a velocidade. 0 = não estica. */
  stretch?: number;                 // default 36
  hoverScale?: number;              // default 1.035
  colorDurationMs?: number;         // default 320
};
```
`checked`, `defaultChecked`, `disabled`, `id`, `name`, `className`, `ref` vêm do Radix Switch.

## Regras

1. **Base acessível:** `@radix-ui/react-switch` (`role="switch"`, `aria-checked`, Espaço alterna).
   O thumb animado é um `motion.span` dentro do `SwitchPrimitive.Thumb` com `asChild` ou no lugar
   dele — o importante é o Radix continuar dono do estado e do teclado.
2. **Cores (só tokens):** trilho desligado `bg-input`, ligado `bg-primary`; thumb desligado
   `bg-background`, ligado `bg-primary-foreground`. Troca por `transition-colors` com
   `colorDurationMs`.
3. **Mola:** a posição do thumb é um `useSpring` do motion; a rigidez é derivada de `speed`
   (função pura `stiffnessFromSpeed(speed)`, ex. 0→120, 100→900, linear; amortecimento fixo que
   não oscile demais).
4. **Esticar:** a cada quadro, `scaleX = 1 + k * |velocidade|` limitado (máx. 1 + stretch/100) e
   `scaleY = 1 / scaleX` (área constante). Função pura `stretchScale(velocity, stretch)` que
   devolve `{ scaleX, scaleY }`. Com `stretch = 0`, `{1, 1}`.
5. **Arrastar:** pointerdown no thumb + mover arrasta horizontalmente dentro do trilho. Ao soltar,
   o estado final é decidido pela posição: passou do meio → ligado (função pura
   `resolveDragRelease(x, travel)`). Um arrasto que não sai do lugar conta como clique comum.
   Arrastar não pode disparar dois toggles (o click do Radix depois do drag deve ser engolido).
6. **Hover:** thumb vai a `hoverScale`.
7. **Disabled:** `opacity-50`, `cursor-not-allowed`, sem arrasto.
8. **Rótulo:** se `label` existe, renderiza `<label htmlFor={id}>` ao lado (id gerado com `useId`
   se não vier). Sem `label`, quem usa passa `aria-label`.

## Movimento reduzido

Sem mola, sem esticar, sem hover scale: o thumb vai direto para o lado (transição de 0 ms ou
curta linear). A troca de cor continua.

## Marcação

- Raiz: wrapper `span`/`div` com `data-slot="stretch-switch"`, `data-state="checked"|"unchecked"`;
  `ref` e `className` no `SwitchPrimitive.Root` (`data-slot="stretch-switch-control"`).
  ⚠️ Atenção ao teste de convenção React 19: `data-slot` literal na raiz retornada.
- Thumb: `data-slot="stretch-switch-thumb"`.

## Testes mínimos

- Funções puras: `stiffnessFromSpeed` (0, 50, 100, fora da faixa limitada), `stretchScale`
  (0 → 1/1; velocidade alta limitada; área ≈ 1), `resolveDragRelease` (antes/depois do meio).
- Clique alterna e chama `onCheckedChange`; controlado (`checked`) não muda sozinho.
- Teclado: Espaço alterna.
- `label` liga ao switch (`getByLabelText("Modo avião")`).
- Disabled não alterna.
- Arrasto (pointer events simulados) além do meio liga, antes do meio não liga, sem toggle duplo.
- Movimento reduzido: renderiza e alterna.
- `ref`/`className` e `data-slot`.
