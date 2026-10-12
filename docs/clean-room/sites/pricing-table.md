# PricingTable — spec clean room

Fonte observada: a seção de preços de interviewcoder.co (3 planos, um destacado, preço original
riscado) e a tabela de promoções de vercel.com/ai-gateway, vistas só na tela em 12/10/2026.
Nenhum código, CSS ou asset dessas páginas foi lido. Ver `README.md` desta pasta.

## Para que serve

Mostrar **2 a 4 planos lado a lado**, um deles recomendado, com preço, o que inclui e um botão.
Opcionalmente com alternância de período (mensal/anual).

## Composição

- **Alternância de período** (opcional), centralizada acima dos cartões: controle segmentado
  "Mensal / Anual" com um selo pequeno no anual ("2 meses grátis", texto livre).
- **Cartões** em grade de colunas iguais, alinhados pelo topo, mesma altura (a lista de itens
  estica; o botão fica na mesma linha em todos os cartões).
- Cada cartão, de cima para baixo:
  1. **Nome do plano** em mono, pequeno, `muted-foreground`, caixa normal (não CAPS espaçado:
     é tell no `CLAUDE.md`). Ícone opcional antes.
  2. **Preço** grande (`text-display`-ish, sem juntar com cor no mesmo `cn`: ver armadilha) com
     o sufixo pequeno ao lado, alinhado pela base ("/mês", "pagamento único").
  3. **Preço original riscado** (opcional) abaixo, pequeno, `muted-foreground`, com o texto
     acessível "Antes: R$ 499".
  4. **Frase curta** do plano (opcional), uma linha.
  5. **Botão** de largura total. No plano destacado, sólido (`default`); nos outros,
     `outline`. Um botão sólido por tela.
  6. **Nota abaixo do botão** (opcional), pequena, `muted-foreground` (ex.: "Sem cartão de
     crédito").
  7. **Lista de itens**: marcador discreto (check pequeno `muted-foreground`), texto
     `foreground`. Item pode ter `included: false`, que aparece riscado/esmaecido com X, e pode ter
     um selo "Novo".
- **Plano destacado**: borda `primary`, fundo `color-mix(in oklch, var(--primary) 6%, var(--card))`,
  preço em `primary`, e um selo opcional acima do nome ("Mais escolhido").
- Os outros: borda `border`, fundo `card`.

## Comportamento

- Período controlado (`period` + `onPeriodChange`) ou não (`defaultPeriod`). Cada plano declara
  preço por período; trocar o período troca preço, sufixo e preço riscado. O número **anima**
  como o `sliding-number`/`count-up` do repo (reusar se servir), e troca seco com movimento
  reduzido.
- Plano sem preço no período escolhido mostra o preço do primeiro período disponível (ex.: plano
  vitalício igual nos dois).
- Botão: `action` com `href` vira link; com `onClick`, botão.
- **Telas estreitas** (container < 640 px): cartões empilham, o destacado primeiro.
- Com 4 planos e container entre 640 e 1024 px: grade 2×2.

## Acessibilidade

- Cada cartão é um `<section>` com `aria-labelledby` no nome do plano.
- Lista de itens é `<ul>`; item não incluído tem texto acessível "Não incluso: <item>".
- Alternância de período é um radiogroup (Radix ToggleGroup tipo single ou RadioGroup do repo)
  com `aria-label` "Período de cobrança".
- O selo do destaque é lido junto do nome ("Pro, mais escolhido").

## API

```ts
type PricingPeriod = { id: string; label: ReactNode; badge?: ReactNode };

type PricingPrice = {
  amount: string | number;       // número é formatado com Intl (prop currency/locale)
  suffix?: ReactNode;            // "/mês"
  original?: string | number;    // riscado
};

type PricingFeature = { label: ReactNode; included?: boolean; badge?: ReactNode };

type PricingPlan = {
  id: string;
  name: ReactNode;
  icon?: ReactNode;
  description?: ReactNode;
  price: PricingPrice | Record<string, PricingPrice>;   // por id de período
  action: { label: ReactNode; href?: string; onClick?: () => void };
  note?: ReactNode;
  features: PricingFeature[];
  highlighted?: boolean;
  highlightLabel?: ReactNode;
};

type PricingTableProps = ComponentProps<"div"> & {
  plans: PricingPlan[];
  periods?: PricingPeriod[];
  period?: string;
  defaultPeriod?: string;
  onPeriodChange?: (period: string) => void;
  currency?: string;             // padrão "BRL"
  locale?: string;               // padrão "pt-BR"
};
```

`data-slot`: `pricing-table`, `pricing-table-periods`, `pricing-table-plan` (com
`data-highlighted`), `pricing-table-price`, `pricing-table-original-price`,
`pricing-table-features`, `pricing-table-feature` (com `data-included`).

## Estados que o teste deve cobrir

1. Renderiza um `<section>` por plano com nome, preço, botão e itens.
2. Número formatado em BRL pt-BR ("R$ 49"); string fica como está ("Grátis").
3. Preço riscado com texto acessível "Antes: …".
4. Plano destacado com `data-highlighted`, selo visível, botão sólido; os outros `outline`.
5. Item `included: false` com texto acessível "Não incluso".
6. Trocar o período troca os preços; controlado chama `onPeriodChange` e não muda sozinho.
7. Plano com preço único aparece igual nos dois períodos.
8. `action.href` vira link; `onClick` é chamado.
9. Sem `periods`, não há alternância.

## Story

`Flowtomic UI/Organisms/PricingTable`, `layout: "padded"`. Conteúdo neutro, sem marca real:
- `Default`: 3 planos — "Gratuito" (R$ 0, "Comece hoje"), "Equipe" (destacado, "Mais
  escolhido", R$ 49/mês, anual R$ 39/mês com original R$ 49), "Empresa" ("Fale com a gente", sem
  número) — com alternância Mensal/Anual ("2 meses grátis").
- `PagamentoUnico`: plano vitalício com preço riscado.
- `QuatroPlanos`.
- `Estreito`: contêiner de 360 px.
