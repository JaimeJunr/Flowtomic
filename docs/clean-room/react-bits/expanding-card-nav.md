# Spec de comportamento: `expanding-card-nav`

> **Proveniência (clean room).** Escrita em 11/10/2026 a partir da demo pública "Card Nav"
> em `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**. A
> versão deles usava gsap; esta usa só `motion`.

## O que a pessoa vê

Uma barra de navegação flutuante e arredondada: botão de menu (duas linhas) à esquerda, logo no
centro, um botão de chamada à direita. Ao clicar no menu, a **barra cresce para baixo** e revela
**3 cartões coloridos lado a lado** (empilhados no celular), cada um com um título e uma lista de
links com seta; os cartões **sobem** um após o outro enquanto a barra abre. As duas linhas do
menu viram um X. Fechar recolhe a barra.

## Por que existe (uso no produto)

Cabeçalho de site com navegação agrupada (Produto / Empresa / Contato).

## API (`molecules/navigation/expanding-card-nav`)

```ts
type CardNavLink = { label: string; href: string; ariaLabel?: string };
type CardNavGroup = { label: string; links: CardNavLink[]; tone?: "primary" | "foreground" | "muted" };

type ExpandingCardNavProps = React.ComponentProps<"nav"> & {
  groups: CardNavGroup[];        // 1..4
  logo?: React.ReactNode;
  action?: React.ReactNode;      // botão à direita (ex.: <Button>)
  open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void;
};
```

Barra `bg-card border border-border rounded-2xl shadow-sm`. Cartões por `tone`:
`primary` → `bg-primary text-primary-foreground`; `foreground` → `bg-foreground
text-background`; `muted` (default) → `bg-muted text-foreground`. Links com ícone
`ArrowUpRight` (lucide).

## Regras

1. **Altura aberta.** A barra fechada tem 60 px. Aberta, a altura vai para `60 + altura medida do
   conteúdo dos cartões + 8`, medida com ResizeObserver no conteúdo (o conteúdo fica montado e
   invisível enquanto fechado para poder medir). Anima `height` 0,4 s ease `[0.22, 1, 0.36, 1]`.
2. **Cartões.** `y 40 → 0` e opacidade com atraso `0.08 + index · 0.08` s ao abrir; ao fechar,
   todos juntos 0,2 s.
3. **Botão de menu.** Duas barras que viram X; `aria-expanded`, `aria-controls`, nome
   "Abrir menu"/"Fechar menu".
4. **Fechar** com o botão, `Esc` ou clique num link. Conteúdo fechado: `inert` e
   `aria-hidden`.
5. **Layout.** Cartões `grid gap-2 md:grid-cols-[repeat(auto-fit,minmax(0,1fr))]`, cartão
   `rounded-xl p-4 min-h-32 flex flex-col`, título `text-lg font-medium`, links embaixo.

## Movimento reduzido

A barra muda de altura sem animação e os cartões aparecem direto.

## Acessibilidade

`<nav aria-label="Principal">`; cada grupo é uma `<section aria-label={label}>` com `<ul>`.

## Marcação

Raiz `data-slot="expanding-card-nav"`; partes `expanding-card-nav-bar`,
`expanding-card-nav-toggle`, `expanding-card-nav-content`, `expanding-card-nav-card`.

## Testes mínimos

- Pura `openHeight(contentHeight)` = `60 + h + 8`; erro com altura negativa.
- Erro com 0 ou mais de 4 grupos.
- Abrir/fechar; `Esc`; clique em link fecha; conteúdo fechado `inert`; modo controlado.
- `tone` aplica as classes certas; `action` renderiza.
