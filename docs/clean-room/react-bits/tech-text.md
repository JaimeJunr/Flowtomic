# Spec de comportamento: `tech-text`

> **Proveniência (clean room).** Escrita em 05/10/2026 a partir da demo pública "Tech Text" em
> `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.

## O que a pessoa vê

Um logotipo de texto grande e sólido. Onde o ponteiro passa, as letras viram só contorno
tracejado, como numa ferramenta de design vetorial. Uma moldura de seleção desliza até a letra
sob o ponteiro, com uma etiqueta pequena ("R · 150px"). Dá para arrastar uma letra para fora da
linha; ao soltar, ela volta com mola. Sem ponteiro, uma "varredura" passa sozinha pela palavra.

## API (`atoms/typography/tech-text`)

```ts
type TechTextProps = Omit<React.ComponentProps<"div">, "children"> & {
  text: string;
  /** Maior tamanho, em px. Encolhe para caber no container. */
  maxFontSizePx?: number;                // default 150
  /** Espaço extra entre letras, em em. */
  letterSpacingEm?: number;              // default -0.04
  /** Cor da moldura, conector e etiquetas. */
  accentColor?: string;                  // default "var(--primary)"
  /** "area" = círculo em volta do ponteiro; "letter" = só a letra ativa; "off" = sempre sólido. */
  reveal?: "area" | "letter" | "off";    // default "letter"
  /** Raio do modo área, em px. */
  reachPx?: number;                      // default 200
  /** 0 = borda dura; 1 = transição longa entre preenchido e contorno. */
  softness?: number;                     // default 0.7
  lineStyle?: "dashed" | "solid";        // default "dashed"
  dashPx?: number;                       // default 4
  gapPx?: number;                        // default 2
  strokeWidthPx?: number;                // default 1.5
  /** Quadradinhos piscando em volta da letra ativa. 0 = desliga. */
  specks?: number;                       // default 8
  selection?: boolean;                   // default true
  labels?: boolean;                      // default true
  draggable?: boolean;                   // default true
  /** Varredura automática sem ponteiro. */
  sweep?: boolean;                       // default true
  sweepSpeed?: number;                   // default 1
};
```

Fonte, peso e cor das letras vêm do CSS herdado.

## Regras

1. **Letras.**
   - Cada letra é um `<text>` SVG posicionado pela medida real de cada caractere. Meça com
     spans ocultos ou `measureText`; no jsdom, use um fallback.
   - A letra tem preenchimento `currentColor` com opacidade variável e contorno
     `stroke=currentColor`, com `stroke-dasharray` pelo `lineStyle`.
2. **Tamanho.** A fonte é `min(maxFontSizePx, o que faz a palavra caber na largura)`,
   recalculada no resize.
3. **Reveal.**
   - `area`: a opacidade do preenchimento de cada letra cai com a proximidade do ponteiro
     dentro de `reachPx`, suavizada por `softness`.
   - `letter`: só a letra ativa fica em contorno.
   - `off`: tudo sólido.
4. **Letra ativa.** É a letra sob o ponteiro, ou a mais próxima no eixo x.
5. **Moldura.** Retângulo fino na `accentColor` em volta da letra ativa, deslizando com mola.
   A etiqueta mostra `letra · tamanho em px`; durante o arrasto, mostra `dx, dy`.
6. **Specks.** N quadradinhos 2px em posições pseudoaleatórias com semente por letra, piscando
   em ciclos.
7. **Arrasto.** Com ponteiro pressionado sobre uma letra, ela segue o ponteiro. Ao soltar,
   volta com mola.
8. **Varredura.** Sem ponteiro por ~1,5s, a letra ativa percorre a palavra da esquerda para a
   direita em loop (velocidade ∝ `sweepSpeed`). Para ao voltar o ponteiro, e fora da tela.
9. **Texto vazio** lança erro.

## Movimento reduzido

- Sem varredura, sem specks piscando e sem molas: as posições são instantâneas.
- O reveal por ponteiro continua (é resposta direta à ação da pessoa).

## Acessibilidade

- A raiz tem `role="img"` e `aria-label={text}`.
- O SVG e as etiquetas ficam em `aria-hidden`.

## Marcação

- Raiz: `data-slot="tech-text"`, `ref`, `cn`.
- Letra: `data-slot="tech-text-letter"`.
- Moldura: `data-slot="tech-text-selection"`.

## Testes mínimos

- N letras, `role="img"` com o nome acessível.
- Funções puras:
  - tamanho de fonte que cabe (largura medida × `maxFontSizePx`);
  - opacidade do modo área (centro = 0, fora do raio = 1, `softness` 0 = degrau);
  - índice da letra mais próxima;
  - posições de specks com semente reprodutível;
  - texto da etiqueta.
- `reveal="off"` deixa todas sólidas.
- Arrasto muda a etiqueta para `dx, dy`, e o pointerup reseta.
- Movimento reduzido: sem varredura (estado exposto).
