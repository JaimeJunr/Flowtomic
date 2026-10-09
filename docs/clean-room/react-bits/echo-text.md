# Spec de comportamento: `echo-text`

> **Proveniência (clean room).** Escrita em 05/10/2026 a partir da demo pública "Echo Text" em
> `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.

## O que a pessoa vê

Um texto nítido com vários "ecos" fantasmas atrás, cada um mais transparente e mais borrado. Na
entrada, os ecos chegam espalhados de um lado e se juntam atrás do texto, como um rastro que se
recolhe. Com o ponteiro perto, o texto "escorre": os ecos se deslocam para longe do ponteiro, e
os mais fundos demoram mais a acompanhar.

## API (`atoms/typography/echo-text`)

```ts
type EchoTextProps = Omit<React.ComponentProps<"div">, "children"> & {
  text: string;
  echoes?: number;                                               // default 10 (máx. 24)
  /** 0..1: quão devagar os ecos fundos perseguem o alvo. */
  lag?: number;                                                  // default 0.24
  /** Deslocamento máximo, em px (entrada e ponteiro). */
  offsetPx?: number;                                             // default 32
  direction?: "right" | "left" | "up" | "down" | "diagonal";     // default "right"
  /** Multiplicador de opacidade de um eco para o próximo. */
  fade?: number;                                                 // default 0.72
  /** Desfoque máximo do eco mais fundo, em px. */
  blurPx?: number;                                               // default 3
  /** Cor dos ecos; false = mesma cor do texto. */
  tint?: string | false;                                         // default "var(--primary)"
  mode?: "entrance" | "pointer" | "both";                        // default "both"
  /** Distância em que o ponteiro puxa o deslocamento máximo. */
  pointerRadiusPx?: number;                                      // default 320
  durationMs?: number;                                           // default 900 (entrada)
};
```

## Regras

1. **Camadas.**
   - A frente é o texto real, com a cor herdada.
   - Os ecos `i = 1..echoes` ficam atrás, `aria-hidden`.
   - Opacidade `fade^i`. Desfoque `blurPx * i/echoes`. Cor `tint`, ou `currentColor`.
2. **Entrada.**
   - Ao ficar visível pela primeira vez, cada eco começa deslocado `offsetPx * (i/echoes)` no
     sentido de `direction` e converge para 0 em `durationMs`, com ease-out.
   - Ecos fundos atrasam proporcionalmente a `lag`.
3. **Ponteiro.**
   - O alvo é o vetor do ponteiro até o centro, normalizado por `pointerRadiusPx` e limitado a
     1, multiplicado por `-offsetPx`. Os ecos fogem do ponteiro.
   - O eco `i` persegue o alvo do eco `i-1` com fator `1 - lag`, a cada quadro, em cadeia.
   - Ao sair, o alvo volta a 0.
4. **Loop** de `requestAnimationFrame` só enquanto houver movimento (parado = sem loop) e com
   a área visível.
5. **`echoes`** é limitado a 0..24. Texto vazio lança erro.

## Movimento reduzido

Só a frente. Sem ecos.

## Acessibilidade

O texto da frente é lido uma vez. Os ecos ficam em `aria-hidden`.

## Marcação

- Raiz: `data-slot="echo-text"`, `ref`, `cn`.
- Eco: `data-slot="echo-text-echo"`.

## Testes mínimos

- N ecos com opacidade e desfoque corretos. Testar a função pura de estilo do eco `i`.
- Função pura do vetor inicial por `direction`.
- Função pura do alvo pelo ponteiro (dentro e fora do raio).
- Função pura do passo da cadeia com `lag`.
- `tint=false` usa `currentColor`.
- Movimento reduzido: sem ecos.
- Texto vazio lança erro.
