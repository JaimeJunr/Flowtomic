# Spec de comportamento: `particle-text`

> **Proveniência (clean room).** Escrita em 05/10/2026 a partir da demo pública "Particle Text"
> em `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.

## O que a pessoa vê

Uma nuvem de pontinhos espalhados que voam e se juntam até formar uma palavra. Formada, a palavra
"respira" de leve. Passando o ponteiro, os pontos fogem dele e voltam ao lugar. Hover ou clique
podem espalhar e reunir de novo.

## API (`atoms/typography/particle-text`)

```ts
type ParticleTextProps = Omit<React.ComponentProps<"div">, "children"> & {
  text: string;
  /** Tamanho de cada ponto, em px CSS. */
  particleSizePx?: number;               // default 2
  /** Passo de amostragem, em px. Menor = mais pontos. */
  density?: number;                      // default 4
  /** Segunda cor misturada no campo. Default: token da marca. */
  highlightColor?: string;               // default "var(--primary)"
  /** Distância inicial dos pontos até o alvo, em px. */
  scatterPx?: number;                    // default 180
  gatherMs?: number;                     // default 1600
  /** Atraso máximo por ponto, em ms. */
  staggerMs?: number;                    // default 420
  repelStrength?: number;                // default 40
  repelRadiusPx?: number;                // default 120
  /** Movimento de repouso, 0..1. */
  idleDrift?: number;                    // default 0.6
  /** Como repetir o espalha-e-junta depois da primeira vez. */
  trigger?: "mount" | "hover" | "click"; // default "mount"
  glow?: boolean;                        // default true
};
```

Fonte e cor principal vêm do CSS da raiz (`getComputedStyle`). As cores de token são resolvidas
com `readThemeColor`/`parseCssColor` de `@/lib/read-theme-color`, ou desenhadas como string CSS
no canvas.

## Regras

1. **Amostragem.**
   - Desenha o texto num canvas fora da tela e lê os pixels com `getImageData`.
   - Cada pixel opaco numa grade de passo `density` vira um alvo.
   - O total é limitado a ~6000 pontos (o passo aumenta se precisar).
2. **Juntar.**
   - Cada ponto nasce em `alvo + vetor aleatório de módulo até scatterPx` e vai ao alvo em
     `gatherMs` com ease-out, após atraso aleatório até `staggerMs`.
   - A distribuição aleatória usa gerador com semente (determinístico em teste).
3. **Cor.** Cada ponto recebe a cor principal ou `highlightColor`, numa mistura de ~25%.
4. **Repouso.** Pequena oscilação senoidal (amplitude ∝ `idleDrift`) em torno do alvo.
5. **Ponteiro.** Dentro de `repelRadiusPx`, empurra o ponto para fora com força ∝ `(1 - d/r)`.
   O ponto volta com mola.
6. **`trigger`.** `hover` repete o ciclo no `pointerenter`; `click` repete no clique e no
   Enter/Espaço (com `tabIndex=0`).
7. **Glow.** `shadowBlur` na cor de destaque.
8. **Loop** só visível. Recalcula os alvos no resize (debounce).
9. **Fallback.** Sem canvas 2D, renderiza o texto puro.

## Movimento reduzido

Desenha os pontos já no lugar, sem voo, sem drift e sem repulsão. Ou o texto puro.

## Acessibilidade

O texto vai num `sr-only`, e o canvas fica em `aria-hidden`.

## Marcação

- Raiz: `data-slot="particle-text"`, `ref`, `cn`.
- Canvas: `data-slot="particle-text-canvas"`.

## Testes mínimos

- Fallback no jsdom.
- Funções puras:
  - amostragem de alvos a partir de um `ImageData` sintético (respeita `density` e o limite);
  - gerador com semente reprodutível;
  - posição no instante `t` (antes do atraso = início; depois de `gatherMs` = alvo);
  - força de repulsão (zero fora do raio).
- `trigger="click"` reinicia o ciclo (estado exposto `data-cycle`).
- Movimento reduzido: sem loop.
