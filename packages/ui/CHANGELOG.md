# Changelog

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
