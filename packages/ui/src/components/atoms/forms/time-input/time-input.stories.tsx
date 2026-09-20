import type { Meta, StoryObj } from "@storybook/react-vite";
import { TimeInput } from "./time-input";

const meta = {
  title: "Flowtomic UI/Atoms/Forms/TimeInput",
  component: TimeInput,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          'Campo de entrada para hora (input type="time"). Estilo consistente com o design system.',
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    value: { control: "text" },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof TimeInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    "aria-label": "Hora",
  },
};

export const WithValue: Story = {
  args: {
    value: "14:30",
    "aria-label": "Hora",
  },
};

export const Disabled: Story = {
  args: {
    value: "14:30",
    disabled: true,
    "aria-label": "Hora",
  },
};
