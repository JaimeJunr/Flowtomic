# ProcessSteps — spec clean room

Fonte observada: a seção "como funciona" de finalroundai.com, vista só na tela em 24/10/2026, em
1440 e 390 px, no navegador do app (clicando nos passos). Também a faixa de passos numerados de
openrouter.ai, vista em 12/10/2026. Nenhum código, CSS ou asset dessas páginas foi lido. Ver
`README.md` desta pasta (candidato 20).

## O que se viu (resumo)

- **Cabeçalho** à esquerda: título curto de três palavras com ponto ("Prepare. Perform. Review.") e
  uma frase em `muted`. Havia um rótulo laranja em caixa alta acima: **não copiar**.
- **3 colunas iguais** no largo. Cada passo, de cima para baixo:
  1. um **quadro com um pedaço de interface** (mini-mock), cantos arredondados, sombra leve,
     proporção ~16:10, com uma barra de janela no topo (três bolinhas, a primeira na cor de
     destaque). Um dos quadros é **escuro** no meio dos claros. Cada mini-mock **se anima em
     laço** enquanto está na tela: a lista de verificação ganha itens marcados um a um, a resposta
     sugerida "digita" com cursor, o relatório mostra a nota e o gráfico.
  2. o número `01`, `02`, `03` pequeno, na cor de destaque, em mono;
  3. o título do passo, semibold, ~24 px;
  4. uma frase de duas ou três linhas em `muted`.
- Abaixo das três colunas, uma **régua horizontal fina** com uma legenda centrada sobre ela, em
  texto pequeno: "cada rodada alimenta a próxima, clique num passo para inspecionar".
- **Clicar num passo** abre uma janela grande sobre a página com o título do passo no topo, uma
  imagem da tela real, e no pé uma legenda (título + frase), pontos de paginação e setas
  anterior/próxima: um carrossel de detalhes. **Esc não fechou a janela**: não repetir.
- **Celular**: os passos empilham, um por linha, quadro em largura total.

O que não copiar: o rótulo em caixa alta, a marca e as telas deles, o "™".

## Composição

Molecule `ProcessSteps`, em `molecules/layout/process-steps/`. `<section>` com `@container`,
`aria-labelledby` no título.

### Cabeçalho (opcional)
- `title` (`<h2>` por padrão, `headingLevel` 2 a 4), `text-display-xs` subindo para
  `text-display-sm` em `@min-[768px]`, `font-semibold`, `text-balance`. Sem eyebrow.
- `description` opcional, `muted-foreground`, até 56ch.

### Passos
- Lista ordenada `<ol>`: `grid grid-cols-1 gap-10 @min-[640px]:grid-cols-2 @min-[960px]:grid-cols-3`;
  com 4 passos, `@min-[1200px]:grid-cols-4`. Escreva as classes por inteiro (sem interpolar).
- Cada `<li>`: `preview` (opcional) → número → título (`<h3>`, um nível abaixo do `headingLevel`,
  `text-xl font-semibold`) → `description` (`text-sm muted-foreground`).
- Número: `String(i + 1).padStart(2, "0")` por padrão, `font-mono text-xs text-primary
  tabular-nums`, `aria-hidden` (a ordem já vem da `<ol>`). Prop `numbering={false}` esconde.

### `ProcessStepFrame` (subcomponente exportado)
O quadro do mini-mock, para quem monta o `preview`:
- `rounded-xl border border-border bg-card shadow-xs overflow-hidden aspect-[16/10]`.
- Barra de janela de 32 px: três bolinhas de 8 px (a primeira `bg-primary`, as outras
  `bg-muted-foreground/30` via `color-mix`), e `title` opcional à direita em `text-xs
  muted-foreground`.
- `tone="dark"` aplica a classe `dark` no próprio quadro (painel escuro nos dois modos, como manda
  o `CLAUDE.md`), nunca `bg-foreground`.
- Corpo com `p-4` e `children`. O quadro todo é decorativo para o leitor de tela quando
  `decorative` (padrão `true`): `aria-hidden` e `inert`, porque o texto do passo já diz o que ele
  mostra.

### Animação dos mini-mocks
- O `ProcessSteps` não anima o conteúdo de ninguém; ele só informa **se o passo está visível**:
  `preview` pode ser `ReactNode` ou `(state: { active: boolean }) => ReactNode`, com `active` vindo
  de um IntersectionObserver (≥ 40% visível). Sem IntersectionObserver (jsdom), `active` é `true`.
- Com movimento reduzido (critério do `sliding-number` no `CLAUDE.md`), `active` é sempre `false`,
  para o mini-mock mostrar o estado final parado.

### Régua com legenda (opcional, `caption`)
- Abaixo da lista, `mt-10`: régua `border-t border-border` com a `caption` centrada sobre ela, num
  `span` com `bg-background px-3 text-xs muted-foreground` sobreposto à linha.

### Detalhe por passo (opcional)
- `detail` por passo: `{ title?: ReactNode; slides: { media: ReactNode; title: ReactNode;
  description?: ReactNode }[] }`.
- Passo com `detail` vira clicável: o título vira um botão (ou o `<li>` inteiro por um
  `button` sobreposto com `aria-label` "Ver detalhes de <título>"), cursor de mão e hover que sobe a
  sombra do quadro.
- Abre o `Dialog` do repo (Radix): título = `detail.title ?? título do passo`, a mídia do slide
  atual, e no pé a legenda (`title` + `description`), os pontos de paginação (um botão por slide,
  `aria-label` "Slide 2 de 3", o atual com `aria-current`) e as setas `ChevronLeft`/`ChevronRight`
  (`aria-label` "Anterior"/"Próximo", desabilitadas nas pontas). Setas do teclado dentro da janela
  trocam de slide. **Esc fecha** (o Radix já faz; não bloqueie). O foco volta ao passo ao fechar.
- `DialogDescription` com a descrição do slide; sem descrição, `aria-describedby={undefined}`
  (armadilha do `CLAUDE.md`).

## API

```ts
type ProcessStepSlide = { media: ReactNode; title: ReactNode; description?: ReactNode };

type ProcessStep = {
  id: string;
  title: ReactNode;
  description?: ReactNode;
  preview?: ReactNode | ((state: { active: boolean }) => ReactNode);
  detail?: { title?: ReactNode; slides: ProcessStepSlide[] };
};

type ProcessStepsProps = Omit<ComponentProps<"section">, "title"> & {
  steps: ProcessStep[];          // 2 a 4
  title?: ReactNode;
  description?: ReactNode;
  headingLevel?: 2 | 3 | 4;
  caption?: ReactNode;
  numbering?: boolean;           // padrão true
};

type ProcessStepFrameProps = ComponentProps<"div"> & {
  title?: ReactNode;
  tone?: "light" | "dark";
  decorative?: boolean;          // padrão true
};
```

`data-slot`: `process-steps`, `process-steps-header`, `process-steps-list`, `process-step` (com
`data-active`), `process-step-number`, `process-step-frame`, `process-steps-caption`,
`process-step-detail`.

## Estados que o teste deve cobrir

1. Renderiza a seção nomeada pelo título e uma `<ol>` com um item por passo, cada um com heading e
   descrição; números `01`, `02`, `03` presentes e `aria-hidden`.
2. `numbering={false}` esconde os números; `headingLevel={3}` põe o título em `h3` e os passos em
   `h4`.
3. `preview` como função recebe `{ active: true }` sem IntersectionObserver; com movimento reduzido
   (`<MotionConfig reducedMotion="always">`), recebe `{ active: false }`.
4. `ProcessStepFrame`: `tone="dark"` tem a classe `dark`; `decorative` põe `aria-hidden`; `title`
   aparece.
5. `caption` aparece; sem ela, nada da régua.
6. Passo com `detail`: o botão "Ver detalhes de <título>" abre o diálogo com o título e o primeiro
   slide; "Próximo" e a seta do teclado vão ao segundo; os pontos marcam o atual com
   `aria-current`; nas pontas, a seta correspondente fica desabilitada.
7. Esc fecha o diálogo e o foco volta ao botão do passo.
8. Passo sem `detail` não tem botão.

## Story

`Flowtomic UI/Molecules/ProcessSteps`, `layout: "padded"`. Conteúdo próprio: como uma peça entra
no Flowtomic. Título "Estude. Escreva. Prove."; frase "Cada peça nova passa pelos mesmos três
passos, do site observado ao PR mergeado." Passos:

1. **"Observe só a tela"**: a spec nasce do que se vê no navegador, nunca do código do site.
   Mini-mock claro: uma lista de verificação (use o `Checkbox` do repo, desabilitado) com "Largo",
   "Celular", "Modo escuro", que ganha marcas uma a uma quando `active`.
2. **"Implemente pela spec"**: quem escreve o código só recebe a spec. Mini-mock **escuro**
   (`tone="dark"`, `title="day-timeline.tsx"`): duas linhas de código em mono que "digitam" com
   cursor quando `active` (sem lib nova: `useEffect` + `setInterval`, parado com movimento
   reduzido).
3. **"Prove no navegador"**: medida em 5 larguras e nos dois modos antes do PR. Mini-mock claro com
   uma fileira de 5 larguras ("390", "700", "900", "1100", "1440") que acendem uma a uma.

`caption`: "Cada estudo alimenta o próximo. Clique num passo para ver os detalhes." Só o passo 3 tem
`detail`, com 2 slides de mídia simples (um quadro com tokens, sem imagem externa).

- `Default`.
- `SemNumeros`: `numbering={false}`, 2 passos.
- `QuatroPassos`: 4 passos.
- `Estreito`: contêiner de 390 px.
- `Escuro`: wrapper com a classe `dark`.
