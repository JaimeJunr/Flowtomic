import type { Meta, StoryObj } from "@storybook/react-vite";
import { InstallCommand } from "./install-command";

const meta = {
  title: "Flowtomic UI/Atoms/Code/InstallCommand",
  component: InstallCommand,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Pílula com o comando de instalação: prompt, comando em mono e botão de copiar. Com `managers`, troca o comando entre npm, pnpm, yarn e bun.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg"] },
    prompt: { control: "text" },
    persistManager: { control: "boolean" },
  },
  args: { command: "npx flowtomic-cli add button" },
} satisfies Meta<typeof InstallCommand>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Hero: Story = {
  args: { size: "lg" },
  render: (args) => (
    <div className="flex flex-col items-center gap-6 py-16 text-center">
      <h2 className="font-display text-display-md text-foreground">Comece em um comando</h2>
      <InstallCommand {...args} />
    </div>
  ),
};

export const Gerenciadores: Story = {
  args: {
    command: "npm install @flowtomic/ui",
    managers: ["npm", "pnpm", "yarn", "bun"],
  },
};

export const SemPrompt: Story = {
  args: { prompt: null },
};

export const Longo: Story = {
  args: {
    command: "npx flowtomic-cli add button card dialog dropdown-menu select tabs tooltip",
  },
  render: (args) => (
    <div className="w-[280px]">
      <InstallCommand {...args} />
    </div>
  ),
};

export const Escuro: Story = {
  render: (args) => (
    <div className="dark rounded-lg bg-background p-8">
      <InstallCommand {...args} />
    </div>
  ),
};
