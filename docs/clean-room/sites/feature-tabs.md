# FeatureTabs — spec clean room

Fonte observada: a seção de recursos de finalroundai.com, vista só na tela em 24/10/2026, em 1440 e
390 px, no navegador do app (clicando nas abas e passando o ponteiro). Nenhum código, CSS ou asset
da página foi lido. Ver `README.md` desta pasta (candidato 19).

## O que se viu (resumo)

- **Cabeçalho da seção** à esquerda, alinhado ao conteúdo: título grande de uma linha e um
  parágrafo curto em `muted`. Havia um rótulo laranja em caixa alta acima do título: **não copiar**.
- **Largo**: duas colunas. À esquerda, uma lista vertical de 5 nomes curtos, em texto pequeno, com
  uma **régua vertical fina** à esquerda de todos; o item ativo tem um **trecho da régua mais grosso
  na cor de destaque** e o texto escuro, os outros em cinza. Passar o ponteiro escurece o texto do
  item. Uma régua vertical clara separa a lista do conteúdo.
- **Painel à direita**: título de duas linhas (bem maior que a lista, peso semibold), parágrafo em
  `muted`, 3 itens de lista cada um com uma seta pequena na cor de destaque no lugar do marcador, e
  um link "Saiba mais sobre <recurso>" na cor de destaque, sem sublinhado.
- Trocar de aba troca o painel inteiro **sem mudar a altura da seção** e muda o hash da URL
  (`#debrief`), então a aba tem endereço.
- **Celular (390 px)**: a lista vira uma **faixa horizontal rolável** de abas acima do painel, com
  uma régua horizontal embaixo e o trecho ativo em destaque; as abas que não cabem ficam cortadas na
  borda direita. Num teste, o painel mostrava um recurso diferente da aba marcada: **não repetir**,
  aba e painel sempre em sincronia.

O que não copiar: o rótulo em caixa alta, o glifo de seta no texto do link (use o ícone
`ArrowRight` do lucide), a marca e os textos deles.

## Composição

Organism `FeatureTabs`. `<section>` com `@container`, `aria-labelledby` no título.

### Cabeçalho (opcional)
- `title` (`<h2>` por padrão, `headingLevel` 2 a 4), `text-display-xs` subindo para
  `text-display-sm` a partir de `@min-[768px]`, `font-semibold`, `text-balance`. Sem eyebrow.
- `description` opcional, `muted-foreground`, até 56ch. Alinhado à esquerda.

### Abas
- **Radix Tabs** do repo (`atoms/navigation/tabs`) ou o primitivo do Radix por baixo dele, com
  `orientation` trocando entre `vertical` (largo) e `horizontal` (estreito). Ativação **automática**
  (seta já troca o painel), que é o padrão do Radix.
- **Largo (contêiner ≥ 768 px)**: grade `grid-cols-1 @min-[768px]:grid-cols-[minmax(10rem,14rem)_1fr]`
  com `gap-10`. Lista em coluna; cada aba com `px-4 py-2.5 text-sm text-left`, régua de 1 px
  `border-l border-border` em toda a lista e, no ativo, um trecho de 2 px `bg-primary` sobreposto à
  régua na altura da aba (pseudo-elemento ou `span` absoluto). Texto inativo `muted-foreground`,
  ativo e hover `text-foreground font-medium`. Régua clara `border-l` entre lista e painel.
- **Estreito (< 768 px)**: a lista vira uma faixa horizontal `overflow-x-auto` sem barra visível
  (`[scrollbar-width:none]`), com régua `border-b` e o trecho ativo de 2 px embaixo da aba. A aba
  ativa rola para dentro da faixa quando muda (`scrollIntoView({ inline: "nearest", block:
  "nearest" })`), sem rolar a página.
- O trecho ativo desliza até a aba nova (motion `layoutId` ou transição de `transform`); com
  movimento reduzido (critério do `sliding-number` no `CLAUDE.md`), salta.
- Cada aba pode ter `icon` opcional (ReactNode, 16 px, antes do texto).

### Painel
- Título do recurso (`heading`, `<h3>` por padrão, um nível abaixo do `headingLevel`),
  `text-xl @min-[768px]:text-2xl font-semibold text-balance`, até 22ch.
- `description` em `muted-foreground`, até 60ch.
- `points` opcional: lista `<ul>` com o ícone `ArrowRight` de 14 px em `text-primary`
  (`aria-hidden`) no lugar do marcador, `gap-3`, `text-sm`.
- `link` opcional (`{ label, href }`): `text-primary font-medium` com o ícone `ArrowRight` depois,
  sublinhado só no hover. Sem `label`, o padrão é "Saiba mais sobre <nome da aba>".
- `media` opcional (ReactNode): fica abaixo do texto no estreito e à direita do texto num terceiro
  bloco a partir de `@min-[1024px]` (o painel vira `grid-cols-2`).
- **Altura estável**: todos os painéis ficam montados (`forceMount`) e empilhados na mesma célula de
  grade (`grid [grid-template-areas:'stack']`, cada painel em `[grid-area:stack]`); os inativos com
  `invisible` e `aria-hidden` por `data-state=inactive`. Assim a seção mede o maior painel e não
  pula ao trocar. Troca com fade de 150 ms; sem animação com movimento reduzido.

### Endereço da aba (opcional, `syncHash`)
- Com `syncHash`, a aba ativa vira `#<id>` via `history.replaceState` (sem rolar nem empilhar
  histórico), e ao montar a seção lê o hash: se for o `id` de uma aba, ela abre.
- Sem `syncHash`, a URL não muda.

## API

```ts
type FeatureTab = {
  id: string;                // também o hash
  label: ReactNode;          // texto da aba
  icon?: ReactNode;
  heading: ReactNode;
  description?: ReactNode;
  points?: ReactNode[];
  link?: { label?: ReactNode; href: string };
  media?: ReactNode;
};

type FeatureTabsProps = Omit<ComponentProps<"section">, "title" | "defaultValue"> & {
  tabs: FeatureTab[];
  title?: ReactNode;
  description?: ReactNode;
  headingLevel?: 2 | 3 | 4;
  value?: string;
  defaultValue?: string;     // padrão: a primeira aba
  onValueChange?: (id: string) => void;
  syncHash?: boolean;
  label?: string;            // aria-label da lista; padrão "Recursos"
};
```

`data-slot`: `feature-tabs`, `feature-tabs-header`, `feature-tabs-list`, `feature-tabs-trigger`
(com `data-state`), `feature-tabs-indicator`, `feature-tabs-panel`.

## Acessibilidade

- O que o Radix Tabs já dá: `role="tablist"` com `aria-orientation` certo, `tab`/`tabpanel`
  ligados, setas conforme a orientação, Home/End.
- O título de cada painel é heading de verdade, para quem navega por títulos achar o recurso.
- Painel inativo fora da árvore de acessibilidade (o `forceMount` não pode deixar o leitor de tela
  ler os cinco).
- Foco visível nas abas (`focus-visible:ring-2 ring-ring`, `ring-inset` se a faixa tiver
  `overflow`).

## Estados que o teste deve cobrir

1. Renderiza a seção nomeada pelo título, um `tablist` com uma `tab` por item e o primeiro painel
   visível com heading, descrição, pontos e link.
2. Clique numa aba mostra o painel dela; o anterior fica `aria-hidden`/inativo e o leitor só acha um
   `tabpanel` visível.
3. Teclado: com o foco na lista, a seta (vertical no largo) troca de aba; Home e End vão às pontas.
   (Ver a armadilha do Radix com `userEvent.keyboard` no `CLAUDE.md`; use `fireEvent.keyDown` ou
   `{ArrowDown>}`…`{/ArrowDown}` + `waitFor`.)
4. Controlado: `onValueChange` recebe o `id`; sem `value` novo, a aba não muda.
5. `link` sem `label` usa "Saiba mais sobre <label da aba>"; com `label`, usa o dado.
6. `syncHash`: trocar de aba chama `history.replaceState` com `#<id>`; montar com `#<id>` no hash
   abre aquela aba; hash desconhecido abre a padrão.
7. `headingLevel={3}` põe o título em `h3` e os títulos de painel em `h4`.
8. Os painéis inativos continuam montados (altura estável), com `data-state="inactive"`.

## Story

`Flowtomic UI/Organisms/FeatureTabs`, `layout: "padded"`. Conteúdo próprio, sem marca alheia: as
peças do Flowtomic. Título "Cinco jeitos de usar o Flowtomic"; abas "CLI", "Pacote npm", "Hooks
headless", "Tema por tokens", "Blocks". Cada uma com heading de duas linhas, uma frase, 2 ou 3 pontos
verdadeiros (os comandos e regras que estão no `CLAUDE.md` e nos `docs/`) e link para a pasta de docs
correspondente no GitHub (`https://github.com/JaimeJunr/Flowtomic/tree/main/docs/...`, só caminhos
que existem).

- `Default`.
- `ComMidia`: um painel com `media` (um bloco de código simples com o comando do CLI).
- `ComHash`: `syncHash`.
- `Estreito`: contêiner de 390 px (faixa horizontal).
- `Escuro`: wrapper com a classe `dark`.
