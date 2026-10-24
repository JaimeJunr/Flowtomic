# Changelog

## [2.0.0] - 2026-10-12

### ⚠️ Breaking

- **Dependências por componente viram peers.** O app instala `react`/`react-dom` 19,
  `motion` (`>=12.23.24 <15`) e `lucide-react` (`>=0.553.0 <2`). Os demais peers são
  opcionais para o pacote e obrigatórios para as famílias que os importam; também
  ficam em `devDependencies` para build/teste. O bundle externaliza dependências e
  peers para compartilhar as bibliotecas do app.
- **Migração por família:** FAQ/accordion usam `@radix-ui/react-accordion`; StatusList
  usa também `@radix-ui/react-tooltip`, `@react-aria/tooltip` e `@react-stately/tooltip`;
  Button usa `@radix-ui/react-slot`; cada primitive Radix usa seu `@radix-ui/react-*`;
  tooltip usa também `@react-aria/tooltip` e `@react-stately/tooltip`. Chat/IA usa
  `ai@^6.0.304`; message usa Markdown, KaTeX e Shiki; code-block/code-tabs usam Shiki;
  editor usa os nove `@tiptap/*@^3.31.4`, `tiptap-markdown@^0.9.0` e `streamdown`.
  Tabelas/layouts usam `@flowtomic/logic` e seus peers; gráficos usam `recharts`;
  calendários usam `react-day-picker`/`date-fns`; formulários usam `react-hook-form`;
  canvas usa `@xyflow/react`; arrasto usa `@dnd-kit/*`. A [lista completa por
  componente](README.md#peers-por-família) inclui as outras famílias e o comando do FAQ.
- **Fontes do Google agora são opt-in.** Para manter as fontes remotas da marca,
  importe `@flowtomic/ui/styles/fonts.css`. `globals.css` preserva tokens e fallbacks,
  mas não baixa fontes. Apps com `next/font` ou fontes locais omitem o novo arquivo.
- **Prefira subpaths** (`@flowtomic/ui/components/organisms/faq-section`). O export
  raiz e os barrels de categoria reexportam famílias opcionais; a resolução desses
  módulos pode exigir seus peers. Imports relativos sem extensão no `dist` ainda
  exigem resolução por bundler (Refs #137, item ESM pendente).

### Fixed

- O TextEditor sincroniza `value` sem emitir `onChange`; mudanças do usuário continuam
  emitindo. Underline e Link do StarterKit 3 ficam desativados para preservar a API 1.x.
- Imports internos de atoms apontam diretamente para seus componentes, sem carregar
  peers de famílias alheias. A tabela inclui EnvDiff, MetricStrip e TestimonialWall.
- O CLI aceita `styles fonts` e inclui `@tiptap/core` e `@tiptap/pm` no TextEditor.
- O CSS legado `dist/index.css` mantém os estilos de KaTeX e React Flow por imports
  dos peers `katex` e `@xyflow/react`.

- `@radix-ui/react-accordion` e os demais pacotes usados em runtime que só estavam
  em devDependencies/na raiz agora têm peers explícitos no UI (#137).
- TipTap migra de 2.x para 3.31.4; o editor usa o export nomeado `TextStyle` e o
  storage tipado de Markdown. SDK de IA migra de 5.x para 6.0.304, resolvendo
  `@ai-sdk/gateway` 3.0.212, `@ai-sdk/provider-utils` 4.0.57 e `undici` 6.29.0 no lock,
  sem `@fastify/busboy`. KaTeX tem mínimo 0.16.22. O lock também unifica as versões
  transitivas de ProseMirror para evitar instâncias incompatíveis no editor.
- Dependências automáticas caem de 64 para 3: `cn`, `class-variance-authority` e
  `tw-animate-css`. Pacotes sem imports diretos ficam apenas no desenvolvimento;
  transitivos `@ai-sdk/*`, `undici` e `commander` não viram peers artificiais.
- As 11 asserções de conteúdo do CodeTabs consultam e verificam o DOM na mesma
  tentativa, evitando pegar um nó removido pelo realce assíncrono do Shiki.

## [1.3.0] - 2026-10-12

### Added

- **CodeTabs** (molecule): exemplos de código em abas (#124).
- **RoutingDiagram** (organism): diagrama de rotas com layout responsivo (#125).
- **ComparisonTable** (molecule) e **PricingTable** (organism): comparação de recursos e planos (#126).
- **StatusList** (molecule): lista de serviços com estado operacional (#128).
- **SiteHeader**, **AnnouncementBar** e **SiteFooter** (organisms): navegação, aviso e rodapé de sites (#130).
- **FaqSection** (organism): perguntas frequentes em accordion, com busca, contato e ajuste para telas estreitas (#131).

### Fixed

- **`text-display-*`**: `globals.css` importa `theme.css` na mesma compilação para gerar os utilitários de tipografia (#127).
- **Cores semânticas**: `globals.css` limpa os cinco namespaces legados do `theme.css` para `bg-primary`, `text-primary`, `border-primary` e `ring-primary` usarem `--primary` (#129).

## [1.1.1] - 2026-10-12

### Fixed

- **Import por componente sem o alias `@/`.** Os arquivos de `dist/components/**` (export
  `@flowtomic/ui/components/*`) e os `.d.ts` importavam `cn` de `"@/lib/utils"`, atalho que só
  existe dentro deste repositório. Quem instalava o pacote precisava criar o mesmo alias no
  bundler. O build agora troca o `@/` por caminho relativo e falha se sobrar algum.

## [1.0.0] - 2026-10-04

Alinhamento com o shadcn/ui ([changelog](https://ui.shadcn.com/docs/changelog)).

### ⚠️ Breaking

- **React 19 obrigatório.** `react` e `react-dom` em `^19.0.0` nas `peerDependencies`. Nenhum
  componente usa mais `forwardRef`: o `ref` é prop normal, e no React 18 ele não chega no elemento.
- **Tema em `oklch()`.** As variáveis do `globals.css` guardam a cor inteira
  (`--primary: oklch(0.5254 0.1599 38.05)`), não mais o valor solto do HSL (`16 80% 39%`). Quem
  sobrescreve o tema no formato antigo perde as cores. `hsl(var(--x))` vira `var(--x)`.
- **`cn` vem do pacote `cn`** (do shadcn). `clsx` e `tailwind-merge` saíram das dependências. O
  `lib/utils.ts` continua exportando `cn`.

### Added

- **`data-slot`** na raiz de todo componente exportado (atoms, molecules e organisms).
- **NativeSelect** (atom): o `<select>` do navegador com a cara do `Select`.
- **Combobox** (molecule): busca, teclado, limpar, grupos e escolha múltipla com chips. Primeiro
  componente em Base UI (`@base-ui/react`).

## [Unreleased]

### Added

- **DateInput** (atom): entrada de data com estilo do design system; estado desabilitado por overlay, preservando o ícone nativo do calendário.
- **TimeInput** (atom): entrada de hora com a mesma estratégia de estado desabilitado do `DateInput`.
- **CalendarPopover** (molecule): seletor de data única em popover, com bloqueio por função ou conjunto de datas e estados de carregamento.
- **CalendarRange** (molecule): seletor de intervalo de datas em popover, com atalhos de intervalo rápido e tooltip para datas desabilitadas.
- **InlineDateTimeEditor** (molecule): edição inline de data/hora em ISO-8601, com estado de edição controlado pelo parent.
- **NumericFilterField** (molecule): filtro numérico com operador (`eq`, `gt`, `lt`, `gte`, `lte`) e valor formatado (número, moeda BRL ou percentual).

## [0.7.0] - 2026-03-15

### Added

- **Button**: nova variante `toolbar` para uso em barras de ferramentas (estilo `bg-black/10 dark:bg-white/10`, ex.: integração Koda).
- **CodeBlock**: props opcionais `maxHeight` (px) e `showScrollbars` para controlar altura máxima e exibição de scrollbars.

### Changed

- Nenhuma alteração incompatível.

## [0.6.0] - 2026-03-04

### Added

- **InlineDateTimeEditor** (molecule): editor inline de data e hora; exibe valor formatado e, ao clicar, alterna para modo edição com inputs de data/hora e botões Salvar/Cancelar. Exporta helpers `isoToDateAndTime` e `dateAndTimeToIso`.
- **DateInput** (atom): campo de entrada para data (`input type="date"`) com estilo consistente; quando disabled, overlay bloqueia interação mantendo o ícone nativo do calendário visível.
- **TimeInput** (atom): campo de entrada para hora (`input type="time"`) com estilo consistente; quando disabled, overlay bloqueia interação mantendo o ícone nativo do relógio visível.

## [0.5.2] - 2026-03-01

### Changed

- **FormLayout**: documentação do tipo `date` — campo usa CalendarPopover com dropdown de mês e ano (navegação rápida); JSDoc da prop `disableFuture` atualizado.
- **FormLayout (stories)**: exemplos melhorados para clientes que usam a lib:
  - Submit externo correto: todas as stories que têm botão fora do form passam a usar `formId` e `form="{formId}"` no botão.
  - Objeto `defaultFormValues` reutilizável; tipo `FormData.birthDate` como `string | undefined`; descrição do componente menciona date com dropdown e uso de `formId`.
  - Nova story **DateFieldWithDropdown** demonstrando o campo de data com dropdown de mês/ano; remoção da story "Sem Uso Conhecido".
  - Stories CompactLayout e SimpleLayout com opções de select no formato `{ label, value }`; export `SimpleLayout` em PascalCase.

## [0.5.1] - 2026-03-01

### Fixed

- **AlertDialog**: garantia de visibilidade do conteúdo e do overlay quando consumido por apps que não utilizam `tailwindcss-animate` ou quando as animações não aplicam opacidade corretamente. Adicionada classe `data-[state=open]:opacity-100!` em `AlertDialogContent` e `AlertDialogOverlay` para que o diálogo permaneça visível com `data-state="open"`.

## [0.5.0] - 2026-03-01

### Added

- **NumericFilterField** (molecule): campo de filtro numérico com operador (=, >, <, ≥, ≤) e valor formatado; suporta número, moeda (BRL) e percentual.
- **FormLayout**: novo tipo de campo `numericFilter` com opções `allowNegative`, `isCurrency`, `isPercent`, `currency`; export do tipo `NumericFilterValue`.

### Changed

- **FormLayout**: correções e melhorias trazidas da ivt-lib:
  - Campos number/decimal/currency: valor vazio passa a ser `null` (em vez de `undefined`).
  - Estado de erro visual nos campos (borda/ring quando `fieldState.invalid`).
  - Descrição do campo exibida apenas quando não há erro.
  - Asterisco de obrigatório com estilo inline para evitar quebra de layout.
  - Radio: uso do componente `Label` com `htmlFor` para acessibilidade; `disabled ?? false`.
  - Select: `id` no SelectTrigger e `max-h` + overflow no SelectContent.
  - OTP: chaves estáveis com `useId()` (removido biome-ignore).
- **FormLayout**: novas props opcionais `onError?: (errors: unknown) => void` e `formRef?: React.RefObject<HTMLFormElement | null>`; `handleSubmit` repassa `onError`; formulário aceita `ref={formRef}`.
