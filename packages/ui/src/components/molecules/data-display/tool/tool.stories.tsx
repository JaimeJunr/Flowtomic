import type { Meta, StoryObj } from "@storybook/react-vite";
import { Tool, ToolContent, ToolHeader, ToolInput, ToolOutput } from "./tool";

const meta = {
  title: "Flowtomic UI/Molecules/Data Display/Tool",
  component: Tool,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Tool>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Tool className="w-[500px]">
      <ToolHeader title="Example Tool" type="tool-example" state="output-available" />
      <ToolContent>
        <ToolInput input={{ param1: "value1", param2: "value2" }} />
        <ToolOutput output={{ result: "success" }} />
      </ToolContent>
    </Tool>
  ),
};

export const WithError: Story = {
  render: () => (
    <Tool className="w-[500px]">
      <ToolHeader title="Error Tool" type="tool-error" state="output-error" />
      <ToolContent>
        <ToolInput input={{ param: "value" }} />
        <ToolOutput output={null} errorText="An error occurred" />
      </ToolContent>
    </Tool>
  ),
};
