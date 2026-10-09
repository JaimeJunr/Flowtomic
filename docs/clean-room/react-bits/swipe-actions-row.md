# Spec de comportamento: `swipe-actions-row`

> **Proveniência (clean room).** Escrita em 09/10/2026 a partir da demo pública "Swipe Row" em
> `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.

## O que a pessoa vê

Uma linha de lista ("Notas da revisão de design · editado há 2 min · 9:41"). Arrastar para a
esquerda revela uma **gaveta** de ações atrás (Arquivar, Excluir). Soltar com a gaveta mais da
metade aberta deixa aberta; senão fecha. Continuar puxando além da gaveta (passando de 60% da
largura) faz o bloco da ação principal **saltar** e preencher a linha toda; soltar aí executa a
ação principal e a linha **dobra** (altura → 0) e some. Passando do limite, a linha resiste como
borracha.

## API (`molecules/data-display/swipe-actions-row`)

```ts
type SwipeAction = {
  id: string;
  label: string;
  icon?: React.ReactNode;
  /** Ações secundárias usam o tom neutro; a primeira (principal) usa destrutivo. */
  tone?: "destructive" | "neutral" | "primary";
  /** Dobra a linha ao ser pressionada. A principal sempre dobra. */
  dismiss?: boolean;
  onSelect?: () => void;
};
type SwipeActionsRowProps = Omit<React.ComponentProps<"div">, "children"> & {
  children: React.ReactNode;
  actions: SwipeAction[];             // a primeira é a do swipe completo
  direction?: "left" | "right";       // default "left"
  actionWidth?: number;               // default 80
  snapBounce?: number;                // default 0.2
  resistance?: number;                // default 0.55
  collapseMs?: number;                // default 200
  commitAt?: number;                  // fração da largura, default 0.6
  fullSwipe?: boolean;                // default true
  open?: boolean; onOpenChange?: (open: boolean) => void;
  onAction?: (action: SwipeAction) => void;
  /** Depois que a linha dobrou. Remova o item aqui. */
  onCommit?: (action: SwipeAction) => void;
  closeOnAction?: boolean;            // default true
  disabled?: boolean;
  label?: string;                     // nome acessível, default "Item da lista"
};
```

## Regras

1. **Camadas:** gaveta atrás (`absolute inset-y-0` no lado da direção), superfície da linha na
   frente (`relative`, arrastável só no eixo X, `touch-action: pan-y`).
2. **Cores (só tokens):** superfície `bg-card`, gaveta `bg-muted`, ação `destructive` →
   `bg-destructive text-destructive-foreground`, `neutral` → `bg-secondary`, `primary` →
   `bg-primary text-primary-foreground`.
3. **Deslocamento** (função pura `rubberOffset(raw, rowWidth, commitAt, fullSwipe, drawerWidth, resistance)`):
   1:1 até `commitAt * rowWidth` (com `fullSwipe`) ou até a largura da gaveta (sem `fullSwipe`);
   além desse limite, o excesso é multiplicado por `resistance` e depois comprimido de forma
   assintótica, sem nunca passar da largura da linha. (Revisão 09/10/2026: a versão anterior
   resistia logo depois da gaveta e tornava o swipe completo inalcançável numa linha de 600 px.)
4. **Salto:** quando `|offset| ≥ commitAt * rowWidth` e `fullSwipe`, o botão da principal cresce
   para ocupar toda a área revelada (animação curta); voltar abaixo desfaz o salto.
   `navigator.vibrate?.(10)` uma vez no toque (se existir).
5. **Soltar** (função pura `releaseTarget(offset, velocity, drawerWidth, rowWidth, commitAt, fullSwipe)`
   → `"closed" | "open" | "commit"`): commit se passou de `commitAt` (com fullSwipe); open se
   passou da metade da gaveta ou peteleco na direção; senão closed. Mola com `snapBounce` só em
   peteleco.
6. **Commit:** a superfície sai para o lado, a linha dobra (`height → 0` em `collapseMs`), depois
   `onCommit(action)`. Pressionar uma ação com `dismiss` faz o mesmo; sem `dismiss` chama
   `onAction` e, com `closeOnAction`, fecha a gaveta.
7. **Teclado/a11y:** a linha é `role="group"` com `aria-label={label}`. Um botão discreto "Ações"
   (visível no foco, `aria-expanded`) abre/fecha a gaveta; as ações são `<button>` normais,
   fora da ordem de tab enquanto fechadas (`inert`). Escape fecha.
8. `direction="right"`: tudo espelhado.
9. **Disabled:** `opacity-50`, sem arraste.

## Movimento reduzido

Abre/fecha sem mola; commit faz fade e colapso instantâneo.

## Marcação

Raiz `data-slot="swipe-actions-row"`, `data-state="closed"|"open"|"committing"`. Partes:
`swipe-actions-row-surface`, `swipe-actions-row-drawer`, `swipe-actions-row-action`.

## Testes mínimos

- Puras: `rubberOffset` (1:1 até a gaveta; resistência depois; nunca passa da largura),
  `releaseTarget` (todas as saídas, com e sem fullSwipe).
- Botão "Ações" abre (`aria-expanded`, ações focáveis); Escape fecha.
- Pressionar ação sem `dismiss` → `onAction`, fecha. Ação principal → (timers) `onCommit`.
- Arrasto simulado com mock de largura: além de `commitAt` + soltar → `onCommit(actions[0])`.
- `onOpenChange` chamado. Disabled ignora. Movimento reduzido. `ref`/`className`.
