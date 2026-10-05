# Spec de comportamento: `blur-text`

> **Proveniência (clean room).** Spec escrita em 04/10/2026 a partir da observação da demo
> pública em `reactbits.dev/text-animations/blur-text` (aba Preview e tabela de props). O código
> do React Bits **não foi lido**. Revisada em 04/10/2026 após review de UI/animação (curva,
> teto de atraso, desfoque em em, tipos do `ref`). A implementação sai só desta spec. Nomes, defaults e API são
> nossos.

## O que a pessoa vê

Um bloco de texto que aparece em sequência quando entra na tela. Cada pedaço (palavra ou
letra) começa invisível, borrado e um pouco deslocado na vertical. Depois desliza para o
lugar, fica nítido e opaco. Os pedaços entram um depois do outro, com um intervalo fixo entre
eles. Quando o último termina, o texto fica parado e legível, sem nenhum efeito residual.

## API

```ts
type BlurTextProps = Omit<React.ComponentProps<"p">, "children" | "ref"> & {
  ref?: React.Ref<HTMLElement>;
  /** Texto a animar. Só string: o componente precisa quebrar em pedaços. */
  text: string;
  /** Elemento raiz. */
  as?: "p" | "span" | "h1" | "h2" | "h3" | "h4";      // default "p"
  /** Unidade da animação. */
  splitBy?: "word" | "letter";                         // default "word"
  /** De onde o pedaço vem. */
  from?: "above" | "below";                            // default "above"
  /** Intervalo entre o início de um pedaço e o do próximo, em ms. */
  staggerMs?: number;                                  // default 80 em "word", 30 em "letter"
  /** Duração da entrada de cada pedaço, em ms. */
  durationMs?: number;                                 // default 500
  /** Anima só na primeira vez que entra na tela (true) ou toda vez (false). */
  once?: boolean;                                      // default true
  /** Margem do gatilho de visibilidade (sintaxe de rootMargin). */
  inViewMargin?: UseInViewOptions["margin"];           // default "0px"
  /** Chamado a cada entrada completa, quando o último pedaço termina de entrar. */
  onComplete?: () => void;
};
```

## Regras

1. **Estado inicial de cada pedaço:**
   - opacidade 0;
   - desfoque de 0,25em (proporcional à fonte: 10px num título de 40px, leve em texto corrido);
   - deslocamento vertical de ~0,5em (para cima se `from="above"`, para baixo se
     `from="below"`).

   **Estado final:** opacidade 1, desfoque 0, deslocamento 0. Curva ease-out forte,
   `cubic-bezier(0.23, 1, 0.32, 1)`.
2. **Disparo.** A animação começa quando a raiz entra no viewport. O mesmo vale com
   `once=false`: ao sair e voltar, ela recomeça.
3. **Pedaços.**
   - `word` quebra por espaço em branco e preserva os espaços entre as palavras.
   - `letter` anima letra por letra, mas **mantém cada palavra inteira na mesma linha**
     (a palavra não pode quebrar no meio).
   - Espaços múltiplos viram um espaço só.
4. **Atraso do pedaço `i`:** `min(i * staggerMs, 1000)` ms. O teto existe para que texto longo
   não passe segundos ilegível.
5. **`onComplete`** dispara uma vez por ciclo de entrada, quando o último pedaço termina (com
   `once=false`, a cada vez que volta à tela).
7. **Sem `will-change` permanente.** O motion já otimiza; camada fixa por letra custa memória
   de GPU.
8. **Trocar `text` com o componente montado reanima** (os pedaços remontam).
9. **Copiar o texto não duplica.** Os pedaços visíveis não são selecionáveis; a cópia vem da
   frase inteira.
6. **Cor, fonte e tamanho são herdados.** O componente não define cor nenhuma. Só token, via
   `className` de quem usa.

## Movimento reduzido

Com `useShouldReduceMotion()` (de `@/lib/use-should-reduce-motion`) verdadeiro, o texto aparece
pronto:
- sem desfoque, sem deslocamento e sem animação;
- renderizado como texto simples dentro da raiz, sem os pedaços;
- `onComplete` é chamado uma vez no mount.

## Acessibilidade

- O leitor de tela lê a frase inteira uma vez só, nunca palavra por palavra.
- Os pedaços animados ficam num wrapper `aria-hidden="true"`, e a frase inteira vai num `<span
  className="sr-only">` irmão.
- Com movimento reduzido não há duplicação: só o texto simples.

## Marcação

- A raiz tem `data-slot="blur-text"` e recebe `ref`, `className` (via `cn`) e o resto das
  props nativas.
- Cada pedaço tem `data-slot="blur-text-segment"` e `display: inline-block`.
- Com `splitBy="letter"`, cada palavra é um `inline-block` com `white-space: nowrap`.

## Casos de teste mínimos

- Renderiza a frase acessível uma vez (`getByText` na sr-only) e N pedaços `aria-hidden`.
- `splitBy="word"` → 4 pedaços para "Seu painel atualiza sozinho". `splitBy="letter"` → um
  pedaço por caractere não-espaço.
- `as="h2"` renderiza um `<h2>`, e o `ref` aponta para o elemento raiz.
- `as="h1"` expõe heading nível 1 com nome acessível igual à frase inteira.
- Atraso tem teto de 1000 ms; default de stagger muda com `splitBy`.
- Com movimento reduzido: texto simples, nenhum `[data-slot="blur-text-segment"]`, e
  `onComplete` chamado.
- `onComplete` chamado uma vez após a animação, com `MotionGlobalConfig.skipAnimations`.
- `className` é mesclado na raiz.
