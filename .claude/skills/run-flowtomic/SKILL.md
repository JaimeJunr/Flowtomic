---
name: run-flowtomic
description: Rodar, subir, buildar, testar e tirar screenshot do Flowtomic — o design system (@flowtomic/ui, @flowtomic/logic, flowtomic-cli). Sobe o Storybook e DIRIGE os componentes por um driver Playwright que clica, espera e devolve JSON, além de varrer stories em lote atrás de tela quebrada. Use para "sobe o storybook", "essa story renderiza?", "clica nesse componente", "tira print dessa story", "roda os testes do ui", "o build tá quebrado?", ou antes de abrir PR que mexe em componente.
---

# Rodar e dirigir o Flowtomic

O Flowtomic é um monorepo Bun/Turbo de design system: `@flowtomic/ui` (componentes
React), `@flowtomic/logic` (hooks headless) e `flowtomic-cli` (instalador estilo
shadcn). **Não existe app de produto aqui** — a única superfície com tela é o
**Storybook**, e é por ele que se dirige qualquer componente. O driver
`verify.mjs` abre uma story no iframe isolado do Storybook, clica, espera por
condição e imprime uma linha de JSON; nunca é preciso ler a tela desenhada.

Todos os caminhos abaixo são **relativos à raiz do repo** (onde está o
`package.json` com `"name": "flowtomic"`), não ao diretório desta skill.

## Pré-requisitos

Bun 1.3+ e Node 20+ (verificado com bun 1.3.14 / node v24.9.0). Dependências:

```bash
bun install
```

O driver precisa do Playwright e do Chromium — instalados uma vez, já fixados no
`package.json` como `"playwright": "1.63.0"`:

```bash
npx playwright install --with-deps chromium
```

## Build

**O caminho do agente não passa por build.** O Storybook consome o TypeScript
direto via Vite, então mudança em componente aparece sem compilar nada.

Quando o build importar mesmo assim, um pacote por vez (o repo é pesado; não rode
o workspace inteiro de uma vez):

```bash
cd packages/logic && bun run build
```

```bash
cd packages/ui && bun run build
```

⚠️ `packages/ui` **falha hoje na `main`**: `tsc --build` para com 25 erros
(`stat-card`, `autocomplete`, `stats-grid`) e sai com exit 1. Isso é pré-existente,
não é a sua mudança, e **não impede o Storybook nem os testes**. Confirme com
`grep -c 'error TS'` antes de atribuir a si mesmo qualquer erro novo.

## Run — caminho do agente

Sobe o Storybook e espera ele responder de verdade (idempotente: se já estiver no
ar, não sobe outro):

```bash
bash .claude/skills/run-flowtomic/up.sh
```

```json
{"ok":true,"already":false,"url":"http://localhost:6006","log":"/tmp/flowtomic-storybook.log"}
```

### Abrir uma story e tirar evidência

```bash
node .claude/skills/run-flowtomic/verify.mjs story flowtomic-ui-atoms-actions-button--default
```

```json
{"ok":true,"id":"flowtomic-ui-atoms-actions-button--default","clicked":null,"expected":null,"consoleErrors":0,"errorSample":[],"shot":".claude/skills/run-flowtomic/shots/flowtomic-ui-atoms-actions-button--default.png"}
```

Screenshots caem em `.claude/skills/run-flowtomic/shots/` (ignorado pelo git).
**Abra a imagem e olhe.** Tela branca com `ok:true` quer dizer que a story
renderizou um componente invisível, não que está certa.

### Dirigir a interação

`--click` usa locator semântico por nome acessível (sobrevive a re-render do
React); `--expect` espera o texto aparecer. Os dois falham em 5s em vez dos 30s
default:

```bash
node .claude/skills/run-flowtomic/verify.mjs story flowtomic-ui-atoms-feedback-dialog--default --click "Abrir Diálogo" --expect "Descrição do diálogo"
```

```json
{"ok":true,"id":"flowtomic-ui-atoms-feedback-dialog--default","clicked":"Abrir Diálogo","expected":"Descrição do diálogo","consoleErrors":0,"errorSample":[],"shot":".claude/skills/run-flowtomic/shots/flowtomic-ui-atoms-feedback-dialog--default.png"}
```

### Varrer stories em lote

Depois de mexer num componente, varra a família dele. `broken` = a tela não
pintou; `noisy` = pintou mas cuspiu `console.error` — severidades diferentes de
propósito, e `--ignore-console` faz o veredito olhar só `broken`:

```bash
node .claude/skills/run-flowtomic/verify.mjs smoke --grep 'organisms-formlayout' --limit 10
```

```json
{"ok":false,"checked":10,"broken":[{"id":"flowtomic-ui-organisms-formlayout--custom-field-usage","reason":"Cannot destructure property 'getFieldState' of 'useFormContext(...)' as it is null."}],"noisy":[{"id":"flowtomic-ui-organisms-formlayout--default","consoleError":"Invalid prop `%s` supplied to `React.Fragment`. React.Fragment can only have `key` and `children` props. data-slot"}]}
```

Cada falha também deixa `shots/FALHA-<id>.png` com o painel de erro do Storybook e
o stack trace inteiro — é a evidência mais útil da run.

~0,7s por story nesta máquina (30 stories em 20s). O `--limit` default é 40;
a varredura completa são ~700 stories.

### Achar o storyId

```bash
node .claude/skills/run-flowtomic/verify.mjs list --grep 'dialog|accordion'
```

### Parar

```bash
bash .claude/skills/run-flowtomic/down.sh
```

```json
{"ok":true,"killed":1}
```

Use o script, **não** `pkill -f 'storybook dev'` na mão — ver Gotchas.

## Run — caminho humano

`bash .claude/skills/run-flowtomic/up.sh` e abrir <http://localhost:6006> no
navegador; `down.sh` derruba. O script do projeto (`cd packages/ui && bun run storybook`) faz o
mesmo, mas fica preso no terminal e não avisa quando ficou pronto.

## Testes

O script `test` do pacote é `vitest` — **modo watch**, que trava um agente. Force
o modo run:

```bash
cd packages/ui && bunx vitest run --reporter=dot
```

Verde hoje: 34 arquivos, 282 testes, ~11s. Os `Warning: Missing Description ...
for {DialogContent}` no stderr são ruído conhecido, não falha.

## Registry e CLI

O registry serve JSON compatível com shadcn na porta 3001:

```bash
bun run registry/server.ts
```

```bash
cd cli && bun run build && node dist/cli.js list
```

O `list` sai com exit 0 e imprime 116 componentes.

## Gotchas

- **`pkill -f 'storybook dev'` mata o shell do agente, não o Storybook.** A string
  que você passa ao `pkill` também está na linha de comando do shell que o executa,
  então ele casa consigo mesmo, morre com exit 144 e o Storybook continua de pé — com
  o agravante de parecer que funcionou. `down.sh` existe só por causa disso: dentro de
  um arquivo, o padrão não aparece na linha de comando de quem invoca.
- **`bun add` com o Storybook no ar derruba o Storybook vivo.** O processo passa a
  responder 500 com `Cannot find module .../storybook/dist/_node-chunks/lib-XXXXXXX.js`.
  O chunk não sumiu: a reinstalação **trocou o hash do nome** (`lib-7RNZBJWQ` →
  `lib-W6JDP72S`) e o processo em memória ainda procura o antigo. Não reinstale nada
  — basta reiniciar o Storybook.
- **`registry:build` gera 0 componentes e isso não é culpa sua.** O
  `loadComponentMap()` em `registry/build-registry.ts:71` usa regex non-greedy
  (`[\s\S]*?`), que para no primeiro `}` e captura **256 dos 30.059 caracteres** de
  `cli/src/utils/component-map.ts`. Só os 3 blocks saem, e eles vêm de um JSON
  estático. O CLI não sofre disso — ele importa o mapa de verdade.
- **O Storybook não lança exceção quando a story quebra.** Ele troca a classe do
  `<body>` para `sb-show-errordisplay`. O `#error-message` **existe sempre**, vazio
  no caminho feliz — usar a presença dele como sinal dá falso positivo em toda
  story boa. O driver olha a classe do body.
- **`page.waitForFunction(fn, { timeout })` ignora o timeout.** A assinatura é
  `(fn, arg, options)`, então o objeto vira *argumento* da função e o prazo volta
  ao default de 30s. É preciso `waitForFunction(fn, null, { timeout: 15000 })`.
- **Screenshot sem `animations: "disabled"` pega o meio da animação.** Os
  componentes usam Framer Motion; o print sai translúcido, com o modal a meio
  caminho, e parece bug de opacidade. O driver já congela.
- **Storybook 10 removeu `@storybook/addons`.** A API é `storybook/manager-api`
  (`.storybook/manager.ts`). O import antigo não é warning: o esbuild do manager
  falha e o Storybook morre no boot antes de servir qualquer coisa.
- **Stories quebradas conhecidas na `main`** (o smoke as acusa; não são regressão
  sua): `organisms-controls--default` (React Flow sem `ReactFlowProvider` ancestral)
  e `organisms-formlayout--custom-field-usage` (`useFormContext()` retorna null fora
  de `FormProvider`).

## Troubleshooting

| Sintoma | Causa | Correção |
|---|---|---|
| `Could not resolve "@storybook/addons"` no boot | import morto do Storybook 8 | trocar por `storybook/manager-api` em `.storybook/manager.ts` |
| Storybook responde 500 `Cannot find module ... _node-chunks/lib-*.js` | instalou dependência com ele rodando | `down.sh` e depois `up.sh` |
| Comando de parada sai com exit 144 e o Storybook segue vivo | o `pkill` casou com o próprio shell | usar `down.sh` |
| `waitForFunction: Timeout 30000ms exceeded` | o Storybook está no ar mas serve erro, ou o timeout foi ignorado (ver Gotchas) | `curl -sf localhost:6006/index.json` para separar os dois casos |
| Driver com `ok:false` e `reason: "Couldn't find story matching ..."` | storyId errado | `verify.mjs list --grep <termo>` |
| `vitest` não termina | script do pacote é watch | `bunx vitest run` |
| `bun run build` do ui com exit 1 | 25 erros TS pré-existentes na `main` | não é sua mudança; o Storybook não depende do build |
