# MetricStrip — spec clean room

Fonte observada: as faixas de números de openrouter.ai, vercel.com/ai-gateway, cluely.com e
finalroundai.com, vistas só na tela em 12/10/2026, em 1440 e 390 px. Nenhum código, CSS ou asset
dessas páginas foi lido. Ver `README.md` desta pasta.

## O que se viu (resumo)

- **OpenRouter**: 4 números logo abaixo do hero, sem cartão: número grande em cima, rótulo pequeno
  em `muted` embaixo, colunas iguais.
- **Vercel**: números em **mono**, muito grandes, às vezes um só ("0%") ao lado de um parágrafo;
  noutra seção, 3 números mono embaixo de uma citação.
- **Cluely**: **em coluna, ao lado de uma imagem**: cada linha tem o número grande à esquerda com a
  **unidade menor, alinhada à base** ("300ms", "12+", "95%"), e à direita um título e uma frase;
  linhas separadas por régua fina.
- **Final Round**: no hero, **em linha**: número na cor de destaque + rótulo `muted` na mesma
  linha, itens separados por espaço; mais abaixo, 3 colunas com régua entre elas, número, título e
  frase.
- Celular: as colunas viram 2 por linha (4 itens) ou uma pilha; a variante em linha quebra.

## Composição

Molecule `MetricStrip`. `<dl>` com `@container`. Cada item é um par `<dt>` (rótulo) + `<dd>`
(número), na ordem visual número em cima, rótulo embaixo (inverter com `flex-col-reverse` no
contêiner do item, para o leitor de tela ler "rótulo: número").

### Variantes (`variant`)
1. **`columns`** (padrão): grade de colunas iguais. Itens: 2, 3 ou 4. Colunas por container query:
   `grid-cols-1`, `@min-[420px]:grid-cols-2`, e a partir de `@min-[768px]` o número de itens (até
   4). Prop `dividers` (padrão `false`): régua vertical `border-l` entre colunas no largo e
   horizontal `border-t` entre linhas no estreito (sem régua antes do primeiro).
2. **`rows`**: lista vertical (o caso do Cluely). Cada linha: número à esquerda numa coluna de
   largura fixa (`min-w-[7ch]`), e à direita `label` em `text-lg font-medium` + `description` em
   `muted-foreground`. Régua `border-t` entre linhas. Abaixo de 480 px de contêiner, o número fica
   em cima e o texto embaixo.
3. **`inline`**: uma linha de texto corrido, itens com `gap-x-6 gap-y-2 flex-wrap`, cada um
   "**número** rótulo" na mesma linha; o número na cor `--primary` (prop `accent`, padrão `true`
   nesta variante), o rótulo `muted-foreground` `text-sm`. Separador opcional (`separator: "dot"`
   desenha um ponto `bg-border` de 4 px entre itens, `aria-hidden`).

### Número
- `value` (number) + `prefix`/`suffix`/`unit`. `unit` é a parte **menor, alinhada à base**: tamanho
  0,5em, `ml-0.5`, mesma cor, `align-baseline` (o caso "300**ms**"). `suffix` fica no tamanho do
  número ("12+", "95%").
- Formatação por `Intl.NumberFormat` (`locale`, padrão `"pt-BR"`; `formatOptions`, ex. `notation:
  "compact"` para "10 mi").
- `display` opcional (ReactNode) substitui o número formatado. Nota com estrela usa o ícone `Star`
  do lucide no `suffix`, nunca o glifo de estrela no texto.
- Tamanho por prop `size`: `md` (`text-3xl`), `lg` (`text-display-xs`, padrão), `xl`
  (`text-display-md`). Peso 600, `tabular-nums`, `tracking-tight`. Prop `mono` (padrão `false`):
  `font-mono` no número.
- **Atenção à armadilha do `CLAUDE.md`**: `text-display-*` e cor de texto não podem ir no mesmo
  `cn()`. Ponha a cor num elemento e o tamanho noutro, ou a cor no contêiner.

### Contagem animada (opcional, `animate`)
- Usa o `CountUp` do repo (`atoms/typography/count-up`) de 0 até `value`, começando quando o item
  entra na tela (IntersectionObserver, uma vez). `durationMs` por prop (padrão 1200).
- Com movimento reduzido (critério do `CLAUDE.md`), mostra o valor final direto.
- O `<dd>` tem o valor final em `aria-label` (ou um `sr-only` com o final e o animado
  `aria-hidden`), para o leitor de tela não ler os números intermediários.

### Item
```ts
type Metric = {
  id: string;
  value: number;
  label: ReactNode;          // vai no <dt>
  description?: ReactNode;   // linha extra em muted (columns e rows)
  prefix?: ReactNode;        // "R$ ", "+"
  suffix?: ReactNode;        // "+", "%"
  unit?: ReactNode;          // "ms", "mi" — menor, na base
  display?: ReactNode;       // substitui o número
  formatOptions?: Intl.NumberFormatOptions;
  href?: string;             // o item inteiro vira link (rows e columns)
};
```

## API

```ts
type MetricStripProps = Omit<ComponentProps<"dl">, "children"> & {
  items: Metric[];
  variant?: "columns" | "rows" | "inline";
  size?: "md" | "lg" | "xl";
  mono?: boolean;
  accent?: boolean;          // número em --primary
  dividers?: boolean;        // columns
  separator?: "none" | "dot"; // inline
  animate?: boolean;
  durationMs?: number;
  locale?: string;
};
```

`data-slot`: `metric-strip` (com `data-variant`), `metric-strip-item`, `metric-strip-value`,
`metric-strip-unit`, `metric-strip-label`, `metric-strip-description`.

## Acessibilidade

- `<dl>`; sem `role` extra. Cada item em `<div>` agrupando `<dt>` + `<dd>` (permitido em `dl`).
- Com `href`, o link envolve o conteúdo do item e tem nome acessível vindo do rótulo + número.
- Unidade e sufixo fazem parte do texto lido ("300 ms").

## Estados que o teste deve cobrir

1. Renderiza `<dl>` com um `<dt>` e um `<dd>` por item, rótulo no `dt` e número no `dd`.
2. Formata em pt-BR (`12345` vira "12.345"); `formatOptions` compacto vira "10 mi" (ou o que o
   `Intl` do Node der — compare com `Intl.NumberFormat` no próprio teste, não com string fixa).
3. `prefix`, `suffix` e `unit` aparecem; `unit` com `data-slot="metric-strip-unit"`.
4. `display` substitui o número.
5. `data-variant` muda conforme `variant`; `rows` mostra `description`; `inline` com
   `separator="dot"` tem um separador `aria-hidden` a menos que o número de itens.
6. `accent` aplica a classe da cor de destaque; `mono` aplica `font-mono`.
7. `animate` com movimento reduzido mostra o valor final sem esperar; sem IntersectionObserver
   (jsdom) também; o valor final está acessível.
8. `href` torna o item um link.

## Story

`Flowtomic UI/Molecules/MetricStrip`, `layout: "padded"`. Números do próprio Flowtomic (aproxime,
sem inventar marca alheia): componentes (291), testes do `ui` (2.171), cobertura de linhas
(96,9 %), stories.

- `Default`: `columns`, 4 itens, `dividers`.
- `Linhas`: `rows`, 3 itens com `unit` ("ms") e `description`, ao lado de um bloco de imagem
  qualquer numa grade de 2 colunas (só na story).
- `EmLinha`: `inline`, `accent`, `separator="dot"`, 3 itens, como abaixo de um hero.
- `Mono`: `columns`, `mono`, `size="xl"`, 3 itens.
- `Animado`: `animate`.
- `Estreito`: contêiner de 360 px com `columns`.
- `Escuro`: wrapper com a classe `dark`.
