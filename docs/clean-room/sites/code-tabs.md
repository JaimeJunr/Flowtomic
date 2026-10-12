# CodeTabs — spec clean room

Fonte observada: o bloco de código do hero de vercel.com/ai-gateway, o de exemplos de
cloudflare.com/products/ai-gateway e o de instalação de rerun.io, vistos só na tela em
12/10/2026. Nenhum código, CSS ou asset dessas páginas foi lido. Ver `README.md` desta pasta.

## Para que serve

Mostrar **um mesmo exemplo de código em várias combinações** (cliente × dialeto × linguagem) sem
o leitor sair do lugar, e deixar ele trocar **um valor dentro do código** (o modelo, a região)
por botões abaixo do bloco. Uso típico: hero de landing de API, página de "comece aqui" de doc.

## Composição (de cima para baixo, numa moldura só)

1. **Linha 1 — eixo primário** (ex.: API, Claude Code, Codex). Abas de texto, compactas. A
   ativa ganha fundo `muted` em pílula; as outras são texto `muted-foreground`.
2. **Linha 2 — eixo secundário** (ex.: AI SDK, Chat Completions, Messages). Mesmo estilo, menor.
   À direita da linha 2, alinhado à borda, o **eixo terciário** quando ele é do tipo `select`
   (ex.: TypeScript / Python): abas menores, ou um select compacto se tiver mais de 3 opções.
   Linhas sem eixo não aparecem. Com um eixo só, só a linha 1 existe.
3. **Área de código**: usa o `CodeBlock` existente (Shiki, números de linha opcionais). Botão de
   copiar no canto superior direito da área, sobre o código. A área tem **altura mínima fixa**
   (prop `minLines`, padrão 8) para o bloco não pular de tamanho ao trocar de aba.
4. **Rodapé** (opcional): slot à esquerda (ex.: "Copiar para agente") e slot à direita (ex.:
   link "Ler a doc" com ícone de saída). Separado por régua fina.
5. **Fora da moldura, abaixo — chips de variável** (ex.: SpaceXAI, OpenAI, Anthropic, Gemini,
   OSS). Pílulas contornadas com ícone opcional + rótulo. A ativa tem borda `foreground` e
   fundo `background`; as outras borda `border`. Um último chip pode ser link ("E mais ↗").

Moldura: `border`, `rounded-lg`, fundo `card`, sombra leve. Sem cabeçalho com título: o bloco
é o próprio conteúdo.

## Comportamento

- **Seleção** é um objeto `{ [eixo]: valor }`. Controlada (`value` + `onValueChange`) ou não
  (`defaultValue`). Sem `defaultValue`, cada eixo começa na primeira opção que tenha exemplo.
- **Resolução do exemplo**: cada snippet declara `match: { eixo: valor, ... }`. O exibido é o que
  casa com todos os eixos selecionados. Eixo ausente no `match` casa com qualquer valor.
- **Opções sem exemplo somem.** Uma opção do eixo N só aparece se existe algum snippet que case
  com a seleção dos eixos anteriores a N e com ela. Ao trocar um eixo anterior, se o valor atual
  de um eixo posterior ficou sem exemplo, ele pula para a primeira opção disponível.
- **Variáveis**: o código pode ter `{{id}}`. Cada variável tem opções; o chip ativo troca
  `{{id}}` pelo `value` da opção em todo snippet. A seleção das variáveis entra no mesmo objeto
  de seleção (chave = id da variável).
- **Copiar** copia o código **já substituído**. Feedback "Copiado" por 2 s (o do `CodeBlock`).
- **Troca de exemplo**: o código novo entra com fade de 150 ms. Com movimento reduzido, troca
  seco.
- **Valor alterado por variável** fica marcado por 600 ms com fundo `primary` translúcido
  (opcional, prop `highlightChanges`, padrão `true`), para o olho achar o que mudou. Com movimento
  reduzido, sem marcação animada.

## Acessibilidade

- Cada linha de abas é um `tablist` (Radix Tabs) com `aria-label` = rótulo do eixo. Setas
  movem entre abas; a área de código é o `tabpanel` do eixo mais interno.
- Chips de variável são um grupo de rádio (`role="radiogroup"`, `aria-label` = rótulo da
  variável), setas movem e escolhem.
- O botão copiar mantém o rótulo "Copiar código" / "Copiado".
- Chip-link ("E mais") é `<a>`, fora do grupo de rádio.

## API

```ts
type CodeTabsOption = { value: string; label: ReactNode; icon?: ReactNode };

type CodeTabsAxis = {
  id: string;
  label: string;              // nome acessível do tablist
  options: CodeTabsOption[];
  placement?: "row" | "end";  // "end" = à direita da última linha (linguagem)
};

type CodeTabsSnippet = {
  match: Record<string, string>;
  code: string;
  language: CodeBlockLanguage;
};

type CodeTabsVariable = {
  id: string;
  label: string;
  options: CodeTabsOption[];
  more?: { label: ReactNode; href: string };
};

type CodeTabsProps = Omit<ComponentProps<"div">, "defaultValue"> & {
  axes: CodeTabsAxis[];
  snippets: CodeTabsSnippet[];
  variables?: CodeTabsVariable[];
  value?: Record<string, string>;
  defaultValue?: Record<string, string>;
  onValueChange?: (value: Record<string, string>) => void;
  footerStart?: ReactNode;
  footerEnd?: ReactNode;
  showLineNumbers?: boolean;   // padrão true
  minLines?: number;           // padrão 8
  highlightChanges?: boolean;  // padrão true
  onCopy?: (code: string) => void;
};
```

`data-slot`: `code-tabs` na raiz, `code-tabs-axis` em cada linha (com `data-axis`),
`code-tabs-panel`, `code-tabs-footer`, `code-tabs-variables`, `code-tabs-variable-chip`.

## Estados que o teste deve cobrir

1. Renderiza o snippet do primeiro valor de cada eixo.
2. Trocar o eixo primário troca o código.
3. Opção de eixo posterior sem exemplo não aparece; trocar o eixo anterior faz o posterior pular
   para a primeira opção válida.
4. Eixo `placement: "end"` fica no fim da última linha.
5. Chip de variável troca `{{id}}` no código exibido.
6. Copiar escreve o código substituído no clipboard e chama `onCopy` com ele.
7. Controlado: `onValueChange` recebe a seleção nova e o componente não muda sem `value` novo.
8. Um eixo só: uma linha, sem a segunda.
9. Snippet sem casamento: mostra estado vazio "Sem exemplo para esta combinação." (não quebra).
10. Rodapé só aparece com `footerStart` ou `footerEnd`.

## Story

`Flowtomic UI/Molecules/CodeTabs`. Exemplos com conteúdo do próprio Flowtomic, nunca copy de
terceiros: instalar um componente pelo `flowtomic-cli` (eixo gerenciador: bun/npm/pnpm),
importar do `@flowtomic/ui` (eixo framework: Vite/Next) com linguagem TS/JS, e um exemplo de
API genérica com chips de variável `{{model}}` usando nomes neutros ("modelo-rapido",
"modelo-grande"). Sem logos de marca.
