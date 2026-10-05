# Spec de comportamento: `glitch-text`

> **Proveniência (clean room).** Escrita em 05/10/2026 a partir da demo pública "Glitch Text"
> em `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.

## O que a pessoa vê

Texto com "defeito digital". Duas cópias coloridas do mesmo texto, deslocadas uns pixels para os
lados, aparecem por faixas horizontais que pulam rápido de altura. Parece sinal de TV com
interferência. O texto principal fica sempre legível por cima.

## API (`atoms/typography/glitch-text`)

```ts
type GlitchTextProps = Omit<React.ComponentProps<"span">, "children"> & {
  children: string;
  /** Duração de um ciclo de interferência, em ms. Maior = mais lento. */
  durationMs?: number;                       // default 2000
  /** Sombras coloridas atrás das cópias. */
  chromatic?: boolean;                       // default true
  /** "always" = em loop; "hover" = só com ponteiro em cima ou foco dentro. */
  trigger?: "always" | "hover";              // default "always"
};
```

## Regras

1. **Camadas.**
   - O texto principal fica normal.
   - Duas cópias `aria-hidden` ficam por cima, na mesma posição.
   - Cópia A desloca +2px no x e usa a cor `var(--primary)`. Cópia B desloca -2px no x e usa a
     cor `var(--info)`.
   - Com `chromatic=false`, as cópias usam `currentColor` e sem sombra.
2. **Faixas.**
   - Cada cópia é recortada por `clip-path: inset(top% 0 bottom% 0)`.
   - O recorte muda por uma sequência de ~10 quadros com cortes "aleatórios", **fixos e
     determinísticos** (gerados por função pura com semente). Cada cópia tem uma sequência
     diferente.
   - A animação é em loop de `durationMs`, com passos (sem interpolação suave entre os
     cortes).
2b. **Rajadas** (revisão de 05/10/2026). As cópias só aparecem em rajadas curtas: ~25% do ciclo
   visíveis, o resto invisíveis. Cada faixa ocupa de 4% a 22% da altura. Fora das rajadas, só o
   texto principal: o efeito é interferência, não um texto permanentemente duplicado.
3. **`trigger="hover"`:** em repouso, as cópias ficam invisíveis. O glitch roda enquanto há
   hover ou foco.
4. **Fundo.** As cópias não têm fundo: o efeito funciona sobre qualquer superfície.
5. **Cor.** Só tokens. Nada de hex ou rgb no fonte.

## Movimento reduzido

Só o texto principal. Sem cópias.

## Acessibilidade

O texto principal é lido uma vez, e as cópias ficam em `aria-hidden`.

## Marcação

- Raiz: `data-slot="glitch-text"`, `relative inline-block`, `ref`, `cn`.
- Cópias: `data-slot="glitch-text-layer"`.

## Testes mínimos

- O texto é acessível uma vez (`getByText`), e há 2 camadas `aria-hidden`.
- A função de cortes é determinística: mesma semente gera a mesma sequência; sementes diferentes
  geram sequências diferentes. Todo valor fica entre 0 e 100.
- `chromatic=false` não usa a cor dos tokens nas camadas.
- `trigger="hover"`: as camadas ficam ocultas até o `pointerenter` e o `focus`.
- Movimento reduzido: nenhuma camada.
