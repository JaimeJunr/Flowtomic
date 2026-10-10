# Spec de comportamento: `orbit-images`

> **Proveniência (clean room).** Escrita em 10/10/2026 a partir da demo pública "Orbit Images" em
> `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.

## O que a pessoa vê

Vários itens pequenos (avatares, logos, ícones) **giram devagar** em volta de um centro, ao longo
de um caminho: uma elipse achatada e levemente inclinada por padrão, ou círculo, quadrado,
estrela, coração, infinito ou onda. Os itens ficam igualmente espaçados e sempre de pé (não giram
com o caminho). No centro pode haver um conteúdo fixo (um número, um título). Opcionalmente o
caminho aparece como uma linha fina.

## Por que existe (uso no produto)

"Conectado aos seus bancos": logos de integrações orbitando o logo do produto; equipe em volta de
um número.

## API (`molecules/animation/orbit-images`)

```ts
type OrbitShape = "ellipse" | "circle" | "square" | "star" | "heart" | "infinity" | "wave";

type OrbitImagesProps = React.ComponentProps<"div"> & {
  /** Itens que orbitam. Cada um é um nó (img com alt, ícone, avatar). */
  items: React.ReactNode[];
  shape?: OrbitShape;                    // default "ellipse"
  /** Caminho próprio em coordenadas do viewBox 0..100; vence `shape`. */
  customPath?: string;
  /** Raios em % da largura/altura da área (elipse). */
  radiusX?: number;                      // default 42
  radiusY?: number;                      // default 14
  /** Raio em % do menor lado (demais formas). */
  radius?: number;                       // default 40
  /** Pontas da estrela e raio interno 0..1. */
  starPoints?: number;                   // default 5
  starInnerRatio?: number;               // default 0.5
  /** Inclinação do caminho em graus. */
  rotation?: number;                     // default -8
  /** Segundos por volta. */
  duration?: number;                     // default 40
  direction?: "normal" | "reverse";      // default "normal"
  /** Lado de cada item em px. */
  itemSize?: number;                     // default 56
  showPath?: boolean;                    // default false
  paused?: boolean;                      // default false
  /** Conteúdo fixo no centro. */
  centerContent?: React.ReactNode;
};
```

## Regras

1. **Geometria (função pura).** `orbitPath(shape, opts) → string` devolve um `d` de SVG num
   viewBox `0 0 100 100` centrado em (50,50). Para cada forma:
   - `ellipse`/`circle`: dois arcos;
   - `square`: quatro lados;
   - `star`: `2·starPoints` vértices alternando raio e raio·`starInnerRatio`;
   - `heart`: duas cúbicas simétricas;
   - `infinity`: lemniscata como 4 cúbicas;
   - `wave`: senoide horizontal de ida e volta (fechada).
2. **Posição no caminho.** Medir o caminho com um `<path>` real (`getTotalLength` /
   `getPointAtLength`), num SVG `absolute inset-0` com `viewBox="0 0 100 100"`,
   `preserveAspectRatio="none"` e `overflow-visible`. A rotação aplica no ponto (função pura
   `rotatePoint(x, y, deg)` em volta de 50,50). Os itens são `absolute` posicionados em `%`
   (`left: x%`, `top: y%`, `translate(-50%, -50%)`), então seguem o tamanho da área.
3. **Movimento.** `useFrameLoop`: fase `t = (now / (duration·1000)) mod 1` (invertida em
   `reverse`). Item `i` fica em `(t + i/n) mod 1` do comprimento. Escrever `left/top` por ref,
   sem re-render por quadro. Função pura `itemFraction(t, i, n, direction)`.
4. **jsdom/sem medição.** Se `getTotalLength` não existir (jsdom), usar a amostragem analítica da
   elipse (função pura `ellipsePoint(fraction, rx, ry)`) para a posição inicial. Os testes cobrem
   esse caminho.
5. **Caminho visível.** `showPath`: o `<path>` com `stroke="var(--border)"`, `fill="none"`,
   `vector-effect="non-scaling-stroke"` (atributos).
6. **Pausa.** `paused`, aba oculta (o `useFrameLoop` já trata) e foco dentro de um item
   (`focus-within`) param o giro.
7. **Área.** A raiz é `relative w-full` com `aspect-ratio: 16 / 9` padrão (sobrescrevível por
   `className`). O centro é `absolute inset-0 grid place-items-center`.

## Movimento reduzido

Itens parados nas posições iniciais, igualmente espaçados.

## Acessibilidade

- Raiz `role="group"`; os itens são uma lista (`ul`/`li`) para o leitor de tela anunciar quantos são.
- O SVG do caminho é `aria-hidden`.
- O centro é conteúdo normal.

## Marcação

- Raiz: `data-slot="orbit-images"`, `data-shape`, `ref`, `cn`.
- Partes: `orbit-images-path`, `orbit-images-item`, `orbit-images-center` (em `data-slot`).

## Testes mínimos

- `orbitPath` para cada forma começa com `M` e fecha com `Z`; estrela com N pontas tem 2N vértices.
- `rotatePoint` em 90° leva (100,50) para (50,100).
- `itemFraction` espaça igualmente e inverte em `reverse`.
- `ellipsePoint` em 0 e 0,25.
- Renderiza N itens numa lista; centro renderizado; `showPath` mostra o caminho.
- Movimento reduzido: posições fixas (iguais depois de avançar o tempo).
- `ref` e `className`.
