import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { AnimatedSlidingNumber } from "./animated-sliding-number";

const meta = {
  title: "Flowtomic UI/Molecules/Animation/AnimatedSlidingNumber",
  component: AnimatedSlidingNumber,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    value: {
      control: "number",
    },
    size: {
      control: "select",
      options: ["xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl"],
    },
    weight: {
      control: "select",
      options: ["light", "normal", "medium", "semibold", "bold"],
    },
    color: {
      control: "select",
      options: [
        "default",
        "primary",
        "secondary",
        "muted",
        "success",
        "warning",
        "error",
        "inherit",
      ],
    },
    align: {
      control: "select",
      options: ["left", "center", "right"],
    },
  },
} satisfies Meta<typeof AnimatedSlidingNumber>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: 42,
  },
};

export const Large: Story = {
  args: {
    value: 1234,
    size: "4xl",
    weight: "bold",
  },
};

export const WithAnimation: Story = {
  render: () => {
    const [value, setValue] = useState(0);
    return (
      <div className="flex flex-col gap-4 items-center">
        <AnimatedSlidingNumber value={value} size="4xl" weight="bold" color="primary" />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setValue((n) => n - 1)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            -
          </button>
          <button
            type="button"
            onClick={() => setValue((n) => n + 1)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            +
          </button>
        </div>
      </div>
    );
  },
};

export const WithDecimals: Story = {
  args: {
    value: 123.45,
    decimalPlaces: 2,
    size: "xl",
  },
};

export const SuccessColor: Story = {
  args: {
    value: 100,
    color: "success",
    size: "2xl",
    weight: "semibold",
  },
};

export const ErrorColor: Story = {
  args: {
    value: -50,
    color: "error",
    size: "2xl",
    weight: "semibold",
  },
};

export const InText: Story = {
  render: () => {
    const [count, setCount] = useState(42);
    return (
      <div className="space-y-2">
        <p className="text-lg">
          Você tem <AnimatedSlidingNumber value={count} size="lg" weight="bold" color="primary" />{" "}
          itens no carrinho.
        </p>
        <p className="text-sm text-muted-foreground">
          Total: R${" "}
          <AnimatedSlidingNumber value={count * 29.99} decimalPlaces={2} weight="semibold" />
        </p>
        <div className="flex gap-2 mt-4">
          <button
            type="button"
            onClick={() => setCount((c) => c - 1)}
            className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm"
          >
            -
          </button>
          <button
            type="button"
            onClick={() => setCount((c) => c + 1)}
            className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm"
          >
            +
          </button>
        </div>
      </div>
    );
  },
};

export const InheritColor: Story = {
  render: () => {
    const [value, setValue] = useState(42);
    return (
      <div className="space-y-4">
        <div className="p-4 bg-primary text-primary-foreground rounded-md">
          <p>
            Número com cor inherit: <AnimatedSlidingNumber value={value} color="inherit" />
          </p>
        </div>
        <div className="p-4 bg-success text-success-foreground rounded-md">
          <p>
            Número com cor inherit: <AnimatedSlidingNumber value={value} color="inherit" />
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setValue((v) => v - 1)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            -
          </button>
          <button
            type="button"
            onClick={() => setValue((v) => v + 1)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            +
          </button>
        </div>
      </div>
    );
  },
};
