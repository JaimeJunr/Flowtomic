# 🧱 Blocks - Componentes Pré-construídos

Blocks são componentes completos e prontos para uso, combinando múltiplos organisms, molecules e atoms.

## 📦 Blocks Disponíveis (4)

### `dashboard-01`

Esqueleto de app: sidebar, cabeçalho e uma área vazia que mostra onde fica o conteúdo
(`pagePath`) e o comando para adicionar o primeiro componente.

**Props**: `appName`, `pagePath`, `componentsUrl`

**Dependências**: nenhuma

**Arquivos**:

- `blocks/dashboard-01/page.tsx` → `app/dashboard/page.tsx`

**Categoria**: `dashboard`

### `flowtomic-dashboard`

Entregas da semana. Responde de longe "o que está atrasado e o que vence até sexta?"
(ex.: *1 atrasada, 3 vencem até sexta*) e mostra embaixo a tabela do que vence, a meta do mês, o
cronômetro e quem está em quê.

**Props**: `deliveries` (`Delivery[]`), `today`, `monthGoal`, `timer`, `appName`,
`onNewDelivery`, `onToggleTimer`. Sem `deliveries`, usa exemplos relativos a `today`.

**Dependências**: `button`

**Arquivos**:

- `blocks/flowtomic-dashboard/page.tsx` → `app/dashboard/page.tsx`

**Categoria**: `dashboard`, `admin`

### `developer-panel`

Painel de desenvolvedor completo com informações do sistema, ambiente, ferramentas de desenvolvimento e editor de scripts integrado.

**Dependências**: `button`, `card`, `badge`, `tabs`, `script-editor`

**Arquivos**:

- `blocks/developer-panel/page.tsx` → `app/developer/page.tsx`

**Categoria**: `developer`, `admin`, `tools`

**Funcionalidades**:

- Informações do usuário atual (nome, email, role, token)
- Status de health check do sistema
- Informações da aplicação (nome, versão, descrição)
- Informações do ambiente frontend (API URL, modo, timezone, resolução)
- Ferramentas de desenvolvimento (Swagger UI, API Docs, Health Check)
- Informações do navegador (User Agent, timestamp)
- Editor de scripts integrado com terminal interativo

## 🚀 Instalação

```bash
# Adicionar um block completo
npx flowtomic@latest add-block dashboard-01

# Adicionar o dashboard completo do Flowtomic
npx flowtomic@latest add-block flowtomic-dashboard

# Adicionar o painel de desenvolvedor
npx flowtomic@latest add-block developer-panel
```

O block será instalado com todos os seus arquivos e dependências automaticamente.

## 📖 Estrutura

Os blocks são instalados como páginas completas e podem ser customizados após a instalação.

## 🎯 Como Funciona

1. O CLI copia os arquivos do block para o seu projeto
2. As dependências necessárias são instaladas automaticamente
3. Os imports são ajustados para usar os aliases do seu projeto
4. Você pode customizar o block após a instalação

## 📝 Exemplos

Após instalar `dashboard-01`, você terá uma página completa de dashboard em `app/dashboard/page.tsx` (ou no caminho especificado pelo block).

Após instalar `flowtomic-dashboard`, você terá um dashboard completo com:

- Sidebar de navegação
- Header com busca e perfil
- Cards de estatísticas de projetos
- Gráfico de barras de analytics
- Lista de projetos
- Lista de membros da equipe
- Card de lembretes
- Gráfico circular de progresso
- Timer com controles

Após instalar `developer-panel`, você terá um painel completo de desenvolvedor com:

- Cards informativos sobre usuário, sistema, ambiente e navegador
- Health check do sistema
- Acesso rápido a ferramentas de desenvolvimento (Swagger, API Docs)
- Editor de scripts com terminal interativo
- Suporte a cópia de informações (token, URLs, User Agent)

### `chatbot`

Conversa com assistente. Vazia, diz o que fazer (`emptyTitle`, `emptyHint`) e oferece
sugestões que quebram linha (rótulo curto, pedido completo enviado). Com mensagens: a da
pessoa num `Bubble`, a do assistente na largura toda, sem balão; cada chamada de ferramenta
numa linha (`ToolStatusLine`); as fontes, sem repetir, só depois que a resposta termina;
“Pensando…” até o primeiro pedaço chegar. Erro aparece colado no campo, com “Tentar de
novo”. Pergunta do assistente (`question`) abre o `Questionnaire` e trava o campo, para
haver um botão forte só. O botão Enviar vira Parar enquanto responde.

O block não fala com nenhuma API: o app liga `messages`, `status` (os mesmos estados do
`useChat` do AI SDK) e os callbacks.

**Props**: `title`, `messages` (`ChatbotMessage[]`, cada uma com `parts` de tipo `text`,
`tool`, `sources` ou `answers`), `status`, `error`, `emptyTitle`, `emptyHint`,
`suggestions`, `question`, `models`, `model`, `onModelChange`, `onSend`, `onStop`,
`onRetry`, `onAnswer`, `onNewChat`

**Dependências**: `button`, `shimmer`, `bubble`, `message`, `sources`, `suggestion`,
`tool-status-line`, `conversation`, `prompt-input`, `questionnaire`

**Arquivos**:

- `blocks/chatbot/page.tsx` → `app/chat/page.tsx`

**Categoria**: `application`, `ai`

Inspirado no [chatbot-template do shadcn](https://github.com/shadcn-ui/chatbot-template) (MIT).

