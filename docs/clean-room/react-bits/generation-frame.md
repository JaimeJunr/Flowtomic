# Spec de comportamento: `generation-frame`

> **Proveniência (clean room).** Escrita em 09/10/2026 a partir da demo pública "Refine Frame" em
> `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.

## O que a pessoa vê

Um quadro reservado para uma imagem gerada por IA, com a proporção fixa desde o início (nada pula
quando a imagem chega). A imagem passa por estágios, e **cada troca de estágio interpola** o
tratamento visual: **na fila** (quase invisível, muito desfocada e pixelada), **gerando**
(desfocada, baixa saturação), **refinando** (quase nítida), **pronta** (nítida). Enquanto
trabalha, uma **faixa suave** atravessa o quadro em diagonal, em loop. Um chip no canto mostra o
estágio ("Gerando") com uma marca animada; ao ficar pronta, o chip vira "Pronta" e some depois de
1,2 s. Em erro, o quadro fica apagado com um chip "Falhou" e uma pílula "Tentar de novo".

## API (`molecules/data-display/generation-frame`)

```ts
type GenerationStatus = "queued" | "generating" | "refining" | "complete" | "error";
type GenerationFrameProps = Omit<React.ComponentProps<"figure">, "children"> & {
  status?: GenerationStatus;                 // default "generating"
  children?: React.ReactNode;                // <img>, <video> ou <canvas>; preenche o quadro
  aspectRatio?: string;                      // default "4 / 3"
  stageMs?: number;                          // default 400
  sweep?: boolean;                           // default true
  showStatus?: boolean;                      // default true
  hideAfterMs?: number;                      // default 1200; 0 mantém o chip
  labels?: Partial<Record<GenerationStatus, string>>; // default Na fila, Gerando, Refinando, Pronta, Falhou
  retryLabel?: string;                       // default "Tentar de novo"
  onRetry?: () => void;                      // sem ele, sem pílula
  caption?: React.ReactNode;                 // <figcaption> opcional
};
```

## Regras

1. **Tratamento por estágio** (tabela pura `STAGE_STYLE[status]` → `{ blur, saturate, opacity, scale }`):
   fila `{24px, 0.2, 0.35, 1.06}`, gerando `{14px, 0.5, 0.7, 1.04}`, refinando `{4px, 0.85, 0.95, 1.01}`,
   pronta `{0, 1, 1, 1}`, erro `{8px, 0, 0.4, 1}`. Aplicado ao wrapper da mídia como
   `filter: blur() saturate()` + opacidade + escala, animado em `stageMs`. Função pura
   `stageFilter(status)` → string do `filter`.
2. **Faixa:** com `sweep` e status em fila/gerando/refinando, um elemento `aria-hidden` com
   gradiente linear `transparent → color-mix(in oklab, var(--background) 35%, transparent) → transparent`
   atravessa em diagonal em loop (1,6 s).
3. **Fundo (só tokens):** papel `bg-muted`, chip `bg-background/80 backdrop-blur text-foreground
   text-xs rounded-full`, marca do chip: pontinho `bg-primary` pulsando (trabalhando), ✓
   `text-success` (pronta), ✕ `text-destructive` (erro). Pílula de retry `bg-foreground
   text-background`.
4. **Chip:** troca de texto com fade; em `complete`, some depois de `hideAfterMs`.
5. **Proporção:** `aspect-ratio` no `figure`; a mídia `absolute inset-0 object-cover size-full`.

## Movimento reduzido

Sem faixa nem animação entre estágios (troca direta); o pontinho do chip não pulsa.

## Acessibilidade

`<figure aria-busy={trabalhando}>`; chip com `role="status"` (texto do estágio); a mídia mantém
o `alt` que a pessoa passar.

## Marcação

Raiz `data-slot="generation-frame"`, `data-status`. Partes: `generation-frame-media`,
`generation-frame-sweep`, `generation-frame-status`, `generation-frame-retry`.

## Testes mínimos

- Puras: `STAGE_STYLE` tem os 5 estados; blur decresce de fila até pronta; `stageFilter`.
- Cada status: `data-status`, texto do chip, `aria-busy` só nos trabalhando.
- `complete` + fake timers: chip some após `hideAfterMs`; `0` mantém.
- `error` com `onRetry`: pílula chama `onRetry`; sem `onRetry`, sem pílula.
- `sweep=false` sem faixa; movimento reduzido sem faixa. `labels` customizados. `ref`/`className`.
