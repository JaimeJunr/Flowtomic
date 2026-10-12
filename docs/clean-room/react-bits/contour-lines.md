# Spec de comportamento: `contour-lines`

> **Proveniência (clean room).** Escrita em 11/10/2026 a partir da demo pública "Line Waves" em
> `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.
> Segue o contrato `_fundo-webgl.md`.

## O que a pessoa vê

Dezenas de **linhas finas e paralelas**, inclinadas na diagonal, que ondulam juntas como fios
penteados ou curvas de nível. Num trecho elas se apertam e brilham; em outro se abrem e somem no
escuro. O mouse **empurra** as linhas por perto.

## API (`atoms/background/contour-lines`)

```ts
type ContourLinesProps = React.ComponentProps<"div"> & {
  colors?: [string, string, string]; // tokens; default ["--foreground", "--foreground", "--primary"]
  speed?: number;      // default 0.3
  lineCount?: number;  // 8–80, default 34
  warp?: number;       // 0–2, default 1
  rotation?: number;   // graus; default -45
  brightness?: number; // 0–1, default 0.6
  pointer?: boolean;   // default true
  children?: React.ReactNode;
};
```

## Regras

1. **Coordenadas.** `p` centrado, corrigido pela proporção, girado por `rotation`.
   `t = uTime·uSpeed`.
2. **Campo.** `h = p.y + warp·(0.25·sin(p.x·2.0 + t) + 0.12·sin(p.x·4.3 − t·1.3 + p.y·1.5))`.
3. **Linhas.** `f = h·lineCount`; `d = abs(fract(f) − 0.5)` (0,5 no meio da linha, 0 entre
   linhas); traço com ≈1,5 px constante na tela: `line = smoothstep(0.5 − fwidth(f)·1.5, 0.5, d)`.
4. **Densidade.** Brilho `brightness·(0.3 + 0.7·smoothstep(−0.6, 0.6, sin(p.x·1.3 + t·0.5)))`.
5. **Cor.** `mix(c1, c2, 0.5 + 0.5·sin(p.x + t·0.3))`, depois `mix(cor, c3, 0.5 + 0.5·sin(p.y·1.7 − t·0.2))·0.6`.
6. **Ponteiro** (contrato regra 8): `h += 0.3·exp(−4·dot(d, d))` com `d = p − ponteiro`.
7. **Saída** pré-multiplicada (alfa = `line·brilho`), mais o dither. Story com raiz `dark bg-background`.
8. **Fallback.** `repeating-linear-gradient(-45deg, color-mix(in oklch, var(--c1) 25%,
   transparent) 0 1px, transparent 1px 14px)`.

## Testes mínimos

Contrato comum + exatamente três tokens; limites de `lineCount`, `warp`, `brightness`; o shader
usa `fwidth` (GLSL ES 3.00 tem nativo).
