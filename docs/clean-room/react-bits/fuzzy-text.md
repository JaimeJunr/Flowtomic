# Spec de comportamento: `fuzzy-text`

> **Proveniência (clean room).** Escrita em 05/10/2026 a partir da demo pública "Fuzzy Text" em
> `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.

## O que a pessoa vê

Um texto grande que "treme" como sinal de vídeo ruim. Cada linha horizontal fina do desenho é
deslocada um pouco para os lados, de forma aleatória, a cada quadro. Em repouso o tremor é leve;
com o ponteiro em cima, fica forte. Opcionalmente: um estouro de tremor no clique, ou picos
periódicos (modo glitch).

## API (`atoms/typography/fuzzy-text`)

```ts
type FuzzyTextProps = Omit<React.ComponentProps<"div">, "children"> & {
  children: string;
  baseIntensity?: number;                              // default 0.18 (0..1)
  hoverIntensity?: number;                             // default 0.4 (0..1)
  /** Deslocamento máximo de uma linha, em px. */
  rangePx?: number;                                    // default: 0,15 × tamanho da fonte (revisão 05/10/2026: px fixo deixava texto médio ilegível)
  /** Limite de quadros por segundo. */
  fps?: number;                                        // default 60
  direction?: "horizontal" | "vertical" | "both";      // default "horizontal"
  /** Quadros para a intensidade mudar suavemente entre estados. 0 = instantâneo. */
  easeFrames?: number;                                 // default 6
  hover?: boolean;                                     // default true
  clickBurst?: boolean;                                // default false
  glitch?: boolean;                                    // default false
  glitchIntervalMs?: number;                           // default 2000
  glitchDurationMs?: number;                           // default 200
};
```

Fonte (família, peso, tamanho) e cor vêm do CSS herdado pela raiz, lidos com `getComputedStyle`.

## Regras

1. **Desenho.**
   - O texto é desenhado num canvas fora da tela, no tamanho exato (medido com `measureText`,
     respeitando `devicePixelRatio`, limitado a 2).
   - Cada quadro copia esse canvas para o visível em faixas de 1px. Cada faixa é deslocada por
     `(random*2-1) * rangePx * intensidade`.
   - O canvas visível tem margem `rangePx` para nada ser cortado.
2. **Intensidade.**
   - O alvo é `baseIntensity`. Com hover, o alvo é `hoverIntensity`.
   - Com clique (`clickBurst`), fica em 1 por ~150ms.
   - Com glitch, fica em 1 por `glitchDurationMs` a cada `glitchIntervalMs`.
   - A intensidade atual caminha até o alvo em `easeFrames` quadros.
3. **Cor** = `color` computado da raiz (aceita token via CSS de quem usa).
4. **Loop** limitado a `fps`, parado fora da tela e com a aba escondida.
5. **Fallback.** Sem canvas 2D (jsdom ou erro), renderiza o texto puro.

## Movimento reduzido

Desenho estático, com intensidade 0, ou o texto puro.

## Acessibilidade

- O texto vai num `sr-only`, e o canvas fica em `aria-hidden`.
- No fallback, o texto é o próprio conteúdo.

## Marcação

- Raiz: `data-slot="fuzzy-text"`, `ref`, `cn`.
- Canvas: `data-slot="fuzzy-text-canvas"`.

## Testes mínimos

- No jsdom (sem contexto 2D), o fallback mostra o texto.
- Funções puras:
  - deslocamento de uma faixa (limites por intensidade e direção);
  - próxima intensidade com `easeFrames`;
  - alvo de intensidade por estado (base, hover, burst, glitch);
  - intervalo de quadro por `fps`.
- Com um contexto 2D fake injetado (classe nomeada `FakeCanvasContext`, via spy em
  `HTMLCanvasElement.prototype.getContext` com `mockRestore`), desenha `drawImage` por faixa.
- Movimento reduzido não agenda loop.
