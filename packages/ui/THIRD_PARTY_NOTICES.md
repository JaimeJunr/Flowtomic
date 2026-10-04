# Avisos de terceiros

Partes do Flowtomic foram inspiradas ou adaptadas de projetos de código aberto. A licença
de cada um vem abaixo, como ela própria exige.

## shadcn-ui/chatbot-template

- Origem: https://github.com/shadcn-ui/chatbot-template (commit `55c9330`)
- O que veio de lá: a API e o comportamento dos componentes de chat (`Bubble`,
  `ToolStatusLine`, `Questionnaire`, o block `chatbot` e os que vierem depois). Foram reescritos sobre Radix e
  os tokens do Flowtomic, sem `@base-ui/react` nem `@shadcn/react`.
- Arquivos: `src/components/molecules/data-display/bubble/`,
  `src/components/molecules/data-display/tool-status-line/`,
  `src/components/organisms/questionnaire/`, `src/blocks/chatbot/`

```text
MIT License

Copyright (c) 2026 shadcn

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
