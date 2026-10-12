# ComparisonTable — spec clean room

Fonte observada: a seção "The Proof Is in the Comparison" de interviewcoder.co, e a tabela de
promoções de vercel.com/ai-gateway (preço riscado), vistas só na tela em 12/10/2026. Nenhum
código, CSS ou asset dessas páginas foi lido. Ver `README.md` desta pasta.

## Para que serve

Comparar **recursos (linhas) × opções (colunas)**, com **uma coluna em destaque** (o produto da
casa, o plano recomendado). Uso: landing ("nós × alternativas"), página de planos ("o que cada
plano inclui"), doc ("qual componente usar").

## Composição

- **Cabeçalho de colunas**: a primeira coluna tem o título da tabela (ex.: "Recursos") com um
  complemento opcional em `muted-foreground` menor ao lado ("clique para ver"). Cada opção tem
  rótulo curto e ícone/logo opcional.
- **Coluna destacada**: a coluna inteira é uma faixa contínua com fundo
  `color-mix(in oklch, var(--primary) 10%, var(--card))`, borda `primary` e cantos arredondados no
  topo e no fim — parece um cartão vertical sobreposto à tabela. As outras colunas também são
  faixas, com fundo `card` e borda `border`, separadas por um respiro de 8 px. Na faixa destacada,
  o "sim" vira um círculo cheio `primary` com check em `primary-foreground`.
- **Linhas**: ícone opcional à esquerda (lucide, `muted-foreground`), nome do recurso e, à
  direita da célula, um botão `?` (ícone `HelpCircle`, `muted-foreground`) que abre um tooltip com
  a explicação. Quando a linha tem `href` ou `onSelect`, o nome é sublinhado pontilhado e clicável.
  Divisória fina `border` entre linhas, só dentro das faixas.
- **Células de valor**, centralizadas:
  - `true`: check (`foreground`; na coluna destacada, o círculo cheio descrito acima);
  - `false`: X em `muted-foreground` (não vermelho: "não tem" não é erro);
  - `"parcial"`: traço `—` em `muted-foreground` com `aria-label` "Parcial";
  - texto ou ReactNode: renderizado como está (ex.: "R$ 49", "3 usuários"), com `font-mono` se
    for número.
- **Grupos** (opcional): linhas agrupadas com um subtítulo de grupo ocupando a largura toda.

## Comportamento

- Nada é interativo por padrão além do tooltip e de linhas clicáveis.
- **Telas estreitas** (container < 640 px): a tabela não rola na horizontal. Vira um seletor de
  opção (abas no topo com as opções, a destacada selecionada) e uma lista de recursos com o valor
  da opção selecionada à direita. A opção destacada ganha o selo do destaque na aba.
- `highlightLabel` (ex.: "Recomendado") aparece como selo pequeno acima do rótulo da coluna
  destacada.

## Acessibilidade

- `<table>` de verdade, com `<caption>` (visualmente oculto se não houver título visível), `<th
  scope="col">` nas opções e `<th scope="row">` no nome do recurso.
- Ícones de valor têm texto acessível: "Sim", "Não", "Parcial".
- A coluna destacada leva `aria-describedby` no `<th>` apontando para o `highlightLabel`.
- Tooltip do `?` via Radix Tooltip (o do repo); o botão tem `aria-label` "Sobre <recurso>".
- No modo estreito, as abas são Radix Tabs.

## API

```ts
type ComparisonValue = boolean | "partial" | ReactNode;

type ComparisonOption = {
  id: string;
  label: ReactNode;
  icon?: ReactNode;
};

type ComparisonFeature = {
  id: string;
  label: ReactNode;
  icon?: ReactNode;
  description?: ReactNode;          // conteúdo do tooltip do "?"
  href?: string;
  onSelect?: () => void;
  values: Record<string, ComparisonValue>;  // por id de opção; ausente = false
};

type ComparisonGroup = { id: string; label: ReactNode; features: ComparisonFeature[] };

type ComparisonTableProps = ComponentProps<"div"> & {
  options: ComparisonOption[];
  features: ComparisonFeature[] | ComparisonGroup[];
  highlight?: string;               // id da opção destacada
  highlightLabel?: ReactNode;
  title?: ReactNode;                // cabeçalho da primeira coluna
  titleHint?: ReactNode;            // complemento ao lado do título
  caption?: string;                 // nome acessível; padrão = title em texto
};
```

`data-slot`: `comparison-table` (raiz), `comparison-table-column` (com `data-highlighted`),
`comparison-table-row`, `comparison-table-cell` (com `data-value="yes|no|partial|custom"`),
`comparison-table-group`.

## Estados que o teste deve cobrir

1. Renderiza uma `<table>` com cabeçalho de opções e uma linha por recurso.
2. `true`/`false`/`"partial"` viram ícone com texto acessível "Sim"/"Não"/"Parcial".
3. Valor ausente conta como "Não".
4. Texto e ReactNode aparecem como estão.
5. Coluna `highlight` tem `data-highlighted="true"` e o `highlightLabel` visível.
6. `description` gera botão `?` com `aria-label`, e o tooltip mostra o texto ao focar.
7. Linha com `href` renderiza link; com `onSelect`, botão que chama a função.
8. Grupos renderizam subtítulo e as linhas do grupo.
9. Modo estreito (forçar via prop de teste ou largura mockada): abas de opção, começa na
   destacada, trocar de aba troca os valores mostrados.

## Story

`Flowtomic UI/Molecules/ComparisonTable`. Conteúdo do próprio Flowtomic, sem concorrentes reais:
- `Default`: "Copiar com o CLI" × "Instalar pelo npm" × "Escrever do zero", recursos como "Recebe
  atualizações", "Edita o código", "Tipos inclusos", "Acessível de fábrica" (com descrições),
  destaque no CLI, `highlightLabel` "Recomendado".
- `ComGrupos`: grupos "Instalação" e "Manutenção".
- `ValoresDeTexto`: preços e limites como texto.
- `Estreito`: em contêiner de 360 px.
