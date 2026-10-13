# @flowtomic/ui é publicado com build de desenvolvimento e mata toda tela em produção

## O `dist` do flowtomic vem em modo dev

## Sintoma

Qualquer app que consome `@flowtomic/ui` e roda um build de produção morre no
navegador com a **tela inteira em branco**:

```
Application error: a client-side exception has occurred
(0 , x.jsxDEV) is not a function
```

Em `next dev` funciona normalmente — o runtime de desenvolvimento do React existe
ali. Só quebra depois do build, o que faz o problema aparecer apenas no deploy.

## Causa

O `dist` publicado chama `jsxDEV`, que vive em `react/jsx-dev-runtime` e não é
incluído em bundle de produção.

Medido em 20/09/2026 nos pacotes publicados:

| Versão | `jsxDEV` no `dist` |
|---|---|
| `@flowtomic/ui@0.7.0` (mais nova) | 146 |
| `@flowtomic/ui@0.1.15` (a que o Pandora pinava) | 140 |

Está em **todas** as versões: atualizar não resolve.

A raiz é o `bun build` **sem `--production`**, mesmo com `"jsx": "react-jsx"` no
`tsconfig` e `react/jsx-runtime` marcado como `--external`. Testado num componente
trivial para não chutar:

| Variante | `jsxDEV` | runtime emitido |
|---|---|---|
| como estava | 2 | `react/jsx-dev-runtime` |
| `NODE_ENV=production` | 2 | `react/jsx-dev-runtime` |
| `--define:process.env.NODE_ENV="production"` | 2 | `react/jsx-dev-runtime` |
| `--minify` | 1 | `react/jsx-dev-runtime` |
| **`--production`** | **0** | **`react/jsx-runtime`** |

⚠️ A intuição natural — `NODE_ENV=production` — **não funciona** com `bun build`.
Só a flag.

## Correção

No repo do flowtomic, `--production` no `bun build` de `packages/ui` e
`packages/logic` (PR `JaimeJunr/Flowtomic#6`).

## Paliativo no consumidor

Enquanto a versão corrigida não está no npm, o Pandora carrega um shim
(`lib/jsx-dev-runtime-shim.js`) aliasado só no build de produção: expõe `jsxDEV`
com a assinatura esperada e delega a `jsx`/`jsxs`, descartando os argumentos de
debug. **Remover assim que o pacote corrigido for publicado.**

## Como detectar em qualquer consumidor

```bash
grep -c 'jsx-dev-runtime' node_modules/@flowtomic/ui/dist/index.js
```

Qualquer número acima de zero significa que o app vai quebrar em produção.
