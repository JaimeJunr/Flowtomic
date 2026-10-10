# Spec de comportamento: `swipe-stack`

> **Proveniência (clean room).** Escrita em 10/10/2026 a partir da demo pública "Stack" em
> `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.

## O que a pessoa vê

Uma **pilha de cartões** (fotos ou conteúdo). O de cima está inteiro; os de trás aparecem um
pouco, em leque, em cascata, em baralho ou espalhados como fotos soltas, menores e mais escuros.
A pessoa **arrasta** o cartão de cima, que **inclina em 3D** em volta do ponto agarrado; passando
de um limite (ou num arremesso rápido) ele **vai para o fim da pilha** e os outros sobem uma
posição. Solto antes do limite, volta com mola. Pode girar sozinho (autoplay).

## Por que existe (uso no produto)

Depoimentos de clientes, destaques de produto ou cartões de onboarding num espaço pequeno.

## API (`molecules/data-display/swipe-stack`)

```ts
type SwipeStackProps = Omit<React.ComponentProps<"div">, "onChange"> & {
  /** Cartões, o primeiro em cima. */
  cards: React.ReactNode[];
  /** Rótulo de cada cartão para leitor de tela (mesmo tamanho de `cards`). */
  labels: string[];
  layout?: "fan" | "cascade" | "deck" | "pile";  // default "fan"
  visible?: number;          // cartões visíveis contando o de cima, default 4
  spread?: number;           // 0..1, default 0.5
  depth?: number;            // 0..1, default 0.5
  tilt?: number;             // graus máx. durante o arraste, default 30 (0 = plano)
  threshold?: number;        // px para mandar ao fim, default 90
  speed?: number;            // 0.5..2, multiplica a rigidez das molas, default 1
  sendToBackOnClick?: boolean;  // default false
  autoplay?: boolean;        // default false
  autoplayDelay?: number;    // ms, default 3000
  pauseOnHover?: boolean;    // default false
  onChange?: (topIndex: number) => void;
};
```

## Regras

1. **Ordem.** Estado `order: number[]` (índices de `cards`); o de cima é `order[0]`. "Mandar ao
   fim" = rotação `[a, ...rest] → [...rest, a]` (pura `cycle(order)`).
2. **Pose de cada posição (pura `restPose(position, layout, spread, depth)` → `{ x, y, rotate,
   scale, shade }`)**, posição 0 = topo com pose neutra:
   - `fan`: gira `position · 6° · spread·2` em volta do canto inferior esquerdo (`transform-origin`);
   - `cascade`: `x = y = position · 14px · spread·2`;
   - `deck`: `y = -position · 10px · spread·2`;
   - `pile`: rotação e deslocamento pseudoaleatórios estáveis por posição (`mulberry32(posição)`),
     até `±12°·spread·2` e `±18px·spread·2`;
   - em todos: `scale = 1 - position · 0.06 · depth·2`, `shade = position · 0.15 · depth·2`.
   Posições ≥ `visible` ficam ocultas (`opacity 0`) na pose da última visível.
3. **Estrutura.** Raiz `relative select-none [perspective:900px]` com tamanho vindo do
   `className` (story `size-64`). Cartões `absolute inset-0 rounded-xl overflow-hidden bg-card
   border shadow-lg`, `z-index` decrescente pela posição; `img` filho com `size-full
   object-cover` (`[&_img]:...`). Sombra de profundidade por uma camada `bg-background` com
   `opacity = shade`.
4. **Arraste do topo.** Pointer capture no cartão de cima; segue o ponteiro em x/y
   (`MotionValue`s). Inclinação 3D: `rotateY = clamp(dx/largura·tilt)`, `rotateX =
   clamp(-dy/altura·tilt)`, com `transform-origin` no ponto agarrado (relativo ao cartão).
   Soltar: se `|deslocamento| > threshold` ou `|velocidade| > 600 px/s` (pura `shouldSend(offset,
   velocity, threshold)`), o cartão sai para fora na direção do arraste, vira o último
   (`cycle`) e anima até a pose da posição final; senão volta a 0 com mola (`animate`, rigidez
   `300·speed`).
5. **Clique.** Com `sendToBackOnClick`, clique sem arraste (< 4 px) manda o topo ao fim.
6. **Autoplay.** A cada `autoplayDelay` ms manda o topo ao fim; pausa com hover se
   `pauseOnHover` e durante arraste.
7. `onChange(order[0])` sempre que o topo muda.

## Movimento reduzido

Sem inclinação nem voo: trocas instantâneas com fade; poses de repouso continuam.

## Acessibilidade

Raiz `role="region"` `aria-roledescription="pilha de cartões"`, focável; Enter/Espaço ou →
mandam o topo ao fim; ← traz o último para o topo. Só o cartão de cima fica acessível; os
demais `aria-hidden`. Um `aria-live` sr-only anuncia o rótulo do novo topo.

## Marcação

- Raiz: `data-slot="swipe-stack"`, `data-layout`, `data-dragging`, `ref`, `cn`.
- Cartão: `data-slot="swipe-stack-card"`, `data-position`.

## Testes mínimos

- `cycle` move o primeiro ao fim; `restPose` neutra na posição 0 para todos os layouts; `scale`
  cai com a posição; `pile` estável para a mesma posição; `shouldSend` por distância e por
  velocidade.
- `cards.length !== labels.length` lança erro com os dois tamanhos.
- Teclado: Enter manda ao fim, ← traz de volta, `onChange` chamado; anúncio ao vivo.
- `sendToBackOnClick` com clique manda ao fim; sem a prop, não.
- Autoplay com timers falsos troca o topo; `pauseOnHover` pausa com `pointerenter` de mouse.
- `visible` esconde posições extras (`opacity 0`).
- Movimento reduzido; `ref` e `className`.
