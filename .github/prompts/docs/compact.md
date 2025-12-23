# 📦 Comando /compact - Compactação Inteligente de Documentação Técnica

> **🎯 Objetivo**: Compactar documentação técnica de software priorizando informações mais recentes, removendo dados obsoletos e mantendo funcionalidade crítica. Integra-se ao sistema do agente fornecendo boas práticas e funcionalidades de compactação de arquivos.

## 1. Contexto e Preparação

- [ ] **NUNCA ignore** ou adapte arbitrariamente os padrões definidos
- [ ] **SEMPRE revise** as diretrizes de formatação markdown antes de iniciar o processo
- [ ] **SEMPRE obtenha** data atual do sistema: `date +"%Y-%m-%d %H:%M:%S"`
- [ ] **SEMPRE leia** o arquivo completo para entender estrutura e conteúdo
- [ ] **SEMPRE identifique** tipo de documentação (técnica, API, arquitetura, tutorial)
- [ ] **SEMPRE faça** backup do arquivo antes de qualquer modificação

**Automação**: Configure scripts para validação automática de conformidade

## 2. Execução Principal

### 2.1 Identificação de Conteúdo para Compactação

- [ ] **SEMPRE identifique** informações duplicadas, obsoletas ou desatualizadas
- [ ] **SEMPRE preserve** informações fundamentais e mais recentes
- [ ] **SEMPRE mantenha** funcionalidades críticas e padrões estabelecidos
- [ ] **SEMPRE consolide** seções similares e elimine redundâncias

### 2.2 Aplicação de Padrões de Formatação

- [ ] **SEMPRE preserve** metadados e estrutura de cabeçalho durante compactação
- [ ] **SEMPRE use** `search_replace` para edições de conteúdo
- [ ] **SEMPRE mantenha** estrutura hierárquica (máximo 3 níveis)
- [ ] **SEMPRE use** linguagem imperativa ("SEMPRE", "NUNCA", "NÃO")

**Automação**: Configure ferramentas para validação automática de estrutura

### 2.3 Adaptação por Tipo de Documentação

#### 2.3.1 Documentação Técnica Geral

- [ ] **SEMPRE mantenha** conceitos fundamentais
- [ ] **SEMPRE elimine** exemplos muito específicos
- [ ] **SEMPRE preserve** diretrizes universais
- [ ] **SEMPRE consolide** seções similares

**Características**: Foco em princípios fundamentais, linguagem genérica, aplicação ampla

#### 2.3.2 Documentação de API

- [ ] **SEMPRE mantenha** endpoints e parâmetros específicos
- [ ] **SEMPRE preserve** exemplos de código relevantes
- [ ] **SEMPRE consolide** padrões similares
- [ ] **SEMPRE atualize** versões de API

**Características**: Foco em endpoints específicos, exemplos de uso, versionamento

#### 2.3.3 Documentação de Arquitetura

- [ ] **SEMPRE priorize** padrões mais recentes
- [ ] **SEMPRE consolide** padrões duplicados
- [ ] **SEMPRE mantenha** decisões arquiteturais essenciais
- [ ] **SEMPRE atualize** diagramas por relevância

**Características**: Padrões comprovados, decisões arquiteturais, estrutura consolidada

#### 2.3.4 Documentação de Tutoriais

- [ ] **SEMPRE leia** todos os passos do tutorial
- [ ] **SEMPRE identifique** informações obsoletas
- [ ] **SEMPRE preserve** sequência lógica
- [ ] **SEMPRE mantenha** exemplos funcionais

**Características**: Passos sequenciais, exemplos práticos, validação de funcionamento

### 2.4 Técnicas Avançadas de Compactação

#### 2.4.1 Identificação de Ideias Principais vs Detalhes Secundários

- [ ] **SEMPRE identifique** a mensagem central do texto
- [ ] **SEMPRE elimine** exemplos extensos não essenciais
- [ ] **SEMPRE remova** justificativas muito longas e desnecessárias
- [ ] **SEMPRE preserve** apenas cifras e dados críticos
- [ ] **SEMPRE elimine** repetições desnecessárias

**Pergunta-chave**: Qual é a mensagem central do texto?

#### 2.4.2 Sumarização Extrativa

- [ ] **SEMPRE selecione** frases ou parágrafos que capturam ideias-chave
- [ ] **SEMPRE junte** essas frases mantendo coerência
- [ ] **SEMPRE preserve** contexto suficiente para compreensão
- [ ] **SEMPRE mantenha** estrutura lógica do conteúdo original

#### 2.4.3 Sumarização Abstrativa

- [ ] **SEMPRE reescreva** com suas próprias palavras
- [ ] **SEMPRE use** menos palavras mantendo o sentido
- [ ] **SEMPRE simplifique** linguagem complexa
- [ ] **SEMPRE preserve** significado original

#### 2.4.4 Chunking + Sumarização Iterativa

- [ ] **SEMPRE divida** o texto em "pedaços" menores (seções, capítulos, blocos)
- [ ] **SEMPRE resuma** cada pedaço individualmente
- [ ] **SEMPRE resuma** os resumos para chegar à versão final
- [ ] **SEMPRE mantenha** hierarquia de informações

#### 2.4.5 Estrutura Lógica e Hierárquica

- [ ] **SEMPRE use** títulos e subtítulos existentes como guia
- [ ] **SEMPRE organize** ideias como: introdução → desenvolvimento → conclusão
- [ ] **SEMPRE resuma** por seção mantendo fluxo lógico
- [ ] **SEMPRE preserve** hierarquia de importância

#### 2.4.6 Eliminação de Redundâncias

- [ ] **SEMPRE remova** frases que repetem a mesma ideia
- [ ] **SEMPRE elimine** palavras ou expressões supérfluas ("muito", "há de se notar", etc.)
- [ ] **SEMPRE converta** voz passiva para ativa quando possível
- [ ] **SEMPRE consolide** informações similares

#### 2.4.7 Simplificação de Linguagem

- [ ] **SEMPRE prefira** palavras simples e diretas
- [ ] **SEMPRE use** frases diretas e objetivas
- [ ] **SEMPRE evite** nominalizações (transformar verbos em substantivos)
- [ ] **SEMPRE elimine** estruturas complicadas desnecessárias

#### 2.4.8 Uso de Perguntas Orientadoras

- [ ] **SEMPRE responda**: Quem? O que? Quando? Onde? Por que? Como?
- [ ] **SEMPRE identifique** o que deve ficar no resumo
- [ ] **SEMPRE preserve** informações que respondem essas perguntas
- [ ] **SEMPRE elimine** informações que não respondem perguntas essenciais

#### 2.4.9 MapReduce ou Sumarização Multi-Estágio

- [ ] **SEMPRE resuma** partes menores primeiro
- [ ] **SEMPRE combine** os resumos em estágios
- [ ] **SEMPRE repita** até ter o tamanho desejado
- [ ] **SEMPRE use** para textos gigantes ou processamento automático

#### 2.4.10 Revisão e Edição Final

- [ ] **SEMPRE verifique** se o resumo está coerente e fluido
- [ ] **SEMPRE confira** se perdeu algo essencial (objetivo, conclusão)
- [ ] **SEMPRE ajuste** fraseologia para clareza
- [ ] **SEMPRE valide** que funcionalidades críticas foram preservadas

**Automação**: Configure ferramentas de IA para aplicação automática de técnicas de sumarização

### 2.5 Fluxo Técnico de Redução de Texto

#### 2.5.1 Pré-processamento

- [ ] **SEMPRE tokenize** o texto em sentenças e tokens
- [ ] **SEMPRE identifique** limites naturais: capítulos, seções, subtítulos
- [ ] **SEMPRE limpe** stop words e normalizações desnecessárias
- [ ] **SEMPRE prepare** texto para processamento eficiente

#### 2.5.2 Chunking Inteligente

- [ ] **SEMPRE divida** documento em chunks baseados em limite de tokens
- [ ] **SEMPRE use** chunking semântico para detectar mudanças de tópico
- [ ] **SEMPRE garanta** que cada chunk preserve contexto suficiente
- [ ] **SEMPRE considere** sobreposição entre chunks quando necessário

#### 2.5.3 Sumarização Extrativa por Chunk

- [ ] **SEMPRE calcule** pontuações de importância de cada sentença
- [ ] **SEMPRE use** critérios: TF-IDF, posição no documento, similaridade com título
- [ ] **SEMPRE aplique** algoritmos graph-based como TextRank ou LexRank
- [ ] **SEMPRE selecione** top-k sentenças por chunk para manter

#### 2.5.4 Sumarização Abstrativa por Chunk

- [ ] **SEMPRE use** modelos seq2seq ou Transformer (BART, T5, etc.)
- [ ] **SEMPRE force** comprimento máximo por chunk (≤ N tokens)
- [ ] **SEMPRE gere** versão condensada e reescrita das ideias
- [ ] **SEMPRE mantenha** coerência semântica

#### 2.5.5 Combinação e Redução Hierárquica

- [ ] **SEMPRE agregue** resumos dos chunks
- [ ] **SEMPRE construa** novo texto que sintetize todos os chunks
- [ ] **SEMPRE avalie** se o agregado atinge o tamanho desejado
- [ ] **SEMPRE repita** processo se ainda estiver grande

#### 2.5.6 Avaliação e Ajustes

- [ ] **SEMPRE use** métricas automáticas: ROUGE, BLEU, METEOR
- [ ] **SEMPRE verifique** coerência narrativa e transições
- [ ] **SEMPRE confirme** que seções importantes não foram omitidas
- [ ] **SEMPRE faça** revisão humana final quando possível

**Automação**: Configure pipelines de processamento automático para aplicação das técnicas

## 3. Validação e Finalização

### 3.1 Regras Críticas de Segurança

#### ANTES da Compactação

- [ ] **SEMPRE faça** backup do arquivo original
- [ ] **SEMPRE identifique** seções críticas a preservar
- [ ] **SEMPRE verifique** se estrutura de cabeçalho está intacta
- [ ] **SEMPRE confirme** que metadados estão corretos

#### DURANTE a Compactação

- [ ] **SEMPRE use** `search_replace` para todas as mudanças
- [ ] **SEMPRE mantenha** estrutura de cabeçalho intacta
- [ ] **SEMPRE preserve** funcionalidades críticas
- [ ] **SEMPRE faça** edições incrementais

#### APÓS a Compactação

- [ ] **SEMPRE adicione** timestamp de compactação no cabeçalho
- [ ] **SEMPRE valide** que funcionalidades críticas foram preservadas
- [ ] **SEMPRE teste** se arquivo compactado funciona corretamente
- [ ] **SEMPRE execute** `read_lints` para verificar erros de markdown

### 3.2 Formato de Timestamp Padrão

```markdown
<!-- Última compactação: 2025-01-11 14:30:25 -->
<!-- Padrões consolidados: X padrões principais -->
<!-- Aplicações futuras: Y aplicações específicas -->
```

**Automação**: Configure scripts para backup automático e validação de frontmatter

### 3.3 Critérios de Priorização

#### Informações com Prioridade Máxima

- [ ] **Padrões comprovados** (independente da data)
- [ ] **Funcionalidades críticas** (comandos, fluxos)
- [ ] **Informações mais recentes** (com data atual)
- [ ] **Lições aprendidas essenciais**

#### Informações para Remoção/Consolidação

- [ ] **Conteúdo duplicado** (consolidar em uma localização)
- [ ] **Informações obsoletas** (ferramentas desatualizadas)
- [ ] **Contexto desnecessário** (justificativas prolixas)
- [ ] **Exemplos redundantes** (manter apenas os mais relevantes)

### 3.4 Métricas de Sucesso

#### Redução de Conteúdo

- [ ] **Mínimo 30%** de redução no número de linhas
- [ ] **Eliminação de redundâncias** sem perda de funcionalidade
- [ ] **Consolidação de seções** similares
- [ ] **Simplificação de linguagem** narrativa

#### Preservação de Qualidade

- [ ] **100% das funcionalidades** críticas mantidas
- [ ] **Frontmatter intacto** e funcional
- [ ] **Estrutura hierárquica** clara e lógica
- [ ] **Linguagem imperativa** consistente

**Automação**: Configure ferramentas para validação automática de métricas

## 4. Ferramentas e Validação

### 4.1 Ferramentas Modernas de Formatação

#### 4.1.1 MDSF - Markdown Code Formatter

- [ ] **SEMPRE instale** o mdsf para formatação automática de blocos de código
- [ ] **SEMPRE configure** formatadores específicos por linguagem
- [ ] **SEMPRE execute** mdsf antes da validação final
- [ ] **SEMPRE mantenha** formatação consistente em todos os blocos

```bash
# Instalar mdsf globalmente
npm install -g mdsf

# Formatar blocos de código no arquivo
mdsf compact.md

# Formatar com configuração específica
mdsf --config .mdsfrc compact.md
```

#### 4.1.2 Markdownlint-CLI2 - Validação Avançada

- [ ] **SEMPRE instale** markdownlint-cli2 para validação completa
- [ ] **SEMPRE configure** regras específicas para comandos
- [ ] **SEMPRE execute** validação antes de commit
- [ ] **SEMPRE corrija** erros automaticamente quando possível

```bash
# Instalar markdownlint-cli2
npm install -g markdownlint-cli2

# Validar arquivo com configuração específica
markdownlint-cli2 compact.md --config .markdownlint.json

# Corrigir erros automaticamente
markdownlint-cli2 compact.md --fix --config .markdownlint.json
```

### 4.2 Comandos de Verificação Avançados

```bash
# Verificar data atual
date +"%Y-%m-%d %H:%M:%S"

# Verificar erros de markdown com markdownlint-cli2
markdownlint-cli2 compact.md --config .markdownlint.json

# Formatar blocos de código com mdsf
mdsf compact.md

# Verificar estrutura do frontmatter
head -5 compact.md | grep -E "^-{3}$|^[a-zA-Z]+:"

# Verificar cabeçalhos duplicados
grep -n "^####.*" compact.md | sort | uniq -d -f1

# Validar links e referências
markdown-link-check compact.md
```

### 4.3 Configuração de Ferramentas

#### 4.3.1 Arquivo .markdownlint.json

```json
{
  "MD013": { "line_length": 120, "code_blocks": false },
  "MD024": { "siblings_only": true },
  "MD033": false,
  "MD041": false,
  "MD047": true,
  "MD022": true,
  "MD031": true,
  "MD032": true
}
```

#### 4.3.2 Arquivo .mdsfrc

```json
{
  "formatters": {
    "bash": "shfmt",
    "javascript": "prettier",
    "typescript": "prettier",
    "json": "prettier",
    "markdown": "prettier"
  }
}
```

### 4.4 Checklist de Validação Final

- [ ] **Frontmatter preservado** e funcional
- [ ] **Estrutura hierárquica** clara (máximo 3 níveis)
- [ ] **Linguagem imperativa** consistente
- [ ] **Exemplos posicionados** após regras
- [ ] **Timestamp adicionado** no cabeçalho
- [ ] **Funcionalidades críticas** preservadas
- [ ] **Redução de conteúdo** atingida (mínimo 30%)
- [ ] **Erros de markdown** corrigidos com markdownlint-cli2
- [ ] **Blocos de código** formatados com mdsf
- [ ] **Links validados** com markdown-link-check

**Automação**: Configure scripts para validação automática com ferramentas integradas

## 5. Troubleshooting Avançado

### 5.1 Problemas Comuns de Formatação

#### 5.1.1 Erro: Estrutura de Cabeçalho Corrompida

**Sintomas**: Arquivo não carrega corretamente, metadados perdidos

**Solução**:

- [ ] **SEMPRE verifique** estrutura de cabeçalho no início
- [ ] **SEMPRE restaure** backup antes de continuar
- [ ] **SEMPRE valide** sintaxe de metadados
- [ ] **SEMPRE teste** carregamento após correção

```bash
# Verificar estrutura do cabeçalho
head -10 target_file.md | grep -E "^#|^##"

# Validar sintaxe markdown
npx markdownlint target_file.md
```

#### 5.1.2 Erro: Markdownlint Falha

**Sintomas**: Erros de validação, formatação inconsistente

**Solução**:

- [ ] **SEMPRE atualize** markdownlint-cli2 para versão mais recente
- [ ] **SEMPRE configure** regras específicas para o projeto
- [ ] **SEMPRE execute** correção automática quando possível
- [ ] **SEMPRE valide** configuração antes de aplicar

```bash
# Atualizar markdownlint-cli2
npm update -g markdownlint-cli2

# Verificar configuração
markdownlint-cli2 --help

# Corrigir erros automaticamente
markdownlint-cli2 target_file.md --fix --config .markdownlint.json
```

#### 5.1.3 Erro: MDSF Não Formata Código

**Sintomas**: Blocos de código não formatados, formatação inconsistente

**Solução**:

- [ ] **SEMPRE verifique** se formatadores estão instalados
- [ ] **SEMPRE configure** .mdsfrc corretamente
- [ ] **SEMPRE teste** formatação em arquivo simples
- [ ] **SEMPRE valide** sintaxe de blocos de código

```bash
# Verificar formatadores instalados
which shfmt prettier

# Instalar formatadores necessários
npm install -g prettier
go install mvdan.cc/sh/v3/cmd/shfmt@latest

# Testar mdsf
mdsf --help
```

### 5.2 Problemas de Performance

#### 5.2.1 Compactação Muito Lenta

**Sintomas**: Processo demora muito para completar

**Solução**:

- [ ] **SEMPRE divida** arquivos muito grandes em chunks
- [ ] **SEMPRE use** técnicas de sumarização iterativa
- [ ] **SEMPRE otimize** algoritmos de compactação
- [ ] **SEMPRE monitore** uso de recursos

```bash
# Verificar tamanho do arquivo
wc -l target_file.mdc

# Dividir arquivo em chunks menores
split -l 1000 target_file.mdc chunk_

# Processar chunks individualmente
for chunk in chunk_*; do
  mdsf "$chunk"
  markdownlint-cli2 "$chunk" --fix
done
```

#### 5.2.2 Memória Insuficiente

**Sintomas**: Processo falha por falta de memória

**Solução**:

- [ ] **SEMPRE processe** arquivos em lotes menores
- [ ] **SEMPRE libere** memória entre operações
- [ ] **SEMPRE use** streaming para arquivos grandes
- [ ] **SEMPRE monitore** uso de memória

```bash
# Verificar uso de memória
free -h

# Processar com limite de memória
ulimit -v 2097152  # 2GB
mdsf target_file.mdc
```

### 5.3 Problemas de Integração

#### 5.3.1 Conflito com Git Hooks

**Sintomas**: Hooks falham, commits rejeitados

**Solução**:

- [ ] **SEMPRE configure** hooks para ignorar arquivos temporários
- [ ] **SEMPRE teste** hooks localmente antes de commit
- [ ] **SEMPRE configure** bypass para arquivos específicos
- [ ] **SEMPRE valide** configuração de hooks

```bash
# Verificar hooks configurados
ls -la .git/hooks/

# Testar hook localmente
.git/hooks/pre-commit

# Configurar bypass temporário
git commit --no-verify -m "WIP: compacting files"
```

#### 5.3.2 Conflito com CI/CD

**Sintomas**: Pipeline falha, builds quebrados

**Solução**:

- [ ] **SEMPRE configure** CI para usar ferramentas corretas
- [ ] **SEMPRE teste** pipeline localmente
- [ ] **SEMPRE configure** cache para dependências
- [ ] **SEMPRE valide** configuração de ambiente

```yaml
# Exemplo de configuração CI/CD
- name: Install tools
  run: |
    npm install -g markdownlint-cli2 mdsf
    go install mvdan.cc/sh/v3/cmd/shfmt@latest

- name: Format and validate
  run: |
    mdsf *.md
    markdownlint-cli2 *.md --fix
```

**Automação**: Configure scripts para diagnóstico automático de problemas

## 6. Exemplos de Uso

### 6.1 Compactar Documentação de API

```bash
/compact api-docs.md
# Aplica estratégia específica para documentação de API
```

### 6.2 Compactar Documentação de Arquitetura

```bash
/compact architecture.md
# Aplica estratégia específica para documentação arquitetural
```

### 6.3 Compactar Documentação Específica

```bash
/compact target_file.md
# Aplica estratégia baseada no tipo de documentação identificado
```

### 6.4 Compactação com Ferramentas Modernas

```bash
# Compactar com validação completa
/compact target_file.md --validate --format

# Compactar com configuração específica
/compact target_file.md --config .compact.json

# Compactar com relatório detalhado
/compact target_file.md --report --verbose
```

**Automação**: Configure scripts para execução automática de comandos

## 7. Referências

### 7.1 Documentação Interna

- [markdown-rule.mdc](markdown-rule.mdc) - Padrões de formatação markdown

### 7.2 Ferramentas Externas

- [MDSF - Markdown Code Formatter](https://github.com/hougesen/mdsf) - Formatação automática de blocos de código
- [Markdownlint-CLI2](https://github.com/DavidAnson/markdownlint-cli2) - Validação avançada de Markdown
- [Markdown Link Check](https://github.com/tcort/markdown-link-check) - Validação de links
- [Prettier](https://prettier.io/) - Formatador de código universal
- [shfmt](https://github.com/mvdan/sh) - Formatador de shell scripts

### 7.3 Recursos de Aprendizado

- [Markdown Guide](https://www.markdownguide.org/) - Guia completo de Markdown
- [Conventional Commits](https://www.conventionalcommits.org/) - Padrões de commits
- [GitHub Markdown](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github) - Especificações do GitHub

**Automação**: Configure ferramentas para manter referências atualizadas
