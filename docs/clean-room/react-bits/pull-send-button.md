# Spec de comportamento: `pull-send-button`

> **Proveniência (clean room).** Escrita em 09/10/2026 a partir da demo pública "Sling Button" em
> `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.

## O que a pessoa vê

Um botão redondo de enviar (seta) assentado num "poço". Dá para **puxar** o botão para longe: um
elástico liga o botão ao poço e estica; um arco em volta do poço mostra a força. Passando de 48 px
o envio fica "carregado" (elástico e arco mudam para a cor de destaque). Ao soltar carregado, o
botão é **lançado** de volta, atravessa o poço um pouco e assenta numa mola, e uma rajada de
partículas sai na direção do lançamento. Soltar sem carregar só volta. Um toque simples ou Enter
também envia.

## API (`atoms/actions/pull-send-button`)

```ts
type PullSendButtonProps = Omit<React.ComponentProps<"button">, "onClick"> & {
  children?: React.ReactNode;        // default lucide ArrowUp
  onSend: () => void;
  size?: number;                     // diâmetro, default 48
  armAt?: number;                    // default 48 px
  maxPull?: number;                  // default 140 px (resistência cresce até parar)
  recoil?: number;                   // 0..1, default 0.2
  flight?: number;                   // px da partícula principal, default 120
  particles?: number;                // default 12 (0 = nenhuma)
  spread?: number;                   // graus do cone, default 60
  axis?: "any" | "horizontal" | "vertical"; // default "any"
  tapSends?: boolean;                // default true
  "aria-label"?: string;             // default "Enviar"
};
```

## Regras

1. `<button type="button">`; Enter e Espaço enviam (nativo do botão → `onSend`).
2. **Cores (só tokens):** botão `bg-primary text-primary-foreground`, poço `bg-muted`, elástico
   em repouso `stroke-border`, carregado `stroke-primary`, arco `stroke-primary`, partículas
   `bg-primary`.
3. **Puxar:** pointerdown + move com `setPointerCapture`. Deslocamento com resistência: função
   pura `resistPull(dx, dy, maxPull, axis)` → distância nunca passa de `maxPull`
   (curva suave tipo `max * (1 - e^(-d/max))`); com eixo, o outro componente é reduzido a 15%.
4. **Elástico:** SVG `line` do centro do poço ao botão; espessura diminui com a distância
   (função pura `bandWidth(distance, maxPull)`, mín. 1 px).
5. **Arco de força:** círculo em volta do poço, `pathLength` = distância / armAt (limitado a 1).
6. **Soltar:** `loaded = distance >= armAt` (função pura `isLoaded`). Carregado: chama `onSend`,
   anima o botão para `-direção * k` (atravessa o poço) e volta por mola com bounce `recoil`;
   dispara partículas. Não carregado: volta por mola sem enviar.
7. **Partículas:** `particles` spans absolutos (`aria-hidden`), cada um com ângulo aleatório no
   cone `spread` em torno da direção oposta ao puxão, alcance `flight * (0.5..1)`, tamanho e
   atraso aleatórios; somem com fade. Gerador puro `burst(count, angle, spread, flight, rng)`
   com `rng` injetável para teste. Toque e teclado lançam para cima.
8. **Toque:** pointerup com distância < 4 px conta como toque; envia se `tapSends`.
9. **Disabled:** `opacity-50`, ignora.

## Movimento reduzido

Sem puxar visual (o botão não segue o ponteiro), sem partículas, sem mola: toque e teclado enviam.

## Marcação

Raiz (wrapper): `data-slot="pull-send-button"`, `data-loaded`. `ref` no `<button>`.
Partes: `pull-send-button-band`, `pull-send-button-arc`, `pull-send-button-particle`.

## Testes mínimos

- Puras: `resistPull` (perto = quase linear; longe nunca passa de max; eixo reduz o outro),
  `bandWidth`, `isLoaded`, `burst` com rng fixo (quantidade, ângulos dentro do cone, 0 → vazio).
- Clique envia; `tapSends=false` não envia no clique mas Enter envia.
- Arrasto além de `armAt` e soltar envia uma vez e cria partículas; antes de `armAt` não envia.
- Disabled ignora. Movimento reduzido: clique envia sem partículas. `ref`/`className`.
