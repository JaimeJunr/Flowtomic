# Spec de comportamento: `magnet-lines`

> **Proveniência (clean room).** Escrita em 09/10/2026 a partir da demo pública "Magnet Lines" em
> `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.

## O que a pessoa vê

Uma grade de **tracinhos** (como limalha de ferro). Em repouso, todos inclinados no mesmo ângulo.
Quando o ponteiro se move sobre a página, **cada tracinho gira para apontar para o ponteiro**,
como agulhas de bússola em volta de um ímã. O giro é suave.

## Por que existe (uso no produto)

Ilustração viva para estado vazio, tela de login ou hero, sem imagem.

## API (`atoms/animation/magnet-lines`)

```ts
type MagnetLinesProps = React.ComponentProps<"div"> & {
  rows?: number;        // default 9
  columns?: number;     // default 9
  /** Cor dos traços. Token. */
  lineColor?: string;   // default "var(--muted-foreground)"
  /** Espessura e comprimento do traço (qualquer medida CSS). */
  lineWidth?: string;   // default "2px"
  lineLength?: string;  // default "24px"
  /** Ângulo de repouso em graus. */
  baseAngle?: number;   // default -10
};
```

## Regras

1. **Estrutura.** Raiz `grid` com `grid-template-columns: repeat(columns, 1fr)` e `rows × columns`
   células centradas; cada uma tem um `<span>` (`data-slot="magnet-lines-line"`) com
   `width: lineWidth; height: lineLength; background: lineColor; border-radius: 9999px`.
   A raiz tem tamanho do `className` (padrão `size-80`, quadrado).
2. **Rotação.** A raiz escreve no `style` de cada traço a variável `--angle`; o traço usa
   `transform: rotate(var(--angle))` com `transition: transform 0.15s ease-out`.
3. **Ângulo.** Para cada traço com centro `(cx, cy)` e ponteiro `(px, py)`:
   `angle = atan2(py - cy, px - cx)` em graus + 90 (o traço é vertical). Função pura
   `pointAngle(cx, cy, px, py)`.
4. **Ponteiro.** Um `pointermove` no `window`, processado no máximo uma vez por quadro (rAF).
   Os centros dos traços são medidos uma vez e de novo em resize/scroll.
5. **Início.** Até o primeiro movimento, todos em `baseAngle`. Sem ponteiro (toque), o primeiro
   `pointerdown`/arraste também vale.

## Movimento reduzido

Traços fixos em `baseAngle`, sem listener.

## Acessibilidade

Decorativo: raiz `aria-hidden="true"` e `role="presentation"`.

## Marcação

- Raiz: `data-slot="magnet-lines"`, `ref`, `cn`, props nativas.

## Testes mínimos

- `pointAngle`: ponteiro acima → 0°, à direita → 90°, abaixo → 180°, à esquerda → -90°/270°.
- Renderiza `rows × columns` traços.
- Repouso: todos com `--angle` = `baseAngle`deg.
- Depois de `pointermove` (rAF falso), o `--angle` muda.
- Movimento reduzido: não muda.
- `aria-hidden`, `ref` e `className`.
