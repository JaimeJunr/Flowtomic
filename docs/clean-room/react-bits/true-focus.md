# Spec de comportamento: `true-focus`

> **Proveniência (clean room).** Escrita em 05/10/2026 a partir da demo pública "True Focus" em
> `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.

## O que a pessoa vê

Uma frase em que só uma palavra está nítida e as outras estão borradas. Uma moldura de quatro
cantos (como o foco de uma câmera) envolve a palavra nítida. A cada intervalo, o foco e a
moldura deslizam para a próxima palavra.

## API (`atoms/typography/true-focus`)

```ts
type TrueFocusProps = Omit<React.ComponentProps<"span">, "children"> & {
  sentence: string;
  /** Separador das palavras. */
  separator?: string;                        // default " "
  /** "auto" = avança sozinho; "hover" = o foco segue a palavra sob o ponteiro. */
  mode?: "auto" | "hover";                   // default "auto"
  blurPx?: number;                           // default 4
  /** Duração do deslize da moldura e da troca de nitidez, em ms. */
  transitionMs?: number;                     // default 450
  /** Tempo parado em cada palavra no modo auto, em ms. */
  holdMs?: number;                           // default 1200
};
```

## Regras

1. **Palavras.**
   - Separadas por `separator`, com espaço visual entre elas.
   - A palavra ativa tem `blur(0)`. As outras têm `blur(blurPx)`, com transição de
     `transitionMs`.
2. **Moldura.**
   - Quatro cantos em L, cor `border-primary`, 2–3px.
   - Ficam um pouco fora da caixa da palavra (~4px).
   - A posição e o tamanho animam até a caixa da palavra ativa, medida por
     `getBoundingClientRect` relativo à raiz.
3. **Modo `auto`.**
   - Avança a cada `holdMs + transitionMs`, em loop.
   - Pausa com hover ou foco dentro da raiz, e quando a raiz está fora da tela.
4. **Modo `hover`.**
   - A palavra sob o ponteiro vira a ativa.
   - Ao sair, mantém a última.
   - Cada palavra é focável por teclado (`tabIndex=0`), e o foco ativa a palavra.
5. **Frase vazia** lança `Error` com o valor recebido e o formato esperado.

## Movimento reduzido

Nenhuma palavra fica borrada e não há moldura. Fica só o texto.

## Acessibilidade

- O texto é lido normalmente, palavra por palavra, na ordem. O borrão é só visual.
- A moldura fica em `aria-hidden`.

## Marcação

- Raiz: `data-slot="true-focus"`, `data-active-index`, `ref`, `cn`.
- Palavra: `data-slot="true-focus-word"`. Moldura: `data-slot="true-focus-frame"`.

## Testes mínimos

- Renderiza N palavras, e a primeira é a ativa.
- Fake timers: a ativa avança e volta ao início.
- Hover na raiz pausa o modo auto.
- Modo hover: `pointerenter` e `focus` numa palavra a ativam.
- `separator=","` divide certo.
- Frase vazia lança erro.
- Movimento reduzido: sem blur e sem moldura.
