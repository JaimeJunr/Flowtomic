# Spec de comportamento: `task-status-mark`

> **Proveniência (clean room).** Escrita em 09/10/2026 a partir da demo pública "Status Mark" em
> `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.

## O que a pessoa vê

Um ícone pequeno ao lado de um rótulo de tarefa ("Em andamento: rascunhar e-mails aos
fornecedores"). O ícone **muda de forma no lugar** conforme o estado:
- **pendente:** anel tracejado (8 traços);
- **rodando:** os traços se fundem num arco que gira (indeterminado) ou cresce até a fração do
  progresso (determinado);
- **feito:** anel fecha, fundo levemente lavado, ✓ desenhado; o rótulo **é riscado** e fica apagado;
- **falhou:** anel e ✕ na cor de erro;
- **cancelado:** ✕ fino na cor do texto, rótulo apagado.

## API (`atoms/feedback/task-status-mark`)

```ts
type TaskStatus = "pending" | "running" | "done" | "failed" | "cancelled";
type TaskStatusMarkProps = Omit<React.ComponentProps<"span">, "children"> & {
  status?: TaskStatus;               // default "pending"
  /** 0..1 rodando; ausente = indeterminado. */
  progress?: number;
  label?: React.ReactNode;
  size?: "sm" | "default" | "lg";    // ícone 16 / 20 / 24, texto text-xs / text-sm / text-base
  dashes?: number;                   // default 8
  spinMs?: number;                   // default 1100
  arcLength?: number;                // default 0.68
  drawMs?: number;                   // default 240
  strike?: boolean;                  // default true
  strikeDelayMs?: number;            // default 60
};
```

## Regras

1. **SVG 24×24**, `circle` com raio fixo por atributo e `pathLength=100` (nunca geometria por
   CSS: o Chrome ignora `pathLength` nesse caso). Traços: `strokeDasharray` gerado por função pura
   `dashPattern(dashes)` (`"8.5 4"`-like somando 100). Arco determinado:
   `strokeDasharray = "${p*100} 100"`. Indeterminado: arco `arcLength*100` girando
   (`rotate` contínuo, `spinMs` por volta). A troca pendente→rodando anima o dasharray.
2. **Cores (só tokens):** traço e rótulo `currentColor` (herda), feito `text-success`, falhou
   `text-destructive`; lavagem interna `fill-current` com opacidade 0.08.
3. **✓ e ✕:** `path` com `pathLength=1`, `strokeDashoffset 1 → 0` em `drawMs`.
4. **Rótulo:** em feito, risco (barra `h-px bg-current` com `scaleX 0 → 1`, origem à esquerda,
   começando `strikeDelayMs` depois do ✓) e `opacity-60`; cancelado só `opacity-60`.
5. Função pura `markShape(status, progress)` → `"dashes" | "arc" | "spinner" | "check" | "cross"`.

## Movimento reduzido

Sem giro (o indeterminado vira um arco parado), sem desenho
progressivo: formas aparecem prontas. Risco aparece sem animar.

## Acessibilidade

Sem `role="status"` na raiz, porque uma lista pode ter dezenas de marcas. Use texto `sr-only` com o
estado ("concluída", "em andamento, 62%", "falhou", "cancelada", "pendente") ao lado do rótulo; o
SVG é `aria-hidden`. Com `progress`, o texto inclui o percentual arredondado.

## Marcação

Raiz `data-slot="task-status-mark"`, `data-status`. Partes: `task-status-mark-icon`,
`task-status-mark-label`, `task-status-mark-strike`.

## Testes mínimos

- Puras: `dashPattern` (soma 100, n traços), `markShape` para cada status e com/sem progresso.
- Cada status renderiza a forma certa (`data-shape`) e o texto `sr-only` certo.
- `progress=0.62` → "62%" no sr-only e dasharray "62 100".
- `done` com `strike` mostra o risco; `strike=false` não.
- Movimento reduzido: indeterminado sem animação de giro (classe/atributo). `ref`/`className`.
