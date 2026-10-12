# StatusList — spec clean room

Fonte observada: a seção de confiabilidade de interviewcoder.co (lista numerada de integrações,
cada uma com estado, "atualizado há" e detalhe expansível), vista só na tela em 12/10/2026, e o
padrão de barras de disponibilidade de status pages em geral. Nenhum código, CSS ou asset dessas
páginas foi lido. Ver `README.md` desta pasta.

## Para que serve

Mostrar **o estado atual de vários itens** (integrações, serviços, regiões) numa lista que se lê
de longe: cada linha diz "está bem / degradado / fora" e quando isso foi conferido. Uma linha pode
abrir para mostrar o histórico em barras e um conteúdo livre (vídeo, nota, link). Uso: seção de
landing ("funciona em tudo isso"), página de status, painel interno.

## Composição

Lista vertical de **linhas-cartão** separadas por 12 px, cada uma com fundo `card`, borda `border`,
`rounded-xl`. A linha aberta ganha borda na cor do estado (verde para operacional) com
`color-mix(in oklch, <cor> 60%, var(--border))`.

Cabeçalho da linha (sempre visível), da esquerda para a direita:

1. **Número** em mono, `muted-foreground`, com zeros à esquerda (`001`, `002`). Opcional
   (`numbered`, padrão `true`). Largura fixa para alinhar os nomes.
2. **Ícone/logo** opcional, 36 px, cantos arredondados.
3. **Nome** do item, `text-lg`, `foreground`, truncado com reticências se faltar espaço.
4. Empurrado para a direita: **ponto de estado** (8 px, com um halo `color-mix` 25% da cor) e
   **"Atualizado há 16 h"** em `muted-foreground`, `text-sm`. Some abaixo de 640 px de contêiner
   (fica só o ponto, com o texto em `sr-only`).
5. **Selo do estado** em mono, `text-sm`, fundo `color-mix` 15% da cor do estado e texto na cor
   do estado. Texto padrão por estado (sobrescrevível por item com `statusLabel`):
   - `operational` → "Operacional" (cor `--success`)
   - `degraded` → "Degradado" (cor `--warning`)
   - `outage` → "Fora do ar" (cor `--destructive`)
   - `maintenance` → "Manutenção" (cor `--muted-foreground`)
6. **Chevron** (lucide `ChevronDown`) que gira 180° quando aberto. Só aparece se o item tem
   detalhe (`history` ou `content`).

Corpo (só quando aberto):

- **Barras de histórico**: uma barra vertical fina por ponto do `history` (ex.: 90 dias), todas
  com a mesma largura, preenchendo a largura toda com respiro de 2 px. Altura 40 px. Cor da barra
  = cor do estado daquele ponto; ponto sem dado (`null`) em `muted`. Hover/foco numa barra mostra
  tooltip (Radix Tooltip do repo) com a data/rótulo e o estado.
- Abaixo das barras, uma linha com **título do detalhe** (`detailTitle`, opcional) à esquerda e a
  **disponibilidade** calculada à direita, na cor do estado do item: "100% disponível" (percentual
  de pontos `operational` sobre pontos com dado, uma casa decimal quando não for inteiro:
  "99,4% disponível").
- **Conteúdo livre** (`content`, ReactNode) abaixo, com 16 px de respiro.

## Comportamento

- Abertura via Radix Accordion do repo. `type="multiple"` por padrão (`multiple`, padrão `true`).
  Controlado (`value` + `onValueChange`, lista de ids) ou não (`defaultValue`).
- `defaultValue` padrão: nenhum aberto. A story `Default` abre o primeiro.
- "Atualizado há": o item passa `updatedAt` (`Date | number | string` ISO). O texto é
  `Intl.RelativeTimeFormat` no `locale` (padrão `pt-BR`), unidade mais grosseira que caiba
  (segundos → minutos → horas → dias), prefixado por "Atualizado". Um prop `now` (padrão
  `Date.now()` no render) permite teste determinístico. `updatedAt` ausente esconde o texto.
- Barras de histórico **entram** com escala vertical de 0 a 1, em cascata da esquerda para a
  direita (total ~400 ms) quando o item abre. Com movimento reduzido, aparecem prontas.
- Linha sem detalhe não é botão: o cabeçalho é estático, sem chevron.

## Acessibilidade

- A lista é `<ul>`; cada item `<li>`.
- O gatilho do Accordion é o cabeçalho inteiro; o nome acessível é "<nome>, <estado>,
  atualizado há <tempo>" (o número é decorativo, `aria-hidden`).
- Barras: o grupo é `role="img"` com `aria-label` "Histórico: <N> de <M> períodos operacionais".
  As barras não são focáveis (seriam 90 paradas de Tab): o tooltip delas é só de ponteiro, e a
  informação acessível fica no `aria-label` do grupo.
- Cor nunca é o único sinal: o selo sempre tem texto.

## API

```ts
type StatusState = "operational" | "degraded" | "outage" | "maintenance";

type StatusHistoryPoint = { label: string; status: StatusState | null };

type StatusListItem = {
  id: string;
  name: ReactNode;
  icon?: ReactNode;
  status: StatusState;
  statusLabel?: ReactNode;
  updatedAt?: Date | number | string;
  history?: StatusHistoryPoint[];
  detailTitle?: ReactNode;
  content?: ReactNode;
};

type StatusListProps = Omit<ComponentProps<"div">, "defaultValue"> & {
  items: StatusListItem[];
  numbered?: boolean;          // padrão true
  multiple?: boolean;          // padrão true
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  locale?: string;             // padrão "pt-BR"
  now?: Date | number;         // padrão: agora
};
```

`data-slot`: `status-list` (raiz), `status-list-item` (com `data-status` e `data-state`
open/closed), `status-list-badge`, `status-list-history`, `status-list-bar` (com `data-status`).

## Estados que o teste deve cobrir

1. Renderiza um `<li>` por item com número `001`, nome e selo com o texto padrão do estado.
2. `statusLabel` sobrescreve o texto do selo.
3. "Atualizado há": com `now` fixo e `updatedAt` 16 h antes, mostra "Atualizado há 16 horas"
   (ou a forma que o `Intl` pt-BR der); sem `updatedAt`, não mostra.
4. Item sem `history`/`content` não tem botão nem chevron.
5. Clicar no cabeçalho abre e mostra barras e conteúdo; `multiple` deixa dois abertos;
   `multiple={false}` fecha o anterior.
6. Disponibilidade: 89 de 90 operacionais → "98,9% disponível"; todos → "100% disponível";
   pontos `null` não contam.
7. `aria-label` do grupo de barras com a contagem.
8. Controlado: `onValueChange` recebe os ids e nada muda sem `value` novo.
9. `numbered={false}` esconde os números.

## Story

`Flowtomic UI/Molecules/StatusList`, `layout: "padded"`. Conteúdo neutro, sem marca real:
- `Default`: "API pública", "Painel web", "Webhooks", "Exportação CSV", "Registry de
  componentes" (este `degraded`), o primeiro aberto com 90 dias de histórico (um dia `degraded`)
  e um parágrafo de conteúdo.
- `ComIncidente`: um item `outage` aberto, com histórico de barras vermelhas no fim.
- `SemNumeros`: `numbered={false}`, um só aberto por vez.
- `Estreito`: contêiner de 360 px.
- `Escuro`: dentro de um wrapper com a classe `dark`.
