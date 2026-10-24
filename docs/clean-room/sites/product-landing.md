# ProductLanding — spec do block

Prova de uso das peças do estudo de sites (`README.md` desta pasta, candidato 13): uma página de
produto inteira montada **só com componentes que já existem no Flowtomic**. Não há site observado
aqui; os padrões vêm da seção *Padrões transversais* do `README.md` (mostrar em vez de descrever,
mono como voz técnica, uma ideia por seção, lista com régua em vez de card, destaque por moldura).

O produto da página é o próprio Flowtomic. Assim o texto é verdadeiro e não precisa de marca,
pessoa ou número inventado.

## O que não entra

- Depoimentos (`testimonial-wall`) e preços (`pricing-table`): o Flowtomic é gratuito e não tem
  depoimento real. Citação com nome fictício e plano de preço de mentira são os tells que o
  `CLAUDE.md` barra.
- URL do registry (`registry.flowtomic.dev`): o domínio não resolve. Instalação só por
  `flowtomic-cli` e npm.
- Eyebrow em caixa alta, emoji, glifo de seta ou `⌘`, subtítulo que repete o título, dois botões
  sólidos competindo. Um botão sólido por tela.

## Seções, em ordem

1. **`announcement-bar`** com uma novidade concreta: "Novas peças de página: tabela de comparação,
   FAQ e linha do tempo", com link para a documentação.
2. **`site-header`**: marca "Flowtomic", links Componentes, Documentação, GitHub
   (`https://github.com/JaimeJunr/Flowtomic`); ação sólida "Começar".
3. **Hero** (composição local do block, sem componente novo): título em duas linhas,
   `text-display-md` subindo para `text-display-xl` em contêiner largo, `font-semibold`,
   `text-balance`: "Componentes que você copia, edita e entende". Uma frase em `muted-foreground`,
   até 56ch. Um botão sólido "Começar" e um link discreto "Ver no GitHub". Abaixo, **`metric-strip`
   `variant="inline"`** com `accent` e `separator="dot"`: atoms, molecules e organisms. Leia as
   contagens de `docs/componentes/README.md` na hora de escrever; não invente número.
4. **Instalação, com `code-tabs`**: título "Instale do jeito que preferir"; abas `flowtomic-cli`
   (`bunx flowtomic-cli add button`) e npm (`npm install @flowtomic/ui`, mais o import dos estilos
   na ordem `globals.css`, `theme.css`, `typography.css`). Uma frase curta ao lado: o CLI copia o
   arquivo para o projeto e ajusta os imports.
5. **Troca de dependências, com `env-diff`**: a composição `EmFaixa` da story do `env-diff`
   (título à esquerda, diff no meio, parágrafo à direita, 1 coluna abaixo de 768 px). Título "Três
   bibliotecas viram uma".
6. **Comparação, com `comparison-table`**: "Flowtomic", "Escrever do zero" e "Biblioteca fechada".
   Linhas: código no seu repositório, edita sem fork, acessível por padrão (Radix/Base UI), tema
   por tokens, atualização automática. Seja honesto: o Flowtomic **não** atualiza sozinho o código
   já copiado; marque como não. Coluna do Flowtomic destacada.
7. **Um dia de trabalho, com `day-timeline`**: os mesmos momentos da story do `day-timeline`,
   reaproveitados como dado. Título "O que muda no seu dia".
8. **Números, com `metric-strip` `variant="columns"`** e `dividers`: testes do `ui`, cobertura de
   linhas e arquivos de teste, lidos da seção *Testes* do `CLAUDE.md` da raiz.
9. **O que está chegando, com `status-list`**: 3 ou 4 itens reais da fila de candidatos do
   `README.md` (por exemplo `feature-tabs`, `process-steps`, `docs-toc`), com estados como
   "Planejado" e "Em estudo".
10. **`faq-section`**: 4 a 6 perguntas reais ("Preciso do shadcn?", "Funciona com React 18?" — não:
    React 19 é obrigatório a partir da 1.0, "Como atualizo um componente já copiado?", "Posso usar
    só os hooks?"), com a caixa de contato apontando para as issues do GitHub.
11. **`site-footer`**: colunas Produto, Documentação e Projeto, com links reais do repositório.

## Composição

- Block em `packages/ui/src/blocks/product-landing/`, seguindo a estrutura de
  `blocks/developer-panel` (`page.tsx`, `page.stories.tsx`, `page.test.tsx`) e o registro dos
  outros blocks (`blocks/index.ts`, `registry-blocks.*`, `cli/src/utils/component-map.ts` ou onde
  o `add-block` leia).
- O conteúdo fica num objeto exportado (`productLandingContent`), separado do JSX, para quem
  copiar o block trocar o texto num lugar só. A página recebe `content?` com esse padrão.
- Largura de leitura `max-w-6xl mx-auto px-4 @min-[768px]:px-8`; seções separadas por
  `py-16 @min-[1024px]:py-24`, sem card envolvendo seção. `@container` na raiz.
- Importe cada organism pelo caminho direto (`@/components/organisms/faq-section`), nunca pelo
  barrel de organisms (puxa `katex.min.css` e quebra o Vitest).
- Uma seção pode ser escura no meio da página clara (a de números, por exemplo) com a classe
  `dark` no próprio elemento, nunca `bg-foreground text-background`.

## Teste

1. Renderiza um `h1` e um `h2` por seção que tem título, na ordem acima.
2. Os landmarks existem: `banner` (header), `main`, `contentinfo` (footer).
3. `content` customizado troca o título do hero.
4. Não há link para `registry.flowtomic.dev` em lugar nenhum da página.
5. Há exatamente um botão ou link sólido de ação no hero.

## Story

`Flowtomic UI/Blocks/ProductLanding`, `layout: "fullscreen"`. `Default`, `Estreito` (contêiner de
390 px) e `Escuro` (wrapper com a classe `dark`).
