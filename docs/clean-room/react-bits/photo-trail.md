# Spec de comportamento: `photo-trail`

> **Proveniência (clean room).** Escrita em 11/10/2026 a partir da demo pública "Image Trail"
> em `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**. A
> versão deles usava gsap e 8 variantes numeradas; esta usa só `motion` e 3 estilos com nome.
> Diferença do nosso `cursor-trail`: aqui o rastro são **cartões de imagem** que se sobrepõem e
> giram por uma lista, não cópias de um mesmo conteúdo.

## O que a pessoa vê

Uma área com um título grande no meio ("Passe o mouse"). Ao mover o mouse sobre ela, **fotos em
cartões arredondados vão surgindo atrás do ponteiro**, uma a cada trecho percorrido, cada nova
por cima da anterior, ciclando pela lista. Cada cartão nasce pequeno, cresce até o tamanho
cheio e, depois de um instante, encolhe e some. Mover rápido gera um rastro longo; parar deixa
os últimos cartões sumirem sozinhos.

## Por que existe (uso no produto)

Seção de destaque de portfólio, galeria de eventos ou página "sobre"; nunca em tela de trabalho.

## API (`atoms/animation/photo-trail`)

```ts
type PhotoTrailItem = { src: string; alt?: string } | React.ReactNode;

type PhotoTrailProps = React.ComponentProps<"div"> & {
  children?: React.ReactNode;         // conteúdo fixo no meio (título)
  items: PhotoTrailItem[];            // >= 1
  variant?: "pop" | "drift" | "tilt"; // default "pop"
  spacing?: number;                   // px de percurso entre cartões. default 80
  cardWidth?: number;                 // px, default 160; altura pela proporção 4:3 (`aspect-[4/3]`)
  lifetime?: number;                  // s até começar a sumir. default 0.6
  maxCards?: number;                  // máximo vivo ao mesmo tempo. default 12
};
```

Cartão `rounded-xl overflow-hidden bg-muted shadow-lg ring-1 ring-border`. Item que não é
`{src}` é renderizado como está (bloco de conteúdo, gradiente de token, ícone).

## Regras

1. **Disparo (puro `shouldSpawn(last, current, spacing)`).** Novo cartão quando a distância
   euclidiana do último ponto de disparo ≥ `spacing`. Primeiro movimento só registra o ponto.
2. **Ciclo.** Índice do item avança `(i + 1) % items.length`; `z-index` crescente (contador).
3. **Variantes (puro `variantMotion(variant, dx, dy)` → `{ initial, animate, exit }`):**
   - `pop`: entra de `scale 0.4, opacity 0` para `scale 1, opacity 1`; sai para `scale 0.2, opacity 0`.
   - `drift`: entra deslocado `-dx·0.5, -dy·0.5` (vindo de trás do movimento) e sai continuando
     `+dx·0.8, +dy·0.8` com `opacity 0`.
   - `tilt`: entra com `rotate` = ângulo do movimento limitado a ±15° e `scale 0.6`; sai caindo
     `y +40, rotate ×2, opacity 0`.
   `dx, dy` = vetor do último trecho normalizado vezes `spacing`.
4. **Vida.** Cada cartão é removido `lifetime` s depois de nascer (timer), com `AnimatePresence`
   fazendo a saída (0,4 s). Acima de `maxCards`, o mais antigo sai imediatamente.
5. **Posição** relativa à raiz (`relative overflow-hidden`), cartão centrado no ponto.
6. **Entrada do ponteiro.** Só mouse/caneta (toque ignorado). Sair da área não apaga: os cartões
   terminam a vida.
7. **Imagens** com `draggable={false}`, `loading="eager"`, `decoding="async"`; pré-carregar os
   `src` ao montar (`new Image()`), para o primeiro rastro não piscar.

## Movimento reduzido

Nenhum rastro: a área mostra só o conteúdo (`children`). Sem timers.

## Acessibilidade

Cartões `aria-hidden` (decorativos, `alt=""`). Os `children` (título) ficam abaixo dos
cartões (`z-0`), os cartões por cima; a raiz não captura foco.

## Marcação

Raiz `data-slot="photo-trail"`; cartões `data-slot="photo-trail-card"` com `data-index`.

## Testes mínimos

- `shouldSpawn` (abaixo/igual/acima do espaçamento) e `variantMotion` das três variantes
  (limite de ±15° no `tilt`).
- Movimento de mouse acima do espaçamento cria cartão e cicla pelos itens; toque não cria.
- Respeita `maxCards`; cartão some depois de `lifetime` (fake timers).
- Movimento reduzido não cria cartões.
- Item `ReactNode` renderizado como está.
