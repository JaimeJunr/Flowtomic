import type { Meta, StoryObj } from "@storybook/react-vite";
import ProductLanding from "./page";

const meta = {
  title: "Flowtomic UI/Blocks/ProductLanding",
  component: ProductLanding,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Página de produto inteira montada só com peças do Flowtomic: aviso, cabeçalho, hero com contagens, instalação em abas, troca de dependências, tabela de comparação, linha do tempo, números, fila de peças e FAQ. Todo o texto fica em `productLandingContent`; passe `content` para trocar.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ProductLanding>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Estreito: Story = {
  decorators: [
    (Story) => (
      <div className="mx-auto w-[390px] max-w-full border-x">
        <Story />
      </div>
    ),
  ],
};

export const Escuro: Story = {
  decorators: [
    (Story) => (
      <div className="dark bg-background">
        <Story />
      </div>
    ),
  ],
};
