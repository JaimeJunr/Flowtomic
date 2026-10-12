# Spec de comportamento: `pulse-grid`

> **Proveniência (clean room).** Escrita em 11/10/2026 a partir da demo pública "Ripple Grid" em
> `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.
> Segue o contrato `_fundo-webgl.md`. Versão enxuta: o original tem 21 props.

## O que a pessoa vê

Uma **grade fina** e discreta sobre fundo escuro. De tempos em tempos, uma **onda** sai do centro
e se espalha: por onde passa, entorta a grade e acende as linhas. O mouse deixa um rastro de
ondinhas e acende as linhas por perto; um clique solta uma onda forte. Ao montar, a primeira onda
revela a grade.

## API (`atoms/background/pulse-grid`)

```ts
type PulseGridProps = React.ComponentProps<"div"> & {
  color?: string;          // token; default "--foreground"
  variant?: "lines" | "dots" | "cross"; // default "lines"
  cellSize?: number;       // px; 8–200, default 48
  lineWidth?: number;      // px; 0,5–4, default 1
  glow?: number;           // 0–1, default 0.6
  rippleStrength?: number; // 0–2, default 1
  rippleSpeed?: number;    // default 1
  rippleInterval?: number; // segundos entre ondas automáticas; 0 desliga; default 2.6
  fade?: number;           // 0–1, default 0.5
  pointer?: boolean;       // rastro + clique; default true
  children?: React.ReactNode;
};
```

## Regras

1. **Ondas.** Até 8 ondas vivas num array de uniforms `vec3(x, y, início)` (px de tela, segundos
   de `uTime`), mais a força em outro array. A fila é pura (`pushRipple(lista, onda, max = 8)`
   descarta a mais velha). Automática: a cada `rippleInterval` s, no centro, força 1. Clique: no
   ponto, força 2. Movimento do mouse: uma a cada 120 ms no ponto, força 0,35. A primeira onda
   automática sai em `uTime = 0` (a entrada).
2. **Deformação.** Para cada onda, com `r = distância` e `age = uTime − início`, frente
   `front = age·rippleSpeed·400` (px): `w = exp(−pow((r − front)/40, 2))·exp(−age·1.2)·força`.
   O pixel é deslocado radialmente por `rippleStrength·w·12` px, e a soma `W = Σ w` guarda o brilho.
3. **Grade.** Com o ponto deslocado `q`: `cell = fract(q / cellSize)`; distância à linha mais
   próxima `d = min(min(cell), 1 − max(cell))·cellSize`. `lines`: `smoothstep(lineWidth, 0, d)`.
   `dots`: distância ao cruzamento < `lineWidth·1.5`. `cross`: linha só a menos de
   `cellSize·0.15` do cruzamento.
4. **Luz.** Base `0.18`; mais `glow·0.6·W`; perto do mouse soma `0.5·exp(−dist²/(120²))`.
5. **Fade.** Alfa multiplicado por `mix(1.0, vinheta, fade)`, vinheta como no `satin-plasma`.
6. **Saída** pré-multiplicada (`cor = uColor·alfa`), mais o dither. Story com raiz `dark bg-background`.
7. **Movimento reduzido.** Sem ondas: grade estática com a luz base.
8. **Fallback.** Grade CSS: `background-image` com dois `linear-gradient` de
   `color-mix(in oklch, var(--c) 15%, transparent)` de 1 px, `background-size` de `cellSize`.

## Testes mínimos

Contrato comum + `pushRipple` (descarta a mais velha); limites de `cellSize`, `lineWidth`, `glow`,
`rippleStrength`; `rippleInterval` 0 não agenda onda; clique com `pointer={false}` não cria onda.
