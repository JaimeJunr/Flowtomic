# Spec de comportamento: `satin-plasma`

> **Proveniência (clean room).** Escrita em 11/10/2026 a partir da demo pública "Plasma" em
> `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.
> Segue o contrato `_fundo-webgl.md`. Versão enxuta: o original tem 19 props; ficam as que mudam
> o resultado.

## O que a pessoa vê

Sobre fundo escuro, **dobras de luz acetinada** se torcem devagar em espiral, como cetim em
movimento. As bordas das dobras têm **brilhos finos**; o resto é sombra profunda. O mouse **inclina**
o padrão e acende a região próxima. Ao montar, o plasma **acende aos poucos** (≈1,2 s).

## API (`atoms/background/satin-plasma`)

```ts
type SatinPlasmaProps = React.ComponentProps<"div"> & {
  color?: string;       // token; default "--primary"
  speed?: number;       // default 1
  twist?: number;       // quanto espirala; default 1
  softness?: number;    // 0 nítido – 1 enevoado; default 0.5
  shine?: number;       // força dos brilhos; default 1
  fade?: number;        // 0–1, esmaece as bordas na página; default 0
  pointer?: boolean;    // default true
  children?: React.ReactNode;
};
```

## Regras

1. **Coordenadas** centradas e corrigidas pela proporção; rotação por `twist·0.6·length(p) + t·0.2`
   (`t = uTime·uSpeed`).
2. **Dobras.** `v = sin(p.x·3.0 + t) + sin(p.y·2.3 − t·0.7) + sin((p.x + p.y)·1.7 + t·0.4)`;
   `f = 0.5 + 0.5·sin(v·2.0)`.
3. **Luz.** Base `pow(f, mix(1.5, 4.0, 1.0 − softness))`; brilho `shine·pow(f, 24.0)·0.8`;
   cor = `uColor·base + mix(uColor, vec3(1), 0.7)·brilho`.
4. **Entrada.** Intensidade multiplicada por `smoothstep(0.0, 1.2, uTime)` (só no primeiro
   segundo; em movimento reduzido, cheia).
5. **Fade das bordas.** Multiplicar o alfa por `mix(1.0, vinheta, fade)`, vinheta =
   `smoothstep(0.75, 0.2, length(uv − 0.5))`.
6. **Saída** pré-multiplicada, alfa `max(base, brilho)` (o fundo da página aparece nas sombras —
   na story, raiz com `dark bg-background` para o efeito ficar sobre escuro nos dois temas, conforme
   a armadilha do painel escuro no CLAUDE.md).
7. **Ponteiro** (contrato regra 8): desloca `p` em `(uPointer − 0.5)·0.4` e soma
   `0.2·exp(−6·dist²)` à base.
8. **Fallback.** `radial-gradient` de `color-mix(in oklch, var(--c) 45%, transparent)` no centro
   até transparente.

## Testes mínimos

Contrato comum + `clampUnit` em `softness` e `fade`.
