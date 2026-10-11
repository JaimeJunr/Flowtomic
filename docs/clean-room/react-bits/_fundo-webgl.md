# Contrato comum dos fundos WebGL (onda 5)

Vale para todo fundo da onda 5. A referência viva é o `atoms/background/aurora-glow` (piloto
aprovado em 11/10/2026): copie a estrutura dele, não a matemática.

1. **Pasta e nome.** `packages/ui/src/components/atoms/background/<nome>/`, com `<nome>-shader.ts`
   (GLSL ES 3.00 como string, `#version 300 es`, `out vec4 fragColor`), `<nome>-utils.ts`, testes,
   story `Flowtomic UI/Atoms/Background/<Nome>` em `layout: "fullscreen"`, e `index.ts`.
2. **Estrutura.** Raiz `relative isolate overflow-hidden` com `data-slot`, `data-webgl="on|off"`;
   `<canvas>` `absolute inset-0 size-full` `aria-hidden` (via `useWebglCanvas` de `@/lib/webgl`);
   fallback CSS `absolute inset-0` `aria-hidden` visível só sem WebGL; `children` em `relative z-10`.
3. **Cores só por token.** Props de cor recebem nomes de variável CSS (`"--primary"`), lidos com
   `readThemeColor(token, raiz)` ao montar e quando o tema muda (`MutationObserver` em
   `document.documentElement`: `class`, `style`, `data-theme`). Token sem valor cai em
   `--foreground`. Token que não começa com `--` lança erro com o valor recebido.
4. **Uniforms.** `uTime` e `uResolution` vêm do renderer. O resto vai pela função `uniforms`, que
   lê as props de um ref (o objeto de opções do `useWebglCanvas` é memorizado; mudar prop não
   recria o programa). `speed` vira `uSpeed`; `speed === 0` passa `paused: true`.
5. **Saída pré-multiplicada** (`fragColor = vec4(cor * a, a)`), para o fundo compor sobre a página
   nos dois temas.
6. **Dither** de meio degrau de 8 bits no alfa ou na cor de todo gradiente longo (o piloto mostrou
   faixas sem isso).
7. **Movimento reduzido.** O renderer já desenha um quadro estático; não contornar.
8. **Ponteiro (quando a spec pedir).** Só mouse/caneta; posição normalizada 0–1 num `uPointer`
   suavizada no JS (`lerp` por quadro dentro do `uniforms`, sem `useSpring`), e desligada em
   movimento reduzido.
9. **Testes mínimos.** Utils puros; shader textual (versão, uniforms declarados, `fragColor`);
   no jsdom: `data-webgl="off"`, fallback com os `var(--…)`, canvas `aria-hidden`, `children`,
   `ref`, `className`, token inválido lança.
10. **Story.** Hero real em português (título, uma frase, um botão sólido), `min-h-[480px]`,
    mais variações das props principais e `ReducedMotion`.
