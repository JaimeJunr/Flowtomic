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
        <Search className="size-4 text-muted-foreground" aria-hidden="true" />
      </InputGroupAddon>
      <InputGroupTextarea aria-label="Buscar componente" placeholder="Buscar componente" rows={1} />
      <InputGroupButton size="icon" variant="ghost" aria-label="Buscar" className="size-8">
        <Send className="size-4" aria-hidden="true" />
      </InputGroupButton>
    </InputGroup>
  ),
};

export const WithButton: Story = {
  render: () => (
    <InputGroup className="w-[400px]">
      <InputGroupTextarea aria-label="Buscar componente" placeholder="Buscar componente" rows={1} />
      <InputGroupButton>Buscar</InputGroupButton>
    </InputGroup>
  ),
};

export const WithPrefix: Story = {
  render: () => (
    <InputGroup className="w-[400px]">
      <InputGroupAddon>
        <span className="font-mono text-muted-foreground">@flowtomic/</span>
      </InputGroupAddon>
      <InputGroupTextarea aria-label="Nome do pacote" placeholder="ui" rows={1} />
    </InputGroup>
  ),
};
