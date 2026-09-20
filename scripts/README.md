# 📦 Scripts de Automação

Esta pasta contém scripts de automação para o projeto Flowtomic.

## 📚 Documentação

**Para documentação completa, consulte:**

- **[Publicação no NPM](../docs/deploy/npm.md)** - Guia completo do script de publicação automatizada

## 🚀 Scripts Disponíveis

### `publish.ts` - Publicação Automatizada no NPM

Script que automatiza o processo de publicação dos packages no NPM.

**Uso rápido**:

```bash
# Modo interativo
bun run publish

# Modo não-interativo
bun run publish ui patch
bun run publish logic minor
bun run publish cli major
```

**Documentação completa**: [docs/deploy/npm.md](../docs/deploy/npm.md)
