# Spec de comportamento: `spectral-burst`

> **Proveniência (clean room).** Escrita em 12/10/2026 a partir da demo pública "Prismatic
> Burst" em `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi
> lido**. Segue o contrato `_fundo-webgl.md`. Versão enxuta: o original tem 10 props.

## O que a pessoa vê

Uma **explosão de raios de luz** saindo de um ponto escuro no centro, como olhar para dentro de
um túnel de velocidade. Os raios têm **largura e brilho desiguais**, giram devagar e se
**dobram** um pouco, e as cores correm num gradiente entre dois tons. O miolo é escuro; a luz
cresce para as bordas.

## API (`atoms/background/spectral-burst`)

```ts
type SpectralBurstProps = React.ComponentProps<"div"> & {
  colors?: [string, string];  // tokens do gradiente; default ["--primary", "--info"]
  intensity?: number;   // 0–4, default 1.5
  speed?: number;       // default 0.5
  motion?: "spin" | "sway"; // giro contínuo ou balanço; default "spin"
  distort?: number;     // dobra dos raios; 0–2, default 0.5
  rayCount?: number;    // 0 = raios livres; 4–64 = raios discretos; default 0
  center?: { x: number; y: number }; // deslocamento do foco, fração da tela (−0,5…0,5); default {0,0}
  children?: React.ReactNode;
};
```

## Regras

1. **Coordenadas.** `p = (gl_FragCoord.xy − res·(0.5 + center))/res.y`; `r = length(p)`,
   `a = atan(p.y, p.x)`; `t = uTime·uSpeed`.
2. **Giro.** `spin`: `a += t·0.3`. `sway`: `a += sin(t·0.8)·0.6`. Dobra: `a += distort·0.4·
   sin(r·6.0 − t·1.5)`.
3. **Raios.** Ruído angular em camadas: `s = fbm1(a·(3.0/π)·4.0 + t·0.2, r·0.5)` (fbm de valor 2D
   com 4 oitavas, envolvendo o ângulo para não ter costura em ±π — use `vec2(cos a, sin a)·k`
   como entrada); `rays = pow(s, 2.5)`. Com `rayCount > 0`, multiplica por
   `pow(0.5 + 0.5·cos(a·rayCount), 4.0)`.
4. **Profundidade.** `rays *= smoothstep(0.02, 0.35, r)·(0.6 + 0.4·sin(r·4.0 − t·2.0))`; o miolo
   fica escuro.
5. **Cor.** `mix(c1, c2, 0.5 + 0.5·sin(a·2.0 + r·3.0 − t))·rays·intensity`; alfa = `max3(cor)`
   `clamp`, saída pré-multiplicada, dither. Story com raiz `dark bg-background`.
6. **Movimento reduzido.** Quadro estático do renderer.
7. **Fallback.** `repeating-conic-gradient(from 0deg at 50% 50%, color-mix(in oklch, var(--c1)
   30%, transparent) 0deg 4deg, transparent 4deg 12deg)` com máscara radial que apaga o centro.

## Testes mínimos

Contrato comum + exatamente dois tokens; `motion` inválido lança; limites de `intensity`,
`distort`, `rayCount` (inteiro, 0 ou 4–64), `center` (cada eixo em −0,5…0,5).
