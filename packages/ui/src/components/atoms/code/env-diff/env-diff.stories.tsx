import type { Meta, StoryObj } from "@storybook/react-vite";
import { EnvDiff, type EnvDiffLine } from "./env-diff";

const meta = {
  title: "Flowtomic UI/Atoms/Code/EnvDiff",
  component: EnvDiff,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    fade: { control: "boolean" },
    animate: { control: "boolean" },
    copyable: { control: "boolean" },
    label: { control: "text" },
  },
} satisfies Meta<typeof EnvDiff>;

export default meta;
type Story = StoryObj<typeof meta>;

const linhas: EnvDiffLine[] = [
  { type: "removed", name: "CHART_LIB_KEY" },
  { type: "removed", name: "TABLE_LIB_KEY" },
  { type: "removed", name: "FORMS_LIB_KEY" },
  { type: "added", name: "FLOWTOMIC_REGISTRY_URL", value: "https://exemplo.dev/r" },
];

const linhasComValores: EnvDiffLine[] = [
  { type: "removed", name: "CHART_LIB_KEY", value: "ck_8f2a91" },
  { type: "removed", name: "TABLE_LIB_KEY", value: "tk_41b7c0", masked: true },
  { type: "context", name: "NODE_ENV", value: "production" },
  { type: "added", name: "FLOWTOMIC_REGISTRY_URL", value: "https://exemplo.dev/r" },
  { type: "added", name: "FLOWTOMIC_TOKEN", value: "ft_93d0e7", masked: true },
];

export const Default: Story = {
  args: { lines: linhas },
};

export const ComValores: Story = {
  args: { lines: linhasComValores },
};

export const Animado: Story = {
  args: { lines: linhas, animate: true },
};

export const Copiavel: Story = {
  args: { lines: linhasComValores, copyable: true },
};

export const EmFaixa: Story = {
  args: { lines: linhas },
  parameters: { layout: "fullscreen" },
  render: (args) => (
    <section className="grid w-full grid-cols-1 items-center gap-8 p-8 md:grid-cols-3 md:gap-12">
      <h2 className="font-display text-display-sm text-foreground">Uma chave no lugar de três</h2>
      <div className="flex md:justify-center">
        <EnvDiff {...args} />
      </div>
      <p className="text-muted-foreground">
        Remova as chaves de cada biblioteca e aponte só o endereço do registry. O resto do projeto
        continua como está.
      </p>
    </section>
  ),
};

export const Escuro: Story = {
  args: { lines: linhasComValores, copyable: true },
  render: (args) => (
    <div className="dark rounded-lg bg-background p-8">
      <EnvDiff {...args} />
    </div>
  ),
};
