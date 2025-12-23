# 🔍 Review Detail: Análise Completa e Trace

> **🎯 Objetivo**: Comando complementar para análise detalhada focada exclusivamente nas mudanças do Git diff, integrando com review-mode.mdc para análise completa e trace.

---

## 1. Contexto e Preparação

- [ ] **SEMPRE carregue** o review-mode.mdc: `fetch_rules(["core/modes/review-mode"])`
- [ ] **SEMPRE carregue** as diretrizes de arquitetura: `fetch_rules(["core/development/architecture-guidelines"])`
- [ ] **SEMPRE identifique** o Git diff das mudanças
- [ ] **SEMPRE foque** exclusivamente nas alterações realizadas
- [ ] **SEMPRE analise** o impacto das mudanças no contexto existente
- [ ] **SEMPRE obtenha** o Git diff com a branch de origem correta
- [ ] **SEMPRE identifique** arquivos alterados e linhas modificadas
- [ ] **SEMPRE foque** 99% da análise nas mudanças do diff
- [ ] **SEMPRE detecte** automaticamente a stack tecnológica
- [ ] **SEMPRE configure** ferramentas de qualidade para arquivos alterados

## 2. Princípio Fundamental: Foco nas Mudanças

- [ ] **SEMPRE siga** a regra de ouro: 99% da análise sobre código ALTERADO
- [ ] **SEMPRE identifique** exatamente o que foi modificado, adicionado ou removido
- [ ] **SEMPRE analise** o impacto das mudanças no contexto existente
- [ ] **NUNCA revise** arquivo completo linha a linha
- [ ] **SEMPRE use** apenas 1% do contexto para entender o impacto

## 3. Pilares de Revisão de Código de Alta Qualidade

### 3.1 Correção & Funcionalidade das Mudanças

- [ ] **SEMPRE verifique** se as mudanças fazem exatamente o que foi solicitado
- [ ] **SEMPRE confirme** se lógica de negócio foi implementada corretamente nas alterações
- [ ] **SEMPRE valide** se tratamento de exceções está adequado nas mudanças
- [ ] **SEMPRE confirme** se validação de inputs foi implementada nas modificações
- [ ] **SEMPRE verifique** se casos de borda (edge cases) foram tratados nas alterações
- [ ] **SEMPRE confirme** se requisitos funcionais foram atendidos pelas mudanças

### 3.2 Legibilidade & Clareza (Clean Code) das Mudanças

- [ ] **SEMPRE avalie** se outra pessoa consegue entender as mudanças facilmente
- [ ] **SEMPRE verifique** se nomes são significativos e autoexplicativos nas alterações
- [ ] **SEMPRE confirme** se funções são pequenas e com single responsibility nas mudanças
- [ ] **SEMPRE valide** se comentários explicam o "porquê", não o "o quê" nas modificações
- [ ] **SEMPRE verifique** se estrutura lógica está clara e organizada nas alterações
- [ ] **SEMPRE confirme** se complexidade ciclomática está controlada nas mudanças

**🚨 ANÁLISE CRÍTICA OBRIGATÓRIA:**

- [ ] **SEMPRE detecte** comentários excessivos que justificam código mal escrito
- [ ] **SEMPRE identifique** código que requer explicação em vez de ser autoexplicativo
- [ ] **SEMPRE sugira** refatorações para eliminar necessidade de comentários justificativos

### 3.3 Arquitetura & Design das Mudanças

- [ ] **SEMPRE avalie** se as mudanças seguem princípios de design sólidos
- [ ] **SEMPRE verifique** se princípios SOLID foram aplicados nas alterações
- [ ] **SEMPRE confirme** se baixo acoplamento/alta coesão está presente nas mudanças
- [ ] **SEMPRE valide** se não reinventa a roda nas modificações
- [ ] **SEMPRE verifique** se usa os padrões do projeto nas alterações
- [ ] **SEMPRE confirme** se testabilidade está adequada das mudanças

### 3.4 Segurança & Performance das Mudanças

- [ ] **SEMPRE avalie** se as mudanças introduzem vulnerabilidades ou são ineficientes
- [ ] **SEMPRE verifique** vulnerabilidades OWASP Top 10 (SQL Injection, XSS) nas alterações
- [ ] **SEMPRE confirme** se não há vazamento de memória nas mudanças
- [ ] **SEMPRE valide** se não há loops desnecessários (O(n²)) nas modificações
- [ ] **SEMPRE verifique** se não há N+1 queries nas alterações
- [ ] **SEMPRE confirme** se não há operações síncronas pesadas em código assíncrono nas mudanças

### 3.5 Testes & Qualidade (TDD) das Mudanças

- [ ] **SEMPRE avalie** se as mudanças foram desenvolvidas seguindo TDD
- [ ] **SEMPRE verifique** se testes foram escritos ANTES da implementação das mudanças
- [ ] **SEMPRE confirme** se cobertura de testes está adequada para casos críticos das alterações
- [ ] **SEMPRE valide** se testes cobrem casos de borda e cenários de erro nas mudanças
- [ ] **SEMPRE verifique** se testes unitários, de integração e funcionais estão presentes para as modificações
- [ ] **SEMPRE confirme** se refatoração foi baseada em testes que passam nas alterações

**🚨 ANÁLISE CRÍTICA OBRIGATÓRIA:**

- [ ] **SEMPRE verifique** se TDD foi seguido identificando ausência ou insuficiência de testes relevantes
- [ ] **SEMPRE detecte** testes que "testam" comportamento mockado em vez de funcionalidade real
- [ ] **SEMPRE identifique** gaps de cobertura para casos críticos e edge cases
- [ ] **SEMPRE sugira** melhorias práticas que aproximem o código das boas práticas de testes

### 3.6 Arquitetura de Domínio (DDD) das Mudanças

- [ ] **SEMPRE avalie** se as mudanças seguem princípios de DDD
- [ ] **SEMPRE verifique** se entidades de domínio estão bem definidas nas alterações
- [ ] **SEMPRE confirme** se Value Objects foram usados para conceitos imutáveis nas mudanças
- [ ] **SEMPRE valide** se serviços de domínio foram usados para lógica de negócio nas modificações
- [ ] **SEMPRE verifique** se agregados têm limites claros nas alterações
- [ ] **SEMPRE confirme** se linguagem ubíqua entre código e negócio está presente nas mudanças

**🚨 ANÁLISE CRÍTICA OBRIGATÓRIA:**

- [ ] **SEMPRE avalie** se práticas de DDD poderiam ser aplicadas para melhorar arquitetura
- [ ] **SEMPRE identifique** pontos de melhoria na modelagem de domínio
- [ ] **SEMPRE sugira** refatorações para aplicar conceitos DDD apropriados
- [ ] **SEMPRE detecte** violações de princípios de domínio bem definidos

## 4. Análise Crítica Obrigatória

### 4.1 Princípios Fundamentais da Análise Crítica

- [ ] **SEMPRE aplique** análise crítica rigorosa baseada em architecture-guidelines.mdc
- [ ] **SEMPRE verifique** TDD identificando ausência ou insuficiência de testes relevantes
- [ ] **SEMPRE detecte** violações Clean Code: comentários excessivos que justificam código mal escrito
- [ ] **SEMPRE sugira** melhorias práticas que aproximem código das boas práticas
- [ ] **SEMPRE avalie** DDD identificando oportunidades de aplicação
- [ ] **🚨 CRÍTICO: SEMPRE verifique** logging: uso incorreto de Rails.logger, emojis em logs, logs excessivos
- [ ] **🚨 CRÍTICO: SEMPRE verifique** uso do concern Loggable

### 4.2 Critérios de Análise Crítica

#### TDD - Test-Driven Development

- [ ] **SEMPRE verifique** se testes foram escritos ANTES da implementação (ciclo Red-Green-Refactor)
- [ ] **SEMPRE confirme** se cobertura está adequada para funcionalidades críticas e edge cases
- [ ] **SEMPRE valide** se testes validam comportamento real em vez de mocks desnecessários
- [ ] **SEMPRE verifique** se refatoração foi baseada em testes que passam
- [ ] **SEMPRE identifique** ausência de testes para lógica de negócio complexa

#### Clean Code - Detecção de Violações

- [ ] **SEMPRE identifique** comentários excessivos que justificam código mal escrito
- [ ] **SEMPRE detecte** código que requer explicação em vez de ser autoexplicativo
- [ ] **SEMPRE identifique** nomes não descritivos que necessitam comentários
- [ ] **SEMPRE detecte** funções longas que precisam de documentação extensa

#### DDD - Domain-Driven Design

- [ ] **SEMPRE avalie** conceitos de domínio bem modelados e consistentes
- [ ] **SEMPRE verifique** Value Objects para conceitos imutáveis do domínio
- [ ] **SEMPRE confirme** entidades com identidade e ciclo de vida claros
- [ ] **SEMPRE valide** serviços de domínio para lógica de negócio complexa
- [ ] **SEMPRE verifique** agregados com limites e invariantes bem definidos

## 5. Controle de Escopo e Qualidade

### 5.1 Princípio Fundamental: Escopo Controlado

- [ ] **SEMPRE verifique** se as alterações estão APENAS no escopo do ticket ou tarefa
- [ ] **SEMPRE confirme** se alterações têm motivo rastreável ao ticket/tarefa
- [ ] **SEMPRE valide** se cada commit tem foco único (Single Responsibility Principle)
- [ ] **SEMPRE evite** mudanças "por conveniência" que não estão no escopo
- [ ] **SEMPRE documente** qualquer alteração que pareça estar fora do escopo

### 5.2 Aplicação da Boy Scout Rule

**Pequenas melhorias locais são aceitáveis APENAS se:**

- [ ] **SEMPRE confirme** se impacto é muito pequeno e relacionado ao ticket atual
- [ ] **SEMPRE verifique** se melhoria é local ao código que já está sendo alterado
- [ ] **SEMPRE valide** se não introduz mudanças arquiteturais significativas
- [ ] **SEMPRE confirme** se facilita a implementação da funcionalidade principal

**❌ PROIBIDO - Reportar como BLOCKER:**

- [ ] **SEMPRE reporte** refactors maiores que alteram estrutura de múltiplos arquivos
- [ ] **SEMPRE reporte** mudanças não mapeadas no ticket original
- [ ] **SEMPRE reporte** melhorias que afetam outras funcionalidades não relacionadas
- [ ] **SEMPRE reporte** alterações arquiteturais que não são parte do escopo

### 5.3 Checklist de Controle de Escopo

**DURANTE a análise de QUALQUER mudança:**

- [ ] **Mudança está diretamente relacionada** ao ticket/tarefa?
- [ ] **Motivo é rastreável** e documentado?
- [ ] **Impacto é limitado** ao escopo definido?
- [ ] **Não afeta** funcionalidades não relacionadas?
- [ ] **Está documentada** para revisão da equipe?
- [ ] **Pode ser revertida** independentemente se necessário?

**SE QUALQUER ITEM FOR "NÃO":**

1. **SEMPRE reporte** como BLOCKER na análise
2. **SEMPRE documente** o desvio de escopo
3. **SEMPRE sugira** criação de ticket separado se necessário
4. **SEMPRE recomende** aprovação antes de prosseguir

## 6. Validação de Logging em Testes

### 6.1 Proibições Absolutas em Testes

**SEMPRE identifique e reporte como BLOCKER:**

- [ ] **Configurações de logging habilitadas** em `spec_helper.rb` ou `rails_helper.rb`
- [ ] **Logs habilitados** diretamente no código de teste
- [ ] **Configurações de debug** que podem vazar para produção
- [ ] **Logs de desenvolvimento** em ambiente de teste

### 6.2 Checklist de Validação de Logging em Testes

**DURANTE a análise de QUALQUER mudança:**

- [ ] **spec_helper.rb**: NENHUMA configuração de logging
- [ ] **rails_helper.rb**: NENHUMA configuração de logging
- [ ] **Testes individuais**: NENHUM log direto no código
- [ ] **Configurações de debug**: NENHUMA configuração que pode vazar
- [ ] **Logs de desenvolvimento**: NENHUM log habilitado em teste
- [ ] **Arquivos de configuração**: NENHUMA configuração de logging
- [ ] **Hooks de teste**: NENHUMA configuração de logging em before/after

**SE QUALQUER ITEM FOR "NÃO":**

1. **SEMPRE reporte** como BLOCKER na análise
2. **SEMPRE documente** o desvio de escopo
3. **SEMPRE sugira** criação de ticket separado se necessário
4. **SEMPRE recomende** aprovação antes de prosseguir

## 7. Classificação de Prioridades

### 7.1 🚨 BLOCKER - Escopo Expandido

- [ ] **Refactors arquiteturais** não solicitados
- [ ] **Mudanças em múltiplos serviços** não relacionados
- [ ] **Funcionalidades adicionais** não mapeadas no ticket
- [ ] **Alterações que afetam** outras funcionalidades não relacionadas

### 7.2 ⚠️ WARNING - Escopo Questionável

- [ ] **Melhorias locais** que podem estar no limite do escopo
- [ ] **Refactors menores** que não são claramente necessários
- [ ] **Documentação insuficiente** para justificar mudanças
- [ ] **Testes que cobrem** funcionalidades não implementadas

### 7.3 💡 SUGGESTION - Escopo Apropriado

- [ ] **Melhorias locais** claramente relacionadas ao ticket
- [ ] **Refactors menores** que facilitam a implementação
- [ ] **Documentação adequada** para todas as mudanças
- [ ] **Testes focados** na funcionalidade implementada

## 8. Validação e Finalização

### 8.1 Validação Técnica

- [ ] **SEMPRE execute** detecção automática de stack tecnológica
- [ ] **SEMPRE carregue** regras específicas baseadas na detecção
- [ ] **SEMPRE execute** validações automáticas (RuboCop, ESLint, etc.)
- [ ] **SEMPRE valide** logging em testes conforme critérios estabelecidos

### 8.2 Checklist de Qualidade

- [ ] **Estrutura Hierárquica**: Máximo 3 níveis de títulos
- [ ] **Linguagem Imperativa**: 100% de instruções diretas
- [ ] **Foco nas Mudanças**: 99% da análise sobre código alterado
- [ ] **Análise Crítica**: TDD, Clean Code e DDD aplicados
- [ ] **Controle de Escopo**: Alterações dentro do escopo do ticket
- [ ] **Validação de Logging**: Nenhuma violação em testes

## 9. Exemplos Práticos

### 9.1 Exemplo de Análise Correta

**Ticket:** "Corrigir conversão de moedas USD para USD-BNY no cálculo de NAV"

**Alterações PERMITIDAS:**

- Modificar método de conversão em `DbPricing`
- Atualizar testes relacionados
- Adicionar logs para validação

**Análise:** ✅ **PASS** - Todas as alterações estão no escopo do ticket

### 9.2 Exemplo de Análise Incorreta

**Ticket:** "Corrigir conversão de moedas USD para USD-BNY no cálculo de NAV"

**Alterações INCORRETAS:**

- Refatorar toda a arquitetura de pricing
- Modificar múltiplos serviços não relacionados
- Adicionar funcionalidades de cache não solicitadas

**Análise:** 🚨 **BLOCKER** - Escopo expandido além do solicitado

## 10. Referências e Recursos

- [Review Mode](core/modes/review-mode.mdc) - Modo base de revisão
- [Architecture Guidelines](core/development/architecture-guidelines.mdc) - Diretrizes de Clean Code, TDD e DDD
- [Markdown Rule](core/documentation/markdown-rule.mdc) - Formatação de documentação
- [Prompt Engineering](core/formatter/prompt-engineering-rule.mdc) - Fundamentos de engenharia de prompt

**Por que estas regras existem**: Análise detalhada focada nas mudanças garante qualidade e controle de escopo
**Automação**: Integre com review-mode.mdc para análise completa e trace
