# Spec de comportamento: `corner-rays`

> **Proveniência (clean room).** Escrita em 12/10/2026 a partir da demo pública "Side Rays" em
> `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.
> Segue o contrato `_fundo-webgl.md`. Versão enxuta: o original tem 12 props.

## O que a pessoa vê

Um **leque de raios de luz** que entra por um canto da tela, como sol atravessando uma janela
alta. São **duas camadas** de raios em cores diferentes, levemente abertas entre si, que
**tremulam devagar** (os feixes engrossam e afinam). A luz é forte perto do canto e **apaga com a
distância**; o resto da tela fica escuro.

## API (`atoms/background/corner-rays`)

```ts
type CornerRaysProps = React.ComponentProps<"div"> & {
  colors?: [string, string];  // tokens das duas camadas; default ["--warning", "--info"]
  origin?: "top-right" | "top-left" | "bottom-right" | "bottom-left"; // default "top-right"
  speed?: number;      // default 1
  intensity?: number;  // 0–4, default 1.5
  spread?: number;     // abertura do leque; 0,2–4, default 1.5
  tilt?: number;       // graus, −90…90, default 0
  blend?: number;      // 0 = só a camada 1, 1 = só a 2; 0–1, default 0.5
  falloff?: number;    // queda com a distância; 0,3–4, default 1.6
  children?: React.ReactNode;
};
```

## Regras

1. **Origem.** Canto em `unit` (0–1) por `origin`, empurrado 0,1 para fora da tela na diagonal
   (o foco fica fora do quadro, a luz entra). `d = (unit − canto)·vec2(aspecto, 1)`;
   `r = length(d)`; `a = atan(d.y, d.x)`.
2. **Direção.** Eixo do leque aponta do canto para o centro da tela, girado por `tilt` (graus →
   rad). `da = diferença angular entre a e o eixo` (em −π…π).
3. **Camadas.** Camada k (k = 0, 1) desloca o eixo em `(k − 0.5)·0.25·spread` rad. Feixes:
   `rays_k = pow(0.5 + 0.5·sin(da_k·(9.0 + 4.0·k) + t·(0.6 + 0.3·k) + sin(da_k·23.0 − t)·0.6), 3.0)`
   com `t = uTime·uSpeed`; janela do leque `exp(−da_k²·(4.0/spread²))`.
4. **Queda.** `fall = exp(−r·falloff)`, mais um brilho no canto `0.4·exp(−r·falloff·4)`.
5. **Cor.** `mix(c1·rays_0·janela_0, c2·rays_1·janela_1, blend)·(fall + brilho)·intensity`;
   alfa = `max3(cor)` com `clamp`, saída pré-multiplicada, dither. Story com raiz `dark bg-background`.
6. **Movimento reduzido.** Quadro estático do renderer (nada a fazer além do contrato).
7. **Fallback.** `radial-gradient(ellipse at <canto>, color-mix(in oklch, var(--c1) 35%,
   transparent), transparent 60%)`, com o canto em CSS (`top right` etc.).

## Testes mínimos

Contrato comum + exatamente dois tokens; `originPoint(origin)` puro (os 4 cantos, valor inválido
lança); limites de `intensity`, `spread`, `tilt`, `blend`, `falloff`; o fallback usa o canto certo.
