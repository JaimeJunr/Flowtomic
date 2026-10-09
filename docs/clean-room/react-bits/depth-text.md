# Spec de comportamento: `depth-text`

> **Proveniência (clean room).** Escrita em 05/10/2026 a partir da demo pública "Depth Text" em
> `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.

## O que a pessoa vê

Uma palavra grande "extrudada" em 3D, como letra de bloco com profundidade. Atrás da face nítida
há várias cópias empilhadas que formam a lateral, num tom mais escuro. A palavra inclina um pouco
na direção do ponteiro, com suavidade. Sem ponteiro, ela orbita devagar sozinha.

## API (`atoms/typography/depth-text`)

```ts
type DepthTextProps = Omit<React.ComponentProps<"div">, "children"> & {
  text: string;
  /** Cópias que formam a extrusão. Limitado a 60 para proteger o DOM. */
  layers?: number;                 // default 24
  /** Distância entre cópias, em px. */
  depthPx?: number;                // default 3 (revisão 05/10/2026)
  /** Cor da extrusão. Default: token da marca. */
  depthColor?: string;             // default "var(--primary)"
  /** Inclinação máxima, em graus. */
  tiltDeg?: number;                // default 8
  /** 0..1, quanto a rotação "corre atrás" do alvo por quadro. */
  smoothing?: number;              // default 0.12
  perspectivePx?: number;          // default 900
  /** Órbita sutil quando o ponteiro não está sobre a área. */
  autoOrbit?: boolean;             // default true
  /** Voltas por segundo da órbita. */
  orbitSpeed?: number;             // default 0.3
  shadow?: boolean;                // default true
};
```

## Regras

1. **Pilha.**
   - A face fica na frente, com a cor herdada (`currentColor`).
   - As cópias `i = 1..layers` ficam atrás, em `translateZ(-i * depthPx)`.
   - A cor das cópias é `depthColor`, mais escura quanto mais funda; a mais funda guarda 80% da
     cor (revisão 05/10/2026: a 45% a lateral sumia junto da face escura). Use opacidade ou
     `color-mix` com `currentColor`; sem hex.
   - `transform-style: preserve-3d` e `perspective` na raiz.
2. **Ponteiro.**
   - Só com ponteiro fino (`(pointer: fine)`).
   - A posição relativa ao centro da raiz vira um alvo de `rotateY`/`rotateX` até ±`tiltDeg`.
   - A rotação atual segue o alvo com `smoothing` a cada quadro (lerp).
2b. **Pose de repouso** (revisão de 05/10/2026). De frente a extrusão some atrás da face. Por
   isso a rotação base é `rotateX(10deg) rotateY(-16deg)`, e a inclinação do ponteiro e a órbita
   somam a ela. A lateral fica sempre visível.
3. **Órbita.** Sem ponteiro sobre a área, o alvo vira uma órbita circular pequena (±tilt/2) na
   velocidade `orbitSpeed`.
4. **Sombra.** Com `shadow`, um `drop-shadow` suave na cor `depthColor` com baixa opacidade.
5. **Desempenho.** O loop para fora da tela.
6. **`layers`** fora de 1..60 é ajustado para dentro (clamp), sem erro. Texto vazio lança
   `Error` com o valor recebido e o formato esperado.

## Movimento reduzido

Fica a extrusão estática na pose de repouso, sem inclinação do ponteiro e sem órbita.

## Acessibilidade

A face tem o texto real. As cópias ficam em `aria-hidden`.

## Marcação

- Raiz: `data-slot="depth-text"`, `ref`, `cn`.
- Cópia: `data-slot="depth-text-layer"`.

## Testes mínimos

- `layers` cópias `aria-hidden`, com clamp em 60.
- Função pura de alvo de rotação (pontos centro, canto e fora da caixa) respeita `tiltDeg`.
- Função pura de lerp com `smoothing`.
- Função pura de órbita periódica.
- Movimento reduzido: rotação 0 e sem loop.
- Texto vazio lança erro.
