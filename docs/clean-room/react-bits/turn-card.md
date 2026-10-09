# Spec de comportamento: `turn-card`

> **Proveniência (clean room).** Escrita em 09/10/2026 a partir da demo pública "Flip Card" em
> `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.

## O que a pessoa vê

Um cartão com frente e verso (uma obra: imagem na frente, ficha técnica no verso). Clicar **vira**
o cartão em 3D numa mola. Também dá para **girar com a mão**: arrastar para o lado gira
proporcionalmente; soltar faz a mola levar à face mais próxima, levando junto a velocidade do
gesto (um peteleco vira mesmo com arrasto curto). No hover, o cartão inclina na direção do
ponteiro, cresce 3% e um brilho suave segue o cursor. A sombra embaixo afina quando o cartão fica
de lado.

## API (`molecules/data-display/turn-card`)

```ts
type TurnCardProps = Omit<React.ComponentProps<"div">, "children"> & {
  front: React.ReactNode;
  back: React.ReactNode;
  flipped?: boolean; defaultFlipped?: boolean;
  onFlippedChange?: (flipped: boolean) => void;
  axis?: "y" | "x";            // default "y" (vira de lado, arrasta na horizontal)
  flipOnClick?: boolean;       // default true
  draggable?: boolean;         // default true
  /** px de arrasto para meia volta; 0 = largura (ou altura no eixo x). */
  dragDistance?: number;       // default 0
  tilt?: boolean;              // default true
  tiltMax?: number;            // default 10
  glare?: boolean;             // default true
  hoverScale?: number;         // default 1.03
  perspective?: number;        // default 1100
  stiffness?: number;          // default 170
  damping?: number;            // default 20
  disabled?: boolean;
  "aria-label"?: string;       // default "Virar cartão"
};
```
Tamanho vem do pai/`className` (ex. `w-72 aspect-[3/4]`).

## Regras

1. **Faces:** dois `div` absolutos com `backface-visibility: hidden`; o verso já começa girado
   180°. O contêiner gira (`rotateY` ou `rotateX`) via `useSpring` com `stiffness`/`damping`.
2. **Cores (só tokens):** faces `bg-card text-card-foreground border rounded-xl`, sombra
   `shadow-lg`, brilho com `bg-[radial-gradient(...)]` usando `var(--background)` com
   transparência via `color-mix` (nada de rgba). Sombra embaixo: elemento `bg-foreground/20 blur`
   com `scaleX = |cos(ângulo)|`.
3. **Clique** (pointerdown→up com < 4 px): alterna. **Arrastar:** ângulo = base + 180 * dx /
   distância. Soltar: alvo = face mais próxima considerando velocidade (função pura
   `settleFace(angle, velocity)` → múltiplo de 180 mais próximo de `angle + velocity * 0.15`).
   O estado `flipped` = alvo/180 ímpar. Chama `onFlippedChange` só se mudou.
4. **Inclinação e brilho:** no hover, o cartão inteiro (wrapper externo, não o que vira) inclina
   até `tiltMax` e escala `hoverScale`; o brilho se move com o ponteiro (custom properties
   `--gx`/`--gy`). Desliga durante o arrasto.
5. **Acessibilidade:** a raiz é `role="button"` focável com `aria-pressed={flipped}` e o
   `aria-label`. Enter/Espaço viram. A face escondida recebe `aria-hidden` e `inert`.
6. **Disabled:** sem inclinação, sem virar.

## Movimento reduzido

Virar troca de face com fade cruzado (sem rotação 3D); sem inclinação, brilho nem escala.

## Marcação

Raiz `data-slot="turn-card"`, `data-flipped`. Partes: `turn-card-front`, `turn-card-back`,
`turn-card-glare`, `turn-card-shadow`.

## Testes mínimos

- Pura `settleFace` (sem velocidade → mais próxima; velocidade alta passa para a próxima face;
  ângulos negativos).
- Clique vira: `aria-pressed` true, `onFlippedChange(true)`; Enter vira de volta.
- Face escondida `aria-hidden`/`inert` e troca ao virar.
- `flipOnClick=false` não vira no clique; Enter continua virando (o teclado não depende dessa prop).
- Controlado (`flipped`) respeita a prop. Disabled ignora. Movimento reduzido vira. `ref`/`className`.
