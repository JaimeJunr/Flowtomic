# Spec de comportamento: `scan-tunnel`

> **Proveniência (clean room).** Escrita em 12/10/2026 a partir da demo pública "Grid Scan" em
> `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.
> Segue o contrato `_fundo-webgl.md`. Versão enxuta: o original tem 28 props, entre elas webcam,
> giroscópio e pós-processamento, que ficam de fora.

## O que a pessoa vê

Um **túnel retangular em perspectiva**, como uma sala de grade de neon vista de dentro: chão,
teto e paredes cobertos por uma **grade de linhas finas** que fogem para um fundo escuro no
centro. De tempos em tempos uma **faixa de luz varre o túnel** em profundidade, acendendo a grade
por onde passa, e volta (vai e vem). O mouse **inclina a câmera** de leve.

## API (`atoms/background/scan-tunnel`)

```ts
type ScanTunnelProps = React.ComponentProps<"div"> & {
  lineColor?: string;   // token; default "--muted-foreground"
  scanColor?: string;   // token; default "--primary"
  gridScale?: number;   // tamanho da célula; 0,05–0,5, default 0.12
  lineWidth?: number;   // 0,5–3, default 1
  scanOpacity?: number; // 0–1, default 0.5
  scanDuration?: number; // s de uma passada; 0,5–10, default 2
  scanDelay?: number;   // s de pausa entre passadas; 0–10, default 2
  speed?: number;       // default 1 (multiplica o relógio da varredura)
  pointer?: boolean;    // inclina a câmera; default true
  children?: React.ReactNode;
};
```

## Regras

1. **Raio.** `p` centrado e corrigido pela proporção; com ponteiro, `p += (uPointer − 0.5)·0.15`.
   Caixa de meia-largura `aspecto·0.5` e meia-altura `0.5` por unidade de profundidade: a parede
   atingida é a de menor `z = min(0.5·aspecto/abs(p.x), 0.5/abs(p.y))`. Ponto na parede:
   `(u, z)`, onde `u` é a coordenada ao longo da parede (`p.y·z` nas laterais, `p.x·z` no chão e teto).
2. **Grade.** `g = vec2(u, z)/gridScale`; `w = fwidth(g)·lineWidth`;
   `q = abs(fract(g − 0.5) − 0.5)`; `line = max(1 − smoothstep(0, w.x, q.x), 1 − smoothstep(0,
   w.y, q.y))`. Assim a linha tem ~`lineWidth` px em qualquer profundidade, sem serrilhado.
3. **Névoa.** `fog = exp(−z·0.35)`; o centro (z grande) some no escuro.
4. **Varredura.** Ciclo `T = scanDuration·2 + scanDelay·2`; tempo `c = mod(uTime·uSpeed, T)`;
   ida em `[0, scanDuration]`, pausa, volta em `[scanDuration + scanDelay, 2·scanDuration +
   scanDelay]`, pausa. Profundidade da faixa `zs = mix(1, 12, fase)`, fase 0→1 na ida e 1→0 na
   volta (`smoothstep` nas pontas). Faixa `band = exp(−(z − zs)²·0.25)`; fora das passadas
   `band = 0`. Função pura `scanPhase(t, duration, delay)` no utils, espelhada no GLSL.
5. **Cor.** `lineColor·line·fog·0.6 + scanColor·(line·band·2.5 + band·0.35)·scanOpacity` (revisado em
   12/10/2026: com `·1.5` na largura e `0.12` de brilho a faixa quase não aparecia);
   alfa = `max3(cor)` `clamp`, saída pré-multiplicada, dither. Story com raiz `dark bg-background`.
6. **Movimento reduzido.** Sem ponteiro; o quadro estático do renderer mostra a grade sem faixa
   (`band = 0` com `uTime = 0`).
7. **Fallback.** `radial-gradient(ellipse at center, transparent 20%, color-mix(in oklch,
   var(--scan) 18%, transparent) 70%)`.

## Testes mínimos

Contrato comum; `scanPhase` puro (0 no início, 1 no fim da ida, parado na pausa, volta a 0,
`null`/−1 fora das passadas, como preferir, documentado no tipo); limites de `gridScale`,
`lineWidth`, `scanOpacity`, `scanDuration`, `scanDelay`.
