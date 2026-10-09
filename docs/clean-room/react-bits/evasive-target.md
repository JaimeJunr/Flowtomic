# Spec de comportamento: `evasive-target`

> **Proveniência (clean room).** Escrita em 09/10/2026 a partir da demo pública "Dodge Field" em
> `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.

## O que a pessoa vê

Uma pílula "Me pega" num campo invisível. Quando o ponteiro se aproxima, ela **foge** dando um
salto rápido para longe do ponteiro (mais forte quanto mais perto), e cada fuga troca o texto
("Não", "Muito lento", "Quase"). Quando o ponteiro se afasta, ela **volta** para casa deslizando.
Depois de algumas fugas ela **desiste** ("Tá bom, tá bom") e fica parada para ser clicada. Em tela
de toque nada foge (mostra um aviso opcional).

## Uso

Efeito lúdico para página de erro, easter egg, onboarding. **Nunca** envolver um controle de
recusa, fechar ou cancelar num campo que foge — escrever isso no JSDoc em destaque.

## API (`atoms/animation/evasive-target`)

```ts
type EvasiveState = { dodges: number; gaveUp: boolean; caught: boolean; fleeing: boolean };
type EvasiveTargetProps = Omit<React.ComponentProps<"div">, "children"> & {
  children?: React.ReactNode | ((state: EvasiveState) => React.ReactNode); // ausente = pílula própria
  taunts?: string[];             // default ["Me pega", "Não", "Muito lento", "Quase", "Tá bom, tá bom"]
  touchNotice?: string;          // default ""
  fieldHeight?: number;          // default 240
  reach?: number;                // px que foge com o ponteiro em cima de casa, default 72
  radius?: number;               // distância em que começa a reagir, default 120
  falloff?: number;              // expoente da curva, default 2
  fleeMs?: number;               // default 130
  returnMs?: number;             // default 620
  returnBounce?: number;         // default 0.1
  axis?: "both" | "x" | "y";     // default "both"
  wall?: "clamp" | "bounce";     // default "clamp"
  patience?: number;             // fugas antes de desistir, mín. 1, default 4
  disabled?: boolean;
  onDodge?: (count: number) => void;
  onGiveUp?: () => void;
  onCatch?: () => void;
};
```

## Regras

1. **Fuga** (função pura `fleeOffset(pointer, home, reach, radius, falloff, axis)`): vetor do
   ponteiro para casa normalizado × `reach × (1 - d/radius)^falloff` quando `d < radius`, senão 0;
   eixo restringe. Limite do campo: `clamp` corta; `bounce` dobra o excesso para dentro (função
   pura `applyWall(pos, bounds, wall)`).
2. **Contagem:** uma fuga conta quando o deslocamento passa de 50% do `reach` vindo de perto de
   casa (histerese, para não contar 60 por segundo). Ao chegar em `patience`: desiste, para de
   reagir, `onGiveUp`. Texto da pílula: `taunts[min(dodges, len-2)]`, e o último ao desistir.
3. **Movimento:** fuga com mola rápida (`fleeMs`), volta com mola lenta (`returnMs`, `returnBounce`).
4. **Pílula própria (só tokens):** `bg-primary text-primary-foreground rounded-full px-4 py-2`;
   pega (clicada) → `bg-foreground text-background`. Foco visível `ring-ring`.
5. **Teclado:** o filho continua focável e clicável por teclado sem fugir (fugir é só do
   ponteiro). Clique → `caught`, `onCatch`.
6. **Toque:** `pointerType !== "mouse"` não foge; mostra `touchNotice` se houver.
7. **Disabled:** parado, não conta.

## Movimento reduzido

Não foge: fica em casa e clicável; o texto pode mudar por hover sem mover.

## Marcação

Raiz (o campo) `data-slot="evasive-target"`, `data-gave-up`. Parte: `evasive-target-pill`.

## Testes mínimos

- Puras: `fleeOffset` (longe = 0; em cima = reach; eixo x zera y; falloff maior = mais fraco a
  meia distância), `applyWall` (clamp e bounce).
- Pointer `mousemove` simulado perto de casa (mock de `getBoundingClientRect`) chama `onDodge(1)`;
  depois de `patience` fugas, `onGiveUp` e `data-gave-up="true"`; o texto muda conforme `taunts`.
- `pointerType="touch"` não foge; `touchNotice` aparece.
- Clique → `onCatch`. Children como função recebe o estado. Disabled. Movimento reduzido. `ref`/`className`.
