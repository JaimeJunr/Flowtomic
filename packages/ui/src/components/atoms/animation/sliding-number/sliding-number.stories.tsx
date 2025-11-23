import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useState } from "react";
import { SlidingNumber } from "./sliding-number";

const meta = {
  title: "Flowtomic UI/Atoms/Animation/SlidingNumber",
  component: SlidingNumber,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    number: {
      control: "number",
    },
    inView: {
      control: "boolean",
    },
    padStart: {
      control: "boolean",
    },
    decimalPlaces: {
      control: "number",
    },
  },
} satisfies Meta<typeof SlidingNumber>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    number: 42,
  },
};

export const Animated: Story = {
  render: () => {
    const [number, setNumber] = useState(0);
    return (
      <div className="flex flex-col gap-4 items-center">
        <SlidingNumber number={number} className="text-4xl font-bold" />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setNumber((n) => n - 1)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            -
          </button>
          <button
            type="button"
            onClick={() => setNumber((n) => n + 1)}
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
    number: 123.45,
    decimalPlaces: 2,
  },
};

export const Padded: Story = {
  args: {
    number: 5,
    padStart: true,
  },
};

export const NoKnownUsage: Story = {
  render: () => (
    <div className="p-4 text-sm text-muted-foreground">
      Este componente ainda não possui uso conhecido em componentes mais complexos.
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Este componente ainda não possui uso conhecido em molecules ou organisms.",
      },
    },
  },
};
