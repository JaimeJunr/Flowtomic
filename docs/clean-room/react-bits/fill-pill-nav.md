# Spec de comportamento: `fill-pill-nav`

> **Proveniência (clean room).** Escrita em 11/10/2026 a partir da demo pública "Pill Nav" em
> `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**. A
> versão deles usava gsap; esta usa só `motion`.

## O que a pessoa vê

Uma barra de navegação compacta: um **logo redondo** à esquerda e, ao lado, uma cápsula com os
links em **pílulas** maiúsculas. Ao passar o mouse numa pílula, um **círculo cresce de baixo** e
enche a pílula com a cor invertida, enquanto o rótulo **rola para cima** e é substituído por uma
cópia que sobe de baixo, já na cor nova. Ao sair, o círculo desce e o rótulo volta. A pílula da
página atual tem um ponto embaixo. No logo, o hover gira o ícone uma volta. Em tela estreita, os
links somem e aparece um botão de menu que abre um painel com os mesmos links.

## Por que existe (uso no produto)

Cabeçalho de landing ou de área logada simples.

## API (`molecules/navigation/fill-pill-nav`)

```ts
type FillPillNavItem = { label: string; href: string; ariaLabel?: string };

type FillPillNavProps = React.ComponentProps<"nav"> & {
  items: FillPillNavItem[];          // >= 1
  activeHref?: string;
  logo?: React.ReactNode;            // conteúdo do círculo do logo
  logoHref?: string;                 // default "#"
  logoLabel?: string;                // nome acessível do logo, default "Início"
  introAnimation?: boolean;          // default true
  onMobileMenuToggle?: (open: boolean) => void;
};
```

Cores só por token: cápsula `bg-foreground`, pílula `bg-background text-foreground`, enchimento
`bg-foreground` e rótulo do enchimento `text-background`.

## Regras

1. **Círculo de enchimento (pura `fillCircle(w, h)` → `{ diameter, bottom, left, originY }`).**
   Círculo centrado na pílula com diâmetro igual à diagonal (`hypot(w, h) + 2` px de folga), para
   cobrir os quatro cantos; `left = (w - d)/2`, `bottom = (h - d)/2`. Cresce a partir do ponto
   da base da pílula: `originY = (h + d) / (2d)` (medido do topo do círculo). (Corrigido em
   11/10/2026: um círculo tangente à base deixava os cantos de baixo descobertos.) Medido por
   ResizeObserver de cada pílula.
2. **Hover.** O círculo vai de `scale 0` (origem na base da pílula) a `scale 1` em 0,35 s com ease
   `[0.22, 1, 0.36, 1]`; o rótulo original sobe `-(h + 4)` px e a cópia vem de `+h` a 0, no mesmo
   tempo. Sair reverte. Só reage a mouse/pen; foco por teclado aplica o mesmo estado.
3. **Ativo.** A pílula de `activeHref` tem `aria-current="page"` e um ponto `size-1.5
   rounded-full bg-foreground` 4 px abaixo dela.
4. **Logo.** Círculo `size-10 rounded-full bg-foreground text-background`; hover gira o conteúdo
   360° em 0,6 s.
5. **Intro.** Com `introAnimation`, o logo entra com `scale 0 → 1` e a cápsula cresce de largura
   0 até a natural (medida) em 0,6 s.
6. **Mobile (< 768 px pela largura da raiz).** A cápsula some; aparece um botão redondo de menu
   (`aria-expanded`, `aria-controls`) cujas duas linhas viram um X; o painel abaixo
   (`bg-background border border-border rounded-2xl shadow-lg`) abre com opacidade e `y -8 → 0`
   e lista os links. `Esc` e clique num link fecham.

## Movimento reduzido

Sem intro, sem giro do logo; o hover troca a cor sem círculo crescendo nem rolagem do rótulo.

## Acessibilidade

`<nav aria-label="Principal">` (sobrescrevível). Links reais `<a>`; a cópia do rótulo é
`aria-hidden`. O botão de menu tem nome "Abrir menu"/"Fechar menu".

## Marcação

- Raiz `data-slot="fill-pill-nav"`, `ref`, `cn`; partes `fill-pill-nav-logo`,
  `fill-pill-nav-item`, `fill-pill-nav-fill`, `fill-pill-nav-menu`.

## Testes mínimos

- `fillCircle`: o círculo cobre os cantos de cima; erro com `h <= 0`.
- `aria-current` no ativo; cópia do rótulo `aria-hidden`.
- Hover com mouse marca `data-hovered`; foco também.
- Largura estreita (ResizeObserver falso) mostra o botão; abrir/fechar com clique e `Esc`;
  `onMobileMenuToggle` recebe o estado.
