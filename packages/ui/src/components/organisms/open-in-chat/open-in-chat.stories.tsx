import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  OpenIn,
  OpenInChatGPT,
  OpenInClaude,
  OpenInContent,
  OpenInLabel,
  OpenInSeparator,
  OpenInT3,
  OpenInTrigger,
} from "./open-in-chat";

const meta = {
  title: "Flowtomic UI/Organisms/OpenInChat",
  component: OpenIn,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof OpenIn>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <OpenIn query="bug no registry:build">
      <OpenInTrigger />
      <OpenInContent>
        <OpenInLabel>Abrir em</OpenInLabel>
        <OpenInChatGPT />
        <OpenInClaude />
        <OpenInT3 />
        <OpenInSeparator />
      </OpenInContent>
    </OpenIn>
  ),
};
