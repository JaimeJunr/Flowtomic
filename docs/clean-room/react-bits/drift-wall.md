# Spec de comportamento: `drift-wall`

> **Proveniência (clean room).** Escrita em 11/10/2026 a partir da demo pública "Drift Wall" em
> `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.

## O que a pessoa vê

Uma **parede de ladrilhos em perspectiva**: a parede inteira é inclinada em 3D (cai para trás e
gira um pouco para o lado), com várias **colunas que deslizam sem fim**, colunas vizinhas em
sentidos opostos e velocidades um pouco diferentes. As bordas somem num degradê. Os ladrilhos em
repouso ficam meio apagados; o ladrilho sob o mouse **acende e se aproxima** de quem olha. Mexer
o mouse inclina a parede de leve (paralaxe).

## Por que existe (uso no produto)

Fundo de hero ou de página de login mostrando muitas telas, cases ou integrações de uma vez.

## API (`molecules/data-display/drift-wall`)

```ts
type DriftWallItem = { id: string; label: string; image?: string; content?: React.ReactNode; href?: string };

type DriftWallProps = React.ComponentProps<"div"> & {
  items: DriftWallItem[];      // >= 1; vazio lança erro
  columns?: number;            // 1..12, default 5
  tileWidth?: number;          // px, default 200
  tileHeight?: number;         // px, default 132
  gap?: number;                // px, default 18
  tilt?: number;               // rotateX graus, default 16
  turn?: number;               // rotateY graus, default -14
  roll?: number;               // rotateZ graus, default 0
  perspective?: number;        // px, default 1200
  depth?: number;              // translateZ negativo px, default 120
  speed?: number;              // px/s, default 42
  direction?: "up" | "down";   // default "up"
  variance?: number;           // 0..1, default 0.45
  parallax?: number;           // 0 desliga, default 0.6
  pauseOnHover?: boolean;      // default false
  lift?: number;               // px de translateZ no hover, default 64
  fade?: number;               // 0..1, default 0.6
  dim?: number;                // opacidade em repouso 0..1, default 0.55
  grayscale?: boolean;         // default false
};
```

Ladrilho: `rounded-xl border border-border bg-card overflow-hidden`; `image` vira `<img alt>`;
com `href`, o ladrilho é `<a>`. Por cima de cada ladrilho em repouso, um véu `bg-background` com
opacidade `1 - dim`, que some no hover. `grayscale` aplica `grayscale` em repouso.

## Regras

1. **Distribuição (pura `distribute(items, columns)` → `DriftWallItem[][]`).** Coluna `c` recebe
   os itens `c, c+columns, …`; se uma coluna ficar com menos de 4, repete a lista girada para
   completar 4 (para o laço não ter buraco). Toda coluna tem pelo menos 1 item.
2. **Velocidade por coluna (pura `columnSpeed(c, columns, speed, variance, direction)`).**
   Sentido: colunas pares no `direction`, ímpares no oposto. Módulo:
   `speed · (1 + variance · s_c)` com `s_c` determinístico em -1..1 (ex.: `sin(c · 2.39)`).
   Retorna px/s com sinal (negativo = sobe).
3. **Laço.** Cada coluna renderiza a lista duas vezes, empilhada. Um `useFrameLoop` avança um
   `offset` por coluna (`offset += v · dt`) e o reduz módulo `alturaDaLista` (`n · (tileHeight +
   gap)`), aplicando `translateY` por `style.transform` direto no elemento (sem re-render).
4. **Palco 3D.** Wrapper com `perspective`; a parede tem `transform-style: preserve-3d` e
   `transform: translateZ(-depth) rotateX(tilt) rotateY(turn) rotateZ(roll)` mais a paralaxe. A
   parede é maior que a área (150%) para não mostrar canto.
5. **Paralaxe.** `pointermove` na raiz: ponteiro normalizado -1..1 soma até `parallax · 8` graus
   em rotateX/rotateY, com mola via `animate` do motion sobre MotionValues.
6. **Hover do ladrilho.** `translateZ(lift)` e véu a 0, com transição de 250 ms. Com
   `pauseOnHover`, o laço para enquanto o ponteiro estiver na raiz.
7. **Esmaecer.** Máscara na raiz: `radial-gradient` de `black` no centro para `transparent` nas
   bordas, com a parada interna em `(1 - fade) · 60%`. Com `fade 0`, sem máscara.

## Movimento reduzido

Laço parado (offset 0), sem paralaxe. O hover acende o ladrilho sem elevar.

## Acessibilidade

A raiz é decorativa por padrão: `aria-hidden` quando nenhum item tem `href`. Com `href`, as
duplicatas do laço ficam `aria-hidden` e `tabIndex={-1}`, para cada link aparecer uma vez só.

## Marcação

- Raiz `data-slot="drift-wall"`, `ref`, `cn`, `relative overflow-hidden`.
- Partes: `drift-wall-plane`, `drift-wall-column` (`data-column`), `drift-wall-tile`.

## Testes mínimos

- `distribute`: 15 itens em 5 colunas dá 3 por coluna completado a 4; 2 itens em 5 colunas não
  deixa coluna vazia.
- `columnSpeed`: pares e ímpares com sinais opostos; `variance 0` dá módulo igual a `speed`.
- Erros: `items` vazio, `columns` fora de 1..12, `variance`/`fade`/`dim` fora de 0..1.
- Laço com tempo falso move o `transform` da coluna; movimento reduzido não move.
- Duplicatas com `aria-hidden` e só um link por `href`.
