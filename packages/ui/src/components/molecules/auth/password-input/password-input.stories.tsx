import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { PasswordInput } from "./password-input";

const meta = {
  title: "Flowtomic UI/Molecules/Auth/PasswordInput",
  component: PasswordInput,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "error", "success"],
    },
    size: {
      control: "select",
      options: ["default", "sm", "lg"],
    },
    disabled: {
      control: "boolean",
    },
    required: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof PasswordInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = useState("");
    return (
      <div className="w-[400px]">
        <PasswordInput
          {...args}
          id="password"
          label="Senha"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </div>
    );
  },
};

export const WithError: Story = {
  render: () => {
    const [value, setValue] = useState("");
    return (
      <div className="w-[400px]">
        <PasswordInput
          id="password-error"
          label="Senha"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          error="A senha deve ter pelo menos 8 caracteres"
          variant="error"
        />
      </div>
    );
  },
};

export const WithSuccess: Story = {
  render: () => {
    const [value, setValue] = useState("SenhaSegura123!");
    return (
      <div className="w-[400px]">
        <PasswordInput
          id="password-success"
          label="Senha"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          variant="success"
        />
      </div>
    );
  },
};

export const Small: Story = {
  render: () => {
    const [value, setValue] = useState("");
    return (
      <div className="w-[400px]">
        <PasswordInput
          id="password-sm"
          label="Senha"
          size="sm"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </div>
    );
  },
};

export const Large: Story = {
  render: () => {
    const [value, setValue] = useState("");
    return (
      <div className="w-[400px]">
        <PasswordInput
          id="password-lg"
          label="Senha"
          size="lg"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </div>
    );
  },
};

export const Required: Story = {
  render: () => {
    const [value, setValue] = useState("");
    return (
      <div className="w-[400px]">
        <PasswordInput
          id="password-required"
          label="Senha"
          required
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </div>
    );
  },
};

export const Disabled: Story = {
  render: () => {
    return (
      <div className="w-[400px]">
        <PasswordInput id="password-disabled" label="Senha" value="senha123" disabled />
      </div>
    );
  },
};
