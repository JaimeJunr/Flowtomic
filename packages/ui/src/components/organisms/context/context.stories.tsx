import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Context,
  ContextContent,
  ContextContentBody,
  ContextContentFooter,
  ContextContentHeader,
  ContextTrigger,
} from "./context";

const meta = {
  title: "Flowtomic UI/Organisms/Context",
  component: Context,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Context>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    usedTokens: 5000,
    maxTokens: 100000,
    children: (
      <>
        <ContextTrigger />
        <ContextContent>
          <ContextContentHeader />
          <ContextContentBody>
            <p className="text-xs text-muted-foreground">
              Detalhe de uso de tokens da sessão no registry:build
            </p>
          </ContextContentBody>
          <ContextContentFooter />
        </ContextContent>
      </>
    ),
  },
};
