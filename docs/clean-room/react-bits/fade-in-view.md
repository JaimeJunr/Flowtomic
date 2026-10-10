# Spec de comportamento: `fade-in-view`

> **Proveniência (clean room).** Escrita em 09/10/2026 a partir da demo pública "Fade Content" em
> `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.

## O que a pessoa vê

Um bloco de conteúdo que **aparece suavemente** quando entra na tela ao rolar: sai de transparente
(e opcionalmente desfocado) para nítido. Opcionalmente, depois de alguns segundos visível, ele
**some** de novo.

## Por que existe (uso no produto)

Revelar seções de landing e painéis longos sem pulo; avisos que somem sozinhos.

## API (`atoms/animation/fade-in-view`)

```ts
type FadeInViewProps = React.ComponentProps<"div"> & {
  /** Desfoque no início. */
  blur?: boolean;               // default false
  /** s */
  duration?: number;            // default 0.8
  /** s */
  delay?: number;               // default 0
  ease?: "linear" | "easeIn" | "easeOut" | "easeInOut"; // default "easeOut"
  /** Fração visível que dispara, 0..1. */
  threshold?: number;           // default 0.1
  initialOpacity?: number;      // default 0
  /** s depois de aparecer para sumir. 0 = não some. */
  disappearAfter?: number;      // default 0
  /** s */
  disappearDuration?: number;   // default 0.5
  disappearEase?: "linear" | "easeIn" | "easeOut" | "easeInOut"; // default "easeIn"
  /** Anima só na primeira vez que entra. */
  once?: boolean;               // default true
  onAppear?: () => void;
  onDisappear?: () => void;
};
```

## Regras

1. **Estrutura.** Um `motion.div` como raiz. Estados: `hidden` (`opacity: initialOpacity`,
   `filter: blur(10px)` se `blur`), `shown` (`opacity: 1`, `blur(0)`), `gone` (`opacity: 0`).
2. **Gatilho.** `useInView(ref, { amount: threshold, once })` do motion. Entrar → `shown` com
   `duration`, `delay`, `ease`. Sem `once`, sair da tela volta a `hidden`.
3. **Sumir.** Com `disappearAfter > 0`, um timer de `delay + duration + disappearAfter` s depois
   de aparecer leva a `gone` com `disappearDuration` e `disappearEase`; chama `onDisappear` no fim.
   O timer é limpo ao desmontar.
4. `onAppear` no fim da animação de entrada.
5. Função pura `fadeVariants(opts)` monta os três estados (testável).

## Movimento reduzido

Sem animação e sem desfoque: o conteúdo já nasce visível (`opacity: 1`). `disappearAfter`
continua valendo, mas a saída é instantânea.

## Acessibilidade

O conteúdo fica no DOM o tempo todo (só a opacidade muda); leitor de tela lê normal. Quando `gone`,
a raiz recebe `aria-hidden="true"` e `inert`, para não deixar foco em coisa invisível.

## Marcação

- Raiz: `data-slot="fade-in-view"`, `data-state="hidden|shown|gone"`, `ref`, `cn`, props nativas.

## Testes mínimos

- `fadeVariants`: com e sem `blur`, `initialOpacity`.
- Com um fake de IntersectionObserver nomeado (`FakeIntersectionObserver`) que permite disparar a
  entrada: começa `hidden`, entra → `shown`.
- `disappearAfter` com timers falsos → `gone`, `aria-hidden`, `onDisappear`.
- `once={false}`: sair volta a `hidden`.
- Movimento reduzido: nasce `shown`.
- `ref`, `className`, filhos.
