# Spec de comportamento: `swell-chip-group`

> **Proveniência (clean room).** Escrita em 09/10/2026 a partir da demo pública "Jelly Radio" em
> `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.

## O que a pessoa vê

Uma fileira de chips de escolha única ("Desligado · Baixo · Médio · Alto · Máximo"). O escolhido
**incha** (fica maior que os outros, com cor invertida) e os vizinhos **abrem espaço**, sendo
empurrados para os lados com um pequeno atraso em cascata a partir do escolhido, como gelatina:
primeiro alarga, depois cresce na altura. Os não escolhidos encolhem um pouquinho.

## API (`atoms/forms/swell-chip-group`)

```ts
type SwellChipItem = string | { value: string; label: React.ReactNode; icon?: React.ReactNode; disabled?: boolean };
type SwellChipGroupProps = Omit<React.ComponentProps<typeof RadioGroupPrimitive.Root>, "children" | "onValueChange"> & {
  items: SwellChipItem[];
  onValueChange?: (value: string, index: number) => void;
  size?: "sm" | "default" | "lg";   // altura 28 / 36 / 44 px
  /** Quanto o escolhido cresce (0.2 = 20%). Também define o espaço aberto pelos vizinhos. */
  swell?: number;                   // default 0.2
  /** px extras que cada vizinho é empurrado além do espaço aberto. */
  push?: number;                    // default 6
  /** Quanto cada não escolhido encolhe. */
  shrink?: number;                  // default 0.05
  /** 0..1.5: quanto a largura cresce antes da altura. 0 = uniforme. */
  jelly?: number;                   // default 1
  /** 1 - amortecimento. 0 para seco; 0.4 oscila. */
  bounce?: number;                  // default 0.25
  /** ms por posição de distância antes de o vizinho se mexer. */
  staggerMs?: number;               // default 22
};
```
`value`, `defaultValue` (cai no primeiro item), `disabled`, `aria-label`, `ref`, `className` do
Radix RadioGroup. Itens string são value e label ao mesmo tempo.

## Regras

1. **Base:** `@radix-ui/react-radio-group` (`role="radiogroup"`, setas movem e escolhem, roving
   tabindex). Cada chip é um `RadioGroupPrimitive.Item`.
2. **Cores (só tokens):** chip `bg-secondary text-secondary-foreground`, escolhido
   `bg-primary text-primary-foreground`. Hover em não escolhido: `hover:bg-accent`. Pill
   (`rounded-full`).
3. **Inchar:** escolhido anima para `scale(1+swell)`; com `jelly`, `scaleX` chega antes de
   `scaleY` (dois springs com rigidez diferente, ou atraso em `scaleY`). Não escolhidos
   `scale(1-shrink)`.
4. **Abrir espaço:** cada vizinho é deslocado em X (`x`) para longe do escolhido:
   `offset = (largura_escolhido * swell / 2) + push`, à esquerda negativo, à direita positivo.
   Calcular com função pura `neighbourOffset(index, selectedIndex, selectedWidth, swell, push)`
   que devolve 0 para o próprio escolhido. Atraso: `|index - selectedIndex| * staggerMs`.
   O grupo tem padding/margem lateral suficiente para o deslocamento não cortar.
5. **Mola:** amortecimento derivado de `bounce` (função pura).
6. **Item disabled:** não escolhível, `opacity-50`.

## Movimento reduzido

Sem escala nem deslocamento: só a troca de cor do escolhido.

## Marcação

Raiz: `data-slot="swell-chip-group"`. Chip: `data-slot="swell-chip"`, `data-state` do Radix.

## Testes mínimos

- Pura: `neighbourOffset` (esquerda, direita, o próprio, push 0), stagger por distância.
- Clique escolhe e chama `onValueChange(value, index)`.
- Setas mudam a escolha (Radix).
- Sem `value`/`defaultValue`, o primeiro fica escolhido.
- Item disabled não é escolhido.
- Movimento reduzido: escolhe sem quebrar.
- `getByRole("radiogroup", { name })`, `ref`/`className`.
