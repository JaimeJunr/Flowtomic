# Spec de comportamento: `radar-sweep`

> **Proveniência (clean room).** Escrita em 12/10/2026 a partir da página pública "Radar" em
> `reactbits.dev` (tabela de props; a demo não renderizou no browser de inspeção). O código do
> React Bits **não foi lido**. Segue o contrato `_fundo-webgl.md`. Versão enxuta: o original tem
> 27 props.

## O que a pessoa vê

Uma **tela de radar** circular: anéis de distância, linhas de rumo apagadas e uma escala de
marcas na borda. Um **feixe gira** em volta do centro e deixa um **rastro que esmaece**. Por onde
o feixe passa, **contatos** (pontos que se movem devagar) e um **chuvisco de retornos** acendem e
vão apagando até a próxima volta. No modo `pulse`, em vez do feixe, **anéis de sonar** saem do
centro. O mouse acende a grade por perto e vira um contato.

## API (`atoms/background/radar-sweep`)

```ts
type RadarSweepProps = React.ComponentProps<"div"> & {
  color?: string;        // token; default "--success"
  mode?: "sweep" | "pulse"; // default "sweep"
  speed?: number;        // voltas; negativo gira ao contrário; default 1
  trail?: number;        // 0–1, default 0.35
  scale?: number;        // raio relativo ao menor lado; 0,2–1,5, default 0.9
  rings?: number;        // 1–12, default 6
  spokes?: number;       // 0–36, default 12
  targets?: number;      // 0–16, default 6
  clutter?: number;      // 0–1, default 0.35
  pointer?: boolean;     // default true
  children?: React.ReactNode;
};
```

## Regras

1. **Coordenadas.** `p` centrado, corrigido pela proporção, dividido por `0.5·scale` (raio 1 na
   borda); `r`, `a = atan(p.y, p.x)` em 0…2π. Fora de `r > 1.02`: nada.
2. **Grade.** Anéis: `abs(fract(r·rings + 0.5) − 0.5)` com espessura de ~1 px via `fwidth`;
   borda externa mais forte. Rumos: `spokes` linhas a cada `2π/spokes`, alfa 0,35 da grade.
   Marcas na borda: 72 traços curtos entre `r` 0,96 e 1,0, um a cada 5°, mais longos a cada 30°.
   Grade com alfa 0,25 (marcas 0,4).
3. **Feixe.** Ângulo `b = mod(uTime·speed·1.2, 2π)`; atraso `d = mod(b − a, 2π)` (no sentido do
   giro; com `speed < 0`, `mod(a − b, 2π)`). Cabeça `exp(−d·40)`; rastro
   `exp(−d / max(trail·2.5, 0.02))·0.6`; ambos `·step(r, 1)`.
4. **Contatos.** `targets` pontos (laço de 16 com `break`), posição por hash do índice, raio
   0,2–0,9, que derivam devagar (`ângulo += 0.05·t` com sinal pelo hash). Acende
   `exp(−d_contato·3.0)` onde `d_contato` é o atraso do feixe até o ângulo do contato; ponto
   `exp(−dist²/0.0006)` mais halo `exp(−dist²/0.004)·0.3`.
5. **Chuvisco.** Células polares (`floor(r·40)`, `floor(a·60/2π)`), acesas onde
   `hash > 1 − clutter·0.25`, com o mesmo `exp(−d·3)`.
6. **Modo pulse.** No lugar do feixe, `pulso = fract(uTime·speed·0.5)` e anel
   `exp(−(r − pulso)²·150)·(1 − pulso)` (revisado em 12/10/2026: com `·400` o anel era
   fino demais); contatos e chuvisco acendem quando o anel passa
   (`exp(−abs(r_alvo − pulso)·12)`).
7. **Ponteiro.** Grade `+0.6·exp(−dist²/0.02)`; o ponteiro entra como contato extra.
8. **Saída.** `color·(grade + feixe + contatos + chuvisco)`; alfa = `max3`, `clamp`,
   pré-multiplicada, dither. Story com raiz `dark bg-background`.
9. **Entrada.** Nos primeiros 1,2 s os anéis aparecem de dentro para fora
   (`step(r, uTime/1.2)`); cheio em movimento reduzido, que também para o feixe (quadro estático
   com o feixe a 45°).
10. **Fallback.** `repeating-radial-gradient(circle, color-mix(in oklch, var(--c) 25%,
    transparent) 0 1px, transparent 1px 12%)` recortado num círculo.

## Testes mínimos

Contrato comum + `mode` inválido lança; `sweepLag(a, b, direction)` puro (0 no feixe, cresce
atrás dele, nunca negativo); limites de `trail`, `scale`, `rings`, `spokes`, `targets`, `clutter`.
