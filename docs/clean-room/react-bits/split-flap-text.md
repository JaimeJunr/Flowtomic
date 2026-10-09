# Spec de comportamento: `split-flap-text`

> **Proveniência (clean room).** Escrita em 05/10/2026 a partir da demo pública "Split Flap
> Text" em `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi
> lido**.

## O que a pessoa vê

Um painel de aeroporto antigo. Uma fileira de plaquinhas escuras, uma letra em cada. Quando a
frase muda, as plaquinhas viram (a metade de cima dobra para baixo), passando rápido por letras
aleatórias até parar na letra certa, uma plaquinha atrás da outra, da esquerda para a direita.

## API (`atoms/typography/split-flap-text`)

```ts
type SplitFlapTextProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** Frases que se alternam. */
  words?: string[];
  /** Frase única (tem prioridade sobre `words`). */
  text?: string;
  flipMs?: number;                                         // default 120 (uma virada)
  staggerMs?: number;                                      // default 60 (entre plaquinhas)
  holdMs?: number;                                         // default 2400 (parado em cada frase)
  charset?: "alpha" | "alphanumeric" | "numeric" | string; // default "alphanumeric"
  /** Quantas letras intermediárias cada plaquinha mostra antes da final. */
  flipsPerChar?: number;                                   // default 6
  /** Quantidade fixa de plaquinhas. Default: o tamanho da maior frase. */
  padTo?: number;
  loop?: boolean;                                          // default true
};
```

## Regras

1. **Texto.**
   - Em maiúsculas. Frases menores que `padTo` são completadas com espaços à direita.
   - Plaquinha de espaço fica vazia, mas existe (a largura do painel não muda).
2. **Troca.**
   - Só as plaquinhas cuja letra muda viram.
   - A plaquinha `i` começa após `i * staggerMs`.
   - Mostra `flipsPerChar` letras do charset em sequência e termina na letra certa.
   - Cada virada é uma dobra da metade de cima em `rotateX`, de 0 a -90°, com troca de letra
     no meio, durante `flipMs`.
3. **Ciclo.**
   - Com `words`, fica `holdMs` em cada frase e passa para a próxima.
   - `loop=false` para na última frase.
   - Com `text`, mostra a frase com a animação de entrada uma vez.
4. **Pausa** com hover ou foco dentro, e fora da tela.
5. **Visual.**
   - O painel é escuro nos dois temas. Use a classe `dark` no próprio root (ver Armadilhas do
     CLAUDE.md) e tokens `bg-card`, `text-card-foreground`, `border-border`.
   - Cada plaquinha tem uma linha fina horizontal no meio (a dobradiça).
   - Letras em `font-mono`.
6. **Sem frase** (nem `text` nem `words` com item) lança `Error` com o valor recebido e o
   formato esperado.

## Movimento reduzido

Troca instantânea da frase, sem viradas. O ciclo de `holdMs` continua.

## Acessibilidade

- A frase atual vai num `sr-only`, sem `aria-live`.
- As plaquinhas ficam em `aria-hidden`.

## Marcação

- Raiz: `data-slot="split-flap-text"`, `ref`, `cn`.
- Plaquinha: `data-slot="split-flap-tile"`.

## Testes mínimos

- `padTo` e o maior tamanho definem o número de plaquinhas. Minúsculas viram maiúsculas.
- A função pura de sequência de letras tem tamanho `flipsPerChar + 1` e termina na letra-alvo,
  e as intermediárias pertencem ao charset.
- Só as plaquinhas que mudam recebem sequência nova.
- Fake timers: troca de frase após `holdMs`. `loop=false` para na última.
- O sr-only mostra a frase atual.
- Hover pausa.
- Sem frase lança erro.
- Movimento reduzido: troca direta.
- A raiz tem a classe `dark`.
