# Spec de comportamento: `velvet-veil`

> **Proveniência (clean room).** Escrita em 11/10/2026 a partir da demo pública "Dark Veil" em
> `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.
> Segue o contrato `_fundo-webgl.md`. Versão enxuta: o original tem 21 props; ficam as que mudam
> o resultado.

## O que a pessoa vê

No escuro, um **véu de luz macia** na cor da marca flutua e muda de forma devagar, como tecido
fino iluminado de lado. As bordas do véu se dissolvem na sombra; as partes mais densas ganham um
**halo** suave. Perto do mouse o véu **se enrola** e acende. Ao montar, ele aparece aos poucos.

## API (`atoms/background/velvet-veil`)

```ts
type VelvetVeilProps = React.ComponentProps<"div"> & {
  color?: string;     // token; default "--primary"
  speed?: number;     // default 0.5
  scale?: number;     // zoom; maior = mais perto; default 1
  flow?: number;      // quanto o véu muda de forma; 0–2, default 1
  sheen?: number;     // brilho fino ao longo das dobras; 0–1, default 0.3
  glow?: number;      // halo nas partes densas; 0–1, default 0.4
  grain?: number;     // grão de filme; 0–1, default 0.03
  fade?: number;      // 0–1, esmaece as bordas na página; default 0
  pointer?: boolean;  // default true
  children?: React.ReactNode;
};
```

## Regras

1. **Coordenadas.** `p = (gl_FragCoord.xy − uResolution/2) / uResolution.y · 2.0 / scale`;
   `t = uTime·uSpeed`.
2. **Ruído.** `fbm` de 5 oitavas de ruído de valor (hash próprio), ganho 0,5, lacunaridade 2,0.
3. **Forma.** Distorção de domínio em dois passos:
   `q = vec2(fbm(p + t·0.10·flow), fbm(p + vec2(5.2, 1.3) − t·0.08·flow))`;
   `n = fbm(p + 2.0·q)`. Véu = `smoothstep(0.35, 0.85, n)`.
4. **Luz.** Halo `glow·smoothstep(0.6, 1.0, n)`; brilho `sheen·pow(0.5 + 0.5·sin(n·12.0), 6.0)·véu`.
   Cor = `uColor·(véu + halo) + mix(uColor, vec3(1), 0.6)·brilho`. Alfa = `clamp(max(véu, brilho))`.
5. **Grão.** Ruído por pixel, estático, amplitude `grain`, somado à cor antes da saída; mais o
   dither do contrato (regra 6).
6. **Entrada.** Alfa multiplicado por `smoothstep(0.0, 1.5, uTime)`; cheio em movimento reduzido.
7. **Fade das bordas.** Como no `satin-plasma`: `mix(1.0, vinheta, fade)`, vinheta =
   `smoothstep(0.75, 0.2, length(uv − 0.5))`.
8. **Ponteiro** (contrato regra 8). Com `d = p − ponteiro` (ponteiro nas mesmas coordenadas de
   `p`), `p += vec2(−d.y, d.x)·0.35·exp(−4·dot(d, d))` antes do passo 3, e soma
   `0.25·exp(−3·dot(d, d))` ao véu.
9. **Saída** pré-multiplicada. Story com raiz `dark bg-background`.
10. **Fallback.** `radial-gradient` de `color-mix(in oklch, var(--c) 40%, transparent)` em 30% 40%
    até transparente.

## Testes mínimos

Contrato comum + `clampUnit` em `sheen`, `glow`, `grain` e `fade`; `flow` limitado a 0–2.
