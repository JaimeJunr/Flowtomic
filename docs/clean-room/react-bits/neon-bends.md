# Spec de comportamento: `neon-bends`

> **Proveniência (clean room).** Escrita em 12/10/2026 a partir da demo pública "Color Bends" em
> `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.
> Segue o contrato `_fundo-webgl.md`. Versão enxuta: o original tem 16 props.

## O que a pessoa vê

Poucas **faixas grossas de luz neon**, curvas como arcos, sobre o escuro. Elas **se dobram e
deslizam devagar**, se aproximam e se afastam; cada uma tem um núcleo forte que se desfaz em
brilho. As cores vêm de uma paleta e mudam de uma faixa para outra. O mouse **entorta** as faixas
perto dele e desloca o conjunto um pouco (paralaxe).

## API (`atoms/background/neon-bends`)

```ts
type NeonBendsProps = React.ComponentProps<"div"> & {
  colors?: string[];    // 1–4 tokens; default ["--primary", "--info"]
  rotation?: number;    // graus; default 90
  spin?: number;        // graus/s de giro automático; default 0
  speed?: number;       // default 0.2
  scale?: number;       // 0,3–4, default 1
  frequency?: number;   // 0,2–4, default 1
  warp?: number;        // 0–3, default 1
  bandWidth?: number;   // largura/queda de cada faixa; 1–20, default 6
  intensity?: number;   // 0–4, default 1.5
  pointer?: boolean;    // default true
  children?: React.ReactNode;
};
```

## Regras

1. **Coordenadas.** `p` centrado, corrigido pela proporção, girado por `rotation + spin·uTime`
   (graus → rad), `/scale`; `t = uTime·uSpeed`. Com ponteiro, paralaxe `p += (uPointer − 0.5)·0.15`.
2. **Dobra.** `q = p; q.x += warp·0.5·sin(q.y·1.3·frequency + t); q.y += warp·0.4·sin(q.x·1.1·
   frequency − t·0.8)`. Ponteiro: `q += warp·0.25·normalize(q − ptr)·exp(−dist²/0.1)`.
3. **Faixas.** Para cada cor i (laço de 4 com `break` em `uCount`): curva
   `c_i = q.y − (0.6·(i − (n−1)/2)) − 0.35·sin(q.x·frequency·0.9 + i·1.7 + t·0.6)`;
   intensidade `b_i = exp(−abs(c_i)·bandWidth·2.0)` (núcleo) `+ exp(−abs(c_i)·bandWidth·0.4)·0.15`
   (brilho).
4. **Cor.** `soma(cor_i·b_i)·intensity`; alfa `max3`, `clamp`, pré-multiplicada, dither. Story
   com raiz `dark bg-background`.
5. **Movimento reduzido.** Quadro estático, sem ponteiro nem giro.
6. **Fallback.** `radial-gradient(ellipse 80% 30% at 50% 60%, color-mix(in oklch, var(--c0)
   35%, transparent), transparent 70%)`.

## Testes mínimos

Contrato comum + `colors` com 1 a 4 tokens (vazio ou 5 lança); limites de `scale`, `frequency`,
`warp`, `bandWidth`, `intensity`; `rotationRadians(rotation, spin, time)` puro.
