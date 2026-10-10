# Spec de comportamento: `paper-folder`

> **Proveniência (clean room).** Escrita em 10/10/2026 a partir da demo pública "Folder" em
> `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.

## O que a pessoa vê

Uma **pasta de arquivo** desenhada em CSS (aba de trás com orelha, frente inclinável). Clicando,
ela **abre**: a frente inclina para baixo e até três **folhas** sobem de dentro, em leque. Com a
pasta aberta, cada folha **segue um pouco o ponteiro** (efeito ímã) enquanto ele está sobre ela.
Clicar de novo fecha. Passar o mouse na pasta fechada a entreabre de leve.

## Por que existe (uso no produto)

Estado vazio ou atalho de "Documentos", "Relatórios do mês", "Contratos" com até três prévias.

## API (`molecules/data-display/paper-folder`)

```ts
type PaperFolderProps = Omit<React.ComponentProps<"button">, "children"> & {
  /** Até 3 folhas (conteúdo pequeno: ícone, miniatura, texto curto). */
  papers?: React.ReactNode[];     // default []
  /** Nome da pasta para leitor de tela. */
  label: string;
  size?: number;                  // escala, default 1
  /** Controlado. */
  open?: boolean;
  defaultOpen?: boolean;          // default false
  onOpenChange?: (open: boolean) => void;
  tone?: "primary" | "secondary" | "accent"; // default "primary"
};
```

## Regras

1. **Desenho.** Base 100×80 px vezes `size` (via `transform: scale` num contêiner de tamanho
   próprio que também é escalado no layout, `width/height` multiplicados). Aba de trás
   `rounded-[10px] rounded-tl-none` na cor do `tone` (`bg-primary`, etc.) com a orelha
   (pseudo-elemento ou `div` `absolute -top-2.5 left-0 w-8 h-2.5 rounded-t-md`). Frente
   `absolute inset-0 rounded-[10px]` na mesma cor com uma camada `bg-background/15` por cima para
   diferenciar, `transform-origin: bottom`.
2. **Folhas.** Até 3, `absolute bottom-[10%] left-1/2 bg-card border rounded-md shadow-sm`, com
   larguras 70%, 80% e 90% e alturas 80%, 70% e 60%. Fechada: escondidas dentro
   (`translate(-50%, 10%)`). Aberta (pura `paperPose(i, count)`): sobem e abrem em leque —
   `i=0`: `translate(-120%, -70%) rotate(-15deg)`; `i=1`: `translate(10%, -70%) rotate(15deg)`;
   `i=2`: `translate(-50%, -100%) rotate(5deg)`; com 1 folha usa só a pose do meio. Transição
   300 ms `ease-in-out` (CSS).
3. **Abrir.** Clique alterna `open`. Aberta: frente `skew(15deg) scaleY(0.6)`; a raiz sobe 8 px.
   Hover fechada (mouse): frente `skew(15deg) scaleY(0.6)` parcial (metade) e folhas espiam
   (`translateY(-10%)`).
4. **Ímã nas folhas.** Aberta, `pointermove` sobre uma folha desloca-a em `(dx, dy) · 0.15` do
   centro da folha (pura `magnetOffset(rect, x, y, strength)`), somado à pose; `pointerleave`
   zera. Escrito por CSS variables (`--mx`, `--my`).
5. Mais de 3 folhas: usa as 3 primeiras e avisa em `console.warn` uma vez com o número recebido.

## Movimento reduzido

Abrir e fechar sem transição nem ímã; folhas aparecem direto na pose aberta.

## Acessibilidade

A raiz é um `<button type="button">` com `aria-label={label}` e `aria-expanded`. As folhas são
`aria-hidden` quando fechada.

## Marcação

- Raiz: `data-slot="paper-folder"`, `data-state="open" | "closed"`, `data-tone`, `ref`, `cn`.
- Partes: `paper-folder-back`, `paper-folder-front`, `paper-folder-paper` (com `data-index`).

## Testes mínimos

- `paperPose` para 1, 2 e 3 folhas; índice fora lança erro com o valor.
- `magnetOffset`: centro → 0; borda direita → x positivo proporcional a `strength`; rect zero lança.
- Clique alterna `aria-expanded` e `data-state`, chama `onOpenChange`; controlado manda.
- Folhas `aria-hidden` fechada; renderiza no máximo 3 e avisa com 4.
- `pointermove` numa folha aberta define `--mx`/`--my`; `pointerleave` zera.
- `tone` muda a classe; `size` escala largura e altura.
- Movimento reduzido sem classes de transição; `ref` e `className`.
