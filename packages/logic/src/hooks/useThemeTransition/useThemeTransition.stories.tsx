import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { useThemeTransition } from "./index";

/**
 * Story demonstrando o uso do hook useThemeTransition
 * Este hook é headless - fornece apenas lógica, sem UI
 */
const meta = {
  title: "Flowtomic Logic/Hooks/useThemeTransition",
  component: () => null,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Hook headless que gerencia transições suaves de tema usando a View Transitions API com fallback automático. Você controla o markup e styles.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Componente de demonstração que usa o hook
 */
function ThemeToggleDemo() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const { startTransition } = useThemeTransition();

  const toggleTheme = () => {
    startTransition(() => {
      setTheme((prev) => (prev === "light" ? "dark" : "light"));
    });
  };

  return (
    <div
      className={`rounded-lg border p-6 shadow-sm transition-colors ${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900"
      }`}
      style={{ width: "300px" }}
    >
      <h3 className="mb-4 text-lg font-semibold">Theme Transition Demo</h3>
      <p className="mb-4 text-sm opacity-80">
        Tema atual: <strong>{theme}</strong>
      </p>
      <button
        type="button"
        onClick={toggleTheme}
        className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
      >
        Alternar Tema
      </button>
      <p className="mt-4 text-xs opacity-60">
        {typeof document !== "undefined" && "startViewTransition" in document
          ? "View Transitions API disponível"
          : "Fallback: sem animação"}
      </p>
    </div>
  );
}

export const Default: Story = {
  render: () => <ThemeToggleDemo />,
};

export const WithCustomTransition: Story = {
  render: () => {
    const [theme, setTheme] = useState<"light" | "dark">("light");
    const { startTransition } = useThemeTransition();

    const handleThemeChange = (newTheme: "light" | "dark") => {
      startTransition(() => {
        setTheme(newTheme);
      });
    };

    return (
      <div
        className={`rounded-lg border p-6 shadow-sm transition-colors ${
          theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900"
        }`}
        style={{ width: "300px" }}
      >
        <h3 className="mb-4 text-lg font-semibold">Custom Theme Control</h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleThemeChange("light")}
            className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            Light
          </button>
          <button
            type="button"
            onClick={() => handleThemeChange("dark")}
            className="rounded-md bg-gray-700 px-4 py-2 text-white hover:bg-gray-800"
          >
            Dark
          </button>
        </div>
      </div>
    );
  },
};
