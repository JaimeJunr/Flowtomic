/**
 * # Badge Component Stories
 *
 * Stories do componente Badge demonstrando todas as variantes, tamanhos e casos de uso.
 *
 * ## Variantes Disponíveis
 *
 * - **default**: Variante primária com cor de tema
 * - **secondary**: Variante secundária com cor neutra
 * - **destructive**: Variante para ações destrutivas ou erros
 * - **outline**: Variante com borda e fundo transparente
 * - **success**: Variante para sucesso ou confirmação (verde)
 * - **warning**: Variante para avisos (amarelo)
 * - **info**: Variante para informações (azul)
 *
 * ## Tamanhos
 *
 * - **sm**: Tamanho pequeno
 * - **md**: Tamanho médio (padrão)
 * - **lg**: Tamanho grande
 *
 * @see [Badge Component](./badge.tsx) para documentação completa do componente
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { expect, within } from "storybook/test";
import { Badge } from "./badge";

const meta = {
  title: "Flowtomic UI/Atoms/Actions/Badge",
  component: Badge,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Badge destaca informações concisas como status e métricas. Variantes: default, secondary, destructive, outline, success, warning, info. Tamanhos: sm, md, lg. Use para rotulagem não interativa ou suporte visual a outros componentes (ex: StatCard).",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary", "destructive", "outline", "success", "warning", "info"],
      description: "Variante visual (semântica) que define cores da Badge.",
      table: {
        type: {
          summary:
            "'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info'",
        },
        category: "Estilo",
        defaultValue: { summary: "default" },
      },
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Tamanho da Badge (altura, padding, fonte).",
      table: {
        type: { summary: "'sm' | 'md' | 'lg'" },
        category: "Layout",
        defaultValue: { summary: "md" },
      },
    },
    children: {
      description: "Conteúdo textual ou nó React interno.",
      table: { type: { summary: "React.ReactNode" }, category: "Conteúdo" },
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * ## Exemplo Padrão
 *
 * Badge com configuração padrão (variante `default`, tamanho `md`).
 */
export const Default: Story = {
  args: { children: "Badge" },
  parameters: {
    docs: {
      description: {
        story:
          "Badge com configuração padrão. Use esta variante para informações gerais ou quando não há necessidade de destaque semântico específico.",
      },
    },
  },
};

/**
 * ## Variante Secundária
 *
 * Badge com estilo secundário, útil para informações menos importantes.
 */
export const Secondary: Story = {
  args: { variant: "secondary", children: "Secundário" },
  parameters: {
    docs: {
      description: {
        story:
          "Variante secundária com cor neutra. Use para informações complementares ou menos importantes.",
      },
    },
  },
};

/**
 * ## Variante Destrutiva
 *
 * Badge para indicar erros, ações destrutivas ou estados críticos.
 */
export const Destructive: Story = {
  args: { variant: "destructive", children: "Destrutivo" },
  parameters: {
    docs: {
      description: {
        story:
          "Variante destrutiva com cor vermelha. Use para indicar erros, ações destrutivas ou estados críticos que requerem atenção.",
      },
    },
  },
};

/**
 * ## Variante Outline
 *
 * Badge com borda e fundo transparente, útil para destacar sem ocupar muito espaço visual.
 */
export const Outline: Story = {
  args: { variant: "outline", children: "Contorno" },
  parameters: {
    docs: {
      description: {
        story:
          "Variante outline com borda e fundo transparente. Use quando quiser destacar informações sem ocupar muito espaço visual.",
      },
    },
  },
};

/**
 * ## Variante Success
 *
 * Badge para indicar sucesso, confirmação ou estados positivos.
 */
export const Success: Story = {
  args: { variant: "success", children: "Sucesso" },
  parameters: {
    docs: {
      description: {
        story:
          "Variante success com cor verde. Use para indicar sucesso, confirmação ou estados positivos.",
      },
    },
  },
};

/**
 * ## Variante Warning
 *
 * Badge para indicar avisos ou estados que requerem atenção.
 */
export const Warning: Story = {
  args: { variant: "warning", children: "Aviso" },
  parameters: {
    docs: {
      description: {
        story:
          "Variante warning com cor amarela. Use para indicar avisos ou estados que requerem atenção do usuário.",
      },
    },
  },
};

/**
 * ## Variante Info
 *
 * Badge para exibir informações gerais ou educativas.
 */
export const Info: Story = {
  args: { variant: "info", children: "Informação" },
  parameters: {
    docs: {
      description: {
        story:
          "Variante info com cor azul. Use para exibir informações gerais, educativas ou informativas.",
      },
    },
  },
};

/**
 * ## Tamanho Pequeno
 *
 * Badge com tamanho pequeno, útil para espaços compactos.
 */
export const Small: Story = {
  args: { size: "sm", children: "Pequeno" },
  parameters: {
    docs: {
      description: {
        story:
          "Badge com tamanho pequeno. Use em espaços compactos ou quando o badge precisa ser discreto.",
      },
    },
  },
};

/**
 * ## Tamanho Grande
 *
 * Badge com tamanho grande, útil para maior destaque visual.
 */
export const Large: Story = {
  args: { size: "lg", children: "Grande" },
  parameters: {
    docs: {
      description: {
        story:
          "Badge com tamanho grande. Use quando o badge precisa de maior destaque visual ou em interfaces com mais espaço.",
      },
    },
  },
};

/**
 * ## Uso em StatCard
 *
 * Exemplo de uso do Badge em contexto de StatCard, mostrando métricas com ícones e cores semânticas.
 */
export const UsageInStatCard: Story = {
  args: { children: "" },
  render: () => (
    <div className="flex flex-col gap-4">
      <Badge
        variant="success"
        className="text-xs font-semibold inline-flex items-center gap-1 w-fit"
      >
        <ArrowUp className="h-4 w-4" />
        +17.2%
      </Badge>
      <Badge
        variant="destructive"
        className="text-xs font-semibold inline-flex items-center gap-1 w-fit"
      >
        <ArrowDown className="h-4 w-4" />
        -8.5%
      </Badge>
      <Badge
        variant="secondary"
        className="text-xs font-semibold inline-flex items-center gap-1 w-fit"
      >
        <Minus className="h-4 w-4" />
        0%
      </Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Uso contextual em StatCard mostrando tendência com ícones e estilo utilitário. Demonstra como combinar Badge com ícones para criar indicadores visuais ricos.",
      },
    },
  },
};

/**
 * ## Teste de Acessibilidade
 *
 * Valida que o Badge é renderizado corretamente e possui estrutura acessível.
 */
export const Accessibility: Story = {
  args: { children: "Badge Acessível" },
  parameters: {
    docs: {
      description: {
        story:
          "Teste de acessibilidade do Badge. Valida renderização e estrutura básica do componente.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByText("Badge Acessível");
    expect(badge).toBeInTheDocument();
    expect(badge.tagName).toBe("DIV");
  },
};
