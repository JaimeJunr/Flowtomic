# Spec de comportamento: `helix-gallery`

> **Proveniência (clean room).** Escrita em 11/10/2026 a partir da demo pública "Infinite
> Spiral" em `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi
> lido**.

## O que a pessoa vê

Cartões quadrados dispostos numa **hélice vertical** (uma mola) em 3D, girando e subindo sem fim.
Os cartões da frente da hélice ficam maiores e nítidos; os de trás, menores. Perto do topo e da
base, eles **somem e desfocam**. Ao parar o mouse em cima, o movimento **desacelera até parar**.
Opcionalmente dá para arrastar ou rolar a página para girar.

## Por que existe (uso no produto)

Galeria de destaque em página de produto ou hero: telas, cases, depoimentos em imagem.

## API (`molecules/data-display/helix-gallery`)

```ts
type HelixItem = { id: string; label: string; image?: string; content?: React.ReactNode; href?: string };

type HelixGalleryProps = React.ComponentProps<"div"> & {
  items: HelixItem[];                 // >= 1
  speed?: number;                     // cartões por segundo, default 0.55
  direction?: "up" | "down";          // default "up"
  mode?: "auto" | "drag" | "scroll" | "all"; // default "auto"
  radius?: number;                    // px, default 170
  cardWidth?: number;                 // px, default 100
  cardHeight?: number;                // px, default 100
  verticalSpacing?: number;           // px entre vizinhos, default 60
  perspective?: number;               // px, default 1000
  cardsPerTurn?: number;              // >= 3, default 7
  rotation?: number;                  // graus, default 0
  cardTilt?: number;                  // graus, default 0
  centerScale?: number;               // default 1.2
  edgeFade?: number;                  // 0..0.5, default 0.3
  edgeBlur?: number;                  // px, default 6
  pauseOnHover?: boolean;             // default true
  fit?: "cover" | "contain";          // default "cover"
};
```

Cartão: `rounded-[var(--r)]` com raio 10 px, `bg-card border border-border overflow-hidden`.

## Regras

1. **Posição (pura `helixSlot(i, progress, opts)` → `{ angle, y, z, scale, opacity, blur }`).**
   `t = i - progress` (posição contínua do cartão no laço). Os slots visíveis são
   `slotCount = max(items.length, cardsPerTurn · 2)`: renderiza `slotCount` cartões, o slot `k`
   mostra `items[k % n]`. `t` é reduzido ao intervalo `[-slotCount/2, slotCount/2)`.
   - `angle = rotation + t · 360 / cardsPerTurn`
   - `y = t · verticalSpacing` (sentido de `direction`: `up` faz `progress` crescer e os cartões
     subirem)
   - `z = cos(angle) · radius`, `x = sin(angle) · radius`
   - `scale = 1 + (centerScale - 1) · max(0, cos(angle)) · (1 - |t|/(slotCount/2))`
   - `edge = clamp((|t|/(slotCount/2) - (1 - edgeFade)) / edgeFade, 0, 1)`; `opacity = 1 - edge`,
     `blur = edge · edgeBlur`.
   Transform: `translate3d(x, y, z) rotateY(angle) rotateZ(cardTilt)` mais `scale`.
2. **Laço.** `useFrameLoop` avança `progress += speed · dt · velocityFactor` e escreve o
   transform direto em cada cartão (sem re-render). `velocityFactor` vai a 0 em ~400 ms quando o
   ponteiro entra (com `pauseOnHover`) e volta a 1 ao sair (aproximação exponencial).
3. **Arrastar** (`drag`/`all`): `pointerdown` captura; `Δy` em px vira `Δprogress = -Δy /
   verticalSpacing`; ao soltar, a inércia decai em ~600 ms. `select-none` e `touch-action: none`.
4. **Rolagem** (`scroll`/`all`): `scroll` da janela soma `Δscroll / verticalSpacing · speed`.
5. **Palco.** Raiz com `perspective`; palco central `preserve-3d`. Atenção: nada de `filter`
   nos ancestrais da cadeia 3D (o blur vai no próprio cartão).

## Movimento reduzido

Sem laço automático nem inércia: a hélice aparece parada em `progress 0`. Arrastar ainda move
(resposta direta), sem inércia.

## Acessibilidade

Raiz `role="region"` com `aria-roledescription="galeria"` e `aria-label`. Cada item aparece uma
vez na árvore acessível: as cópias de slot (k >= n) ficam `aria-hidden`. Com `href`, o cartão é
`<a>`; com foco por teclado nele, o laço pausa.

## Marcação

- Raiz `data-slot="helix-gallery"`, `ref`, `cn`, `relative overflow-hidden`.
- Partes: `helix-gallery-stage`, `helix-gallery-card` (`data-slot-index`).

## Testes mínimos

- `helixSlot`: `t 0` fica em `x 0`, `z radius`, escala `centerScale`; um passo de
  `cardsPerTurn` volta ao mesmo ângulo; bordas com `opacity 0` e blur máximo.
- Erros: `items` vazio, `cardsPerTurn < 3`, `edgeFade` fora de 0..0.5.
- Tempo falso: o transform muda com `mode auto`; movimento reduzido não muda.
- Arrasto muda o transform; cópias com `aria-hidden`.
