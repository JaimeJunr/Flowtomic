import type { Meta, StoryObj } from "@storybook/react-vite";
import { Search, Send } from "lucide-react";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupTextarea } from "./input-group";

const meta = {
  title: "Flowtomic UI/Molecules/Forms/InputGroup",
  component: InputGroup,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof InputGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <InputGroup className="w-[400px]">
      <InputGroupAddon>
        <Search className="h-4 w-4 text-muted-foreground" />
      </InputGroupAddon>
      <InputGroupTextarea placeholder="Type a message..." rows={1} />
      <InputGroupButton size="icon-sm" variant="ghost">
        <Send className="h-4 w-4" />
      </InputGroupButton>
    </InputGroup>
  ),
};

export const WithButton: Story = {
  render: () => (
    <InputGroup className="w-[400px]">
      <InputGroupTextarea placeholder="Type a message..." rows={1} />
      <InputGroupButton>Send</InputGroupButton>
    </InputGroup>
  ),
};

export const WithPrefix: Story = {
  render: () => (
    <InputGroup className="w-[400px]">
      <InputGroupAddon>
        <span className="text-muted-foreground">@</span>
      </InputGroupAddon>
      <InputGroupTextarea placeholder="username" rows={1} />
    </InputGroup>
  ),
};
