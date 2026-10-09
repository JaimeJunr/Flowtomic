# Spec de comportamento: `tool-call-chip`

> **Proveniência (clean room).** Escrita em 09/10/2026 a partir da demo pública "Call Chip" em
> `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.

## Decisão

Atom leve para uma chamada de ferramenta **em andamento**. O `tool-status-line` (molecule)
continua sendo a linha de resultado já registrado na resposta (decidido em 09/10/2026).

## O que a pessoa vê

Um chip "⌨ bash  npm test  0 ms". Enquanto roda, um **preenchimento** suave atravessa o chip da
esquerda para a direita e um contador de milissegundos sobe; o preenchimento desacelera e **para
em 90%** no tempo esperado (2,5 s), esperando a resposta. Ao concluir, completa até 100%, o chip
ganha uma **lavagem** verde e o ícone **rola** para fora dando lugar a um ✓. Em erro, o
preenchimento para onde estava, fica vermelho, o chip **chacoalha** e o ícone vira um ↻ (que
reexecuta, se houver `onRetry`).

## API (`atoms/feedback/tool-call-chip`)

```ts
type ToolCallStatus = "idle" | "running" | "done" | "error";
type ToolCallChipProps = Omit<React.ComponentProps<"div">, "children"> & {
  icon?: "terminal" | "file" | "search" | "edit" | React.ReactNode;  // lucide SquareTerminal / FileText / Search / Pencil
  name: string;                      // ex. "bash"
  argument?: string;                 // ex. "npm test"
  status?: ToolCallStatus;           // default "running"
  expectedMs?: number;               // default 2500 (chega a 90% nesse tempo)
  size?: "sm" | "default";           // 28 / 34 px
  showTimer?: boolean;               // default true
  shake?: number;                    // px, default 6; 0 só tinge
  onRetry?: () => void;              // com ele, o chip com erro vira botão
};
```

## Regras

1. **Progresso** (função pura `parkedProgress(elapsedMs, expectedMs)`): curva que desacelera e
   tende a 0.9 (ex. `0.9 * (1 - e^(-3t/expected))`), nunca passa de 0.9 enquanto `running`.
   `done` anima até 1 em 200 ms. `error` congela.
2. **Contador:** ms inteiros até 999, depois "1,2 s" (função pura `formatDuration(ms)`,
   `font-mono tabular-nums`).
3. **Cores (só tokens):** chip `bg-secondary text-secondary-foreground rounded-md border`,
   argumento em `font-mono text-muted-foreground`, preenchimento `bg-foreground/8`, concluído
   lavagem `bg-success/15` e ✓ `text-success`, erro preenchimento `bg-destructive/15` e ícone
   `text-destructive`.
4. **Ícone que rola:** troca de ícone com `y: 0 → -100%` saindo e o novo entrando de baixo.
5. **Erro:** `x: [0, -s, s, -s/2, s/2, 0]` em 400 ms. Com `onRetry`, a raiz é um `<button>`
   ("Reexecutar bash npm test"); sem, um `div`.
6. Tempo medido por rAF (ou `useFrameLoop`) só enquanto `running`.

## Movimento reduzido

Sem preenchimento animado (mostra só o contador), sem chacoalhar, troca de ícone direta.

## Acessibilidade

Texto `sr-only` com o estado: "bash npm test, em execução" / "concluído em 1,2 segundos" /
"falhou". Raiz `role="status"` quando não é botão.

## Marcação

Raiz `data-slot="tool-call-chip"`, `data-status`. Partes: `tool-call-chip-fill`,
`tool-call-chip-icon`, `tool-call-chip-timer`.

## Testes mínimos

- Puras: `parkedProgress` (0 → 0; em `expectedMs` ≈ 0.85–0.9; nunca > 0.9), `formatDuration`
  (850 → "850 ms"; 1234 → "1,2 s").
- Fake timers: contador sobe em `running`; `done` mostra ✓ e o sr-only "concluído…"; `error` com
  `onRetry` vira botão e chama `onRetry`; sem `onRetry` não é botão.
- `icon` por nome e custom. `showTimer=false`. Movimento reduzido. `ref`/`className`.
