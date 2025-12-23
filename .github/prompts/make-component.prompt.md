---
name: make-component
description: Cria componentes React seguindo as regras especializadas designer-react e react-components, garantindo acessibilidade, performance e integração com shadcn/ui e Framer Motion.
argument-hint: --name="Button" --type="atom" --animated --path="ui/"
model: Auto (copilot)
agent: agent
tools:
  [
    "edit",
    "runNotebooks",
    "search",
    "new",
    "runCommands",
    "runTasks",
    "Framelink MCP for Figma/*",
    "io.github.ChromeDevTools/chrome-devtools-mcp/*",
    "usages",
    "vscodeAPI",
    "problems",
    "changes",
    "testFailure",
    "openSimpleBrowser",
    "fetch",
    "githubRepo",
    "extensions",
    "todos",
    "runSubagent",
  ]
---

# Make Component

## Overview

Cria componentes React seguindo as regras especializadas `designer-react` e `react-components`.

Garante que novos componentes sigam padrões de acessibilidade, performance, animação e design system.

Utiliza shadcn/ui, Framer Motion e Tailwind CSS para implementação completa e consistente.

## Parâmetros

- **--name**: Nome do componente (obrigatório, PascalCase)
- **--type**: Tipo do componente - `atom` | `molecule` | `organism` | `page` | `component`
  (opcional, se não for passado, decida automaticamente)
- **--animated**: Incluir animações com Framer Motion (opcional, padrão: `false`)
- **--path**: Caminho de destino relativo a `frontend/src/presentation/components/` (opcional)

## 1. Preparação e Carregamento de Regras

- [ ] **SEMPRE carregue** as regras de componentes React: `fetch_rules(["front/react-components"])`
- [ ] **SEMPRE carregue** as regras de designer React: `fetch_rules(["front/designer-react"])`
- [ ] **SEMPRE valide** parâmetros fornecidos (nome, tipo, path)
- [ ] **SEMPRE verifique** se componente já existe no caminho especificado
- [ ] **SEMPRE confirme** estrutura de diretórios do projeto antes de criar

## 2. Planejamento da Arquitetura do Componente

- [ ] **SEMPRE determine** o tipo (`atom`, `molecule`, `organism`, `page` ou `component`) se não foi fornecido,
      baseando-se na complexidade do componente
- [ ] **SEMPRE descreva** plano de arquitetura do componente em pseudocódigo detalhado
- [ ] **SEMPRE identifique** dependências necessárias (shadcn/ui, Framer Motion, etc.)
- [ ] **SEMPRE defina** interface TypeScript para props do componente
- [ ] **SEMPRE planeje** variantes usando CVA (Class Variance Authority) se necessário
- [ ] **SEMPRE confirme** abordagem antes de escrever código completo

## 3. Implementação do Componente

### 3.1 Estrutura Base

- [ ] **SEMPRE use** `forwardRef` para componentes interativos
- [ ] **SEMPRE implemente** interface TypeScript rigorosa para todas as props
- [ ] **SEMPRE exporte** componente com `displayName` apropriado
- [ ] **SEMPRE use** função utilitária `cn()` para classes condicionais
- [ ] **SEMPRE siga** convenções de nomenclatura do shadcn/ui

### 3.2 Estilização e Design System

- [ ] **SEMPRE use** classes Tailwind com design tokens do shadcn
- [ ] **SEMPRE utilize** variáveis CSS para estilização sensível ao tema (`hsl(var(--primary))`)
- [ ] **SEMPRE implemente** estados de foco e indicadores de acessibilidade
- [ ] **SEMPRE siga** escalas de espaçamento e tipografia do shadcn/ui
- [ ] **SEMPRE suporte** modo escuro através de variáveis CSS

### 3.3 Acessibilidade

- [ ] **SEMPRE implemente** rótulos, papéis e propriedades ARIA corretamente
- [ ] **SEMPRE garanta** navegação por teclado totalmente funcional
- [ ] **SEMPRE forneça** gerenciamento de foco e indicadores visuais adequados
- [ ] **SEMPRE inclua** suporte a leitores de tela com anúncios apropriados
- [ ] **SEMPRE siga** diretrizes WCAG 2.1 nível AA

### 3.4 Animações (se --animated)

- [ ] **SEMPRE use** componentes `motion` do Framer Motion quando animações forem solicitadas
- [ ] **SEMPRE crie** motion variants reutilizáveis para linguagem de animação consistente
- [ ] **SEMPRE implemente** `useReducedMotion` para respeitar preferências de acessibilidade
- [ ] **SEMPRE priorize** animações de `transform` e `opacity` para aceleração via GPU
- [ ] **SEMPRE use** `AnimatePresence` para animações de entrada e saída quando necessário
- [ ] **SEMPRE mantenha** performance a 60fps

## 4. Integração com shadcn/ui

- [ ] **SEMPRE estenda** componentes existentes do shadcn em vez de recriá-los
- [ ] **SEMPRE use** primitivos do Radix UI como base ao criar novos componentes
- [ ] **SEMPRE siga** padrões e convenções da API de componentes do shadcn/ui
- [ ] **SEMPRE implemente** sistemas de variantes com padrões sensatos (sensible defaults)
- [ ] **SEMPRE crie** componentes que se integrem perfeitamente aos demais componentes do shadcn

## 5. Validação e Testes

- [ ] **SEMPRE verifique** que componente está totalmente funcional sem placeholders
- [ ] **SEMPRE inclua** todos os imports, tipos e exportações necessários
- [ ] **SEMPRE valide** que código segue boas práticas DRY (Don't Repeat Yourself)
- [ ] **SEMPRE teste** componente com tecnologias assistivas em mente
- [ ] **SEMPRE confirme** que animações respeitam `prefers-reduced-motion`

## Checklist de Validação Final

- [ ] **SEMPRE verifique** que regras `react-components` e `designer-react` foram aplicadas
- [ ] **SEMPRE confirme** que componente segue padrões do shadcn/ui
- [ ] **SEMPRE valide** que acessibilidade está implementada corretamente
- [ ] **SEMPRE verifique** que TypeScript está sem erros
- [ ] **SEMPRE confirme** que estilização usa design tokens do projeto
- [ ] **SEMPRE valide** que animações (se aplicável) são performáticas e acessíveis
- [ ] **SEMPRE garanta** que componente está completo sem partes faltando
- [ ] **SEMPRE confirme** que código está limpo e bem estruturado

## Exemplos de Uso

```bash
# Criar componente básico
make-component --name="Button" --type="atom"

# Criar componente com animações
make-component --name="AnimatedCard" --type="molecule" --animated

# Criar componente em caminho específico
make-component --name="DashboardWidget" --type="organism" --path="dashboard/"
```

## Notas Importantes

- **SEMPRE priorize** acessibilidade e experiência do usuário acima da complexidade
- **SEMPRE implemente** toda funcionalidade solicitada completamente
- **NUNCA deixe** placeholders, todos ou partes faltando
- **SEMPRE seja** conciso e evite texto desnecessário
- **SEMPRE pesquise** documentação mais recente do shadcn/ui e Framer Motion quando necessário
