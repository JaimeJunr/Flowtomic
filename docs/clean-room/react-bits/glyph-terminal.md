# Spec de comportamento: `glyph-terminal`

> **Proveniência (clean room).** Escrita em 11/10/2026 a partir da demo pública "Faulty Terminal"
> em `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.
> Segue o contrato `_fundo-webgl.md`. Versão enxuta: o original tem 19 props.

## O que a pessoa vê

Uma **tela de terminal antiga** com defeito: uma grade de **caracteres miúdos** (dígitos em
blocos, desenhados no shader) cujo brilho segue manchas de ruído que se movem. Há **linhas de
varredura**, a imagem **pisca** de leve, de vez em quando uma faixa horizontal **escorrega** para
o lado, e as bordas são **curvas** como vidro de tubo. O mouse acende a região próxima.

## API (`atoms/background/glyph-terminal`)

```ts
type GlyphTerminalProps = React.ComponentProps<"div"> & {
  tint?: string;          // token; default "--success"
  speed?: number;         // default 0.3
  glyphSize?: number;     // px de um glifo; 6–32, default 12
  scanlines?: number;     // 0–1, default 0.3
  glitch?: number;        // 0–2, default 1
  flicker?: number;       // 0–2, default 1
  curvature?: number;     // 0–0,5, default 0.2
  pointer?: boolean;      // default true
  children?: React.ReactNode;
};
```

## Regras

1. **Curvatura.** `uv` em −1…1, `uv *= 1 + curvature·dot(uv.yx, uv.yx)·0.25`; fora de −1…1 é
   preto (alfa 0).
2. **Glitch.** Por faixa horizontal (`floor(uv.y·20)`), com `h = hash(faixa, floor(uTime·8))`: se
   `h > 1 − 0.05·glitch`, `uv.x += (hash2 − 0.5)·0.1·glitch`.
3. **Grade.** `cell = floor(px / glyphSize)`, `local = fract(px / glyphSize)` (px a partir do `uv`
   corrigido). Glifo = matriz 3×5 de bits escolhida por `floor(hash(cell + floor(t·2))·10)`
   (dez padrões de dígito, constantes `int[10]` no shader); acende o bit da sub-célula de `local`
   com 1 px de folga.
4. **Brilho.** `v = smoothstep(0.35, 0.75, fbm(cell·0.08 + t·0.2))` com `t = uTime·uSpeed`;
   ponteiro soma `0.5·exp(−dist²/0.02)`.
5. **Varredura e piscar.** `·(1 − scanlines·0.5·(0.5 + 0.5·sin(px.y·3.1416)))`;
   `·(1 − flicker·0.04·hash(floor(uTime·30)))`.
6. **Saída** pré-multiplicada: alfa `glifo·v·varredura`, cor `uTint·alfa·1.3`; mais um leve
   brilho `uTint·v·0.06`. Story com raiz `dark bg-background`.
7. **Entrada.** Alfa `·smoothstep(0.0, 1.0, uTime)`; cheio em movimento reduzido, que também
   desliga glitch e piscar.
8. **Fallback.** `repeating-linear-gradient(0deg, color-mix(in oklch, var(--c) 12%, transparent)
   0 1px, transparent 1px 3px)`.

## Testes mínimos

Contrato comum + os dez padrões de glifo (puro, `glyphBits(digit)` com 15 bits cada, todos
distintos); limites de `glyphSize`, `scanlines`, `glitch`, `flicker`, `curvature`.
