# ⚛️ Regras do Projeto Flowtomic

> **⚠️ IMPORTANTE**: Este arquivo contém regras críticas para o agente de IA. Para informações detalhadas sobre componentes, estrutura e desenvolvimento, **SEMPRE consulte** `docs/INDEX.md` e a documentação específica.

## 📚 Documentação Principal

**SEMPRE consulte** a documentação antes de implementar:

- **`DESIGN.md`** - Design system: tokens, tipografia, componentes e regras visuais
- **`docs/INDEX.md`** - Índice central de toda a documentação
- **`docs/componentes/README.md`** - Lista completa de componentes (122 atoms, 72 molecules, 31 organisms, 14 hooks, 4 blocks — contados em `packages/ui/src/components` e `packages/logic/src/hooks`)
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

- **Atoms**: `docs/componentes/atoms.md` (122)
- **Molecules**: `docs/componentes/molecules.md` (72)
- **Organisms**: `docs/componentes/organisms.md` (31)
- **Blocks**: `docs/componentes/blocks.md` (4)
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

- **UI**: Baseado em Radix UI (e Base UI `@base-ui/react`, em piloto desde o Combobox), Tailwind CSS v4.1.14, class-variance-authority, `cn` (pacote do shadcn que substitui clsx + tailwind-merge)
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
- React 19 obrigatório a partir da 1.0 (convenções do shadcn: `ref` como prop, sem `forwardRef`, `data-slot` na raiz)
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
4. Confirme: `npm view @flowtomic/logic version`. ⚠️ O npm leva alguns minutos para mostrar a
   versão nova: o log do job (`+ @flowtomic/ui@0.8.0`) é a prova imediata, o `npm view` atrasa.

O `logic` é sempre buildado e testado antes do `ui`, porque o `ui` consome os tipos dele por
project reference do TypeScript.

#### Pré-requisito de uma vez só, no npmjs.com

Cada pacote precisa registrar este repositório em **Trusted Publisher**
(`npmjs.com/package/<pacote>/access`). ✅ Feito para `@flowtomic/logic` e `@flowtomic/ui` em
27/09/2026 (primeira publicação pela CI: logic 0.1.8 e ui 0.8.0). O `flowtomic-cli` ainda não tem.
A ligação é **por pacote**: configurar só um faz o outro falhar com `E404` na mesma execução.

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
| `E404` no `PUT` | trusted publisher não configurado **naquele pacote**. O npm 404 em vez de 403 pra não confirmar que o pacote existe. Com `both`, se o `logic` já saiu e só o `ui` falhou, rode de novo só com `ui` — republicar a mesma versão do `logic` dá erro |
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

- **Atoms**: 122 componentes - Ver `docs/componentes/atoms.md`
- **Molecules**: 72 componentes - Ver `docs/componentes/molecules.md`
- **Organisms**: 31 componentes - Ver `docs/componentes/organisms.md`
- **Hooks**: 14 hooks - Ver `docs/componentes/hooks.md`
- **Blocks**: 4 blocks - Ver `docs/componentes/blocks.md`

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
6. **Sempre** assumir React 19 (obrigatório a partir da 1.0): `ref` é prop normal, sem `forwardRef`, e todo componente marca a raiz com `data-slot`. O `src/test/react19-conventions.test.ts` reprova na CI componente novo com `forwardRef` ou sem `data-slot` nas áreas já migradas (`MIGRATED_AREAS`); modelo a copiar: `atoms/display/card/card.tsx`
7. **Sempre** usar Tailwind CSS v4 para estilização
8. **Sempre** usar Radix UI ou Base UI para acessibilidade em componentes interativos (Base UI em piloto desde o Combobox, 03/10/2026; migração em avaliação)
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

⚠️ **Cobertura global do `ui` remedida em 04/10/2026, depois dos lotes das molecules: 96,9% de
linhas, 94,4% de branches** (156 arquivos, 2171 testes; antes dos lotes das molecules, 92,9% /
90,9%; em 03/10/2026, 82,5% / 83,4%; antes dos lotes dos atoms, 70,4% / 78,9%). Por área (linhas /
branches): organisms 98,9% / 95,1%, molecules 97,1% / 95,3% (eram 86,6%), atoms 96,5% / 92,6%,
blocks 92,0% / 94,1%. Os `.tsx` mais fracos: `inline-citation` (68,8%), `message` (72%),
`scroll-area` (74,1%), `drawer` (78,7%). O CI
gera o relatório e **barra o PR abaixo de 90%** em linhas, statements, functions e branches (piso
global no `vitest.config.ts`, decidido em 04/10/2026). ⚠️ O piso conta o pacote inteiro: rodar
`--coverage` numa pasta só sempre reprova (o resto do pacote entra como 0%). Para cobertura de
uma pasta, passe `--coverage.thresholds.lines=0` etc., ou leia o relatório e ignore o exit code. Para remedir:
`cd packages/ui && bunx vitest run --testTimeout=60000 --minWorkers=1 --maxWorkers=4 --coverage --coverage.reporter=text-summary`.

| pacote | arquivos de teste | script | ambiente |
|---|---|---|---|
| `packages/ui` | 156 | `test`, `test:watch`, `test:coverage` | jsdom (`packages/ui/vitest.config.ts`), setup em `src/test/setup.ts` |
| `packages/logic` | 2 | `test`, `test:run` | padrão do Vitest — **não há `vitest.config`** no pacote, então roda em `node`, sem DOM |
| `registry` | 1 | `test` | guarda o parser do component map |
| `cli` | 4 | `test` | guarda o component map contra o disco nos dois sentidos: todo `path` existe, e toda pasta de componente em `packages/ui/src/components` tem entrada — componente novo sem entrada no mapa quebra a CI. O `install-imports.test.ts` instala cada entrada e reprova import local sem arquivo; o `install.test.ts` roda o bundle (`dist/cli.js`) em projeto temporário |

⚠️ **`bun run test` no `packages/ui` entra em modo watch e não devolve o terminal.** O pacote
não tem `test:run` (o `logic` tem). Para rodar uma vez:

```bash
cd packages/ui && bunx vitest run
```

⚠️ **Hook novo no `logic` que precise de DOM não vai funcionar** sem antes criar um
`vitest.config.ts` com `environment: "jsdom"` no pacote. Os testes atuais são de função pura.

## Convenções

- **Branch default:** `main` — confirmado com `git remote show origin | grep 'HEAD branch'`.
- **Efeitos inspirados no React Bits são clean room** (decidido em 04/10/2026). A licença deles
  (MIT + Commons Clause) proíbe redistribuir "ported version". Quem escreve a spec só vê a demo e
  a tabela de props em `reactbits.dev`, **nunca a aba Code nem o GitHub**, e grava em
  `docs/clean-room/react-bits/<nome>.md`. Quem implementa recebe só a spec. Não cole código deles
  em prompt nem em PR. Dependências: só `motion` + `src/lib/webgl` (sem gsap, ogl, matter-js).
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
  ⚠️ **Existir não basta: o `dist` velho também engana.** Os testes do `ui` usam o `logic`
  compilado. Em 04/10/2026, com o `dist` de 20/09, dois testes do `DataTable` falhavam igual na
  `main` e passaram depois de `cd packages/logic && bun run build`. Teste do `ui` que falha "também
  na main" e mexe com hook do `logic`: recompile o `logic` antes de concluir.
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
  ⚠️ **O `bun add` do bun 1.3.14 também troca a URL de todo pacote por `""`** no lock
  (medido em 03/10/2026: 1.223 linhas mudadas para acrescentar uma devDependency). Para uma
  dependência só, desfaça o lock (`git checkout bun.lock`), acrescente a linha na seção do
  workspace à mão e confira com `bun install --frozen-lockfile`.
  ⚠️ **Isso não basta se a dependência traz outras junto** (o `@base-ui/react` trouxe 10, em
  03/10/2026): o `bun install` precisa gravar as entradas novas, e também zera todas as URLs.
  O que funcionou: deixar o `bun install` gravar e depois, com um script, devolver a linha do
  lock antigo (`git show HEAD:bun.lock`) a todo pacote que já existia, e montar a URL
  `https://registry.npmjs.org/<nome>/-/<base>-<versão>.tgz` só nos novos. Ficou com 25 linhas
  de diff; confira `grep -c '"", {' bun.lock` = `0`.
- ⚠️ **`bun run test` no `packages/ui` trava em watch** — ver a seção *Testes*.
- ⚠️ **Com Node 25+ (esta máquina roda o 26), 14 testes do `resizable-layout` falham com
  `Cannot read properties of undefined (reading 'getItem')`.** O Node tem um `localStorage`
  próprio, experimental, que tapa o do jsdom. A CI usa Node 24 e passa. Não é bug do
  componente (medido em 04/10/2026, falha igual na `main`): rode com
  `NODE_OPTIONS=--no-experimental-webstorage bunx vitest run ...`.
- ⚠️ **O `tsconfig.json` do `ui` exclui stories e testes.** O
  `bunx tsc --noEmit -p .` pode passar mesmo com story inválida (por exemplo, `Message`
  sem `args.from`). Ao alterar stories/testes, confira também esses arquivos com uma
  configuração temporária que estenda a do pacote e sobrescreva `include`/`exclude`.
  Ela precisa também de `"rootDir": "../.."` (senão sai um `TS6059` por arquivo do `logic`),
  `"composite": false` e `"types": ["vitest/globals", "@testing-library/jest-dom"]`. ⚠️ Medido
  em 03/10/2026: **43 stories/testes já têm erro de tipo na `main`**. Compare a contagem por
  arquivo antes e depois da sua mudança, em vez de esperar zero. Para checar só a pasta do
  componente:
  `{"extends":"./tsconfig.json","compilerOptions":{"noEmit":true,"composite":false,"incremental":false,"rootDir":"../..","types":["@testing-library/jest-dom/vitest"]},"include":["<pasta do componente>/**/*"],"exclude":[]}`.
- ⚠️ **`vi.restoreAllMocks()` no Vitest 2 pode resetar os `vi.fn` do setup global.**
  Nos testes de `message`, isso apagou a implementação do `ResizeObserver` entre casos
  e fez o tooltip falhar com `resizeObserver.observe is not a function`. Restaure só
  os spies criados pelo teste com `spy.mockRestore()`.
- ⚠️ **`turbo run type-check` no `ui` depende do build do `logic`** (`dependsOn: ["^build"]`).
  Rodar `bun run type-check` direto dentro de `packages/ui`, fora do turbo, falha se o `dist`
  do `logic` não existir.
- ⚠️ **Importar do barrel `@/components/organisms` quebra o Vitest** com `Unknown file
  extension ".css"`: o barrel puxa `message.tsx`, que importa `katex.min.css`. Em teste e em
  block, importe o organism pelo caminho direto (`@/components/organisms/script-editor`).
- ⚠️ **Edge do React Flow não aparece em teste jsdom** se o node não vier com `measured`
  (width/height) **e** `handles` explícitos: o `ResizeObserver` mockado no `setup.ts` nunca
  dispara, então o React Flow nunca mede os handles. Ver `organisms/edge/edge.test.tsx`.
- ⚠️ **`CalendarPopover` e `CalendarRange` estouram timeout na suíte inteira do `ui`** com a
  máquina carregada (35 s, medido em 26/09/2026) e passam rodados sozinhos. Antes de caçar bug,
  rode `bunx vitest run <arquivo>` isolado. ⚠️ **Com `--coverage` o estouro pega mais gente**
  (o `DashboardHeader`, que abre dropdown do Radix, e o block `flowtomic-dashboard`, medido em
  27/09/2026) e, com teste falhando, o relatório de cobertura **nem é gravado**. Só subir o
  timeout não basta: em 03/10/2026 o menu do `StatCard` estourou 30 s na suíte com cobertura e
  passava em 0,3 s sozinho. O que resolve é limitar o paralelismo (`--minWorkers=1
  --maxWorkers=4`; o Vitest 2 recusa `--maxWorkers` sozinho com `minThreads and maxThreads must
  not conflict`) — de quebra, a medição caiu de 205 s para 108 s.
- ⚠️ **Componente só usa token semântico** (`DESIGN.md`, *The Token-Only Rule*). Cor de paleta
  (`gray-900`), hex, `rgba()` e a escala crua do `theme.css` (`bg-brand-600`) quebram o
  `theme-tokens.test.ts`. A escala crua é traiçoeira: no Storybook `bg-brand-600` saía
  **transparente, sem erro** — o botão Enviar do `chat-input` era branco no branco.
- ⚠️ **`cn("text-display-lg", "text-foreground")` apaga o tamanho.** O merge de classes não
  conhece os tamanhos próprios do tema (`text-display-*`), acha que são cor e deixa só a última.
  Vale para o `clsx`+`tailwind-merge` antigo e para o pacote `cn` (medido em 03/10/2026, os dois
  dão o mesmo resultado). `shadow-xs shadow-skeumorphic` também não se fundem. Ao passar tamanho
  `display` por `className`, não junte com cor de texto no mesmo `cn`.
- ⚠️ **Token novo no `:root` precisa do `--color-*` no bloco `@theme inline` do `globals.css`**,
  senão a classe não gera CSS. Os `*-hover` ficaram assim até 26/09/2026
  (`hover:bg-success-hover` do Button não fazia nada).
- ⚠️ **Painel escuro nos dois modos (terminal, log) usa a classe `dark` no próprio elemento**,
  não `bg-foreground text-background` — esse par inverte e vira painel branco no modo escuro.
  ⚠️ Isso só funciona porque o bloco das `--color-*` no `globals.css` é `@theme inline`: sem o
  `inline`, o Tailwind resolve `var(--background)` uma vez no `:root` e o painel herda a cor
  clara (o terminal do `script-editor` saiu branco até 26/09/2026). Para provar no browser, **não**
  ligue `dark` no `<html>` — isso mascara o bug; meça o painel com a página clara.
- ⚠️ **`--chart-1`…`--chart-5` não existem no tema.** O config padrão dos gráficos apontava
  pra eles e as séries saíam pretas, sem erro. Gráfico usa token semântico
  (`var(--primary)`, `var(--muted-foreground)`); os testes dos charts travam isso.
- ⚠️ **`ResponsiveContainer` do Recharts nunca renderiza os filhos no jsdom**: ele espera medir
  o layout, e o jsdom mede tudo como zero. Tooltip e legenda somem do teste sem erro. No arquivo
  de teste, troque só ele por um repassador via `vi.mock("recharts", importOriginal)` (ver
  `atoms/data-display/chart/chart.test.tsx`). ⚠️ No recharts 3.7, nem assim saem rótulo de eixo,
  tooltip e legenda: para conferir formatador, mocke também `XAxis`/`Tooltip`/`Legend` registrando
  as props e chame o formatador direto (ver `molecules/data-display/chart-bar-interactive`).
- ⚠️ **Screenshot de gráfico Recharts sai pela metade com o browser pane escondido.** A
  animação para quando a aba não está visível. Para provar, use Playwright headless com uma
  espera de ~3 s antes do `screenshot`.
- ⚠️ **`verify.mjs list` corta em 50 ids.** Para a lista inteira, leia
  `http://localhost:6006/index.json` direto.
- ⚠️ **O shell é zsh: `for id in $ids` não quebra a string em palavras.** O loop roda uma vez
  só, sem erro, e os screenshots ficam velhos. Use array (`ids=(a b c)`).
- ⚠️ **Teste que espera animação de saída do motion fica instável na suíte inteira.** O
  `waitFor` padrão espera 1 s e, com a máquina cheia, a saída passa disso (o `AnimatedModal` e
  o `MenuDock` passavam sozinhos e falhavam juntos). No arquivo de teste, ligue
  `MotionGlobalConfig.skipAnimations = true` no `beforeAll` e desligue no `afterAll`.
- ⚠️ **Mockar `matchMedia` não liga o `useReducedMotion()` do motion em teste**: o motion lê a
  preferência uma vez e guarda. Componente que respeita movimento reduzido usa o critério do
  `sliding-number`: `useReducedMotion() || useContext(MotionConfigContext).reducedMotion ===
  "always"`, e o teste envolve a peça em `<MotionConfig reducedMotion="always">`.
- ⚠️ **`FormControl` só nomeia o campo se o filho DIRETO for o controle.** Ele é um `Slot` que
  passa `id`/`aria-*` ao filho; se o filho é Fragment, `div` ou `Select.Root`, o `<label for>`
  aponta para o nada e o leitor de tela lê um campo sem nome (checkbox, switch, slider e select
  do `form-layout` ficaram assim até 03/10/2026). Envolva o controle em si.
- ⚠️ **Prop com nome de atributo nativo vira interseção impossível.** `ComponentProps<"iframe"> &
  { loading?: ReactNode }` cruza com o `loading: "eager" | "lazy"` do iframe e não aceita nenhum
  elemento; o mesmo aconteceu com o `captionLayout` do `Calendar`. Tire o nativo antes:
  `Omit<ComponentProps<"iframe">, "loading">` (ou um Omit distributivo, se o tipo for união).
- ⚠️ **Escrever `.value` direto num campo controlado não chega ao `onChange` do React**, mesmo
  disparando `input` depois. Use o setter nativo (`Object.getOwnPropertyDescriptor(
  HTMLTextAreaElement.prototype, "value").set.call(el, v)`) — ver o ditado do `prompt-input`.
- ⚠️ **A área editável do TipTap não tem papel nem nome**: o `aria-label` passado ao `TextEditor`
  ia para o wrapper. O `TextEditor` agora põe `role="textbox"`, `aria-multiline` e o rótulo via
  `editorProps.attributes`. Em teste, a área monta depois do primeiro render: use `findByRole`.
- ⚠️ **`DialogContent` sem `DialogDescription` faz o Radix avisar em todo uso.** Quando não há
  descrição, passe `aria-describedby={undefined}` explícito (ver `organisms/model-selector`).
- ⚠️ **Todo import local de componente precisa de uma regra no `flowtomic-cli add`, senão a
  instalação sai com exit 1.** O rewriter (`cli/src/utils/component-imports.ts`) aceita: componente
  do mapa (só arquivos listados em `files`), barrel de `components/`, e as pastas de
  `SHARED_DIRS` (`lib/` e `types/`), que vão para a pasta do alias de `utils` (`types/` dentro
  dela). Arquivo novo importado por `./x` precisa entrar em `files` do `component-map.ts`; pasta
  nova em `packages/ui/src` fora de `components/` precisa entrar em `SHARED_DIRS`. O
  `install-imports.test.ts` instala cada entrada do mapa e reprova import sem arquivo (até
  09/10/2026, `data-table` e `widget-renderer` instalavam com exit 0 e import quebrado).
  ⚠️ O `registry/build-registry.ts` **ainda não** leva esses helpers no JSON do shadcn.
- ⚠️ **`layout` do motion num elemento inline não faz o texto vizinho deslizar**: a animação é
  por `transform`, então o vizinho pula de uma vez (medido em 04/10/2026 no `rotating-text`: 9 px
  num quadro). Para o vizinho acompanhar, meça a largura nova e anime `width` de verdade. Para
  provar, leia a posição do vizinho a cada `requestAnimationFrame` com Playwright.
- ⚠️ **`filter` (ex.: `drop-shadow`) no mesmo elemento que tem `transform-style: preserve-3d`
  achata o 3D**: todas as camadas caem no mesmo plano, sem erro (medido em 05/10/2026 no
  `depth-text`, camadas com o mesmo `getBoundingClientRect`). Ponha o filtro num ancestral fora da
  cadeia 3D. Teste unitário não pega isso; meça a posição das camadas no browser.
- ⚠️ **As fontes do `globals.css` são pedidas como faixa variável** (`wght@100..900`,
  `wght@400..900`), desde 05/10/2026. Antes eram pesos soltos (`wght@400;600`): o Google mandava
  faces fixas, peso intermediário pulava de degrau e `font-display` em peso 400 caía no fallback no
  print headless. Não volte para lista de pesos; o `theme-tokens.test.ts` trava a faixa.
- ⚠️ **O dnd-kit anuncia em inglês por padrão** ("press the space bar"). Todo `DndContext` passa
  `accessibility={{ announcements, screenReaderInstructions }}` em português — ver
  `organisms/draggable-dashboard-grid`. E `onKeyDown` próprio depois de `{...listeners}`
  sobrescreve o do sensor de teclado: o arrasto por teclado morre sem erro.
- ⚠️ **Clique em gatilho de `NavigationMenu` (Radix) fica instável com a máquina carregada**: o
  `userEvent.click` simula hover antes, e o Radix abre o menu sozinho 200 ms depois do hover.
  Se o timer vence antes do clique, o clique alterna para o lado errado (medido em 03/10/2026,
  só com `--coverage`). Use `userEvent.setup({ skipHover: true })`, como em
  `atoms/navigation/navigation-menu/navigation-menu.test.tsx`.
- ⚠️ **`verify.mjs story|smoke` dá `Timeout 15000ms` em story de modal** (o
  `EditChatMessageModal`, por exemplo). Não é story quebrada: o `Dialog` abre num portal
  fora do `#storybook-root`, que o driver espera ver preenchido. Para provar, use Playwright
  com espera fixa e screenshot da página inteira. O mesmo falso alarme vem de story que de
  propósito não renderiza nada (`AuthFormErrorMessage--no-message`).
- ⚠️ **`pgrep -f '<padrão>'` dentro de um laço de espera acha o próprio laço.** O
  `until ! pgrep -f 'codex exec…'` ficou "rodando" para sempre depois que o worker já tinha
  saído, porque o padrão estava na linha de comando do próprio shell. É a mesma raiz do
  `pkill` do `run-flowtomic`: espere pelo PID (`while kill -0 $pid`), não pelo padrão.
- ⚠️ **Todo `<svg>` dentro de algo com `buttonVariants` sai com 16 px.** O `[&_svg]:size-4` do
  `Button` vale para qualquer SVG descendente e ganha de classe (`size-full` não resolve). Desenho
  que cobre o botão inteiro (o pavio do `undo-fuse-button`, medido em 09/10/2026) passa
  `width`/`height` por `style` inline. O jsdom não acusa: o teste passa e o desenho some no browser.
- ⚠️ **Trocar o config do `useSpring` do motion num render (mola de "ligar" e de "soltar") prende o
  valor no alvo antigo.** Os `pointermove` chegam antes do render que troca o config, e a mola recriada
  fica no alvo do evento anterior (medido em 09/10/2026 no `magnetic`: o botão parava a 4,9 px em vez
  de 24 px). Anime o `MotionValue` com `animate(value, alvo, mola)` a cada evento. O jsdom não acusa,
  porque com `skipAnimations` a mola pula direto; meça o `transform` no browser ao longo do tempo.
- ⚠️ **SVG com `viewBox` fixo e `preserveAspectRatio="none"` estica forma e rotação.** Num quadro
  16:9, um círculo de raio igual nos dois eixos do viewBox sai elipse, e `transform="rotate()"` entorta
  a forma (medido em 10/10/2026 no `orbit-images`). Meça a área (ResizeObserver), corrija os raios pela
  proporção e gire em espaço de pixels. O jsdom não acusa; confira o `getBoundingClientRect` no browser.
- ⚠️ **`vi.useFakeTimers()` não move o `animate()` do motion.** O motion guarda o
  `requestAnimationFrame` quando o módulo carrega, antes do fake entrar, então a mola fica parada
  sem erro (medido em 10/10/2026 no modo `step` do `ring-carousel`). Para testar animação por mola,
  use timers reais com duração curta e `waitFor`; o `useFrameLoop` próprio continua aceitando fake.
- ⚠️ **`--accent` e `--secondary` não servem de cor de brilho.** São quase brancos no tema claro e
  escuros no escuro: bolinha `bg-accent` sumia na barra clara do `goo-tabs` e o anel do
  `edge-glow-card` apagava no modo escuro (medido em 10/10/2026). Para luz e partícula, use
  `--primary` e variações com `color-mix(in oklch, var(--primary), var(--foreground) N%)`.
- ⚠️ **Filtro de gosma (blur + corte de alfa) apaga forma pequena.** Com `stdDeviation` 8 e matriz
  de alfa `20 -8`, bolinhas de 12 px sumiam por inteiro; com 4 e `18 -7` aparecem e ainda fundem.
- ⚠️ **Superfície arrastável precisa de `select-none`.** Sem ele, o arraste por ponteiro seleciona o
  texto da linha (visto no `swipe-actions-row` em 09/10/2026). O jsdom não acusa; só aparece no browser.
- ⚠️ **Seta em `RadioGroup` do Radix não escolhe com `userEvent.keyboard` no jsdom.** O Radix só
  confirma o item focado enquanto a seta ainda está pressionada, e o `keyup` do `userEvent` chega
  antes do foco assentar (medido em 09/10/2026 no `swell-chip-group`, `lift-rating` e
  `elastic-segment`). Use `fireEvent.keyDown` + `waitFor`, ou `{ArrowRight>}` … `{/ArrowRight}`.
- ⚠️ **`verify.mjs --click "<nome>"` não acha aba do Radix** — o locator procura `button`, e
  `TabsTrigger` é `role="tab"`. Para clicar numa aba, use o browser pane (`find` + `left_click`).
- ⚠️ **PR empilhado (base em outra branch) não roda CI, nem depois de trocar a base.** Medido em
  03/10/2026: o #42 tinha base `feat/chatbot-template` (sem checks); com o #41 mergeado e a base
  trocada para `main` (`gh pr edit --base main`), continuou sem checks e ainda virou `CONFLICTING`.
  Só depois de `git merge origin/main` + push na branch dele a CI rodou. E o repo **não permite
  auto-merge**: mergear é à mão, depois de conferir a CI.
- ⚠️ **Numa worktree, o `up.sh` pode devolver o Storybook de outro checkout.** Ele só olha se
  a 6006 responde (`"already":true`), não de qual pasta o processo veio — e a story nova da
  worktree não existe lá. Confira com `readlink /proc/$(lsof -ti:6006)/cwd`; se for outro
  checkout, suba o da worktree em outra porta (`bunx storybook dev -p 6106 --config-dir
  .storybook --no-open --ci`, com `setsid nohup` para não morrer com o shell) e rode o driver
  com `SB_URL=http://localhost:6106`.

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

