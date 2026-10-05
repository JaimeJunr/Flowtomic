# Spec de comportamento: `circular-text`

> **Proveniência (clean room).** Escrita em 04/10/2026 a partir da demo pública "Circular Text"
> em `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.

## O que a pessoa vê

Um texto curto disposto em círculo, como um selo, girando devagar e sem parar. Opcionalmente,
algo fixo no centro (um ícone, um logo). O hover pode acelerar, desacelerar ou pausar o giro.

## API (`atoms/typography/circular-text`)

```ts
type CircularTextProps = Omit<React.ComponentProps<"div">, "children"> & {
  text: string;
  /** Diâmetro em px. */
  size?: number;                                       // default 160
  /** Uma volta completa, em ms. */
  durationMs?: number;                                 // default 20000
  onHover?: "none" | "slow" | "fast" | "pause";        // default "none"
  /** Conteúdo fixo no centro (não gira). */
  children?: React.ReactNode;
};
```

## Regras

1. **Distribuição.**
   - Cada caractere (inclusive espaço) ocupa uma fatia igual de 360°.
   - O caractere fica posicionado na borda, girado para ficar tangente ao círculo, com o topo
     para fora.
   - A fonte é herdada.
2. **Giro.** Contínuo, linear, sentido horário, 1 volta por `durationMs`.
3. **Hover.**
   - `slow`: a velocidade cai para 1/4.
   - `fast`: a velocidade sobe 4x.
   - `pause`: o giro para.

   A mudança de velocidade é suave (não pula de ângulo). Ao sair do hover, volta ao normal.
4. **Centro.** `children` fica centralizado e não gira.
5. **Texto vazio** lança `Error` com o valor recebido e o formato esperado.

## Movimento reduzido

O círculo fica parado, sem giro e sem efeito de hover.

## Acessibilidade

- A raiz tem `role="img"` e `aria-label={text}`.
- Os caracteres ficam em `aria-hidden`.
- O `children` mantém a acessibilidade própria: se for decorativo, quem usa marca.

## Marcação

- Raiz: `data-slot="circular-text"`, `ref`, `cn`, largura e altura = `size`.
- Caractere: `data-slot="circular-text-char"`.

## Testes mínimos

- N caracteres renderizados para um texto de N caracteres.
- O ângulo do caractere `i` é `i * 360 / N`. Testar a função pura.
- `role="img"` com o nome acessível igual ao texto.
- `children` aparece fora da camada que gira.
- `size` define largura e altura.
- Texto vazio lança erro.
- Movimento reduzido: sem animação de giro (estado exposto, ex.: `data-spinning="false"`).
- `onHover="pause"` pausa no `pointerenter`.
