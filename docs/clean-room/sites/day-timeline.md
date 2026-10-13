# DayTimeline — spec clean room

Fonte observada: a seção "Um dia com seu dot" de chatgpt.com/pt-BR/features/dots, vista só na
tela em 13/10/2026, em 1280 e 390 px, no navegador do app (clicando nas setas e rolando). Nenhum
código, CSS ou asset da página foi lido. Ver `README.md` desta pasta.

## O que se viu (resumo)

- Uma **régua horizontal** atravessando a seção: pontos grandes (os momentos do dia, 5 a 6) com
  traços pequenos e finos entre eles, como uma régua de tempo, tudo em cinza.
- Um **cursor** (playhead) parado sobre o momento ativo: uma linha vertical curta na cor de
  destaque que desce até a régua, e acima dela uma **pílula** na mesma cor com a hora ("15:30") no
  meio e uma seta para cada lado. No último momento, a seta da direita fica apagada.
- Acima do cursor, o **personagem** e um **balão de mensagem** do agente ("Criei e testei uma
  atualização…"), com uma reação pequena no canto do balão. O balão fica do lado em que há espaço:
  à esquerda do cursor quando ele está perto da borda direita.
- Abaixo da régua, centralizado: um rótulo pequeno de contexto ("No trabalho", "Na vida"), o
  título do momento grande e um parágrafo curto em `muted`.
- Trocar de momento desliza o cursor pela régua até o próximo ponto; balão e texto trocam.
- **Celular**: o cursor fica fixo no centro da tela e a **régua é que desliza** por baixo dele (só
  parte dela aparece, com pontos cortados nas bordas). O balão fica ao lado do personagem, em
  largura quase total, acima da régua; o texto do momento vem abaixo.

O que não copiar: o personagem (mascote deles) e a cor amarela como marca. No Flowtomic, o
"personagem" vira um slot opcional (`avatar`) e a cor é `--primary`.

## Composição

Molecule `DayTimeline`. `<section>` com `@container`, em três faixas verticais:

1. **Palco** (acima da régua): slot `avatar` (ReactNode opcional) + balão com `message` do momento
   ativo. Altura mínima estável (`min-h-40`), para a página não pular quando a mensagem muda de
   tamanho.
2. **Régua**: o trilho, os pontos dos momentos, os traços menores e o cursor com a pílula.
3. **Texto do momento**: `eyebrow` (rótulo de contexto, em caixa normal, `text-sm
   muted-foreground` — nunca caixa alta), `title` (`text-display-xs`, `@min-[768px]:text-display-sm`,
   `text-balance`), `description` (`muted-foreground`, até 60ch), centralizados.

### Régua
- Trilho horizontal com os momentos posicionados **pelo horário** (proporcional entre `start` e
  `end`, padrão o primeiro e o último momento), não por índice.
- Ponto do momento: círculo de 12 px `bg-muted-foreground/40` (via `color-mix`), o ativo some sob
  o cursor.
- Traços menores: um a cada `tickMinutes` (padrão 30), linha de 1 px × 8 px `bg-border`. Puramente
  decorativos (`aria-hidden`).
- Cursor: linha vertical de 2 px × 24 px `bg-primary` até a régua, e a pílula `bg-primary
  text-primary-foreground rounded-lg` com seta anterior, hora (`font-mono tabular-nums`) e seta
  seguinte. As setas são botões de ícone (`ChevronLeft`/`ChevronRight` do lucide), `aria-label`
  "Momento anterior"/"Próximo momento", desabilitadas nas pontas (opacidade 40%).
- O cursor anda até o momento novo com `transform` (mola curta do motion ou transição CSS de
  300 ms); com movimento reduzido, salta.

### Largo × estreito (container query em 640 px)
- **Largo**: régua inteira visível, o cursor se move sobre ela.
- **Estreito**: o cursor fica no centro e a régua (com largura fixa de `momentos × 160 px`)
  desliza com `translateX` para pôr o momento ativo sob o cursor; pontos fora do quadro ficam
  cortados (`overflow-hidden` no contêiner da régua), com um degradê de `--background` para
  transparente nas duas bordas.

### Balão
- `rounded-2xl bg-muted p-4 text-sm`, largura máxima 320 px (largo) ou total menos o avatar
  (estreito).
- No largo, o palco posiciona avatar + balão **acima do cursor**: o balão vai à direita do avatar,
  a menos que o cursor esteja nos 35% finais da largura — aí vai à esquerda. Nunca sai do quadro
  (prenda a posição entre 0 e largura − largura do balão).
- `reaction` opcional (ReactNode) num círculo pequeno sobreposto ao canto inferior direito do
  balão, `aria-hidden` se for decorativo.
- Troca de momento: o balão e o texto fazem fade (150 ms) — sem animação com movimento reduzido.

### Interação
- Setas da pílula, **clique num ponto** da régua (cada ponto é um botão com `aria-label` "<hora>:
  <título>"), e teclado: com o foco na régua (`role="slider"`), `ArrowLeft`/`ArrowRight` trocam,
  `Home`/`End` vão às pontas.
- **Arrastar** o cursor (pointer events, com `touch-action: pan-y` e `select-none`): enquanto
  arrasta, o cursor segue o ponteiro preso ao trilho e a hora mostra o horário daquela posição;
  ao soltar, encaixa no momento mais próximo.
- `autoPlay` opcional (ms por momento): avança sozinho e volta ao início no fim; pausa quando o
  ponteiro está sobre a seção, quando tem foco dentro e com movimento reduzido. Botão de
  pausar/retomar visível quando `autoPlay` está ligado (WCAG 2.2.2).
- Controlado (`value` + `onValueChange` com o `id` do momento) ou não (`defaultValue`, padrão o
  primeiro).

## API

```ts
type DayMoment = {
  id: string;
  time: string;              // "HH:MM", 24 h
  eyebrow?: ReactNode;       // "No trabalho"
  title: ReactNode;
  description?: ReactNode;
  message?: ReactNode;       // texto do balão
  reaction?: ReactNode;
};

type DayTimelineProps = Omit<ComponentProps<"section">, "defaultValue"> & {
  moments: DayMoment[];      // em ordem de horário
  value?: string;
  defaultValue?: string;
  onValueChange?: (id: string) => void;
  avatar?: ReactNode;
  start?: string;            // "HH:MM"; padrão o primeiro momento
  end?: string;              // padrão o último
  tickMinutes?: number;      // padrão 30
  autoPlay?: number;         // ms por momento; desligado por padrão
  label?: string;            // aria-label da régua; padrão "Momento do dia"
};
```

`data-slot`: `day-timeline`, `day-timeline-stage`, `day-timeline-bubble`, `day-timeline-track`,
`day-timeline-moment` (com `data-active`), `day-timeline-cursor`, `day-timeline-content`.

## Acessibilidade

- A régua é `role="slider"` com `aria-valuemin=0`, `aria-valuemax=<n − 1>`, `aria-valuenow=<índice>`
  e `aria-valuetext` "<hora>, <título>".
- O texto do momento fica numa região `aria-live="polite"` (só o título e a descrição; o balão
  não, para não anunciar duas vezes).
- A régua tem um só ponto de tabulação (o slider). Os pontos são clicáveis por ponteiro e têm
  `tabIndex={-1}`.
- Com `autoPlay`, a região viva fica `aria-live="off"` enquanto toca sozinha.

## Estados que o teste deve cobrir

1. Renderiza a régua (`role="slider"`) com `aria-valuetext` do primeiro momento e o texto dele.
2. Seta seguinte avança; anterior volta; as duas desabilitam nas pontas.
3. Teclado: `ArrowRight`, `ArrowLeft`, `Home`, `End`.
4. Clique num ponto vai para aquele momento.
5. Controlado: `onValueChange` com o id; sem `value` novo, nada muda.
6. Posição: com momentos às 08:00, 12:00 e 18:00, o do meio fica a 40% do trilho (confira o estilo
   `left` do ponto).
7. Arrastar: `pointerdown` no cursor, `pointermove` até perto do terceiro ponto, `pointerup`
   encaixa no terceiro (mocke `getBoundingClientRect` do trilho).
8. `autoPlay` com timers falsos avança e volta ao início; pausa com o ponteiro sobre a seção; o
   botão de pausar alterna; com movimento reduzido não toca.
9. Balão mostra a `message` do momento ativo; `reaction` aparece.

## Story

`Flowtomic UI/Molecules/DayTimeline`, `layout: "padded"`. Conteúdo próprio, sem marca alheia nem
personagem deles: o dia de quem mantém uma biblioteca de componentes. O `avatar` é um círculo
`bg-primary` com um ícone do lucide (`Sparkles` ou `Bot`).

Momentos: 08:30 "Comece com a fila arrumada" (o agente separou os PRs por risco); 11:00 "Revisão
sem caça ao tesouro" (comentários agrupados por arquivo); 13:30 "Uma armadilha a menos"
(registrou no `CLAUDE.md` o que quebrou na CI); 16:00 "Build por pacote" (rodou os testes só do
que mudou); 18:30 "Feche o dia com o changelog" (rascunho pronto para revisar). Eyebrows "No
trabalho" e, no último, "No fim do dia".

- `Default`.
- `Automatico`: `autoPlay={4000}`.
- `Controlado`: botões externos que trocam o `value`.
- `Estreito`: contêiner de 360 px (régua deslizante).
- `Escuro`: wrapper com a classe `dark`.
