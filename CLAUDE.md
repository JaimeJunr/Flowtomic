# ⚛️ Regras do Projeto Flowtomic

> **⚠️ IMPORTANTE**: Este arquivo contém regras críticas para o agente de IA. Para informações detalhadas sobre componentes, estrutura e desenvolvimento, **SEMPRE consulte** `docs/INDEX.md` e a documentação específica.

## 📚 Documentação Principal

**SEMPRE consulte** a documentação antes de implementar:

- **`docs/INDEX.md`** - Índice central de toda a documentação
- **`docs/componentes/README.md`** - Lista completa de componentes (63 atoms, 47 molecules, 30 organisms, 14 hooks, 2 blocks — contados em `packages/ui/src/components` e `packages/logic/src/hooks`)
- **`docs/desenvolvimento/README.md`** - Guia completo de desenvolvimento
- **`docs/packages/ui.md`** - Detalhes do package UI
- **`docs/packages/logic.md`** - Detalhes do package Logic
- **`docs/cli/README.md`** - Documentação do CLI
- ⚠️ **`docs/deploy/npm.md`** - **DESATUALIZADO.** Documenta o `bun run publish`, que não é mais o
  caminho de publicação. A fonte correta é a seção *Publicação no NPM* deste arquivo

## Estrutura do Monorepo

**SEMPRE consulte** `docs/INDEX.md` e `README.md` para detalhes completos sobre a estrutura do monorepo.

Estrutura básica:

- **`packages/ui/`** - `@flowtomic/ui`: Componentes UI reutilizáveis
- **`packages/logic/`** - `@flowtomic/logic`: Hooks headless e lógica reutilizável
- **`packages/styles/`** - Estilos globais (globals.css, theme.css, typography.css)
- **`cli/`** - `flowtomic-cli`: CLI para instalação de componentes (⚠️ o nome npm **não** tem escopo)
- **`registry/`** - Registry para componentes e blocks (compatível com shadcn CLI)
- **`scripts/`** - Scripts de automação (publicação NPM, etc.)

## Padrões de Desenvolvimento

**SEMPRE consulte** `docs/desenvolvimento/README.md` e `docs/componentes/README.md` para padrões completos.

### Estrutura de Componentes

**SEMPRE consulte** `docs/componentes/` para lista completa e detalhes:

- **Atoms**: `docs/componentes/atoms.md` (63)
- **Molecules**: `docs/componentes/molecules.md` (47)
- **Organisms**: `docs/componentes/organisms.md` (30)
- **Blocks**: `docs/componentes/blocks.md` (2)
- **Hooks**: `docs/componentes/hooks.md` (14)

### Convenções de Arquivos

Cada componente/hook deve seguir a estrutura padrão:

```text
component-name/
├── component-name.tsx      # Componente principal (ou hook.ts para hooks)
├── component-name.stories.tsx  # Storybook story (OBRIGATÓRIO)
└── index.ts                # Barrel export
```

**Estrutura obrigatória**:

- Arquivo principal (ex: `button.tsx`, `useMobile.ts`)
- Arquivo `index.ts` para barrel exports
- Arquivo `*.stories.tsx` para Storybook (OBRIGATÓRIO)
- Tipos TypeScript exportados

**Exemplo de estrutura**:

```text
button/
├── button.tsx
├── button.stories.tsx
└── index.ts

useMobile/
├── useMobile.ts
├── useMobile.stories.tsx
└── index.ts
```

### Exports

- Sempre exportar tipos junto com componentes/hooks
- Usar barrel exports em `index.ts` de cada package
- Manter exports organizados por categoria (atoms, molecules, organisms, hooks)

### Dependências

- **UI**: Baseado em Radix UI, Tailwind CSS v4.1.14, class-variance-authority, clsx, tailwind-merge
  - **React Aria**: `@react-aria/tooltip`, `@react-aria/interactions`, `@react-aria/overlays`, `@react-stately/tooltip` (para tooltip com seguimento do mouse)
  - **Animações**: `motion/react` (Framer Motion) para animações avançadas
- **Logic**: Hooks headless sem dependências de UI (apenas React, zustand e dependências específicas como @tanstack/react-table, react-resizable-panels)
- **CLI**: Usa Bun para execução
- **Estilos**: Tailwind CSS v4 com `@tailwindcss/postcss`, suporte a variáveis CSS customizáveis

### Component Map

Ao adicionar novos componentes/hooks:

1. Adicionar entrada em `cli/src/utils/component-map.ts`
2. Incluir tipo (`atom`, `molecule`, `organism`)
3. Especificar dependências necessárias
4. Atualizar documentação em `README.md`

### Build e Desenvolvimento

**SEMPRE consulte** `docs/desenvolvimento/README.md` para comandos completos e guias de desenvolvimento.

Comandos principais:

- `bun run dev` - Desenvolvimento com watch
- `bun run build` - Build de todos os packages
- `bun run type-check` - Verificar tipos TypeScript
- CLI funciona via `bunx` sem necessidade de publicação no npm

### CLI

**SEMPRE consulte** `docs/cli/README.md` e `cli/README.md` para documentação completa do CLI.

Informações essenciais:

- CLI copia arquivos diretamente para projetos (estilo shadcn/ui)
- Ajusta imports automaticamente para aliases do projeto
- Comandos: `init`, `add`, `add-block`, `list`
- Compatível com shadcn CLI via registry: `https://registry.flowtomic.dev/all.json`
- Publicado no npm como `flowtomic-cli`

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

### Storybook e Stories

**SEMPRE criar** uma story para cada componente ou hook.

#### Estrutura de Stories

**Padrão obrigatório**:

1. **Localização**: Mesma pasta do componente/hook
2. **Nomenclatura**: `{component-name}.stories.tsx` ou `{hook-name}.stories.tsx`
3. **Framework**: Usar `@storybook/react-vite`
4. **Tags**: Sempre incluir `tags: ["autodocs"]`

#### Stories para Componentes UI

**Estrutura padrão**:

```typescript
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ComponentName } from "./component-name";

const meta = {
  title: "Flowtomic UI/{Atoms|Molecules|Organisms}/ComponentName",
  component: ComponentName,
  parameters: {
    layout: "centered", // ou "fullscreen" para componentes grandes
  },
  tags: ["autodocs"],
  argTypes: {
    // Definir controles para props
  },
} satisfies Meta<typeof ComponentName>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // Props padrão
  },
};
```

**Hierarquia de títulos**:

- **Atoms**: `"Flowtomic UI/Atoms/ComponentName"`
- **Molecules**: `"Flowtomic UI/Molecules/ComponentName"`
- **Organisms**: `"Flowtomic UI/Organisms/ComponentName"`
- **Subcategorias**: `"Flowtomic UI/Atoms/Typography/AnimatedShinyText"`

#### Stories para Hooks

**Estrutura padrão** (hooks são headless, precisam de componente wrapper):

```typescript
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useHookName } from "./index";

const meta = {
  title: "Flowtomic Logic/Hooks/useHookName",
  component: () => null, // Hooks não têm componente direto
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "Descrição do hook e seu propósito",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// Componente de demonstração
function HookDemo() {
  const hookValue = useHookName();
  return <div>{/* UI de demonstração */}</div>;
}

export const Default: Story = {
  render: () => <HookDemo />,
};
```

**Diretrizes para hooks**:

- **SEMPRE criar** um componente wrapper que demonstre o uso do hook
- **SEMPRE incluir** múltiplas variações de uso quando aplicável
- **SEMPRE documentar** o comportamento e propósito do hook na descrição

#### Configuração do Storybook

**Localização de stories**:

- Componentes UI: `packages/ui/src/**/*.stories.@(js|jsx|ts|tsx)`
- Hooks Logic: `packages/logic/src/**/*.stories.@(js|jsx|ts|tsx)`

**Comandos**:

```bash
# Executar Storybook em modo desenvolvimento
bun run storybook

# Build estático do Storybook
bun run build-storybook
```

#### Boas Práticas de Stories

1. **SEMPRE incluir** story `Default` com configuração básica
2. **SEMPRE criar** múltiplas variações quando o componente tem variantes
3. **SEMPRE documentar** props importantes em `argTypes`
4. **SEMPRE usar** `satisfies Meta<typeof Component>` para type safety
5. **SEMPRE incluir** exemplos de uso real quando relevante
6. **NUNCA criar** componente sem story correspondente

### Estilos e Customização

**SEMPRE consulte** `docs/packages/ui.md` para detalhes completos sobre estilos.

Regras críticas:

- **Ordem de importação obrigatória**: `globals.css` → `theme.css` → `typography.css`
- **Requisitos**: Tailwind CSS v4.1.14 com `@tailwindcss/postcss`
- **Customização**: Via `className` (ajustes pontuais) ou variáveis CSS (temas globais)

### Documentação

**SEMPRE siga** estas regras de documentação:

- **SEMPRE consultar** `docs/INDEX.md` antes de implementar para identificar padrões estabelecidos
- **SEMPRE atualizar** `docs/INDEX.md` ao adicionar nova documentação
- **SEMPRE criar** story para cada novo componente/hook (ver seção Storybook abaixo)
- **SEMPRE atualizar** documentação relevante em `docs/` ao adicionar componentes ou funcionalidades

## Comandos Importantes

**SEMPRE consulte** `docs/desenvolvimento/README.md` para lista completa de comandos e guias de uso.

Comandos principais:

- `bun run dev` - Desenvolvimento com watch
- `bun run build` - Build de todos os packages
- `bun run type-check` - Verificar tipos TypeScript
- `bun run storybook` - Executar Storybook
- `bun run fix:all` - Corrigir lint e formatar tudo
- `bun run publish` - Publicar packages no NPM (ver seção abaixo)

### Publicação no NPM

> **⚠️ Esta seção foi reescrita em 20/09/2026.** A versão anterior mandava rodar
> `bun run publish`, que hoje **não funciona mais**: o npm passou a exigir 2FA ou um token
> com bypass, e o script publica com `npm publish` direto da máquina. Seguir a instrução
> antiga custa uma sessão inteira e pode congelar a conta por 72h.

**Publique pelo GitHub Actions, nunca da sua máquina.**

#### O caminho atual: trusted publishing (OIDC)

`.github/workflows/publish.yml` autentica no npm por OIDC — sem token de vida longa, sem
código de 2 fatores na hora, e o pacote sai com proveniência.

1. Suba a versão no `package.json` do pacote **e rode `bun install`** para o `bun.lock`
   acompanhar. O lock registra a versão de cada workspace; sem isso a CI morre em
   `bun install --frozen-lockfile` com *"lockfile had changes"*.
2. Abra PR e mergeie na `main`.
3. GitHub → **Actions** → workflow **Publish** → *Run workflow* → escolha `logic`, `ui` ou
   `both`.
4. Confirme: `npm view @flowtomic/logic version`.

O `logic` é sempre buildado e testado antes do `ui`, porque o `ui` consome os tipos dele por
project reference do TypeScript.

#### Pré-requisito de uma vez só, no npmjs.com

Cada pacote precisa registrar este repositório em **Trusted Publisher**
(`npmjs.com/package/<pacote>/access`):

| campo | valor |
|---|---|
| Organization or user | `JaimeJunr` |
| Repository | `Flowtomic` |
| Workflow filename | `publish.yml` |
| Environment name | *(vazio)* |
| Allowed actions | **marcar** o publish direto |

⚠️ Campos são case-sensitive, o npm **não valida** o que você salva, e a conexão **não pode
ser editada depois** — só apagada e recriada. Se `Allowed actions` ficar desmarcado, a CI
falha com `E_STAGE_REQUIRED`.

⚠️ **O nome `publish.yml` faz parte do contrato.** Renomear o arquivo quebra a publicação até
reconfigurar no npmjs.com.

#### Se a CI falhar: tabela de erro → causa

Cada mensagem aponta para um lugar diferente do que parece.

| erro | causa real |
|---|---|
| `E404` no `PUT` | trusted publisher não configurado. O npm 404 em vez de 403 pra não confirmar que o pacote existe |
| `ENEEDAUTH` | falta `id-token: write` no job, ou o nome do workflow não bate com o registrado |
| `E_STAGE_REQUIRED` | o trusted publisher só permite staged publish; falta marcar o publish direto |
| `lockfile had changes` | subiu versão sem rodar `bun install` |
| `403 ... bypass 2fa` | você está publicando da máquina, não pela CI |

#### `bun run publish` — o script legado

`scripts/publish.ts` continua no repo e **ainda sobe a versão sozinha** (patch/minor/major)
antes de publicar. Rodá-lo depois de já ter subido a versão no `package.json` pula um número
e deixa git e npm em desacordo.

Use só se o trusted publishing estiver fora do ar, e sabendo que o `npm publish` dele vai
esbarrar no 2FA.

#### Pacotes publicáveis

| diretório | nome npm |
|---|---|
| `packages/ui` | `@flowtomic/ui` |
| `packages/logic` | `@flowtomic/logic` |
| `cli` | `flowtomic-cli` ⚠️ **sem escopo** |

⚠️ O `.npmrc` do repo pina `@flowtomic:registry=https://registry.npmjs.org/` porque o
registry default desta máquina é um CodeArtifact corporativo. **Essa linha não cobre o
`flowtomic-cli`**, que não tem escopo — publicar o CLI da máquina pode mandá-lo pro registry
errado.

## Componentes Disponíveis

**🚨 CRÍTICO**: **SEMPRE consulte** `docs/componentes/README.md` para lista completa e detalhada de todos os componentes.

Resumo:

- **Atoms**: 63 componentes - Ver `docs/componentes/atoms.md`
- **Molecules**: 47 componentes - Ver `docs/componentes/molecules.md`
- **Organisms**: 30 componentes - Ver `docs/componentes/organisms.md`
- **Hooks**: 14 hooks - Ver `docs/componentes/hooks.md`
- **Blocks**: 2 blocks - Ver `docs/componentes/blocks.md`

## Registry

**SEMPRE consulte** `docs/registry/README.md`. (⚠️ `registry/README.md`, citado na versão
anterior deste arquivo, **não existe** em `origin/main`.)

- **Compatibilidade**: compatível com shadcn CLI
- **Build e deploy**: `vercel.json` roda `bun run registry:build` e serve o diretório
  `registry/`, com rewrites de `/all.json`, `/blocks.json`, `/components.json` e
  `/:name.json`

⚠️ **`registry.flowtomic.dev` está fora do ar.** Medido em 20/09/2026: o domínio
`flowtomic.dev` **não resolve no DNS** — não é servidor caído, é domínio inexistente ou
expirado. Portanto:

- `npx shadcn@latest add https://registry.flowtomic.dev/all.json` **não funciona** hoje
- a mesma URL aparece no `README.md` e nos `docs/` — não confie nela sem antes rodar
  `curl -sI https://registry.flowtomic.dev/all.json`

Para consumir componentes enquanto o registry não voltar: `flowtomic-cli` (copia os
arquivos) ou npm (`@flowtomic/ui`).

## Ferramentas e Tecnologias

**SEMPRE consulte** `docs/INDEX.md` e `docs/desenvolvimento/README.md` para detalhes completos sobre tecnologias e padrões.

Stack principal:

- **Runtime**: Bun 1.3.0+
- **Build System**: Turbo
- **Linter/Formatter**: Biome (não ESLint/Prettier)
- **CSS Framework**: Tailwind CSS v4.1.14 com `@tailwindcss/postcss`
- **Componentes Base**: Radix UI
- **Acessibilidade**: React Aria (para componentes com seguimento do mouse)
- **Animações**: motion/react (Framer Motion)
- **Storybook**: @storybook/react-vite v10.0.6

## Regras Específicas

1. **Nunca** adicionar dependências de negócio específico em atoms ou molecules
2. **Sempre** manter hooks headless (sem UI)
3. **Sempre** atualizar `cli/src/utils/component-map.ts` ao adicionar componentes
4. **Sempre** verificar se o CLI funciona após mudanças
5. **Nunca** quebrar a API pública sem documentar mudanças
6. **Sempre** manter compatibilidade com React 18 e 19
7. **Sempre** usar Tailwind CSS v4 para estilização
8. **Sempre** usar Radix UI para acessibilidade em componentes interativos
9. **SEMPRE criar** story (`.stories.tsx`) para cada componente ou hook
10. **NUNCA criar** componente/hook sem story correspondente
11. **SEMPRE seguir** o padrão de estrutura: `pasta/index.ts + story + component`
12. **SEMPRE usar** nomenclatura correta de títulos no Storybook (`Flowtomic UI/...` ou `Flowtomic Logic/...`)
13. **SEMPRE consultar** `docs/INDEX.md` antes de implementar para identificar padrões estabelecidos
14. **SEMPRE seguir** ordem de importação dos estilos: globals.css → theme.css → typography.css
15. **SEMPRE usar** Biome para linting e formatação (não ESLint/Prettier)
16. **SEMPRE atualizar** `docs/` ao adicionar novos componentes ou funcionalidades
17. **SEMPRE publicar** pelo workflow **Publish** do GitHub Actions (trusted publishing), nunca da sua máquina — ver a seção *Publicação no NPM*
18. **SEMPRE rodar** `bun install` depois de subir versão no `package.json`, senão o `bun.lock` fica para trás e a CI quebra
19. **SEMPRE escolher** o tipo de versão apropriado (major/minor/patch) ao subir a versão
20. **NUNCA rodar** `bun run publish` por hábito: ele sobe a versão de novo por conta própria e publica da máquina, onde o npm barra por 2FA
21. **SEMPRE buildar e testar por pacote** (`cd packages/<x> && bun run build`), nunca o workspace inteiro — a máquina de desenvolvimento é limitada
22. **NUNCA commitar direto na `main`** — branch a partir dela e PR via `gh pr create --base main --repo JaimeJunr/Flowtomic`

## Testes

Vitest, configurado **por pacote**. O CI (`.github/workflows/ci.yml`, desde 20/09/2026) roda em
todo PR e push na `main`: Biome no repo inteiro, build + teste do `logic`, type-check + teste com
cobertura do `ui`, teste do `registry` e do `cli`, e o `registry:build`. Serial, um pacote por vez.

⚠️ **Cobertura global do `ui` medida em 20/09/2026: 20,9% de linhas.** O CI gera o relatório mas
**não tem threshold** — pôr 75% agora nasceria vermelho. A meta é subir por área (os 27 atoms sem
teste primeiro) e só então travar o número no `vitest.config.ts`.

| pacote | arquivos de teste | script | ambiente |
|---|---|---|---|
| `packages/ui` | 41 | `test`, `test:watch`, `test:coverage` | jsdom (`packages/ui/vitest.config.ts`), setup em `src/test/setup.ts` |
| `packages/logic` | 2 | `test`, `test:run` | padrão do Vitest — **não há `vitest.config`** no pacote, então roda em `node`, sem DOM |
| `registry` | 1 | `test` | guarda o parser do component map |
| `cli` | 2 | `test` | guarda os `path` do component map contra os arquivos em disco |

⚠️ **`bun run test` no `packages/ui` entra em modo watch e não devolve o terminal.** O pacote
não tem `test:run` (o `logic` tem). Para rodar uma vez:

```bash
cd packages/ui && bunx vitest run
```

⚠️ **Hook novo no `logic` que precise de DOM não vai funcionar** sem antes criar um
`vitest.config.ts` com `environment: "jsdom"` no pacote. Os testes atuais são de função pura.

## Convenções

- **Branch default:** `main` — confirmado com `git remote show origin | grep 'HEAD branch'`.
- **Rastreamento:** ⚠️ **não há board nem prefixo de ticket.** Projeto pessoal
  (`JaimeJunr`, não `investtools`). Se um board for adotado, registre aqui.
- **Branches:** a partir de `main`. Nunca commit direto nela.
- **PRs:** `gh pr create --base main --repo JaimeJunr/Flowtomic`.
- **Recursos são escassos na máquina de desenvolvimento:** build e teste sempre por pacote e
  em série. Nunca `turbo run build` sem `--filter`, nunca vários comandos pesados em paralelo.
- **Design de tela: identidade decidida antes do código.** Redesign de block/organism passa
  por um canvas `/design` que o dono revisa por comentário, depois um elemento piloto, depois o
  resto. Referência aprovada em 20/09/2026: o `developer-panel`
  (https://claude.ai/artifact/ULAwTHrbLJo31PdrSowDhw). Tells que contam como "cara de IA" aqui
  e não passam: subtítulo que repete o título, tudo em cards idênticos, emoji como ícone, copy
  de template alheio (nomes fictícios, "Download our Mobile App"), eyebrow em CAPS espaçado,
  UI dividida pelo mecanismo do sistema (abas Terminal/Preview) e não pelo trabalho da pessoa,
  dois botões competindo o tempo todo. O que substitui: uma pergunta por tela respondida de
  longe, `<dl>` denso em vez de card, JetBrains Mono nos valores (já está no `theme.css`),
  um botão sólido por tela, estado vazio como instrução com endereço concreto.

## Armadilhas

Cada uma já mordeu alguém neste repo.

- ⚠️ **O `theme.css` precisa ser `@theme static`.** Sem o `static`, o Tailwind v4 só emite a
  variável que algum utilitário usa. Até 26/09/2026 nada usava `--font-body`, então o body caía
  no `ui-sans-serif` e o `font-mono` virava o default do Tailwind — nem a Inter antiga chegava
  à tela. O `theme-tokens.test.ts` do `ui` trava isso.
- ⚠️ **`clean` precisa apagar o `tsbuildinfo` junto com o `dist`.** Com `composite` e
  `incremental` ligados no `tsconfig.json` raiz, o `tsc --emitDeclarationOnly` lê o
  `tsbuildinfo`, conclui que nada mudou e **não re-emite**. Apagar só o `dist` deixa o pacote
  sem `.d.ts`, e rodar `build` de novo **não recupera**. Já corrigido nos três pacotes, mas se
  você escrever um `clean` novo, lembre.
- ⚠️ **Sem `packages/logic/dist/index.d.ts`, o type-check do `ui` produz ~38 erros que se
  disfarçam de bug de tipo** em `stat-card`, `autocomplete` e `stats-grid` — componentes sem
  relação aparente com o `logic`. Antes de investigar qualquer `TS2339` no `ui`, rode
  `ls packages/logic/dist/index.d.ts`.
- ⚠️ **Subir versão no `package.json` sem rodar `bun install` quebra a CI.** O `bun.lock`
  registra a versão de cada workspace; o `--frozen-lockfile` do workflow rejeita o drift.
  ⚠️ **E o `bun install` do bun 1.3.14 local não reescreve essa linha** (medido em 26/09/2026):
  o lock fica com a versão velha e o `--frozen-lockfile` local passa, mas o bun 1.3.0 da CI
  acusa. Depois do bump, confira `grep -A2 '"packages/ui": {' bun.lock` e acerte a versão na mão.
- ⚠️ **`registry.flowtomic.dev` não resolve no DNS** (medido em 20/09/2026), mas continua
  citado no `README.md` e nos `docs/`.
- ⚠️ **O `.npmrc` do repo pina só o escopo `@flowtomic`.** O `flowtomic-cli` não tem escopo e
  fica desprotegido do registry default da máquina.
- ⚠️ **`bun.lock` com URL do CodeArtifact trava a CI por 6h.** Um `bun add` nesta máquina
  reescreveu os 1.223 `resolved` pro registry corporativo; a CI, sem credencial, ficou parada no
  `bun install` até o GitHub matar o job. O `.npmrc` agora fixa `registry=` no npm público, mas
  antes de commitar lock confira: `grep -c codeartifact bun.lock` tem que dar `0`.
- ⚠️ **`bun run test` no `packages/ui` trava em watch** — ver a seção *Testes*.
- ⚠️ **`turbo run type-check` no `ui` depende do build do `logic`** (`dependsOn: ["^build"]`).
  Rodar `bun run type-check` direto dentro de `packages/ui`, fora do turbo, falha se o `dist`
  do `logic` não existir.
- ⚠️ **Importar do barrel `@/components/organisms` quebra o Vitest** com `Unknown file
  extension ".css"`: o barrel puxa `message.tsx`, que importa `katex.min.css`. Em teste e em
  block, importe o organism pelo caminho direto (`@/components/organisms/script-editor`).
- ⚠️ **`verify.mjs --click "<nome>"` não acha aba do Radix** — o locator procura `button`, e
  `TabsTrigger` é `role="tab"`. Para clicar numa aba, use o browser pane (`find` + `left_click`).

## Checklist ao abrir PR

Antes de fechar: *"o que aprendi que o próximo vai querer saber?"*

- Gotcha novo → seção **Armadilhas** deste arquivo
- Comando ou stack mudou → seções **Comandos Importantes** / **Ferramentas e Tecnologias**
- Convenção mudou → seção **Convenções**
- Componente novo → contagem em **Componentes Disponíveis** + `docs/componentes/` +
  `cli/src/utils/component-map.ts`

Só registre o reutilizável — não duplicar o que o código e o git já contam.

## Perguntas em aberto

Não promova nenhuma destas a fato no corpo sem verificar antes.

- **O domínio `flowtomic.dev` foi perdido ou nunca existiu?** Ele não resolve, mas o
  `vercel.json` e os `docs/` tratam o registry como coisa viva. Resolve: olhar o projeto no
  painel da Vercel e o registrador do domínio.
- **O `packages/ui` deveria ter `test:run`?** Hoje só o `logic` tem, e a falta trava quem roda
  `bun run test` no `ui`. Resolve: decidir e padronizar os dois.
- **O `scripts/publish.ts` deve ser apagado?** Ele ficou obsoleto com o trusted publishing e
  hoje é uma armadilha — sobe versão sozinho e publica da máquina. Resolve: apagar, ou
  transformar num wrapper que só dispara o workflow.
- **O `bun@1.3.0` do `packageManager` está defasado?** A máquina de desenvolvimento roda
  1.3.14. Os dois aceitam o mesmo lock, mas a divergência existe.
- **Quando travar o threshold de cobertura do `ui`?** O CI mede (20,9% em 20/09/2026) mas não
  bloqueia. Resolve: subir cobertura por área e fixar o número no `vitest.config.ts` quando
  passar de 75%.
