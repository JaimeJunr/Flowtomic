import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../../actions/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";

const meta = {
  title: "Flowtomic UI/Atoms/Feedback/Tooltip",
  component: Tooltip,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button>Hover me</Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Tooltip</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
};

export const WithLongText: Story = {
  render: () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Hover for long text</Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            This is a longer tooltip text that demonstrates how the tooltip handles multiple lines
            of content.
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
};

export const ArtifactStyle: Story = {
  render: () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon-sm">
            <span className="sr-only">Download</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Download</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Exemplo de uso customizado do Tooltip como no Artifact, usado com botões de ação com ícone e label oculto para acessibilidade.",
      },
    },
  },
};
