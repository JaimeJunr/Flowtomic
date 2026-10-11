# Spec de comportamento: `color-spotlight-grid`

> **Proveniência (clean room).** Escrita em 11/10/2026 a partir da demo pública "Chroma Grid" em
> `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.

## O que a pessoa vê

Uma grade de cartões com imagem (ou conteúdo) **em tons de cinza e um pouco escurecidos**. Um
**holofote circular segue o mouse** pela grade e, dentro dele, as cores **voltam**; a borda dos
cartões perto do mouse acende na cor de destaque do cartão, e um brilho sobe do rodapé do cartão
iluminado. Ao sair da grade, as cores **apagam devagar**. Variante: em vez do holofote, o cartão
inteiro sob o mouse ganha cor.

## Por que existe (uso no produto)

Galeria de cases, equipe ou produtos com um toque de interação sem distrair do conteúdo.

## API (`molecules/data-display/color-spotlight-grid`)

```ts
type SpotlightGridItem = {
  id: string; title: string; subtitle?: string; content: React.ReactNode; href?: string;
};

type ColorSpotlightGridProps = React.ComponentProps<"div"> & {
  items: SpotlightGridItem[];
  reveal?: "spotlight" | "card";   // default "spotlight"
  columns?: number;                // máximo de colunas, 1..6, default 3
  minCardWidth?: number;           // px, default 180
  gap?: number;                    // px, default 12
  radius?: number;                 // raio do holofote px, default 260
  softness?: number;               // 0..1, default 0.6
  damping?: number;                // 0..0.95, default 0.45 (0 = segue exato)
  fadeOut?: number;                // s, default 0.6
  grayscale?: number;              // 0..1, default 1
  dim?: number;                    // 0..1, default 0.12
  aspectRatio?: string;            // default "3 / 2"
  showInfo?: boolean;              // default true
};
```

## Regras

1. **Grade.** CSS grid com `grid-template-columns: repeat(auto-fill, minmax(max(minCardWidth,
   (100% - gap·(columns-1))/columns), 1fr))`. Cartão: `rounded-2xl border border-border bg-card
   overflow-hidden`; mídia com `aspectRatio`; info (título `text-sm font-medium`, subtítulo
   `text-xs text-muted-foreground`) embaixo.
2. **Duas camadas por cartão.** A mídia é renderizada **duas vezes**, sobrepostas: a de baixo com
   `filter: grayscale(g) brightness(1 - dim)`; a de cima colorida, recortada por uma **máscara**
   `radial-gradient(circle var(--r) at var(--x) var(--y), black <interno>, transparent 100%)`, onde
   `--x/--y` são a posição do holofote **relativa ao cartão** e `<interno> = (1 - softness)·100%`.
   A cópia de cima é `aria-hidden`.
3. **Holofote (`spotlight`).** `pointermove` na raiz atualiza um alvo; um `useFrameLoop` aproxima a
   posição atual do alvo (`pos += (alvo - pos) · (1 - damping)` por quadro) e escreve `--x/--y`
   em cada cartão (posição do ponteiro menos o retângulo do cartão, lidos uma vez por quadro). Ao
   sair, `--r` anima de `radius` a 0 em `fadeOut` s; ao entrar, de 0 a `radius` em 0,25 s.
4. **Modo `card`.** Sem máscara: a cópia colorida do cartão sob o ponteiro vai a opacidade 1 em
   0,25 s; as outras a 0 em `fadeOut`.
5. **Borda e brilho.** Cada cartão tem uma borda de 1 px `var(--primary)` mascarada pelo mesmo
   holofote (só acende perto do ponteiro) e um brilho no rodapé: `linear-gradient` de
   `color-mix(in oklch, var(--primary) 35%, transparent)` a `transparent`, com opacidade igual à
   proximidade do ponteiro ao cartão (0..1).

## Movimento reduzido

Holofote segue o ponteiro sem amortecimento e o apagar é instantâneo. (É resposta direta, não
animação autônoma.)

## Acessibilidade

Raiz `role="list"`; cartão `role="listitem"`; com `href`, o cartão é `<a>` com o `title` como
nome. Foco por teclado num cartão revela a cor dele inteiro (como o modo `card`).

## Marcação

- Raiz `data-slot="color-spotlight-grid"`, `ref`, `cn`; cartões
  `data-slot="color-spotlight-grid-card"`; camadas `-base`, `-color`.

## Testes mínimos

- Pura `spotMask(softness)` e `stepToward(pos, alvo, damping)` (com `damping 0` chega em 1 passo).
- Erros: `columns` fora de 1..6, `softness`/`grayscale`/`dim` fora de 0..1, `damping` fora de
  0..0.95.
- `pointermove` (rect falso) escreve `--x/--y` relativos no cartão; sair agenda o apagar.
- Modo `card`: o cartão sob o ponteiro ganha `data-revealed`.
- Foco por teclado revela o cartão; a cópia colorida é `aria-hidden`.
