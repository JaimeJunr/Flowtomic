import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { fn } from "storybook/test";
import { ThemeToggleButton } from "./theme-toggle-button";

const meta = {
  title: "Flowtomic UI/Molecules/Theme/ThemeToggleButton",
  component: ThemeToggleButton,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "md", "lg", "icon"],
    },
    start: {
      control: "select",
      options: ["center", "top-left", "top-right", "bottom-left", "bottom-right"],
    },
    disabled: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof ThemeToggleButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [theme, setTheme] = useState<"light" | "dark">("light");
    return (
      <ThemeToggleButton
        theme={theme}
        onThemeChange={(newTheme) => {
          setTheme(newTheme);
          fn()(newTheme);
        }}
      />
    );
  },
};

export const Small: Story = {
  render: () => {
    const [theme, setTheme] = useState<"light" | "dark">("light");
    return <ThemeToggleButton size="sm" theme={theme} onThemeChange={setTheme} />;
  },
};

export const Medium: Story = {
  render: () => {
    const [theme, setTheme] = useState<"light" | "dark">("light");
    return <ThemeToggleButton size="md" theme={theme} onThemeChange={setTheme} />;
  },
};

export const Large: Story = {
  render: () => {
    const [theme, setTheme] = useState<"light" | "dark">("light");
    return <ThemeToggleButton size="lg" theme={theme} onThemeChange={setTheme} />;
  },
};

export const DifferentStartPositions: Story = {
  render: () => {
    const [theme, setTheme] = useState<"light" | "dark">("light");
    return (
      <div className="space-y-4">
        <div className="flex gap-4">
          <ThemeToggleButton size="icon" start="top-left" theme={theme} onThemeChange={setTheme} />
          <ThemeToggleButton size="icon" start="top-right" theme={theme} onThemeChange={setTheme} />
          <ThemeToggleButton
            size="icon"
            start="bottom-left"
            theme={theme}
            onThemeChange={setTheme}
          />
          <ThemeToggleButton
            size="icon"
            start="bottom-right"
            theme={theme}
            onThemeChange={setTheme}
          />
          <ThemeToggleButton size="icon" start="center" theme={theme} onThemeChange={setTheme} />
        </div>
      </div>
    );
  },
};

export const Disabled: Story = {
  render: () => {
    return <ThemeToggleButton disabled theme="light" />;
  },
};
