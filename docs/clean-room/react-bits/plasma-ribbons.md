# Spec de comportamento: `plasma-ribbons`

> **Proveniência (clean room).** Escrita em 11/10/2026 a partir da página pública "Plasma Wave" em
> `reactbits.dev` (tabela de props; a demo não renderizou no browser de inspeção). O código do
> React Bits **não foi lido**. Segue o contrato `_fundo-webgl.md`. Versão enxuta: o original tem
> 25 props.

## O que a pessoa vê

Duas **fitas de plasma**, cada uma de uma cor, atravessam a tela em ondas e se **enroscam** em
volta do próprio caminho. Os pontos mais fortes ficam quase brancos e há uma **luz macia**
vazando ao redor. A segunda fita pode correr no sentido contrário da primeira. Perto do mouse as
fitas **incham** e acendem. Ao montar, elas se desdobram e aparecem.

## API (`atoms/background/plasma-ribbons`)

```ts
type PlasmaRibbonsProps = React.ComponentProps<"div"> & {
  colors?: [string, string]; // tokens; default ["--primary", "--info"]
  speed?: number;      // default 1
  reverse?: boolean;   // a segunda fita corre ao contrário; default false
  bend?: [number, number]; // quanto cada fita se enrosca; 0–2, default [1, 0.5]
  thickness?: number;  // 0,05–1, default 0.3
  rotation?: number;   // graus; default 0
  glow?: number;       // 0–2, default 1
  core?: number;       // 0–1, quão branco o núcleo fica; default 0.6
  grain?: number;      // 0–1, default 0.03
  pointer?: boolean;   // default true
  children?: React.ReactNode;
};
```

## Regras

1. **Coordenadas.** `p` centrado, corrigido pela proporção, girado por `rotation`.
   `t = uTime·uSpeed`.
2. **Fita `k`** (`k = 0, 1`; direção `dir = 1`, ou `−1` na segunda com `reverse`): centro
   `y_k(x) = 0.25·sin(x·1.6 + dir·t·0.5 + k·2.1) + 0.12·sin(x·3.1 − dir·t·0.35 + k)`; enrosco
   `w = bend_k·0.08·sin(x·9.0 + dir·t·1.5)` soma ao centro.
3. **Espessura** que varia ao longo da fita `th = thickness·0.12·(0.6 + 0.4·sin(x·2.3 + t·0.7 + k))`;
   com ponteiro, `th·(1 + 0.8·exp(−dist²·12))`.
4. **Luz.** `d = abs(p.y − y_k − w)`; corpo `smoothstep(th, 0.0, d)`; brilho
   `exp(−d/(th·2.5 + 0.01))·0.5·glow`.
5. **Cor.** `cor_k·(corpo + brilho)`; núcleo `mix(·, vec3(1), core·corpo²)`; soma das duas fitas.
6. **Entrada.** As fitas crescem do centro: `·smoothstep(0.0, 1.0, uTime·0.8 − abs(p.x)·0.4)`.
7. **Grão** `grain·2` com sinal e o dither. **Saída** pré-multiplicada (alfa = `clamp(max3)`).
   Story com raiz `dark bg-background`.
8. **Movimento reduzido.** Sem entrada e sem ponteiro.
9. **Fallback.** `linear-gradient(170deg, transparent 35%, color-mix(in oklch, var(--c1) 40%,
   transparent) 45%, color-mix(in oklch, var(--c2) 40%, transparent) 55%, transparent 65%)`.

## Testes mínimos

Contrato comum + exatamente dois tokens; limites de `bend`, `thickness`, `glow`, `core`, `grain`.
