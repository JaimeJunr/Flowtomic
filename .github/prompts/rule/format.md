# Formatar Regras .mdc do Cursor IDE

## Overview

Formata arquivos de regras .mdc do Cursor IDE seguindo estrutura hierárquica, linguagem imperativa e padrões modernos de documentação executável. Garante consistência, legibilidade e aderência às convenções estabelecidas para regras do Cursor IDE.

## Parâmetros

- **--file**: Arquivo .mdc específico a ser formatado (obrigatório)
- **--backup**: Criar backup automático antes da formatação (padrão: true)
- **--validate**: Executar validação completa após formatação (padrão: true)
- **--dry-run**: Apenas mostrar mudanças sem aplicar (opcional)

## 1. Preparação e Backup

- [ ] **SEMPRE carregue** as regras de formatação: `fetch_rules(["core/formatter/formatter-rule-core"])`
- [ ] **SEMPRE carregue** as regras de engenharia de prompt: `fetch_rules(["core/formatter/prompt-engineering-rule"])`
- [ ] **SEMPRE carregue** as regras de markdown: `fetch_rules(["core/formatter/markdown-rule"])`
- [ ] **SEMPRE identifique** o arquivo .mdc a ser formatado
- [ ] **SEMPRE faça** backup do arquivo original antes de qualquer alteração
- [ ] **SEMPRE verifique** se o arquivo segue convenções de nomenclatura adequadas
- [ ] **SEMPRE identifique** dependências entre regras do Cursor IDE
- [ ] **SEMPRE verifique** se regras relacionadas existem e estão atualizadas
- [ ] **SEMPRE considere** impacto da formatação em outras regras do Cursor IDE

## 2. Análise e Diagnóstico

- [ ] **SEMPRE leia** completamente o arquivo .mdc atual
- [ ] **SEMPRE identifique** propósito e escopo da regra do Cursor IDE
- [ ] **SEMPRE mapeie** estrutura atual e fluxo de informações
- [ ] **SEMPRE identifique** problemas de formatação existentes:
  - [ ] Estrutura hierárquica inadequada para regras do Cursor IDE
  - [ ] Linguagem não imperativa para instruções do Cursor IDE
  - [ ] Blocos de código sem linguagem específica
  - [ ] Links quebrados ou genéricos
  - [ ] Falta de acessibilidade e inclusão
  - [ ] Ausência de validação automática
  - [ ] Inconsistência com padrões do Cursor IDE
- [ ] **SEMPRE categorize** problemas por tipo e prioridade
- [ ] **SEMPRE documente** estado atual antes de iniciar formatação
- [ ] **SEMPRE avalie** legibilidade e clareza do conteúdo para desenvolvedores
- [ ] **SEMPRE verifique** completude das instruções do Cursor IDE
- [ ] **SEMPRE identifique** lacunas de informação

## 3. Aplicação de Formatação

- [ ] **SEMPRE use** estrutura hierárquica clara para regras do Cursor IDE:
  - `#` para título principal da regra
  - `##` para seções principais (máximo 6)
  - `###` para subseções numeradas
  - Máximo 3 níveis de hierarquia
- [ ] **SEMPRE inclua** metadados do Cursor IDE no cabeçalho:
  - `description`: Descrição clara da regra
  - `globs`: Padrões de arquivos aplicáveis
  - `alwaysApply`: Se a regra deve ser aplicada sempre
- [ ] **SEMPRE use** linguagem imperativa obrigatória para instruções do Cursor IDE:
  - "SEMPRE" para ações obrigatórias
  - "NUNCA" para proibições absolutas
  - "NÃO" para restrições específicas
- [ ] **SEMPRE evite** linguagem narrativa ou conversacional
- [ ] **SEMPRE use** voz ativa e instruções diretas
- [ ] **SEMPRE inclua** justificativas técnicas quando necessário
- [ ] **SEMPRE formate** listas apropriadamente:
  - Listas numeradas para processos sequenciais
  - Checkboxes para itens verificáveis
  - Listas com marcadores para exemplos
- [ ] **SEMPRE formate** blocos de código:
  - Especificar linguagem sempre
  - Incluir comentários explicativos
  - Usar exemplos "✅ CORRETO" vs "❌ INCORRETO"
  - Incluir exemplos de uso real para Cursor Rules
- [ ] **SEMPRE formate** links descritivos e funcionais
- [ ] **SEMPRE use** tabelas para dados estruturados
- [ ] **SEMPRE aplique** princípios de engenharia de prompt modernos para Cursor Rules:
  - Framework S.T.A.R. (Sistema-Tarefa-Ação-Resultado)
  - Few-Shot Learning com exemplos concretos de Cursor Rules
  - Chain-of-Thought para processos complexos do Cursor IDE
  - Contexto específico e instruções claras para o Cursor IDE
- [ ] **SEMPRE estruture** instruções de forma clara e específica para o Cursor IDE
- [ ] **SEMPRE inclua** exemplos práticos e aplicáveis para Cursor Rules
- [ ] **SEMPRE use** linguagem clara e inclusiva para desenvolvedores
- [ ] **SEMPRE considere** diferentes níveis de conhecimento técnico

## 4. Validação e Qualidade

- [ ] **SEMPRE execute** markdownlint com configuração atualizada para Cursor Rules: `run_terminal_cmd(npx markdownlint arquivo.mdc --fix --config .markdownlint-cursor.json)`
- [ ] **SEMPRE verifique** links funcionais: `run_terminal_cmd(npx markdown-link-check arquivo.mdc)`
- [ ] **SEMPRE valide** estrutura hierárquica para Cursor Rules
- [ ] **SEMPRE confirme** que linguagem é imperativa para instruções do Cursor IDE
- [ ] **SEMPRE teste** acessibilidade: `run_terminal_cmd(npx axe-core --include "arquivo.mdc")`
- [ ] **SEMPRE valide** performance de leitura
- [ ] **SEMPRE verifique** compatibilidade com Cursor IDE
- [ ] **Estrutura Hierárquica**: Máximo 3 níveis de títulos para Cursor Rules
- [ ] **Linguagem Imperativa**: 100% de instruções diretas para o Cursor IDE
- [ ] **Código Formatado**: Blocos com linguagem específica
- [ ] **Links Funcionais**: Todas as referências funcionam
- [ ] **Markdown Válido**: Sem erros de sintaxe
- [ ] **Exemplos Práticos**: Aplicações concretas incluídas para Cursor Rules
- [ ] **Justificativas Técnicas**: "Porquê" explicado quando necessário
- [ ] **Acessibilidade**: Linguagem inclusiva e clara para desenvolvedores
- [ ] **Atualidade**: Informações relevantes para 2025
- [ ] **Completude**: Todas as seções necessárias incluídas
- [ ] **Consistência**: Padrões aplicados uniformemente
- [ ] **Compatibilidade Cursor**: Regras funcionam corretamente no Cursor IDE
- [ ] **SEMPRE verifique** clareza das instruções para desenvolvedores
- [ ] **SEMPRE confirme** que exemplos são aplicáveis ao Cursor IDE
- [ ] **SEMPRE valide** que troubleshooting é eficaz para Cursor Rules
- [ ] **SEMPRE considere** feedback de usuários reais do Cursor IDE

## 5. Finalização e Documentação

- [ ] **SEMPRE valide** que funcionalidade foi preservada para Cursor Rules
- [ ] **SEMPRE documente** mudanças significativas realizadas
- [ ] **SEMPRE atualize** timestamp de última modificação
- [ ] **SEMPRE confirme** que regra está pronta para uso no Cursor IDE
- [ ] **SEMPRE valide** compatibilidade com ferramentas atuais do Cursor IDE
- [ ] **SEMPRE crie** changelog das alterações
- [ ] **SEMPRE documente** melhorias implementadas para Cursor Rules
- [ ] **SEMPRE identifique** impactos em regras relacionadas do Cursor IDE
- [ ] **SEMPRE forneça** guia de migração se necessário

## Comandos de Validação

```bash
# Validar formatação markdown
npx markdownlint arquivo.mdc --fix

# Verificar links
npx markdown-link-check arquivo.mdc

# Validar estrutura hierárquica
grep -n "^#" arquivo.mdc

# Verificar linguagem imperativa
grep -i "sempre\|nunca\|não" arquivo.mdc
```

## Framework CO-STAR para Formatação

**Contexto**: Forneça informações de fundo e o cenário. Descreva brevemente o contexto e defina o cenário explicando o problema ou desafio.

**Objetivo**: Defina a meta ou o propósito da tarefa. Explique claramente seu papel e responsabilidade específicos naquela situação.

**Stilo**: Especifique o estilo de escrita desejado (ex.: técnico, casual). Detalhe as medidas específicas para tomar para lidar com a situação.

**Tom**: Determine a atitude ou a emoção da resposta (ex.: formal, otimista). Dê instruções detalhadas sobre como a IA deve executar a tarefa.

**Audiência**: Identifique para quem a resposta se destina. Especifique o método ou o processo que deve ser seguido.

**Resposta**: Especifique o formato de saída. Conclua resumindo o resultado esperado.

## Ferramentas e Recursos

- [ ] **SEMPRE use** markdownlint com configuração atualizada para Cursor IDE
- [ ] **SEMPRE considere** prettier para formatação automática
- [ ] **SEMPRE explore** ferramentas de acessibilidade para Cursor Rules
