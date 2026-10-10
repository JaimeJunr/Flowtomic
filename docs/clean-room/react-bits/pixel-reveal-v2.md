# Spec de comportamento: ampliação do `pixel-reveal`

> **Proveniência (clean room).** Escrita em 10/10/2026 a partir da demo pública "Pixel Swap" em
> `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.
> O efeito é o mesmo do `pixel-reveal` (spec em `pixel-reveal.md`); por isso ele é **ampliado**,
> sem criar componente novo. Toda mudança é aditiva: o comportamento padrão atual não muda.

## O que a demo acrescenta

Mais ordens de aparição dos pixels, controle da forma de cada pixel (raio, escala inicial, giro,
fade), espaço entre pixels e um aviso de quando a troca terminou.

## API nova (acrescentada a `PixelRevealProps`)

```ts
type PixelRevealPattern =
  | "random" | "dither" | "ripple" | "wipe"            // já existem
  | "center" | "edges"
  | "left-to-right" | "right-to-left" | "top-to-bottom" | "bottom-to-top"
  | "diagonal" | "spiral";

{
  pattern?: PixelRevealPattern;   // default continua "random"
  /** Espaço entre pixels em px. */
  gap?: number;                   // default 0
  /** Arredondamento de cada pixel em % (0 quadrado, 50 círculo). */
  pixelRadius?: number;           // default 0
  /** Escala com que cada pixel nasce, 0..1. Hoje é 0.6 fixo. */
  pixelScale?: number;            // default 0.6
  /** Graus que cada pixel gira ao aparecer. */
  pixelSpin?: number;             // default 0
  /** Liga o fade de opacidade de cada pixel. Sem fade, o pixel só cresce. */
  fade?: boolean;                 // default true
  /** Chamado quando o conteúdo novo termina de aparecer. */
  onComplete?: (active: boolean) => void;
}
```

## Regras

1. **Ordens novas** em `revealOrder` (atraso normalizado 0..1 por célula, mais
   `ruído · randomness` como hoje):
   - `center`: distância ao centro da grade, normalizada;
   - `edges`: `1 - center` (de fora para dentro);
   - `left-to-right` / `right-to-left` / `top-to-bottom` / `bottom-to-top`: coluna ou linha
     normalizada (invertida conforme o sentido);
   - `diagonal`: `(coluna + linha) / (cols + rows - 2)`;
   - `spiral`: posição da célula no percurso em espiral de fora para dentro, a partir do canto
     superior esquerdo no sentido horário, dividida por `n - 1` (função pura
     `spiralIndex(cols, rows) → number[]`).
   Grade 1×1 dá atraso 0 em todas (sem divisão por zero).
2. **Forma.** Cada célula: `border-radius: <pixelRadius>%`; nasce com `scale(pixelScale)
   rotate(pixelSpin deg)` e termina em `scale(1) rotate(0)`; opacidade 0 → 1 só se `fade`.
3. **Gap.** A grade usa `gap: <gap>px` (CSS grid). Com gap, o conteúdo aparece pelas frestas
   durante a transição; é o efeito desejado.
4. **onComplete.** Chamado uma vez ao fim da fase 2 com o estado ativo final.
5. Validação: `pixelScale` fora de 0..1, `gap < 0` ou `pixelRadius` fora de 0..50 lançam erro com
   o valor recebido e o intervalo esperado.

## Movimento reduzido

Igual ao atual (troca direta com fade). `onComplete` também é chamado.

## Testes mínimos (somam aos atuais, que continuam passando)

- `revealOrder` para cada ordem nova: `center` tem o menor atraso no meio; `edges` o maior;
  `left-to-right` cresce com a coluna; `bottom-to-top` decresce com a linha; `diagonal` 0 no canto
  superior esquerdo e 1 no oposto; `spiral` 0 no canto e 1 na última célula do percurso.
- `spiralIndex(3, 3)` é a permutação esperada (escrever no teste).
- Grade 1×1 não gera NaN.
- Célula com `border-radius`, `scale`/`rotate` iniciais e sem opacidade quando `fade={false}`.
- `onComplete` chamado uma vez com `true` ao revelar (timers falsos) e no movimento reduzido.
- Valores inválidos lançam erro com a mensagem pedida.
