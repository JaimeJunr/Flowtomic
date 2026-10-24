# @flowtomic/ui

Componentes UI do Flowtomic: atoms, molecules, organisms e blocks construídos sobre Radix UI e Tailwind CSS.

## Instalação

```bash
bun add @flowtomic/ui
# ou
npm install @flowtomic/ui
```

A partir da versão **2.0.0**, React 19 é obrigatório. Instale `react`, `react-dom`,
`motion` (`>=12.23.24 <15`) e `lucide-react` (`>=0.553.0 <2`) no app. Os demais peers
são opcionais para o pacote e necessários quando o componente escolhido os importa.
O npm não instala peers marcados como opcionais automaticamente.

Para usar somente o FAQ:

```bash
bun add @flowtomic/ui react@^19 react-dom@^19 motion lucide-react @radix-ui/react-accordion @radix-ui/react-slot
```

```tsx
import { FaqSection } from "@flowtomic/ui/components/organisms/faq-section";
```

Prefira o subpath do componente. O export raiz `@flowtomic/ui` e os barrels de
categoria reexportam todas as famílias; podem exigir os peers das outras famílias
quando o bundler resolve os módulos, mesmo antes do tree-shaking. Os componentes usam imports diretos dos atoms
para restringir a resolução às famílias utilizadas. Estes arquivos
ESM ainda têm imports relativos sem extensão: em Node puro, o import por componente
pode falhar; use um bundler com resolução de diretórios/extensões.

### Peers por família

Todos os componentes abaixo usam também os peers comuns e os peers Radix dos atoms
que compõem. `Button`, por exemplo, exige `@radix-ui/react-slot` e `motion`.

| Família / componente | Peers opcionais adicionais |
| --- | --- |
| `faq-section`, `accordion` | `@radix-ui/react-accordion`; FAQ também usa `@radix-ui/react-slot` |
| `status-list` | `@radix-ui/react-accordion`, `@radix-ui/react-tooltip`, `@react-aria/tooltip`, `@react-stately/tooltip` |
| `env-diff`, `testimonial-wall` | `@radix-ui/react-slot` via Button |
| `metric-strip` | Nenhum além dos peers comuns (`motion` via CountUp) |
| `button`, `breadcrumb`, `item`, `bubble`, `sidebar` | `@radix-ui/react-slot`; `sidebar` também usa `@flowtomic/logic` e os peers de `sheet`/`tooltip` |
| `alert-dialog`, `checkbox`, `collapsible`, `dialog`/`sheet`, `dropdown-menu`, `hover-card`, `label`, `popover`, `scroll-area`, `separator`, `tabs`, `toggle`, `toggle-group`, `aspect-ratio`, `context-menu`, `menubar`, `navigation-menu`, `radio-group`, `select`, `slider`, `switch` | O pacote `@radix-ui/react-<nome>` correspondente (`sheet` usa `react-dialog`, `label` usa `react-label`) |
| `tooltip` | `@radix-ui/react-tooltip`, `@react-aria/tooltip`, `@react-stately/tooltip` |
| `reasoning`, `chain-of-thought` | `@radix-ui/react-use-controllable-state`, peers de `collapsible`; `reasoning` também usa `streamdown` |
| `combobox` | `@base-ui/react` |
| `command` | `cmdk` |
| `drawer` | `vaul` |
| `resizable`, `resizable-layout` | `react-resizable-panels`; layout também usa `@flowtomic/logic` |
| `data-table`, `stat-card`, `stats-grid`, `autocomplete`, `dashboard-layout` | `@flowtomic/logic`; tabelas também usam `@tanstack/react-table`; instale os peers do Logic (`@tanstack/react-table`, `react-resizable-panels`) |
| `calendar`, `calendar-popover`, `calendar-range` e editores de data | `react-day-picker`, `date-fns` e peers de `popover`/`tooltip` |
| `carousel` | `embla-carousel-react` |
| `chart`, `chart-area-interactive`, `chart-bar-interactive` | `recharts` |
| `form`, `form-layout` | `react-hook-form`; layout também usa `react-number-format` |
| `input-otp`, `cascade-code-input` | `input-otp` |
| `numeric-filter-field` | `react-number-format` |
| `qr-code` | `qr-code-styling` |
| `sliding-number` | `react-use-measure` |
| `sonner` | `sonner` |
| `code-block`, `code-tabs` | `shiki` e peers dos atoms usados (`code-tabs` usa tabs/radio-group) |
| `chat-message` | `react-markdown` |
| `message` | `ai`, `react-markdown`, `harden-react-markdown`, `remark-gfm`, `remark-math`, `rehype-katex`, `katex`, `shiki` |
| `prompt-input`, `image`, `tool`, `confirmation`, `context` (tipos de IA) | `ai` (`^6.0.304`); prompt também usa `nanoid`, context usa `tokenlens`, tool usa `shiki` via code-block |
| `conversation`, `chat-log` | `use-stick-to-bottom` |
| `text-editor`, `document-editor` | Todos os pacotes TipTap da lista abaixo, `tiptap-markdown` (`^0.9.0`), `streamdown` e peers dos atoms da toolbar |
| `canvas`, `connection`, `node`, `edge`, `controls`, `panel`, `toolbar`, `genealogy-canvas` | `@xyflow/react` |
| `draggable-dashboard-grid` e arrasto dos widgets | `@dnd-kit/core`, `@dnd-kit/utilities` |

TipTap precisa de versões alinhadas **`^3.31.4`**: `@tiptap/core`, `@tiptap/pm`,
`@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-color`,
`@tiptap/extension-image`, `@tiptap/extension-placeholder`,
`@tiptap/extension-text-align` e `@tiptap/extension-text-style`.

```bash
bun add @tiptap/core@^3.31.4 @tiptap/pm@^3.31.4 @tiptap/react@^3.31.4 @tiptap/starter-kit@^3.31.4 @tiptap/extension-color@^3.31.4 @tiptap/extension-image@^3.31.4 @tiptap/extension-placeholder@^3.31.4 @tiptap/extension-text-align@^3.31.4 @tiptap/extension-text-style@^3.31.4 tiptap-markdown@^0.9.0 streamdown
```

`@ai-sdk/*`, `undici` e `commander` não são imports diretos do UI: são transitivos de
terceiros, portanto não precisam ser declarados como peers do UI. O SDK mínimo
suportado é `ai@6.0.304`; o lock de desenvolvimento resolve `@ai-sdk/gateway@3.0.212`,
`@ai-sdk/provider-utils@4.0.57` e `undici@6.29.0`, sem `@fastify/busboy`.

Somente `cn`, `class-variance-authority` e `tw-animate-css` continuam em
`dependencies`. As bibliotecas opcionais também ficam em `devDependencies` para
build e testes do repositório. As faixas completas dos peers estão no `package.json`.

## Estilos

Importe os três arquivos CSS, nesta ordem:

```ts
import "@flowtomic/ui/styles/globals.css";
import "@flowtomic/ui/styles/theme.css";
import "@flowtomic/ui/styles/typography.css";
```

O CSS padrão não faz requisições ao Google Fonts. Para carregar Public Sans,
Schibsted Grotesk e JetBrains Mono pelo Google, importe o arquivo opcional:

```ts
import "@flowtomic/ui/styles/fonts.css";
```

Quem hospeda fontes localmente ou usa `next/font` pode omitir esse arquivo.
Os tokens e fallbacks de tipografia continuam nos estilos padrão.

O export legado `@flowtomic/ui/dist/index.css` continua disponível para os estilos
do KaTeX e React Flow e exige os peers `katex` e `@xyflow/react`. Os estilos gerais estão em `styles/globals.css`.

## Uso

```tsx
import { Button } from "@flowtomic/ui/components/atoms/actions/button";

function Exemplo() {
  return <Button variant="default">Enviar</Button>;
}
```

## Alternativa: copiar o componente

Para editar o código do componente depois de instalado, use o CLI em vez do package:

```bash
bunx flowtomic-cli add button
```

## Identidade visual

Cor de marca Urucum (laranja-queimado). Fontes: Public Sans (texto), Schibsted Grotesk (títulos) e JetBrains Mono (valores).

## Repositório

https://github.com/JaimeJunr/Flowtomic
