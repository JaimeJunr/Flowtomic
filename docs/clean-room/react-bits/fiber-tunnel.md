# Spec de comportamento: `fiber-tunnel`

> **Proveniência (clean room).** Escrita em 12/10/2026 a partir da demo pública "Light Tunnel"
> em `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.
> Segue o contrato `_fundo-webgl.md`. Versão enxuta: o original tem 29 props.

## O que a pessoa vê

Um **túnel de fibras ópticas** visto de frente: dezenas de **cabos finos** saem de um ponto de
fuga escuro no centro e se abrem até as bordas, levemente **curvados e ondulando**. Ao longo de
cada cabo correm **pulsos de luz** que viajam para fora (ou para dentro), cada um num ritmo. O
contorno dos cabos brilha de leve; o centro some no escuro e as bordas esmaecem. O mouse **puxa
o ponto de fuga** um pouco.

## API (`atoms/background/fiber-tunnel`)

```ts
type FiberTunnelProps = React.ComponentProps<"div"> & {
  cableColor?: string;   // token; default "--primary"
  pulseColor?: string;   // token; default "--info"
  speed?: number;        // default 1
  direction?: "outward" | "inward"; // default "outward"
  cables?: number;       // 4–48, default 20
  thickness?: number;    // 0,1–1, default 0.35
  pulseLength?: number;  // 0,05–1, default 0.28
  waviness?: number;     // 0–1, default 0.3
  pointer?: boolean;     // paralaxe do ponto de fuga; default true
  children?: React.ReactNode;
};
```

## Regras

1. **Coordenadas.** `p = (frag − res/2)/res.y − fuga`; fuga = `(uPointer − 0.5)·0.1` com ponteiro.
   `r = length(p)`; profundidade `z = 0.25 / max(r, 1e−3)` (perto do centro é longe).
   `a = atan(p.y, p.x) + 0.15·sin(t·0.4)` (balanço) `+ waviness·0.3·sin(z·2.0 − t·0.5)`.
2. **Cabos.** Setor `k = floor(a·cables/2π)`, posição dentro `s = fract(a·cables/2π) − 0.5`.
   Meia-largura angular `thickness·0.18` (em fração do setor). Corpo
   `core = 1 − smoothstep(w·0.6, w, abs(s))`; borda `rim = exp(−abs(abs(s) − w)·40)·0.5`.
3. **Pulsos.** Fase por cabo `ph = hash(k)`; ritmo `0.7 + 0.6·hash(k + 3)`; posição ao longo
   da profundidade `u = fract(z·0.35 ± t·0.25·ritmo + ph)` (sinal pelo `direction`: `outward`
   faz o pulso ir do centro para a borda). Pulso `smoothstep(0, pulseLength·0.5, u)·(1 −
   smoothstep(pulseLength·0.5, pulseLength, u))`.
4. **Esmaecer.** `fade = smoothstep(0.04, 0.25, r)·(1 − smoothstep(0.9, 1.4, r))`.
5. **Cor.** `cableColor·(core·0.25 + rim)·fade + pulseColor·pulso·core·1.6·fade`, com variação
   por cabo `·(0.85 + 0.3·hash(k + 7))`. Alfa `max3`, `clamp`, pré-multiplicada, dither. Story
   com raiz `dark bg-background`.
6. **Movimento reduzido.** Quadro estático, sem ponteiro.
7. **Fallback.** `repeating-conic-gradient(from 0deg, color-mix(in oklch, var(--cable) 30%,
   transparent) 0deg 1.5deg, transparent 1.5deg 18deg)` com máscara radial que apaga o centro.

## Testes mínimos

Contrato comum + `direction` inválido lança; `cableIndex(angle, cables)` puro (0 em 0 rad,
`cables − 1` logo antes de 2π); limites de `cables` (inteiro), `thickness`, `pulseLength`,
`waviness`.
