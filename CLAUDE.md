# 🦁 Regras do Projeto Zoo

## Estrutura do Monorepo

Este é um monorepo gerenciado com Bun workspaces contendo:

- **`packages/ui/`** - `@zoo/ui`: Componentes UI reutilizáveis (atoms, molecules, organisms)
- **`packages/logic/`** - `@zoo/logic`: Hooks headless e lógica reutilizável
- **`cli/`** - `@zoo/cli`: CLI para instalação de componentes em projetos externos

## Padrões de Desenvolvimento

### Estrutura de Componentes

- **Atoms**: Componentes básicos em `packages/ui/src/components/atoms/`
- **Molecules**: Componentes compostos em `packages/ui/src/components/molecules/`
- **Organisms**: Componentes complexos em `packages/ui/src/components/organisms/`
- **Hooks**: Hooks headless em `packages/logic/src/hooks/`

### Convenções de Arquivos

Cada componente/hook deve ter:

- Arquivo principal (ex: `button.tsx`, `useStatCard.ts`)
- Arquivo `index.ts` para barrel exports
- Tipos TypeScript exportados

### Exports

- Sempre exportar tipos junto com componentes/hooks
- Usar barrel exports em `index.ts` de cada package
- Manter exports organizados por categoria (atoms, molecules, organisms, hooks)

### Dependências

- **UI**: Baseado em Radix UI, Tailwind CSS, class-variance-authority
- **Logic**: Hooks headless sem dependências de UI
- **CLI**: Usa Bun para execução

### Component Map

Ao adicionar novos componentes/hooks:

1. Adicionar entrada em `cli/src/utils/component-map.ts`
2. Incluir tipo (`atom`, `molecule`, `organism`)
3. Especificar dependências necessárias
4. Atualizar documentação em `README.md`

### Build e Desenvolvimento

- Usar `bun run build` para build de todos os packages
- Usar `bun run dev` para desenvolvimento com watch
- Sempre executar `bun run type-check` antes de commits
- CLI deve funcionar via `bunx` sem necessidade de publicação no npm

### CLI

- CLI copia arquivos diretamente para projetos (estilo shadcn/ui)
- Ajusta imports automaticamente para aliases do projeto
- Resolve repositório via `ZOO_REPO_PATH` ou caminhos padrão
- Suporta instalação via GitHub sem publicação no npm

### TypeScript

- Usar TypeScript estrito
- Exportar tipos junto com implementações
- Manter compatibilidade com React 18 e 19
- Usar `peerDependencies` para React

### Testes e Qualidade

- Manter componentes agnósticos de negócio
- Organisms podem ser específicos mas devem ser documentados
- Sempre verificar se imports estão corretos após mudanças
- Manter documentação atualizada

### Documentação

- Atualizar `README.md` ao adicionar componentes
- Atualizar `STATUS.md` com progresso de migração
- Manter `CLI_USAGE.md` atualizado com novos comandos
- Documentar dependências e requisitos

## Comandos Importantes

```bash
# Desenvolvimento
bun run dev              # Watch mode para todos os packages
bun run build            # Build de todos os packages
bun run type-check       # Verificar tipos TypeScript

# Packages específicos
bun run build:ui         # Build apenas @zoo/ui
bun run build:logic      # Build apenas @zoo/logic
bun run build:cli        # Build apenas @zoo/cli
```

## Regras Específicas

1. **Nunca** adicionar dependências de negócio específico em atoms ou molecules
2. **Sempre** manter hooks headless (sem UI)
3. **Sempre** atualizar `component-map.ts` ao adicionar componentes
4. **Sempre** verificar se o CLI funciona após mudanças
5. **Nunca** quebrar a API pública sem documentar mudanças
6. **Sempre** manter compatibilidade com React 18 e 19
7. **Sempre** usar Tailwind CSS para estilização
8. **Sempre** usar Radix UI para acessibilidade em componentes interativos
