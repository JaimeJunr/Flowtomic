# FaqSection — spec clean room

Fonte observada: as seções de perguntas frequentes de interviewcoder.co e vercel.com/ai-gateway
(e, de passagem, cloudflare.com/products/ai-gateway), vistas só na tela em 12/10/2026, em 1440 px
e 390 px. Nenhum código, CSS ou asset dessas páginas foi lido. Ver `README.md` desta pasta.

## O que se viu (resumo)

- **Vercel**: título grande à esquerda ("Frequently asked questions" em duas linhas), lista à
  direita ocupando ~60% da largura. Cada pergunta tem um **número de dois dígitos** (`01`, `02`) em
  `muted-foreground` antes do texto, chevron pequeno na ponta direita, sem borda nem cartão; a linha
  em hover ganha fundo `muted` arredondado. Texto da pergunta grande (~20 px), quebra em duas
  linhas sem problema.
- **Interview Coder**: em cima, título enorme à esquerda e, à direita, uma **caixa de contato**
  ("Não achou? Mande um e-mail") com o endereço em mono e um botão "Copiar". Embaixo, **duas
  colunas de cartões** independentes, cada cartão uma pergunta com chevron; o aberto troca o
  chevron por um traço e mostra a resposta em `muted-foreground`. As colunas não se alinham por
  linha: cada uma empilha seus cartões.
- **Cloudflare**: título centralizado, lista estreita centralizada com `+` à direita.
- No celular, tudo vira uma coluna: título, caixa de contato, perguntas.

## Composição

`<section>` com `@container`. Duas variantes (`layout`):

### `layout="split"` (padrão)
- Grade de 2 colunas a partir de 768 px de contêiner: **cabeçalho** (5/12) e **lista** (7/12),
  gap 48 px. O cabeçalho fica `sticky top-24` enquanto a lista rola (desliga com `stickyHeader`
  `false`).
- Abaixo de 768 px: uma coluna.

### `layout="grid"`
- Linha de cima: cabeçalho à esquerda, **caixa de contato** à direita (se houver `contact`),
  alinhados pelo topo. Abaixo de 768 px, empilham.
- Embaixo: perguntas em **2 colunas de cartões** a partir de 768 px (perguntas distribuídas
  alternadamente: 1ª à esquerda, 2ª à direita, 3ª à esquerda…, para manter a ordem de leitura por
  linha), 1 coluna abaixo. Cada cartão: `rounded-xl`, fundo `card`, borda `border`, `p-5`.

### Cabeçalho (as duas variantes)
- `title` (ReactNode) em `text-display-sm` a partir de 768 px, `text-display-xs` abaixo, peso 600,
  `text-balance`. Sem eyebrow em caixa alta (é tell no `CLAUDE.md`).
- `description` opcional em `muted-foreground`, `text-base`, até 48ch.
- Em `split`, a caixa de contato (se houver) vai **abaixo do texto do cabeçalho**.

### Pergunta (item)
- Número opcional (`numbered`, padrão `true` em `split`, `false` em `grid`): dois dígitos em
  `font-mono`, `muted-foreground`, largura fixa.
- Texto da pergunta: `text-lg` (`split`) ou `text-base font-medium` (`grid`), `foreground`.
- Ícone à direita: `ChevronDown` 16 px que gira 180° ao abrir (`split`), ou `Plus` que vira `Minus`
  (`grid`). Prop `icon?: "chevron" | "plus"` sobrescreve.
- Resposta: `muted-foreground`, `text-sm` ou `text-base`, até 65ch; pode ter links e listas
  (ReactNode). Em `split` a resposta alinha com o texto da pergunta (recuo do número).
- `split`: linhas separadas por `border-b`, hover com fundo `muted` em `rounded-lg`, `px-3 py-4`.

### Caixa de contato (`contact`)
- Cartão com borda `border`, `rounded-xl`, `p-6`: título ("Não achou o que procurava?"), frase
  curta, e uma **linha de cópia**: fundo `muted`, `rounded-lg`, rótulo pequeno + valor em `font-mono`
  (o e-mail, ou qualquer texto) e um botão "Copiar" à direita.
- Copiar usa `navigator.clipboard.writeText` (em try/catch); o botão vira "Copiado" com ícone de
  check por 2 s; falha mostra "Não deu para copiar" por 2 s. `onCopy(value)` opcional.
- Alternativa: `contact.action` (`{ label, href }`) em vez da linha de cópia, renderizado como link
  em botão `outline`.

## Comportamento

- Accordion do Radix (o do repo). `type` pela prop `multiple` (padrão `false`: abrir uma fecha a
  outra). Controlado (`value` + `onValueChange`) ou não (`defaultValue`).
- Cada item tem `id`; se faltar, o índice vira id.
- `hashLink` (padrão `false`): quando `true`, cada item ganha `id` no DOM (`faq-<id>`) e, ao montar,
  se `location.hash` apontar para um item, ele abre e rola para a vista. Copiar o link de um item não
  faz parte (fica para quem usa).
- Abertura com a animação de altura do Accordion do repo; com movimento reduzido, sem animação.
- Busca opcional (`searchable`): campo acima da lista ("Buscar nas perguntas"), filtra por texto da
  pergunta e da resposta quando ela for string; sem resultado mostra "Nenhuma pergunta com
  '<termo>'." e, se houver `contact`, "Fale com a gente" apontando para a caixa.

## Acessibilidade

- `<section aria-labelledby>` apontando para o título.
- O título é `<h2>` por padrão (`headingLevel` 2 a 4); as perguntas são cabeçalhos do Accordion no
  nível seguinte.
- O número é `aria-hidden`.
- Botão copiar com `aria-label` "Copiar <valor>"; o retorno "Copiado" vai numa região
  `aria-live="polite"`.
- Busca com `<label>` (`sr-only`) e contagem de resultados em `aria-live`.

## API

```ts
type FaqItem = { id?: string; question: ReactNode; answer: ReactNode };

type FaqContact = {
  title?: ReactNode;            // padrão "Não achou o que procurava?"
  description?: ReactNode;
  copy?: { label?: ReactNode; value: string };   // linha de cópia
  action?: { label: ReactNode; href: string };   // alternativa à cópia
  onCopy?: (value: string) => void;
};

type FaqSectionProps = Omit<ComponentProps<"section">, "title" | "defaultValue"> & {
  title: ReactNode;
  description?: ReactNode;
  items: FaqItem[];
  layout?: "split" | "grid";    // padrão "split"
  numbered?: boolean;
  icon?: "chevron" | "plus";
  multiple?: boolean;           // padrão false
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  contact?: FaqContact;
  stickyHeader?: boolean;       // padrão true (só split)
  searchable?: boolean;         // padrão false
  hashLink?: boolean;           // padrão false
  headingLevel?: 2 | 3 | 4;
};
```

`data-slot`: `faq-section`, `faq-section-header`, `faq-section-list`, `faq-section-item` (com
`data-state`), `faq-section-contact`, `faq-section-search`.

## Estados que o teste deve cobrir

1. Renderiza `<section>` nomeada pelo título, com uma pergunta por item.
2. `split` numera `01`, `02`; `grid` sem número; `numbered` sobrescreve.
3. Abrir uma pergunta mostra a resposta; com `multiple={false}` abrir outra fecha a primeira;
   `multiple` deixa as duas.
4. Controlado: `onValueChange` com os ids, nada muda sem `value` novo.
5. `grid` distribui alternado em 2 colunas (1ª e 3ª na coluna da esquerda).
6. Caixa de contato: copiar chama `clipboard.writeText` com o valor, mostra "Copiado" e chama
   `onCopy`; clipboard que rejeita mostra "Não deu para copiar".
7. `contact.action` vira link.
8. `searchable`: filtra pela pergunta e pela resposta em string; sem resultado mostra a mensagem com
   o termo.
9. `hashLink`: com `location.hash = "#faq-precos"` ao montar, o item `precos` abre.
10. `headingLevel` muda o nível do título.

## Story

`Flowtomic UI/Organisms/FaqSection`, `layout: "padded"`. Conteúdo do próprio Flowtomic, sem marca
alheia: perguntas como "Preciso instalar o pacote inteiro?", "Os componentes funcionam sem
Tailwind?", "Como troco a cor da marca?", "O CLI sobrescreve arquivos que eu editei?", "Funciona
com React 18?", "Posso usar em projeto comercial?" — respostas curtas e verdadeiras para o repo
(React 19 obrigatório desde a 1.0; marca por variáveis CSS; CLI copia arquivos). Contato com
`copy: { label: "Abra uma issue em", value: "github.com/JaimeJunr/Flowtomic/issues" }`.

- `Default`: `split`, com contato.
- `Grade`: `grid`, ícone `plus`, contato no topo.
- `ComBusca`: `searchable`.
- `Estreito`: contêiner de 360 px.
- `Escuro`: wrapper com a classe `dark`.
