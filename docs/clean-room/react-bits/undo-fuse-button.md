# Spec de comportamento: `undo-fuse-button`

> **Proveniência (clean room).** Escrita em 09/10/2026 a partir da demo pública "Fuse Button" em
> `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.

## O que a pessoa vê

Um botão-pílula "Arquivar" com ícone. Ao clicar, a ação é feita **na hora**, e o botão vira
"Desfazer": um **pavio aceso** (linha fina na cor de destaque) percorre a borda da pílula no
sentido horário, sumindo à medida que queima, durante a janela de desfazer (4 s). Clicar na pílula
nesse tempo desfaz. Quando o pavio acaba, o botão volta a "Arquivar" (ou fica em "Arquivado ✓").
Passar o mouse por cima pausa o pavio.

## API (`atoms/actions/undo-fuse-button`)

```ts
type UndoFusePhase = "idle" | "armed" | "settled";
type UndoFuseButtonProps = Omit<React.ComponentProps<"button">, "children" | "onClick"> & {
  label?: string;                    // default "Arquivar"
  undoLabel?: string;                // default "Desfazer"
  doneLabel?: string;                // default "Arquivado"
  icon?: React.ReactNode;            // default lucide Archive
  size?: "sm" | "default" | "lg";    // 32 / 40 / 48 px (alturas do Button)
  undoWindowMs?: number;             // default 4000
  fuse?: "outline" | "bottom" | "top"; // default "outline"
  /** Quando `onCommit` dispara: no clique (desfazer reverte) ou só quando o pavio acaba. */
  commitOn?: "press" | "fuseEnd";    // default "press"
  pauseOnHover?: boolean;            // default true
  /** Depois do pavio: volta ao início ou fica em "feito". */
  settle?: "reset" | "stay";         // default "reset"
  onCommit?: (reason: "press" | "fuseEnd") => void;
  onUndo?: () => void;
  onFuseEnd?: () => void;
  onPhaseChange?: (phase: UndoFusePhase) => void;
};
```

## Regras

1. Um `<button>` só, que muda de papel por fase (`data-phase`).
2. **Cores (só tokens):** pílula `bg-secondary text-secondary-foreground`, pavio `stroke-primary`
   (ou `bg-primary` nas linhas), `rounded-full`.
3. **Pavio `outline`:** SVG `rect` com `rx` da pílula, `pathLength=1`,
   `strokeDasharray=1`, `strokeDashoffset` de 0 → 1 em `undoWindowMs`, linear, começando no topo
   central. `bottom`/`top`: barra `scaleX` 1 → 0 com origem à direita. O tempo restante é a
   fonte da verdade (rAF), para poder pausar e retomar. Função pura
   `fuseRemaining(elapsedMs, windowMs)` em 0..1.
4. **Fluxo:**
   - idle → clique: `commitOn="press"` chama `onCommit("press")`; vai para `armed`.
   - armed → clique ou `Escape`: chama `onUndo` e volta a `idle`. Com `commitOn="fuseEnd"`
     nada foi feito ainda, então desfazer só cancela (`onUndo` é chamado igual).
   - armed → pavio acaba: `onFuseEnd`; com `commitOn="fuseEnd"`, chama `onCommit("fuseEnd")`;
     `settle="reset"` → `idle`, `"stay"` → `settled` (rótulo `doneLabel` com ✓, `disabled`).
   - Reducer puro `fuseReducer(state, event)` com eventos `press | undo | end`.
5. **Pausa no hover:** só ponteiro de mouse (`pointerType === "mouse"`), e só depois de o
   ponteiro sair e voltar (o hover do próprio clique não pausa).
6. **Largura fixa:** os rótulos das fases ficam empilhados na mesma célula de grid (como o
   `hold-button`).
7. **Troca de rótulo:** fade + blur leve em 200 ms após clique por ponteiro; por teclado, troca seca.
8. **Disabled:** desabilita só a fase `idle`; em `armed` o desfazer continua disponível.

## Movimento reduzido

O pavio continua (é a informação de tempo), mas sem blur na troca de rótulo.

## Acessibilidade

`aria-live="polite"` anuncia "Arquivado. Desfazer disponível por 4 segundos." ao armar e
"Desfeito" ao desfazer. O nome acessível segue o rótulo visível da fase.

## Marcação

Raiz: `data-slot="undo-fuse-button"`, `data-phase`. Pavio: `undo-fuse-button-fuse`.

## Testes mínimos

- Puras: `fuseRemaining` (0, metade, fim, limites), `fuseReducer` (todas as transições).
- Fake timers + rAF: clique chama `onCommit("press")` e mostra "Desfazer"; clique de novo chama
  `onUndo` e volta; esperar a janela chama `onFuseEnd` e volta a idle.
- `commitOn="fuseEnd"`: `onCommit` só no fim; desfazer antes não chama `onCommit`.
- `settle="stay"`: fica em "Arquivado" e desabilitado.
- Escape desfaz. Disabled ignora o clique em idle.
- `onPhaseChange` em cada fase. `fuse="bottom"` renderiza barra. `ref`/`className`.
