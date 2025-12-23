import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { EditModeToggle } from "./edit-mode-toggle";

const meta = {
  title: "Flowtomic UI/Molecules/EditModeToggle",
  component: EditModeToggle,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    isEditMode: {
      control: "boolean",
    },
    disabled: {
      control: "boolean",
    },
    viewLabel: {
      control: "text",
    },
    editLabel: {
      control: "text",
    },
  },
} satisfies Meta<typeof EditModeToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const [isEditMode, setIsEditMode] = useState(args.isEditMode ?? false);
    return <EditModeToggle {...args} isEditMode={isEditMode} onToggle={setIsEditMode} />;
  },
  args: {
    isEditMode: false,
  },
};

export const EditMode: Story = {
  render: (args) => {
    const [isEditMode, setIsEditMode] = useState(true);
    return <EditModeToggle {...args} isEditMode={isEditMode} onToggle={setIsEditMode} />;
  },
  args: {
    isEditMode: true,
  },
};

export const CustomLabels: Story = {
  render: (args) => {
    const [isEditMode, setIsEditMode] = useState(false);
    return (
      <EditModeToggle
        {...args}
        isEditMode={isEditMode}
        onToggle={setIsEditMode}
        viewLabel="Ver"
        editLabel="Personalizar"
      />
    );
  },
  args: {
    isEditMode: false,
  },
};

export const Disabled: Story = {
  render: (args) => {
    const [isEditMode, setIsEditMode] = useState(false);
    return <EditModeToggle {...args} isEditMode={isEditMode} onToggle={setIsEditMode} disabled />;
  },
  args: {
    isEditMode: false,
    disabled: true,
  },
};
