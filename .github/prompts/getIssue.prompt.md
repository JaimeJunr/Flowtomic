---
name: get-issue
description: Prompt para buscar tickets no Jira usando issue key ou critérios específicos.
model: Auto (copilot)
agent: agent
tools: ["MCP_DOCKER/*"]
argument-hint: "Use este prompt para buscar tickets no Jira. Forneça a issue key ou critérios específicos para a busca."
---

# 🔍 Get Issue: Busca por Ticket no Jira

## 1. Contexto e Preparação

- [ ] **SEMPRE carregue** as instruções do MCP: `fetch_rules(["core/tools/atlassian-mcp-rule"])`
- [ ] **SEMPRE identifique** o projeto alvo (padrão: CAP)
- [ ] **SEMPRE confirme** que autenticação Jira está configurada
- [ ] **SEMPRE valide** permissões de acesso ao projeto
- [ ] **SEMPRE prepare** parâmetros de busca específicos

## 2. Execução Principal

### 2.1 Busca por Issue Key Específico

- [ ] **SEMPRE use** `jira_get_issue` para issue key conhecido:

```ruby
# ✅ CORRETO: Buscar issue específico
jira_get_issue(issue_key: "CAP-123")

# ✅ CORRETO: Com campos específicos
jira_get_issue(
  issue_key: "CAP-123",
  fields: "summary,status,assignee,priority,labels"
)

# ✅ CORRETO: Com comentários
jira_get_issue(
  issue_key: "CAP-123",
  comment_limit: 20,
  expand: "changelog"
)
```

### 2.2 Busca por Critérios Específicos

- [ ] **SEMPRE use** `jira_search` com JQL para critérios específicos:

```ruby
# ✅ CORRETO: Buscar por status
jira_search(jql: "project = CAP AND status = '2. Doing'")

# ✅ CORRETO: Buscar por assignee
jira_search(jql: "project = CAP AND assignee = currentUser()")

# ✅ CORRETO: Buscar por prioridade
jira_search(jql: "project = CAP AND priority = Highest")

# ✅ CORRETO: Buscar por labels
jira_search(jql: "project = CAP AND labels = frontend")

# ✅ CORRETO: Buscar recentes
jira_search(jql: "project = CAP AND updated >= -7d ORDER BY updated DESC")
```

### 2.3 Busca por Board Ágil

- [ ] **SEMPRE use** `jira_get_board_issues` para board específico:

```ruby
# ✅ CORRETO: Buscar issues do board principal
jira_get_board_issues(
  board_id: "46",  # Board DM - Controladoria
  jql: "ORDER BY updated DESC",
  limit: 20
)

# ✅ CORRETO: Buscar por sprint
jira_get_board_issues(
  board_id: "46",
  jql: "sprint in openSprints() AND project = CAP"
)
```

## 3. Validação e Finalização

### 3.1 Verificação de Resultados

- [ ] **SEMPRE confirme** que issue foi encontrado
- [ ] **SEMPRE valide** que campos solicitados estão presentes
- [ ] **SEMPRE verifique** se permissões são adequadas
- [ ] **SEMPRE monitore** logs para erros

### 3.2 Tratamento de Erros

- [ ] **SEMPRE trate** erro de issue não encontrado
- [ ] **SEMPRE trate** erro de permissão insuficiente
- [ ] **SEMPRE trate** erro de autenticação
- [ ] **SEMPRE forneça** mensagens de erro claras

## 4. Exemplos Práticos

### 4.1 Busca Básica

```ruby
# Buscar issue específico
jira_get_issue(issue_key: "CAP-123")
```

### 4.2 Busca Avançada

```ruby
# Buscar issues em desenvolvimento
jira_search(
  jql: "project = CAP AND status = '2. Doing' AND assignee = currentUser()",
  fields: "summary,status,assignee,priority,labels",
  limit: 10
)
```

### 4.3 Busca por Board

```ruby
# Buscar issues do board principal
jira_get_board_issues(
  board_id: "46",
  jql: "project = CAP ORDER BY priority DESC",
  limit: 25
)
```

## 5. Troubleshooting

### 5.1 Problemas Comuns

- **Issue não encontrado**: Verificar se issue key está correto
- **Permissão negada**: Verificar se usuário tem acesso ao projeto
- **Autenticação falhou**: Verificar tokens e configuração
- **Campos ausentes**: Verificar se campos existem no projeto

### 5.2 Validação de Configuração

```bash
# Verificar variáveis de ambiente
echo "JIRA_URL: $JIRA_URL"
echo "ATLASSIAN_OAUTH_CLIENT_ID: $ATLASSIAN_OAUTH_CLIENT_ID"

# Testar conectividade
curl -I "$JIRA_URL/rest/api/2/myself"
```

## 6. Referências

- **Projeto CAP**: InvestTools (6.215+ tickets)
- **Board Principal**: "Board DM - Controladoria" (ID: 46)
- **Tipos de Issue**: História, Tarefa, Bug, Análise
- **Status**: 1. TO DO, 2. Doing, 5. N1 TEST, Waiting deploy, Concluído
- **Prioridades**: Highest, Medium
- **Labels**: frontend, backend, bug, feature, urgent

**Automação**: Configure validação automática de parâmetros e tratamento de erros
