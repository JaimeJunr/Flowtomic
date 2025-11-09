# 🚀 Guia de Deploy do Flowtomic

Este guia explica como publicar o CLI no npm e configurar o registry em produção.

## 📦 Publicar CLI no npm

### 1. Preparação

Certifique-se de que o `package.json` do CLI está correto:

```json
{
  "name": "flowtomic",
  "version": "0.1.0",
  "description": "CLI para instalação de componentes, hooks e blocks do Flowtomic",
  "bin": {
    "flowtomic": "./dist/cli.js"
  }
}
```

### 2. Build do CLI

```bash
cd cli
bun run build
```

Isso gera o arquivo `dist/cli.js` que será publicado.

### 3. Verificar o que será publicado

```bash
cd cli
npm pack --dry-run
```

Isso mostra quais arquivos serão incluídos no pacote.

### 4. Publicar no npm

```bash
# Login no npm (se ainda não estiver)
npm login

# Publicar
cd cli
npm publish
```

**Nota:** Se o nome `flowtomic` já estiver em uso, você pode:

- Usar um escopo: `@jaimejunior/flowtomic`
- Ou escolher outro nome disponível

### 5. Verificar publicação

Após publicar, você pode instalar e testar:

```bash
npx flowtomic@latest --version
```

## 🌐 Configurar Registry em Produção

### Opção 1: Vercel (Recomendado)

#### 1. Preparar o projeto

O projeto já está configurado com `vercel.json`. Certifique-se de que:

- O script `registry:build` está no `package.json`
- As API routes estão em `registry/api/`

#### 2. Deploy no Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Fazer login
vercel login

# Deploy
vercel --prod
```

#### 3. Configurar Domínio

1. No dashboard do Vercel, vá em Settings > Domains
2. Adicione o domínio `registry.flowtomic`
3. Configure o DNS apontando para o Vercel

#### 4. Verificar

Após o deploy, teste os endpoints:

```bash
curl https://registry.flowtomic/all.json
curl https://registry.flowtomic/blocks.json
curl https://registry.flowtomic/components.json
```

### Opção 2: Outras Plataformas

#### Netlify

1. Configure o build command: `bun run registry:build`
2. Configure o publish directory: `registry`
3. Adicione redirects no `netlify.toml`:

```toml
[[redirects]]
  from = "/all.json"
  to = "/registry.json"
  status = 200
```

#### Cloudflare Pages

1. Configure o build command: `bun run registry:build`
2. Configure o output directory: `registry`
3. Adicione redirects no `_redirects`:

```
/all.json /registry.json 200
```

## 🔄 Atualizar Registry

Sempre que adicionar novos componentes ou blocks:

1. **Atualizar o registry localmente:**

   ```bash
   bun run registry:build
   ```

2. **Commit e push:**

   ```bash
   git add registry/registry.json
   git commit -m "chore: update registry"
   git push
   ```

3. **Deploy automático:**
   - Se configurado com CI/CD, o deploy será automático
   - Ou faça deploy manual: `vercel --prod`

## 📝 Checklist de Publicação

- [ ] CLI buildado (`bun run build` no diretório `cli`)
- [ ] Registry gerado (`bun run registry:build`)
- [ ] Testes locais passando
- [ ] `package.json` do CLI configurado corretamente
- [ ] `.npmignore` configurado
- [ ] Versão atualizada no `package.json`
- [ ] Changelog atualizado (se houver)
- [ ] Publicado no npm
- [ ] Registry deployado
- [ ] Domínio configurado
- [ ] Endpoints testados

## 🐛 Troubleshooting

### Erro: "Package name already exists"

O nome `flowtomic` pode já estar em uso. Soluções:

1. Usar escopo: `@jaimejunior/flowtomic`
2. Escolher outro nome: `flowtomic-cli`, `flowtomic-ui`, etc.

### Registry não está acessível

1. Verifique se o deploy foi bem-sucedido
2. Verifique os logs do Vercel/plataforma
3. Teste localmente: `bun run registry:server`
4. Verifique o DNS do domínio

### Build do registry falha

1. Verifique se todos os arquivos necessários existem
2. Execute localmente: `bun run registry:build`
3. Verifique os logs de erro

## 🔗 Links Úteis

- [npm Publishing Guide](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- [Vercel Deployment](https://vercel.com/docs)
- [shadcn/ui Registry](https://ui.shadcn.com/registry)
