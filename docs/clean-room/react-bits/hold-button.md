# Spec de comportamento: `hold-button`

> **Proveniência (clean room).** Escrita em 05/10/2026 a partir da demo pública "Hold Button" em
> `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.

## O que a pessoa vê

Um botão de ação perigosa ("Segure para excluir"). Ao pressionar e manter, um "líquido" enche o
botão da esquerda para a direita (ou de baixo para cima) em velocidade constante. A borda do
líquido tem uma onda suave. O texto muda de cor exatamente onde o líquido passa. Se soltar antes,
o líquido volta rápido. Ao completar, o botão dá um pulso, o rótulo vira "Excluído" (com ícone) e,
depois de um tempo, volta ao estado inicial.

## Por que existe (uso no produto)

Ações irreversíveis (excluir conciliação, estornar lançamento) sem modal de confirmação: segurar
é a confirmação. Um clique rápido **não** executa a ação; ele mostra uma dica ("Segure para
confirmar").

## API (`atoms/actions/hold-button`)

```ts
type HoldButtonProps = Omit<React.ComponentProps<"button">, "children" | "onClick"> & {
  /** Rótulo em repouso e durante o segurar. */
  children: React.ReactNode;
  /** Rótulo depois de completar. */
  doneLabel: React.ReactNode;
  icon?: React.ReactNode;
  doneIcon?: React.ReactNode;
  /** Cor do líquido. "destructive" para exclusão, "primary" para confirmações comuns. */
  tone?: "destructive" | "primary";          // default "destructive"
  size?: "sm" | "default" | "lg";            // default "default" (mesmas alturas do Button)
  fillDirection?: "right" | "up";            // default "right"
  /** Tempo de segurar, em ms. */
  holdMs?: number;                           // default 1500
  /** Tempo de o líquido voltar ao soltar antes, em ms. */
  releaseMs?: number;                        // default 200
  wave?: boolean;                            // default true
  /** Tempo no estado "feito" antes de voltar. 0 = fica feito. */
  resetAfterMs?: number;                     // default 1600
  /** Chamado uma vez, no quadro em que o líquido completa. */
  onHoldComplete: () => void;
  /** Texto da dica num clique rápido. */
  tapHint?: string;                          // default "Segure para confirmar"
};
```

## Regras

1. **Visual base.**
   - O botão é `bg-secondary text-secondary-foreground`, com as alturas e o raio do `Button`
     (`size`).
   - O líquido é uma camada `absolute inset-0` com `bg-destructive` ou `bg-primary`. O progresso
     é uma escala de 0..1 (`scaleX` com origem à esquerda, ou `scaleY` com origem embaixo).
   - O rótulo "por cima do líquido" é uma segunda cópia do rótulo, em `text-destructive-foreground`
     ou `text-primary-foreground`, recortada com `clip-path: inset(...)` no mesmo progresso. Isso
     faz a cor do texto trocar exatamente na borda.
2. **Segurar.**
   - Começa no `pointerdown` (botão principal) ou ao pressionar Espaço/Enter.
   - O progresso vai de 0 a 1 em `holdMs`, linear, por `requestAnimationFrame`.
   - Soltar (`pointerup`, `pointercancel`, o ponteiro sair do botão, `keyup`, `blur`) antes de 1
     faz o progresso voltar a 0 em `releaseMs`, com ease-out.
   - Enquanto segura, o botão encolhe para `scale(0.97)`.
3. **Completar.**
   - Ao chegar em 1, chama `onHoldComplete` **uma vez**.
   - Mostra `doneIcon` + `doneLabel` com uma troca de rótulo suave (fade + leve blur, 200ms).
   - Dá um pulso único (escala 1 → 1.03 → 1, 300ms).
   - Ignora novas pressões até resetar.
   - A largura não muda entre estados: os dois rótulos ocupam a mesma célula e o botão mede o maior (revisão 06/10/2026).
   - Depois de `resetAfterMs`, o líquido volta e o rótulo original reaparece. Com 0, fica feito.
4. **Clique rápido.** Soltar em menos de 250ms mostra `tapHint` num `Tooltip` da lib (ou texto
   `aria-live` abaixo), por 1,5s. Não chama `onHoldComplete`.
5. **Onda.**
   - Com `wave`, a borda que avança tem uma ondulação: SVG com `path` senoidal na cor do líquido,
     rolando na vertical.
   - Some com o progresso em 0 ou 1.
6. **Disabled.** `opacity-50`, `pointer-events-none`, sem segurar.
7. **Cores.** Só tokens. Nada de hex ou rgb.

## Movimento reduzido

- O progresso ainda precisa ser visível, porque é a confirmação. Por isso o líquido continua,
  mas sem onda, sem pulso, sem encolher e sem blur na troca de rótulo.
- O tempo de segurar continua.

## Acessibilidade

- É um `<button type="button">`.
- O `aria-label` vem do rótulo, com a instrução: "Excluir conciliação, segure para confirmar".
- Enquanto segura: `aria-busy="true"` e, num `sr-only` com `aria-live="polite"`, o anúncio
  "segurando… 50%" a cada 25%.
- Ao completar, o anúncio é o `doneLabel`.
- Teclado: segurar Espaço ou Enter funciona igual ao ponteiro. A repetição automática da tecla
  (`event.repeat`) é ignorada.
- O foco segue o padrão do `Button` (`focus-visible:ring`).

## Marcação

- Raiz: `data-slot="hold-button"`, `data-state="idle" | "holding" | "done"`, `ref`, `cn`.
- Líquido: `data-slot="hold-button-fill"`. Rótulo de cima: `data-slot="hold-button-fill-label"`.

## Testes mínimos

- Funções puras:
  - progresso em função do tempo (0, metade, ≥ holdMs → 1, limitado);
  - progresso de volta;
  - `clip-path` do rótulo para cada direção e progresso.
- Fake timers e rAF fake:
  - segurar por `holdMs` chama `onHoldComplete` uma vez e vai para `data-state="done"`;
  - soltar na metade não chama e volta a `idle`.
- Clique rápido mostra `tapHint` e não chama.
- Teclado: `keydown` de Espaço segurado completa; `event.repeat` não reinicia.
- `resetAfterMs` volta a `idle`; com 0, fica em `done`.
- Disabled não segura.
- Movimento reduzido: completa, sem onda (sem `[data-slot="hold-button-wave"]`).
- `aria-live` anuncia o progresso.
- `ref` e `className` na raiz.
