import type { Meta, StoryObj } from "@storybook/react-vite";
import { useIsMobile } from "./index";

/**
 * Story demonstrando o uso do hook useIsMobile
 * Este hook é headless - fornece apenas lógica, sem UI
 */
const meta = {
  title: "Flowtomic Logic/Hooks/useIsMobile",
  component: () => null,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Hook headless que detecta se a tela está em modo mobile (largura < 768px). Você controla o markup e styles.",
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
function MobileDemo() {
  const isMobile = useIsMobile();

  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm" style={{ width: "300px" }}>
      <h3 className="mb-4 text-lg font-semibold">Mobile Detection Demo</h3>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Modo Mobile:</span>
          <span className={`font-semibold ${isMobile ? "text-green-600" : "text-gray-400"}`}>
            {isMobile ? "Sim" : "Não"}
          </span>
        </div>
        <div className="mt-4 rounded-md bg-gray-50 p-3">
          <p className="text-xs text-gray-600">
            Largura atual:{" "}
            <strong>{typeof window !== "undefined" ? window.innerWidth : "N/A"}px</strong>
          </p>
          <p className="mt-1 text-xs text-gray-500">Breakpoint: &lt; 768px</p>
        </div>
        <div className="mt-4 rounded-md border border-blue-200 bg-blue-50 p-3">
          <p className="text-xs text-blue-800">
            {isMobile
              ? "📱 Você está em modo mobile. Ajuste a largura da janela para ver a mudança."
              : "💻 Você está em modo desktop. Reduza a largura da janela para ver a mudança."}
          </p>
        </div>
      </div>
    </div>
  );
}

export const Default: Story = {
  render: () => <MobileDemo />,
};

export const ResponsiveLayout: Story = {
  render: () => {
    const isMobile = useIsMobile();

    return (
      <div className="rounded-lg border bg-white p-6 shadow-sm" style={{ width: "400px" }}>
        <h3 className="mb-4 text-lg font-semibold">Responsive Layout Demo</h3>
        <div className={`grid gap-4 ${isMobile ? "grid-cols-1" : "grid-cols-2"}`}>
          <div className="rounded-md bg-blue-100 p-4">
            <p className="text-sm font-medium text-blue-900">Card 1</p>
            <p className="text-xs text-blue-700">Conteúdo adaptável</p>
          </div>
          <div className="rounded-md bg-green-100 p-4">
            <p className="text-sm font-medium text-green-900">Card 2</p>
            <p className="text-xs text-green-700">Conteúdo adaptável</p>
          </div>
        </div>
        <p className="mt-4 text-xs text-gray-500">
          Layout: {isMobile ? "1 coluna (mobile)" : "2 colunas (desktop)"}
        </p>
      </div>
    );
  },
};
