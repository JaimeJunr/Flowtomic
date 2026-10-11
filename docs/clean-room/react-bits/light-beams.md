# Spec de comportamento: `light-beams`

> **Proveniência (clean room).** Escrita em 11/10/2026 a partir da demo pública "Light Rays" em
> `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.
> Segue o contrato `_fundo-webgl.md`.

## O que a pessoa vê

**Feixes de luz** saem de um ponto na borda (por padrão, o centro do topo) e se abrem em leque
sobre a página, como luz entrando por uma fresta. Os feixes têm larguras diferentes, **tremulam
devagar** e **esmaecem com a distância**. Com o mouse, o leque **gira um pouco** na direção dele.

## API (`atoms/background/light-beams`)

```ts
type LightBeamsOrigin = "top-center" | "top-left" | "top-right" | "left" | "right"
  | "bottom-center" | "bottom-left" | "bottom-right";

type LightBeamsProps = React.ComponentProps<"div"> & {
  color?: string;            // token; default "--foreground"
  origin?: LightBeamsOrigin; // default "top-center"
  speed?: number;            // default 1
  spread?: number;           // abertura do leque; default 1
  length?: number;           // alcance em alturas da área; default 1.6
  intensity?: number;        // 0–1; default 0.6
  pointer?: boolean;         // default true
  children?: React.ReactNode;
};
```

## Regras

1. **Origem (puro `originPoint(origin)`)** em uv: centro do topo `(0.5, 1.08)` (um pouco fora,
   para não aparecer o ponto), cantos `(±0.0/1.0, 1.08)`, laterais `(-0.08, 0.6)` / `(1.08, 0.6)`,
   base `(.., -0.08)`. Direção principal = da origem para o centro `(0.5, 0.5)`.
2. **Feixes.** Para o pixel, ângulo `θ` em relação à direção principal (com proporção da tela
   corrigida). Soma de 3 camadas `pow(0.5 + 0.5·cos(θ·k_i + t·w_i + φ_i), s_i)` com
   `k = (18, 31, 47)·(1/spread)`, `w = (0.6, −0.9, 0.4)`, `s = (6, 10, 16)`; `t = uTime·uSpeed`.
3. **Abertura.** Multiplicar por `smoothstep(1.2·spread, 0.0, |θ|)`.
4. **Distância.** `fade = 1 − smoothstep(0.0, length, d)` com `d` = distância da origem em alturas.
5. **Saída** pré-multiplicada com `a = beams·fade·intensity`.
6. **Ponteiro** (contrato regra 8): gira a direção principal até ±0,25 rad conforme o x do ponteiro.
7. **Fallback.** `radial-gradient` partindo da origem com `color-mix(in oklch, var(--c) 35%,
   transparent)` até transparente.

## Testes mínimos

Contrato comum + `originPoint` das oito origens (fora da área, direção para o centro).
