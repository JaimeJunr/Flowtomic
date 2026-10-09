# Spec de comportamento: `dictation-button`

> **Proveniência (clean room).** Escrita em 09/10/2026 a partir da demo pública "Voice Pill" em
> `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.

## O que a pessoa vê

Um botão redondo de microfone. Pressionar **abre** o botão numa cápsula que cresce para a
esquerda: aparece um relógio ("0:03") e uma **forma de onda** rolando com o nível do som; o
microfone vira um quadradinho de parar. Toque rápido trava gravando até tocar de novo; segurar
grava só enquanto segura. Segurando, **deslizar para a esquerda** arrasta o conteúdo e revela
"Cancelar"; passar da distância espalha as barras e cancela sem resultado.

## API (`atoms/actions/dictation-button`)

```ts
type DictationStopReason = "release" | "tap" | "key" | "escape" | "blur" | "cancel" | "disabled" | "mic-denied" | "unmount";
type DictationButtonProps = Omit<React.ComponentProps<"button">, "onClick"> & {
  size?: "sm" | "default" | "lg";        // 28 / 36 / 44 px
  shape?: "pill" | "rounded";            // default "pill"
  showTime?: boolean;                    // default true
  waveform?: boolean;                    // default true
  slideToCancel?: boolean;               // default true
  cancelDistance?: number;               // default 64
  /** auto: toque trava, segurar para ao soltar. hold: soltar sempre para. toggle: soltar nunca para. */
  mode?: "auto" | "hold" | "toggle";     // default "auto"
  holdAfterMs?: number;                  // default 300
  /** Fonte do nível: simulado (demo) ou o microfone de verdade. */
  source?: "simulated" | "mic";          // default "simulated"
  /** Injetável para teste e para quem já tem um stream. */
  levelSource?: () => { read: () => number; stop: () => void } | Promise<{ read: () => number; stop: () => void }>;
  onStart?: (detail: { source: "simulated" | "mic" }) => void;
  onStop?: (detail: { reason: DictationStopReason; durationMs: number }) => void;
  "aria-label"?: string;                 // default "Ditar"
};
```

## Regras

1. `<button aria-pressed={ouvindo}>`; Enter/Espaço alterna (`reason: "key"`); Escape para
   (`"escape"`); perder foco com o ponteiro solto para (`"blur"`).
2. **Fonte de nível** (interface fina do projeto, `createLevelSource(kind)` em utils):
   - simulado: ruído suave determinístico por seno;
   - mic: `navigator.mediaDevices.getUserMedia({ audio: true })` + `AudioContext` +
     `AnalyserNode`, RMS do buffer; recusa → para com `"mic-denied"`; `stop()` fecha as trilhas e
     o contexto.
   `levelSource` substitui as duas (testes usam uma fake nomeada).
3. **Envelope:** subida rápida (40 ms) e descida lenta (240 ms) — função pura
   `envelope(prev, input, dtMs, attackMs, releaseMs)`.
4. **Forma de onda:** histórico de N barras (cabem na cápsula), rolando para a esquerda a cada
   ~60 ms; altura mínima 10%. Barras `bg-primary`. Relógio `font-mono tabular-nums` "m:ss"
   (função pura `formatClock(ms)`).
5. **Modo auto:** solto antes de `holdAfterMs` → trava (`"tap"` ao tocar de novo); depois →
   para ao soltar (`"release"`). Função pura `releaseDecision(mode, pressMs, holdAfterMs, latched)`.
6. **Deslizar para cancelar:** segurando, `dx < 0` arrasta o conteúdo; aparece "Cancelar"
   (`text-muted-foreground`); `|dx| ≥ cancelDistance` → barras se espalham (fade + y aleatório
   determinístico) e para com `"cancel"`.
7. **Cores (só tokens):** botão `bg-secondary text-muted-foreground`, gravando `bg-secondary`
   com quadrado `bg-primary`, hover `bg-accent`. Escala 0,95 pressionado.
8. **Disabled:** para se estiver ouvindo (`"disabled"`) e ignora.
9. Desmontar ouvindo → `"unmount"` e fecha a fonte.

## Movimento reduzido

Cápsula abre sem mola; forma de onda vira uma barra de nível única estática atualizada; sem
espalhar no cancelamento.

## Marcação

Raiz `data-slot="dictation-button"`, `data-state="idle"|"listening"`. Partes:
`dictation-button-wave`, `dictation-button-clock`, `dictation-button-cancel`.

## Testes mínimos

- Puras: `envelope` (sobe rápido, desce devagar), `formatClock` (0 → "0:00", 63_000 → "1:03"),
  `releaseDecision` para os 3 modos.
- Fake `levelSource` nomeada (`FakeLevelSource`): clique (toque) começa (`onStart`,
  `aria-pressed=true`), clique de novo para com `"tap"` e a duração.
- Segurar além de `holdAfterMs` e soltar → `"release"`. `mode="toggle"` nunca para ao soltar.
- Escape para com `"escape"`. Fonte recusando (rejeita) → `"mic-denied"`.
- Arrasto à esquerda além de `cancelDistance` → `"cancel"`. Desmontar ouvindo → `"unmount"` e
  `stop()` da fonte chamado. Disabled. `ref`/`className`.
