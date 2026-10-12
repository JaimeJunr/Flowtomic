# Spec de comportamento: `glow-orb`

> **Proveniência (clean room).** Escrita em 11/10/2026 a partir da página pública "Orb" em
> `reactbits.dev` (tabela de props; a demo não renderizou no browser de inspeção). O código do
> React Bits **não foi lido**. Segue o contrato `_fundo-webgl.md`. Versão enxuta: o original tem
> 23 props.

## O que a pessoa vê

Um **anel de luz** no centro, com duas cores girando ao longo dele e um brilho mais fundo atrás.
O anel **respira** e se deforma de leve. Uma **luz mais forte** percorre o anel, com uma cauda
que esmaece. Com o mouse em cima, o anel **se estica na direção do ponteiro** e acende ali; um
clique faz o anel pulsar. Ao montar, ele liga com um pequeno salto.

## API (`atoms/background/glow-orb`)

```ts
type GlowOrbProps = React.ComponentProps<"div"> & {
  colors?: [string, string, string]; // tokens: duas do anel + a do brilho de trás;
                                     // default ["--primary", "--info", "--primary"]
  size?: number;       // relativo ao menor lado; 0,2–1,5, default 1
  glow?: number;       // largura do brilho; 0–2, default 1
  wobble?: number;     // respiração e deformação; 0–2, default 1
  highlight?: number;  // força da luz que orbita; 0–2, default 1
  trail?: number;      // cauda da luz; 0–2, default 1
  speed?: number;      // default 1
  pointer?: boolean;   // estica, acende, pulsa no clique; default true
  children?: React.ReactNode;
};
```

## Regras

1. **Coordenadas.** `p` centrado, corrigido pela proporção, dividido por `0.35·size`;
   `r = length(p)`, `a = atan(p.y, p.x)`. `t = uTime·uSpeed`.
2. **Respiração.** Raio do anel `R = 1.0 + wobble·(0.04·sin(t·1.3) + 0.03·sin(a·3.0 + t·0.9))`.
   Com ponteiro dentro, `R += 0.15·max(0, cos(a − aPonteiro))²·forçaPonteiro`.
3. **Anel.** `d = abs(r − R)`; núcleo `exp(−d·40.0)`; brilho `exp(−d·(6.0/max(glow, 0.05)))·0.6`;
   brilho interno `step(r, R)·exp(−(R − r)·3.0)·0.25·glow`
   (só dentro do anel; revisado em 11/10/2026: sem o `step`, fora do anel ele valia 0,25 e
   pintava a área inteira).
4. **Cor do anel.** `mix(c1, c2, 0.5 + 0.5·sin(a + t·0.7))`; o brilho interno usa `c3`.
5. **Luz que orbita.** Ângulo `ao = t·1.1` (com ponteiro, puxado para `aPonteiro`); diferença
   angular `da = mod(a − ao + π, 2π) − π`; cabeça `exp(−da²·60.0)`; cauda
   `exp(−max(−da, 0)·(3.0/max(trail, 0.05)))·step(da, 0.0)·0.6`; ambas `·highlight·núcleo·2`, cor
   próxima do branco `mix(corAnel, vec3(1), 0.6)`.
6. **Entrada e pulso.** Escala do raio `·(1 − exp(−uTime·6)·cos(uTime·12)·0.3)` no começo; clique
   guarda o instante e soma `0.3·exp(−idade·4)·sin(idade·20)` ao raio por 1 s.
7. **Saída** pré-multiplicada (alfa = `max3(cor)`, `clamp`), mais o dither. Story com raiz
   `dark bg-background`.
8. **Movimento reduzido.** Sem entrada, pulso, ponteiro nem respiração.
9. **Fallback.** `radial-gradient(circle, transparent 30%, color-mix(in oklch, var(--c1) 50%,
   transparent) 34%, transparent 42%)`.

## Testes mínimos

Contrato comum + exatamente três tokens; limites de `size`, `glow`, `wobble`, `highlight`, `trail`;
`angleDelta(a, b)` puro (diferença angular em −π…π).
