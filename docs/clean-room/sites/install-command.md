# InstallCommand — spec clean room

Fonte observada: o hero de nextjs.org (redesenho de 10/2026), visto só na tela em 13/10/2026 e de
novo em 25/10/2026, no navegador do app (passando o ponteiro e clicando em copiar). Nenhum código,
CSS ou asset da página foi lido. Ver `README.md` desta pasta (candidato 23).

## O que se viu (resumo)

- Abaixo do título e da frase do hero, **a única ação é uma pílula com o comando**: `rounded-full`,
  borda fina, fundo um pouco mais claro que a página (no escuro), altura ~40 px.
- Dentro, em mono e numa linha: o **prompt `$`** em cinza, o comando em cor de texto, e no fim um
  **ícone de copiar** pequeno em cinza.
- Sem botão sólido competindo: a pílula **é** o botão de começar.

## Por que não é o `snippet`

O `atoms/code/snippet` já copia código, mas é um `<code>` com fundo `muted` (inline) ou um `<pre>`
(multiline): não tem prompt, não tem forma de pílula, não troca de gerenciador de pacotes e não tem
tamanho de hero. O `InstallCommand` é um atom próprio. **Não altere o `snippet`.**

## Composição

Atom `InstallCommand`, em `atoms/code/install-command/`.

### Pílula
- Raiz `div` com `inline-flex max-w-full items-center gap-2 rounded-full border border-border
  bg-card font-mono text-foreground`, `data-slot="install-command"`.
- Tamanhos (`size`): `sm` (`h-8 pl-3 pr-1 text-xs`), `md` (`h-10 pl-4 pr-1.5 text-sm`, padrão),
  `lg` (`h-12 pl-5 pr-2 text-base`, para hero).
- Prompt `$` (`prompt`, padrão `"$"`; `null` esconde): `text-muted-foreground select-none`,
  `aria-hidden`, para não ir junto quando a pessoa seleciona o texto na mão.
- Comando: `<code>` `min-w-0 truncate` (nunca estoura a pílula; o `title` mostra o comando inteiro)
  com `data-slot="install-command-text"`.
- Botão de copiar no fim: `Button` do repo `variant="ghost" size="icon"` arredondado
  (`rounded-full`), com `Copy` → `Check` por 2 s e `aria-label` "Copiar comando" → "Copiado".
  Falha do clipboard: ícone `X` por 2 s e `aria-live` "Não deu para copiar". `data-slot=
  "install-command-copy"`. Copia **só o comando**, sem o prompt.
- Uma região `aria-live="polite"` `sr-only` anuncia "Comando copiado".

### Gerenciador de pacotes (opcional)
- `managers` (lista de `"npm" | "pnpm" | "yarn" | "bun"`): mostra antes do prompt um seletor
  compacto com o nome do atual (`text-xs`, `Select` do repo ou um `button` com menu do Radix), e o
  comando exibido e copiado é traduzido para o gerenciador escolhido.
- Helper exportado e puro `toPackageManager(command, manager)`, que traduz só os formatos comuns:
  - `npx <pkg> [args]` → `pnpm dlx`, `yarn dlx`, `bunx`;
  - `npm install <pkgs>` / `npm i <pkgs>` → `pnpm add`, `yarn add`, `bun add` (com `-D` /
    `--save-dev` → `-D` em todos);
  - `npm run <script>` → `pnpm <script>`, `yarn <script>`, `bun run <script>`;
  - `npm create <x>` → `pnpm create`, `yarn create`, `bun create`;
  - qualquer outra coisa volta igual.
- `manager` / `defaultManager` / `onManagerChange` (controlado ou não; padrão o primeiro da lista).
- Com `persistManager`, lembra a escolha em `localStorage` (chave
  `"flowtomic:package-manager"`), em `try/catch`; várias pílulas na mesma página leem a mesma chave
  ao montar.

## API

```ts
type PackageManager = "npm" | "pnpm" | "yarn" | "bun";

type InstallCommandProps = Omit<ComponentProps<"div">, "children" | "onCopy"> & {
  command: string;                    // escrito no formato npm/npx
  prompt?: string | null;             // padrão "$"
  size?: "sm" | "md" | "lg";
  managers?: PackageManager[];
  manager?: PackageManager;
  defaultManager?: PackageManager;
  onManagerChange?: (manager: PackageManager) => void;
  persistManager?: boolean;
  onCopy?: (text: string) => void;
  onCopyError?: (error: unknown) => void;
  label?: string;                     // aria-label do grupo; padrão "Comando de instalação"
};
```

`data-slot`: `install-command` (com `data-size`), `install-command-manager`,
`install-command-prompt`, `install-command-text`, `install-command-copy`.

## Acessibilidade

- A raiz é `role="group"` com `aria-label`.
- O comando é texto real e selecionável (só o prompt não é).
- O seletor de gerenciador tem nome ("Gerenciador de pacotes").

## Estados que o teste deve cobrir

1. Renderiza o grupo nomeado com o prompt `$` (`aria-hidden`) e o comando; `prompt={null}` esconde o
   prompt.
2. Copiar escreve só o comando no clipboard, chama `onCopy`, troca o rótulo para "Copiado" e anuncia
   "Comando copiado"; volta depois do tempo (timers falsos funcionam aqui: não há `animate()` do
   motion).
3. Clipboard que rejeita chama `onCopyError` e anuncia "Não deu para copiar".
4. `toPackageManager`: os quatro formatos para cada gerenciador, `-D`/`--save-dev`, e um comando
   desconhecido volta igual.
5. Com `managers`, trocar para `pnpm` muda o texto exibido e o copiado; `onManagerChange` recebe o
   valor; controlado sem `manager` novo não muda.
6. `persistManager` grava e lê a chave; `localStorage` que lança erro não quebra o componente.
7. `size` muda `data-size`; o comando longo tem `title` com o texto inteiro.

## Story

`Flowtomic UI/Atoms/Code/InstallCommand`, `layout: "padded"`. Comandos reais do Flowtomic:
`npx flowtomic-cli add button` e `npm install @flowtomic/ui`.

- `Default`: `npx flowtomic-cli add button`.
- `Hero`: `size="lg"` centralizado abaixo de um título curto, como ação única da tela.
- `Gerenciadores`: `managers={["npm", "pnpm", "yarn", "bun"]}` com `npm install @flowtomic/ui`.
- `SemPrompt`: `prompt={null}`.
- `Longo`: comando comprido num contêiner de 280 px (truncado).
- `Escuro`: wrapper com a classe `dark`.
