# Spec de comportamento: `light-column`

> **Proveniência (clean room).** Escrita em 11/10/2026 a partir da demo pública "Light Pillar" em
> `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.
> Segue o contrato `_fundo-webgl.md`. Versão enxuta: o original tem 23 props.

## O que a pessoa vê

Uma **coluna de luz** inclinada, feita de **filamentos** que se torcem uns em volta dos outros,
como plasma ou relâmpago lento. Embaixo a coluna é densa e de uma cor; subindo, ela se abre e
passa para outra. Os filamentos mais fortes queimam quase brancos, com halo suave. O mouse
**inclina** a coluna; um clique manda um **pulso de luz** subindo por ela.

## API (`atoms/background/light-column`)

```ts
type LightColumnProps = React.ComponentProps<"div"> & {
  colors?: [string, string]; // tokens base e topo; default ["--primary", "--warning"]
  intensity?: number;   // 0–2, default 1
  width?: number;       // largura relativa; 0,1–1, default 0.3
  tilt?: number;        // graus; default 25
  twist?: number;       // 0–2, default 0.4
  detail?: number;      // oitavas da turbulência; inteiro 1–6, default 4
  speed?: number;       // default 1
  grain?: number;       // 0–1, default 0.5
  pointer?: boolean;    // inclina + pulso no clique; default true
  children?: React.ReactNode;
};
```

## Regras

1. **Coordenadas.** `p` centrado, corrigido pela proporção, girado por `tilt` (mais
   `(uPointer.x − 0.5)·15°` com ponteiro). `y01 = p.y·0.5 + 0.5`. `t = uTime·uSpeed`.
2. **Filamentos.** Distorção de domínio por `fbm` de `detail` oitavas:
   `q = p + vec2(fbm(vec2(p.y·2.0 − t·0.6, t·0.2)), 0)·twist`; para `j = 0..3`, com fase
   `φ_j = j·1.7`, `x_j = 0.12·sin(q.y·3.0 + t + φ_j)·width·3.0`; `f += 0.004/abs(q.x − x_j)`
   (luz que se acumula perto do filamento).
3. **Envelope.** `·smoothstep(width·1.6, 0.0, abs(q.x))`; `·smoothstep(1.2, 0.2, p.y)` no topo.
4. **Cor.** `mix(c1, c2, smoothstep(0.1, 0.9, y01))`; núcleo `mix(cor, vec3(1), clamp(f·0.15, 0, 0.7))`;
   halo `cor·0.25·exp(−abs(q.x)/width·2.0)`.
5. **Pulso** (clique): instante guardado no JS; banda `exp(−pow((y01 − idade·1.2)/0.05, 2))·
   exp(−idade·1.5)` soma 1,5 ao brilho.
6. **Entrada.** Acende de baixo para cima: `·smoothstep(y01 − 0.2, y01, uTime·0.8)`.
7. **Grão** `grain·0.04` com sinal; dither. **Saída** pré-multiplicada com alfa
   `clamp(intensity·max3(cor), 0, 1)`. Story com raiz `dark bg-background`.
8. **Movimento reduzido.** Sem entrada, sem pulso, ponteiro desligado.
9. **Fallback.** `linear-gradient(115deg, transparent 40%, color-mix(in oklch, var(--c1) 45%,
   transparent) 50%, transparent 60%)`.

## Testes mínimos

Contrato comum + exatamente dois tokens; `detail` inteiro 1–6; limites de `intensity`, `width`,
`twist`, `grain`; clique com `pointer={false}` não dispara pulso.
