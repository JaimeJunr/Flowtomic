# 🚀 Setup de Produção - Flowtomic

Este documento resume tudo que foi configurado para produção.

## ✅ O que foi implementado

### 1. CLI Publicado como `flowtomic`

- ✅ `package.json` do CLI atualizado com nome `flowtomic`
- ✅ Bin configurado: `flowtomic` e `flowtomic-cli`
- ✅ Keywords atualizadas (incluindo `shadcn`, `blocks`, `registry`)
- ✅ `.npmignore` configurado

**Para publicar:**
```bash
cd cli
bun run build
npm publish
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

### CLI no npm

- [ ] Build do CLI: `cd cli && bun run build`
- [ ] Verificar conteúdo: `npm pack --dry-run`
- [ ] Login no npm: `npm login`
- [ ] Publicar: `npm publish`
- [ ] Testar: `npx flowtomic@latest --version`

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

- [ ] Testar CLI: `npx flowtomic@latest init`
- [ ] Testar adicionar componente: `npx flowtomic@latest add button`
- [ ] Testar adicionar block: `npx flowtomic@latest add-block dashboard-01`
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

