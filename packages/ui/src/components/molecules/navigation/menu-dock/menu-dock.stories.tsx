import type { Meta, StoryObj } from "@storybook/react-vite";
import { Briefcase, Calendar, Home, Lock, Settings } from "lucide-react";
import { useState } from "react";
import { MenuDock } from "./menu-dock";

const meta = {
  title: "Flowtomic UI/Molecules/Navigation/MenuDock",
  component: MenuDock,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `Componente de dock de menu com animações suaves e suporte a múltiplos itens. Ideal para navegação principal ou secundária em aplicações.

## Características

- **Duas animações disponíveis**: 
  - \`default\`: Indicador underline animado que segue o item ativo
  - \`floating\`: Estilo macOS com ícones que aumentam ao aproximar o mouse
- **Variantes de tamanho**: \`default\`, \`compact\`, \`large\`
- **Orientação flexível**: Horizontal ou vertical
- **Labels opcionais**: Pode exibir ou ocultar labels dos itens
- **Responsivo**: Suporta classes customizadas para desktop e mobile
- **Modo controlado e não controlado**: Gerencia estado interno ou externo
- **Acessibilidade**: Suporte completo a navegação por teclado

## Quando usar

- Navegação principal de aplicações
- Menu lateral ou superior
- Dock flutuante estilo macOS
- Navegação secundária em dashboards
- Menu de contexto com múltiplas ações

## Estrutura de itens

Cada item do menu deve seguir a interface \`MenuDockItem\`:

\`\`\`typescript
interface MenuDockItem {
  id?: string;           // ID único (opcional)
  label: string;         // Texto exibido no item
  icon: IconComponent;  // Componente de ícone (ex: lucide-react)
  onClick?: () => void; // Callback ao clicar
  path?: string;        // Rota interna (opcional)
  href?: string;        // Link externo (opcional)
}
\`\`\`

## Tipos de animação

- **default**: Indicador animado que segue o item ativo, ideal para navegação tradicional
- **floating**: Efeito magnético estilo macOS, ideal para docks flutuantes e interfaces modernas`,
      },
    },
    controls: {
      sort: "requiredFirst",
      expanded: true,
    },
  },
  tags: ["autodocs"],
  argTypes: {
    items: {
      control: false,
      description:
        "Array de itens do menu. Cada item deve ter `label`, `icon` e opcionalmente `onClick`, `path` ou `href`.",
      table: {
        type: { summary: "MenuDockItem[]" },
        category: "Dados",
      },
    },
    variant: {
      control: "select",
      options: ["default", "compact", "large"],
      description:
        "Tamanho visual do dock. `default` é o tamanho padrão, `compact` reduz espaçamento e `large` aumenta o tamanho dos ícones.",
      table: {
        type: { summary: '"default" | "compact" | "large"' },
        defaultValue: { summary: '"default"' },
        category: "Aparência",
      },
    },
    orientation: {
      control: "select",
      options: ["horizontal", "vertical"],
      description:
        "Direção do layout do menu. `horizontal` para menu superior/inferior, `vertical` para menu lateral.",
      table: {
        type: { summary: '"horizontal" | "vertical"' },
        defaultValue: { summary: '"horizontal"' },
        category: "Layout",
      },
    },
    showLabels: {
      control: "boolean",
      description:
        "Exibe ou oculta os labels dos itens. Útil para criar menus mais compactos ou estilo dock.",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
        category: "Aparência",
      },
    },
    animated: {
      control: "boolean",
      description:
        "Habilita ou desabilita animações. Quando `false`, remove todas as animações, útil para melhorar performance ou acessibilidade.",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
        category: "Comportamento",
      },
    },
    animationType: {
      control: "select",
      options: ["default", "floating"],
      description:
        "Tipo de animação: `default` (underline animado que segue o item ativo) ou `floating` (estilo macOS com ícones que aumentam ao aproximar o mouse).",
      table: {
        type: { summary: '"default" | "floating"' },
        defaultValue: { summary: '"default"' },
        category: "Comportamento",
      },
    },
    defaultActiveIndex: {
      control: { type: "number", min: 0 },
      description:
        "Índice do item ativo por padrão (modo não controlado). Use quando não precisa controlar o estado externamente.",
      table: {
        type: { summary: "number" },
        defaultValue: { summary: "0" },
        category: "Estado",
      },
    },
    activeIndex: {
      control: { type: "number", min: 0 },
      description:
        "Índice controlado do item ativo. Use com `onActiveIndexChange` para modo controlado.",
      table: {
        type: { summary: "number" },
        category: "Estado",
      },
    },
    onActiveIndexChange: {
      action: "activeIndexChanged",
      description:
        "Callback chamado quando o item ativo muda. Recebe o novo índice como parâmetro.",
      table: {
        type: { summary: "(index: number) => void" },
        category: "Eventos",
      },
    },
    className: {
      control: "text",
      description: "Classes CSS adicionais para o container principal do dock.",
      table: {
        type: { summary: "string" },
        category: "Estilização",
      },
    },
    desktopClassName: {
      control: "text",
      description:
        "Classes CSS aplicadas apenas em dispositivos desktop. Útil para posicionamento fixo ou estilos específicos.",
      table: {
        type: { summary: "string" },
        category: "Estilização",
      },
    },
    mobileClassName: {
      control: "text",
      description:
        "Classes CSS aplicadas apenas em dispositivos mobile. Útil para posicionamento fixo ou estilos específicos.",
      table: {
        type: { summary: "string" },
        category: "Estilização",
      },
    },
  },
} satisfies Meta<typeof MenuDock>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultItems = [
  { label: "Início", icon: Home },
  { label: "Trabalho", icon: Briefcase },
  { label: "Calendário", icon: Calendar },
  { label: "Segurança", icon: Lock },
  { label: "Configurações", icon: Settings },
];

export const Default: Story = {
  render: () => {
    const [activeIndex, setActiveIndex] = useState(0);
    return (
      <MenuDock
        items={defaultItems}
        activeIndex={activeIndex}
        onActiveIndexChange={setActiveIndex}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Uso básico do MenuDock com modo controlado. Este exemplo mostra a configuração padrão com labels visíveis, animação ativada e orientação horizontal. O estado é gerenciado externamente usando `useState`.",
      },
    },
  },
};

export const Compact: Story = {
  render: () => {
    const [activeIndex, setActiveIndex] = useState(0);
    return (
      <MenuDock
        items={defaultItems}
        variant="compact"
        activeIndex={activeIndex}
        onActiveIndexChange={setActiveIndex}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Variante compacta com espaçamento reduzido. Ideal para interfaces com espaço limitado ou quando você quer um menu mais discreto. Os ícones e labels são menores que a variante padrão.",
      },
    },
  },
};

export const Large: Story = {
  render: () => {
    const [activeIndex, setActiveIndex] = useState(0);
    return (
      <MenuDock
        items={defaultItems}
        variant="large"
        activeIndex={activeIndex}
        onActiveIndexChange={setActiveIndex}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Variante grande com ícones e espaçamento aumentados. Ideal para interfaces que precisam de destaque visual ou quando o menu é o elemento principal de navegação.",
      },
    },
  },
};

export const WithoutLabels: Story = {
  render: () => {
    const [activeIndex, setActiveIndex] = useState(0);
    return (
      <MenuDock
        items={defaultItems}
        showLabels={false}
        activeIndex={activeIndex}
        onActiveIndexChange={setActiveIndex}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Menu sem labels, exibindo apenas ícones. Ideal para criar um dock estilo macOS ou quando o espaço é limitado. Os ícones devem ser suficientemente reconhecíveis para que os usuários entendam sua função.",
      },
    },
  },
};

export const Vertical: Story = {
  render: () => {
    const [activeIndex, setActiveIndex] = useState(0);
    return (
      <MenuDock
        items={defaultItems}
        orientation="vertical"
        activeIndex={activeIndex}
        onActiveIndexChange={setActiveIndex}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Menu com orientação vertical. Ideal para sidebars, menus laterais ou quando você quer economizar espaço horizontal. O indicador animado se adapta automaticamente à nova orientação.",
      },
    },
  },
};

export const NotAnimated: Story = {
  render: () => {
    const [activeIndex, setActiveIndex] = useState(0);
    return (
      <MenuDock
        items={defaultItems}
        animated={false}
        activeIndex={activeIndex}
        onActiveIndexChange={setActiveIndex}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Menu com animações desabilitadas. Útil para melhorar performance em dispositivos de baixo poder, reduzir distrações ou quando as animações não são desejadas. O componente ainda mantém toda a funcionalidade, apenas sem as transições animadas.",
      },
    },
  },
};

export const FloatingDesktop: Story = {
  render: () => {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <MenuDock
          items={defaultItems.map((item) => ({
            ...item,
            href: `#${item.label.toLowerCase()}`,
          }))}
          animationType="floating"
          desktopClassName="fixed bottom-8 left-1/2 -translate-x-1/2"
        />
      </div>
    );
  },
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        story: `Floating Dock estilo macOS para desktop usando animação \`floating\`.

**Características:**
- Ícones aumentam quando o mouse se aproxima (efeito magnético)
- Posicionamento fixo na parte inferior central da tela
- Ideal para aplicações desktop ou web apps fullscreen
- Usa \`desktopClassName\` para posicionamento customizado

**Quando usar:**
- Aplicações que querem um dock flutuante moderno
- Interfaces que precisam de navegação sempre acessível
- Dashboards ou aplicações de produtividade

**Nota:** Os itens devem ter \`href\` ou \`onClick\` definidos para funcionar corretamente.`,
      },
    },
  },
};

export const FloatingMobile: Story = {
  render: () => {
    return (
      <div className="relative h-32 border rounded-lg p-4">
        <MenuDock
          items={defaultItems.map((item) => ({
            ...item,
            href: `#${item.label.toLowerCase()}`,
          }))}
          animationType="floating"
          mobileClassName="fixed bottom-4 right-4"
        />
      </div>
    );
  },
  parameters: {
    layout: "centered",
    docs: {
      description: {
        story: `Floating Dock estilo macOS para mobile usando animação \`floating\`.

**Características:**
- Menu expansível com botão toggle em mobile
- Posicionamento fixo customizado para mobile
- Animações suaves de expansão/colapso
- Usa \`mobileClassName\` para posicionamento customizado

**Comportamento em mobile:**
- Em telas pequenas, o menu pode colapsar em um botão
- Ao tocar, expande mostrando todos os itens
- Ideal para interfaces mobile-first

**Quando usar:**
- Aplicações mobile que precisam de navegação rápida
- Interfaces que querem economizar espaço na tela
- Apps que precisam de acesso rápido a ações principais

**Nota:** Os itens devem ter \`href\` ou \`onClick\` definidos para funcionar corretamente.`,
      },
    },
  },
};
