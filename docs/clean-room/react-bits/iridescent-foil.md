# Spec de comportamento: `iridescent-foil`

> **Proveniência (clean room).** Escrita em 11/10/2026 a partir da demo pública "Iridescence" em
> `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.
> Segue o contrato `_fundo-webgl.md`.

## O que a pessoa vê

Uma superfície clara, como **papel holográfico**: dobras líquidas e suaves que se torcem devagar, e a
cor de cada dobra **muda de tom** conforme a curvatura — azul, lilás, rosa, ciano — sempre pálida e
brilhante. O mouse **empurra levemente** o padrão na direção dele e clareia a região próxima.

## API (`atoms/background/iridescent-foil`)

```ts
type IridescentFoilProps = React.ComponentProps<"div"> & {
  tint?: string;         // token multiplicado sobre o arco-íris; sem valor = sem tingir (branco)
  speed?: number;        // default 1
  scale?: number;        // tamanho das dobras; default 1
  detail?: number;       // camadas de distorção, inteiro 2–8; default 5
  saturation?: number;   // 0–1; default 0.6 (pálido)
  pointer?: boolean;     // default true
  children?: React.ReactNode;
};
```

## Regras

1. **Dobras.** Coordenadas `p = uv·3.0/scale`. Repetir `detail` vezes (laço com limite fixo 8 e
   `if (float(i) >= uDetail) break;`):
   `p += vec2(sin(p.y·1.3 + t + i), cos(p.x·1.1 − t·0.8 + i·1.7))·0.6/(i+1)`; `t = uTime·uSpeed·0.12`.
2. **Cor.** `h = 0.5 + 0.5·sin(p.x + p.y)`; arco-íris por cosseno:
   `rgb = 0.5 + 0.5·cos(6.2832·(h + vec3(0.0, 0.33, 0.67)))`; misturar com cinza
   `luma` por `saturation`; clarear: `rgb = mix(rgb, vec3(1), 0.35)`; multiplicar por `tint` (branco quando não houver). Em tema escuro, escurecer o resultado por `mix(1.0, 0.35, uDark)`, com `uDark` = 1 quando a luminância de `--background` < 0,5.
3. **Ponteiro** (contrato regra 8): desloca `p` em `(uPointer − 0.5)·0.3` e soma brilho
   `0.15·exp(−8·dist²)` perto dele.
4. **Alfa** 1.
5. **Fallback.** `conic-gradient` com `color-mix` de `--info`, `--primary` e `--success` a 70% de
   `--background`, `blur(40px)` (sem cor literal).

## Testes mínimos

Contrato comum + `clampDetail` (inteiro entre 2 e 8) e o ponteiro desligado com `pointer={false}`
(não registra `pointermove`).
