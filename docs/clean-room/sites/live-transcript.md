# LiveTranscript — spec clean room

Fonte observada: os painéis de demonstração de perssua.com/pt ("Veja em ação" e "Tradução ao
vivo"), vistos só na tela em 12/10/2026, em 1440 px. Nenhum código, CSS ou asset da página foi
lido. Ver `README.md` desta pasta.

## O que se viu (resumo)

- Um painel escuro arredondado com três faixas: **conversa** em cima, **medidores de áudio** no
  meio, **controles** embaixo, separadas por linhas finas.
- A fala de quem está do outro lado aparece em **itálico, entre aspas, em `muted-foreground`**,
  grande (~20 px). Logo abaixo, um **bloco destacado** (fundo levemente tingido da cor da marca,
  borda da cor da marca em baixa opacidade, `rounded-xl`) com a tradução ou a sugestão de resposta,
  em texto normal e mais claro. Um rótulo pequeno na cor da marca, com um ponto, diz o que é o bloco.
- Medidores: uma linha por fonte ("Você", "Outros"), cada uma com uma barra fina horizontal de nível
  e, na ponta, um selo pequeno com o idioma detectado. Um cabeçalho "Medidores de áudio" com ícone
  de barras e um "Ocultar" à direita.
- Controles: pausar e parar (botões quadrados só com ícone), um seletor de idioma com ícone de
  globo, e à direita um único botão sólido ("Analisar transcrição") com o atalho num selo.
- Abas em pílula acima da conversa ("Transcrição", "Sessão", "Resumo") e um ponto pulsando no
  canto, sinal de que está gravando.

O que **não** copiar: os rótulos em caixa alta espaçada ("ELES DISSERAM:") — tell proibido no
`CLAUDE.md` —, o glifo `⌘` e as abas (são do produto deles; aqui a conversa é o componente).

## Composição

Organism `LiveTranscript`. `<section>` com `@container`, `rounded-2xl border bg-card`, três faixas
separadas por `border-t`. Funciona claro e escuro só com tokens (o destaque usa
`color-mix(in oklch, var(--primary) 8%, transparent)` no fundo e 30% na borda).

### 1. Cabeçalho (opcional, `title`)
- Título à esquerda (`text-sm font-medium`), e à direita o **estado**: ponto + texto.
  `status: "live" | "paused" | "stopped" | "connecting"` → "Ao vivo" (ponto `--primary` pulsando;
  sem pulsar com movimento reduzido), "Pausado", "Encerrado", "Conectando…" (ponto `muted`).
- Duração opcional (`elapsed` em segundos) em `font-mono tabular-nums`, formato `mm:ss` ou
  `h:mm:ss`.

### 2. Conversa (`role="log"`)
- Lista de falas, de cima para baixo, rolável com altura máxima (`maxHeight`, padrão `28rem`).
- Cada fala (`LiveTranscriptEntry`):
  - Linha de meta pequena em `muted-foreground` e caixa normal: nome de quem fala + hora
    (`font-mono`), por exemplo "Outros · 14:02". Sem caixa alta.
  - Texto da fala. **Fala de terceiros** (`side: "them"`) em itálico, `muted-foreground`, entre
    aspas tipográficas inseridas por CSS (`before:content-['“'] after:content-['”']`), não no texto.
    **Fala própria** (`side: "me"`) em texto normal `foreground`.
  - `annotation` opcional: o bloco destacado abaixo da fala, com rótulo (`annotation.label`, ex.
    "Tradução para português", "Sugestão de resposta") precedido de um ponto `--primary`, e o
    conteúdo em `foreground`, `text-base` ou maior. Ação opcional no rodapé do bloco
    (`annotation.action`: `{ label, onClick }`), um botão `ghost` pequeno, ex. "Copiar".
  - Fala **parcial** (`partial: true`, ainda sendo reconhecida): texto em `muted-foreground` com um
    cursor fino piscando no fim (sem piscar com movimento reduzido), `aria-busy`.
- Tamanho do texto da fala: `text-lg` a partir de 640 px de contêiner, `text-base` abaixo.
- Estado vazio (`entries` vazio): instrução concreta, não ilustração — `emptyState` (ReactNode),
  padrão "Nada transcrito ainda. Fale ou compartilhe o áudio da reunião para começar."

### Rolagem automática
- Enquanto a pessoa está no fim da lista (a menos de 48 px do fundo), fala nova rola para o fim.
- Se ela rolou para cima para reler, **não** puxa de volta: aparece um botão flutuante centrado no
  pé da conversa, "N falas novas" (ou "1 fala nova"), com ícone de seta para baixo do lucide; clicar
  rola para o fim e some.
- Com movimento reduzido, rolagem sem `smooth`.

### 3. Medidores (opcional, `meters`)
- Cabeçalho da faixa: ícone `AudioLines` + "Medidores de áudio" e botão de texto "Ocultar" /
  "Mostrar" (`metersCollapsible`, padrão `true`); o recolhido fica só com o cabeçalho.
- Uma linha por medidor: rótulo (`w-16`, `text-xs muted-foreground`), barra de nível (`h-1`,
  trilho `muted`, preenchimento `--primary` com largura `level * 100%`, transição curta de largura),
  e na ponta um `Badge` pequeno com o idioma (`language`, opcional).
- Cada barra é `role="meter"` com `aria-valuemin=0`, `aria-valuemax=100`, `aria-valuenow`
  arredondado e `aria-label` "Nível de áudio: <rótulo>".
- `level` fora de 0..1 é preso nos limites.

### 4. Controles (opcional, `controls`)
- Esquerda: pausar/retomar (`Pause`/`Play`) e parar (`Square`), botões `outline` de ícone com
  `aria-label` ("Pausar", "Retomar", "Parar"), ocultos se não houver o callback; com
  `status="stopped"` ficam desabilitados.
- Seletor de idioma (`languages: { value, label }[]`, `language`, `onLanguageChange`) com o Select
  do repo e ícone `Globe`; rótulo acessível "Idioma da tradução".
- Direita: **um** botão sólido (`primaryAction`: `{ label, onClick, shortcut? }`). O atalho é
  texto num `Kbd` do repo (ex. "Ctrl D"), sem glifo `⌘`, e o botão ganha `aria-keyshortcuts`.
  O componente **não** registra atalho global; quem usa decide.
- Abaixo de 480 px de contêiner: o botão principal vai para uma linha própria, largura total.

## API

```ts
type LiveTranscriptEntry = {
  id: string;
  speaker: ReactNode;            // "Outros", "Você", "Ana"
  side?: "them" | "me";          // padrão "them"
  text: ReactNode;
  time?: string;                 // já formatada, ex. "14:02"
  partial?: boolean;
  annotation?: {
    label: ReactNode;
    content: ReactNode;
    action?: { label: ReactNode; onClick: () => void };
  };
};

type LiveTranscriptMeter = { id: string; label: ReactNode; level: number; language?: ReactNode };

type LiveTranscriptProps = Omit<ComponentProps<"section">, "title"> & {
  entries: LiveTranscriptEntry[];
  title?: ReactNode;
  status?: "live" | "paused" | "stopped" | "connecting";   // padrão "live"
  elapsed?: number;
  meters?: LiveTranscriptMeter[];
  metersCollapsible?: boolean;
  defaultMetersOpen?: boolean;   // padrão true
  onPause?: () => void;
  onResume?: () => void;
  onStop?: () => void;
  languages?: { value: string; label: string }[];
  language?: string;
  onLanguageChange?: (value: string) => void;
  primaryAction?: { label: ReactNode; onClick: () => void; shortcut?: string };
  emptyState?: ReactNode;
  maxHeight?: string;            // padrão "28rem"
  autoScroll?: boolean;          // padrão true
};
```

`data-slot`: `live-transcript`, `live-transcript-header`, `live-transcript-log`,
`live-transcript-entry` (com `data-side` e `data-partial`), `live-transcript-annotation`,
`live-transcript-meters`, `live-transcript-controls`, `live-transcript-jump`.

## Acessibilidade

- `<section aria-labelledby>` no título; sem título, `aria-label` "Transcrição ao vivo".
- A conversa é `role="log"` com `aria-live="polite"` e `aria-relevant="additions"`; falas parciais
  ficam com `aria-busy="true"` e só entram no anúncio quando deixam de ser parciais (o texto parcial
  vai num elemento `aria-hidden` enquanto `partial`, com o texto final num `sr-only` só depois).
- O estado ("Ao vivo", "Pausado") é texto, não só cor.
- O botão "N falas novas" é um `<button>` alcançável por teclado.

## Estados que o teste deve cobrir

1. Renderiza a seção nomeada pelo título (ou "Transcrição ao vivo"), uma fala por entrada, com
   nome e hora.
2. `side="them"` em itálico com `data-side="them"`; `side="me"` sem itálico.
3. `annotation` mostra rótulo e conteúdo; a ação chama `onClick`.
4. `partial` marca `data-partial` e `aria-busy`.
5. Lista vazia mostra o `emptyState` (padrão e customizado).
6. `status` muda o texto do estado; `elapsed` 75 vira "01:15" e 3725 vira "1:02:05".
7. Medidores: `role="meter"` com `aria-valuenow` (0.42 vira 42; 1.7 vira 100; -1 vira 0);
   "Ocultar" esconde as barras e "Mostrar" traz de volta.
8. Controles: pausar com `status="live"` chama `onPause`; com `status="paused"` o botão vira
   "Retomar" e chama `onResume`; parar chama `onStop`; tudo desabilitado com `status="stopped"`.
9. `primaryAction` chama `onClick`, mostra o atalho e põe `aria-keyshortcuts`.
10. Rolagem: com a lista no fim, entrada nova não mostra o botão; com `scrollTop` simulado longe do
    fim, entrada nova mostra "1 fala nova", duas mostram "2 falas novas", e clicar some com ele.
    (No jsdom, defina `scrollHeight`/`clientHeight`/`scrollTop` com `Object.defineProperty`.)

## Story

`Flowtomic UI/Organisms/LiveTranscript`, `layout: "padded"`. Conteúdo próprio, sem marca alheia:
uma reunião de planejamento em que "Outros" fala em inglês e a anotação traz a tradução em
português ("We should ship the dark theme before the docs" / "Deveríamos lançar o tema escuro antes
da documentação"), e uma pergunta de cliente com "Sugestão de resposta".

- `Default`: título "Reunião de planejamento", ao vivo, 3 falas, medidores, controles e botão
  "Analisar transcrição" com atalho "Ctrl D".
- `Simulada`: falas chegando a cada 1,5 s (um `setInterval` na story, limpo no unmount), a última
  parcial antes de virar final — prova a rolagem automática e o botão de falas novas.
- `Vazia`: sem falas, `status="connecting"`.
- `Pausada`: `status="paused"`, medidores recolhidos.
- `Estreito`: contêiner de 360 px.
- `Escuro`: wrapper com a classe `dark`.
