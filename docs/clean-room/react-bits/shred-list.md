# Spec de comportamento: `shred-list`

> **Proveniência (clean room).** Escrita em 09/10/2026 a partir da demo pública "Shredder" em
> `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.

## O que a pessoa vê

Uma lista de cartões (arquivos: "Porto ao entardecer · editado ontem · 4,1 MB") empilhada sobre
uma **fenda** horizontal. Embaixo da fenda há uma área vazia. Arrastar um cartão para baixo até a
fenda faz os "rolos" o puxarem: o cartão desce pela fenda e sai do outro lado **cortado em tiras
verticais** que caem, ondulam um pouco e somem. Arrastar para cima ou entre outros cartões
reordena a lista. Arrastando, o cartão cresce um pouco e inclina para o lado do movimento.

## API (`molecules/data-display/shred-list`)

```ts
type ShredListProps<T extends { id: string }> = Omit<React.ComponentProps<"div">, "children"> & {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  /** Chamado quando o cartão terminou de passar pela fenda. Remova o item aqui. */
  onShred: (item: T) => void;
  onReorder?: (items: T[]) => void;
  feedSpeed?: number;     // px/s dos rolos, default 180
  /** px que o cartão precisa entrar na fenda para ser puxado. */
  bite?: number;          // default 18
  /** Puxa assim que passa do bite, mesmo segurando. false = só ao soltar sobre a fenda. */
  autoFeed?: boolean;     // default true
  stripWidth?: number;    // default 10
  curl?: number;          // 0..1.5, default 1
  dragTilt?: number;      // graus, default 6
  lift?: number;          // default 1.02
  fallHeight?: number;    // altura da área de queda, default 140
  gap?: number;           // default 10
  disabled?: boolean;
  "aria-label"?: string;  // default "Lista"
};
```
Genérico em `T`. Componente com genérico em React 19: `function ShredList<T extends { id: string }>(props: ShredListProps<T>)`.

## Regras

1. **Estrutura:** lista (`role="list"`, itens `role="listitem"`), fenda (`div` `h-1 rounded-full
   bg-border`) logo abaixo do último item, área de queda abaixo da fenda (`overflow-hidden`).
2. **Arrastar:** pointer capture no cartão. Vertical livre; horizontal dá inclinação
   (`rotate = clamp(dx * k, ±dragTilt)`) e `scale = lift`. Soltar acima da fenda → reordena pelo
   centro do cartão (função pura `reorderIndex(centers, y)`) e chama `onReorder`.
3. **Fenda:** se a borda inferior do cartão passa da fenda em `bite` px (`autoFeed`) ou é solta
   assim, o cartão é "puxado": a partir daí o usuário não controla mais; ele desce em
   `feedSpeed` px/s (primeiro puxão um pouco mais rápido, easing de entrada), recortado pela fenda
   (o pedaço acima continua inteiro, o que passou vira tiras).
4. **Tiras sem canvas:** o pedaço que passou da fenda é renderizado como `N = round(largura /
   stripWidth)` cópias do cartão (`aria-hidden`, `inert`), cada uma com `clip-path: inset(0 X% 0 Y%)`
   mostrando só sua coluna. Cada tira cai com leve atraso aleatório, rotação pequena e um
   deslocamento X ondulado (seno, amplitude proporcional a `curl`), sumindo com opacidade ao fim
   da área de queda. Funções puras: `stripCount(width, stripWidth)`, `stripClip(i, n)`,
   `stripMotion(i, n, curl, rng)` → `{ delay, rotate, drift }`.
5. Ao fim, `onShred(item)` uma vez. Se o pai não remover o item, ele volta para o topo (documentar).
6. **Teclado:** cada cartão é focável (`tabIndex=0`). `Delete`/`Backspace` tritura; `Alt+↑/↓`
   move na lista (`onReorder`). Instrução em `sr-only` no topo:
   "Delete tritura o item. Alt e setas reordenam."
7. **Cores (só tokens):** a lista não pinta os cartões (o `renderItem` decide); fenda `bg-border`,
   sombra do cartão arrastado `shadow-lg`.
8. **Disabled:** sem arrasto nem teclado.

## Movimento reduzido

Sem tiras nem queda: o cartão some com fade e encolhe (altura → 0) e `onShred` é chamado.
Reordenar sem inclinação.

## Acessibilidade

`aria-live="polite"` anuncia "Item removido" / "Item movido para a posição 2 de 4".

## Marcação

Raiz `data-slot="shred-list"`. Partes: `shred-list-item`, `shred-list-slit`, `shred-list-strip`.

## Testes mínimos

- Puras: `stripCount` (340/10 = 34; mínimo 1), `stripClip` (primeira e última coluna somam 100%),
  `stripMotion` com rng fixo (determinístico, curl 0 → drift 0), `reorderIndex`.
- Teclado: Delete num item → (fake timers) `onShred(item)` uma vez; Alt+↓ chama `onReorder` com a
  ordem trocada; Alt+↑ no primeiro não faz nada.
- Movimento reduzido: Delete chama `onShred` sem renderizar tiras.
- `renderItem` recebe item e índice. Disabled ignora teclado. `ref`/`className`.
