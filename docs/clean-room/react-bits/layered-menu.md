# Spec de comportamento: `layered-menu`

> **Proveniência (clean room).** Escrita em 11/10/2026 a partir da demo pública "Staggered Menu"
> em `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**. A
> versão deles usava gsap; esta usa só `motion`.

## O que a pessoa vê

Um cabeçalho com logo à esquerda e um botão de texto "Menu +" à direita. Ao clicar, **duas ou três
camadas coloridas deslizam da lateral** uma atrás da outra (escalonadas) e, por cima delas, o
**painel** branco cobre a tela (ou parte dela, até 420 px). Os **itens do menu, enormes e em
maiúsculas, sobem de dentro de uma máscara** um após o outro, cada um com um número pequeno
("01", "02"…) ao lado. Embaixo, uma lista de redes/contatos aparece por último. O botão troca o
texto rolando ("Menu" vira "Fechar") e o "+" gira 45° virando um X. Fechar faz o caminho inverso,
mais rápido.

## Por que existe (uso no produto)

Menu principal de site institucional ou de landing com poucas seções.

## API (`molecules/navigation/layered-menu`)

```ts
type LayeredMenuItem = { label: string; href: string; ariaLabel?: string };
type LayeredMenuLink = { label: string; href: string };

type LayeredMenuProps = React.ComponentProps<"div"> & {
  items: LayeredMenuItem[];             // >= 1
  links?: LayeredMenuLink[];            // redes/contatos; seção some se vazio
  linksTitle?: string;                  // default "Contato"
  logo?: React.ReactNode;
  side?: "left" | "right";              // default "right"
  layers?: 1 | 2 | 3;                   // camadas antes do painel, default 2
  numbered?: boolean;                   // default true
  closeOnClickAway?: boolean;           // default true
  open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void;
};
```

Camadas por token: `bg-primary` e `bg-primary/60` (e `bg-muted` na terceira); painel
`bg-background`; itens `text-foreground`, hover `text-primary`; números `text-primary`.

## Regras

1. **Atrasos (puro `openSchedule(layers, itemCount)` → `{ layer: number[]; panel; items: number[]; links }`).**
   Camada `i` em `i · 0.07` s; painel em `layers · 0.07`; item `k` em
   `panel + 0.15 + k · 0.08`; links depois do último item + 0.1. Fechar: tudo junto em 0,3 s,
   na ordem inversa sem atraso.
2. **Camadas e painel** são `fixed` (ou `absolute` dentro da raiz quando ela tem
   `position: relative`; a raiz é `relative` por padrão, com `overflow-hidden`), largura
   `min(420px, 100%)`, deslizando de `x: ±100%` a 0 conforme `side`, 0,5 s, ease
   `[0.22, 1, 0.36, 1]`.
3. **Item.** Contêiner `overflow-hidden`; o texto (`text-5xl font-semibold uppercase
   tracking-tight`) vai de `y: 110%` e `rotate: 6deg` a 0. Número `text-xs font-mono`
   em sobrescrito à direita.
4. **Botão.** Texto em contêiner `overflow-hidden` de uma linha; as duas palavras empilhadas e o
   conjunto anima `y` de 0 a -50%. Ícone "+" desenhado com duas barras (`span`), girando 0 → 45°.
   `aria-expanded`, `aria-controls`.
5. **Fechar.** Clique no botão, `Esc`, clique fora do painel (com `closeOnClickAway`) ou clique
   num item.
6. **Foco.** Ao abrir, foco no primeiro item; ao fechar, volta ao botão. Com o painel aberto, Tab
   circula dentro dele e do botão.

## Movimento reduzido

Painel aparece/some por opacidade, sem camadas deslizando nem itens subindo; o botão troca o
texto sem rolar.

## Acessibilidade

Painel `role="dialog"` `aria-modal="true"` com `aria-label="Menu"`, contendo `<nav>` com
`<ul>`. Camadas `aria-hidden`. Números `aria-hidden`.

## Marcação

Raiz `data-slot="layered-menu"`; partes `layered-menu-toggle`, `layered-menu-layer`,
`layered-menu-panel`, `layered-menu-item`.

## Testes mínimos

- `openSchedule`: camadas, painel e itens em ordem crescente; links por último.
- Abrir/fechar pelo botão; `Esc`; clique fora; clique num item; modo controlado.
- `aria-expanded`; foco no primeiro item ao abrir e de volta ao botão ao fechar.
- `numbered false` sem números; `links` vazio sem seção.
