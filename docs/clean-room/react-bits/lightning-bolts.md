# Spec de comportamento: `lightning-bolts`

> **Proveniência (clean room).** Escrita em 11/10/2026 a partir da demo pública "Lightning" em
> `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.
> Segue o contrato `_fundo-webgl.md`. Versão enxuta: o original tem 22 props.

## O que a pessoa vê

No escuro, **raios** descem do alto da tela: um caminho em zigue-zague com núcleo quase branco e
um brilho colorido em volta. O caminho **rasteja** devagar, mudando de forma; galhos laterais
**piscam** de vez em quando, e há clarões curtos. O mouse **puxa** os raios para perto; um clique
chama um raio que cai no ponto. Ao montar, os raios descem do topo.

## API (`atoms/background/lightning-bolts`)

```ts
type LightningBoltsProps = React.ComponentProps<"div"> & {
  color?: string;      // token; default "--info"
  bolts?: number;      // inteiro 1–4, default 1
  spread?: number;     // espaço entre raios; 0–1, default 0.6
  branches?: number;   // 0–1, default 0.5
  angle?: number;      // graus; default 0 (vertical)
  thickness?: number;  // 0,3–3, default 1
  glow?: number;       // 0–2, default 1
  flicker?: number;    // 0–1, default 0.6
  speed?: number;      // default 1
  pointer?: boolean;   // puxa + raio no clique; default true
  children?: React.ReactNode;
};
```

## Regras

1. **Coordenadas.** `p` centrado, corrigido pela proporção, girado por `angle`; `y` de cima para
   baixo em 0…1 (`v`). `t = uTime·uSpeed`.
2. **Caminho do raio `b`** (`b = 0..bolts−1`): centro `x0 = (b − (bolts−1)/2)·spread·0.6`;
   deslocamento `x(v) = x0 + Σ_{k=1..5} 0.5^k·0.25·(vnoise(v·2^k·3 + b·7.1 + t·0.4) − 0.5)·2`
   (ruído de valor 1D, laço fixo). Com ponteiro, `x += (ponteiro.x − x)·0.4·exp(−abs(v − ponteiro.v)·3)`.
3. **Traço.** `d = abs(p.x − x(v))` em px; núcleo `exp(−d/(1.2·thickness))`; brilho
   `exp(−d/(18.0·glow))·0.5`.
4. **Galhos.** Para `j = 0..2`: num trecho `v ∈ [v_j, v_j + 0.25]` com `v_j = hash(b, j, floor(t·2))`,
   um traço lateral que sai do caminho com inclinação `±0.6`; aparece se
   `hash(b, j, floor(t·6)) < branches`; intensidade `·0.6`.
5. **Piscar.** `·(1 − flicker·0.5·hash(floor(uTime·20)))`; clarão: se
   `hash(floor(uTime·3)) > 1 − 0.1·flicker`, `·1.8` naquele intervalo.
6. **Entrada.** Corta abaixo de `v > smoothstep(0, 0.8, uTime)·1.1`.
7. **Clique.** Raio extra cujo caminho termina no ponto clicado; dura 0,6 s com brilho
   `exp(−idade·5)·2`.
8. **Cor.** `mix(uColor, vec3(1), clamp(núcleo·0.8, 0, 1))·(núcleo + brilho)`. **Saída**
   pré-multiplicada com alfa = `max3`, mais o dither. Story com raiz `dark bg-background`.
9. **Movimento reduzido.** Um quadro com o caminho em `t = 0`, sem piscar, galhos, entrada nem
   clique.
10. **Fallback.** `linear-gradient(to bottom, color-mix(in oklch, var(--c) 30%, transparent),
    transparent 60%)` estreito no centro (`background-size: 2px 100%` repetido só no meio).

## Testes mínimos

Contrato comum + `bolts` inteiro 1–4; limites de `spread`, `branches`, `thickness`, `glow`,
`flicker`; clique com `pointer={false}` não cria raio.
