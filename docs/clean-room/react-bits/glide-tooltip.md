# Spec de comportamento: `glide-tooltip`

> **Proveniência (clean room).** Escrita em 09/10/2026 a partir da demo pública "Warm Tooltip" em
> `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.

## O que a pessoa vê

Numa barra de ferramentas, passar o mouse num botão espera 400 ms e abre um rótulo ("Negrito
⌘B") que **surge** com escala 0,94 → 1 e um pouco de desfoque. Movendo para o botão vizinho
logo em seguida, o rótulo **não fecha e reabre**: ele **desliza** do botão anterior para o novo,
trocando o texto no caminho. Saindo da barra, depois de 300 ms o grupo "esfria" e o próximo hover
volta a esperar. Opcional: uma linha fina enche ao longo da borda do botão durante a espera.

## API (`atoms/feedback/glide-tooltip`) — dois componentes

```ts
type GlideTooltipGroupProps = {
  children: React.ReactNode;
  delayMs?: number;                  // default 400
  warmWindowMs?: number;             // default 300
  travelMs?: number;                 // default 240 (0 = pula)
};
type GlideTooltipProps = {
  content: React.ReactNode;
  shortcut?: React.ReactNode;        // desenhado como <kbd>
  children: React.ReactElement;      // o gatilho; recebe só aria-describedby e handlers compostos
  side?: "top" | "bottom" | "left" | "right"; // default "top"
  delayMs?: number;                  // herda do grupo
  showFuse?: boolean;                // default false
  disabled?: boolean;
  className?: string;                // no rótulo
};
```
Fora de um grupo, `GlideTooltip` funciona sozinho (abre/fecha com pop, sem deslizar).

## Regras

1. **Por que não Radix Tooltip:** o deslize exige **um único rótulo compartilhado** que muda de
   âncora; o Radix cria um conteúdo por gatilho. Implementação própria, com estas garantias de a11y:
   `role="tooltip"` com `id`, gatilho com `aria-describedby` enquanto aberto, abre em `focus`
   (sem atraso quando o grupo está quente) e fecha em `blur`, `Escape` fecha, conteúdo não
   interativo, não rouba foco. Documentar isso no JSDoc.
2. **Cores (só tokens):** `bg-foreground text-background` (tooltip escuro no claro, como o
   `tooltip` atual da lib — conferir e seguir o mesmo), `<kbd>` com `bg-background/15`,
   `text-xs`, `rounded-md`, seta opcional não precisa.
3. **Estado do grupo** (reducer puro `warmthReducer`): `cold` → hover/focus inicia timer de
   `delayMs` → `open(target)`; com `open`, entrar em outro gatilho → `open(novo)` **imediato**
   (desliza); sair de todos → fecha e fica `warm` por `warmWindowMs` (entrar nesse tempo abre
   imediato, com pop); depois `cold`.
4. **Posição:** medir o gatilho (`getBoundingClientRect`) relativo a um portal em `document.body`;
   função pura `placeLabel(triggerRect, labelSize, side, gap=8)` → `{x, y}`; virar de lado se sair
   da viewport (só top↔bottom e left↔right). Deslize = animar `x/y` com `travelMs` (ease-out);
   largura do rótulo anima também (`layout` do motion ou medida).
5. **Pop:** abrir a frio: `scale 0.94 → 1`, `filter: blur(4px) → 0`, opacidade, 160 ms, origem no
   lado do gatilho. Fechar: 0,8 do tempo.
6. **Fuse:** com `showFuse`, durante a espera uma linha `bg-primary` de 1,5 px cresce (`scaleX`)
   na borda do gatilho do lado `side`.
7. **Toque:** pressionar e segurar 500 ms abre; o clique seguinte é engolido. (Pode ficar fora se
   complicar demais — então documentar como pendente.)

## Movimento reduzido

Sem deslize (pula), sem escala nem blur: só fade curto.

## Marcação

Rótulo: `data-slot="glide-tooltip"`, `data-side`, `data-state="open"|"closed"`.
Grupo: `data-slot="glide-tooltip-group"` (um `div` com `display: contents` ou wrapper
`inline-flex` — escolher e documentar). Fuse: `glide-tooltip-fuse`.

## Testes mínimos

- Puras: `warmthReducer` (todas as transições), `placeLabel` (4 lados + virar).
- Fake timers: hover espera `delayMs` e mostra `role="tooltip"` com o texto; gatilho tem
  `aria-describedby` apontando para ele.
- No grupo: com um aberto, hover no vizinho troca o texto **sem** esperar; sair e voltar dentro
  de `warmWindowMs` abre sem esperar; depois dele, espera de novo.
- Focus abre, blur fecha, Escape fecha. `disabled` não abre.
- `shortcut` renderiza `<kbd>`. Movimento reduzido abre. Handlers próprios do gatilho continuam
  sendo chamados.
