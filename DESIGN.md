---
name: Flowtomic
description: Componentes React para ferramentas de quem trabalha — valor em mono, lista densa, um botão forte por tela.
colors:
  urucum: "#b33e14"
  urucum-deep: "#953109"
  urucum-wash: "#ffdbc7"
  paper: "#ffffff"
  paper-raised: "#f8fafc"
  paper-muted: "#f1f5f9"
  ink: "#020817"
  ink-soft: "#64748b"
  hairline: "#e2e8f0"
  status-success: "#157f3c"
  status-destructive: "#dc2828"
  status-warning: "#b35309"
  status-info: "#2463eb"
  night: "#020817"
  night-raised: "#1d2839"
  night-ink: "#f8fafc"
  night-ink-soft: "#94a3b8"
  night-urucum-wash: "#5a1902"
  night-ring: "#f8764f"
typography:
  display:
    fontFamily: "Schibsted Grotesk, Public Sans, -apple-system, Segoe UI, Arial, sans-serif"
    fontSize: "40px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Schibsted Grotesk, Public Sans, -apple-system, Segoe UI, Arial, sans-serif"
    fontSize: "24px"
    fontWeight: 700
    lineHeight: 1.25
  title:
    fontFamily: "Schibsted Grotesk, Public Sans, -apple-system, Segoe UI, Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: "Public Sans, -apple-system, Segoe UI, Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Public Sans, -apple-system, Segoe UI, Arial, sans-serif"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: 1.4
  metric:
    fontFamily: "JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "32px"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "-0.025em"
  mono:
    fontFamily: "JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  sm: "6px"
  md: "8px"
  lg: "10px"
  full: "9999px"
spacing:
  row: "12px"
  cell: "24px"
  section: "32px"
  page-mobile: "16px"
  page: "40px"
components:
  button-primary:
    backgroundColor: "{colors.urucum}"
    textColor: "{colors.paper}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
    height: "36px"
  button-primary-hover:
    backgroundColor: "{colors.urucum-deep}"
  button-outline:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
    height: "36px"
  button-outline-hover:
    backgroundColor: "{colors.urucum-wash}"
    textColor: "{colors.urucum-deep}"
  input:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "0 12px"
    height: "44px"
  nav-item-active:
    backgroundColor: "{colors.urucum-wash}"
    textColor: "{colors.urucum-deep}"
    rounded: "{rounded.md}"
    padding: "0 8px"
    height: "44px"
  status-tag:
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    padding: "2px 10px"
    typography: "{typography.label}"
  metric-value:
    textColor: "{colors.ink}"
    typography: "{typography.metric}"
---

# Design System: Flowtomic

## Overview

**Creative North Star: "[a decidir]"**

O Flowtomic é uma biblioteca para telas de trabalho: painéis de entrega, consoles, editores, listas de build. Quem abre a tela quer uma resposta, não uma vitrine. Por isso cada tela responde uma pergunta de longe ("1 atrasada, 3 vencem até sexta", "API no ar") em tipo grande, e o resto fica subordinado em texto menor e em mono.

A densidade é de ferramenta: linhas com régua fina (hairline de 1px) em vez de cards, `<dl>` de chave e valor em vez de grade de KPIs, cor só onde carrega significado. A marca aparece pouco e de propósito — no botão principal, no item de navegação ativo, no foco.

A referência aprovada é o redesign do `developer-panel` (20/09/2026) e o piloto do `stats-grid` (26/09/2026). A anti-referência é o template genérico de dashboard: cards idênticos com sombra, eyebrow em caixa alta espaçada, subtítulo que repete o título, emoji como ícone, nomes fictícios.

**Key Characteristics:**
- Uma pergunta por tela, respondida em tipo de 40px
- Valores em JetBrains Mono; texto corrido em Public Sans; títulos em Schibsted Grotesk
- Régua de 1px no lugar de card e de sombra
- Um botão sólido por tela; o resto é outline, ghost ou link
- Só tokens semânticos nos componentes, nunca cor de paleta

## Colors

Neutros frios de papel e tinta, uma marca terracota ("urucum") usada com parcimônia, e quatro tons de status que valem tanto como texto quanto como fundo sólido.

### Primary
- **Urucum** (`--primary`): o botão sólido da tela, a barra de progresso, o anel de foco no claro. Passa 5,7:1 com texto branco.
- **Urucum fundo** (`--primary-hover`): hover do botão principal e texto de link sobre o wash.
- **Wash de urucum** (`--accent`): fundo do item de navegação ativo e hover de outline/ghost. Sempre com `--accent-foreground` por cima.

### Neutral
- **Papel** (`--background`, `--card`): fundo de página e de superfície. No escuro vira **Noite**.
- **Papel elevado** (`--surface`): sidebar e barras de navegação.
- **Papel apagado** (`--muted`, `--secondary`): trilho de barra de progresso, esqueleto de loading, pílula não selecionada.
- **Tinta** (`--foreground`): todo texto principal e os valores em mono.
- **Tinta suave** (`--muted-foreground`): rótulo de `<dt>`, contexto de métrica, timestamp, estado vazio.
- **Régua** (`--border`, `--input`): a hairline de 1px entre linhas e em volta de campo.

### Status
- **Sucesso** (`--success`), **Destrutivo** (`--destructive`), **Aviso** (`--warning`), **Informação** (`--info`): cor da variação de métrica, do ponto de estado, do badge sólido e do Alert tingido.

### Named Rules
**The Token-Only Rule.** Componente e block usam só tokens semânticos (`bg-background`, `text-muted-foreground`, `border-border`, `bg-primary`, `text-success`…). Cor de paleta do Tailwind (`gray-900`, `green-500`), hex, `rgba()` e a escala crua do `theme.css` (`bg-brand-600`) estão proibidos — o `theme-tokens.test.ts` trava isso. A exceção é o véu atrás de modal (`bg-black/80`).

**The Status Tone Rule.** Cada tom de status passa AA (4,5:1) nas duas leituras, no claro e no escuro: como texto sobre `--background` e como fundo sólido com o seu `-foreground`. Tingido (`bg-warning/10`) escreve com o próprio tom (`text-warning`), nunca com o `-foreground`.

**The Color Means Something Rule.** Cor só onde carrega significado. Numa métrica, o número é tinta; só a variação ganha verde ou vermelho, e pelo sentido do que é bom (`positive: false` quando subir é ruim).

**The Dark Panel Rule.** Painel que é escuro nos dois modos (terminal, log) põe a classe `dark` no próprio elemento, e os tokens resolvem para os valores da Noite. Nunca `bg-foreground text-background`, que vira branco no modo escuro.

## Camada de marca do produto

O Flowtomic fornece um padrão, não a identidade de todos os produtos. A marca pode mudar
cor, temperatura dos neutros, desenho dos cantos e réguas, profundidade, famílias tipográficas
e densidade de controles. A escolha deve partir do conceito do produto: trocar só a cor do
botão deixa todas as ferramentas com a mesma aparência.

### Tokens que o produto pode sobrescrever

Os valores abaixo são os padrões atuais, preservados nesta camada. Cada token está definido
em `:root` e `.dark`. O CSS do produto declara os dois modos explicitamente, inclusive quando
forma, fonte ou sombra têm o mesmo valor. Isso também atende painéis `.dark` dentro de páginas claras.
As cores são valores completos e opacos (por exemplo, `#2b3aa0`, `rgb(43 58 160)` ou
`oklch(0.4 0.15 270)`), nunca os três canais soltos de HSL.

#### Cor de marca

Troque o conjunto: sólido e seu texto, hover, wash e seu texto, foco e link. O texto da marca
no escuro pode ter uma cor diferente do botão sólido.

| Token | Claro (`:root`) | Escuro (`.dark`) |
| --- | --- | --- |
| `--primary` | `oklch(0.5254 0.1599 38.05)` | `oklch(0.5254 0.1599 38.05)` |
| `--primary-hover` | `oklch(0.457 0.1426 38.29)` | `oklch(0.457 0.1426 38.29)` |
| `--primary-foreground` | `oklch(1 0 0)` | `oklch(1 0 0)` |
| `--accent` | `oklch(0.9155 0.0486 50.03)` | `oklch(0.3176 0.1001 38.54)` |
| `--accent-hover` | `oklch(0.8557 0.0834 44.23)` | `oklch(0.3916 0.1231 37.66)` |
| `--accent-foreground` | `oklch(0.457 0.1426 38.29)` | `oklch(1 0 0)` |
| `--ring` | `oklch(0.5254 0.1599 38.05)` | `oklch(0.7119 0.1682 37.57)` |
| `--link` | `oklch(0.5254 0.1599 38.05)` | `oklch(0.7119 0.1682 37.57)` |

#### Temperatura dos neutros

O tint neutro é esta família semântica, não uma escala de `slate-*` nos componentes. Um produto
pode aquecer o papel ou tingir a noite de anil, ajustando fundos, texto, réguas e campos juntos.
`card` e `popover` têm pares próprios; `muted` e `secondary` também. Confira o texto em cada
superfície e o campo contra seu entorno, não apenas contra o fundo da página.

| Token | Claro (`:root`) | Escuro (`.dark`) |
| --- | --- | --- |
| `--background` | `oklch(1 0 0)` | `oklch(0.1371 0.036 258.53)` |
| `--foreground` | `oklch(0.1371 0.036 258.53)` | `oklch(0.9838 0.0035 247.86)` |
| `--card` | `oklch(1 0 0)` | `oklch(0.1371 0.036 258.53)` |
| `--card-foreground` | `oklch(0.1371 0.036 258.53)` | `oklch(0.9838 0.0035 247.86)` |
| `--popover` | `oklch(1 0 0)` | `oklch(0.1371 0.036 258.53)` |
| `--popover-foreground` | `oklch(0.1371 0.036 258.53)` | `oklch(0.9838 0.0035 247.86)` |
| `--surface` | `oklch(0.9838 0.0035 247.86)` | `oklch(0.2757 0.0353 259.71)` |
| `--surface-hover` | `oklch(0.9676 0.007 247.9)` | `oklch(0.3504 0.0488 259.68)` |
| `--muted` | `oklch(0.9676 0.007 247.9)` | `oklch(0.2757 0.0353 259.71)` |
| `--muted-foreground` | `oklch(0.5547 0.0407 257.44)` | `oklch(0.7107 0.0351 256.79)` |
| `--secondary` | `oklch(0.9679 0.0027 264.54)` | `oklch(0.2908 0.0219 259.86)` |
| `--secondary-hover` | `oklch(0.9278 0.0058 264.53)` | `oklch(0.3622 0.0206 256.8)` |
| `--secondary-foreground` | `oklch(0.2103 0.0316 264.78)` | `oklch(0.9843 0.0017 247.84)` |
| `--text-primary` | `oklch(0.1371 0.036 258.53)` | `oklch(0.9838 0.0035 247.86)` |
| `--text-secondary` | `oklch(0.5547 0.0407 257.44)` | `oklch(0.7107 0.0351 256.79)` |
| `--border` | `oklch(0.929 0.0126 255.53)` | `oklch(0.2757 0.0353 259.71)` |
| `--border-hover` | `oklch(0.8516 0.0259 253.41)` | `oklch(0.3504 0.0488 259.68)` |
| `--input` | `oklch(0.929 0.0126 255.53)` | `oklch(0.3946 0.0586 259.65)` |

#### Forma e profundidade

| Token | Claro (`:root`) | Escuro (`.dark`) |
| --- | --- | --- |
| `--radius` | `0.625rem` | `0.625rem` |
| `--border-width` | `1px` | `1px` |

O raio alimenta a escala de cantos já usada pelos componentes; cantos retos e pílulas continuam
próprios. A espessura alimenta `border`, `border-x`, `border-y`, `border-t`, `border-r`, `border-b`,
`border-l`, `border-s` e `border-e`. Espessuras explícitas, divisores e anéis de foco não mudam com ela.

A escala de sombras abaixo tem os mesmos valores no claro e no escuro. O produto pode trocar
cada degrau; mantenha distinção entre conteúdo plano e sobreposição. Para suprimir a sombra,
use `0 0 0 0 transparent`, não `none`: a sombra participa da mesma composição CSS do anel
de foco, e `none` dentro dessa lista invalidaria também o foco. Cada token contém a sombra
inteira, incluindo sua cor; personalize a cor no token. Combinações com utilitários de cor
como `shadow-primary` não fazem parte deste contrato.

```css
:root,
.dark {
  --shadow-xs: 0px 1px 2px rgba(10, 13, 18, 0.05);
  --shadow-sm: 0px 1px 3px rgba(10, 13, 18, 0.1), 0px 1px 2px -1px rgba(10, 13, 18, 0.1);
  --shadow-md: 0px 4px 6px -1px rgba(10, 13, 18, 0.1), 0px 2px 4px -2px rgba(10, 13, 18, 0.06);
  --shadow-lg: 0px 12px 16px -4px rgba(10, 13, 18, 0.08), 0px 4px 6px -2px rgba(10, 13, 18, 0.03), 0px 2px 2px -1px rgba( 10, 13, 18, 0.04 );
  --shadow-xl: 0px 20px 24px -4px rgba(10, 13, 18, 0.08), 0px 8px 8px -4px rgba(10, 13, 18, 0.03), 0px 3px 3px -1.5px rgba( 10, 13, 18, 0.04 );
  --shadow-2xl: 0px 24px 48px -12px rgba(10, 13, 18, 0.18), 0px 4px 4px -2px rgba(10, 13, 18, 0.04);
  --shadow-3xl: 0px 32px 64px -12px rgba(10, 13, 18, 0.14), 0px 5px 5px -2.5px rgba(10, 13, 18, 0.04);
}
```

#### Tipo

| Token | Claro (`:root`) | Escuro (`.dark`) |
| --- | --- | --- |
| `--font-display` | `"Schibsted Grotesk", "Public Sans", -apple-system, "Segoe UI", Arial, sans-serif` | `"Schibsted Grotesk", "Public Sans", -apple-system, "Segoe UI", Arial, sans-serif` |
| `--font-body` | `"Public Sans", -apple-system, "Segoe UI", Arial, sans-serif` | `"Public Sans", -apple-system, "Segoe UI", Arial, sans-serif` |
| `--font-mono` | `"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace` | `"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace` |

O slot de fonte da marca é `--font-display`: títulos e `font-display` usam essa família.
`--font-body` governa o corpo; `--font-mono` continua sendo uma família monoespaçada para valores,
comandos e horários. O produto deve carregar as famílias escolhidas (por `@font-face`, provedor
ou ferramenta como `next/font`) e fornecer fallbacks; declarar um nome não baixa a fonte.

#### Densidade

| Token | Claro (`:root`) | Escuro (`.dark`) |
| --- | --- | --- |
| `--control-height` | `2.25rem` | `2.25rem` |

A altura base governa somente Button e Input e mantém a API de `size`. No padrão, Button tem
32/36/40px em `sm`/padrão/`lg` e Input tem 36/40/44px. Botões de ícone acompanham a mesma escala
nos dois eixos. Aumentar a base para `2.75rem` produz Button de 40/44/48px e Input de 44/48/52px.
Não há promessa de densidade global para tabelas ou organisms. Preserve alvos de toque de 44px
nas telas que precisem deles, usando o tamanho ou a área de interação apropriados.

### Limites e acessibilidade

- Cores semânticas de status (`--success`, `--warning`, `--info`, `--error`, `--destructive` e
  seus pares/hover) pertencem ao Flowtomic. O produto **não as sobrescreve** para combinar com
  sua marca. Ao tingir neutros, deve revalidar a leitura desses estados nas novas superfícies.
- A cor `--ring` pode acompanhar a marca; a **visibilidade do foco não pode ser reduzida**.
  Não remova outline/anel, não reduza espessura, afastamento ou opacidade para esconder foco,
  nem altere `--ds-focus-ring`/`--ds-focus-ring-offset` para isso. Confira teclado e contraste
  do foco realmente renderizado, inclusive sobre fundos e controles distintos.
- Texto do botão contra `--primary` e `--primary-hover`: **≥ 4,5:1**. Botão primário sólido
  contra `--background`: **≥ 3:1**. Confira também os estados renderizados (hover com opacidade,
  seleção e foco); passar no token não prova uma cor composta com transparência.
- Link contra o fundo, texto de accent contra seu fundo/hover e texto normal contra o fundo:
  **≥ 4,5:1**. Cor opaca do anel contra o fundo: **≥ 3:1**, além da prova do foco renderizado.

O anil `#2b3aa0` da Constelação funciona com branco no claro, mas mede cerca de **2:1** contra
`#0b1026`. Reutilizá-lo como sólido na noite esconde o botão. No escuro, o produto usa
`#8f9cff` com texto `#0b1026` (cerca de **7,5:1**); branco sobre essa variante clara reprova.
A variante de marca escura precisa ser desenhada e testada, não apenas copiada do claro.

### Ordem de importação e exemplo

Carregue os tokens do Flowtomic primeiro e o CSS do produto depois. Para o CLI, use os caminhos
locais equivalentes. Overrides sem camada vencem os padrões em `@layer base`/`theme`; se o
produto usar `@layer`, use `base` depois do Flowtomic, não uma camada anterior como `theme`.

```css
/* src/styles/index.css */
@import "@flowtomic/ui/styles/globals.css";
@import "@flowtomic/ui/styles/theme.css";
@import "@flowtomic/ui/styles/typography.css";
@import "./marca.css";
```

```css
/* marca.css — exemplo baseado na Constelação; os outros tokens herdam o padrão. */
@theme {
  --background-color-*: initial;
  --text-color-*: initial;
  --border-color-*: initial;
  --ring-color-*: initial;
  --outline-color-*: initial;
}

:root {
  --primary: #2b3aa0;
  --primary-hover: #1f2a7a;
  --primary-foreground: #ffffff;
  --accent: #e6e9fb;
  --accent-hover: #d5dbf7;
  --accent-foreground: #1f2a7a;
  --ring: #2b3aa0;
  --link: #2b3aa0;
  --radius: 0.75rem;
  --border-width: 1px;
  --control-height: 2.75rem;
}

.dark {
  --background: #0b1026;
  --card: #0b1026;
  --popover: #10173a;
  --surface: #141a38;
  --surface-hover: #1b2348;
  --muted: #141a38;
  --secondary: #1b2348;
  --secondary-hover: #232c58;
  --border: #252d55;
  --border-hover: #303a6b;
  --input: #56619f;
  --primary: #8f9cff;
  --primary-hover: #aab4ff;
  --primary-foreground: #0b1026;
  --accent: #1d2660;
  --accent-hover: #26307a;
  --accent-foreground: #c9cfff;
  --ring: #8f9cff;
  --link: #9aa6ff;
  --radius: 0.75rem;
  --border-width: 1px;
  --control-height: 2.75rem;
}
```

Os componentes usam os tokens semânticos; a marca não redefine escalas cruas do Tailwind.
Os namespaces legados de cores no `theme.css` (`--background-color-*`, `--text-color-*` etc.)
têm prioridade sobre `--color-*` no Tailwind 4. O bloco `@theme` do exemplo os limpa para
os utilitários consumirem os tokens semânticos do produto, como faz a Constelação.

### Como verificar uma marca

`packages/ui/src/test/product-brand-layer.test.ts` trava os 39 tokens nos dois modos, compara
78 valores com o padrão anterior e testa Flowtomic e Constelação. O helper de teste
`assertProductBrandContrast` em `src/test/brand-contrast.ts` recebe os tokens efetivos de
`light` e `dark` e verifica oito pares por modo. É apoio de teste, não uma exportação do pacote;
produtos podem copiar o helper para sua suíte. Ele aceita hex de seis dígitos, `rgb(r g b)`
e `oklch(L C H)` opacos. Não resolve `var()`: passe os valores depois da cascata.

```bash
cd packages/ui
NODE_OPTIONS=--no-experimental-webstorage bunx vitest run src/test/product-brand-layer.test.ts
```

Além do cálculo, confira no browser as duas variantes e um painel `.dark` numa página clara:
botão normal/hover, campos, link e foco por teclado. Fonte, raio, sombra e densidade precisam
ser observados na superfície que os utiliza.

## Efeitos de marketing

`aurora-glow`, `silk-waves`, `gradient-text`, `bento-glow-grid` e outros efeitos React Bits/WebGL
cabem em landing pages públicas, campanhas e apresentações de marca quando dão forma ao
conceito do próprio produto. Uma Constelação pode representar orientação pelo céu; um efeito
aleatório de aurora não explica por que aquela ferramenta existe.

- **No máximo um efeito por página**, com função clara na hierarquia. Não combine fundo
  animado, título em gradiente e cards com glow como decoração independente.
- O efeito deve expressar o conceito do produto, com suas cores, ritmo e composição.
  Se poderia ser trocado por qualquer outro fundo sem mudar o sentido, parece template de IA.
- Conteúdo vem primeiro: proposta concreta, exemplo real e ação útil. Efeito nunca substitui
  conteúdo, prova do produto ou informação de preço. A página deve continuar clara sem ele.
- Respeite `prefers-reduced-motion`: ofereça estado estático e pare animação/loop WebGL quando
  a pessoa pedir menos movimento. Garanta leitura e interação sem o canvas.
- **Nunca use esses efeitos nas superfícies do aplicativo autenticado**: dashboard, formulário,
  lista, tabela, editor ou fluxo de trabalho. Ali movimento só comunica mudança de estado.

A procedência clean room continua obrigatória: implementação a partir das specs em
`docs/clean-room/react-bits/`, sem copiar código do React Bits.

## Typography

**Display Font:** Schibsted Grotesk (com Public Sans)
**Body Font:** Public Sans (com -apple-system, Segoe UI, Arial)
**Label/Mono Font:** JetBrains Mono (com ui-monospace)

**Character:** Uma grotesca de títulos com peso e aperto, sobre um corpo neutro e legível, e o mono como vernáculo de devtools para tudo que é valor, comando, versão e horário.

### Hierarchy
- **Display** (700, 40px, 1; 28px abaixo de `sm`): o veredito da tela. Um por tela.
- **Headline** (700, 24–32px, 1.25): título de página vazia ou de documento.
- **Title** (600, 14px): título de seção, sempre seguido de uma régua que ocupa o resto da linha.
- **Body** (400, 14–15px, 1.5): texto corrido e células de tabela. Máximo de ~65ch.
- **Label** (500, 13px): cabeçalho de tabela, contexto de métrica, pílula de estado. Sem caixa alta.
- **Metric** (mono 500, 32px): o número de uma métrica. Tinta, sem cor.
- **Mono** (mono 400, 12–14px): versões, comandos, datas, contagens, linhas de log.

### Named Rules
**The Mono Values Rule.** Todo valor que a pessoa compara ou copia — número, versão, data, comando, caminho — sai em JetBrains Mono.

**The No Eyebrow Rule.** Nada de rótulo em caixa alta com tracking largo (`uppercase tracking-wide`). A hierarquia vem de tamanho e peso.

## Layout

Página com sidebar fixa de 232px no desktop (`md` para cima) e barra horizontal no topo abaixo de `md`. Conteúdo com respiro de 40px no desktop e 16px no celular. Seções empilhadas com 32px entre si; linhas de lista com 12px de padding vertical; colunas de métrica separadas por 24px e régua vertical.

Nada vaza da tela a 375px: tabela larga fica dentro de um contêiner com rolagem horizontal própria, busca ocupa a linha inteira no celular. Alvo de toque tem 44px de altura.

Estado vazio é instrução com endereço concreto ("O conteúdo desta área fica em `app/dashboard/page.tsx`"), não "Nenhum dado".

## Elevation & Depth

Plano por padrão. A profundidade vem de tom (papel, papel elevado, papel apagado) e de régua de 1px, não de sombra. Sombra aparece só em sobreposição real — popover, dialog, menu — e no estado de arrasto de widget.

### Named Rules
**The Hairline Rule.** Separar é trabalho da régua de 1px (`border-border`). Card com sombra em volta de cada bloco é o sinal número um de template.

## Shapes

Cantos suavemente arredondados: 8px em botão, campo e item de navegação; 10px em contêiner; pílula (`rounded-full`) só em tag de estado e ponto de cor. Ícones são `lucide-react` em 16px, nunca emoji.

## Components

### Buttons
- **Shape:** cantos de 8px, altura de 36px (32px no `sm`).
- **Primary:** urucum com texto branco. **Um por tela** — a ação que a tela existe para fazer.
- **Hover / Focus:** hover escurece para urucum fundo; foco com anel de 2px no `--ring` com 2px de afastamento (`ring-offset`).
- **Outline / Ghost / Link:** todas as outras ações. Ações por linha de lista são outline. Atalhos para fora ("Ver os componentes") são link de texto com ícone `ExternalLink`.
- **Botão que alterna:** a mesma posição troca de rótulo pelo estado ("Pausar" ↔ "Retomar", "Executar" ↔ "Parar"), em vez de dois botões lado a lado.

### Métrica (StatsGrid)
- `<dl>`: rótulo em tinta suave, valor em Metric, variação colorida com seta (`↑ 15,5%`) e contexto ("sobre 1.074"). Colunas separadas por régua vertical; sem card.

### Lista densa
- Linhas com régua no topo (sem régua na primeira), nome à esquerda em peso 500, valor em mono, tag de estado e uma ação outline à direita. Sem avatar decorativo.

### Inputs / Fields
- **Style:** régua de 1px (`--input`), fundo papel, cantos de 8px, 44px de altura em tela de trabalho.
- **Focus:** anel de 2px no `--ring` pelo `focus-within` do contêiner.
- **Error:** texto em `--destructive` abaixo do campo.

### Navigation
- Item de 44px, cantos de 8px. Ativo: wash de urucum com texto urucum fundo e peso 600; inativo: tinta a 80% com hover em papel apagado. No celular vira uma linha rolável no topo.

### Tag de estado
- Pílula com fundo tingido do tom e texto no próprio tom, ou ponto de 8px + rótulo em texto normal dentro de tabela.

## Do's and Don'ts

### Do:
- **Do** responder a pergunta da tela em Display (40px) com um ponto de cor ao lado.
- **Do** usar `<dl>` e listas com régua de 1px no lugar de cards.
- **Do** pôr todo número, versão, data e comando em JetBrains Mono.
- **Do** manter um único botão sólido por tela.
- **Do** escrever o estado vazio como instrução, com o arquivo ou comando concreto.
- **Do** usar exemplos do próprio Flowtomic nas stories (`bunx flowtomic-cli add stats-grid`, `@flowtomic/ui 0.8.0`).
- **Do** formatar número e data em pt-BR.

### Don't:
- **Don't** usar cor de paleta, hex ou `bg-brand-600` em componente — só tokens.
- **Don't** embrulhar cada bloco num card com sombra, nem montar fileira de 4 cards de KPI.
- **Don't** pôr eyebrow em caixa alta espaçada nem subtítulo que repete o título.
- **Don't** usar emoji como ícone.
- **Don't** usar nome fictício de template (John Doe, Acme, "Meeting with Arc Company", "Download our Mobile App").
- **Don't** dividir a tela pelo mecanismo do sistema (abas "Terminal / Preview") em vez do trabalho da pessoa.
- **Don't** mostrar atalho de teclado que não existe (o "Ctrl K" de enfeite).
- **Don't** usar `bg-foreground text-background` para painel escuro — use a classe `dark` no painel.
