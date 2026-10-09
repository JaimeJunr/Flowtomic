# Spec de comportamento: `cursor-trail`

> **Proveniência (clean room).** Escrita em 05/10/2026 a partir da demo pública "Text Cursor"
> em `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.
> O nome é nosso: o rastro aceita qualquer conteúdo, não só texto.

## O que a pessoa vê

Dentro de uma área, ao mover o mouse, ficam para trás pequenas cópias de um conteúdo (um ícone,
uma palavra) em intervalos regulares, como pegadas. Elas podem girar para apontar a direção do
movimento e flutuam levemente. Quando o mouse para, as cópias somem uma a uma, da mais antiga
para a mais nova.

## API (`atoms/animation/cursor-trail`)

```ts
type CursorTrailProps = React.ComponentProps<"div"> & {
  /** O que vira rastro (ícone, palavra). Obrigatório: não há emoji padrão. */
  content: React.ReactNode;
  /** Distância mínima entre duas cópias, em px. */
  spacingPx?: number;                 // default 100
  /** Gira cada cópia para a direção do movimento. */
  followDirection?: boolean;          // default true
  /** Pequena flutuação aleatória de posição e rotação. */
  float?: boolean;                    // default true
  maxPoints?: number;                 // default 5
  /** Intervalo entre as remoções quando o mouse para, em ms. */
  removeIntervalMs?: number;          // default 30
  /** Duração da saída (fade e encolher), em ms. */
  exitMs?: number;                    // default 500
};
```

`children` é o conteúdo normal da área. O rastro aparece por cima, sem bloquear cliques.

## Regras

1. **Pontos.**
   - Só ponteiros `mouse` e `pen`; toque é ignorado.
   - Um ponto novo nasce quando o ponteiro anda ≥ `spacingPx` desde o último ponto.
   - A posição é relativa à área.
2. **Limite.** Acima de `maxPoints`, o mais antigo sai.
3. **Direção.** Com `followDirection`, o ângulo vem de `atan2` do deslocamento desde o ponto
   anterior.
4. **Parada.** Sem movimento por ~100ms, remove um ponto a cada `removeIntervalMs`.
5. **Saída.** Fade e encolher em `exitMs` (AnimatePresence).
6. **Camada.** O rastro tem `pointer-events: none` e fica em `aria-hidden`.
7. **Área.** A raiz é `relative overflow-hidden`.

## Movimento reduzido

Nenhum rastro. Só os `children`.

## Acessibilidade

O rastro é decorativo (`aria-hidden`). Os `children` mantêm a própria semântica.

## Marcação

- Raiz: `data-slot="cursor-trail"`, `ref`, `cn`.
- Ponto: `data-slot="cursor-trail-point"`.

## Testes mínimos

- Função pura "deve criar ponto?" pela distância, e função de ângulo.
- `pointermove` do tipo mouse acima do espaçamento cria ponto; abaixo, não cria.
- `pointerType="touch"` é ignorado.
- O limite `maxPoints` é respeitado.
- Fake timers: parado, os pontos são removidos.
- Os `children` são renderizados e clicáveis.
- Movimento reduzido: sem pontos.
