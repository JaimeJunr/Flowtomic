# Spec de comportamento: `stepper`

> **Proveniência (clean room).** Escrita em 10/10/2026 a partir da demo pública "Stepper" em
> `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.

## O que a pessoa vê

Um cartão de **assistente em passos**. No topo, círculos numerados ligados por linhas: os
passos feitos ficam cheios com um **check**, o atual fica destacado com um ponto, os futuros
ficam vazios com o número. A linha entre dois passos **se preenche** ao avançar. O conteúdo do
passo **desliza** para o lado (para a esquerda ao avançar, para a direita ao voltar) e a altura
do cartão **se ajusta suavemente** ao conteúdo novo. No rodapé, "Voltar" e "Continuar"; no
último passo, "Concluir". Concluído, mostra o estado final.

## Por que existe (uso no produto)

Onboarding de cliente, abertura de conta, cadastro de carteira em etapas.

## API (`molecules/navigation/stepper`)

```ts
type StepperProps = Omit<React.ComponentProps<"div">, "onChange"> & {
  /** Um nó por passo. */
  steps: React.ReactNode[];
  /** Rótulo curto de cada passo (leitor de tela e title do círculo). */
  labels: string[];
  initialStep?: number;              // 1-based, default 1
  onStepChange?: (step: number) => void;
  onComplete?: () => void;
  backLabel?: string;                // default "Voltar"
  nextLabel?: string;                // default "Continuar"
  completeLabel?: string;            // default "Concluir"
  /** Impede clicar nos círculos para pular. */
  disableIndicatorNavigation?: boolean; // default false
  /** Conteúdo depois de concluir. */
  completedContent?: React.ReactNode;
};
```

## Regras

1. **Estado.** `step` (1..n) e `direction` (1 avança, -1 volta). `n + 1` = concluído. Puras:
   `indicatorStatus(index, step)` → `"complete" | "active" | "upcoming"`;
   `nextStep(step, n)`, `prevStep(step)` (limitadas).
2. **Indicadores.** Linha `flex items-center` de círculos `size-8 rounded-full grid
   place-items-center text-sm font-medium` com transição de cor: `upcoming` `bg-muted
   text-muted-foreground`, `active` `bg-primary text-primary-foreground` com um ponto
   `size-3 rounded-full bg-primary-foreground` no lugar do número, `complete` `bg-primary
   text-primary-foreground` com `Check` do lucide desenhado por `pathLength` (motion). Entre
   círculos, conector `relative h-0.5 flex-1 mx-2 rounded bg-muted` com preenchimento
   `bg-primary` animando `width` 0→100% quando o passo da esquerda fica completo.
   Clique num círculo vai àquele passo (se permitido); o círculo é `<button>` com
   `aria-label="Passo i: <label>"` e `aria-current="step"` no ativo.
3. **Conteúdo.** `AnimatePresence` com `custom={direction}`: entra de `x: direction·100%`
   (opacidade 0) e sai para `x: -direction·100%`. A altura do contêiner é animada para a
   altura medida do conteúdo novo (ResizeObserver no filho, `animate` da altura), com
   `overflow-hidden`.
4. **Rodapé.** "Voltar" (`variant="ghost"`) escondido no passo 1 (`invisible`, mantendo o
   espaço); "Continuar"/"Concluir" (`Button`). Concluir chama `onComplete` e mostra
   `completedContent`.
5. `onStepChange` em toda mudança, inclusive pelos círculos.

## Movimento reduzido

Sem deslize nem animação de altura e de check: troca direta.

## Acessibilidade

Raiz `role="group"` `aria-label="Etapas"`. Indicadores numa `<ol>`. A região de conteúdo tem
`tabIndex=-1` e recebe o foco ao trocar de passo, para o leitor de tela anunciar o conteúdo novo.

## Marcação

- Raiz: `data-slot="stepper"`, `data-step`, `ref`, `cn`.
- Partes: `stepper-indicator` (com `data-status`), `stepper-connector`, `stepper-content`,
  `stepper-footer`.

## Testes mínimos

- `indicatorStatus`, `nextStep`, `prevStep` (limites).
- `steps.length !== labels.length` ou vazio lança erro com os tamanhos.
- Continuar avança, chama `onStepChange`; Voltar volta; Voltar invisível no passo 1.
- Último passo mostra "Concluir"; clicar chama `onComplete` e mostra `completedContent`.
- Clique no círculo pula; `disableIndicatorNavigation` impede.
- `aria-current="step"` no ativo; `data-status` corretos.
- Movimento reduzido; `ref` e `className`.
