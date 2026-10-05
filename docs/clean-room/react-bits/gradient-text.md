# Spec de comportamento: `gradient-text`

> **Proveniência (clean room).** Escrita em 04/10/2026 a partir da demo pública "Gradient Text"
> em `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.

## O que a pessoa vê

O texto é preenchido por um degradê de cores que desliza devagar e sem parar. Opcionalmente,
uma moldura arredondada em volta, com o mesmo degradê na borda.

## API (`atoms/typography/gradient-text`)

```ts
type GradientTextProps = React.ComponentProps<"span"> & {
  /** Cores CSS do degradê. Default só com tokens do tema. */
  colors?: string[];        // default ["var(--primary)", "var(--primary-hover)", "var(--accent-hover)", "var(--primary)"] (decidido em 05/10/2026: só tons da marca)
  durationMs?: number;      // default 8000 (um ciclo)
  direction?: "horizontal" | "vertical" | "diagonal";  // default "horizontal"
  /** Vai e volta em vez de recomeçar do início. */
  yoyo?: boolean;           // default true
  pauseOnHover?: boolean;   // default false
  /** Moldura arredondada com borda em degradê. */
  bordered?: boolean;       // default false
};
```

## Regras

1. **Preenchimento.**
   - Fundo `linear-gradient` com as `colors`, recortado no texto (`bg-clip-text` +
     `text-transparent`).
   - O fundo tem 300% do tamanho na direção do movimento, e o movimento é feito animando a
     `background-position`.
   - Ângulos: horizontal 90deg, vertical 180deg, diagonal 135deg.
2. **Loop.** Com `yoyo`, vai e volta; sem `yoyo`, recomeça.
3. **`pauseOnHover`:** congela no lugar e retoma de onde parou.
4. **`bordered`:** padding pequeno, `rounded-full` e borda de 1px feita com o mesmo degradê
   (pode ser uma camada por trás com máscara ou padding). O texto continua em degradê.
5. **Tokens apenas.** Os defaults usam `var(--...)`. O fonte não pode ter hex nem `rgb(` (o
   `theme-tokens.test.ts` reprova). Quem usa pode passar qualquer cor CSS.
6. **Contraste.** O componente não garante contraste. Isso fica documentado na story.

## Movimento reduzido

O degradê fica parado, na posição inicial.

## Acessibilidade

É texto normal, lido normalmente. Sem `aria-hidden`.

## Marcação

`data-slot="gradient-text"` na raiz, `ref`, `cn`. Com `bordered`, a moldura também tem
`data-slot="gradient-text-border"`.

## Testes mínimos

- O texto é renderizado e acessível.
- O `background-image` contém as cores passadas, com o ângulo de cada direção.
- O default não contém hex.
- `bordered` cria a moldura.
- Movimento reduzido: sem animação (verificar `data-animated="false"` ou similar exposto).
- `pauseOnHover` alterna o estado.
