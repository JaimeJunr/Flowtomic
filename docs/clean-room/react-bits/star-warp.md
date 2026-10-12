# Spec de comportamento: `star-warp`

> **Proveniência (clean room).** Escrita em 11/10/2026 a partir da página pública "Galaxy" em
> `reactbits.dev` (tabela de props; a demo não renderizou no browser de inspeção). O código do
> React Bits **não foi lido**. Segue o contrato `_fundo-webgl.md`. Versão enxuta: o original tem
> 29 props.

## O que a pessoa vê

Um **campo de estrelas** em várias camadas de profundidade, e a pessoa **voa devagar** através
dele: as estrelas nascem pequenas no centro e crescem para fora. As mais fortes têm **cruz de
brilho**; todas **cintilam** de leve, e o campo **gira** bem devagar. O mouse **afasta** as
estrelas por perto; um clique dá um salto em velocidade de dobra. Ao montar, o campo sai da dobra.

## API (`atoms/background/star-warp`)

```ts
type StarWarpProps = React.ComponentProps<"div"> & {
  colors?: string[];   // 1 a 4 tokens; default ["--foreground", "--info", "--primary"]
  density?: number;    // 0,3–3, default 1
  layers?: number;     // inteiro 2–8, default 4
  starSize?: number;   // 0,3–3, default 1
  flare?: number;      // cruz das mais fortes; 0–2, default 1
  twinkle?: number;    // 0–1, default 0.3
  travel?: number;     // velocidade do voo; −2–2 (negativo recua), default 0.5
  rotation?: number;   // giro do campo; default 0.1
  speed?: number;      // default 1
  pointer?: boolean;   // repulsão + salto no clique; default true
  children?: React.ReactNode;
};
```

## Regras

1. **Coordenadas.** `p` centrado, corrigido pela proporção, girado por `t·rotation·0.1`.
   `t = uTime·uSpeed`.
2. **Camadas.** Para `i = 0..layers−1` (laço até 8 com `break`):
   `z = fract(i/layers + t·travel·0.05·warp)` (warp = 1, ou maior no salto/entrada);
   escala `s = mix(12.0·density, 0.6, z)`; brilho da camada `smoothstep(0,0.3,z)·smoothstep(1,0.85,z)`.
3. **Estrela por célula.** `q = p·s + i·17.3`; `cell = floor(q)`; `local = fract(q) − 0.5`;
   `h = hash2(cell)`; posição `offset = (h − 0.5)·0.7`; `d = length(local − offset)`; só se
   `hash(cell + 3.1) < 0.35·density` existe estrela. Tamanho `0.03·starSize·mix(0.5, 1.5, hash)`;
   luz `0.02·starSize/ d` limitada.
4. **Cruz.** Nas estrelas com `hash > 0.85`: `max(0, 1 − abs(local.x·local.y)·800)·flare·0.3`.
5. **Cintilar.** `·(1 − twinkle + twinkle·(0.5 + 0.5·sin(t·3 + hash·50)))`.
6. **Cor.** Uma das cores da lista por `floor(hash·n)`.
7. **Ponteiro** (contrato regra 8): antes do passo 3, `p += normalize(p − ponteiro)·0.08·
   exp(−dist·6)`. Clique: `warp = 1 + 20·exp(−idade·3)`. Entrada: `warp = 1 + 20·exp(−uTime·3)`.
8. **Saída** pré-multiplicada (alfa = `max3`), mais o dither. Story com raiz `dark bg-background`.
9. **Movimento reduzido.** Quadro estático, sem entrada, salto nem repulsão.
10. **Fallback.** Dois `radial-gradient` de 1 px de `var(--c1)` com `background-size` 50 px e
    73 px, em posições diferentes.

## Testes mínimos

Contrato comum + de 1 a 4 tokens; `layers` inteiro 2–8; limites de `density`, `starSize`, `flare`,
`twinkle`, `travel`.
