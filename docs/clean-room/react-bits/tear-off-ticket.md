# Spec de comportamento: `tear-off-ticket`

> **Proveniência (clean room).** Escrita em 09/10/2026 a partir da demo pública "Tear Ticket" em
> `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.

## O que a pessoa vê

Um ingresso ("Spectrum · 14 nov · Entrada única · Galeria do terraço · até 30 nov · Nº 284619")
com um **canhoto** à direita separado por uma linha picotada: furinhos redondos e dois entalhes
semicirculares nas bordas. O ingresso todo inclina um pouco em 3D na direção do ponteiro. Arrastar
o canhoto o **dobra para fora** a partir da linha: as "pontes" de papel entre os furos esticam e
vão se rompendo da ponta longe da dobradiça para a perto; o papel resiste mais no começo. Passando
de 30° o canhoto se solta, cai girando e some. O resto do ingresso desliza para o centro e a arte
fica cinza (usado). Enter ou Espaço no canhoto também rasgam.

## API (`molecules/data-display/tear-off-ticket`)

```ts
type TearOffTicketProps = Omit<React.ComponentProps<"div">, "children"> & {
  children: React.ReactNode;           // corpo
  stub: React.ReactNode;               // canhoto
  image?: string; imageAlt?: string;   // arte no corpo (parallax e cinza quando usado)
  orientation?: "horizontal" | "vertical"; // default "horizontal"
  torn?: boolean; defaultTorn?: boolean; onTear?: () => void;
  width?: number;      // default 460 (encolhe para caber no pai)
  height?: number;     // default 250
  stubSize?: number;   // default 150
  holes?: number;      // default 12
  holeSize?: number;   // default 6
  notch?: number;      // default 8 (raio do entalhe)
  tearAngle?: number;  // default 30
  resistance?: number; // 0..1, default 0.45
  restRotate?: number; // default 0 (graus no plano)
  tilt?: boolean;      // default true
  tiltMax?: number;    // default 8
  recenter?: boolean;  // default true
  disabled?: boolean;
  stubLabel?: string;  // default "Destacar o canhoto"
};
```

## Regras

1. **Forma:** corpo e canhoto são dois elementos com `mask` (ou `clip-path: path()`) gerada por
   funções puras: `perforationHoles(length, holes, holeSize)` → centros ao longo da linha;
   `pieceMask(...)` → SVG/`radial-gradient` com os furos cortados pela metade em cada peça e o
   entalhe nas pontas. Os furos são vazados de verdade (transparentes), não um `border-dashed`.
2. **Cores (só tokens):** papel `bg-card text-card-foreground`, contorno opcional `border-border`
   seguindo a forma (pode ser omitido se a máscara não permitir; documentar), arte com
   `grayscale` quando usado.
3. **Inclinação:** `rotateX/rotateY` até `tiltMax` pela posição do ponteiro na página
   (perspectiva 1000 px), com mola; arte desloca no sentido contrário (parallax 6 px).
4. **Rasgar arrastando:** pointer capture no canhoto. O ângulo de dobra (rotação em torno da
   linha picotada, `transform-origin` na linha) cresce com o arraste, atenuado por
   `resistance * (1 - fraçãoRompida)`. Função pura `tearProgress(angle, tearAngle, holes)` →
   quantas pontes romperam (da mais longe para a mais perto da dobradiça). As pontes rompidas
   viram um pequeno vão (fiapos opcionais). Soltar antes de `tearAngle` → volta por mola.
   Passou → solta: cai (y + rotação) e some; `onTear()`.
5. **Teclado:** canhoto é `role="button"` focável com `aria-label={stubLabel}`; Enter/Espaço
   rasga direto (animação curta).
6. **Depois de rasgado:** canhoto some do DOM acessível; com `recenter`, o corpo desliza até o
   centro da caixa original; arte cinza; raiz `data-torn="true"`. `torn=false` controlado
   restaura.
7. **Vertical:** canhoto embaixo, arte em cima.
8. **Disabled:** `opacity-50`, sem inclinação nem rasgo.

## Movimento reduzido

Sem inclinação nem parallax; rasgar (arrastando ou teclado) faz o canhoto sumir com fade.

## Marcação

Raiz `data-slot="tear-off-ticket"`, `data-torn`. Partes: `tear-off-ticket-body`,
`tear-off-ticket-stub`, `tear-off-ticket-image`.

## Testes mínimos

- Puras: `perforationHoles` (quantidade, espaçamento uniforme, dentro da linha),
  `tearProgress` (0 → nada; ≥ tearAngle → todas; ordem: a mais longe rompe primeiro).
- Enter no canhoto → (timers) `onTear` uma vez, `data-torn="true"`, canhoto fora da árvore de a11y.
- `defaultTorn` começa rasgado. `torn` controlado volta a inteiro.
- `orientation="vertical"` marca `data-orientation`. Disabled ignora teclado.
- Movimento reduzido rasga. Imagem tem `alt`. `ref`/`className`.
