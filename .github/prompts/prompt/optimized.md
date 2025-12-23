# Otimizar Prompt Existente

> **🎯 Objetivo**: Otimizar prompts existentes seguindo metodologias avançadas de engenharia de prompt para máxima eficácia e clareza.
> **📚 Regra Pai**: Consulte `@prompt-engineering-rule.mdc` para fundamentos teóricos, metodologias avançadas e técnicas de otimização.

---

## 1. Contexto e Preparação

### 1.1 Carregamento Obrigatório de Regras

- [ ] **🚨 CRÍTICO**: **SEMPRE execute** `fetch_rules(["core/prompt-engineering-rule"])` como PRIMEIRO passo
- [ ] **SEMPRE confirme** que as regras foram carregadas com sucesso
- [ ] **SEMPRE aplique** diretrizes de otimização da regra pai

### 1.2 Análise do Prompt Atual

- [ ] **SEMPRE leia** o prompt existente completamente
- [ ] **SEMPRE identifique** o tipo de prompt (System, User, Few-Shot, Chain-of-Thought)
- [ ] **SEMPRE analise** problemas de clareza e estrutura
- [ ] **SEMPRE documente** pontos de melhoria identificados

## 2. Processo de Otimização

### 2.1 Identificação de Problemas

- [ ] **SEMPRE identifique** vaguedade nas instruções
- [ ] **SEMPRE verifique** falta de contexto específico
- [ ] **SEMPRE analise** estrutura confusa ou desorganizada
- [ ] **SEMPRE avalie** exemplos inadequados ou ausentes
- [ ] **SEMPRE confirme** se formato de saída está especificado

### 2.2 Aplicação de Técnicas Avançadas

- [ ] **SEMPRE use** framework S.T.A.R. (Sistema-Tarefa-Ação-Resultado)
- [ ] **SEMPRE implemente** Chain-of-Thought para raciocínio complexo
- [ ] **SEMPRE inclua** Few-Shot Learning com exemplos representativos
- [ ] **SEMPRE aplique** especificidade e clareza nas instruções
- [ ] **SEMPRE estruture** instruções de forma lógica e progressiva

### 2.3 Otimização por Tipo de Prompt

#### 2.3.1 System Prompts

- [ ] **SEMPRE defina** papel e contexto claramente
- [ ] **SEMPRE especifique** capacidades e limitações
- [ ] **SEMPRE estabeleça** tom e personalidade
- [ ] **SEMPRE inclua** instruções de comportamento

#### 2.3.2 User Prompts

- [ ] **SEMPRE estruture** com Contexto → Tarefa → Requisitos → Formato
- [ ] **SEMPRE seja** específico sobre o que precisa
- [ ] **SEMPRE inclua** contexto técnico relevante
- [ ] **SEMPRE especifique** formato de saída esperado

#### 2.3.3 Few-Shot Prompts

- [ ] **SEMPRE inclua** exemplos representativos e diversos
- [ ] **SEMPRE mantenha** consistência no formato
- [ ] **SEMPRE use** exemplos que cobrem casos típicos
- [ ] **SEMPRE evite** exemplos muito específicos ou genéricos

#### 2.3.4 Chain-of-Thought Prompts

- [ ] **SEMPRE defina** passos claros de raciocínio
- [ ] **SEMPRE solicite** explicação do processo
- [ ] **SEMPRE inclua** validação da solução
- [ ] **SEMPRE mantenha** estrutura lógica

## 3. Validação da Versão Otimizada

### 3.1 Checklist de Qualidade

- [ ] **Clareza**: Instruções claras e específicas
- [ ] **Contexto**: Informações suficientes para orientar a IA
- [ ] **Estrutura**: Organização lógica e fácil de seguir
- [ ] **Exemplos**: Exemplos relevantes quando apropriado
- [ ] **Formato**: Especificação clara do formato de saída
- [ ] **Eficiência**: Versão única, sem redundâncias

### 3.2 Comparação com Original

- [ ] **Melhorias identificadas**: Problemas do original foram resolvidos
- [ ] **Funcionalidade preservada**: Objetivo original mantido
- [ ] **Eficiência aumentada**: Versão mais clara e direta
- [ ] **Redundância eliminada**: Apenas uma versão otimizada

### 3.3 Teste de Funcionamento

- [ ] **SEMPRE teste** a versão otimizada com dados reais
- [ ] **SEMPRE compare** resultados com versão original
- [ ] **SEMPRE valide** se melhorias foram efetivas
- [ ] **SEMPRE confirme** se objetivo foi mantido

## 4. Exemplos de Otimização

### Exemplo 1: System Prompt

#### ❌ ANTES: System prompt genérico

````text
Você é um assistente de IA. Ajude o usuário com suas perguntas.
```text

#### ✅ DEPOIS: System prompt otimizado

```text
Você é um assistente especializado em desenvolvimento de software com foco em:

## Especialização Técnica

- Análise de código e arquitetura
- Resolução de problemas de programação
- Melhores práticas de desenvolvimento
- Debugging e otimização

## Metodologia de Resposta

1. **Entenda** o problema completamente
2. **Analise** o contexto técnico
3. **Proponha** soluções práticas
4. **Explique** o raciocínio por trás da solução
5. **Forneça** código funcional quando apropriado

## Limitações e Responsabilidades

- Sempre indicar quando não tem certeza
- Nunca fornecer código sem testar a lógica
- Solicitar confirmação para mudanças arquiteturais
- Priorizar soluções simples e manuteníveis
```text

### Exemplo 2: User Prompt

#### ❌ ANTES: User prompt vago

```text
Preciso de ajuda com React.
```text

#### ✅ DEPOIS: User prompt estruturado

```text
## Contexto do Projeto

- Projeto: E-commerce React + TypeScript
- Versão: React 18, TypeScript 4.9
- Estado: Redux Toolkit
- Roteamento: React Router v6

## Problema Específico

Estou implementando um carrinho de compras e preciso:

- Adicionar/remover produtos
- Calcular totais dinamicamente
- Persistir estado no localStorage
- Validar estoque disponível

## Código Atual

[inserir código relevante]

## Resultado Esperado

Hook personalizado `useCart` com as funcionalidades acima
```text

## 5. Troubleshooting

### Problema: Prompt não melhora após otimização

- [ ] **Sintoma**: Resultados similares ao prompt original
- [ ] **Causa**: Otimização não foi específica o suficiente
- [ ] **Solução**: Aplique técnicas mais específicas da regra pai

### Problema: Prompt fica muito longo

- [ ] **Sintoma**: Prompt otimizado é excessivamente verboso
- [ ] **Causa**: Inclusão de informações desnecessárias
- [ ] **Solução**: Foque apenas em melhorias essenciais

### Problema: Perda de funcionalidade

- [ ] **Sintoma**: Prompt otimizado não funciona como esperado
- [ ] **Causa**: Remoção acidental de elementos críticos
- [ ] **Solução**: Valide que funcionalidade original foi preservada

## 6. Referências e Recursos

- [Engenharia de Prompt - Regras Completas](.cursor/rules/core/prompt-engineering-rule.mdc)
- [Formatação Markdown](.cursor/rules/core/markdown-rule.mdc)
- [Templates de Comandos](.cursor/commands/)
- [Exemplos de Prompts](.cursor/prompts/)

**Por que este comando existe**: Otimização sistemática de prompts garante máxima eficácia
**Automação**: Configure validação automática de prompts otimizados
````
