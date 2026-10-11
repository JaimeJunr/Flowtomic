# Spec de comportamento: `pill-burst-menu`

> **Proveniência (clean room).** Escrita em 11/10/2026 a partir da demo pública "Bubble Menu"
> em `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**. A
> versão deles usava gsap; esta usa só `motion`.

## O que a pessoa vê

Duas "bolhas" flutuando no topo: uma **cápsula com o logo** à esquerda e um **botão redondo** de
menu (duas linhas) à direita. Ao clicar, o botão vira um X e, sobre a página, **pílulas grandes e
arredondadas surgem com um quique** (escala 0 → 1 passando um pouco do alvo), uma de cada vez, em
duas colunas no desktop e uma no celular, cada uma **levemente girada** (alternando o sinal). O
texto de cada pílula sobe logo depois. Passar o mouse numa pílula a endireita, cresce um pouco e
troca para a cor de destaque dela. Fechar encolhe tudo de volta.

## Por que existe (uso no produto)

Menu de landing de produto, com tom mais lúdico.

## API (`molecules/navigation/pill-burst-menu`)

```ts
type PillBurstItem = { label: string; href: string; ariaLabel?: string; rotation?: number; tone?: "primary" | "foreground" | "muted" };

type PillBurstMenuProps = React.ComponentProps<"div"> & {
  items: PillBurstItem[];                // 1..8
  logo?: React.ReactNode;
  menuLabel?: string;                    // default "Abrir menu" / "Fechar menu"
  fixed?: boolean;                       // position fixed em vez de absolute, default false
  stagger?: number;                      // s, default 0.12
  open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void;
};
```

Bolhas e pílulas `bg-background text-foreground shadow-lg border border-border`. Hover da
pílula: `tone` `primary` → `bg-primary text-primary-foreground`; `foreground` →
`bg-foreground text-background`; `muted` → `bg-muted`.

## Regras

1. **Rotação padrão (pura `pillRotation(index, rotation?)`).** Se o item não trouxer, alterna
   `[-8, 8, 6, -6, 4, -4, 8, -8][index]` graus.
2. **Atraso (puro `pillDelay(index, stagger)`).** `index · stagger + jitter`, com jitter
   determinístico `((index · 37) % 5) · 0.01` s.
3. **Entrada.** Overlay `fixed/absolute inset-0` com `bg-background/80 backdrop-blur-sm`
   (opacidade 0 → 1); pílulas `scale 0 → 1` com mola `stiffness 320, damping 14`; rótulo
   `y 24 → 0` com 0,08 s a mais. Grade: `grid gap-4 sm:grid-cols-2`, pílula
   `rounded-full px-10 py-6 text-3xl sm:text-5xl`.
4. **Hover** (mouse/pen) e foco: `rotate 0, scale 1.06` e a cor do `tone`.
5. **Botão.** Duas barras que viram X (rotação ±45° e translate). `aria-expanded`,
   `aria-controls`, nome pelo `menuLabel`.
6. **Fechar** com o botão, `Esc` ou clique num item. Foco vai à primeira pílula ao abrir e
   volta ao botão ao fechar.

## Movimento reduzido

Sem quique nem rotação animada: overlay e pílulas aparecem por opacidade.

## Acessibilidade

Overlay `role="dialog"` `aria-modal="true"` `aria-label="Menu"`, com `<nav><ul>`.

## Marcação

Raiz `data-slot="pill-burst-menu"`; partes `pill-burst-menu-logo`,
`pill-burst-menu-toggle`, `pill-burst-menu-overlay`, `pill-burst-menu-item`.

## Testes mínimos

- `pillRotation` padrão e com valor do item; `pillDelay` crescente e determinístico.
- Erro com 0 ou mais de 8 itens.
- Abrir/fechar (botão, `Esc`, item); `aria-expanded`; foco; modo controlado.
- Hover com mouse marca `data-hovered`.
