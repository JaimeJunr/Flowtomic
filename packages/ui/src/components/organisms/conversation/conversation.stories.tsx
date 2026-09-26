import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "./conversation";

const meta = {
  title: "Flowtomic UI/Organisms/Conversation",
  component: Conversation,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Conversation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Conversation className="h-[400px]">
      <ConversationContent>
        <div>adiciona o stat-card no dashboard</div>
        <div>Feito — story e barrel export atualizados</div>
        <div>roda `bunx vitest run src/components/atoms/stat-card`?</div>
      </ConversationContent>
      <ConversationScrollButton />
    </Conversation>
  ),
};

export const Empty: Story = {
  render: () => (
    <Conversation className="h-[400px]">
      <ConversationEmptyState />
    </Conversation>
  ),
};
