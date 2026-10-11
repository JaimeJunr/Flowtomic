# Spec de comportamento: `fan-cards`

> **Proveniência (clean room).** Escrita em 11/10/2026 a partir da demo pública "Bounce Cards" em
> `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.

## O que a pessoa vê

Um leque de 3 a 7 cartões quadrados sobrepostos, como fotos jogadas na mesa: cada um levemente
inclinado e deslocado na horizontal. Ao montar, os cartões **surgem um por um com um quique**
(escala 0 → 1 com mola que passa do alvo). Ao passar o mouse num cartão, ele **endireita, cresce
um pouco e vem para a frente**, e os outros **se afastam para os lados** (os da esquerda para a
esquerda, os da direita para a direita). Ao sair, tudo volta ao leque.

## Por que existe (uso no produto)

Vitrine compacta de 3 a 7 itens visuais: planos, relatórios, capas de documentos, prints de tela.

## API (`molecules/data-display/fan-cards`)

```ts
type FanCardItem = { id: string; label: string; image?: string; content?: React.ReactNode };

type FanCardsProps = Omit<React.ComponentProps<"div">, "onSelect"> & {
  items: FanCardItem[];        // 1..12; fora disso lança erro com o valor
  cardSize?: number;           // px, default 200
  spread?: number;             // px entre centros, default 85
  rotation?: number;           // graus, inclinação máxima, default 10
  arc?: number;                // px, desce os das pontas (negativo sobe), default 0
  pushDistance?: number;       // px que os vizinhos se afastam, default 160
  hoverScale?: number;         // default 1.06
  bounciness?: number;         // 0..1, default 0.6 (fora da faixa lança erro)
  delay?: number;              // s antes do primeiro, default 0.5
  stagger?: number;            // s entre cartões, default 0.06
  interactive?: boolean;       // hover espalha, default true
  onSelect?: (index: number) => void; // com ele, cartões viram <button>
};
```

`image` vira `<img alt={label}>` com `object-cover`; senão renderiza `content`. Moldura: borda
`border-4 border-card` (a cor do cartão, parece foto com margem), `rounded-3xl`, `shadow-lg`, que
vira `shadow-xl` no cartão em foco.

## Regras

1. **Posição de repouso (pura `restPose(index, count, { spread, rotation, arc })` →
   `{ x, rotate, y }`).** `offset = index - (count-1)/2`. `x = offset · spread`. `y = arc ·
   (offset / max(1,(count-1)/2))²` (0 no meio, `arc` nas pontas). `rotate`: inclinação "de pilha
   solta", não linear — use um padrão determinístico, por exemplo `rotation · pattern[index %
   pattern.length]` com `pattern = [-1, 0.4, -0.6, 0.8, -0.3, 1, -0.8]`. Mesmo índice dá sempre o
   mesmo resultado.
2. **Pose com foco (pura `focusPose(index, hovered, rest, pushDistance)`).** O cartão em foco:
   `rotate 0`, `y 0`, `x` = o de repouso. Os outros: `x = rest.x - pushDistance` se estiver à
   esquerda do foco, `+ pushDistance` à direita; rotação e y de repouso.
3. **Ordem na pilha.** Em repouso, o do meio fica na frente (`zIndex = count - |offset|·2`
   arredondado). O em foco ganha `zIndex` acima de todos.
4. **Entrada.** Cada cartão anima `scale` 0 → 1 com mola, em `delay + index·stagger`. Mola:
   `stiffness 260`, `damping` interpolado de 26 (`bounciness 0`) até 9 (`bounciness 1`).
5. **Movimento entre poses.** `motion.div` com `animate={{ x, y, rotate, scale }}` e mola
   `stiffness 300, damping 24`.
6. **Hover** só com `pointerType` mouse/pen; foco por teclado (com `onSelect`) aplica a mesma
   pose. `Enter`/clique chamam `onSelect(index)`.

## Movimento reduzido

Sem entrada (já aparecem em escala 1) e troca de pose sem mola (`duration: 0`). O hover continua
mudando a pose, mas instantâneo.

## Acessibilidade

Raiz `role="list"` com `aria-label` opcional; cartões `role="listitem"`. Com `onSelect`, o
cartão é `<button type="button" aria-label={label}>`. Sem `onSelect`, a imagem tem `alt`.

## Marcação

- Raiz: `data-slot="fan-cards"`, `ref`, `cn`, `relative`, altura `cardSize + |arc| + 40`.
- Cartão: `data-slot="fan-cards-card"`, `data-index`, `data-focused`.

## Testes mínimos

- `restPose`: meio com `x 0`; simetria de `x`; `arc` nas pontas e 0 no meio; determinístico.
- `focusPose`: vizinhos à esquerda vão `-pushDistance`, à direita `+`; o focado zera rotação.
- `items` vazio ou > 12 e `bounciness` fora de 0..1 lançam erro com o valor.
- Hover com mouse marca `data-focused`; `onSelect` vira botão e responde a clique e Enter.
- Movimento reduzido renderiza tudo visível sem esperar.
