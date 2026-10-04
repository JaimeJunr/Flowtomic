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

**Dependências**: `ai`, `nanoid`, `lucide-react`, `cmdk`, `cn`

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
