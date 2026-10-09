# Spec de comportamento: `branch-nav`

> **Proveniência (clean room).** Escrita em 09/10/2026 a partir da demo pública "Branched Menu" em
> `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.

## O que a pessoa vê

Um menu lateral de documentação em árvore ("Primeiros passos › Instalação, Início rápido,
Configuração, Temas"; "Componentes › Botões, Tipografia, Sobreposições, Avisos"). À esquerda, um
**tronco** vertical fino; de cada seção aberta saem **galhos** curvos até cada filho. Ao escolher
um item, uma linha de destaque **percorre o tronco e o galho** até o item escolhido, e o rótulo
fica destacado com um marcador. Seções abrem e fecham dobrando (altura animada), e os galhos
aparecem/somem junto.

## API (`molecules/navigation/branch-nav`)

```ts
type BranchNavLeaf = { value: string; label: string; icon?: React.ReactNode; href?: string };
type BranchNavSection = { label: string; icon?: React.ReactNode; children: BranchNavLeaf[] };
type BranchNavItem = BranchNavSection | (BranchNavLeaf & { children?: undefined });
type BranchNavProps = Omit<React.ComponentProps<"nav">, "onSelect"> & {
  items: BranchNavItem[];
  value?: string; defaultValue?: string;          // vazio = primeiro filho da seção aberta
  defaultOpen?: number | number[];                 // default 0; -1 = nenhuma
  onValueChange?: (value: string, item: BranchNavLeaf) => void;
  onToggle?: (index: number, open: boolean) => void;
  rowHeight?: number;     // default 32
  indent?: number;        // default 32
  trunkX?: number;        // default 12
  radius?: number;        // default 8
  drawMs?: number;        // default 400
  foldMs?: number;        // default 300
  "aria-label"?: string;  // default "Navegação"
};
```

## Regras

1. **Estrutura acessível:** `<nav>` com `<ul>`; seção = `<button aria-expanded aria-controls>` +
   `<ul>` dos filhos; filho = `<a href>` se tiver `href`, senão `<button>`; o ativo tem
   `aria-current="page"`. Folha no nível de cima = item sem filhos.
2. **Linhas:** um SVG por seção aberta, `aria-hidden`, com geometria por atributos (nunca CSS). O
   tronco desce de x=`trunkX` até a altura do último filho; cada galho é um `path` que sai do
   tronco e curva com raio `radius` até `indent - 4`. Função pura
   `branchPath(index, rowHeight, trunkX, indent, radius)` → `d`.
3. **Destaque:** um segundo traço (mesmo caminho: tronco do topo até o filho ativo + galho dele)
   desenhado por `strokeDasharray/offset` em pixels (comprimento por função pura
   `activePathLength(...)`), animando em `drawMs` ao trocar de item.
4. **Cores (só tokens):** linhas `stroke-border`, destaque `stroke-primary`, texto ocioso
   `text-muted-foreground`, ativo `text-foreground font-medium`, cabeçalhos `text-foreground`
   1 px maiores, marcador `bg-primary` (pontinho no fim do galho).
5. **Dobrar:** altura animada em `foldMs` (`AnimatePresence` + `height: auto`); chama `onToggle`.
6. **Teclado:** ordem natural de tab; setas ↑/↓ movem entre itens visíveis (roving opcional —
   pode ficar só no tab, documentar).

## Movimento reduzido

Sem desenho progressivo nem dobra animada: estados aparecem prontos.

## Marcação

Raiz `data-slot="branch-nav"`. Partes: `branch-nav-section`, `branch-nav-item`, `branch-nav-lines`,
`branch-nav-active-line`.

## Testes mínimos

- Puras: `branchPath` (começa no tronco, termina em `indent-4`, y cresce com o índice),
  `activePathLength` cresce com o índice.
- Clique num filho: `aria-current`, `onValueChange(value, item)`. Seção alterna `aria-expanded`
  e `onToggle(i, open)`; filhos somem da árvore de a11y ao fechar.
- `defaultOpen=-1` tudo fechado; `[0,1]` duas abertas. `href` vira link.
- Movimento reduzido. `ref`/`className`.
