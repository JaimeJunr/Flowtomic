# Spec de comportamento: `rotating-text`

> **Proveniência (clean room).** Escrita em 04/10/2026 a partir da demo pública "Rotating Text"
> em `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.

## O que a pessoa vê

Uma palavra (ou frase curta) que se troca sozinha de tempos em tempos, dentro de uma frase
fixa. Na troca, os caracteres da palavra atual sobem e somem um a um, e os da próxima sobem de
baixo um a um. A caixa em volta muda de largura suavemente, e o texto vizinho desliza junto,
sem pular.

## API (`atoms/typography/rotating-text`)

```ts
type RotatingTextProps = Omit<React.ComponentProps<"span">, "children"> & {
  words: string[];                                  // >= 1
  intervalMs?: number;                              // default 2000
  splitBy?: "character" | "word" | "none";          // default "character"
  staggerMs?: number;                               // default 25
  staggerFrom?: "first" | "last" | "center";        // default "first"
  loop?: boolean;                                   // default true
  /** Troca sozinha. false = só por `activeIndex` controlado. */
  auto?: boolean;                                   // default true
  activeIndex?: number;                             // controlado
  onIndexChange?: (index: number) => void;
};
```

## Regras

1. **Troca.**
   - A cada `intervalMs`, avança um índice.
   - Com `loop=false`, para na última palavra.
   - Com `activeIndex` controlado, o componente mostra esse índice e só *pede* a troca via
     `onIndexChange`.
2. **Animação de saída.** Cada pedaço sobe até ~-120% e some.
3. **Animação de entrada.** Cada pedaço vem de +100%, opacidade 0, até 0.
4. **Ordem.** A saída termina antes da entrada começar. O stagger segue `staggerFrom`.
5. **Recorte.** O que sai e entra é recortado (`overflow: hidden`) pela linha.
6. **Largura** animada com layout do motion, para o texto em volta acompanhar.
7. **Lista vazia** lança `Error` com o valor recebido e o formato esperado
   (`words: string[] com ao menos 1 item`).
8. **Fora da tela, sem trocas** (`useInView`), pra não gastar CPU.
9. **Aba escondida, sem trocas** (`document.visibilityState`).

## Movimento reduzido

Troca instantânea, sem animação de caracteres nem de largura. O `intervalMs` continua.

## Acessibilidade

- **Sem `aria-live`.** Uma troca a cada 2 s seria lida o tempo todo.
- A lista inteira vai num `sr-only` uma vez ("análises, relatórios ou alertas"), unida com
  vírgulas e "ou" antes do último item. O que anima fica em `aria-hidden`.
- **Pausa.** A animação para quando o ponteiro está sobre o texto e quando ele tem foco dentro
  (WCAG 2.2.2, conteúdo que se move sozinho).

## Marcação

- Raiz: `data-slot="rotating-text"`, `ref`, `cn`.
- Pedaço: `data-slot="rotating-text-segment"`.

## Testes mínimos

- Mostra a primeira palavra. Com fake timers, depois de `intervalMs` mostra a segunda, e
  `onIndexChange` é chamado.
- Com `loop=false`, para na última. Com `loop=true`, volta à primeira.
- `auto=false` não troca sozinho. `activeIndex` controlado define a palavra.
- O sr-only tem a lista completa formatada.
- `splitBy` define a quantidade de pedaços.
- `words=[]` lança erro com mensagem que inclui o valor recebido.
- Hover pausa a troca.
- Movimento reduzido: troca sem pedaços animados.
