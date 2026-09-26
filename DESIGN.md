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
