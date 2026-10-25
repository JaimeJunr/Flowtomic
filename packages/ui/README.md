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
quando o bundler resolve os módulos, mesmo antes do tree-shaking. Os componentes importam o arquivo do componente, nunca um barrel de categoria
(verificado por `packages/ui/src/architecture/no-category-barrel-imports.test.ts`). Estes arquivos
ESM ainda têm imports relativos sem extensão: em Node puro, o import por componente
pode falhar; use um bundler com resolução de diretórios/extensões.

### Peers por família

A tabela foi gerada por `bun run scripts/peer-table.ts` a partir do `dist` (depois de `bun run build`): para cada componente, o fecho de imports externos que o bundler do consumidor resolve, sem contar `react` e `react-dom`. `motion` e `lucide-react` estão em quase todos os componentes e são peers do app. Quando a tabela e o código divergirem, a tabela está errada: regere-a.

| Componentes | Peers externos alcançados (além de `react`/`react-dom`) |
| --- | --- |
| `animated-3d`, `animated-list`, `aurora-glow`, `backdrop-blur`, `bento-glow-grid`, `blur-text`, `branch-nav`, `card-cycle`, `circular-text`, `click-spark`, `color-spotlight-grid`, `contour-lines`, `corner-rays`, `count-up`, `crosshair`, `cursor-grid`, `cursor-trail`, `curved-loop`, `depth-text`, `dither-waves`, `drift-lines`, `drift-wall`, `echo-text`, `edge-glow-card`, `electric-border`, `elevation-map`, `encrypted-text`, `evasive-target`, `expand-panels`, `fade-in-view`, `fan-cards`, `fiber-tunnel`, `fill-pill-nav`, `film-grain`, `folder-picker`, `fuzzy-text`, `glare-hover`, `glide-tooltip`, `glitch-text`, `glow-orb`, `glyph-terminal`, `goo-tabs`, `gradient-text`, `grain-gradient`, `grid-loader`, `helix-gallery`, `iridescent-foil`, `layered-menu`, `light-beams`, `light-blinds`, `light-column`, `lightning-bolts`, `liquid-gauge`, `liquid-metal`, `logo-marquee`, `magnet-lines`, `magnetic`, `marquee-menu`, `masonry-grid`, `metric-strip`, `neon-bends`, `option-wheel`, `orbit-images`, `paper-folder`, `particle-text`, `peel-sticker`, `photo-trail`, `pill-burst-menu`, `pixel-card`, `pixel-reveal`, `plasma-ribbons`, `prism-glow`, `proximity-nav`, `pulse-grid`, `radar-sweep`, `ring-carousel`, `rotating-text`, `satin-plasma`, `scan-tunnel`, `scroll-expand-media`, `scroll-velocity`, `scrub-number-field`, `shimmer`, `shred-list`, `silk-waves`, `spectral-burst`, `split-flap-text`, `spotlight-card`, `stacking-cards`, `star-border`, `star-warp`, `swipe-actions-row`, `swipe-stack`, `swirl-paint`, `target-cursor`, `task-status-mark`, `tear-off-ticket`, `tech-text`, `text-pressure`, `thread-bundle`, `tilted-card`, `trail-dial`, `true-focus`, `turn-card`, `variable-proximity`, `velvet-veil` | motion |
| `alert`, `auth-form-error-message`, `auth-navigation-link`, `avatar`, `badge`, `bar-chart`, `button-group`, `card`, `circular-progress-chart`, `dashboard-layout`, `date-input`, `empty`, `glass-surface`, `input`, `kbd`, `loader`, `progress`, `skeleton`, `table`, `textarea`, `time-input`, `typography`, `widget-renderer` | nenhum |
| `announcement-bar`, `curved-input`, `depth-rail-carousel`, `dictation-button`, `dome-gallery`, `elastic-slider`, `expanding-card-nav`, `fuse-toast`, `generation-frame`, `menu-dock`, `pull-send-button`, `slide-to-confirm`, `thinking-line`, `tool-call-chip`, `tool-status-line` | lucide-react, motion |
| `chat-input`, `dashboard-header-actions`, `day-timeline`, `edit-mode-toggle`, `env-diff`, `image-dropzone`, `pagination`, `project-list`, `reminder-card`, `site-footer`, `snippet`, `team-member-list`, `testimonial-wall`, `theme-toggle-button`, `undo-fuse-button` | @radix-ui/react-slot, lucide-react, motion |
| `button`, `dashboard-movements-section`, `hold-button`, `inline-datetime-editor`, `input-group`, `profile-card`, `social-login-buttons`, `stepper` | @radix-ui/react-slot, motion |
| `link-tile-grid`, `monthly-summary`, `native-select`, `password-input`, `spinner`, `widget-resize-handle` | lucide-react |
| `canvas`, `controls`, `edge`, `node`, `panel`, `toolbar` | @xyflow/react |
| `chart`, `chart-area-interactive`, `chart-bar-interactive` | recharts |
| `edit-chat-message-modal`, `process-steps`, `widget-config-modal` | @radix-ui/react-dialog, @radix-ui/react-slot, lucide-react, motion |
| `like-button`, `notify-toggle` | @radix-ui/react-toggle, lucide-react, motion |
| `animated-sliding-number`, `sliding-number` | motion, react-use-measure |
| `install-command`, `live-transcript` | @radix-ui/react-select, @radix-ui/react-slot, lucide-react, motion |
| `dialog`, `sheet` | @radix-ui/react-dialog, lucide-react |
| `hover-card`, `inline-citation` | @radix-ui/react-hover-card |
| `elastic-segment`, `swell-chip-group` | @radix-ui/react-radio-group, motion |
| `sidebar`, `sidebar-navigation` | @flowtomic/logic, @radix-ui/react-dialog, @radix-ui/react-separator, @radix-ui/react-slot, @radix-ui/react-tooltip, @react-aria/tooltip, @react-stately/tooltip, lucide-react, motion |
| `sources`, `task` | @radix-ui/react-collapsible, lucide-react |
| `document-editor`, `text-editor` | @flowtomic/logic, @radix-ui/react-popover, @radix-ui/react-separator, @radix-ui/react-slot, @radix-ui/react-tabs, @radix-ui/react-tooltip, @react-aria/tooltip, @react-stately/tooltip, @tiptap/extension-color, @tiptap/extension-image, @tiptap/extension-placeholder, @tiptap/extension-text-align, @tiptap/extension-text-style, @tiptap/react, @tiptap/starter-kit, lucide-react, motion, streamdown, tiptap-markdown |
| `dashboard-header`, `open-in-chat` | @radix-ui/react-dropdown-menu, @radix-ui/react-slot, lucide-react, motion |
| `context-menu` | @radix-ui/react-context-menu, lucide-react |
| `dropdown-menu` | @radix-ui/react-dropdown-menu |
| `code-block` | @radix-ui/react-slot, lucide-react, motion, shiki |
| `calendar` | @radix-ui/react-slot, lucide-react, motion, react-day-picker |
| `carousel` | @radix-ui/react-slot, embla-carousel-react, lucide-react, motion |
| `qr-code` | qr-code-styling |
| `separator` | @radix-ui/react-separator |
| `alert-dialog` | @radix-ui/react-alert-dialog, @radix-ui/react-slot, lucide-react, motion |
| `popover` | @radix-ui/react-popover |
| `sonner` | lucide-react, sonner |
| `tooltip` | @radix-ui/react-tooltip, @react-aria/tooltip, @react-stately/tooltip, motion |
| `cascade-code-input` | input-otp, motion |
| `checkbox` | @radix-ui/react-checkbox, lucide-react |
| `field` | @radix-ui/react-label, @radix-ui/react-separator |
| `form` | @radix-ui/react-label, @radix-ui/react-slot, react-hook-form |
| `input-otp` | input-otp, lucide-react |
| `label` | @radix-ui/react-label |
| `lift-rating` | @radix-ui/react-radio-group, lucide-react, motion |
| `radio-group` | @radix-ui/react-radio-group, lucide-react |
| `select` | @radix-ui/react-select, lucide-react |
| `slider` | @radix-ui/react-slider |
| `stretch-switch` | @radix-ui/react-switch, motion |
| `strike-checkbox` | @radix-ui/react-checkbox, motion |
| `switch` | @radix-ui/react-switch |
| `toggle` | @radix-ui/react-toggle |
| `wave-bar-slider` | @radix-ui/react-slider, motion |
| `accordion` | @radix-ui/react-accordion, lucide-react |
| `aspect-ratio` | @radix-ui/react-aspect-ratio |
| `collapsible` | @radix-ui/react-collapsible |
| `drawer` | vaul |
| `resizable` | lucide-react, react-resizable-panels |
| `scroll-area` | @radix-ui/react-scroll-area |
| `toggle-group` | @radix-ui/react-toggle, @radix-ui/react-toggle-group |
| `breadcrumb` | @radix-ui/react-slot, lucide-react |
| `command` | cmdk, lucide-react |
| `menubar` | @radix-ui/react-menubar, lucide-react |
| `navigation-menu` | @radix-ui/react-navigation-menu, lucide-react |
| `tabs` | @flowtomic/logic, @radix-ui/react-tabs, motion |
| `animated-modal` | @radix-ui/react-dialog, lucide-react, motion |
| `button-counter` | @radix-ui/react-slot, motion, react-use-measure |
| `code-tabs` | @radix-ui/react-radio-group, @radix-ui/react-slot, @radix-ui/react-tabs, lucide-react, motion, shiki |
| `artifact` | @radix-ui/react-slot, @radix-ui/react-tooltip, @react-aria/tooltip, @react-stately/tooltip, lucide-react, motion |
| `bubble` | @radix-ui/react-slot |
| `calendar-popover` | @radix-ui/react-popover, @radix-ui/react-slot, date-fns, lucide-react, motion, react-day-picker |
| `calendar-range` | @radix-ui/react-popover, @radix-ui/react-slot, @radix-ui/react-tooltip, @react-aria/tooltip, @react-stately/tooltip, date-fns, lucide-react, motion, react-day-picker |
| `chat-message` | @radix-ui/react-dropdown-menu, @radix-ui/react-slot, @radix-ui/react-tooltip, @react-aria/tooltip, @react-stately/tooltip, harden-react-markdown, katex, lucide-react, motion, react-markdown, rehype-katex, remark-gfm, remark-math, shiki |
| `checkpoint` | @radix-ui/react-separator, @radix-ui/react-slot, @radix-ui/react-tooltip, @react-aria/tooltip, @react-stately/tooltip, lucide-react, motion |
| `comparison-table` | @flowtomic/logic, @radix-ui/react-tabs, @radix-ui/react-tooltip, @react-aria/tooltip, @react-stately/tooltip, lucide-react, motion |
| `data-table` | @flowtomic/logic, @radix-ui/react-checkbox, @radix-ui/react-select, @radix-ui/react-slot, @tanstack/react-table, lucide-react, motion |
| `message` | @radix-ui/react-slot, @radix-ui/react-tooltip, @react-aria/tooltip, @react-stately/tooltip, ai (só tipos), harden-react-markdown, katex, lucide-react, motion, react-markdown, rehype-katex, remark-gfm, remark-math, shiki |
| `stat-card` | @flowtomic/logic, @radix-ui/react-dropdown-menu, @radix-ui/react-slot, lucide-react, motion |
| `status-list` | @radix-ui/react-accordion, @radix-ui/react-tooltip, @react-aria/tooltip, @react-stately/tooltip, lucide-react, motion |
| `suggestion` | @radix-ui/react-scroll-area, @radix-ui/react-slot, motion |
| `time-tracker` | @flowtomic/logic, @radix-ui/react-slot, lucide-react, motion |
| `tool` | @radix-ui/react-collapsible, @radix-ui/react-slot, ai (só tipos), lucide-react, motion, shiki |
| `draggable-widget` | @dnd-kit/core, @dnd-kit/utilities, lucide-react |
| `confirmation` | @radix-ui/react-slot, ai (só tipos), motion |
| `connection` | @xyflow/react (só tipos) |
| `autocomplete` | @flowtomic/logic, @radix-ui/react-popover, lucide-react |
| `combobox` | @base-ui/react, @radix-ui/react-slot, lucide-react, motion |
| `glide-picker` | @radix-ui/react-dropdown-menu, lucide-react, motion |
| `item` | @radix-ui/react-separator, @radix-ui/react-slot |
| `numeric-filter-field` | @radix-ui/react-select, lucide-react, react-number-format |
| `chain-of-thought` | @radix-ui/react-collapsible, @radix-ui/react-use-controllable-state, lucide-react |
| `chat-log` | @radix-ui/react-dropdown-menu, @radix-ui/react-slot, @radix-ui/react-tooltip, @react-aria/tooltip, @react-stately/tooltip, harden-react-markdown, katex, lucide-react, motion, react-markdown, rehype-katex, remark-gfm, remark-math, shiki, use-stick-to-bottom |
| `context` | @radix-ui/react-hover-card, @radix-ui/react-slot, ai (só tipos), motion, tokenlens |
| `conversation` | @radix-ui/react-slot, lucide-react, motion, use-stick-to-bottom |
| `draggable-dashboard-grid` | @dnd-kit/core, @dnd-kit/utilities, @flowtomic/logic, lucide-react |
| `faq-section` | @radix-ui/react-accordion, @radix-ui/react-slot, lucide-react, motion |
| `feature-tabs` | @radix-ui/react-tabs, lucide-react, motion |
| `form-layout` | @radix-ui/react-checkbox, @radix-ui/react-label, @radix-ui/react-popover, @radix-ui/react-radio-group, @radix-ui/react-select, @radix-ui/react-separator, @radix-ui/react-slider, @radix-ui/react-slot, @radix-ui/react-switch, @radix-ui/react-toggle, @radix-ui/react-tooltip, @react-aria/tooltip, @react-stately/tooltip, date-fns, input-otp, lucide-react, motion, react-day-picker, react-hook-form, react-number-format |
| `genealogy-canvas` | @flowtomic/logic, @xyflow/react, lucide-react |
| `image` | ai (só tipos) |
| `model-selector` | @radix-ui/react-dialog, cmdk, lucide-react |
| `plan` | @radix-ui/react-collapsible, @radix-ui/react-slot, lucide-react, motion |
| `pricing-table` | @radix-ui/react-slot, @radix-ui/react-toggle, @radix-ui/react-toggle-group, lucide-react, motion, react-use-measure |
| `prompt-input` | @radix-ui/react-dropdown-menu, @radix-ui/react-hover-card, @radix-ui/react-popover, @radix-ui/react-select, @radix-ui/react-slider, @radix-ui/react-slot, ai (só tipos), cmdk, lucide-react, motion, nanoid |
| `questionnaire` | @radix-ui/react-radio-group, @radix-ui/react-slot, lucide-react, motion |
| `queue` | @radix-ui/react-collapsible, @radix-ui/react-scroll-area, @radix-ui/react-slot, lucide-react, motion |
| `reasoning` | @radix-ui/react-collapsible, @radix-ui/react-use-controllable-state, lucide-react, motion, streamdown |
| `resizable-layout` | @flowtomic/logic, lucide-react, react-resizable-panels |
| `routing-diagram` | @radix-ui/react-tabs, motion |
| `script-editor` | @flowtomic/logic, lucide-react |
| `site-header` | @radix-ui/react-dialog, @radix-ui/react-navigation-menu, @radix-ui/react-slot, lucide-react, motion |
| `stats-grid` | @flowtomic/logic |
| `web-preview` | @radix-ui/react-collapsible, @radix-ui/react-slot, @radix-ui/react-tooltip, @react-aria/tooltip, @react-stately/tooltip, lucide-react, motion |
| `widget-palette` | @dnd-kit/core, lucide-react |

TipTap precisa de versões alinhadas **`^3.31.4`**: `@tiptap/core`, `@tiptap/pm`,
`@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-color`,
`@tiptap/extension-image`, `@tiptap/extension-placeholder`,
`@tiptap/extension-text-align` e `@tiptap/extension-text-style`.

```bash
bun add @tiptap/core@^3.31.4 @tiptap/pm@^3.31.4 @tiptap/react@^3.31.4 @tiptap/starter-kit@^3.31.4 @tiptap/extension-color@^3.31.4 @tiptap/extension-image@^3.31.4 @tiptap/extension-placeholder@^3.31.4 @tiptap/extension-text-align@^3.31.4 @tiptap/extension-text-style@^3.31.4 tiptap-markdown@^0.9.0 streamdown
```

`@ai-sdk/*`, `undici` e `commander` não são imports diretos do UI: são transitivos de
terceiros, portanto não precisam ser declarados como peers do UI. O peer `ai` aceita
`>=6 <8`, a mesma faixa do `package.json`.

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
