# Spec de comportamento: `prism-glow`

> **Proveniência (clean room).** Escrita em 11/10/2026 a partir da demo pública "Prism" em
> `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.
> Segue o contrato `_fundo-webgl.md`. **Versão 2D**: o original é uma pirâmide 3D; aqui fica a
> leitura visual dela, uma silhueta de prisma vista de frente.

## O que a pessoa vê

No escuro, a silhueta de um **prisma triangular** feito de luz difusa. Dentro dele, **faixas de
espectro** (vermelho, verde, azul) se mexem devagar, e na base corre uma **linha de luz forte**
que vaza para os lados. Com o mouse, o prisma **inclina** levemente na direção do ponteiro.

## API (`atoms/background/prism-glow`)

```ts
type PrismGlowProps = React.ComponentProps<"div"> & {
  tint?: string;       // token que puxa o espectro; default "--primary"
  speed?: number;      // default 0.5
  glow?: number;       // 0–2, default 1
  bands?: number;      // frequência das faixas; 0,5–4, default 1
  height?: number;     // altura relativa do prisma; 0,3–1, default 0.7
  noise?: number;      // grão; 0–1, default 0.5
  pointer?: boolean;   // default true
  children?: React.ReactNode;
};
```

## Regras

1. **Coordenadas.** `p` centrado, corrigido pela proporção, `y` de baixo para cima; base do prisma
   em `y = −0.35`, ápice em `y = −0.35 + height`, meia-largura da base `0.55`.
   `t = uTime·uSpeed`.
2. **Silhueta.** Distância com sinal ao triângulo isósceles (fórmula própria: dois semiplanos
   laterais e a base); `inside = smoothstep(0.08, −0.02, dist)`; borda brilhante
   `edge = exp(−abs(dist)·40.0)·0.5`.
3. **Espectro.** `k = (p.y + 0.35)·bands·3.0 + sin(p.x·3.0 + t)·0.4 + t·0.3`;
   `spec = 0.5 + 0.5·cos(6.2832·(k + vec3(0.0, 0.33, 0.67)))`; puxado para o tom:
   `mix(spec, uTint, 0.35)`.
4. **Base.** `beam = exp(−pow((p.y + 0.35)/0.02, 2))·(1 − smoothstep(0.4, 1.4, abs(p.x)))`; cor
   `mix(uTint, vec3(1), 0.7)·beam·2.0·glow`.
5. **Composição.** `cor = spec·(inside·0.55 + edge)·glow + base`; halo
   `glow·0.15·exp(−length(p − vec2(0, −0.2))·2.5)`. Alfa = `clamp(max3(cor))`.
6. **Grão** `noise·0.04` com sinal; mais o dither.
7. **Ponteiro** (contrato regra 8): cisalha `p.x −= (uPointer.x − 0.5)·0.25·(p.y + 0.35)`.
8. **Saída** pré-multiplicada. Story com raiz `dark bg-background`.
9. **Fallback.** `radial-gradient(ellipse at 50% 80%, color-mix(in oklch, var(--c) 45%,
   transparent), transparent 60%)`.

## Testes mínimos

Contrato comum + limites de `glow`, `bands`, `height`, `noise`.
