# Spec de comportamento: `glass-surface`

> **Proveniência (clean room).** Escrita em 10/10/2026 a partir da demo pública "Glass Surface" em
> `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.

## O que a pessoa vê

Uma superfície de **vidro**: o que está atrás aparece desfocado e **distorcido nas bordas**, como
uma lente grossa, com um leve **arco-íris** (aberração cromática) no contorno. O centro é limpo;
a distorção cresce perto da borda. Serve de contêiner para qualquer conteúdo (barra de navegação,
pílula, cartão). Onde o navegador não aplica filtro SVG no fundo, vira um vidro fosco simples.

## Por que existe (uso no produto)

Barra de navegação flutuante, pílula de ação e cartões por cima de hero com imagem ou gradiente.

## API (`atoms/display/glass-surface`)

```ts
type GlassSurfaceProps = React.ComponentProps<"div"> & {
  /** Raio em px; deve bater com o arredondamento visual. */
  radius?: number;              // default 20
  /** Espessura da borda que distorce, fração do menor lado (0..0.5). */
  edge?: number;                // default 0.07
  /** Força da distorção (px de deslocamento). Negativo puxa para dentro. */
  distortion?: number;          // default -180
  /** Separação entre canais para o arco-íris, px. */
  chroma?: number;              // default 10
  /** Desfoque do fundo em px. */
  blur?: number;                // default 11
  /** Opacidade do véu de cor por cima (token --background). */
  frost?: number;               // 0..1, default 0
  saturation?: number;          // default 1
};
```

## Regras

1. **Mapa de deslocamento.** Um SVG gerado em string (pura `displacementMapSvg(width, height,
   radius, edge)`) com: retângulo base cinza médio (sem deslocamento) e dois gradientes lineares
   (horizontal no canal R, vertical no canal G) recortados por um retângulo arredondado interno
   (`edge` · menor lado de margem) com desfoque, de modo que o centro fica neutro e a borda varia.
   Convertido em `data:image/svg+xml,` com `encodeURIComponent`. Os valores do mapa são
   intensidades de canal, não cores de tema; gerar com `hsl(0 0% 50%)` e afins para não usar
   hex nem `rgb(` (o teste de tokens proíbe).
2. **Filtro.** Um `<svg>` oculto (`aria-hidden`, `width=0 height=0 absolute`) com `<filter id>`
   único (`useId`, sem `:`): `feImage` com o mapa → três `feDisplacementMap` (escala
   `distortion`, `distortion + chroma`, `distortion + 2·chroma`) isolando R, G e B por
   `feColorMatrix` → recombinados com `feBlend mode="screen"` → `feGaussianBlur` leve (0,7).
3. **Aplicação.** A raiz `relative isolate overflow-hidden` com `border-radius: radius` e
   `backdrop-filter: url(#id) blur(<blur>px) saturate(<saturation>)` quando suportado.
   Suporte (pura `supportsSvgBackdrop(env)` com ambiente injetado): navegadores Chromium; falso em
   Safari e Firefox (detecção por `CSS.supports("backdrop-filter", "url(#x)")` mais ausência de
   `safari`/`firefox` no `userAgent`).
4. **Fallback.** Sem suporte: `backdrop-filter: blur(<blur>px) saturate(<saturation>)`,
   `bg-background/40`, `border border-border/50` e brilho interno `shadow-inner`.
5. **Medida.** ResizeObserver na raiz atualiza `width/height` do mapa (debounced por rAF).
6. **Véu.** Camada `absolute inset-0 bg-background` com `opacity = frost`, `pointer-events-none`.
   Conteúdo `relative z-10`.

## Movimento reduzido

Nada anima; sem diferença.

## Acessibilidade

Puramente visual: conteúdo filho com semântica própria; SVG do filtro `aria-hidden`.

## Marcação

- Raiz: `data-slot="glass-surface"`, `data-mode="svg" | "fallback"`, `ref`, `cn`.
- Partes: `glass-surface-filter`, `glass-surface-frost`, `glass-surface-content`.

## Testes mínimos

- `displacementMapSvg` gera SVG válido com as dimensões, o raio e dois gradientes; `edge` fora de
  0..0,5 lança erro com o valor; sem hex nem `rgb(` na string.
- `supportsSvgBackdrop`: Chromium verdadeiro; Safari e Firefox falsos; sem `CSS.supports` falso.
- Renderiza filhos; `data-mode="fallback"` no jsdom; filtro com três `feDisplacementMap` e escalas
  certas; id sem `:`.
- `frost` vira opacidade do véu; `radius` vai ao `border-radius`.
- `ref` e `className`.
