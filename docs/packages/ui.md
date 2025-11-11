# flowtomic/ui

Componentes UI reutilizáveis baseados em Radix UI e Tailwind CSS.

## Instalação

```bash
bunx flowtomic add button
```

## Estilos

O Flowtomic fornece um **estilo padrão** que funciona imediatamente, mas permite **customização total** dos componentes conforme sua preferência.

### Estilo Padrão

Para usar os componentes com o estilo padrão, importe os arquivos CSS na ordem correta no seu arquivo principal (ex: `src/index.css` ou `src/main.tsx`):

```css
/* 1. globals.css - DEVE vir primeiro para inicializar Tailwind v4 */
@import "flowtomic/ui/styles/globals.css";

/* 2. theme.css - Define variáveis do tema usando @theme (Tailwind v4) */
@import "flowtomic/ui/styles/theme.css";

/* 3. typography.css - Estilos de tipografia que dependem das variáveis */
@import "flowtomic/ui/styles/typography.css";
```

**Requisitos**: Este projeto usa Tailwind CSS v4.1.14 com `@tailwindcss/postcss`. Certifique-se de ter essas dependências instaladas:

```json
{
  "dependencies": {
    "@tailwindcss/postcss": "^4.1.14",
    "tailwindcss": "^4.1.14"
  }
}
```

**Nota**: Se você estiver usando o CLI do Flowtomic (`bunx flowtomic init`), os estilos serão configurados automaticamente.

### Customização de Estilos

O Flowtomic permite customização de estilos de **duas formas**:

#### 1. Customização via `className` (Recomendado para ajustes pontuais)

Todos os componentes aceitam a prop `className` para customização direta:

```tsx
import { Button } from "flowtomic/ui";

function App() {
  return (
    <Button
      variant="default"
      className="bg-blue-600 hover:bg-blue-700 rounded-full px-8"
    >
      Botão Customizado
    </Button>
  );
}
```

#### 2. Customização via Variáveis CSS (Recomendado para temas globais)

Você pode sobrescrever as variáveis CSS do tema para personalizar todos os componentes de uma vez:

```css
/* No seu arquivo CSS (após importar os estilos do Flowtomic) */
:root {
  /* Customizar cores primárias */
  --primary: 220 90% 56%;
  --primary-foreground: 210 40% 98%;
  --primary-hover: 220 90% 50%;

  /* Customizar raio de borda */
  --radius: 1rem;

  /* Customizar cores de sucesso */
  --success: 142 76% 36%;
  --success-foreground: 210 40% 98%;
  --success-hover: 142 76% 30%;
}

.dark {
  /* Customizar tema escuro */
  --primary: 220 90% 66%;
  --primary-foreground: 222.2 84% 4.9%;
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
}
```

**Exemplo completo de customização**:

```css
/* src/index.css */
@import "tailwindcss";

/* Importar estilos padrão do Flowtomic */
@import "flowtomic/ui/styles/globals.css";
@import "flowtomic/ui/styles/theme.css";
@import "flowtomic/ui/styles/typography.css";

/* Suas customizações */
:root {
  /* Tema personalizado */
  --primary: 262 83% 58%; /* Roxo */
  --radius: 0.5rem; /* Bordas mais arredondadas */
}

.dark {
  --primary: 262 83% 68%;
}
```

#### 3. Combinando Ambos

Você pode combinar customização global (variáveis CSS) com customização pontual (`className`):

```tsx
import { Button } from "flowtomic/ui";

function App() {
  return (
    <>
      {/* Usa o tema customizado via variáveis CSS */}
      <Button variant="default">Botão Padrão</Button>

      {/* Customização pontual via className */}
      <Button variant="default" className="shadow-lg transform hover:scale-105">
        Botão com Efeito Especial
      </Button>
    </>
  );
}
```

### Variáveis CSS Disponíveis

As principais variáveis CSS que você pode customizar:

- **Cores**: `--primary`, `--secondary`, `--accent`, `--success`, `--warning`, `--error`, `--destructive`
- **Background**: `--background`, `--foreground`, `--card`, `--muted`
- **Bordas**: `--border`, `--input`, `--ring`
- **Raio**: `--radius` (afeta todos os componentes)
- **Design System**: `--ds-button-radius`, `--ds-input-radius`, `--ds-card-radius`

Para ver todas as variáveis disponíveis, consulte `packages/styles/globals.css`.

## Uso

### Uso Básico (Estilo Padrão)

```tsx
import { Button } from "flowtomic/ui";

function App() {
  return (
    <Button variant="default" size="default">
      Click me
    </Button>
  );
}
```

### Uso com Customização

```tsx
import { Button } from "flowtomic/ui";

function App() {
  return (
    <>
      {/* Estilo padrão */}
      <Button variant="default">Padrão</Button>

      {/* Customização via className */}
      <Button
        variant="default"
        className="bg-linear-to-r from-purple-500 to-pink-500"
      >
        Customizado
      </Button>
    </>
  );
}
```

## Componentes Disponíveis

- Button
- Card
- Input
- Badge
- Alert
- Dialog
- ... (em desenvolvimento)
