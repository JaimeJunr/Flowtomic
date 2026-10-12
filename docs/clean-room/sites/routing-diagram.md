# RoutingDiagram — spec clean room

Fonte observada: a seção "Optimize routing for availability, cost, or latency" de
vercel.com/ai-gateway (3 abas, quadros capturados a cada 600 ms) e a seção "Dynamic Routing" de
cloudflare.com/products/ai-gateway, vistas só na tela em 12/10/2026. Nenhum código, CSS ou asset
dessas páginas foi lido. Ver `README.md` desta pasta.

## Para que serve

Explicar **uma regra de roteamento sem texto**: um pedido sai de uma origem, passa por perguntas
("O provedor caiu?", "Usuário pago?") e chega a um destino. Vários **cenários** (abas) contam a
mesma estrutura com outro critério, e o caminho escolhido acende. Uso: landing de gateway, de
fila, de feature flag, de balanceador; doc de arquitetura.

É **ilustração**, não editor: sem arrastar, sem zoom, sem conectar. O editor de fluxo do Flowtomic
é o `canvas`/`node`/`edge` (React Flow); este componente não usa React Flow.

## Composição

Uma moldura (`border`, `rounded-xl`, fundo `card`, padrão de pontos bem sutil no fundo usando
`--border`) com:

1. **Abas de cenário** no canto superior esquerdo, compactas (pílula `muted` na ativa). Com um
   cenário só, sem abas.
2. **Texto do cenário** (opcional): um parágrafo curto por cenário, renderizado **fora** do
   diagrama, num slot que o consumidor posiciona (ver API). Troca junto com a aba.
3. **Diagrama**, da esquerda para a direita:
   - **Origem**: um mini "app" esquemático — barra de 3 pontinhos, um rótulo grande esmaecido,
     e 4–5 barras cinza de esqueleto. Só `muted`/`border`, sem conteúdo real. Pode ser trocado
     por um nó qualquer via prop.
   - **Decisão**: pílula contornada com a pergunta em texto pequeno.
   - **Destino**: cartão retangular com ícone opcional, nome em cima, id em mono embaixo
     (truncado com reticências) e um **selo** à direita (ex.: "Fora do ar", "R$ 0,28 / 1M",
     "180 ms").
   - **Arestas**: curvas suaves (Bézier cúbica) que saem horizontais e chegam horizontais. Sobre
     cada aresta que sai de uma decisão, um **rótulo em pílula** no meio da curva ("sim"/"não",
     "primário"/"reserva").
4. Árvore de qualquer profundidade (decisão pode levar a outra decisão), como a da Cloudflare
   ("Usuário pago?" → sim → modelo A → reserva → modelo B; não → "RPS > 1,5?" → …). Um destino
   pode ter uma aresta de **reserva** para outro destino (cadeia horizontal).

## Estado visual

- **Caminho ativo** (da origem até o destino escolhido): traço `foreground`, 1,5 px, cheio.
  Rótulos no caminho ativo viram pílula cheia (`foreground` com texto `background`). O destino
  ativo ganha borda `foreground` e o selo dele fica cheio (fundo `foreground`).
- **Fora do caminho**: traço `border` mais claro, tracejado (4 4), rótulo em pílula contornada
  `muted-foreground`, destino com borda `border` e selo contornado.
- **Destino com problema** (`status: "down"`): selo em `muted`, texto do nome normal. Não usar
  vermelho: a mensagem é "foi desviado", não "erro".
- Variante de cor `tone="brand"`: o caminho ativo usa `--primary` em vez de `foreground` (é o
  look da Cloudflare). Padrão: `neutral`.

## Animação

- Ao montar (quando entra na tela, via IntersectionObserver, uma vez) e ao trocar de cenário:
  1. O caminho ativo antigo volta ao estado "fora" em 150 ms.
  2. O novo caminho **se desenha** da origem ao destino (stroke-dashoffset/pathLength de 0 a 1),
     aresta por aresta em sequência, ~250 ms cada.
  3. Quando o traço chega num rótulo, a pílula enche (150 ms). Quando chega ao destino, a borda e
     o selo enchem (200 ms).
- Opcional `pulse` (padrão `true`): depois de desenhado, um ponto pequeno (`foreground` ou
  `primary`) percorre o caminho ativo da origem ao destino a cada 2,4 s, representando um pedido.
  Para quando a aba do navegador fica oculta e quando o componente sai da tela.
- `autoPlay` (padrão `false`): troca de cenário sozinho a cada 5 s, pausando no hover/foco e
  parando de vez depois que a pessoa clica numa aba.
- Movimento reduzido: sem desenho progressivo, sem pulso, sem autoPlay; o estado final aparece
  direto.

## Layout

- Colunas por profundidade, linhas pela ordem das folhas. O componente calcula posições a partir
  da árvore; o consumidor não passa coordenadas.
- Mede a largura do contêiner (ResizeObserver) e redesenha as curvas em pixels (sem `viewBox`
  esticado: ver armadilha do `preserveAspectRatio="none"` no `CLAUDE.md`).
- Abaixo de 640 px de largura: layout **vertical** (de cima para baixo), arestas saindo e
  chegando na vertical, e a origem vira uma faixa estreita no topo.
- Altura: a do conteúdo; nada de altura fixa.

## Acessibilidade

- Abas: Radix Tabs, `aria-label` "Cenários".
- O diagrama é `role="img"` com `aria-label` gerado do cenário ativo: "Origem → <pergunta>:
  <rótulo> → … → <destino>". Ex.: "App → O provedor caiu?: reserva → Modelo X em Provedor B".
  Prop `ariaLabel` sobrescreve.
- Uma lista visualmente oculta (`sr-only`) com os passos do caminho ativo, atualizada com
  `aria-live="polite"` ao trocar de cenário.
- SVG decorativo com `aria-hidden`.

## API

```ts
type RoutingTarget = {
  kind: "target";
  id: string;
  title: ReactNode;
  subtitle?: string;          // mono, truncado
  icon?: ReactNode;
  badge?: ReactNode;
  status?: "ok" | "down";
  fallback?: { label?: string; to: RoutingTarget };  // cadeia horizontal
};

type RoutingDecision = {
  kind: "decision";
  id: string;
  question: ReactNode;
  branches: { label: string; to: RoutingNode }[];
};

type RoutingNode = RoutingDecision | RoutingTarget;

type RoutingScenario = {
  value: string;
  label: ReactNode;          // texto da aba
  description?: ReactNode;   // vai para o slot de descrição
  root: RoutingNode;         // o que vem logo depois da origem
  activePath: string[];      // ids dos nós no caminho, em ordem, terminando no destino
};

type RoutingDiagramProps = Omit<ComponentProps<"div">, "defaultValue"> & {
  scenarios: RoutingScenario[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  source?: ReactNode;          // substitui o app esquemático
  sourceLabel?: string;        // padrão "App"; usado no mock e no aria-label
  tone?: "neutral" | "brand";
  pulse?: boolean;
  autoPlay?: boolean;
  ariaLabel?: string;
  renderDescription?: (description: ReactNode) => ReactNode;  // padrão: parágrafo abaixo do diagrama
};
```

Exportar também `RoutingDiagramDescription`, um componente que lê o cenário ativo por contexto,
para o consumidor pôr a descrição onde quiser (ex.: ao lado do título da seção, como na Vercel),
desde que fique dentro de um `<RoutingDiagram.Root>`/provider. Se isso complicar, aceitar só
`renderDescription`, e documentar.

`data-slot`: `routing-diagram` (raiz), `routing-diagram-tabs`, `routing-diagram-canvas`,
`routing-diagram-source`, `routing-diagram-decision`, `routing-diagram-target` (com
`data-active` e `data-status`), `routing-diagram-edge-label` (com `data-active`),
`routing-diagram-description`.

## Estados que o teste deve cobrir

1. Renderiza origem, decisões, destinos e rótulos do cenário inicial.
2. O destino e os rótulos do `activePath` têm `data-active="true"`; os demais, `"false"`.
3. Trocar de aba troca o caminho ativo e a descrição.
4. Controlado: `onValueChange` chamado; sem `value` novo, nada muda.
5. Com um cenário só, não há abas.
6. `aria-label` do diagrama descreve o caminho ativo; muda ao trocar de cenário.
7. Árvore com decisão aninhada e destino com `fallback` renderiza todos os nós.
8. `status: "down"` marca `data-status="down"` no destino.
9. Movimento reduzido: sem elemento de pulso.
10. `autoPlay` avança de cenário com timers falsos (o timer é próprio, não do motion) e para
    depois de um clique em aba.
11. `activePath` com id inexistente não quebra: nada fica ativo e um `console.warn` em dev.

## Story

`Flowtomic UI/Organisms/RoutingDiagram`, `layout: "padded"`. Conteúdo neutro, sem marcas nem
logos de terceiros:

- `Default`: 3 cenários — **Disponibilidade** ("O provedor caiu?" → primário "Modelo
  Rápido / provedor-a/modelo-rapido" com selo "Fora do ar" e `status: "down"`; reserva "Modelo
  Rápido / provedor-b/modelo-rapido" ativo), **Custo** ("Menor custo por token?" → sim: "Modelo
  Grande" "R$ 150 / 1M"; não: "Modelo Compacto" "R$ 1,40 / 1M" ativo), **Latência** ("Primeira
  resposta mais rápida?" → sim: "Modelo Ágil" "180 ms" ativo; não: "Modelo Grande" "320 ms").
- `ArvoreComReserva`: estilo Cloudflare, `tone="brand"`, uma decisão aninhada e um destino com
  `fallback`.
- `UmCenario`: sem abas.
- `DescricaoAoLado`: título da seção à esquerda, descrição do cenário à direita, diagrama
  embaixo, demonstrando o slot de descrição.
- `Estreito`: dentro de um contêiner de 360 px para mostrar o layout vertical.
