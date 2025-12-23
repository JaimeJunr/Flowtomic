# Criar System Prompt

> **📚 Regra Pai**: Consulte `@prompt-engineering-rule.mdc` para fundamentos teóricos, metodologias avançadas e técnicas de otimização.

## 2. Parâmetros do Comando

### Parâmetros Obrigatórios

## 1. Contexto e Preparação

### 1.1 Carregamento Obrigatório de Regras

- [ ] **🚨 CRÍTICO**: **SEMPRE execute** `fetch_rules(["core/prompt-engineering-rule"])` como PRIMEIRO passo
- [ ] **SEMPRE confirme** que as regras foram carregadas com sucesso
- [ ] **SEMPRE aplique** diretrizes de templates e estrutura da regra pai

### 1.2 Análise de Requisitos

- [ ] **SEMPRE defina** objetivo específico e escopo do prompt

### 1. Template Base

**SEMPRE use** este template para prompts estruturados:

````markdown
# {nome-do-prompt}

## 1. Contexto e Preparação

- [ ] Verificar pré-requisitos
- [ ] Configurar ambiente necessário

## 2. Execução Principal

- [ ] Passo principal 1
- [ ] Passo principal 2
- [ ] Passo principal 3

## 3. Validação e Finalização

- [ ] Verificar resultados
- [ ] Limpar recursos temporários

## 4. Exemplos Práticos

### Exemplo 1: Caso Básico

```typescript
// Código de exemplo
```

### Exemplo 2: Caso Avançado

```typescript
// Código mais complexo
```
````
