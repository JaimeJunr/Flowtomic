# Spec de comportamento: `curved-input`

> **Proveniência (clean room).** Escrita em 10/10/2026 a partir da demo pública "Curved Input" em
> `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.

## O que a pessoa vê

Um campo de texto com botão (estilo "seu e-mail + Começar") cuja barra é **arqueada**: o meio
sobe e as pontas descem, como um sorriso invertido. O texto digitado, o placeholder e o rótulo do
botão **seguem a curva**. À esquerda, um chip redondo com ícone. Com foco, um anel na cor primária
contorna a forma curva.

## Por que existe (uso no produto)

Captura de e-mail em landing page e lista de espera, com presença visual.

## API (`molecules/forms/curved-input`)

```ts
type CurvedInputProps = Omit<React.ComponentProps<"form">, "onChange" | "onSubmit"> & {
  value?: string;
  defaultValue?: string;                 // default ""
  onValueChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  placeholder?: string;                  // default "Seu melhor e-mail"
  buttonLabel?: string;                  // default "Começar"
  type?: "email" | "text" | "search";    // default "email"
  name?: string;
  "aria-label"?: string;                 // padrão: placeholder
  width?: number;                        // px, default 450 (encolhe para caber: max-width 100%)
  bend?: number;                         // px que o meio sobe; negativo desce; default 28
  height?: number;                       // espessura da barra em px, default 64
  radius?: number;                       // px, default 18
  showButton?: boolean;                  // default true
  icon?: React.ReactNode | false;        // default ícone Mail do lucide; false esconde
};
```

## Regras

1. **Geometria (puras em utils).** Linha central é uma curva quadrática de `(0, bend)` a
   `(width, bend)` com controle em `(width/2, -bend)` (meio sobe `bend`). `barOutline(width,
   height, bend, radius)` devolve o `d` da forma: a curva central deslocada `±height/2` na
   vertical (topo e base paralelos) com pontas arredondadas por arcos de raio `min(radius,
   height/2)`. `centerPath(x0, x1, ...)` devolve o trecho da curva central entre `x0` e `x1`, usado
   como trilho do texto. `pointOnCurve(t)` para posicionar o chip e o botão.
2. **Camadas.** Um `<svg>` (`aria-hidden`, viewBox calculado com folga de `|bend| + height/2`)
   desenha: a barra (`fill="var(--card)"`, `stroke="var(--border)"`), o chip
   (`fill="var(--primary)"` com o ícone em `var(--primary-foreground)`, num `foreignObject` ou
   `<g>`), o botão (forma da mesma família recortada na ponta direita, `fill="var(--primary)"`), o
   texto (`<textPath>` no trilho entre chip e botão, `fill="var(--foreground)"`; placeholder em
   `var(--muted-foreground)` quando vazio) e o anel de foco (`stroke="var(--ring)"`, só com foco).
3. **Campo real.** Um `<input>` nativo cobre a área do texto, com `text-transparent
   caret-transparent bg-transparent outline-none`, recebendo digitação, colar, seleção e
   autocomplete. O SVG ecoa `value`. Um cursor desenhado (linha de 1,5 px que pisca 1 s) fica no
   ponto do trilho correspondente a `selectionStart`, medido com `getSubStringLength(0,
   selectionStart)` no `<text>`; sem a medida (jsdom), no fim do texto.
4. **Texto longo.** Se o comprimento do texto passar do trilho, desloca o `startOffset` para
   manter o cursor visível (o começo some pela esquerda) — pura `scrollOffset(textLen,
   caretLen, trackLen)`.
5. **Botão.** Um `<button type="submit">` real e transparente sobre a forma do botão, com o
   rótulo também ecoado no SVG por um trilho curto. Enter ou clique chamam `onSubmit(value)`
   com `preventDefault` no submit do form.
6. **Ajuste ao contêiner.** O SVG tem `width="100%"` com o viewBox fixo; o campo e o botão são
   posicionados em % do viewBox para acompanhar a escala.

## Movimento reduzido

Cursor sem piscar (fixo).

## Acessibilidade

O `<input>` tem `aria-label` (ou placeholder) e o `type` certo para teclado móvel; o botão tem
o texto do rótulo como nome. O SVG é decorativo.

## Marcação

- Raiz `<form>`: `data-slot="curved-input"`, `data-focused`, `ref`, `cn`.
- Partes: `curved-input-field`, `curved-input-button`, `curved-input-shape`, `curved-input-text`,
  `curved-input-caret`.

## Testes mínimos

- `barOutline` começa com `M` e fecha com `Z`; `bend=0` gera topo reto (y constante);
  `pointOnCurve(0.5)` sobe `bend`; `radius` maior que `height/2` é limitado.
- `scrollOffset` 0 quando cabe e positivo quando passa.
- Digitar chama `onValueChange` e ecoa no `textPath`; placeholder some ao digitar.
- Enter e clique no botão chamam `onSubmit` com o valor; `showButton={false}` não renderiza botão.
- Controlado: `value` manda.
- `icon={false}` esconde o chip; `aria-label` padrão é o placeholder.
- Movimento reduzido: cursor sem animação.
- `ref` e `className`.
