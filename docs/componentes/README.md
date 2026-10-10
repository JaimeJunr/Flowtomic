# Componentes do Flowtomic

> **Objetivo**: Documentação completa dos componentes disponíveis no Flowtomic, incluindo atoms, molecules, organisms, blocks e hooks.

## Índice

- [Atoms](atoms.md) - Componentes básicos (119 componentes)
- [Molecules](molecules.md) - Componentes compostos (69 componentes)
- [Organisms](organisms.md) - Componentes complexos (31 componentes)
- [Blocks](blocks.md) - Blocks pré-construídos (4 blocks)
- [Hooks](hooks.md) - Hooks headless (14 hooks)

## Estatísticas

- **Total de Atoms**: 119
- **Total de Molecules**: 69
- **Total de Organisms**: 31
- **Total de Hooks**: 14
- **Total de Blocks**: 4

## Como Usar

### Instalação via CLI

```bash
# Adicionar um componente específico
npx flowtomic@latest add button

# Adicionar múltiplos componentes
npx flowtomic@latest add button card input

# Listar todos os componentes disponíveis
npx flowtomic@latest list
```

### Uso no Código

```typescript
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
```

## Documentação por Categoria

**SEMPRE consulte** a documentação específica de cada categoria para mais detalhes sobre os componentes disponíveis:

- **Atoms**: Componentes básicos e reutilizáveis
- **Molecules**: Componentes compostos por múltiplos atoms
- **Organisms**: Componentes complexos e específicos de domínio
- **Blocks**: Componentes pré-construídos completos
- **Hooks**: Hooks headless para lógica reutilizável

## Troubleshooting

### Problemas Comuns

- **Componente não encontrado**: **SEMPRE verifique** se o componente existe com `npx flowtomic@latest list`
- **Imports não funcionam**: **SEMPRE verifique** se o `components.json` está configurado corretamente
- **Erro ao instalar**: **SEMPRE execute** `npx flowtomic@latest init` primeiro

### Soluções

- [ ] **SEMPRE verifique** lista de componentes disponíveis
- [ ] **SEMPRE confirme** que `components.json` existe
- [ ] **SEMPRE valide** que aliases estão corretos

## Atualizações

- **Última atualização**: 2025-11-22
- **Versão da documentação**: 1.3.0
- **Próxima revisão**: 2025-12-22
