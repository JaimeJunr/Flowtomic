# Estudo de interfaces: sites de referência

Sala suja da leva de 12/10/2026. Fonte: só o que a página mostra no navegador (screenshot em
1440 px e texto visível). **Nenhum código-fonte, CSS ou asset dessas páginas foi lido ou copiado.**
Marcas, logos, fotos, ilustrações e copy são deles e não entram no Flowtomic. O que entra é o
padrão de interação e de composição, reescrito do zero a partir de uma spec por componente em
`docs/clean-room/sites/<nome>.md`, como no React Bits.

## O que falta no Flowtomic

O Flowtomic tem efeito de sobra (213 do React Bits em andamento) e quase nenhuma **seção de
página**. Os 10 sites (9 da primeira leva e o Cluely) são, todos, páginas de produto. As peças que eles repetem e o Flowtomic não
tem:

| peça | onde aparece | o Flowtomic tem? |
|---|---|---|
| Cabeçalho de site com menu e barra de aviso dispensável | OpenRouter, Vercel, Cloudflare, OpenAI | não (só `dashboard-header`) |
| Hero com uma pergunta, dois botões e prova abaixo | todos | não |
| Faixa de números grandes (métricas sociais) | OpenRouter, Vercel | `count-up` e `stat-card`, sem a composição |
| Bloco de código com abas de cliente e de linguagem | Vercel, Cloudflare, Rerun | `code-block` e `snippet`, sem as duas camadas de abas |
| Diagrama de roteamento animado (app → regra → provedor, com fallback) | Vercel, Cloudflare | não (o `canvas`/`edge` é editor, não ilustração) |
| Tabela comparativa com a coluna da casa destacada | Interview Coder | não |
| Lista de status por item com "atualizado há X" e selo | Interview Coder | `task-status-mark`, sem a lista |
| Tabela de preços com 3 planos e um destacado | Interview Coder, Vercel (promo) | não |
| FAQ em duas colunas + caixa "não achou?" | Interview Coder, Cloudflare | `accordion`, sem a seção |
| Mural de depoimentos em colunas (masonry) | Rerun, Interview Coder | `masonry-grid`, sem o cartão de post |
| Faixa de logos | Vercel, OpenAI, Rerun | `logo-marquee` |
| Rodapé de site em colunas + newsletter | OpenRouter, Rerun, OpenAI | não |
| Demonstração de produto encenada (UI falsa que se mexe) | Perssua, Dots, OpenAI | não |
| Onda de áudio ao vivo + cronômetro | Perssua | `wave-bar-slider` é controle, não visualização |
| Linha do tempo arrastável ("um dia com…") | Dots | não |

## Por site

### OpenRouter (openrouter.ai)

Pergunta da tela: "um lugar só para todo modelo?". Respondida em 2 linhas de título.

- **Faixa de aviso** no topo, de uma linha, com link e `×`. Some e não volta.
- **Busca com atalho** (`⌘K`) dentro do cabeçalho, à esquerda do menu.
- **4 números** logo abaixo do hero, sem card: número grande, rótulo pequeno embaixo.
- **4 cartões de recurso** com ilustração em cima e um link de texto com ícone de saída embaixo.
  A ilustração de "alta disponibilidade" é um nome de modelo ligado por linhas a 3 provedores:
  explica o fallback sem texto.
- **Cartão de modelo**: nome, "by fornecedor", e um `<dl>` de 2 colunas (Tokens, Tendência
  semanal em vermelho/verde). Bom modelo de `<dl>` compacto.
- **"Como funciona" em 3 passos** com um mini-mock por passo (botões de login, extrato de
  créditos, campo de chave mascarado). O mock mostra o estado, não descreve.
- **Rodapé**: logo + copyright à esquerda, 4 colunas de links, selo "Hiring" ao lado de um
  link, newsletter com consentimento explícito embaixo.

### Vercel AI Gateway (vercel.com/ai-gateway)

A mais densa e a mais "devtools". Fonte sans + mono, quase sem cor.

- **Sub-navegação de produto** abaixo do cabeçalho global (Overview, Models, Leaderboards, Docs).
- **Hero dividido**: título à esquerda com uma palavra dentro de uma pílula contornada; à
  direita, um **bloco de código com duas fileiras de abas** (cliente: API, Claude Code, Codex…;
  dialeto: AI SDK, Chat Completions…), seletor de linguagem, botão copiar, rodapé "Copy for
  agent" e, embaixo, **chips de provedor** que trocam o modelo dentro do código.
- **Número monoespaçado gigante** ("0%") ao lado de um parágrafo curto. Uma ideia por seção.
- **Tabela de promoções**: preço antigo riscado + novo, selo preto com a porcentagem, linhas
  esmaecendo no fim e um "Show more" sobreposto.
- **Diagrama de roteamento com 3 abas** (Disponibilidade, Custo, Latência): app falso à
  esquerda, nó de decisão "Provider degraded?", linha tracejada para o primário com selo
  "Degraded" e linha cheia para o fallback. Cada aba conta a mesma estrutura com outro critério.
- **Diff de variáveis de ambiente** (3 linhas vermelhas `-`, 1 verde `+`) para dizer "troque
  só a base URL". Usa a linguagem visual do diff como argumento.
- **Comando de terminal** com copiar, e **grade de integrações** com logo, descrição e
  `kbd` (`/model`).
- **"Recent ships"**: 3 cartões de changelog com data, título e pilha de avatares.
- **Citação gigante centralizada** + 3 números mono grandes embaixo.
- **Seções de lista de recursos** sem card: título à esquerda, itens em 2–3 colunas com ícone de
  linha, nome em negrito seguido do texto na mesma linha.

### Cloudflare AI Gateway (cloudflare.com/products/ai-gateway)

- **Selo de produto no hero** desenhado como nó de diagrama (caixa com pontos de conexão nas
  laterais). A identidade do produto é o próprio grafo.
- **Linhas finas de grade** que atravessam a página e marcam as colunas; os cartões ficam
  presos nessa grade, com pequenos marcadores nos cruzamentos.
- **Diagrama de roteamento condicional**: nós de regra em pílula ("Paid user?", "RPS > 1.5?"),
  rótulos `true`/`false` nas arestas, nós de modelo com nome + id em mono, cor da marca só no
  caminho ativo.
- **Lista de capacidades em linha do tempo vertical** (ícone no trilho à esquerda).
- **Código + lista de cenários lado a lado**: clicar no cenário à direita troca o arquivo e
  marca o item com uma barra laranja na borda esquerda.
- **Mapa de produtos** em grade de categorias (ícone, nome, descrição de 3 palavras).

### Rerun (rerun.io)

- Título serifado/sans grande, **botões em caixa alta monoespaçada** com borda reta.
- **Título com duas vozes**: primeira frase em cinza, resto em preto ("Open source SDK. A
  single toolchain…"). Hierarquia sem mudar tamanho.
- **Bloco de instalação** com abas de linguagem (C++, Python, Rust) e copiar.
- **Atividade open source ao vivo**: lista de PRs recentes (repo › título truncado › autor).
- **4 colunas "verbo + título em caixa alta mono + parágrafo"** (Query, Transform, Train, Share).
- **Mural de posts** em 4 colunas masonry: avatar, nome, @, ícone da rede, texto, mídia opcional.
- **Rodapé com "Backed by"** (faixa de logos de investidores) e newsletter de release notes.

### Interview Coder (interviewcoder.co)

Escuro com um amarelo só. Muito convertedor, muito ruidoso; serve mais pelo componente do que
pelo tom. (O produto em si é feito para burlar entrevista; aprendemos com a interface, não com a
proposta.)

- **Selo de prova acima do título** (ponto colorido + texto mono caixa alta).
- **Barra de atalhos flutuante** (ícone, pausa, "Take Screenshot ⌘ H", "Solve ⌘ ↵"): um
  `kbd` group como demonstração do produto.
- **Tabela comparativa**: 1ª coluna com recursos (link pontilhado que abre demo + `?`), coluna
  da casa destacada com fundo da marca e borda, concorrentes com nome borrado; `✓` e `✗`.
- **Lista de status**: número `001` em mono, logo, nome, ponto verde + "Last updated 16hrs ago",
  selo "Undetectable", chevron. O 1º item vem aberto com uma onda e "100% Uptime". Padrão de
  status page aplicado a marketing.
- **Preços**: 3 cartões, plano destacado com borda da marca e preço na cor da marca, preço
  original riscado, botão com ícone circular dentro.
- **Seletor vertical de casos à esquerda** (System Design, Behavioral…) trocando o vídeo à direita.
- **FAQ em 2 colunas** com cartão "Não achou? Copie nosso e-mail" ao lado do título.
- Alternância de fundo **preto ↔ bege** entre seções para dar ritmo.

### Perssua (perssua.com/pt)

Em português, escuro, azul de acento. Melhor exemplo de **demo encenada**.

- **Título com pílula viva**: "Perssua `[ícone de onda] escuta`" e a 2ª linha digitando em azul
  com cursor.
- **Botões de download por plataforma** com selo "unstable".
- **Gravador**: cronômetro `00:26`, ponto azul "Escutando", onda de barras verticais simétrica.
- **Casos de uso em abas-pílula** (Entrevista técnica, Cold call…): contexto em cinza, "ELES
  DISSERAM" em itálico, cartão azul "DIGA ISSO" com a resposta. Conta o produto sem screenshot.
- **Tradução ao vivo**: abas Transcrição/Sessão/Resumo, fala original com selo `EN`, cartão
  "Traduzido para português" abaixo, medidores de áudio "Você" e "Outros", botão "Analisar
  transcrição" com `kbd`.
- **Bento 2×2** de recursos com mini-UI em cada um; depois **grade de públicos** com ícone de linha.
- **Seção clara dentro da página escura** (cartão branco grande) para "Funcionalidades".

### ChatGPT dots (chatgpt.com/pt-BR/features/dots)

- **Mascote** como identidade (formas coloridas com rosto). Fora do escopo de uma lib, mas mostra
  que personagem aguenta a página inteira.
- **Linhas alternadas**: cartão de cor sólida com mock de UI dentro + texto ao lado, alternando
  lado a cada linha.
- **Sub-navegação flutuante** que aparece ao rolar (pílula com âncoras e botão de ação).
- **Carrossel de casos** com setas e o próximo cartão aparecendo cortado na borda.
- **3 cartões de segurança** com ícone pequeno, título e texto (o único lugar com cards iguais).
- **"Um dia com seu dot"**: linha do tempo horizontal com pontos, relógio no centro que se
  arrasta, mensagem do agente em balão e texto do momento embaixo.
- **Abas de canal** (ChatGPT, Slack, Teams) trocando o mock do celular.

### OpenAI Business (openai.com/pt-BR/business)

- **Faixa de evento** acima do hero com link "Assista agora".
- **Título com destaque em bloco**: primeira linha com fundo azul translúcido atrás do texto.
- **Fileira de fotos inclinadas** em leque logo abaixo do hero, com logos de clientes sobre elas.
- **"IA para todas as equipes"**: lista vertical de áreas à esquerda (Finanças, Vendas…)
  trocando o vídeo à direita.
- **Abas de produto** (ChatGPT Work, Codex, API) trocando um mock grande do app.
- **4 cartões ilustrados** ("Explorar mais") com ilustração geométrica de cor chapada.
- **Banner de cookies** com 3 botões de mesmo peso (Gerenciar, Rejeitar não essenciais, Aceitar).

### SpaceX (spacex.com)

O oposto das outras: **zero componente, só foto e tipografia**.

- Cada seção é uma tela inteira com foto ou vídeo, título em caixa alta condensado, 2 linhas de
  texto e um botão contornado com seta.
- **Contagem regressiva no cabeçalho** ("Upcoming launches 7:19:20:31") em mono.
- Lição: quando a imagem é boa, a interface some. Serve de referência para um block "seção
  editorial em tela cheia".

### Cluely (cluely.com)

Vista em 12/10/2026, em 1440 e 390 px. Claro, céu e luz em gradiente atrás de uma UI escura de
vidro. Pergunta da tela: "uma IA que ajuda durante a reunião, não depois?".

- **Painel flutuante de assistente** sobre a janela da reunião: vidro escuro translúcido,
  `rounded-2xl`, e acima dele uma **pílula de controle** separada (marca, "Ocultar", parar). Dentro:
  a pergunta da pessoa como balão à direita, a resposta como citação, uma **fileira de ações
  rápidas** em texto com ícone separadas por ponto ("Ajudar · O que eu digo? · Perguntas de
  seguimento · Resumo") e um campo "Pergunte sobre a tela ou a conversa" com atalho em `kbd` e
  botão de enviar redondo. É o `live-transcript` visto do lado de quem pede ajuda.
- **Título em dois tons**: a primeira parte em `foreground`, o fim em `muted-foreground`
  ("Notas de reunião **instantâneas**", "Indetectável **de todo jeito**"). Hierarquia sem peso nem
  cor de marca.
- **Pílula dentro da frase**: um verbo do título vira chip com ícone ("Cluely [ouve] a conversa").
  Mesmo recurso da Vercel, aqui em texto corrido.
- **Cartões de recurso com demo viva** dentro: onda de áudio + cronômetro "00:01 Gravando" no
  cartão azul; o painel do assistente reduzido no cartão claro. O cartão mostra o estado.
- **Números ao lado de uma imagem**, em lista com régua: número grande com a **unidade menor e
  alinhada à base** ("300ms", "12+", "95%"), título e uma frase. É o `metric-strip` em coluna.
- **Documento de notas encenado**: título da reunião, abas Resumo/Transcrição/Uso, itens de ação
  em lista, e no pé uma barra "Retomar sessão" + "Pergunte sobre esta reunião".
- **Botão de download flutuante** fixo no canto superior direito depois que o hero sai da tela.
- **Linha de compatibilidade** com ícone + nome de cada ferramenta, sem logo gigante.
- **CTA final** com teclas 3D de vidro (Enter, Command) flutuando, decorativas, e o título em dois
  tons. No rodapé, um selo "Todos os sistemas operacionais" com ponto verde.

O que não copiar: o rótulo em caixa alta espaçada acima da linha de ferramentas, o glifo `⌘` e
o argumento de ser "indetectável" (é posicionamento deles, não padrão de interface).

## Padrões transversais

1. **Mostrar, não descrever.** Os melhores (Vercel, Perssua, Cloudflare) explicam o produto com
   uma UI falsa que se mexe, não com ícone + parágrafo.
2. **Mono como voz técnica.** Vercel, Rerun, Cloudflare e Interview Coder usam mono em números,
   ids, selos e botões. Bate com a decisão do Flowtomic (JetBrains Mono nos valores).
3. **Uma ideia por seção.** "0%" sozinho; uma citação sozinha. Pouca coisa competindo.
4. **Lista com régua em vez de card** nas seções de recurso (Vercel, Cloudflare). Card só quando
   há mock dentro.
5. **Duas camadas de escolha** (abas de cliente × abas de dialeto; abas de critério no diagrama)
   em vez de páginas separadas.
6. **Destaque por moldura, não por cor em tudo.** A coluna da casa e o plano recomendado ganham
   borda e fundo; o resto fica neutro.

## Tells a não copiar

- Selo em caixa alta espaçada antes de todo título (Interview Coder, Perssua). Já é tell no
  `CLAUDE.md`.
- Subtítulo que repete o título ("Simple and transparent pricing that works for you").
- Nome de concorrente borrado e "100% undetectable": argumento de venda, não padrão de UI.
- Três botões de download idênticos competindo (Perssua).

## Sites sugeridos para a próxima leva

| site | por quê |
|---|---|
| linear.app | ritmo de seção, demo de produto encenada, changelog |
| stripe.com | diagramas animados, código ao lado de explicação, preços |
| raycast.com | barra de comando como herói, atalhos, extensões em grade |
| resend.com | landing de API minimalista, escuro, código como herói |
| supabase.com | abas de produto, bloco de código, mural de depoimentos |
| railway.com | canvas de infraestrutura como ilustração |
| cursor.com | demo de editor encenada, tabela de preços |
| warp.dev | terminal como produto, blocos de comando |
| clerk.com | componente de login mostrado ao vivo na landing |
| status.claude.com / instatus | status page de verdade, para a lista de status |

## Candidatos a componente (para escolher)

Por valor para quem usa a lib, do maior ao menor:

1. **`code-tabs`** (molecule): bloco de código com abas de cliente, abas de dialeto, linguagem,
   copiar e chips que trocam um valor dentro do código.
2. **`routing-diagram`** (organism): ilustração de fluxo app → regra → destinos, com fallback,
   rótulos nas arestas, abas de critério e caminho ativo animado.
3. **`comparison-table`** (molecule): recursos × opções, coluna destacada, `✓/✗/texto`, linha com
   explicação.
4. **`pricing-table`** (organism): 2–4 planos, um destacado, preço riscado, lista de itens.
5. **`status-list`** (molecule): itens numerados com selo de estado, "atualizado há", expansão.
6. **`site-header`** + **`announcement-bar`** + **`site-footer`** (organisms).
7. **`faq-section`** (organism): accordion em 2 colunas + caixa de contato.
8. **`live-transcript`** (organism): gravador com onda, cronômetro, fala/tradução, medidores.
9. **`testimonial-wall`** (organism): mural masonry de posts com mídia opcional.
10. **`env-diff`** (atom): diff de linhas `-`/`+` como argumento visual.
11. **`metric-strip`** (molecule): 3–4 números grandes com rótulo, sem card.
12. **`day-timeline`** (molecule): linha do tempo arrastável com momentos.
13. Block **`product-landing`**: a página inteira montada com as peças acima, como prova.
14. **`assistant-overlay`** (organism, Cluely): painel de vidro com pílula de controle, balão de
    pergunta, resposta, ações rápidas separadas por ponto e campo com atalho.
15. **`two-tone-heading`** (atom, Cluely): título com a parte final em `muted-foreground` e chip
    inline opcional dentro da frase.
16. **`metric-strip`** ganha a variante em coluna ao lado de mídia, com unidade menor na base
    (Cluely).
17. **`floating-cta`** (molecule, Cluely): botão fixo que aparece quando o hero sai da tela.
18. **`glass-keycap`** (efeito, Cluely): tecla 3D de vidro flutuando, decorativa, sem glifo `⌘`.
