# flowtomic/ui

Componentes UI reutilizáveis baseados em Radix UI e Tailwind CSS.

## 📋 Sumário

- [Instalação](#instalação)
- [Estilos](#estilos)
  - [Estilo Padrão](#estilo-padrão)
  - [Customização de Estilos](#customização-de-estilos)
  - [Variáveis CSS Disponíveis](#variáveis-css-disponíveis)
- [Uso](#uso)
- [Componentes Disponíveis](#componentes-disponíveis)
- [Padrões de Documentação (Storybook)](#padrões-de-documentação-storybook)
  - [Organização de Arquivos](#organização-de-arquivos)
  - [Estrutura Padrão de Stories](#estrutura-padrão-de-stories)
  - [ArgTypes (Documentação de Props)](#2-argtypes-documentação-de-props)
  - [Stories Obrigatórias](#3-stories-obrigatórias)
  - [Stories Avançadas](#4-stories-avançadas-quando-aplicável)
  - [Boas Práticas](#5-boas-práticas)
  - [Exemplo Completo](#exemplo-completo)
  - [Padrões Especiais](#padrões-especiais)
  - [Checklist de Qualidade](#checklist-de-qualidade-para-componentes)
- [Desenvolvimento e Manutenção](#desenvolvimento-e-manutenção)
  - [Criando um Novo Componente](#criando-um-novo-componente)
  - [Atualizando um Componente Existente](#atualizando-um-componente-existente)
  - [Boas Práticas de Código](#boas-práticas-de-código)
  - [Manutenção e Evolução](#manutenção-e-evolução)
- [Troubleshooting](#troubleshooting)
- [Referência Rápida](#-referência-rápida)
  - [Categorias de Componentes](#categorias-de-componentes)
  - [Categorias de ArgTypes](#categorias-de-argtypes)
  - [Stories Obrigatórias](#stories-obrigatórias-1)
  - [Comandos Úteis](#comandos-úteis)
  - [Templates Rápidos](#templates-rápidos)
  - [Links Importantes](#links-importantes)

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

## Padrões de Documentação (Storybook)

### Organização de Arquivos

Cada componente deve seguir esta estrutura:

```
component/
├── component.tsx          # Implementação do componente
├── component.stories.tsx  # Documentação Storybook
├── component.test.tsx     # Testes unitários (quando aplicável)
└── index.ts              # Exports públicos
```

**Nomenclatura**:

- **PascalCase** para componentes: `Button.tsx`, `TabsList.tsx`
- **kebab-case** para pastas: `button/`, `tabs/`, `dropdown-menu/`
- **Stories**: `component.stories.tsx` (mesmo nome do componente)
- **Tests**: `component.test.tsx` (mesmo nome do componente)

**Exports**:

```tsx
// index.ts - Exports públicos
export type { ButtonProps, ButtonVariant } from "./button";
export { Button, buttonVariants } from "./button";
```

### Estrutura Padrão de Stories

Todos os componentes do Flowtomic UI seguem um padrão consistente de documentação no Storybook. Este padrão garante experiência uniforme, acessibilidade e facilidade de manutenção.

#### 1. Meta Configuration (Configuração Base)

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Component } from "./component";

const meta = {
  title: "Flowtomic UI/[Categoria]/[Subcategoria]/[Nome]",
  component: Component,
  parameters: {
    layout: "centered", // ou "padded", "fullscreen"
    docs: {
      description: {
        component: `Descrição detalhada do componente.

## Características

- Lista de características principais
- Funcionalidades importantes
- Benefícios para o usuário

## Quando usar

- Casos de uso específicos
- Situações recomendadas
- Contextos de aplicação

## Estrutura do componente (quando aplicável)

Descrição das partes que compõem o componente.`,
      },
    },
    controls: {
      sort: "requiredFirst", // Props obrigatórias primeiro
      expanded: true, // Expandir controles por padrão
    },
  },
  tags: ["autodocs"], // Gera documentação automática
  argTypes: {
    // Configuração detalhada de cada prop
  },
} satisfies Meta<typeof Component>;

export default meta;
type Story = StoryObj<typeof meta>;
```

**Categorias padronizadas**:

- `Flowtomic UI/Atoms/Actions` - Botões, badges, etc.
- `Flowtomic UI/Atoms/Navigation` - Tabs, breadcrumb, etc.
- `Flowtomic UI/Atoms/Forms` - Input, select, etc.
- `Flowtomic UI/Molecules/...` - Componentes compostos
- `Flowtomic UI/Organisms/...` - Componentes complexos

#### 2. ArgTypes (Documentação de Props)

Cada prop deve ter documentação completa com categorização:

```tsx
argTypes: {
  variant: {
    control: "select",
    options: ["default", "destructive", "outline", "secondary"],
    description: "Variante visual (semântica) que define o estilo do componente.",
    table: {
      type: { summary: "'default' | 'destructive' | 'outline' | 'secondary'" },
      category: "Estilo", // Categorias: Estilo, Layout, Estado, Conteúdo, Eventos, Comportamento
      defaultValue: { summary: "default" },
    },
  },
  size: {
    control: "select",
    options: ["sm", "md", "lg"],
    description: "Tamanho do componente (altura, padding, fonte).",
    table: {
      type: { summary: "'sm' | 'md' | 'lg'" },
      category: "Layout",
      defaultValue: { summary: "md" },
    },
  },
  disabled: {
    control: "boolean",
    description: "Estado desabilitado sem interação ou foco.",
    table: {
      type: { summary: "boolean" },
      category: "Estado",
      defaultValue: { summary: "false" },
    },
  },
  children: {
    description: "Conteúdo interno (texto e/ou ícones).",
    table: {
      type: { summary: "React.ReactNode" },
      category: "Conteúdo",
    },
  },
  onClick: {
    action: "clicked", // Registra no painel Actions
    description: "Callback de clique (usado em teste de interação).",
    table: {
      type: { summary: "(event) => void" },
      category: "Eventos",
    },
  },
  onValueChange: {
    action: "valueChanged", // Registra mudanças de valor
    description: "Callback chamado quando o valor muda.",
    table: {
      type: { summary: "(value: string) => void" },
      category: "Eventos",
    },
  },
},
```

**Categorias padronizadas**:

- **Estilo**: `variant`, `color`, `theme`
- **Layout**: `size`, `width`, `height`, `spacing`
- **Estado**: `disabled`, `loading`, `active`, `open`
- **Conteúdo**: `children`, `title`, `description`, `label`
- **Eventos**: `onClick`, `onValueChange`, `onSubmit`
- **Comportamento**: `animated`, `autoFocus`, `dismissible`

#### 3. Stories Obrigatórias

Cada componente deve ter, no mínimo:

##### a. Story Interativa (Interactive)

```tsx
export const Interactive: Story = {
  args: {
    // Props padrão configuráveis
    variant: "default",
    size: "md",
  },
  render: (args) => <Component {...args}>Conteúdo</Component>,
  parameters: {
    docs: {
      description: {
        story:
          "Story interativa que permite testar o componente usando os controls do Storybook. Altere as props para ver o comportamento em tempo real.",
      },
    },
  },
};
```

##### b. Story Default (Caso Básico)

```tsx
export const Default: Story = {
  render: () => <Component>Exemplo básico</Component>,
  parameters: {
    docs: {
      description: {
        story:
          "Uso básico do componente. Este é o exemplo mais simples e mostra a estrutura mínima necessária.",
      },
    },
  },
};
```

##### c. Stories de Variantes

```tsx
export const Destructive: Story = {
  args: { variant: "destructive", children: "Destrutivo" },
};

export const Secondary: Story = {
  args: { variant: "secondary", children: "Secundário" },
};

export const Small: Story = {
  args: { size: "sm", children: "Pequeno" },
};

export const Large: Story = {
  args: { size: "lg", children: "Grande" },
};
```

##### d. Story de Uso Contextual

```tsx
export const UsageInStatCard: Story = {
  args: { children: "" },
  render: () => (
    <div className="flex flex-col gap-4">
      {/* Exemplo de uso real do componente */}
      <Component variant="success">Exemplo de uso prático</Component>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Uso contextual mostrando como o componente é utilizado em situações reais, como dentro de cards, formulários, etc.",
      },
    },
  },
};
```

##### e. Story de Acessibilidade

```tsx
import { fn, expect, userEvent, within } from "storybook/test";

export const Accessibility: Story = {
  args: { children: "Acessível" },
  parameters: {
    docs: {
      description: {
        story:
          "Demonstra foco via teclado e acionamento por Enter/Espaço para validar acessibilidade básica do componente.",
      },
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const element = await canvas.getByRole("button", { name: /Acessível/i });

    // Testa foco via teclado
    await userEvent.tab();
    expect(element).toHaveFocus();

    // Testa acionamento por Enter
    await userEvent.keyboard("{Enter}");

    // Valida callback foi chamado
    if (typeof args.onClick === "function") {
      expect(args.onClick.mock.calls.length).toBeGreaterThan(0);
    }
  },
};
```

##### f. Story de Estado Desconhecido (quando aplicável)

```tsx
export const NoKnownUsage: Story = {
  render: () => (
    <div className="p-4 text-sm text-muted-foreground">
      Este componente ainda não possui uso conhecido em componentes mais
      complexos.
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Este componente ainda não possui uso conhecido em molecules ou organisms.",
      },
    },
  },
};
```

#### 4. Stories Avançadas (quando aplicável)

##### a. Estado Controlado vs Não Controlado

```tsx
export const Controlled: Story = {
  args: { className: "w-[600px]" },
  render: (args) => {
    const [value, setValue] = useState("default");
    return (
      <Component {...args} value={value} onValueChange={setValue}>
        {/* Conteúdo */}
      </Component>
    );
  },
  parameters: {
    docs: {
      description: {
        story: `Exemplo de uso controlado com estado externo usando React hooks.

**Quando usar modo controlado:**
- Quando você precisa sincronizar com estado externo
- Quando precisa executar ações quando o valor muda
- Quando o valor é determinado por lógica externa (ex: URL, localStorage)

**Como funciona:**
1. O estado é gerenciado externamente com \`useState\`
2. O componente recebe \`value\` e \`onValueChange\`
3. Cada mudança atualiza o estado externo
4. O callback é registrado na aba de Actions do Storybook para debug`,
      },
    },
  },
};
```

##### b. Conteúdo Rico

```tsx
export const WithRichContent: Story = {
  render: () => (
    <Component>
      {/* Exemplos com conteúdo complexo */}
      <div className="space-y-4">
        <h3>Título</h3>
        <p>Parágrafo com muito conteúdo...</p>
        {/* Cards, formulários, etc. */}
      </div>
    </Component>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Demonstra o uso com conteúdo rico e complexo, incluindo cards, formulários e outros componentes.",
      },
    },
  },
};
```

##### c. Estados Especiais

```tsx
export const Disabled: Story = {
  args: { disabled: true, children: "Desabilitado" },
  parameters: {
    docs: {
      description: {
        story: `Demonstra o estado desabilitado do componente.

**Quando desabilitar:**
- Quando a ação não está disponível
- Quando o usuário não tem permissão
- Durante estados de loading
- Para indicar funcionalidades em desenvolvimento

**Comportamento:**
- Não pode ser clicado ou focado
- Aparência visual diferente (opacidade reduzida)
- Atributos ARIA apropriados para leitores de tela`,
      },
    },
  },
};
```

#### 5. Boas Práticas

##### Nomenclatura de Stories

- **PascalCase**: `Default`, `Interactive`, `WithIcon`
- **Descritiva**: Nome deve indicar o que a story demonstra
- **Consistente**: Mesmo nome para mesmas funcionalidades entre componentes

##### Descrições

- **Concisas**: 1-3 parágrafos para story description
- **Estruturadas**: Use Markdown para formatação (listas, negrito, código)
- **Práticas**: Inclua "Quando usar", "Como funciona", "Dica"

##### Controls

- **Categorize**: Use `category` para agrupar props relacionadas
- **Documente**: Toda prop deve ter `description` clara
- **Type Summary**: Use `type.summary` para mostrar tipos TypeScript

##### Actions

- **Registre eventos**: Use `action: "eventName"` para callbacks
- **Teste em play**: Valide callbacks em stories de acessibilidade

##### Variantes e Combinações

- **Story para cada variante**: Crie story separada para cada `variant`, `size`, etc.
- **Nomeie claramente**: `Destructive`, `Small`, `Large`, `Outline`
- **Combine quando faz sentido**: `SmallDestructive`, `LargeOutline` (quando a combinação é comum)
- **Use render para demos complexas**: Quando precisar mostrar múltiplas variantes juntas

**Exemplo de múltiplas variantes**:

```tsx
// Stories individuais para cada variante
export const Default: Story = { args: { children: "Padrão" } };
export const Destructive: Story = {
  args: { variant: "destructive", children: "Destrutivo" },
};
export const Outline: Story = {
  args: { variant: "outline", children: "Contorno" },
};
export const Success: Story = {
  args: { variant: "success", children: "Sucesso" },
};

// Story demonstrando todas as variantes juntas
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Button variant="default">Padrão</Button>
      <Button variant="destructive">Destrutivo</Button>
      <Button variant="outline">Contorno</Button>
      <Button variant="success">Sucesso</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Demonstra todas as variantes disponíveis do componente.",
      },
    },
  },
};
```

##### Documentação de Props Complexas

Props que aceitam objetos ou configurações complexas devem ter exemplos claros:

```tsx
argTypes: {
  config: {
    control: "object",
    description: "Configuração complexa do componente.",
    table: {
      type: {
        summary: "{ theme: string, animations: boolean, customStyles?: object }",
      },
      category: "Configuração",
    },
  },
},

// Story demonstrando uso
export const WithComplexConfig: Story = {
  args: {
    config: {
      theme: "dark",
      animations: true,
      customStyles: {
        backgroundColor: "var(--primary)",
        borderRadius: "var(--radius)",
      },
    },
  },
  parameters: {
    docs: {
      description: {
        story: `Demonstra uso de configuração complexa.

**Opções disponíveis:**
- \`theme\`: Define tema visual (\`light\` | \`dark\`)
- \`animations\`: Ativa/desativa animações
- \`customStyles\`: Objeto CSS para customização avançada`,
      },
    },
  },
};
```

### Exemplo Completo

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn, expect, userEvent, within } from "storybook/test";
import { Button } from "./button";

const meta = {
  title: "Flowtomic UI/Atoms/Actions/Button",
  component: Button,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Componente Button para acionar ações. Suporta múltiplas variantes e tamanhos.",
      },
    },
    controls: {
      sort: "requiredFirst",
      expanded: true,
    },
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "destructive", "outline"],
      description: "Variante semântica de estilo.",
      table: {
        type: { summary: "'default' | 'destructive' | 'outline'" },
        category: "Estilo",
        defaultValue: { summary: "default" },
      },
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Tamanho do botão.",
      table: {
        type: { summary: "'sm' | 'md' | 'lg'" },
        category: "Layout",
        defaultValue: { summary: "md" },
      },
    },
    onClick: {
      action: "clicked",
      description: "Callback de clique.",
      table: {
        type: { summary: "(event) => void" },
        category: "Eventos",
      },
    },
  },
  args: { onClick: fn() },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Interactive: Story = {
  args: { children: "Botão" },
};

export const Default: Story = {
  args: { children: "Botão" },
};

export const Destructive: Story = {
  args: { variant: "destructive", children: "Destrutivo" },
};

export const Small: Story = {
  args: { size: "sm", children: "Pequeno" },
};

export const Accessibility: Story = {
  args: { children: "Acessível" },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const btn = await canvas.getByRole("button");
    await userEvent.tab();
    expect(btn).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    expect(args.onClick.mock.calls.length).toBeGreaterThan(0);
  },
};
```

### Padrões Especiais

#### Componentes Controlados vs Não Controlados

Componentes que gerenciam estado interno (como Tabs, Select, Dialog) devem suportar ambos os modos:

**Modo Não Controlado (Uncontrolled)**:

```tsx
// O componente gerencia seu próprio estado internamente
<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Aba 1</TabsTrigger>
    <TabsTrigger value="tab2">Aba 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Conteúdo 1</TabsContent>
  <TabsContent value="tab2">Conteúdo 2</TabsContent>
</Tabs>
```

**Modo Controlado (Controlled)**:

```tsx
// Você gerencia o estado externamente
const [activeTab, setActiveTab] = useState("tab1");

<Tabs value={activeTab} onValueChange={setActiveTab}>
  <TabsList>
    <TabsTrigger value="tab1">Aba 1</TabsTrigger>
    <TabsTrigger value="tab2">Aba 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Conteúdo 1</TabsContent>
  <TabsContent value="tab2">Conteúdo 2</TabsContent>
</Tabs>;
```

**Props obrigatórias para suportar ambos os modos**:

- `defaultValue`: Para modo não controlado (estado inicial)
- `value`: Para modo controlado (estado externo)
- `onValueChange`: Callback para sincronizar estado externo

**Documentação obrigatória**:

```tsx
argTypes: {
  defaultValue: {
    control: "text",
    description:
      "Valor inicial para modo não controlado. Use quando o estado interno é suficiente.",
    table: {
      type: { summary: "string" },
      category: "Estado",
      defaultValue: { summary: "undefined" },
    },
  },
  value: {
    control: "text",
    description:
      "Valor controlado. Use com `onValueChange` para modo controlado. Quando fornecido, você é responsável por gerenciar o estado.",
    table: {
      type: { summary: "string" },
      category: "Estado",
      defaultValue: { summary: "undefined" },
    },
  },
  onValueChange: {
    action: "valueChanged",
    description:
      "Callback chamado quando o valor muda. Use para sincronizar estado externo ou executar ações.",
    table: {
      type: { summary: "(value: string) => void" },
      category: "Eventos",
    },
  },
},
```

**Story obrigatória demonstrando modo controlado**:

```tsx
export const Controlled: Story = {
  render: (args) => {
    const [value, setValue] = useState("default");
    return (
      <Component {...args} value={value} onValueChange={setValue}>
        {/* Conteúdo */}
      </Component>
    );
  },
  parameters: {
    docs: {
      description: {
        story: `Exemplo de uso controlado com estado externo.

**Quando usar modo controlado:**
- Sincronizar com estado externo (Redux, Context, URL)
- Executar ações quando o valor muda (salvar, validar)
- Valor determinado por lógica externa

**Quando usar modo não controlado:**
- Estado interno é suficiente
- Componente isolado sem necessidade de sincronização
- Simplicidade e menos código`,
      },
    },
  },
};
```

#### Componentes Compostos

Componentes que seguem o padrão de composição (como Tabs, Card, Dialog) devem:

**Estrutura clara na documentação**:

```tsx
component: `Descrição do componente.

## Estrutura do componente

O componente é composto por partes principais:

- \`Tabs\`: Container raiz que gerencia o estado
- \`TabsList\`: Container para os botões de abas
- \`TabsTrigger\`: Botão individual de cada aba
- \`TabsContent\`: Conteúdo renderizado para cada aba

Cada parte tem responsabilidade específica e pode ser customizada independentemente.`,
```

**Exemplo de uso na story Default**:

```tsx
export const Default: Story = {
  render: () => (
    <Tabs defaultValue="tab1">
      <TabsList>
        <TabsTrigger value="tab1">Aba 1</TabsTrigger>
        <TabsTrigger value="tab2">Aba 2</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">Conteúdo 1</TabsContent>
      <TabsContent value="tab2">Conteúdo 2</TabsContent>
    </Tabs>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Uso básico mostrando a estrutura mínima necessária com todas as partes do componente composto.",
      },
    },
  },
};
```

#### Animações e Motion

Componentes com animações devem documentar:

**Características de animação**:

```tsx
component: `Componente com animações naturais.

## Características

- **Indicador animado**: Indicador visual que segue suavemente a transição
- **Transições suaves**: Animações de entrada/saída para conteúdo
- **Animações reduzidas**: Respeita preferências de movimento reduzido do usuário (\`prefers-reduced-motion\`)

As animações são implementadas com CSS transitions/animations e respeitam as preferências de acessibilidade do sistema.`,
```

**Props de controle de animação**:

```tsx
argTypes: {
  animated: {
    control: "boolean",
    description:
      "Ativa animações sutis de hover/focus. Sempre respeita prefers-reduced-motion.",
    table: {
      type: { summary: "boolean" },
      category: "Comportamento",
      defaultValue: { summary: "false" },
    },
  },
},
```

**Story demonstrando animação**:

```tsx
export const Animated: Story = {
  args: { animated: true, children: "Animado" },
  parameters: {
    docs: {
      description: {
        story:
          "Demonstra o componente com animações ativas. As animações respeitam a preferência do usuário por movimento reduzido.",
      },
    },
  },
};
```

#### Acessibilidade (ARIA e Teclado)

**Documentação de acessibilidade**:

```tsx
component: `Componente acessível.

## Características

- **Acessibilidade**: Suporte completo a navegação por teclado e leitores de tela
- **ARIA**: Atributos ARIA apropriados para comunicar estado e função
- **Foco visível**: Indicadores claros de foco para navegação por teclado

**Navegação por teclado:**
- \`Tab\`: Move foco para próximo elemento
- \`Enter/Space\`: Ativa elemento focado
- \`Escape\`: Fecha diálogos/modals
- \`Arrow keys\`: Navega entre opções (quando aplicável)`,
```

**Story obrigatória de acessibilidade**:

```tsx
import { fn, expect, userEvent, within } from "storybook/test";

export const Accessibility: Story = {
  args: { children: "Acessível", onClick: fn() },
  parameters: {
    docs: {
      description: {
        story: `Demonstra acessibilidade via teclado e leitores de tela.

**Testes implementados:**
- Foco via Tab
- Acionamento via Enter/Space
- Callbacks são chamados corretamente
- Estado é atualizado conforme esperado`,
      },
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const element = await canvas.getByRole("button", { name: /Acessível/i });

    // Testa foco via Tab
    await userEvent.tab();
    expect(element).toHaveFocus();

    // Testa acionamento via Enter
    await userEvent.keyboard("{Enter}");
    expect(args.onClick.mock.calls.length).toBeGreaterThan(0);
  },
};
```

#### Estados Especiais (Loading, Error, Empty)

Componentes que exibem dados devem ter stories para estados especiais:

```tsx
export const Loading: Story = {
  args: { isLoading: true },
  parameters: {
    docs: {
      description: {
        story:
          "Estado de carregamento com skeleton ou spinner. Comunica ao usuário que dados estão sendo buscados.",
      },
    },
  },
};

export const Error: Story = {
  args: { error: "Erro ao carregar dados" },
  parameters: {
    docs: {
      description: {
        story:
          "Estado de erro com mensagem clara. Permite retry quando aplicável.",
      },
    },
  },
};

export const Empty: Story = {
  args: { data: [] },
  render: () => (
    <Component>
      <div className="p-8 text-center text-muted-foreground">
        Nenhum dado disponível
      </div>
    </Component>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Estado vazio quando não há dados. Deve guiar o usuário para próxima ação (ex: criar primeiro item).",
      },
    },
  },
};
```

### Checklist de Qualidade para Componentes

Use este checklist ao criar ou revisar componentes do Flowtomic UI:

#### ✅ Estrutura e Organização

- [ ] Pasta com nome em `kebab-case` (`button/`, `tabs/`)
- [ ] Arquivo principal: `component.tsx`
- [ ] Arquivo de stories: `component.stories.tsx`
- [ ] Arquivo de exports: `index.ts`
- [ ] Testes (quando aplicável): `component.test.tsx`

#### ✅ Documentação (Storybook)

**Meta Configuration**:

- [ ] Título segue padrão: `Flowtomic UI/[Categoria]/[Subcategoria]/[Nome]`
- [ ] `parameters.layout` definido (`centered`, `padded`, `fullscreen`)
- [ ] `parameters.docs.description.component` com descrição completa
- [ ] Seções: Características, Quando usar, Estrutura (quando aplicável)
- [ ] `tags: ["autodocs"]` para documentação automática
- [ ] `controls.sort: "requiredFirst"` e `controls.expanded: true`

**ArgTypes**:

- [ ] Todas as props documentadas com `description`
- [ ] `control` apropriado para cada tipo (`select`, `boolean`, `text`, `object`)
- [ ] `table.type.summary` com tipo TypeScript
- [ ] `table.category` definida (Estilo, Layout, Estado, Conteúdo, Eventos, Comportamento)
- [ ] `table.defaultValue.summary` quando aplicável
- [ ] Callbacks com `action: "eventName"` para registro

**Stories Obrigatórias**:

- [ ] `Interactive` - Com `args` configuráveis e `render(args)`
- [ ] `Default` - Exemplo básico mais simples
- [ ] Stories para cada `variant` (Destructive, Secondary, Outline, etc.)
- [ ] Stories para cada `size` (Small, Large, etc.)
- [ ] `Accessibility` - Com `play` function testando teclado/foco
- [ ] `UsageInStatCard` ou contexto de uso real (quando aplicável)
- [ ] `NoKnownUsage` - Quando componente ainda não é usado em composições

**Stories Condicionais**:

- [ ] `Controlled` - Para componentes com estado interno
- [ ] `WithRichContent` - Para componentes que aceitam conteúdo complexo
- [ ] `Disabled` - Para componentes com estado desabilitado
- [ ] `Loading`, `Error`, `Empty` - Para componentes que exibem dados
- [ ] `Animated` - Para componentes com animações opcionais
- [ ] `AllVariants` - Demonstração de todas as variantes juntas

**Descrições de Stories**:

- [ ] Cada story tem `parameters.docs.description.story`
- [ ] Descrições explicam o que a story demonstra
- [ ] Uso de Markdown para formatação (listas, negrito, código)
- [ ] Inclui "Quando usar", "Como funciona", "Dica" quando relevante

#### ✅ Implementação

**Props e Types**:

- [ ] Interface/type exportada: `export interface ComponentProps`
- [ ] Extends `React.ComponentProps` apropriado
- [ ] Props opcionais com valores padrão documentados
- [ ] Suporte a `className` para customização
- [ ] Suporte a spread props (`{...props}`)

**Componentes Controlados** (quando aplicável):

- [ ] Suporta modo não controlado com `defaultValue`
- [ ] Suporta modo controlado com `value` e `onValueChange`
- [ ] Story `Controlled` demonstrando uso com `useState`
- [ ] Documentação explicando diferença entre os modos

**Componentes Compostos** (quando aplicável):

- [ ] Estrutura clara com múltiplas partes nomeadas
- [ ] Cada parte exportada individualmente
- [ ] Documentação explica responsabilidade de cada parte
- [ ] Story `Default` mostra estrutura mínima completa

**Acessibilidade**:

- [ ] Atributos ARIA apropriados
- [ ] Navegação por teclado funcional
- [ ] Foco visível em todos os elementos interativos
- [ ] `role` correto para elementos semânticos
- [ ] Story `Accessibility` com testes via `play` function
- [ ] Suporte a leitores de tela

**Animações** (quando aplicável):

- [ ] Respeita `prefers-reduced-motion`
- [ ] Prop `animated` para controlar animações (quando opcional)
- [ ] Documentação das características de animação
- [ ] Story `Animated` demonstrando animações

**Estilização**:

- [ ] Usa variantes CVA (class-variance-authority)
- [ ] Suporta Tailwind CSS para customização
- [ ] Usa tokens do design system (`var(--primary)`, `var(--radius)`)
- [ ] Função `cn()` para merge de classes
- [ ] Export de `componentVariants` quando há variantes

#### ✅ Testes

- [ ] Testes unitários para lógica complexa
- [ ] Testes de acessibilidade em story `Accessibility`
- [ ] Testes de interação com `userEvent`
- [ ] Validação de callbacks com `expect()`

#### ✅ Exports

**index.ts**:

- [ ] Exporta todos os tipos: `export type { ComponentProps }`
- [ ] Exporta componente: `export { Component }`
- [ ] Exporta variantes: `export { componentVariants }` (quando aplicável)
- [ ] Exporta partes de componentes compostos (quando aplicável)

**Navegação de Categorias** (src/components/atoms/[categoria]/index.ts):

- [ ] Componente adicionado aos exports da categoria
- [ ] Tipos adicionados aos exports da categoria

### Exemplo de Implementação Completa

Veja os componentes existentes como referência:

- **Button** (`button.stories.tsx`) - Exemplo completo com todas as práticas
- **Tabs** (`tabs.stories.tsx`) - Componente composto, controlado/não controlado
- **Badge** (`badge.stories.tsx`) - Exemplo simples e direto
- **ContextMenu** (`context-menu.stories.tsx`) - Acessibilidade com testes

## Desenvolvimento e Manutenção

### Criando um Novo Componente

#### 1. Planejamento

Antes de criar o componente:

- [ ] Defina o propósito e casos de uso
- [ ] Identifique a categoria (Atoms, Molecules, Organisms)
- [ ] Liste as variantes necessárias (variant, size, state)
- [ ] Determine se é controlado, composto ou simples
- [ ] Verifique componentes similares para consistência

#### 2. Estrutura Inicial

```bash
# Crie a pasta do componente
mkdir -p packages/ui/src/components/atoms/[categoria]/[nome-componente]

# Crie os arquivos base
touch packages/ui/src/components/atoms/[categoria]/[nome-componente]/component.tsx
touch packages/ui/src/components/atoms/[categoria]/[nome-componente]/component.stories.tsx
touch packages/ui/src/components/atoms/[categoria]/[nome-componente]/index.ts
```

#### 3. Implementação

**component.tsx** - Template inicial:

```tsx
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

const componentVariants = cva(
  "base-classes", // Classes base sempre aplicadas
  {
    variants: {
      variant: {
        default: "variant-specific-classes",
        destructive: "variant-specific-classes",
      },
      size: {
        sm: "size-specific-classes",
        md: "size-specific-classes",
        lg: "size-specific-classes",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface ComponentProps
  extends React.ComponentProps<"div">, // ou "button", "input", etc.
    VariantProps<typeof componentVariants> {
  // Props adicionais específicas do componente
}

function Component({ variant, size, className, ...props }: ComponentProps) {
  return (
    <div
      className={cn(componentVariants({ variant, size }), className)}
      {...props}
    />
  );
}

Component.displayName = "Component";

export { Component, componentVariants };
```

**component.stories.tsx** - Template inicial:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { Component } from "./component";

const meta = {
  title: "Flowtomic UI/Atoms/[Categoria]/Component",
  component: Component,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "Descrição do componente...",
      },
    },
    controls: {
      sort: "requiredFirst",
      expanded: true,
    },
  },
  tags: ["autodocs"],
  argTypes: {
    // Documente todas as props aqui
  },
  args: {
    // Args padrão e mocks de callbacks
  },
} satisfies Meta<typeof Component>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Interactive: Story = {
  args: { children: "Interactive" },
};

export const Default: Story = {
  render: () => <Component>Default</Component>,
};

// Adicione mais stories conforme necessário
```

**index.ts** - Exports:

```tsx
export type { ComponentProps } from "./component";
export { Component, componentVariants } from "./component";
```

#### 4. Integração

Adicione o componente aos exports da categoria:

```tsx
// packages/ui/src/components/atoms/[categoria]/index.ts
export type { ComponentProps } from "./component";
export { Component, componentVariants } from "./component";
```

#### 5. Testes e Validação

- [ ] Execute Storybook e valide renderização
- [ ] Teste todas as variantes
- [ ] Teste acessibilidade (teclado, foco, ARIA)
- [ ] Valide responsividade
- [ ] Teste modo controlado/não controlado (quando aplicável)
- [ ] Execute linter e correções

```bash
# Executar Storybook
cd packages/ui
bun run storybook

# Executar linter
bun run lint
```

### Atualizando um Componente Existente

#### 1. Avaliação

- [ ] Identifique o que precisa mudar (nova variante, bug, melhoria)
- [ ] Verifique impacto em componentes que usam este componente
- [ ] Liste todas as stories que precisam ser atualizadas

#### 2. Mudanças

- [ ] Atualize implementação em `component.tsx`
- [ ] Adicione/atualize variantes em CVA
- [ ] Atualize tipos e interfaces
- [ ] Adicione/atualize stories conforme necessário
- [ ] Atualize documentação em `argTypes`

#### 3. Validação

- [ ] Todas as stories antigas ainda funcionam
- [ ] Novas stories demonstram as mudanças
- [ ] Acessibilidade mantida ou melhorada
- [ ] Sem regressões visuais
- [ ] Documentação atualizada

### Boas Práticas de Código

#### Nomenclatura

```tsx
// ✅ BOM
export interface ButtonProps extends React.ComponentProps<"button"> {}
function Button({ variant, size, ...props }: ButtonProps) {}
const buttonVariants = cva(...)

// ❌ RUIM
export interface IButtonProps {} // Não use prefixo I
function btn() {} // Use nome completo
const styles = cva(...) // Seja específico
```

#### Composição de Classes

```tsx
// ✅ BOM - Use cn() para merge de classes
<div className={cn(buttonVariants({ variant, size }), className)} />

// ❌ RUIM - Concatenação simples
<div className={`${baseClass} ${variant} ${className}`} />
```

#### Props Spreading

```tsx
// ✅ BOM - Spread no final para permitir override
<button
  type="button"
  disabled={disabled}
  className={cn(buttonVariants({ variant }), className)}
  {...props}
/>

// ❌ RUIM - Spread antes, não permite override
<button {...props} type="button" disabled={disabled} />
```

#### Display Name

```tsx
// ✅ BOM - Sempre defina displayName
function Button() {}
Button.displayName = "Button";

// ❌ RUIM - Sem displayName
function Button() {}
```

#### Variantes Semânticas

```tsx
// ✅ BOM - Nomes semânticos
variant: {
  default: "...",
  destructive: "...",
  success: "...",
}

// ❌ RUIM - Nomes genéricos ou baseados em cores
variant: {
  blue: "...",
  red: "...",
  green: "...",
}
```

#### Tokens do Design System

```tsx
// ✅ BOM - Use tokens CSS
className: "bg-primary text-primary-foreground hover:bg-primary-hover";

// ❌ RUIM - Cores hardcoded
className: "bg-blue-600 text-white hover:bg-blue-700";
```

### Manutenção e Evolução

#### Versionamento Semântico

- **MAJOR** (1.0.0 → 2.0.0): Breaking changes (mudança de API, remoção de props)
- **MINOR** (1.0.0 → 1.1.0): Novas features (novas variantes, novos componentes)
- **PATCH** (1.0.0 → 1.0.1): Bug fixes, melhorias de documentação

#### Changelog

Mantenha um changelog atualizado:

```markdown
## [1.1.0] - 2025-01-15

### Added

- Button: Nova variante `success`
- Tabs: Suporte a ícones em TabsTrigger

### Changed

- Badge: Melhor contraste em tema escuro
- Input: Padding ajustado para consistência

### Fixed

- Dialog: Correção de foco ao fechar
- Select: Corrigido bug de scroll
```

#### Deprecation

Quando remover/alterar algo:

```tsx
/**
 * @deprecated Use `variant="destructive"` instead. Will be removed in v2.0.0
 */
danger?: boolean;
```

## Troubleshooting

- Invalid hook call: normalmente é causado por múltiplas cópias do React no app consumidor. Verifique:
  - Tenha apenas uma versão de `react` e `react-dom` instalada:
    ```bash
    npm ls react react-dom || pnpm ls react react-dom || yarn why react react-dom
    ```
  - No Vite, dedupe os pacotes para garantir uma única instância:
    ```ts
    // vite.config.ts
    export default defineConfig({
      resolve: { dedupe: ["react", "react-dom"] },
    });
    ```
  - Se estiver usando `npm link`/`pnpm link`/repo local, force alias para a cópia do app:
    ```ts
    // vite.config.ts
    import path from "node:path";
    export default defineConfig({
      resolve: {
        alias: {
          react: path.resolve("./node_modules/react"),
          "react-dom": path.resolve("./node_modules/react-dom"),
        },
      },
    });
    ```
  - Atualize para a última versão do `@flowtomic/ui`. A partir da 0.1.4 o build não empacota `react`/`react-dom` (externals), evitando cópias duplicadas.

## 📚 Referência Rápida

### Categorias de Componentes

| Categoria      | Localização                     | Exemplos                                 |
| -------------- | ------------------------------- | ---------------------------------------- |
| **Actions**    | `Flowtomic UI/Atoms/Actions`    | Button, Badge, DropdownMenu, ContextMenu |
| **Navigation** | `Flowtomic UI/Atoms/Navigation` | Tabs, Breadcrumb, Command, Menubar       |
| **Forms**      | `Flowtomic UI/Atoms/Forms`      | Input, Select, Checkbox, RadioGroup      |
| **Feedback**   | `Flowtomic UI/Atoms/Feedback`   | Alert, Toast, Progress, Skeleton         |
| **Layout**     | `Flowtomic UI/Atoms/Layout`     | Card, Separator, ScrollArea, AspectRatio |
| **Molecules**  | `Flowtomic UI/Molecules`        | ButtonGroup, DataTable, FormField        |
| **Organisms**  | `Flowtomic UI/Organisms`        | DashboardLayout, StatsGrid, ScriptEditor |
| **Blocks**     | `Flowtomic UI/Blocks`           | Dashboard01, FlowtomicDashboard          |

### Categorias de ArgTypes

| Categoria         | Tipos de Props          | Exemplos                                    |
| ----------------- | ----------------------- | ------------------------------------------- |
| **Estilo**        | Aparência visual        | `variant`, `color`, `theme`                 |
| **Layout**        | Dimensões e espaçamento | `size`, `width`, `height`, `spacing`        |
| **Estado**        | Estados do componente   | `disabled`, `loading`, `active`, `open`     |
| **Conteúdo**      | Dados exibidos          | `children`, `title`, `description`, `label` |
| **Eventos**       | Callbacks               | `onClick`, `onValueChange`, `onSubmit`      |
| **Comportamento** | Funcionalidades         | `animated`, `autoFocus`, `dismissible`      |

### Stories Obrigatórias

| Story               | Quando Usar              | Descrição                                                   |
| ------------------- | ------------------------ | ----------------------------------------------------------- |
| **Interactive**     | Sempre                   | Story com controls do Storybook para testar props           |
| **Default**         | Sempre                   | Exemplo básico mais simples                                 |
| **Variantes**       | Sempre                   | Uma story para cada variante (Destructive, Secondary, etc.) |
| **Tamanhos**        | Sempre                   | Uma story para cada tamanho (Small, Large, etc.)            |
| **Accessibility**   | Sempre                   | Testes de acessibilidade com play function                  |
| **UsageInContext**  | Quando aplicável         | Uso real do componente em contexto                          |
| **Controlled**      | Componentes com estado   | Demonstração de modo controlado                             |
| **WithRichContent** | Aceita conteúdo complexo | Demonstração com conteúdo rico                              |
| **Disabled**        | Tem estado desabilitado  | Demonstração do estado desabilitado                         |
| **NoKnownUsage**    | Sem uso conhecido        | Indicação de que componente não é usado ainda               |

### Comandos Úteis

```bash
# Desenvolvimento
cd packages/ui
bun run dev           # Inicia Storybook em modo desenvolvimento
bun run build        # Build de produção
bun run lint         # Executa linter
bun run format       # Formata código com Biome

# Testes
bun run test         # Executa testes unitários
bun run test:watch   # Executa testes em modo watch

# Storybook
bun run storybook    # Inicia Storybook
bun run build-storybook  # Build do Storybook para produção
```

### Templates Rápidos

#### Novo Componente Simples

```tsx
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

const componentVariants = cva("base-classes", {
  variants: {
    variant: { default: "classes", destructive: "classes" },
    size: { sm: "classes", md: "classes", lg: "classes" },
  },
  defaultVariants: { variant: "default", size: "md" },
});

export interface ComponentProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof componentVariants> {}

function Component({ variant, size, className, ...props }: ComponentProps) {
  return (
    <div
      className={cn(componentVariants({ variant, size }), className)}
      {...props}
    />
  );
}

Component.displayName = "Component";

export { Component, componentVariants };
```

#### Nova Story com Teste de Acessibilidade

```tsx
import { fn, expect, userEvent, within } from "storybook/test";

export const Accessibility: Story = {
  args: { children: "Acessível", onClick: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const element = await canvas.getByRole("button");
    await userEvent.tab();
    expect(element).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    expect(args.onClick.mock.calls.length).toBeGreaterThan(0);
  },
};
```

### Links Importantes

- **Radix UI**: https://www.radix-ui.com/
- **Tailwind CSS**: https://tailwindcss.com/
- **Storybook**: https://storybook.js.org/
- **CVA**: https://cva.style/docs
- **Testing Library**: https://testing-library.com/

---

**Última atualização**: 2025-11-30  
**Versão**: 1.0.0
