# Spec de comportamento: `aurora-glow` (piloto da onda 5)

> **Proveniência (clean room).** Escrita em 11/10/2026 a partir da demo pública "Aurora" em
> `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**. A
> versão deles usava ogl; esta usa só a infra própria `src/lib/webgl` (WebGL2 cru) e
> `readThemeColor`.

## O que a pessoa vê

Um fundo que ocupa o contêiner. Do **alto** desce uma **faixa de luz ondulante**, como uma aurora:
a borda de baixo da faixa sobe e desce devagar em ondas largas e suaves, a cor muda **da esquerda
para a direita** passando por três tons, e a luz **esmaece para transparente** em direção ao meio da
área. O conteúdo por cima (título, botões) fica legível sobre a parte de baixo, que é o fundo da
página. Sem WebGL, aparece um gradiente estático parecido, feito em CSS.

## Por que existe (uso no produto)

Fundo de hero de landing, de tela de login ou de página de boas-vindas.

## API (`atoms/background/aurora-glow`)

```ts
type AuroraGlowProps = React.ComponentProps<"div"> & {
  /** Três tokens de cor (nomes de variável CSS), da esquerda para a direita. */
  colors?: [string, string, string]; // default ["--primary", "--success", "--primary"]
  speed?: number;      // multiplica o tempo; default 1; 0 congela
  amplitude?: number;  // altura das ondas; default 1 (0 = borda reta)
  blend?: number;      // suavidade da borda de baixo, 0–1; default 0.5
  intensity?: number;  // opacidade máxima da luz, 0–1; default 0.8
  children?: React.ReactNode; // conteúdo por cima do fundo
};
```

Só tokens: `colors` aceita nomes de variável CSS (`"--primary"`), nunca hex. Erro com o valor
recebido se algum não começar com `--` (o `readThemeColor` já lança).

## Regras

1. **Estrutura.** Raiz `relative isolate overflow-hidden`; `<canvas>` `absolute inset-0 size-full`
   `aria-hidden` em `z-0` (via `useWebglCanvas` de `@/lib/webgl`); `children` num `div`
   `relative z-10`. O fallback CSS (rule 6) fica sob o canvas e só aparece quando
   `isSupported` é false.
2. **Uniforms.** `uTime` e `uResolution` já vêm do renderer. O componente envia por `uniforms`:
   `uColors` (vec3[3], RGB 0–1), `uAmplitude`, `uBlend`, `uIntensity`, e o tempo escalado por
   `speed` (o shader usa `uTime * uSpeed`, com `uSpeed` uniform).
3. **Shader (GLSL ES 3.00, string em `aurora-glow-shader.ts`).**
   - `uv = gl_FragCoord.xy / uResolution` (y = 0 embaixo).
   - Cor base: rampa de três paradas em `uv.x` (0 → c0, 0,5 → c1, 1 → c2), interpolação linear.
   - Altura da borda: `h = 0.55 + uAmplitude · 0.18 · n(uv.x · 2.0, t)`, onde `n` é ruído suave
     (simplex 2D ou soma de 2–3 senos com fases diferentes; resultado em [-1, 1]) e
     `t = uTime · uSpeed · 0.1`.
   - Intensidade vertical: `a = smoothstep(h − uBlend · 0.5, h + 0.2, uv.y)` — zero abaixo da
     borda, cheia perto do topo.
   - Saída **pré-multiplicada** (o contexto é criado com alpha padrão):
     `fragColor = vec4(color · a · uIntensity, a · uIntensity)`.
4. **Cores do tema.** Ler com `readThemeColor(token, raiz)` ao montar e quando o tema mudar:
   `MutationObserver` em `document.documentElement` (atributos `class`, `style`,
   `data-theme`). Token sem valor (retorno `null`) cai em `--foreground`. Puro
   `toColorUniform(colors: (RgbColor | null)[], fallback: RgbColor): Float32Array` (9 números).
5. **Opções estáveis.** O objeto passado a `useWebglCanvas` precisa ser memorizado
   (`useMemo`); `uniforms` lê props de um ref para não recriar o renderer a cada render.
6. **Fallback (sem WebGL e no jsdom).** Um `div` `absolute inset-0` com
   `background: linear-gradient(to right, var(c0), var(c1), var(c2))` mascarado de cima para
   baixo (`mask-image: linear-gradient(to bottom, black, transparent 60%)`), opacidade
   `intensity`. Feito com `var(--token)` no `style`, sem cor literal.
7. **Pausa.** O renderer já pausa fora da tela. `speed === 0` passa `paused: true`.

## Movimento reduzido

O renderer desenha um quadro estático (`t = 0`) e não anima. Nada a fazer no componente além de não
contornar isso.

## Acessibilidade

Canvas e fallback `aria-hidden`; a raiz não tem papel próprio. O contraste do conteúdo é
responsabilidade de quem usa — a story mostra texto sobre a parte de baixo, que é o fundo da página.

## Marcação

Raiz `data-slot="aurora-glow"`; `data-slot="aurora-glow-canvas"`, `aurora-glow-fallback`,
`aurora-glow-content`; `data-webgl="on|off"` na raiz.

## Testes mínimos

- `toColorUniform`: ordem e valores; `null` usa o fallback.
- O shader é uma string GLSL 3.00 com `#version 300 es`, declara os uniforms da regra 2 e escreve
  `fragColor` (teste textual, o jsdom não compila).
- No jsdom (sem WebGL): `data-webgl="off"`, fallback visível com os três `var(--…)`, canvas presente
  e `aria-hidden`, `children` renderizados.
- Token inválido (`"primary"`) lança erro com o valor recebido.
- `ref` chega na raiz; `className` mesclado.
