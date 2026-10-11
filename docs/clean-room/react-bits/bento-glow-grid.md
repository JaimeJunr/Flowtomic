# Spec de comportamento: `bento-glow-grid`

> **Proveniência (clean room).** Escrita em 11/10/2026 a partir da demo pública "Magic Bento"
> em `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**. A
> versão deles usava gsap; esta usa só `motion`.

## O que a pessoa vê

Uma **grade bento** escura de 6 cartões de tamanhos diferentes (dois ocupam 2 colunas ou 2
linhas), cada um com um rótulo pequeno em cima e título + descrição embaixo. Um **holofote suave
segue o mouse** pela grade inteira, e a **borda dos cartões perto do mouse acende**. No hover, o
cartão pode **inclinar em 3D** e ser **puxado de leve** para o mouse, e **partículas** pequenas
flutuam dentro dele. Clicar solta uma **onda** circular a partir do ponto clicado.

## Por que existe (uso no produto)

Seção de recursos de uma landing ("Painel", "Relatórios", "Integrações"…).

## API (`molecules/data-display/bento-glow-grid`)

```ts
type BentoGlowItem = { id: string; eyebrow?: string; title: string; description?: string; content?: React.ReactNode };

type BentoGlowGridProps = React.ComponentProps<"div"> & {
  items: BentoGlowItem[];          // 1..12
  spotlight?: boolean;             // default true
  spotlightRadius?: number;        // px, default 300
  borderGlow?: boolean;            // default true
  particles?: boolean;             // default true
  particleCount?: number;          // 0..30, default 12
  tilt?: boolean;                  // default false
  magnetism?: boolean;             // default true
  ripple?: boolean;                // default true
};
```

Cartão `relative overflow-hidden rounded-2xl border border-border bg-card p-5 min-h-48`. Cor
de luz: só `var(--primary)` e `color-mix(in oklch, var(--primary) N%, transparent)` (nunca
`--accent`/`--secondary`).

## Regras

1. **Layout.** `grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`; no `lg`, os itens de
   índice 2 e 3 recebem `lg:col-span-2 lg:row-span-2` (padrão bento), os demais 1×1. Puro
   `bentoSpan(index)` → classes. (corrigido em 11/10/2026: com só o índice 3 em col-span-2
   sobrava um buraco)
   As linhas do `lg` têm altura mínima (`lg:auto-rows-[minmax(12rem,auto)]`): sem isso, a linha
   que só contém itens 2×2 colapsa (medido em 11/10/2026).
2. **Holofote e borda.** `pointermove` na raiz escreve `--mx/--my` (relativos a cada cartão,
   lidos num rAF) e `--glow` (0..1, proximidade do ponteiro ao cartão: 1 dentro, cai a 0 em
   `spotlightRadius/2` px fora). Holofote: camada `pointer-events-none` na raiz com
   `radial-gradient(circle spotlightRadius px at --x --y, color-mix(primary 12%), transparent)`.
   Borda: pseudo-camada com `padding: 1px` e máscara de anel, fundo
   `radial-gradient(... at --mx --my, var(--primary), transparent 60%)`, opacidade `--glow`.
3. **Inclinação** (com `tilt`): até 8° em rotateX/Y conforme o ponteiro dentro do cartão;
   **magnetismo**: translate até 6 px na direção do ponteiro. Ambos com `animate` do motion em
   MotionValues, voltando a 0 ao sair.
4. **Partículas.** Com o ponteiro dentro, `particleCount` pontos `size-1 rounded-full
   bg-primary` em posições determinísticas (puro `particleSeeds(count, seed)`) flutuam
   (`y` ±10, opacidade 0.3..1, loop por partícula com duração 2..4 s); somem ao sair.
5. **Onda.** Clique cria um círculo `border border-primary` no ponto, `scale 0 → 1`
   (diâmetro = 2 × a maior distância até um canto) com opacidade 0.6 → 0 em 0,7 s; removido ao
   fim.

## Movimento reduzido

Sem tilt, magnetismo, partículas e onda. Holofote e borda seguem o ponteiro (resposta direta).

## Acessibilidade

Raiz `role="list"`, cartões `role="listitem"`; camadas de luz e partículas `aria-hidden`.

## Marcação

Raiz `data-slot="bento-glow-grid"`; partes `bento-glow-grid-card`, `-spotlight`,
`-border`, `-particle`, `-ripple`.

## Testes mínimos

- `bentoSpan`; `particleSeeds` determinístico e no intervalo 0..100%; `glowFor(dist, radius)`.
- Erros: `items` vazio ou > 12, `particleCount` fora de 0..30.
- `pointermove` (rect falso) escreve `--mx/--my/--glow`; clique cria e depois remove a onda.
- Movimento reduzido: sem partículas e sem onda.
