# Spec de comportamento: `scroll-expand-media`

> **Proveniência (clean room).** Escrita em 10/10/2026 a partir da demo pública "Scroll Expand" em
> `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.

## O que a pessoa vê

Uma seção alta com uma **moldura** pequena e arredondada no meio da tela, com uma mídia (imagem
ou vídeo) dentro, levemente ampliada. Um título fica por cima da moldura e uma dica pequena embaixo
("Role para ver"). Ao rolar a página, a moldura **cresce** até ocupar a tela toda, os cantos perdem
o arredondado e a mídia **desampliada** volta ao tamanho natural. O título sobe e some, a dica some
logo no começo, e quando a mídia toma a tela inteira aparece um conteúdo por cima dela (texto,
botão), sobre um degradê escuro que garante a leitura. A moldura fica **presa** na tela enquanto
expande, e segura um pouco em tela cheia antes de a página seguir.

## Por que existe (uso no produto)

Hero de landing ("veja a plataforma") que abre um vídeo do produto ou um print do painel.

## API (`molecules/animation/scroll-expand-media`)

```ts
type ScrollExpandMediaProps = Omit<React.ComponentProps<"section">, "title"> & {
  /** Mídia: um nó React (img, video, componente). O componente só a enquadra. */
  media: React.ReactNode;
  title?: React.ReactNode;
  scrollHint?: React.ReactNode;
  /** Largura e altura da moldura em repouso, em % da área visível. */
  startWidth?: number;     // default 42
  startHeight?: number;    // default 58
  /** Raio em px em repouso e expandido. */
  startRadius?: number;    // default 24
  endRadius?: number;      // default 0
  /** Zoom da mídia em repouso; vai a 1 ao expandir. */
  mediaZoom?: number;      // default 1.35
  /** Comprimento da rolagem da expansão, em alturas de tela. */
  scrollDistance?: number; // default 1.2
  /** Rolagem extra presa em tela cheia, em alturas de tela. */
  holdDistance?: number;   // default 0.35
  /** Força do degradê por baixo do conteúdo final, 0..1. */
  overlayScrim?: number;   // default 0.45
  /** Conteúdo que aparece sobre a mídia em tela cheia. */
  children?: React.ReactNode;
};
```

## Regras

1. **Estrutura (sticky, sem JS de layout).** Raiz `<section className="relative">` com altura
   `calc(100vh * (1 + scrollDistance + holdDistance))`. Dentro, um palco
   `sticky top-0 h-screen overflow-hidden grid place-items-center`. No palco, a moldura
   (`data-slot="scroll-expand-media-frame"`) com `overflow-hidden` e a mídia ocupando tudo
   (`size-full object-cover` vale para o filho via `[&>*]:size-full [&>*]:object-cover`).
2. **Progresso.** `useScroll({ target: rootRef, offset: ["start start", "end end"] })` do motion dá
   0..1 na seção. O progresso da expansão é `p = clamp(raw · total / scrollDistance, 0, 1)`, onde
   `total = scrollDistance + holdDistance` (função pura `expandProgress(raw, scrollDistance,
   holdDistance)`).
3. **Interpolação.** Função pura `frameAt(p, opts) → { widthPct, heightPct, radius, zoom }`:
   linear de `start*` para 100 %, de `startRadius` para `endRadius`, de `mediaZoom` para 1, com
   ease-out cúbico em `p`. Aplicada com `useTransform` em `width`, `height`, `borderRadius` e
   `scale` da mídia (sem re-render por quadro).
4. **Título e dica.** Título: opacidade `1 - p/0.4`, sobe `-40px · p` (some antes de 40 %). Dica:
   opacidade `1 - p/0.08`.
5. **Conteúdo final.** `children` numa camada `absolute inset-0` sobre a mídia; opacidade
   `(p - 0.85)/0.15` limitada a 0..1; `pointer-events-none` enquanto opacidade < 1. Por baixo dele,
   um degradê `linear-gradient(to top, color-mix(in oklab, var(--foreground) <overlayScrim·100>%,
   transparent), transparent 60%)` com a mesma opacidade. Texto do conteúdo em
   `text-background` (contrasta com o degradê nos dois temas).
6. Fundo do palco `bg-background`; moldura com `bg-muted` enquanto a mídia carrega.

## Movimento reduzido

Sem expansão: a seção tem altura normal (`h-auto`), a moldura já em tela cheia (`aspect-video
w-full`, raio `endRadius`), sem zoom, título e conteúdo visíveis, sem sticky.

## Acessibilidade

- `aria-label` opcional na `section`; o título é o nome natural (renderizado como `h2` quando for
  string).
- Conteúdo final invisível fica `aria-hidden` e com `inert` até aparecer.
- A dica é `aria-hidden` (é instrução visual).

## Marcação

- Raiz: `data-slot="scroll-expand-media"`, `ref`, `cn`, props nativas.
- Partes: `scroll-expand-media-frame`, `scroll-expand-media-title`, `scroll-expand-media-hint`,
  `scroll-expand-media-content` (em `data-slot`).

## Testes mínimos

- `expandProgress`: 0 → 0; fim da expansão → 1; durante o hold continua 1; lança erro com
  `scrollDistance ≤ 0` (mensagem com o valor recebido).
- `frameAt`: p=0 dá os valores `start*` e `mediaZoom`; p=1 dá 100 %, `endRadius` e 1; p=0,5 fica
  entre.
- Renderiza mídia, título e dica; altura da raiz com `scrollDistance` e `holdDistance`.
- Conteúdo final começa `aria-hidden`.
- Movimento reduzido: sem sticky, conteúdo visível e sem `aria-hidden`.
- `ref` e `className`.
