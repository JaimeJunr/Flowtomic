# LinkTileGrid — spec clean room

Fonte observada: a grade de casos de uso de finalroundai.com, vista só na tela em 24/10/2026, em
1440 px e na largura do painel do app (~800 px), no navegador do app, passando o ponteiro nos
ladrilhos. Nenhum código, CSS ou asset da página foi lido. Ver `README.md` desta pasta (candidato
21).

## O que se viu (resumo)

- Cabeçalho centrado: título de duas linhas e uma frase em `muted`. Havia um rótulo laranja em
  caixa alta acima: **não copiar**.
- **12 ladrilhos** iguais numa grade: 4 colunas em 1440 px, 3 colunas em ~800 px. Cada ladrilho é
  um link de altura baixa (~80 px), `rounded-xl`, borda fina clara, fundo branco sobre o fundo
  levemente pontilhado da seção.
- Dentro, em linha: um **ícone de traço num quadrado tingido** (~40 px, fundo da cor de destaque
  bem clara, ícone na cor de destaque), o **nome** em semibold, e uma **seta pequena** na cor de
  destaque encostada à direita. Sem descrição: é navegação densa.
- Nome comprido quebra em duas linhas sem mudar a altura dos vizinhos da mesma fileira.
- **Hover**: a borda ganha a cor de destaque, clara, e aparece uma sombra leve; a seta continua no
  lugar.

O que não copiar: o rótulo em caixa alta, os nomes e ícones deles, o "™".

## Composição

Molecule `LinkTileGrid`, em `molecules/navigation/link-tile-grid/`. `<nav>` com `@container` e
`aria-label` (padrão "Atalhos"), envolvendo uma lista `<ul role="list">`.

### Grade
- `grid grid-cols-1 gap-3 @min-[480px]:grid-cols-2 @min-[768px]:grid-cols-3
  @min-[1100px]:grid-cols-4`. Prop `columns` (2, 3 ou 4) limita o máximo: com `columns={3}`, sem a
  classe de 4. Escreva cada combinação por inteiro (sem interpolar nome de classe).
- Linhas da grade com `auto-rows-fr`, para os ladrilhos da mesma grade terem a mesma altura quando
  um nome quebra.

### Ladrilho
- O `<li>` contém um `<a>` (ou o elemento de `asChild`/`render`, ver API) que é o ladrilho inteiro:
  `group flex h-full min-h-20 items-center gap-4 rounded-xl border border-border bg-card px-4 py-3
  text-foreground transition-[border-color,box-shadow]`.
- Ícone: `size-10 shrink-0 rounded-lg grid place-items-center`, fundo
  `color-mix(in oklch, var(--primary) 10%, transparent)`, ícone de 18 px em `text-primary`,
  `aria-hidden`. Sem `icon`, o quadrado não aparece.
- Nome: `min-w-0 flex-1 text-sm font-semibold text-balance` (quebra em até duas linhas).
- `description` opcional (não estava no site, útil fora dele): uma linha `text-xs
  muted-foreground` sob o nome, `line-clamp-1`.
- Seta: ícone `ArrowRight` do lucide, 16 px, `text-primary`, `aria-hidden`, `shrink-0`. Com
  `external`, troca por `ArrowUpRight`, o link ganha `target="_blank"` e `rel="noreferrer"`, e um
  `sr-only` "(abre em nova aba)".
- Hover e foco: `hover:border-[color-mix(in_oklab,var(--primary)_40%,var(--border))]
  hover:shadow-sm`; foco `focus-visible:ring-2 ring-ring ring-offset-2 ring-offset-background
  outline-none`. A seta desliza 2 px para a direita no hover (`group-hover:translate-x-0.5`), sem
  movimento com `motion-reduce:`.
- `badge` opcional (ReactNode curto, ex. "Novo"): `Badge` do repo, `size="sm"`, entre o nome e a
  seta.
- `disabled`: o ladrilho vira um `<span>` com `aria-disabled="true"`, opacidade 50%, sem hover,
  fora da ordem de tabulação.

### Cabeçalho (opcional)
O componente não desenha título: quem usa põe o título da seção por fora. Para o `<nav>` ficar
nomeado pelo título visível, aceite `labelledBy` (id), que vira `aria-labelledby` no lugar do
`aria-label`.

## API

```ts
type LinkTile = {
  id: string;
  label: ReactNode;
  href: string;
  icon?: ReactNode;
  description?: ReactNode;
  badge?: ReactNode;
  external?: boolean;
  disabled?: boolean;
};

type LinkTileGridProps = Omit<ComponentProps<"nav">, "children"> & {
  items: LinkTile[];
  columns?: 2 | 3 | 4;           // máximo; padrão 4
  label?: string;                // aria-label; padrão "Atalhos"
  labelledBy?: string;           // aria-labelledby; vence o label
  renderLink?: (props: ComponentProps<"a"> & { item: LinkTile }) => ReactNode; // para Link de router
};
```

`renderLink` existe para quem usa o `Link` do Next ou do React Router: recebe as props já montadas
(`href`, `className`, `children`, `target`, `rel`) e devolve o elemento; sem ele, sai `<a>`.

`data-slot`: `link-tile-grid`, `link-tile` (com `data-disabled` quando for o caso),
`link-tile-icon`, `link-tile-label`, `link-tile-arrow`.

## Estados que o teste deve cobrir

1. Renderiza um `navigation` nomeado ("Atalhos" por padrão) com uma lista e um link por item, cada
   um com o nome e o `href`.
2. `label` e `labelledBy`: o primeiro troca o nome; o segundo põe `aria-labelledby` e remove o
   `aria-label`.
3. `icon` aparece no quadrado tingido com `aria-hidden`; sem `icon`, não há `link-tile-icon`.
4. `external`: `target="_blank"`, `rel` com `noreferrer` e o texto "(abre em nova aba)" no nome
   acessível.
5. `disabled`: não é link, tem `aria-disabled="true"` e não recebe foco por Tab.
6. `columns={3}` não aplica a classe de 4 colunas; `columns={2}` não aplica nem a de 3.
7. `renderLink` recebe `href` e `item` e o elemento devolvido aparece no lugar do `<a>`.
8. `description` e `badge` aparecem quando passados.

## Story

`Flowtomic UI/Molecules/LinkTileGrid`, `layout: "padded"`. Conteúdo próprio: as categorias de
componentes do Flowtomic, com ícones do lucide e links para as pastas que existem no GitHub
(`https://github.com/JaimeJunr/Flowtomic/tree/main/packages/ui/src/components/...`). Confira cada
caminho com `ls` antes de escrever. Pelo menos 8 itens, um nome que quebre em duas linhas, um
`badge` "Novo" e um `external`. Na story, ponha um `<h2 id>` por fora e passe `labelledBy`.

- `Default`: 4 colunas.
- `TresColunas`: `columns={3}`.
- `ComDescricao`: com `description` em todos.
- `Estreito`: contêiner de 390 px.
- `Escuro`: wrapper com a classe `dark`.
