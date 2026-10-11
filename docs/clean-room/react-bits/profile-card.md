# Spec de comportamento: `profile-card`

> **Proveniência (clean room).** Escrita em 10/10/2026 a partir da demo pública "Profile Card" em
> `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.

## O que a pessoa vê

Um **cartão de perfil holográfico** em retrato: foto grande da pessoa, nome e cargo no topo, e
uma barra no rodapé com miniatura, `@usuário`, status e um botão "Falar". O cartão **inclina em
3D** seguindo o ponteiro e um **brilho holográfico** (faixas de cor que deslizam) e um reflexo de
luz acompanham a inclinação. Atrás do cartão, um **halo** suave segue o ponteiro. Ao sair, tudo
volta ao lugar devagar.

## Por que existe (uso no produto)

Página "Seu gestor de conta", equipe de atendimento, cartão de assessor.

## API (`molecules/data-display/profile-card`)

```ts
type ProfileCardProps = Omit<React.ComponentProps<"div">, "title"> & {
  /** Foto principal (img com alt). */
  avatar: React.ReactNode;
  name: string;
  title: string;
  handle?: string;
  status?: string;
  /** Miniatura da barra; padrão: nada. */
  miniAvatar?: React.ReactNode;
  contactLabel?: string;        // default "Falar"
  onContact?: () => void;
  showInfo?: boolean;           // default true
  glow?: boolean;               // default true
  tilt?: boolean;               // default true
  /** Inclinação máxima em graus. */
  maxTilt?: number;             // default 14
};
```

## Regras

1. **Estrutura.** Raiz `relative [perspective:900px]` com o halo `absolute -inset-8
   rounded-[32px] blur-2xl pointer-events-none` (gradiente radial de `var(--primary)` para
   transparente centrado em `--px`/`--py`, opacidade 0 fora do hover e 0,6 dentro). Cartão
   `relative aspect-[0.72] w-80 rounded-3xl overflow-hidden border bg-card shadow-xl`
   (`data-slot="profile-card-inner"`) com `rotateX`/`rotateY` por CSS variables.
2. **Camadas do cartão** (de baixo para cima): fundo `bg-gradient-to-b from-secondary to-card`;
   `avatar` alinhado embaixo (`absolute inset-x-0 bottom-0`, `[&_img]:w-full object-cover`);
   **holo**: `absolute inset-0 mix-blend-soft-light` com `repeating-linear-gradient` de faixas
   alternando `var(--primary)`, `var(--accent)`, `var(--secondary)` em 115°, deslocado por
   `background-position` = `--px`/`--py`, opacidade 0,35 em repouso e 0,8 no hover; **reflexo**:
   gradiente radial branco-de-token (`var(--background)`) em `--px`/`--py`, `mix-blend-overlay`;
   cabeçalho (nome `text-2xl font-semibold`, cargo `text-muted-foreground`) no topo centralizado;
   barra de info `absolute inset-x-3 bottom-3 rounded-2xl border bg-background/70 backdrop-blur
   px-3 py-2 flex items-center gap-3` com miniatura (`size-10 rounded-full overflow-hidden`),
   `@handle` + status (`text-xs text-muted-foreground`) e botão `Button size="sm"
   variant="outline"`.
3. **Ponteiro (pura `pointerState(rect, x, y)` → `{ px, py, rx, ry }`)**: `px/py` em % (0..100)
   da posição; `ry = (px - 50)/50 · maxTilt`, `rx = -(py - 50)/50 · maxTilt`. Escrito por CSS
   variables no rAF (um por quadro), sem re-render. Só mouse/caneta.
4. **Saída.** No `pointerleave`, as variáveis voltam a `50%/50%/0/0` por interpolação em 600 ms
   (`animate` do motion sobre um `MotionValue` por variável, ou transição CSS das variáveis
   registradas como `@property` — preferir `animate`).
5. Toque: sem inclinação; o brilho fica no repouso.

## Movimento reduzido

Sem inclinação nem holo em movimento; halo estático.

## Acessibilidade

A raiz é um `<article aria-label="Perfil de <name>">`; nome em `<h3>`. Camadas decorativas
`aria-hidden`. O botão chama `onContact` e tem nome "<contactLabel> com <name>" (`aria-label`).

## Marcação

- Raiz: `data-slot="profile-card"`, `data-active` (ponteiro dentro), `ref`, `cn`.
- Partes: `profile-card-inner`, `profile-card-glow`, `profile-card-holo`, `profile-card-info`.

## Testes mínimos

- `pointerState`: centro → 50/50/0/0; canto superior direito → `ry > 0`, `rx > 0`; respeita
  `maxTilt`; rect zero lança erro com o valor.
- Renderiza nome, cargo, `@handle`, status; `showInfo={false}` esconde a barra.
- Botão chama `onContact` e tem o `aria-label`.
- `pointerenter` de mouse → `data-active="true"`; toque não ativa.
- `glow={false}` sem halo; `tilt={false}` não escreve rotação.
- Movimento reduzido não ativa; `ref` e `className`.
