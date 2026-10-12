# SiteHeader, AnnouncementBar e SiteFooter — spec clean room

Fonte observada: cabeçalho, faixa de aviso e rodapé de openrouter.ai, vercel.com/ai-gateway e
rerun.io, vistos só na tela em 12/10/2026, em 1440 px e 390 px. Nenhum código, CSS ou asset
dessas páginas foi lido. Ver `README.md` desta pasta.

São três organisms independentes, que juntos formam a "moldura" de uma página de produto. Todos
copiam conteúdo por props; nenhum traz marca, link ou texto fixo.

## O que se viu (resumo)

- **Cabeçalho**: logo à esquerda; links de primeiro nível com chevron quando abrem menu; à direita,
  busca compacta com atalho (`⌘K` ou `/`), ícones sociais pequenos, um botão secundário
  contornado e **um** botão sólido. Altura ~56–64 px, fundo da página, régua fina embaixo. Fica
  fixo no topo ao rolar.
- **Sub-navegação** de produto (Vercel): segunda faixa, nome do produto em mono caixa alta à
  esquerda e abas em pílula (a ativa com fundo `muted`).
- **Faixa de aviso** (OpenRouter): logo abaixo do cabeçalho, largura total, fundo da marca bem
  clarinho, borda fina embaixo, ícone + texto + link sublinhado, centralizados; X para fechar à
  direita. No celular quebra em até 3 linhas, ícone à esquerda.
- **Celular**: links somem; ficam logo, uma ação sólida e o botão de menu (hambúrguer) que abre a
  navegação inteira. A sub-navegação vira faixa rolável na horizontal.
- **Rodapé**: coluna de marca à esquerda (logo, frase de uma linha, ícones sociais, copyright) e
  4–6 colunas de links com título; link pode ter selo ("Novo", "Vagas") e ícone de saída quando
  externo. Abaixo, régua e faixa de newsletter (título, frase, campo de e-mail + botão, letra miúda)
  ou faixa de "apoiado por". Última linha: copyright à esquerda, links legais pequenos à direita.

## 1. `AnnouncementBar` (organism)

### Composição
Faixa de largura total, `py-2.5 px-4`, texto `text-sm`, centralizado. Fundo
`color-mix(in oklch, var(--primary) 8%, var(--background))`, borda inferior
`color-mix(in oklch, var(--primary) 25%, var(--border))`. Ícone opcional (16 px, `text-primary`)
antes do texto. Link opcional depois do texto, sublinhado, `text-primary`. Botão de fechar (ícone
`X` 16 px, `muted-foreground`) colado à direita, fora do fluxo centralizado.

### Comportamento
- `dismissible` (padrão `true`). Fechar chama `onDismiss` e esconde a faixa.
- `storageKey` opcional: se dado, guarda o fechamento em `localStorage` (try/catch, sem quebrar se
  o storage falhar) e não mostra de novo. Sem `storageKey`, só esconde no estado.
- Controlado opcional: `open` + `onOpenChange`.
- Fechar anima a altura até 0 (motion, ~200 ms); com movimento reduzido, some seco.

### Acessibilidade
`<aside aria-label="Aviso">` (rótulo via prop `label`). Botão de fechar com `aria-label` "Fechar
aviso". Nada de `role="alert"`: o aviso não é urgente.

### API
```ts
type AnnouncementBarProps = Omit<ComponentProps<"aside">, "children"> & {
  children: ReactNode;                  // o texto
  icon?: ReactNode;
  action?: { label: ReactNode; href: string };
  dismissible?: boolean;                // padrão true
  storageKey?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onDismiss?: () => void;
  label?: string;                       // padrão "Aviso"
};
```
`data-slot`: `announcement-bar`, `announcement-bar-action`, `announcement-bar-dismiss`.

## 2. `SiteHeader` (organism)

### Composição
`<header>` com `@container`, altura 60 px, `px-6`, fundo `background` com 85% de opacidade e
`backdrop-blur` quando `sticky` (padrão `true`, `sticky top-0 z-40`), régua `border-b`.

Da esquerda para a direita:
1. **Logo** (`logo: ReactNode`, envolto em link para `logoHref`, padrão `/`).
2. **Navegação principal** (`nav: SiteNavItem[]`), 8 px depois do logo (ou centralizada com
   `align="center"`). Item simples = link `text-sm muted-foreground`, `foreground` no hover e
   quando `active`. Item com `items` = gatilho com chevron que abre painel (Radix NavigationMenu do
   repo), painel com lista de links (título + descrição opcional + ícone opcional) em 1 ou 2
   colunas.
3. Empurrado para a direita, **slot `search`** (ReactNode; ex.: um botão que parece campo, com
   `kbd` do atalho) e **slot `social`** (ícones).
4. **Ações** (`actions: SiteHeaderAction[]`): no máximo uma com `variant: "default"` (sólida);
   as outras `outline` ou `ghost`. O componente avisa em dev (console.warn) se vierem duas sólidas.

Abaixo de 768 px de contêiner: some a navegação, a busca vira só ícone, ficam as ações marcadas
`mobile: true` (padrão: a sólida) e um botão de menu (`Menu` do lucide) que abre um `Sheet`/drawer
do repo pela direita com: navegação inteira (itens com filhos viram grupos com título), busca e
todas as ações empilhadas em largura total.

**Sub-navegação** opcional (`subnav`): segunda faixa de 48 px com `title` (mono, `text-xs`,
caixa alta permitida aqui porque é o nome do produto, não eyebrow) e abas-link em pílula (ativa com
`bg-muted`). No estreito, rola na horizontal sem barra visível, com a aba ativa visível
(`scrollIntoView` no mount).

### Acessibilidade
- `<header>` com `<nav aria-label="Principal">`; sub-navegação em `<nav aria-label={title}>`.
- Item ativo com `aria-current="page"`.
- Link externo (`external: true`) abre em nova aba, com ícone `ExternalLink` e texto `sr-only`
  "(abre em nova aba)".
- Botão de menu: `aria-label` "Abrir menu", `aria-expanded`.
- Link "Pular para o conteúdo" como primeiro foco (`skipToContent`, href, padrão `#conteudo`),
  visível só no foco.

### API
```ts
type SiteNavLink = { label: ReactNode; href: string; description?: ReactNode; icon?: ReactNode;
  external?: boolean; badge?: ReactNode; active?: boolean };
type SiteNavItem = SiteNavLink | { label: ReactNode; items: SiteNavLink[]; columns?: 1 | 2 };
type SiteHeaderAction = { label: ReactNode; href?: string; onClick?: () => void;
  variant?: "default" | "outline" | "ghost"; mobile?: boolean };

type SiteHeaderProps = ComponentProps<"header"> & {
  logo: ReactNode;
  logoHref?: string;
  nav?: SiteNavItem[];
  align?: "start" | "center";
  search?: ReactNode;
  social?: ReactNode;
  actions?: SiteHeaderAction[];
  subnav?: { title?: ReactNode; items: SiteNavLink[] };
  sticky?: boolean;
  skipToContent?: string | false;
};
```
`data-slot`: `site-header`, `site-header-nav`, `site-header-actions`, `site-header-subnav`,
`site-header-mobile-menu`.

## 3. `SiteFooter` (organism)

### Composição
`<footer>` com `@container`, `border-t`, fundo `background`, `px-6 py-16`, conteúdo em largura
máxima (`max-w-6xl mx-auto`, prop `contained`, padrão `true`).

1. **Grade principal**: coluna de marca (`brand`: logo, `tagline` em `muted-foreground`, slot
   `social`) ocupando 2 frações; colunas de links (`columns`) dividindo o resto igualmente. Título da
   coluna `text-sm font-medium foreground`; links `text-sm muted-foreground`, `foreground` no hover,
   `space-y-3`. Link pode ter `badge` (Badge `secondary` pequeno) e `external` (ícone
   `ExternalLink` 12 px).
2. **Faixa opcional** (`band: ReactNode`) depois de uma régua: espaço livre para newsletter ou
   "apoiado por". O componente exporta também `SiteFooterNewsletter` pronto: título, frase, `<form>`
   com `Input` type email + `Button` sólido, e letra miúda abaixo; `onSubmit(email)`; estados
   `idle | loading | success | error` com mensagem (`aria-live="polite"`).
3. **Linha final**: régua, copyright (`copyright: ReactNode`) à esquerda, links legais (`legal:
   SiteNavLink[]`) `text-xs` à direita.

Responsivo por contêiner: < 640 px, marca em cima e colunas de links em 2 por linha; o newsletter
empilha campo e botão; linha final empilha. 640–1024 px: marca em cima, links em até 4 colunas.
≥ 1024 px: tudo numa linha.

### Acessibilidade
- Cada coluna é um `<nav aria-labelledby>` apontando para o título da coluna (título em `<h2>` com
  classe de tamanho pequeno, prop `headingLevel` padrão 2).
- Newsletter: `<label>` visível ou `sr-only` "E-mail"; erro ligado por `aria-describedby`.

### API
```ts
type SiteFooterColumn = { title: ReactNode; links: SiteNavLink[] };
type SiteFooterProps = ComponentProps<"footer"> & {
  brand?: { logo: ReactNode; href?: string; tagline?: ReactNode };
  social?: ReactNode;
  columns: SiteFooterColumn[];
  band?: ReactNode;
  copyright?: ReactNode;
  legal?: SiteNavLink[];
  contained?: boolean;
  headingLevel?: 2 | 3 | 4;
};
type SiteFooterNewsletterProps = Omit<ComponentProps<"form">, "onSubmit"> & {
  title: ReactNode;
  description?: ReactNode;
  placeholder?: string;
  submitLabel?: ReactNode;          // padrão "Inscrever"
  finePrint?: ReactNode;
  onSubmit: (email: string) => void | Promise<void>;
  successMessage?: ReactNode;       // padrão "Inscrição feita. Confira seu e-mail."
};
```
`data-slot`: `site-footer`, `site-footer-column`, `site-footer-band`, `site-footer-bottom`,
`site-footer-newsletter`.

## Tipos compartilhados
`SiteNavLink` é o mesmo tipo nos dois organisms. Defina num arquivo `types.ts` dentro de
`site-header/` e reexporte em `site-footer/` (ou num `lib/` compartilhado, se o CLI exigir: ver
armadilha do `flowtomic-cli add` no `CLAUDE.md`).

## Estados que o teste deve cobrir

AnnouncementBar:
1. Renderiza texto, ícone e link; `aside` com rótulo.
2. Fechar chama `onDismiss` e some; com `storageKey`, não reaparece ao remontar; storage que lança
   erro não quebra.
3. `dismissible={false}` sem botão.

SiteHeader:
4. Logo com link; links principais com `aria-current` no ativo.
5. Item com filhos abre painel com os links e descrições.
6. Externo com ícone e texto "(abre em nova aba)", `target="_blank"` e `rel="noreferrer"`.
7. Uma ação sólida e as outras contornadas; duas sólidas disparam `console.warn`.
8. Modo estreito (forçar via prop de teste `layout?: "auto" | "desktop" | "mobile"`): botão de
   menu abre o painel com navegação e ações.
9. Sub-navegação com título e aba ativa.
10. Link de pular para o conteúdo existe e aponta para o alvo.

SiteFooter:
11. Uma `nav` por coluna, nomeada pelo título.
12. Selo e ícone de externo nos links.
13. Copyright e links legais.
14. Newsletter: envia o e-mail digitado, mostra carregando, sucesso e erro (promessa rejeitada)
    em região `aria-live`.

## Stories

`Flowtomic UI/Organisms/SiteHeader`, `.../AnnouncementBar`, `.../SiteFooter`, `layout:
"fullscreen"`. Conteúdo do próprio Flowtomic, sem marca alheia: logo = wordmark "flowtomic" em
texto; nav "Componentes" (com filhos Atoms/Molecules/Organisms/Blocks e descrições), "Blocks",
"Docs" (externo), "Changelog"; ações "GitHub" (outline) e "Instalar" (sólida); aviso "A 1.0 saiu:
React 19 em todos os componentes." com link "Ler o changelog"; rodapé com colunas "Biblioteca",
"Recursos", "Projeto", newsletter "Novidades da biblioteca". Uma story `PaginaCompleta` monta os
três com um conteúdo de exemplo no meio, e uma `Estreito` em 390 px.
