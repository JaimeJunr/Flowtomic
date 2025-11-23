import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { ButtonCounter } from "./button-counter";

const meta = {
  title: "Flowtomic UI/Molecules/Animation/ButtonCounter",
  component: ButtonCounter,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    value: {
      control: "number",
    },
    min: {
      control: "number",
    },
    max: {
      control: "number",
    },
    step: {
      control: "number",
    },
    showControls: {
      control: "boolean",
    },
    hideNumberBackground: {
      control: "boolean",
    },
    variant: {
      control: "select",
      options: [
        "default",
        "destructive",
        "outline",
        "secondary",
        "ghost",
        "link",
        "success",
        "info",
        "natural",
      ],
    },
  },
} satisfies Meta<typeof ButtonCounter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState(0);
    return <ButtonCounter value={value} onValueChange={setValue} />;
  },
};

export const WithControls: Story = {
  render: () => {
    const [value, setValue] = useState(5);
    return <ButtonCounter value={value} onValueChange={setValue} showControls min={0} max={10} />;
  },
};

export const WithPrefix: Story = {
  render: () => {
    const [value, setValue] = useState(42);
    return <ButtonCounter value={value} onValueChange={setValue} prefix="Items: " showControls />;
  },
};

export const WithSuffix: Story = {
  render: () => {
    const [value, setValue] = useState(100);
    return (
      <ButtonCounter
        value={value}
        onValueChange={setValue}
        suffix="%"
        showControls
        min={0}
        max={100}
      />
    );
  },
};

export const NaturalVariant: Story = {
  render: () => {
    const [value, setValue] = useState(10);
    return (
      <ButtonCounter
        value={value}
        onValueChange={setValue}
        variant="natural"
        animated
        showControls
      />
    );
  },
};

export const SuccessVariant: Story = {
  render: () => {
    const [value, setValue] = useState(25);
    return <ButtonCounter value={value} onValueChange={setValue} variant="success" showControls />;
  },
};

export const WithoutNumberBackground: Story = {
  render: () => {
    const [value, setValue] = useState(107);
    return (
      <ButtonCounter
        value={value}
        onValueChange={setValue}
        variant="default"
        showControls
        hideNumberBackground
        min={0}
        max={200}
      />
    );
  },
};
