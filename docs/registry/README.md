# ⚛️ Flowtomic Registry

Registry de componentes e blocks do Flowtomic, compatível com shadcn/ui CLI.

## 📦 Estrutura

```text
registry/
├── api/              # API routes para Vercel
│   ├── all.json.ts
│   ├── blocks.json.ts
│   └── components.json.ts
├── build-registry.ts # Script para gerar registry.json
├── server.ts         # Servidor local para desenvolvimento
└── registry.json     # Registry gerado (build time)
```

## 🚀 Desenvolvimento

### Gerar Registry

```bash
bun run registry:build
```

Isso gera o arquivo `registry/registry.json` com todos os componentes e blocks.

### Servidor Local

```bash
bun run registry:server
```

Servidor local em `http://localhost:3001` para testar o registry.

## 🌐 Produção

### Deploy no Vercel

1. Configure o domínio `registry.flowtomic.dev` no Vercel
2. O `vercel.json` já está configurado com as rotas necessárias
3. O build gera o `registry.json` automaticamente

### Endpoints

- `https://registry.flowtomic.dev/all.json` - Registry completo
- `https://registry.flowtomic.dev/blocks.json` - Apenas blocks
- `https://registry.flowtomic.dev/components.json` - Apenas componentes
- `https://registry.flowtomic.dev/:name.json` - Componente específico

## 📝 Como Funciona

1. **Build Time**: O script `build-registry.ts` gera o `registry.json` completo
2. **Runtime**: As API routes servem o JSON gerado
3. **Cache**: Headers de cache configurados para performance

## 🔧 Configuração

O registry segue o schema do shadcn/ui:

- Schema: `https://ui.shadcn.com/schema.json`
- Compatível com `npx shadcn@latest add https://registry.flowtomic.dev/all.json`
