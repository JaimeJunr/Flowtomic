# 🚀 Setup de Produção - Flowtomic

Este documento resume tudo que foi configurado para produção.

## ✅ O que foi implementado

### 1. Packages Publicados no npm

#### CLI (`flowtomic-cli`)

- ✅ `package.json` do CLI atualizado com nome `flowtomic-cli`
- ✅ Bin configurado: `flowtomic` e `flowtomic-cli`
- ✅ Keywords atualizadas (incluindo `shadcn`, `blocks`, `registry`)
- ✅ `.npmignore` configurado
- ✅ Versão atual: `0.2.0`

**Para publicar:**

```bash
cd cli
bun run build
npm publish --access public
```

#### UI (`@flowtomic/ui`)

- ✅ Package scoped: `@flowtomic/ui`
- ✅ Depende de `@flowtomic/logic@^0.1.0`
- ✅ Versão atual: `0.1.0`

**Para publicar:**

```bash
cd packages/ui
bun run build
npm publish --access public
```

#### Logic (`@flowtomic/logic`)

- ✅ Package scoped: `@flowtomic/logic`
- ✅ Hooks headless e lógica reutilizável
- ✅ Versão atual: `0.1.0`

**Para publicar:**

```bash
cd packages/logic
bun run build
npm publish --access public
```

### 2. Registry em Produção

#### Estrutura Criada:

- ✅ `registry/build-registry.ts` - Script para gerar registry.json
- ✅ `registry/api/all.json.ts` - API route para registry completo
- ✅ `registry/api/blocks.json.ts` - API route para blocks
- ✅ `registry/api/components.json.ts` - API route para componentes
- ✅ `vercel.json` - Configuração do Vercel
- ✅ `registry/server.ts` - Servidor local para desenvolvimento

#### Scripts Adicionados:

- ✅ `bun run registry:build` - Gera o registry.json
- ✅ `bun run registry:server` - Servidor local

### 3. Documentação

- ✅ `docs/deploy/DEPLOYMENT.md` - Guia completo de deploy
- ✅ `registry/README.md` - Documentação do registry
- ✅ README.md atualizado com seção de publicação

### 4. Utilitários

- ✅ `cli/src/utils/registry.ts` - Funções para trabalhar com registry online
- ✅ Suporte para `FLOWTOMIC_REGISTRY_URL` (padrão: `https://registry.flowtomic.dev`)

## 📋 Checklist de Deploy

### Packages no npm

#### CLI (`flowtomic-cli`)

- [x] Build do CLI: `cd cli && bun run build`
- [x] Verificar conteúdo: `npm pack --dry-run`
- [x] Login no npm: `npm login`
- [x] Publicar: `npm publish --access public`
- [x] Versão publicada: `0.2.0`
- [ ] Testar: `npx flowtomic-cli@latest --version`

#### UI (`@flowtomic/ui`)

- [x] Build do UI: `cd packages/ui && bun run build`
- [x] Verificar conteúdo: `npm pack --dry-run`
- [x] Ajustar dependência para `@flowtomic/logic@^0.1.0`
- [x] Publicar: `npm publish --access public`
- [x] Versão publicada: `0.1.0`

#### Logic (`@flowtomic/logic`)

- [x] Build do Logic: `cd packages/logic && bun run build`
- [x] Verificar conteúdo: `npm pack --dry-run`
- [x] Publicar: `npm publish --access public`
- [x] Versão publicada: `0.1.0`

### Registry no Vercel

- [ ] Gerar registry: `bun run registry:build`
- [ ] Verificar `registry/registry.json` foi gerado
- [ ] Fazer login no Vercel: `vercel login`
- [ ] Deploy: `vercel --prod`
- [ ] Configurar domínio `registry.flowtomic` no Vercel
- [ ] Testar endpoints:
  - `https://registry.flowtomic/all.json`
  - `https://registry.flowtomic/blocks.json`
  - `https://registry.flowtomic/components.json`

### Testes Finais

- [ ] Testar CLI: `npx flowtomic-cli@latest init`
- [ ] Testar adicionar componente: `npx flowtomic-cli@latest add button`
- [ ] Testar adicionar block: `npx flowtomic-cli@latest add-block dashboard-01`
- [ ] Testar instalação dos packages: `npm install @flowtomic/ui @flowtomic/logic`
- [ ] Testar com shadcn: `npx shadcn@latest add https://registry.flowtomic/all.json`

## 🔄 Atualizações Futuras

### Adicionar Novo Block

1. Criar block em `packages/ui/src/blocks/[nome-do-block]/`
2. Adicionar entrada em `packages/ui/src/blocks/registry-blocks.json`
3. Gerar registry: `bun run registry:build`
4. Commit e push
5. Deploy automático (se configurado) ou manual

### Adicionar Novo Componente

1. Criar componente em `packages/ui/src/components/`
2. Adicionar entrada em `cli/src/utils/component-map.ts`
3. Gerar registry: `bun run registry:build`
4. Commit e push
5. Deploy automático (se configurado) ou manual

## 🌐 Endpoints do Registry

- `https://registry.flowtomic/all.json` - Registry completo
- `https://registry.flowtomic/blocks.json` - Apenas blocks
- `https://registry.flowtomic/components.json` - Apenas componentes
- `https://registry.flowtomic/:name.json` - Componente específico (futuro)

## 📚 Referências

- [shadcn/ui Registry](https://ui.shadcn.com/registry)
- [ai-elements Registry](https://registry.ai-sdk.dev)
- [Vercel Deployment](https://vercel.com/docs)
- [npm Publishing](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
