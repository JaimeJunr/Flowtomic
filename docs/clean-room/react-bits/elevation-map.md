# Spec de comportamento: `elevation-map`

> **Proveniência (clean room).** Escrita em 12/10/2026 a partir da demo pública "Topography" em
> `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.
> Segue o contrato `_fundo-webgl.md`. Versão enxuta: o original tem 22 props.

## O que a pessoa vê

Um **mapa topográfico** vivo: **curvas de nível finas** que fecham em ilhas, cristas e vales, e
que **se transformam devagar** como terreno derretendo. As linhas dos vales têm uma cor, as do
meio outra, e as cristas ficam quase brancas. Um brilho suave envolve cada linha. O mouse
**levanta um morro** sob o cursor, e as curvas se fecham em volta dele.

## API (`atoms/background/elevation-map`)

```ts
type ElevationMapProps = React.ComponentProps<"div"> & {
  colors?: [string, string, string]; // tokens baixo, meio, alto;
                                     // default ["--primary", "--info", "--foreground"]
  speed?: number;      // default 0.35
  morph?: number;      // quanto o terreno muda; 0–5, default 3
  bands?: number;      // densidade das curvas; 0,5–8, default 2
  thickness?: number;  // 0,002–0,05, default 0.01
  scale?: number;      // zoom; 0,3–4, default 1
  glow?: number;       // 0–2, default 0.5
  fill?: boolean;      // tinge entre as curvas; default false
  pointer?: boolean;   // morro no cursor; default true
  children?: React.ReactNode;
};
```

## Regras

1. **Campo.** `p` centrado, corrigido pela proporção, `·1.5/scale`; `t = uTime·uSpeed`. Altura
   `h = soma de 6 gaussianas` com centros que orbitam (`c_i = base_i + 0.35·morph·vec2(sin(t·k_i
   + i), cos(t·k_i·0.8 + i·1.7))`, `k_i` entre 0,3 e 0,9 por hash), alturas alternando ±, raio
   0,5–0,9; mais `0.35·fbm(p·1.2 + t·0.1)` (revisado em 12/10/2026: com `0.15` as
   curvas cobriam só a área das gaussianas). Normalize para ~0…1 (`h·0.5 + 0.5`, `clamp`).
2. **Ponteiro.** `h += 0.4·exp(−dist²/0.09)` (raio ~0,3), suavizado no JS, só mouse ou caneta.
3. **Curvas.** `v = h·bands·6`; `f = abs(fract(v) − 0.5)`; `w = fwidth(v)`;
   `line = 1 − smoothstep(thickness·60·w, thickness·60·w + w, f)` (espessura em px estável);
   brilho `exp(−f / max(w·glow·4, 1e−4))·0.35·glow`.
4. **Cor.** Baixo→meio para `h` 0…0,6, meio→alto para 0,6…1 (`smoothstep`). Com `fill`,
   soma `cor·0.06`. Alfa `= max3(cor·(line + brilho) + preenchimento)`, `clamp`, pré-multiplicada,
   dither. Story com raiz `dark bg-background`.
5. **Movimento reduzido.** Quadro estático e sem ponteiro.
6. **Fallback.** `repeating-radial-gradient(ellipse at 30% 40%, transparent 0 18px,
   color-mix(in oklch, var(--c2) 35%, transparent) 18px 19px)`.

## Testes mínimos

Contrato comum + exatamente três tokens; `heightToColorStop(h)` puro (0 → baixo, 0,6 → meio,
1 → alto); limites de `morph`, `bands`, `thickness`, `scale`, `glow`.
