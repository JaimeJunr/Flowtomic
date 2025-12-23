import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { QRCode } from "./qr-code";

const meta = {
  title: "Flowtomic UI/Atoms/Data Display/QRCode",
  component: QRCode,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `Componente QRCode para exibir códigos QR estilizados.
\n## Características
- Renderização via lib \`qr-code-styling\` (SVG)
- Suporte a tamanhos (md, lg)
- Frame decorativo consistente com design system
- Prop \`animated\` adiciona overlay de varredura (respeita prefers-reduced-motion)
- Acessibilidade: \`role="img"\`, \`aria-label\` configurável
\n## Quando usar
- Compartilhar links curtos ou deep links
- Exibir identificadores visuais que podem ser escaneados
\n## Acessibilidade
Use um \`ariaLabel\` descritivo (ex: "QR code para baixar aplicativo").`,
      },
    },
    controls: {
      sort: "requiredFirst",
      expanded: true,
    },
  },
  tags: ["autodocs"],
  argTypes: {
    value: {
      control: "text",
      description: "Valor codificado (string).",
      table: {
        type: { summary: "string" },
        category: "Conteúdo",
      },
    },
    size: {
      control: "select",
      options: ["md", "lg"],
      description: "Tamanho do QR (wrapper + dimensões internas).",
      table: {
        type: { summary: "'md' | 'lg'" },
        category: "Layout",
        defaultValue: { summary: "md" },
      },
    },
    animated: {
      control: "boolean",
      description: "Ativa overlay de varredura animado (respeita prefers-reduced-motion).",
      table: {
        type: { summary: "boolean" },
        category: "Comportamento",
        defaultValue: { summary: "false" },
      },
    },
    ariaLabel: {
      control: "text",
      description: "Texto alternativo para leitores de tela.",
      table: {
        type: { summary: "string" },
        category: "Acessibilidade",
        defaultValue: { summary: "QR code" },
      },
    },
    options: {
      control: "object",
      description: "Opções avançadas da lib qr-code-styling (dotsOptions, image, etc).",
      table: {
        type: { summary: "QRCodeStylingOptions" },
        category: "Configuração",
      },
    },
    className: {
      control: "text",
      description: "Classes adicionais Tailwind.",
      table: {
        type: { summary: "string" },
        category: "Estilo",
      },
    },
  },
  args: {
    value: "https://flowtomic.dev",
    size: "md",
    animated: false,
    ariaLabel: "QR code para flowtomic.dev",
  },
} satisfies Meta<typeof QRCode>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Interactive: Story = {
  render: (args) => <QRCode {...args} />,
  parameters: {
    docs: {
      description: {
        story: "Story interativa: ajuste props nos controls para ver mudanças em tempo real.",
      },
    },
  },
};

export const Default: Story = {
  args: { value: "https://flowtomic.dev" },
  parameters: {
    docs: {
      description: { story: "Uso básico com tamanho padrão (md)." },
    },
  },
};

export const Large: Story = {
  args: { size: "lg", value: "https://flowtomic.dev" },
  parameters: {
    docs: {
      description: { story: "Versão grande (lg) para maior escaneabilidade." },
    },
  },
};

export const Animated: Story = {
  args: { animated: true, value: "https://flowtomic.dev" },
  parameters: {
    docs: {
      description: {
        story:
          "Overlay animado simulando varredura. Automaticamente desativado se usuário prefere movimento reduzido.",
      },
    },
  },
};

export const Accessibility: Story = {
  args: { ariaLabel: "QR code para acessar flowtomic.dev" },
  parameters: {
    docs: {
      description: {
        story: "Valida atributos de acessibilidade básicos (role, aria-label).",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const qr = canvas.getByRole("img", { name: /flowtomic\.dev/i });
    expect(qr).toBeInTheDocument();
  },
};
