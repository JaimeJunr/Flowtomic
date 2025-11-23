import type { Meta, StoryObj } from "@storybook/react-vite";
import { useTimeTracker } from "./index";

/**
 * Story demonstrando o uso do hook useTimeTracker
 * Este hook é headless - fornece apenas lógica, sem UI
 */
const meta = {
  title: "Flowtomic Logic/Hooks/useTimeTracker",
  component: () => null,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Hook headless que fornece lógica para gerenciar timer. Você controla o markup e styles.",
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
function TimeTrackerDemo({
  initialTime = 0,
  format = "HH:mm:ss",
}: {
  initialTime?: number;
  format?: "HH:mm:ss" | "mm:ss" | "ss";
}) {
  const { time, formattedTime, isRunning, isPaused, isStopped, start, pause, stop, resume, reset } =
    useTimeTracker({
      initialTime,
      format,
    });

  return (
    <div className="flex flex-col gap-4 p-6 border rounded-lg">
      <div className="text-center">
        <div className="text-4xl font-mono font-bold mb-2">{formattedTime}</div>
        <div className="text-sm text-muted-foreground">
          {isRunning && "⏱️ Running"}
          {isPaused && "⏸️ Paused"}
          {isStopped && "⏹️ Stopped"}
        </div>
        <div className="text-xs text-muted-foreground mt-1">Time: {time}s</div>
      </div>

      <div className="flex gap-2 justify-center">
        {isStopped && (
          <button
            type="button"
            onClick={start}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Start
          </button>
        )}
        {isRunning && (
          <button
            type="button"
            onClick={pause}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            Pause
          </button>
        )}
        {isPaused && (
          <>
            <button
              type="button"
              onClick={resume}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Resume
            </button>
            <button
              type="button"
              onClick={stop}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Stop
            </button>
          </>
        )}
        {(isRunning || isPaused) && (
          <button
            type="button"
            onClick={reset}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}

export const Default: Story = {
  render: () => <TimeTrackerDemo />,
};

export const WithInitialTime: Story = {
  render: () => <TimeTrackerDemo initialTime={3661} />, // 1h 1m 1s
};

export const FormatMMSS: Story = {
  render: () => <TimeTrackerDemo format="mm:ss" />,
};

export const FormatSS: Story = {
  render: () => <TimeTrackerDemo format="ss" />,
};
