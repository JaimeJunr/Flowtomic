# Spec de comportamento: `prompt-input-extras`

> **Proveniência (clean room).** Escrita em 09/10/2026 a partir da demo pública "Prompt Bar" em
> `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.

## Decisão

O Prompt Bar se sobrepõe ao nosso organism `prompt-input`. Decidido em 09/10/2026: **melhorar o
`prompt-input`** com o que ele não tem, em vez de criar um campo novo. Tudo é **aditivo e
opcional**: nenhuma prop existente muda de sentido, e o block `chatbot` continua igual.

## O que a pessoa vê (o que falta no nosso)

1. Digitar `@` abre um menu de **fontes** acima do campo ("Arquivos · anexar do computador",
   "Drive", "Web"); `/` abre um menu de **comandos** ("/resumir", "/traduzir", "/explicar").
   Setas navegam, Enter escolhe, Escape fecha. Escolher insere o token no texto (ou, na fonte de
   anexo, dispara o anexar).
2. Uma **régua de esforço** (Baixo · Médio · Alto · Máximo) num popover pequeno. No nível máximo, o
   campo ganha um **brilho** na cor da marca e **faíscas** que sobem devagar; digitar rápido faz as
   faíscas subirem mais rápido e brilharem mais.
3. O botão de enviar **se transforma** em parar quando há resposta em andamento: a seta afina,
   inclina um pouco e vira um quadrado (e volta).

## API nova (tudo exportado de `organisms/prompt-input`)

```ts
type PromptInputMenuItem = { key: string; label: string; description?: string; icon?: React.ReactNode };
/** Menu de gatilho ligado ao PromptInputTextarea do mesmo PromptInput. */
type PromptInputTriggerMenuProps = {
  trigger: "@" | "/";
  items: PromptInputMenuItem[];
  /** Padrão: troca o "@consulta" ou "/consulta" digitado por `${trigger}${item.label} `. */
  onSelect?: (item: PromptInputMenuItem, api: { insert: (text: string) => void }) => void;
  emptyLabel?: string;               // default "Nada encontrado"
  className?: string;
};
type PromptInputEffortProps = {
  steps: string[];                   // ex. ["Baixo", "Médio", "Alto", "Máximo"]
  value?: string; defaultValue?: string;   // vazio = passo do meio
  onValueChange?: (step: string) => void;
  /** Faíscas e brilho no último passo. */
  sparks?: boolean;                  // default true
  label?: string;                    // default "Esforço"
};
```
`PromptInputSubmit` ganha a transição seta→quadrado sem mudar a API (`status`, `onStop`).

## Regras

1. **Menu de gatilho:**
   - Detecção (função pura `findTrigger(text, caret, trigger)` → `{ start, query } | null`):
     o gatilho precisa estar no início ou depois de espaço/quebra; a consulta vai até o cursor
     e não tem espaço.
   - Filtro por `label`/`description` sem acento e sem caixa (função pura `filterItems`).
   - A11y de combobox: o textarea ganha `aria-expanded`, `aria-controls` (id do listbox) e
     `aria-activedescendant`; o menu é `role="listbox"` com `role="option"` e `aria-selected`.
   - O menu aparece **acima** do campo, alinhado à esquerda, `bg-popover text-popover-foreground
     border shadow-md rounded-lg`, ícone + rótulo + descrição `text-muted-foreground`.
   - Teclas do textarea (↑ ↓ Enter Tab Escape) são interceptadas **só** com o menu aberto; com ele
     aberto, Enter escolhe e não envia o formulário.
   - Para conversar com o textarea, use o contexto interno que o `PromptInput` já tem (ler o
     arquivo) ou crie um contexto pequeno novo; não mude a assinatura dos componentes existentes.
2. **Esforço:**
   - Radix Slider com `steps.length` posições; rótulo do passo atual ao lado (`aria-valuetext`).
   - Com `sparks` e no último passo, a raiz do `PromptInput` recebe `data-effort="max"`:
     - borda `border-primary/40`;
     - fundo com `color-mix(in oklab, var(--primary) 6%, var(--background))`;
     - 10–14 faíscas (`span` `aria-hidden`, `bg-primary rounded-full size-1`) subindo do rodapé
       com atraso e deriva determinísticos (função pura `sparkLayout(count, seed)`).
   - Velocidade de digitação (teclas/s suavizada, função pura `typingEnergy`) aumenta
     velocidade e opacidade das faíscas, sem criar novas.
3. **Transição do enviar:**
   - Ícone num `motion.span`.
   - Ao mudar entre ocioso e ocupado: `scaleX` 1 → 0.88, `scaleY` 1 → 1.12, `rotate` 0 → ±8°
     no meio do caminho e de volta, em 240 ms, trocando `ArrowUp` ↔ `Square` no meio.
   - O sentido do giro inverte na volta.
4. **Só tokens.** Nada de hex/rgb.

## Movimento reduzido

Menu e régua normais. Sem faíscas (o brilho estático do nível máximo continua). Troca seta↔quadrado
direta.

## Marcação

Partes: `prompt-input-trigger-menu`, `prompt-input-trigger-option`, `prompt-input-effort`,
`prompt-input-spark`. Raiz ganha `data-effort` quando houver `PromptInputEffort`.

## Testes mínimos

- Puras: `findTrigger` (início, depois de espaço, no meio de palavra não, consulta com espaço não),
  `filterItems` (sem acento/caixa), `sparkLayout` determinístico, `typingEnergy` decai.
- Digitar "@dr" abre o listbox com "Drive" filtrado; ↓ + Enter insere "@Drive " e não envia
  (`onSubmit` não chamado); Escape fecha; `aria-activedescendant` acompanha.
- "/" no meio de palavra não abre.
- Esforço: mudar para o último passo põe `data-effort="max"` e renderiza faíscas; movimento reduzido
  sem faíscas.
- Submit: com `status="streaming"` mostra "Parar" e chama `onStop` (já existe; manter verde).
- **Todos os testes atuais do `prompt-input` e do block `chatbot` continuam passando.**
