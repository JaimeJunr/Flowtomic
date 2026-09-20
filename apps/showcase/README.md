# Flowtomic Showcase

App de apresentação do design system Flowtomic. Roda com tema escuro e abas para **Componentes**, **Hooks** e **Blocks**.

## Desenvolvimento

Na raiz do monorepo:

```bash
bun run dev
```

Isso faz o build de `@flowtomic/ui` e `@flowtomic/logic` (se necessário) e sobe o Vite em [http://localhost:5173](http://localhost:5173).

Para subir só o showcase (sem rebuild dos packages):

```bash
bun run dev:showcase
```

Requer que os packages já tenham sido buildados (`bun run build:ui`).

## Estrutura

- **Hero**: título e CTAs (GitHub, Ver Componentes).
- **Componentes**: preview ao vivo de atoms (Button, Badge, Input, Checkbox, Progress, etc.) e lista de atoms/molecules/organisms.
- **Hooks**: cards com os hooks do `@flowtomic/logic`.
- **Blocks**: os 3 blocks (dashboard-01, flowtomic-dashboard, developer-panel) com descrição e link para o código.

Estilos vêm de `packages/styles` (globals.css, theme.css, typography.css). O tema escuro é aplicado via classe `dark` no `document.documentElement`.
