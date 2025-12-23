# ⚡ Review Quick: Análise Rápida Focada em Mudanças

> **🎯 Objetivo**: Análise rápida e direta focada nos pontos críticos das mudanças do Git diff para aprovação imediata

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

## 3. Análise Crítica das Mudanças

### 3.1 Detecção Automática

- [ ] **SEMPRE identifique** stack detectada: Ruby/Rails, JavaScript/React, Python, Java
- [ ] **SEMPRE execute** ferramentas: RuboCop, ESLint, Black, etc. **APENAS nos arquivos alterados**
- [ ] **SEMPRE mapeie** mudanças: linhas adicionadas (+), removidas (-), modificadas

### 3.2 Classificação de Problemas

- [ ] **SEMPRE identifique** **🚨 BLOCKERS**: Erros críticos **nas mudanças** que impedem aprovação
- [ ] **SEMPRE catalogue** **⚠️ WARNINGS**: Problemas **nas alterações** que devem ser corrigidos
- [ ] **SEMPRE destaque** **✅ CHECKS**: Pontos positivos **das mudanças** identificados

### 3.3 Critérios de Blocker

#### Segurança

- [ ] **SEMPRE bloqueie** se dados sensíveis expostos
- [ ] **SEMPRE bloqueie** se vulnerabilidades OWASP encontradas
- [ ] **SEMPRE bloqueie** se logs de produção em testes

#### Funcionalidade

- [ ] **SEMPRE bloqueie** se código não compila
- [ ] **SEMPRE bloqueie** se testes falhando
- [ ] **SEMPRE bloqueie** se lógica de negócio incorreta

#### Qualidade Crítica

- [ ] **SEMPRE bloqueie** se violações de TDD obrigatório
- [ ] **SEMPRE bloqueie** se Clean Code crítico violado
- [ ] **SEMPRE bloqueie** se arquitetura quebrada

## 4. Decisão Final e Ações

### 4.1 Classificação de Decisão

- [ ] **✅ APROVAR**: Mudanças prontas para merge
- [ ] **❌ REJEITAR**: Blocker crítico **nas mudanças** encontrado
- [ ] **⚠️ REVISAR**: Warning **nas alterações** que precisa correção

### 4.2 Ações Específicas

- [ ] **SEMPRE liste** ações necessárias **para alterações específicas**
- [ ] **SEMPRE identifique** linhas exatas que precisam correção
- [ ] **SEMPRE priorize** correções por criticidade

## 5. Formato de Saída Padrão

```markdown
# ⚡ REVIEW QUICK: [Nome do Componente] - FOCO NAS MUDANÇAS

## 🎯 DECISÃO FINAL

**✅ APROVAR** | **❌ REJEITAR** | **⚠️ REVISAR**

## 📋 MUDANÇAS ANALISADAS

- **Arquivos alterados**: X arquivos modificados
- **Linhas adicionadas**: X linhas (+)
- **Linhas removidas**: X linhas (-)
- **Linhas modificadas**: X linhas (contexto)

## 🚨 BLOCKERS NAS MUDANÇAS (X)

- [Lista de blockers críticos com linhas específicas]

## ⚠️ WARNINGS NAS MUDANÇAS (X)

- [Lista de warnings com linhas específicas]

## ✅ CHECKS DAS MUDANÇAS (X)

- [Lista de pontos positivos identificados]

## 🔧 AÇÕES NECESSÁRIAS

1. **Ação específica** (TIPO) - **linha X**
2. **Ação específica** (TIPO) - **linha Y**

## 📊 MÉTRICAS DAS MUDANÇAS

- **Cobertura**: X% das mudanças cobertas
- **Testes**: X/X passando para alterações
- **Linting**: X erros nas mudanças
- **Stack**: [Stack detectada]
- **Foco**: 99% nas mudanças, 1% contexto
```

**Por que este formato existe**: Template padronizado garante consistência e clareza na comunicação de resultados
**Automação**: Configure ferramentas para gerar automaticamente relatórios neste formato

## 6. Critérios de Warning

### 6.1 Qualidade

- [ ] **SEMPRE identifique** comentários excessivos
- [ ] **SEMPRE identifique** métodos muito longos
- [ ] **SEMPRE identifique** duplicação de código

### 6.2 Manutenibilidade

- [ ] **SEMPRE identifique** nomes não descritivos
- [ ] **SEMPRE identifique** complexidade alta
- [ ] **SEMPRE identifique** acoplamento excessivo

### 6.3 Padrões

- [ ] **SEMPRE identifique** convenções não seguidas
- [ ] **SEMPRE identifique** linting warnings
- [ ] **SEMPRE identifique** testes insuficientes

## 7. Critérios de Check Positivo

### 7.1 TDD

- [ ] **SEMPRE destaque** testes escritos primeiro
- [ ] **SEMPRE destaque** cobertura adequada
- [ ] **SEMPRE destaque** refatoração baseada em testes

### 7.2 Clean Code

- [ ] **SEMPRE destaque** nomes significativos
- [ ] **SEMPRE destaque** métodos pequenos
- [ ] **SEMPRE destaque** responsabilidade única

### 7.3 Arquitetura

- [ ] **SEMPRE destaque** separação de responsabilidades
- [ ] **SEMPRE destaque** baixo acoplamento
- [ ] **SEMPRE destaque** alta coesão

## 8. Validação e Finalização

### 8.1 Checklist Obrigatório de Git Diff

- [ ] **🚨 CRÍTICO: Git diff executado** com branch de origem correta
- [ ] **🚨 CRÍTICO: Arquivos alterados** identificados e listados
- [ ] **🚨 CRÍTICO: Linhas modificadas** mapeadas e analisadas
- [ ] **🚨 CRÍTICO: Foco exclusivo** nas alterações realizadas
- [ ] **🚨 CRÍTICO: Nenhuma análise** de arquivo completo linha a linha

### 8.2 Verificação Final

- [ ] **Decisão clara** tomada **baseada nas mudanças** (Aprovar/Rejeitar/Revisar)
- [ ] **Blockers identificados** e listados **nas alterações**
- [ ] **Warnings catalogados** com ações **para mudanças específicas**
- [ ] **Checks positivos** destacados **das modificações**
- [ ] **Ações necessárias** especificadas **para alterações específicas**
- [ ] **Métricas resumidas** apresentadas **das mudanças analisadas**

## 9. Vantagens da Versão Quick

1. **Rapidez**: Análise **focada nas mudanças**
2. **Foco**: Apenas pontos críticos **das alterações realizadas**
3. **Decisão clara**: Aprovar/Rejeitar/Revisar **baseada nas mudanças**
4. **Ações específicas**: Lista do que fazer **nas alterações específicas**
5. **Métricas resumidas**: Visão geral rápida **das mudanças analisadas**
6. **Eficiência**: Não perde tempo analisando código não alterado
7. **Precisão**: Foca exatamente no que foi modificado

## 11. Troubleshooting

### Problema: Git Diff Não Obtido

- [ ] **SEMPRE confirme** branch de origem correta
- [ ] **SEMPRE execute** `git diff [branch_origem]` manualmente
- [ ] **SEMPRE verifique** se há mudanças para analisar

### Problema: Análise Muito Lenta

- [ ] **SEMPRE foque** apenas nos arquivos alterados
- [ ] **SEMPRE evite** análise linha a linha de arquivos completos
- [ ] **SEMPRE use** ferramentas de linting apenas nos arquivos modificados

### Problema: Decisão Incerta

- [ ] **SEMPRE priorize** blockers sobre warnings
- [ ] **SEMPRE considere** impacto das mudanças no sistema
- [ ] **SEMPRE solicite** revisão detalhada se necessário

## 12. Referências e Recursos

- [Review Mode Detail](.cursor/commands/review/detail.md) - Análise completa e detalhada
- [Markdown Rule](core/documentation/markdown-rule.mdc) - Diretrizes de formatação
- [Architecture Guidelines](core/development/architecture-guidelines.mdc) - Padrões arquiteturais
- [Clean Code Rule](core/development/clean-code-rule.mdc) - Princípios de código limpo
- [TDD Rule](core/development/tdd-rule.mdc) - Test-Driven Development

**Por que estas regras existem**: Review Quick otimiza eficiência focando exclusivamente nas mudanças
**Automação**: Configure ferramentas para validação automática de qualidade nas alterações

---

**⚠️ LEMBRETE CRÍTICO**: O REVIEW QUICK É UM CHECKER FOCADO EM MUDANÇAS - NÃO UMA ANÁLISE GERAL!
