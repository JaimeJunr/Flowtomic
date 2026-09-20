# 📚 Documentação do Flowtomic

> **Objetivo**: Guia central para navegação e compreensão da documentação do projeto Flowtomic.

## 🎯 Sobre o Projeto

O **Flowtomic** é um monorepo que fornece uma biblioteca de componentes UI, hooks headless e ferramentas reutilizáveis para projetos React/TypeScript. O projeto segue a filosofia de reutilização de código, permitindo que desenvolvedores acelerem seu desenvolvimento com componentes prontos e customizáveis.

## 📖 Índice de Documentação

### 🚀 Início Rápido

- [Guia de Desenvolvimento](desenvolvimento/guia.md) - Guia completo de uso do monorepo e CLI
- [Instalação e Configuração](desenvolvimento/instalacao.md) - Como instalar e configurar o projeto

### 🏗️ Arquitetura e Design

- [Arquitetura do Monorepo](arquitetura/monorepo.md) - Estrutura e organização do monorepo
- [Decisões de Design](arquitetura/decisoes.md) - Decisões arquiteturais importantes
- [Padrões Utilizados](arquitetura/padroes.md) - Padrões de código e convenções

### 📦 Packages

- [Package UI](packages/ui.md) - Componentes UI (atoms, molecules, organisms, blocks)
  - **Padrões de Documentação**: Guia completo de como documentar componentes no Storybook
  - **Desenvolvimento**: Como criar e manter componentes com qualidade
  - **Checklist**: Validação de qualidade para componentes
- [Package Logic](packages/logic.md) - Hooks headless e lógica reutilizável
- [Package CLI](packages/cli.md) - CLI para instalação de componentes

### 🧩 Componentes

- [Componentes Disponíveis](componentes/README.md) - Lista completa de componentes (63 atoms, 47 molecules, 30 organisms, 14 hooks, 3 blocks)
- [Atoms](componentes/atoms.md) - Componentes básicos (63 componentes: button, input, card, etc.)
- [Molecules](componentes/molecules.md) - Componentes compostos (47 componentes: button-group, data-table, etc.)
- [Organisms](componentes/organisms.md) - Componentes complexos (23 componentes: dashboard-layout, stats-grid, script-editor, etc.)
- [Blocks](componentes/blocks.md) - Blocks pré-construídos (3 blocks: dashboard-01, flowtomic-dashboard, developer-panel)
- [Hooks](componentes/hooks.md) - Hooks headless disponíveis (12 hooks)

### 🛠️ CLI

- [Documentação do CLI](../cli/README.md) - Documentação detalhada do CLI
- [Comandos do CLI](cli/comandos.md) - Referência completa de comandos
- [Uso do CLI](cli/uso.md) - Guias práticos de uso

### 📋 Registry

- [Documentação do Registry](../registry/README.md) - Sistema de registry
- [Estrutura do Registry](registry/estrutura.md) - Como o registry funciona
- [Adicionar Componentes ao Registry](registry/adicionar-componentes.md) - Como adicionar novos componentes

### 💻 Desenvolvimento

- [Guia de Desenvolvimento](desenvolvimento/guia.md) - Como desenvolver no projeto
- [Padrões de Código](desenvolvimento/padroes.md) - Padrões e convenções de código
- [Storybook](desenvolvimento/storybook.md) - Como usar o Storybook para desenvolvimento
- [Testes](desenvolvimento/testes.md) - Estratégia e guia de testes
- [Build e Deploy Local](desenvolvimento/build.md) - Como fazer build e testar localmente

### 🚀 Deploy e Infraestrutura

- [Guia de Deploy](deploy/DEPLOYMENT.md) - Como fazer deploy do CLI e registry
- [Setup de Produção](deploy/PRODUCTION_SETUP.md) - Configuração de ambiente de produção
- [Publicação no NPM](deploy/npm.md) - Script automatizado de publicação dos packages no NPM
- [Configuração do Registry](deploy/registry.md) - Como configurar o registry em produção

## 🗺️ Como Usar Esta Documentação

### Para Desenvolvedores

1. **Começando**: Comece com [Guia de Desenvolvimento](desenvolvimento/guia.md)
2. **Entendendo Componentes**: Consulte [Componentes Disponíveis](componentes/README.md)
3. **Desenvolvendo**: Veja [Padrões de Código](desenvolvimento/padroes.md)
4. **Testando**: Acesse [Estratégia de Testes](desenvolvimento/testes.md)

### Para Arquitetos

1. **Arquitetura**: Consulte [Arquitetura do Monorepo](arquitetura/monorepo.md)
2. **Decisões**: Veja [Decisões de Design](arquitetura/decisoes.md)
3. **Padrões**: Acesse [Padrões Utilizados](arquitetura/padroes.md)

### Para Usuários do CLI

1. **Instalação**: Veja [Documentação do CLI](../cli/README.md)
2. **Uso Básico**: Consulte [Comandos do CLI](cli/comandos.md)
3. **Exemplos**: Veja [Uso do CLI](cli/uso.md)

### Para DevOps

1. **Deploy**: Consulte [Guia de Deploy](deploy/DEPLOYMENT.md)
2. **Produção**: Veja [Setup de Produção](deploy/PRODUCTION_SETUP.md)
3. **Registry**: Acesse [Configuração do Registry](deploy/registry.md)

## 📝 Estrutura de Documentação

```text
docs/
├── INDEX.md                    # Este arquivo - Guia central
├── desenvolvimento/            # Guias de desenvolvimento
│   └── guia.md                 # Guia completo de uso
├── deploy/                     # Documentação de deploy
│   ├── DEPLOYMENT.md           # Guia de deploy
│   └── PRODUCTION_SETUP.md     # Setup de produção
├── arquitetura/                # Documentação de arquitetura
│   ├── monorepo.md
│   ├── decisoes.md
│   └── padroes.md
├── packages/                   # Documentação dos packages
│   ├── ui.md
│   ├── logic.md
│   └── cli.md
├── componentes/                # Documentação de componentes
│   ├── README.md
│   ├── atoms.md
│   ├── molecules.md
│   ├── organisms.md
│   ├── blocks.md
│   └── hooks.md
├── cli/                        # Documentação do CLI
│   ├── comandos.md
│   └── uso.md
├── registry/                    # Documentação do registry
│   ├── estrutura.md
│   └── adicionar-componentes.md
├── desenvolvimento/             # Guias de desenvolvimento
│   ├── guia.md
│   ├── padroes.md
│   ├── storybook.md
│   ├── testes.md
│   ├── build.md
│   └── instalacao.md
└── deploy/                      # Documentação de deploy
    ├── README.md
    ├── DEPLOYMENT.md
    ├── PRODUCTION_SETUP.md
    ├── npm.md
    └── registry.md
```

## 🤝 Contribuindo com a Documentação

- [ ] **SEMPRE mantenha** documentação atualizada
- [ ] **SEMPRE use** linguagem clara e objetiva
- [ ] **SEMPRE inclua** exemplos práticos quando relevante
- [ ] **SEMPRE valide** links e referências antes de commitar
- [ ] **SEMPRE siga** os padrões de formatação Markdown do projeto
- [ ] **SEMPRE atualize** este índice ao adicionar nova documentação
- [ ] **SEMPRE verifique** se links estão funcionais

## 📅 Atualizações

- **Última atualização**: 2025-11-22
- **Versão da documentação**: 1.3.0
- **Próxima revisão**: 2025-12-22

## 🔧 Troubleshooting

### Problemas Comuns

- **Componentes do `@flowtomic/ui` sem padding/estilos ao usar o package via npm**: O Tailwind v4 não escaneia `node_modules` por padrão. Adicione `@source` no CSS do seu app apontando para `@flowtomic/ui`. Ver [Package UI — Uso do package publicado com Tailwind v4](packages/ui.md#uso-do-package-publicado-com-tailwind-v4).
- **Links quebrados**: Verifique se os arquivos referenciados existem
- **Documentação desatualizada**: Consulte a seção de atualizações e verifique a data da última atualização
- **Estrutura de diretórios incorreta**: Valide a estrutura de documentação conforme este índice
- **Referências inválidas**: Verifique se todos os links estão funcionais

### Soluções

- [ ] **SEMPRE verifique** se links estão funcionais antes de commitar
- [ ] **SEMPRE valide** estrutura de diretórios conforme este índice
- [ ] **SEMPRE atualize** este arquivo ao adicionar nova documentação
- [ ] **SEMPRE confirme** que referências estão corretas
- [ ] **SEMPRE teste** links após atualizações

## 📚 Recursos Adicionais

### Bibliotecas e Ferramentas

- [Radix UI](https://www.radix-ui.com/) - Componentes primitivos acessíveis
- [TanStack Table](https://tanstack.com/table) - Tabelas poderosas
- [shadcn/ui](https://ui.shadcn.com/) - Inspiração e padrões
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS utilitário
- [Storybook](https://storybook.js.org/) - Ambiente de desenvolvimento de componentes
- [Bun](https://bun.sh/) - Runtime JavaScript rápido
- [Turbo](https://turbo.build/) - Build system para monorepos

### Documentação Relacionada

- [README Principal](../README.md) - Visão geral do projeto
- [CLI README](../cli/README.md) - Documentação do CLI
- [Registry README](../registry/README.md) - Documentação do registry
