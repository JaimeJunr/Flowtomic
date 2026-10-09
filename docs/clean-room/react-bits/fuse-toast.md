# Spec de comportamento: `fuse-toast`

> **Proveniência (clean room).** Escrita em 09/10/2026 a partir da demo pública "Swipe Toast" em
> `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.

## O que a pessoa vê

Um aviso no canto inferior direito ("Arquivo arquivado · Movido para Arquivo · [Desfazer]"). Ele
sobe deslizando. Uma linha fina (o **pavio**) queima na borda de baixo durante 4 s; quando acaba,
o aviso desce e some. Passar o mouse pausa o pavio. Dá para **arrastar para o lado** para
dispensar: um arraste lento precisa passar de 40 px; um peteleco sempre dispensa; soltar antes
volta com um pequeno balanço. O botão de ação é invertido (fundo escuro). Escape fecha.

## API (`atoms/feedback/fuse-toast`)

```ts
type FuseToastCloseReason = "timeout" | "swipe" | "action" | "close" | "escape" | "programmatic";
type FuseToastProps = Omit<React.ComponentProps<"div">, "title"> & {
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  actionLabel?: React.ReactNode;
  onAction?: () => void;
  open?: boolean;                    // default true
  onClose?: (reason: FuseToastCloseReason) => void;
  slideMs?: number;                  // default 400
  settleBounce?: number;             // default 0.2
  swipeDistance?: number;            // default 40
  durationMs?: number;               // default 4000; 0 = até dispensar
  fuse?: "bottom" | "top" | "none";  // default "bottom"
  pauseOnHover?: boolean;            // default true
  closeButton?: boolean;             // default false
  /** No fluxo do pai em vez de fixo no canto da tela. */
  inline?: boolean;                  // default false
  dismissible?: boolean;             // default true
};
```

## Regras

1. Componente individual (não um gerenciador de fila; o projeto já tem `sonner` para isso — citar
   no JSDoc). Fixo: `fixed bottom-4 right-4 z-50` via portal em `document.body`; inline: no fluxo.
2. **Cores (só tokens):** `bg-popover text-popover-foreground border shadow-lg rounded-lg`,
   descrição `text-muted-foreground`, ação `bg-foreground text-background` (invertido), pavio
   `bg-primary` 2 px.
3. **Entrada/saída:** `y: 100% → 0` com opacidade em `slideMs`; saída inversa; depois da saída
   (e, inline, depois de a altura colapsar) chama `onClose(reason)`. `open` false → sai com
   `programmatic`; true de novo → entra e rearma.
4. **Pavio:** `scaleX 1 → 0` com `origin-left` (a ponta acesa recua da direita para a esquerda) em
   `durationMs`, pausável. Tempo restante guardado para retomar. `fuse="none"`: timer sem linha.
   Mudar `durationMs` rearma.
5. **Arrastar:** só horizontal (`drag="x"` do motion ou pointer próprio). Soltar: dispensa se
   `|dx| > swipeDistance` ou `|vx| > 500 px/s` (função pura `shouldDismiss(dx, vx, distance)`),
   saindo para o lado do arraste; senão volta com mola (`settleBounce`). Durante o arraste o pavio
   pausa. Opacidade cai com `|dx|`.
6. **Ação:** chama `onAction` e fecha com `action`. **Fechar (X):** `close`. **Escape:** `escape`
   (só com foco dentro do toast ou se ele for o último aberto — usar listener no documento
   enquanto aberto).
7. `dismissible=false`: sem arraste e sem Escape.

## Movimento reduzido

Entrada/saída por fade; arraste continua mas sem mola; pavio continua (é informação de tempo).

## Acessibilidade

`role="status"` com `aria-live="polite"`, porque o aviso é informativo, não um alerta. A ação é um
`<button>`. O X tem `aria-label="Fechar"`.

## Marcação

Raiz `data-slot="fuse-toast"`, `data-state="open"|"closed"`. Partes: `fuse-toast-fuse`,
`fuse-toast-action`.

## Testes mínimos

- Puras: `shouldDismiss` (lento curto não; lento longo sim; peteleco sim), `fuseRemaining`
  (ou equivalente) com pausa.
- Fake timers: fecha sozinho em `durationMs` com `onClose("timeout")`; `durationMs=0` não fecha.
- Hover pausa (passar mais que a duração com hover não fecha; sair retoma).
- Ação chama `onAction` e `onClose("action")`. X com `closeButton` → `close`. Escape → `escape`;
  com `dismissible=false` não fecha.
- `open=false` → `onClose("programmatic")`. `inline` renderiza no fluxo (sem portal).
- `role="status"`. Movimento reduzido. `ref`/`className`.
