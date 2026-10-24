# EnvDiff — spec clean room

Fonte observada: a seção "funciona com o que você já usa" de vercel.com/ai-gateway, vista só na
tela em 12/10/2026, em 1440 px. Nenhum código, CSS ou asset da página foi lido. Ver `README.md`
desta pasta.

## O que se viu (resumo)

- Uma faixa de 3 colunas: título grande à esquerda, **o diff** no meio, um parágrafo curto à
  direita ("troque só a URL base"). O diff é o argumento; o texto só confirma.
- O diff: 4 linhas em mono pequeno (~13 px), sem moldura, sem cabeçalho, sem número de linha.
  3 linhas removidas e 1 adicionada no fim.
- Cada linha tem uma **borda esquerda de 2 px** na cor do tipo (vermelho para removida, verde para
  adicionada), o sinal `-` ou `+` em seguida, e um **fundo tingido que esmaece para transparente da
  esquerda para a direita** — a linha "some" antes do fim do bloco. O texto da removida também é
  avermelhado; o da adicionada, esverdeado.
- Linhas coladas, sem espaço entre elas; altura ~20 px.

## Composição

Atom `EnvDiff`. Um `<pre>`-like em `font-mono text-[0.8125rem] leading-5`, largura do conteúdo
(`w-fit max-w-full`), com rolagem horizontal própria se uma linha não couber (`overflow-x-auto`),
nunca estourando o contêiner.

### Linha
- `type: "removed" | "added" | "context"`.
- Borda esquerda 2 px: `--destructive` (removida), `--success` (adicionada), `--border`
  (contexto).
- Sinal: `-`, `+` ou espaço, em coluna fixa de 1ch, `aria-hidden`; antes do texto, um `sr-only`
  "Removido: " / "Adicionado: " (contexto não tem).
- Fundo: `linear-gradient(to right, color-mix(in oklch, var(--destructive) 14%, transparent),
  transparent)` (e o mesmo com `--success`); contexto sem fundo. Prop `fade` (padrão `true`): com
  `false`, o fundo é a cor tingida chapada, sem esmaecer.
- Texto: removida em `color-mix(in oklch, var(--destructive) 75%, var(--foreground))`, adicionada
  em `color-mix(in oklch, var(--success) 75%, var(--foreground))`, contexto em
  `muted-foreground`. Tem que dar contraste AA nos dois modos — confira no browser.
- `px-3`, sem margem entre linhas. `whitespace-pre`.
- Valor opcional (`value`): `CHAVE=valor` vira `CHAVE` + `=` em `muted-foreground` + valor; o valor
  pode ser mascarado (`masked: true` → `••••••••` no lugar, com `sr-only` "valor oculto").

### Animação de entrada (opcional, `animate`)
- Quando o bloco entra na tela (IntersectionObserver, uma vez), as linhas aparecem em sequência: as
  removidas primeiro, 80 ms entre cada, com `opacity` 0 → 1 e `translateX(-4px)` → 0; depois uma
  pausa de 200 ms e as adicionadas, do mesmo jeito.
- Com movimento reduzido (critério do `CLAUDE.md`: `useReducedMotion()` ou `MotionConfig
  reducedMotion="always"`), tudo aparece de uma vez.
- Sem `IntersectionObserver` (jsdom), mostra tudo.

### Copiar (opcional, `copyable`)
- Botão `ghost` de ícone (`Copy` → `Check` por 2 s) no canto superior direito, visível no hover e no
  foco do bloco, e sempre visível em telas de toque (`@media (hover: none)`).
- Copia **só as linhas adicionadas e de contexto**, sem sinal, juntas por `\n` — o estado final do
  arquivo. `aria-label` "Copiar resultado".
- Falha do clipboard: o ícone vira `X` por 2 s e um `aria-live` diz "Não deu para copiar".

## API

```ts
type EnvDiffLine = {
  type: "removed" | "added" | "context";
  name: string;            // "OPENAI_API_KEY" ou a linha inteira
  value?: string;          // "sk-..." — mostrado depois de "="
  masked?: boolean;
};

type EnvDiffProps = Omit<ComponentProps<"div">, "children"> & {
  lines: EnvDiffLine[];
  fade?: boolean;          // padrão true
  animate?: boolean;       // padrão false
  copyable?: boolean;      // padrão false
  onCopy?: (text: string) => void;
  label?: string;          // aria-label do bloco; padrão "Diferença nas variáveis de ambiente"
};
```

Helper exportado: `parseEnvDiff(text: string): EnvDiffLine[]` — lê um texto no formato de diff
(`- X=1`, `+ Y=2`, `  Z=3`; linhas vazias ignoradas; `=` separa nome e valor; o primeiro `=` só).

`data-slot`: `env-diff`, `env-diff-line` (com `data-type`), `env-diff-copy`.

## Acessibilidade

- O bloco é `role="group"` com `aria-label`; as linhas são uma lista (`<ul>`/`<li>`), para o leitor
  contar.
- O sinal visual é `aria-hidden`; o tipo é dito pelo `sr-only`.
- O bloco rolável recebe `tabIndex={0}` só quando realmente transborda (medido), para rolar por
  teclado.

## Estados que o teste deve cobrir

1. Renderiza uma `li` por linha com `data-type`, sinal correto e o `sr-only` "Removido: " /
   "Adicionado: ".
2. `value` mostra `NOME=valor`; `masked` esconde o valor e diz "valor oculto".
3. `fade={false}` troca o fundo em degradê por chapado (confira o estilo inline ou a classe).
4. `copyable`: copia só adicionadas + contexto, sem sinal, juntas por `\n`; chama `onCopy`; mostra
   o check; clipboard que rejeita anuncia "Não deu para copiar".
5. `parseEnvDiff` lê `-`, `+` e contexto, separa no primeiro `=`, ignora linhas vazias.
6. `animate` com movimento reduzido mostra tudo sem esperar; sem IntersectionObserver também.
7. `label` customizado vira o `aria-label` do grupo.

## Story

`Flowtomic UI/Atoms/Code/EnvDiff`, `layout: "centered"`. Conteúdo próprio, sem marca alheia:
trocar três chaves de bibliotecas de UI por uma (`- CHART_LIB_KEY`, `- TABLE_LIB_KEY`,
`- FORMS_LIB_KEY`, `+ FLOWTOMIC_REGISTRY_URL=https://exemplo.dev/r`).

- `Default`: 3 removidas, 1 adicionada.
- `ComValores`: com valores e um mascarado.
- `Animado`: `animate`.
- `Copiavel`: `copyable`.
- `EmFaixa`: a composição da seção observada — título à esquerda, diff no meio, parágrafo à
  direita, numa grade de 3 colunas que vira 1 coluna abaixo de 768 px (prova de uso; não é parte do
  componente).
- `Escuro`: wrapper com a classe `dark`.
