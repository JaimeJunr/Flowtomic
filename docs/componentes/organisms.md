# 🦠 Organisms - Componentes Complexos

Componentes organizacionais do Flowtomic. São componentes complexos que combinam múltiplos molecules e atoms.

## 📦 Componentes Disponíveis (23)

### `dashboard-layout`

Layout completo de dashboard com sidebar e header.

**Dependências**: `cn`

### `stats-grid`

Grid de estatísticas para exibir múltiplos cards de estatística.

**Dependências**: `cn`

### `monthly-summary`

Resumo mensal com gráficos e estatísticas.

**Dependências**: `lucide-react`, `cn`

### `dashboard-header-actions`

Ações do header do dashboard (notificações, perfil, etc.).

**Dependências**: `lucide-react`, `cn`

### `dashboard-movements-section`

Seção de movimentações do dashboard com tabela e filtros.

**Dependências**: `lucide-react`, `cn`

### `resizable-layout`

Componente redimensionável com sidebar que suporta persistência, snap automático e modo mobile.

**Dependências**: `@flowtomic/logic`, `react-resizable-panels`, `lucide-react`, `cn`

**Localização**: `packages/ui/src/components/organisms/resizable-layout`

**Nota**: Anteriormente listado como `resizable` no README, mas o nome correto é `resizable-layout`.

### `conversation`

Container de conversa com scroll automático e empty state. Segue o fim enquanto a
pessoa está lá; se ela rolar para cima, para de seguir. `ConversationScrollButton`
mostra “Ir para o fim” só nesse caso, entrando e saindo com transição (sem transição
com `prefers-reduced-motion`). Escondido, fica fora do leitor de tela e do Tab.

`ConversationTurn anchor` envolve a última pergunta e a resposta dela. Quando a pessoa
envia, o turno sobe pro topo e a rolagem para de seguir a resposta; se ela passar da tela,
o “Ir para o fim” aparece. Ao abrir uma conversa que já existe, nada muda (vai para o fim).
Dê ao turno a `key` da pergunta, para cada envio montar um turno novo — ver o block `chatbot`.

**Dependências**: `use-stick-to-bottom`, `lucide-react`, `cn`

### `chat-log`

Container de mensagens de chat com scroll automático, suporte a filtros customizáveis, header com controles e empty state.

**Dependências**: `use-stick-to-bottom`, `lucide-react`, `cn`

**Localização**: `packages/ui/src/components/organisms/chat-log`

**Características**:
- Container de mensagens de chat
- Segue a última mensagem pelo `Conversation`, sem puxar quem rolou para cima; botão
  “Ir para o fim” quando a pessoa sai do fim
- `autoScroll={false}`: a conversa não segue o fim sozinha a cada mensagem nova
- Suporte a filtros customizáveis (via props)
- Header com controles customizáveis (busca, capítulos, etc.)
- Empty state customizável
- Integração com ChatMessage
- Suporte a markdown
- Configuração de tipos de mensagem e senders

### `model-selector`

Seletor de modelo com dialog e command palette.

**Logo do provedor**: `ModelSelectorLogo` não busca imagem em site de fora. Sem `src`, mostra a
inicial do provedor; para o logo de verdade, sirva o arquivo no app e passe
`<ModelSelectorLogo provider="anthropic" src="/logos/anthropic.svg" />`. ⚠️ Até a 0.8 o logo vinha
sozinho de `models.dev`.

**Dependências**: `cmdk`, `cn`

### `image`

Display de imagem gerada com suporte a base64.

**Dependências**: `ai`, `cn`

### `open-in-chat`

Dropdown para abrir conversas em diferentes plataformas (ChatGPT, Claude, etc.).

**Dependências**: `lucide-react`, `cn`

### `panel`

Wrapper do Panel do @xyflow/react para posicionar elementos sobre o canvas.

**Dependências**: `@xyflow/react`, `cn`

### `toolbar`

Wrapper do NodeToolbar do @xyflow/react para exibir ações em nodes.

**Dependências**: `@xyflow/react`, `cn`

### `controls`

Wrapper do Controls do @xyflow/react para controles de zoom e pan.

**Dependências**: `@xyflow/react`, `cn`

### `queue`

Componente de fila para exibir mensagens e tarefas com seções colapsáveis.

**Dependências**: `lucide-react`, `cn`

### `reasoning`

Componente para exibir raciocínio/thinking do modelo com suporte a streaming.

**Dependências**: `@radix-ui/react-use-controllable-state`, `streamdown`, `lucide-react`, `cn`

### `plan`

Componente para exibir planos do modelo com suporte a streaming.

**Dependências**: `lucide-react`, `cn`

### `web-preview`

Componente para visualizar páginas web em iframe com console e navegação.

**Dependências**: `lucide-react`, `cn`

### `script-editor`

Componente para editar e executar scripts com terminal interativo em tempo real.

**Dependências**: `@flowtomic/logic`, `lucide-react`, `cn`

**Localização**: `packages/ui/src/components/organisms/script-editor`

**Características**:

- Editor de código para scripts
- Terminal interativo em tempo real via WebSocket
- Preview da resposta do servidor formatado (JSON)
- Abas para alternar entre terminal e preview
- Execução de scripts no backend (WebSocket ou HTTP fallback)
- Reconexão automática do WebSocket
- Scroll automático do terminal

### `chain-of-thought`

Componente para exibir cadeia de raciocínio com steps e status.

**Dependências**: `@radix-ui/react-use-controllable-state`, `lucide-react`, `cn`

### `context`

Componente para exibir uso de contexto/tokens do modelo com cálculo de custos.

**Dependências**: `tokenlens`, `ai`, `lucide-react`, `cn`

### `prompt-input`

Componente complexo para input de prompt com suporte a attachments, speech recognition, e muito mais.
O texto fica em cima e o `PromptInputFooter` embaixo (ferramentas à esquerda, envio à
direita). Enter envia, Shift+Enter quebra a linha, e campo vazio sem anexo não envia.
`PromptInputSubmit` mostra “Enviar”, desabilitado enquanto não há texto nem anexo; com `status` `submitted` ou `streaming` vira “Parar”
no mesmo lugar, como `type="button"` que chama `onStop` (sem `onStop`, fica
desabilitado). O contêiner tem borda fina e anel de foco, sem sombra.

Partes opcionais, vindas do Prompt Bar do React Bits em clean room
(`docs/clean-room/react-bits/prompt-input-extras.md`):

- **`PromptInputTriggerMenu`:** menu de `@` (fontes) ou `/` (comandos) ligado ao textarea.
  Setas navegam, Enter escolhe sem enviar, Escape fecha.
- **`PromptInputEffort`:** régua de esforço. No último passo, o campo ganha brilho da marca e
  faíscas que aceleram com a digitação.
- **Transição do `PromptInputSubmit`:** a seta vira quadrado quando há resposta em andamento.
  A API do componente não muda.

**Dependências**: `ai`, `nanoid`, `lucide-react`, `cmdk`, `motion`, `@radix-ui/react-popover`, `@radix-ui/react-slider`, `cn`

### `questionnaire`

Pergunta do assistente para a pessoa, uma por vez, dentro de um cartão flutuante.
Cada `QuestionnaireQuestion` tem `id`, `title` e `choices`; a última opção é sempre
“Outra resposta”, em texto livre. As teclas 1, 2, 3… escolhem a opção (menos enquanto se
digita no campo livre), as setas andam entre elas (Radix `RadioGroup`) e Enter no campo
livre avança. “Próxima” sem resposta mostra o erro e não avança; “Pular” avança marcando
`skipped`. Ao trocar de pergunta, o foco vai para o título. Na última, o botão vira
“Enviar” e `onSubmit` recebe `QuestionnaireAnswer[]` (`question`, `answer` com o rótulo
escolhido ou o texto, `skipped`). Com `preparing`, mostra só “Preparando a pergunta…”.
O progresso (“Pergunta 1 de 2”) só aparece com mais de uma pergunta.
`QuestionnaireSummary` é o que fica no histórico: a pergunta apagada e a resposta em
destaque. Usa os atoms `button` e `shimmer`. Inspirado no chatbot-template do shadcn (MIT).

**Dependências**: `@radix-ui/react-radio-group`, `lucide-react`, `motion`, `cn`

### `pricing-table`

Dois a quatro planos lado a lado, um deles recomendado, com alternância opcional de período
(Mensal/Anual, `ToggleGroup` como `radiogroup` rotulado "Período de cobrança"). Cada plano é uma
`<section>` com nome, preço, preço original riscado ("Antes: R$ 499" para leitor de tela), frase,
botão de largura total, nota e lista de itens (`included: false` aparece riscado, com "Não incluso:").
O destacado (`highlighted`, selo `highlightLabel`) tem borda `primary` e botão sólido; os outros usam `outline`.

- **Preço:** `price` é um `PricingPrice` único ou um `Record` por id de período; sem o período
  escolhido, usa o primeiro disponível. Número é formatado com `Intl` (`currency` padrão `BRL`,
  `locale` padrão `pt-BR`); texto fica como está. O número desliza com o `sliding-number` e
  troca seco com movimento reduzido.
- **Período:** controlado (`period` + `onPeriodChange`) ou não (`defaultPeriod`).
- **Ação:** `action.href` vira link; `action.onClick` é chamado.
- **Grade:** container queries do Tailwind (sem medir em JS). Abaixo de 640 px empilha, o
  destacado primeiro; 4 planos entre 640 e 1024 px formam 2x2.

**Dependências**: `@radix-ui/react-toggle-group`, `motion`, `lucide-react`, `cn`
**Clean room**: `docs/clean-room/sites/pricing-table.md`

### `announcement-bar`

Faixa de aviso de largura total, logo abaixo do cabeçalho: ícone (opcional), texto e link
sublinhado centralizados, com botão de fechar. É um `<aside aria-label="Aviso">` (rótulo na prop
`label`), sem `role="alert"`: o aviso não é urgente.

- **Fechar:** `dismissible` (padrão `true`). Chama `onDismiss` e esconde a faixa; a altura anima
  até 0 (~200 ms) e, com movimento reduzido, ela some seca.
- **Lembrar:** com `storageKey`, o fechamento fica em `localStorage` (tudo em try/catch, storage
  que falha não quebra) e a faixa não volta.
- **Controlada:** `open` + `onOpenChange`.
- **Cor:** `primary` a 8% sobre o fundo, borda a 25% (`color-mix`), só tokens semânticos.

**Dependências**: `lucide-react`, `motion`, `cn`
**Clean room**: `docs/clean-room/sites/site-chrome.md`

### `site-header`

Cabeçalho de página de produto: logo (link para `logoHref`), navegação principal, slots `search`
e `social`, ações e sub-navegação opcional. Fixo no topo (`sticky`, padrão `true`). O primeiro foco
é o link "Pular para o conteúdo" (`skipToContent`, padrão `#conteudo`, `false` remove).

- **Navegação:** `nav` aceita link simples ou grupo (`items`, `columns` 1 ou 2) que abre um painel
  do `navigation-menu` com título, descrição e ícone. Item `active` ganha `aria-current="page"`;
  `external` abre em nova aba com ícone e texto "(abre em nova aba)".
- **Ações:** no máximo uma `variant: "default"` (sólida); duas disparam `console.warn`. `mobile`
  escolhe quais ficam no cabeçalho estreito (padrão: só a sólida).
- **Estreito:** abaixo de 1024 px de contêiner (container query, sem medir em JS) some a navegação,
  a busca vira ícone e entra o botão de menu, que abre um `Sheet` pela direita com a navegação
  inteira (grupos viram títulos), busca, redes e todas as ações. A prop `layout`
  (`auto`, `desktop`, `mobile`) força o modo, para teste e para story.
- **Sub-navegação:** `subnav` (`title` em mono, abas em pílula; no estreito rola na horizontal e a
  aba ativa aparece).
- `SiteNavLink`, `SiteNavItem` e `SiteHeaderAction` vivem em `site-header/types.ts` e o
  `site-footer` reusa `SiteNavLink`.

**Dependências**: `lucide-react`, `cn` (usa os atoms `button`, `sheet` e `navigation-menu`)
**Clean room**: `docs/clean-room/sites/site-chrome.md`

### `site-footer`

Rodapé de página de produto: coluna de marca (`brand`: logo, frase; `social`), `columns` de links
(cada uma é uma `<nav aria-labelledby>` com título em `h2`, `headingLevel` 2 a 4), `band` opcional
depois de uma régua e linha final com `copyright` e `legal`. Link pode ter `badge` (Badge
`secondary`) e `external` (ícone de saída e texto para leitor de tela).

- **Grade:** container queries. Abaixo de 640 px a marca fica em cima e as colunas em 2 por linha;
  de 640 a 1024 px, até 4 colunas; de 1024 px em diante, tudo numa linha (marca com 2 frações).
- **`SiteFooterNewsletter`:** faixa pronta para o `band`: título, frase, campo de e-mail com
  `<label>` oculto "E-mail", botão sólido e letra miúda. `onSubmit(email)` pode ser assíncrono;
  estados `idle`, `loading`, `success` e `error` (promessa rejeitada) numa região
  `aria-live="polite"` ligada ao campo por `aria-describedby`. Mensagens em `successMessage` e
  `errorMessage`.
- `contained` (padrão `true`) limita a largura a `max-w-6xl`.

**Dependências**: `lucide-react`, `cn` (usa os atoms `badge`, `button` e `input`; importa o tipo de `site-header`)
**Clean room**: `docs/clean-room/sites/site-chrome.md`

### `node`

Componente Node para ReactFlow baseado em Card com handles.

**Dependências**: `@xyflow/react`, `cn`

### `edge`

Componentes Edge para ReactFlow (Temporary e Animated).

**Dependências**: `@xyflow/react`, `cn`

### `genealogy-canvas`

Canvas de genealogia para visualização de hierarquias e relacionamentos.

**Dependências**: `@xyflow/react`, `cn`

**Localização**: `packages/ui/src/components/organisms/genealogy-canvas`

### `routing-diagram`

Ilustra uma regra de roteamento sem texto: um pedido sai da origem, passa por decisões ("O provedor caiu?") e chega a um destino. Cada aba é um cenário com a mesma estrutura e outro critério; o caminho escolhido (`activePath`, lista de ids) acende e se desenha da origem ao destino, com um ponto de pulso opcional. É ilustração, não editor: sem arrastar nem zoom (o editor de fluxo é `canvas`/`node`/`edge`). Não usa React Flow; o layout é uma função pura (`computeLayout`) que calcula posições a partir da árvore, na horizontal ou, abaixo de 640 px, na vertical.

- Árvore de qualquer profundidade: `RoutingDecision` (`branches`) e `RoutingTarget` (com `fallback` para a cadeia horizontal de reserva, `status: "down"` para destino desviado).
- `tone="brand"` pinta o caminho ativo com `--primary`; padrão `neutral` usa `--foreground`.
- Props: `scenarios`, `value`/`defaultValue`/`onValueChange`, `source`, `sourceLabel`, `tone`, `pulse` (padrão `true`), `autoPlay` (padrão `false`; pausa no hover/foco e para após clique em aba), `ariaLabel`, `renderDescription`.
- Descrição do cenário: por padrão um bloco abaixo do diagrama. Para posicioná-la em outro lugar, envolva tudo em `RoutingDiagramProvider`, ponha `RoutingDiagramDescription` onde quiser e passe `renderDescription={() => null}` ao diagrama para não duplicar. Dentro do provider, `scenarios`/`value` do diagrama são ignorados.
- Movimento reduzido: sem desenho progressivo, sem pulso e sem `autoPlay`.
- `activePath` com id inexistente não quebra: nada fica ativo e há um `console.warn` em dev. Os ids da árvore precisam ser únicos dentro do cenário.
- Conteúdo dos nós é neutro: sem marcas nem logos de terceiros.

**Dependências**: `@radix-ui/react-tabs`, `motion`, `cn`

**Localização**: `packages/ui/src/components/organisms/routing-diagram`

## 🚀 Instalação

```bash
# Instalar um organism específico
npx flowtomic@latest add dashboard-layout

# Instalar múltiplos organisms
npx flowtomic@latest add dashboard-layout stats-grid monthly-summary resizable-layout
```

## 📖 Exemplos de Uso

```typescript
import { DashboardLayout } from "@/components/ui/dashboard-layout";
import { StatsGrid } from "@/components/ui/stats-grid";
import { MonthlySummary } from "@/components/ui/monthly-summary";

export function DashboardPage() {
  return (
    <DashboardLayout>
      <StatsGrid
        stats={[
          { title: "Vendas", value: "R$ 10.000", trend: "+12%" },
          { title: "Usuários", value: "1.234", trend: "+5%" },
        ]}
      />
      <MonthlySummary data={monthlyData} />
    </DashboardLayout>
  );
}
```
