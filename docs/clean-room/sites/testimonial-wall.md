# TestimonialWall — spec clean room

Fonte observada: os murais de depoimentos de rerun.io, interviewcoder.co e finalroundai.com, vistos
só na tela em 12/10/2026, em 1440 e 390 px. Nenhum código, CSS ou asset dessas páginas foi lido.
Ver `README.md` desta pasta.

## O que se viu (resumo)

- **Rerun**: posts curtos de rede social em colunas de alturas desiguais: avatar, nome, @usuário,
  texto, às vezes uma imagem; o mural é cortado embaixo por um degradê para o fundo e um botão
  "ver mais" no meio dele.
- **Interview Coder**: cartões escuros com nome, estrelas e um trecho de conversa (print), em
  colunas desiguais.
- **Final Round**: 3 colunas masonry misturando dois tipos de cartão:
  - **texto**: avatar redondo, nome em negrito, estrelas pequenas embaixo do nome, data à direita
    em `muted`, título curto do depoimento em peso médio, corpo em `muted-foreground`;
  - **vídeo**: o cartão inteiro é a foto (quadro do vídeo), com nome e cargo sobrepostos no canto
    superior esquerdo sobre um degradê escuro, e um botão de play redondo, branco, no canto inferior
    direito.
  No pé do mural, uma **pílula escura flutuante** centrada: pilha de 4 avatares sobrepostos, a
  frase de prova ("+10 milhões de pessoas usam") e um link "Ver mais".
- Celular: uma coluna só, na ordem dos dados.

## Composição

Organism `TestimonialWall`. `<section>` com `@container`.

### Cabeçalho (opcional)
- `title` (ReactNode, `<h2>` por padrão, `headingLevel` 2 a 4), centralizado, `text-display-xs`
  abaixo de 768 px e `text-display-sm` acima, `text-balance`. Sem eyebrow em caixa alta.
- `description` opcional, `muted-foreground`, centralizada, até 56ch.

### Mural
- Colunas por **CSS columns**, não por JS: `columns-1`, `@min-[640px]:columns-2`,
  `@min-[1024px]:columns-3` (prop `columns` limita o máximo: 2 ou 3, padrão 3). `gap-4`, e cada
  cartão com `break-inside-avoid mb-4`. A ordem de leitura do leitor de tela é a ordem dos dados.
- Altura limitada opcional (`collapsedHeight`, ex. `"40rem"`): o mural corta com `overflow-hidden`
  e um degradê de `transparent` para `var(--background)` nos últimos 160 px, com um botão
  `outline` "Mostrar mais depoimentos" centrado sobre o degradê. Clicar expande (remove o limite e o
  degradê) e o botão some; o foco vai para o primeiro cartão que estava escondido. Sem
  `collapsedHeight`, nada disso aparece.

### Cartão de texto (`kind: "text"`)
- `rounded-xl border bg-card p-5`, `flex flex-col gap-3`.
- Linha de autor: `Avatar` do repo (imagem ou iniciais), nome (`text-sm font-semibold`), e embaixo
  o `role` (cargo/empresa) ou as estrelas; data à direita (`text-xs muted-foreground`, `<time>` com
  `dateTime`).
- Estrelas (`rating` 1 a 5, opcional): 5 ícones `Star` de 14 px, preenchidos com `--primary` até a
  nota e contornados em `muted-foreground` depois; o grupo tem `role="img"` e `aria-label`
  "Nota 4 de 5". Nota fracionária arredonda para o inteiro mais próximo nas estrelas, e o
  `aria-label` mostra o valor original com vírgula ("Nota 4,6 de 5").
- `title` opcional do depoimento (`text-base font-medium`), corpo (`text-sm muted-foreground`,
  parágrafos preservados se for ReactNode).
- `source` opcional (`{ label, href }`): link discreto no pé, "Ver no <label>", com ícone
  `ExternalLink` do lucide (nunca glifo de seta).
- `media` opcional (`{ src, alt }`): imagem no fim do cartão, `rounded-lg border`, largura total.

### Cartão de vídeo (`kind: "video"`)
- `rounded-xl overflow-hidden relative`, proporção `aspect-[4/5]` (prop `aspect` por item:
  `"portrait" | "square" | "landscape"` → 4/5, 1/1, 16/9).
- Fundo: `poster` (`<img>` com `alt` vazio, `object-cover`, decorativo porque o nome está no texto).
- Degradê escuro no topo, com nome (`font-semibold`) e cargo sobrepostos. Sem cor de paleta: a
  faixa do topo leva a classe `dark` local e o degradê vai de
  `color-mix(in oklch, var(--background) 70%, transparent)` a `transparent`, com o texto em
  `text-foreground` desse contexto escuro.
- Botão de play: círculo de 40 px no canto inferior direito, fundo `background`, ícone `Play`
  preenchido em `foreground`, `aria-label` "Assistir depoimento de <nome>".
- Clicar no play chama `onPlay(item)` se existir; se não, e houver `videoSrc`, troca o pôster por
  um `<video controls autoPlay playsInline>` no mesmo lugar, com `aria-label` "Depoimento de
  <nome>", e o foco vai para o vídeo. Sem `videoSrc` e sem `onPlay`, o botão de play não aparece.
- Com movimento reduzido, o `autoPlay` não é usado (o vídeo aparece pausado com os controles).

### Pílula de prova social (opcional, `proof`)
- Abaixo do mural (ou sobre o degradê, se houver `collapsedHeight`, à esquerda do botão em telas
  largas e acima dele no estreito), centrada.
- Pílula em `rounded-full`, contexto escuro local (classe `dark`), `bg-background text-foreground
  border`, `py-1.5 pl-1.5 pr-4`, `flex items-center gap-3`.
- Pilha de até 4 avatares de 28 px sobrepostos (`-ml-2` a partir do segundo, anel `ring-2
  ring-background`), depois o texto (`text-sm`), depois o link opcional (`proof.action`:
  `{ label, href }`) em `font-medium` com sublinhado no hover.
- Os avatares da pílula são decorativos (`aria-hidden`); o texto carrega o sentido.

## API

```ts
type TestimonialAuthor = { name: string; role?: ReactNode; avatarSrc?: string };

type TestimonialTextItem = {
  id: string;
  kind?: "text";                 // padrão
  author: TestimonialAuthor;
  rating?: number;               // 0..5
  date?: string;                 // ISO; exibida com dateFormatter
  title?: ReactNode;
  body: ReactNode;
  media?: { src: string; alt: string };
  source?: { label: string; href: string };
};

type TestimonialVideoItem = {
  id: string;
  kind: "video";
  author: TestimonialAuthor;
  poster: string;
  videoSrc?: string;
  aspect?: "portrait" | "square" | "landscape";
};

type TestimonialItem = TestimonialTextItem | TestimonialVideoItem;

type TestimonialWallProps = Omit<ComponentProps<"section">, "title"> & {
  items: TestimonialItem[];
  title?: ReactNode;
  description?: ReactNode;
  headingLevel?: 2 | 3 | 4;
  columns?: 2 | 3;               // máximo; padrão 3
  collapsedHeight?: string;
  expandLabel?: ReactNode;       // padrão "Mostrar mais depoimentos"
  proof?: { avatars: { src?: string; name: string }[]; text: ReactNode; action?: { label: ReactNode; href: string } };
  onPlay?: (item: TestimonialVideoItem) => void;
  dateFormatter?: (iso: string) => string;   // padrão: Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" })
};
```

`data-slot`: `testimonial-wall`, `testimonial-wall-header`, `testimonial-wall-grid`,
`testimonial-card` (com `data-kind="text" | "video"`), `testimonial-rating`,
`testimonial-wall-expand`, `testimonial-wall-proof`.

## Acessibilidade

- `<section aria-labelledby>` no título; sem título, `aria-label` "Depoimentos".
- O mural é uma lista (`<ul role="list">`, cada cartão em `<li>`), para o leitor anunciar "lista,
  N itens".
- Cada cartão é um `<figure>`: corpo em `<blockquote>`, autor em `<figcaption>`.
- O botão de expandir tem `aria-expanded` e `aria-controls` apontando para o mural.

## Estados que o teste deve cobrir

1. Renderiza a seção nomeada pelo título (ou "Depoimentos") e uma lista com um item por depoimento.
2. Cartão de texto: nome, cargo, título, corpo em `blockquote`, data em `<time dateTime>` formatada
   em pt-BR, e `dateFormatter` customizado.
3. Estrelas: `rating` 4 dá `aria-label` "Nota 4 de 5" e 4 estrelas preenchidas; 4.6 arredonda para
   5 preenchidas e o rótulo mostra "Nota 4,6 de 5"; sem `rating`, nada.
4. `source` vira link com "Ver no <label>"; `media` vira imagem com o `alt`.
5. Cartão de vídeo: `data-kind="video"`, nome sobreposto; com `onPlay`, o play chama `onPlay` com o
   item; sem `onPlay` e com `videoSrc`, o play troca o pôster por `<video>`; sem os dois, sem play.
6. `collapsedHeight`: o botão aparece com `aria-expanded="false"`; clicar expande, some e move o
   foco.
7. `proof`: texto e link renderizados; avatares `aria-hidden`; mais de 4 avatares mostra só 4.
8. `columns={2}` não aplica a classe de 3 colunas.
9. `headingLevel` muda o nível do título.

## Story

`Flowtomic UI/Organisms/TestimonialWall`, `layout: "padded"`. Conteúdo próprio, sem marca alheia e
sem foto de pessoa real: avatares por iniciais e pôsteres de vídeo como SVG em `data:` URI,
montados na própria story (formas abstratas, sem rosto). Se algum teste do `src/test` reprovar cor
fixa na story, gere o SVG com `getComputedStyle` lendo tokens do tema. Depoimentos sobre usar o Flowtomic: "Trocamos três
bibliotecas por uma", "O CLI copiou o componente e eu editei à vontade", etc. Pelo menos 8 itens,
2 de vídeo.

- `Default`: título "Quem já usa", 3 colunas, pílula de prova "Usado em mais de 40 projetos".
- `Recolhido`: `collapsedHeight="36rem"` com o botão.
- `DuasColunas`: `columns={2}`, só texto.
- `Estreito`: contêiner de 360 px.
- `Escuro`: wrapper com a classe `dark`.
