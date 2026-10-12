# Spec de comportamento: `dither-waves`

> **Proveniência (clean room).** Escrita em 11/10/2026 a partir da demo pública "Dither" em
> `reactbits.dev` (tabela de props; a demo não renderizou no browser de inspeção). O código do
> React Bits **não foi lido**. Segue o contrato `_fundo-webgl.md`. Versão enxuta: o original tem
> 23 props.

## O que a pessoa vê

Ondas de ruído suave que se movem devagar, desenhadas como **gráfico de computador antigo**: em
vez de degradê, cada tom vira um **padrão de pontos** em blocos de pixel visíveis (pontilhado
ordenado). O mouse **apaga** as ondas por onde passa, deixando um rastro curto. Ao montar, a
imagem começa em blocos grandes e fica nítida.

## API (`atoms/background/dither-waves`)

```ts
type DitherWavesProps = React.ComponentProps<"div"> & {
  color?: string;        // token das ondas; default "--primary"
  pattern?: "bayer4" | "bayer8" | "lines"; // default "bayer8"
  levels?: number;       // tons por canal; 2–8, default 4
  pixelSize?: number;    // px de tela; 1–8, default 2
  scale?: number;        // tamanho do padrão; default 1
  speed?: number;        // default 1
  contrast?: number;     // 0,5–2, default 1
  pointer?: boolean;     // rastro que apaga; default true
  children?: React.ReactNode;
};
```

## Regras

1. **Pixelização.** Como no `swirl-paint`: `frag` encaixado em blocos de `pixelSize` (× DPR). Na
   entrada, o bloco começa em `pixelSize·8` e cai até `pixelSize` em 0,8 s
   (`mix(8.0, 1.0, smoothstep(0.0, 0.8, uTime))`).
2. **Ondas.** `fbm` de 4 oitavas (ruído de valor) em `uv·3.0/scale + vec2(t·0.05, t·0.03)`, com
   `t = uTime·uSpeed`; o domínio é distorcido por outro `fbm`. Contraste
   `v = clamp((v − 0.5)·contrast + 0.5, 0, 1)`.
3. **Pontilhado.** Limiar ordenado `b` (0–1) da célula: matriz de Bayer 4×4 ou 8×8 calculada no
   shader por bits (sem textura), ou `lines` (`fract(cell.y/4)`). Tom final
   `q = floor(v·(levels − 1) + b) / (levels − 1)`.
4. **Ponteiro** (contrato regra 8): rastro com decaimento — o JS guarda as últimas 12 posições
   com o instante; o shader recebe o array e subtrai
   `Σ 0.6·exp(−dist²/0.01)·exp(−idade·2.0)` de `v` antes do passo 3.
5. **Saída** pré-multiplicada: alfa `q`, cor `uColor·q`. Story com raiz `dark bg-background`.
6. **Movimento reduzido.** Sem entrada em blocos e sem rastro.
7. **Fallback.** `radial-gradient(circle, color-mix(in oklch, var(--c) 40%, transparent) 1px,
   transparent 1.5px)` com `background-size: 4px 4px`.

## Testes mínimos

Contrato comum + `bayerThreshold(x, y, n)` puro (testado contra a matriz 4×4 conhecida
`[0,8,2,10;12,4,14,6;3,11,1,9;15,7,13,5]/16`); limites de `levels`, `pixelSize`, `contrast`;
fila do rastro com no máximo 12.
