# Format Cursor Commands

## Overview

Formata arquivos de comandos do Cursor IDE seguindo a estrutura padrão estabelecida. Este comando garante consistência, legibilidade e aderência às convenções de nomenclatura do Cursor IDE para todos os comandos customizados.

## Parâmetros

- **--file**: Arquivo .md específico a ser formatado (obrigatório)
- **--backup**: Criar backup automático antes da formatação (padrão: true)
- **--validate**: Executar validação completa após formatação (padrão: true)
- **--dry-run**: Apenas mostrar mudanças sem aplicar (opcional)

## 1. Preparação e Backup

- [ ] **SEMPRE carregue** as regras de formatação: `fetch_rules(["core/formatter/formatter-commands-rule"])`
- [ ] **SEMPRE carregue** as regras de engenharia de prompt: `fetch_rules(["core/formatter/prompt-engineering-rule"])`
- [ ] **SEMPRE identifique** o arquivo .md do comando Cursor IDE a ser formatado
- [ ] **SEMPRE faça** backup automático com timestamp: `run_terminal_cmd("cp arquivo.md arquivo.md.backup.$(date +%Y%m%d_%H%M%S)",  is_background=false)`

## 2. Aplicação da Formatação

- [ ] **SEMPRE verifique** se o arquivo segue convenções de nomenclatura do Cursor IDE
- [ ] **SEMPRE aplique** estrutura padrão com título, overview, steps e checklist
- [ ] **SEMPRE mantenha** commands com o objetivo de 200 linhas para eficiência
- [ ] **SEMPRE foque** exclusivamente em comandos customizados do Cursor IDE

## 3. Validação e Finalização

- [ ] **SEMPRE execute** validação completa após formatação
- [ ] **SEMPRE verifique** consistência da estrutura aplicada
- [ ] **SEMPRE confirme** que todos os elementos obrigatórios estão presentes
- [ ] **SEMPRE garanta** que comandos chamam regras específicas via `fetch_rules()`

## Framework CO-STAR para Formatação

**Contexto**: Forneça informações de fundo e o cenário. Descreva brevemente o contexto e defina o cenário explicando o problema ou desafio.

**Objetivo**: Defina a meta ou o propósito da tarefa. Explique claramente seu papel e responsabilidade específicos naquela situação.

**Stilo**: Especifique o estilo de escrita desejado (ex.: técnico, casual). Detalhe as medidas específicas para tomar para lidar com a situação.

**Tom**: Determine a atitude ou a emoção da resposta (ex.: formal, otimista). Dê instruções detalhadas sobre como a IA deve executar a tarefa.

**Audiência**: Identifique para quem a resposta se destina. Especifique o método ou o processo que deve ser seguido.

**Resposta**: Especifique o formato de saída. Conclua resumindo o resultado esperado.

## Estrutura Padrão

**SEMPRE use** esta estrutura para comandos Cursor IDE:

```markdown
# [Nome do Comando]

## Overview

Descrição concisa do propósito do comando.

## 1. [Primeiro Passo]

- [ ] **SEMPRE execute** ação específica
- [ ] **SEMPRE valide** resultado

## 2. [Segundo Passo]

- [ ] **SEMPRE execute** ação específica
- [ ] **SEMPRE valide** resultado

## 3. [Terceiro Passo]

- [ ] **SEMPRE execute** ação específica
- [ ] **SEMPRE valide** resultado

## Checklist de Validação

- [ ] **SEMPRE verifique** elemento 1
- [ ] **SEMPRE confirme** elemento 2
- [ ] **SEMPRE valide** elemento 3
```

## Elementos Obrigatórios

### 1. Título

- **SEMPRE use** `# [Nome do Comando]` como título principal
- **SEMPRE seja** descritivo e claro sobre a ação

### 2. Overview

- **SEMPRE inclua** descrição concisa do propósito do comando
- **SEMPRE forneça** contexto sobre quando usar
- **SEMPRE defina** objetivo principal

### 3. Steps

- **SEMPRE use** numeração sequencial (1, 2, 3...)
- **SEMPRE coloque** cada passo com título em negrito
- **SEMPRE organize** sub-tarefas com bullet points
- **SEMPRE inclua** detalhes específicos quando necessário

### 4. Checklist

- **SEMPRE use** lista de verificação com checkboxes `- [ ]`
- **SEMPRE dê** nome descritivo para o checklist
- **SEMPRE crie** itens específicos e acionáveis

## Exemplos de Comandos Cursor IDE

- `Code review checklist` - Revisão sistemática de código
- `Security audit` - Auditoria de segurança
- `Setup new feature` - Configuração de nova funcionalidade
- `Create pull request` - Criação de PR
- `Run tests and fix failures` - Execução e correção de testes
- `Onboard new developer` - Integração de novo desenvolvedor

## Checklist de Formatação

- [ ] **SEMPRE carregue** as regras de formatação: `fetch_rules(["core/formatter/formatter-commands-rule"])`
- [ ] **SEMPRE carregue** as regras de engenharia de prompt: `fetch_rules(["core/formatter/prompt-engineering-rule"])`
- [ ] **SEMPRE identifique** o arquivo .md do comando Cursor IDE a ser formatado
- [ ] **SEMPRE faça** backup automático com timestamp: `run_terminal_cmd("cp arquivo.md arquivo.md.backup.$(date +%Y%m%d_%H%M%S)",  is_background=false)`
- [ ] **SEMPRE verifique** se o arquivo segue convenções de nomenclatura do Cursor IDE
- [ ] **SEMPRE lembre** que commands do Cursor IDE geralmente chamam regras específicas via `fetch_rules()`
- [ ] **SEMPRE mantenha** commands com o objetivo de 200 linhas para eficiência
- [ ] **SEMPRE crie** backup antes de modificar
- [ ] **SEMPRE foque** exclusivamente em comandos customizados do Cursor IDE

## Linguagem e Estilo

- [ ] **SEMPRE use** linguagem imperativa obrigatória:
  - "SEMPRE" para ações obrigatórias
  - "NUNCA" para proibições absolutas
  - "NÃO" para restrições específicas
- [ ] **SEMPRE evite** linguagem narrativa ou conversacional
- [ ] **SEMPRE use** voz ativa e instruções diretas
- [ ] **SEMPRE inclua** justificativas técnicas quando necessário
- [ ] **SEMPRE foque** em comandos customizados do Cursor IDE

## Boas Práticas

- [ ] **SEMPRE seja específico**: Cada item deve ser acionável
- [ ] **SEMPRE use linguagem clara**: Evite jargão técnico desnecessário
- [ ] **SEMPRE mantenha consistência**: Siga sempre a mesma estrutura
- [ ] **SEMPRE seja completo**: Cubra todos os aspectos importantes da tarefa
- [ ] **SEMPRE use checkboxes**: Facilita o acompanhamento do progresso
