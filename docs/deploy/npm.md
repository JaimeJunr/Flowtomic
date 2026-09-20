# 📦 Publicação no NPM

> **Guia completo** para publicação automatizada dos packages do Flowtomic no NPM.

## 🚀 Script de Publicação Automatizada

O script `scripts/publish.ts` automatiza todo o processo de publicação dos packages do Flowtomic no NPM.

### ✨ Funcionalidades

- ✅ **Executa testes** antes de publicar
- ✅ **Executa build** antes de publicar
- ✅ **Atualiza versão automaticamente** (major/minor/patch)
- ✅ **Publica no NPM** automaticamente
- ✅ **Interação interativa** para seleção de package e tipo de versão
- ✅ **Suporte a argumentos** para uso não-interativo

### 📋 Uso

#### Modo Interativo (Recomendado)

Execute o script sem argumentos para usar o modo interativo:

```bash
bun run publish
```

Ou usando o script diretamente:

```bash
bun run scripts/publish.ts
```

O script irá:

1. **Mostrar lista de packages disponíveis** - Selecione usando as setas do teclado
2. **Mostrar opções de tipo de versão** - Escolha entre `patch`, `minor` ou `major` (não digite um número de versão!)
   - O script mostra automaticamente qual será a nova versão baseada na escolha
   - Exemplo: Se a versão atual é `0.1.15`:
     - `patch` → `0.1.16` (correções de bugs)
     - `minor` → `0.2.0` (novas funcionalidades)
     - `major` → `1.0.0` (mudanças incompatíveis)
3. Executar testes
4. Executar build
5. Atualizar versão no package.json
6. Publicar no NPM

**⚠️ IMPORTANTE**: No modo interativo, você **NÃO deve digitar um número de versão**. Use as setas do teclado para escolher entre `patch`, `minor` ou `major`. O script calcula automaticamente a nova versão.

#### Modo Não-Interativo

Você também pode passar os argumentos diretamente:

```bash
# Sintaxe: <package> <version-type>
# IMPORTANTE: version-type deve ser "patch", "minor" ou "major" (não um número!)
bun run publish ui patch
bun run publish logic minor
bun run publish cli major

# Ou usando flags
bun run publish --package ui --version patch
bun run publish -p logic -v minor
```

**⚠️ ATENÇÃO**: O `version-type` deve ser **sempre** uma das palavras: `patch`, `minor` ou `major`. **NÃO** digite um número de versão como `0.1.16`. O script calcula automaticamente a nova versão baseada no tipo escolhido.

### 📦 Packages Disponíveis

- **`ui`** - `@flowtomic/ui` - Componentes UI reutilizáveis
- **`logic`** - `@flowtomic/logic` - Hooks headless e lógica
- **`cli`** - `flowtomic-cli` - CLI para instalação de componentes

### 🔢 Tipos de Versão

**⚠️ IMPORTANTE**: Você **NÃO** digita o número da versão. Você escolhe o **tipo de incremento**: `patch`, `minor` ou `major`. O script calcula automaticamente a nova versão.

#### Patch (0.1.15 → 0.1.16)

Use para correções de bugs mantendo compatibilidade.

**Exemplo**: Correções de bugs, ajustes de estilos, melhorias de performance.

**Como usar**: Digite `patch` ou selecione "patch" no modo interativo.

#### Minor (0.1.15 → 0.2.0)

Use para adicionar novas funcionalidades mantendo compatibilidade.

**Exemplo**: Adicionar novos componentes, novos hooks, novas props opcionais.

**Como usar**: Digite `minor` ou selecione "minor" no modo interativo.

#### Major (0.1.15 → 1.0.0)

Use para mudanças incompatíveis na API.

**Exemplo**: Remoção de props, mudanças significativas na API pública.

**Como usar**: Digite `major` ou selecione "major" no modo interativo.

### 🔄 Fluxo de Execução

O script executa automaticamente as seguintes etapas:

1. **Validação**: Verifica se package e tipo de versão são válidos
2. **Testes**: Executa `bun run test` em todos os packages
3. **Build**: Executa `bun run build` em todos os packages
4. **Atualização de Versão**: Atualiza o `package.json` do package selecionado
5. **Publicação**: Publica no NPM usando `npm publish --access public`

### ⚠️ Importante

- O script **sempre executa testes e build** antes de publicar
- Se os testes ou build falharem, a publicação **não será executada**
- A versão é atualizada **antes** da publicação
- Se a publicação falhar, a versão já terá sido atualizada (você pode reverter manualmente se necessário)

### 🐛 Troubleshooting

#### Erro: "Tipo de versão inválido: 0.1.16"

**Problema**: Você digitou um número de versão em vez de escolher o tipo de incremento.

**Solução**:

- **NÃO** digite números como `0.1.16`, `1.2.3`, etc.
- Use **sempre** uma das palavras: `patch`, `minor` ou `major`
- No modo interativo, use as **setas do teclado** para escolher entre as opções
- O script calcula automaticamente a nova versão baseada na escolha

**Exemplo correto**:

```bash
# ✅ CORRETO
bun run publish ui patch

# ❌ INCORRETO
bun run publish ui 0.1.16
```

#### Erro: "Testes falharam"

**Solução**:

- Corrija os erros nos testes antes de tentar publicar novamente
- Execute `bun run test` manualmente para ver os detalhes
- Verifique se todos os testes estão passando

#### Erro: "Build falhou"

**Solução**:

- Corrija os erros no build antes de tentar publicar novamente
- Execute `bun run build` manualmente para ver os detalhes
- Verifique se há erros de TypeScript ou de lint

#### Erro: "Publicação falhou"

**Soluções**:

1. **Verificar autenticação no NPM**:

   ```bash
   npm whoami
   ```

   Se não estiver autenticado, execute:

   ```bash
   npm login
   ```

2. **Verificar permissões**:

   - Verifique se você tem permissão para publicar o package
   - Para packages scoped (`@flowtomic/*`), verifique se você é membro da organização

3. **Versão já atualizada**:
   - Se a publicação falhar após atualizar a versão, você pode:
     - Tentar publicar manualmente: `cd packages/ui && npm publish --access public`
     - Ou reverter a versão no `package.json` manualmente

### 📝 Exemplos Práticos

#### Publicar Patch do UI

```bash
# Publicar correção de bug no @flowtomic/ui
bun run publish ui patch
```

#### Publicar Minor do Logic

```bash
# Adicionar novo hook no @flowtomic/logic
bun run publish logic minor
```

#### Publicar Major do CLI

```bash
# Mudança incompatível no flowtomic-cli
bun run publish cli major
```

#### Modo Interativo

```bash
# Executar modo interativo para escolher package e versão
bun run publish
```

### 🔐 Autenticação no NPM

Antes de publicar, certifique-se de estar autenticado:

```bash
# Verificar se está autenticado
npm whoami

# Fazer login (se necessário)
npm login

# Verificar permissões para packages scoped
npm access ls-packages
```

### 📚 Referências

- [npm Publishing Guide](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- [Semantic Versioning](https://semver.org/)
- [Script de Publicação](../scripts/publish.ts) - Código fonte do script
