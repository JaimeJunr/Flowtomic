import type { Meta, StoryObj } from "@storybook/react-vite";
import { DateInput } from "./date-input";

const meta = {
  title: "Flowtomic UI/Atoms/Forms/DateInput",
  component: DateInput,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          'Campo de entrada para data (input type="date"). Estilo consistente com o design system.',
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    value: { control: "text" },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof DateInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    "aria-label": "Data",
  },
};

export const WithValue: Story = {
  args: {
    value: "2025-03-04",
    "aria-label": "Data",
  },
};

export const Disabled: Story = {
  args: {
    value: "2025-03-04",
    disabled: true,
    "aria-label": "Data",
  },
};
