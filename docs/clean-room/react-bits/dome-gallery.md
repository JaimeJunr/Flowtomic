# Spec de comportamento: `dome-gallery`

> **Proveniência (clean room).** Escrita em 11/10/2026 a partir da demo pública "Dome Gallery" em
> `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**. A
> demo usa uma biblioteca de gestos; aqui o arraste é próprio, com Pointer Events.

## O que a pessoa vê

A pessoa está **dentro de uma esfera**: a parede interna é coberta de ladrilhos com imagem, em
fileiras, e a área mostra um pedaço da cúpula (os ladrilhos do centro grandes, os das bordas
encurvados e menores). **Arrastar gira a esfera** (horizontal sem limite, vertical com limite
pequeno), com inércia ao soltar. As bordas da área escurecem num vinheta. **Clicar num
ladrilho** abre a imagem ampliada no centro, por cima de um véu; clicar fora ou `Esc` fecha.

## Por que existe (uso no produto)

Galeria imersiva: portfólio, mural de clientes, acervo de fotos de evento.

## API (`molecules/data-display/dome-gallery`)

```ts
type DomeItem = { id: string; label: string; image?: string; content?: React.ReactNode };

type DomeGalleryProps = React.ComponentProps<"div"> & {
  items: DomeItem[];                  // >= 1
  fit?: number;                       // 0.1..1.5, fração do tamanho da área, default 0.5
  fitBasis?: "auto" | "min" | "max" | "width" | "height"; // default "auto"
  minRadius?: number;                 // px, default 600
  maxRadius?: number;                 // px, default Infinity
  segments?: number;                  // 8..60, colunas da esfera, default 35
  maxVerticalRotation?: number;       // graus, default 5
  dragSensitivity?: number;           // px por grau, default 20
  dragDampening?: number;             // 0..5, default 2 (mais alto, para mais rápido)
  openedSize?: { width: string; height: string }; // default 400px x 400px
  tileRadius?: number;                // px, default 30
  grayscale?: boolean;                // default true
  onOpenChange?: (item: DomeItem | null) => void;
};
```

## Regras

1. **Grade (pura `domeTiles(count, segments)` → `{ col, row, sizeX, sizeY, item }[]`).** Colunas
   `0..segments-1` em longitude; fileiras alternadas deslocadas meia coluna (como tijolos); 5
   fileiras centradas no equador (`row` -2..2), ladrilho 2x2 unidades. Itens preenchem as
   posições em ordem e repetem quando acabam (`item = items[i % n]`).
2. **Ângulos.** Cada unidade vale `360/segments` graus. Ladrilho em `(col, row)`:
   `rotateY(col · unit) rotateX(-row · unit) translateZ(-radius)`.
3. **Raio (pura `domeRadius(w, h, fit, fitBasis, min, max)`).** `basis` =
   `auto`→`max(w,h)` se a proporção for > 1.3, senão `min(w,h)`; `min`/`max`/`width`/`height`
   literais. `radius = clamp(basis · fit, minRadius, maxRadius)`. Medido por ResizeObserver.
4. **Arraste.** `pointerdown` na raiz captura; `rotY += Δx / dragSensitivity`,
   `rotX = clamp(rotX - Δy / dragSensitivity, -maxVerticalRotation, maxVerticalRotation)`. Ao
   soltar, velocidade continua e decai multiplicando por `0.95^(dragDampening)` por quadro de
   16 ms, até `|v| < 0.01`. Escreve `transform` direto na esfera (`useFrameLoop`, sem
   re-render). `select-none`, `touch-action: none`. Arraste maior que 5 px não conta como
   clique.
5. **Abrir.** Clique (ou `Enter`) num ladrilho abre: um véu `bg-background/70` com `backdrop-blur`
   cobre a área, e uma cópia do item aparece no centro com `openedSize`, animando de `scale 0.6
   opacity 0` para `1` (mola). `Esc`, clique no véu ou no botão fechar fecham e devolvem o foco ao
   ladrilho. `onOpenChange` avisa.
6. **Vinheta.** Camada `pointer-events-none` com `radial-gradient(transparent 60%,
   var(--background))` e uma faixa no topo e na base com `linear-gradient` para
   `var(--background)`.
7. **Ladrilho.** `bg-card border border-border overflow-hidden` com `tileRadius`; `image` vira
   `<img alt={label} draggable={false}>`; `grayscale` aplica a classe `grayscale` (some no
   hover e no aberto).

## Movimento reduzido

Sem inércia (para ao soltar) e abertura sem mola (aparece direto).

## Acessibilidade

Raiz `role="region"` com `aria-roledescription="galeria"`, `aria-label`. Ladrilhos são
`<button type="button" aria-label={label}>`; as repetições (i >= n) ficam `aria-hidden` e
`tabIndex={-1}`. Setas do teclado na raiz giram 1 unidade. O aberto é `role="dialog"`
`aria-modal="true"` com `aria-label={label}` e botão "Fechar".

## Marcação

- Raiz `data-slot="dome-gallery"`, `ref`, `cn`, `relative overflow-hidden`.
- Partes: `dome-gallery-sphere`, `dome-gallery-tile`, `dome-gallery-viewer`.

## Testes mínimos

- `domeTiles`: quantidade = `segments · 5` com repetição; fileiras ímpares deslocadas.
- `domeRadius`: respeita `fitBasis`, `minRadius` e `maxRadius`.
- Erros: `items` vazio, `segments` fora de 8..60, `fit` fora de 0.1..1.5.
- Arraste altera o transform; vertical respeita o limite; arraste longo não abre.
- Clique abre o diálogo, `Esc` fecha e devolve o foco; `onOpenChange` recebe item e `null`.
