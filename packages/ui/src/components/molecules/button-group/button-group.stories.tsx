import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../../atoms/button/button";
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from "./button-group";

const meta = {
  title: "Flowtomic UI/Molecules/ButtonGroup",
  component: ButtonGroup,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    orientation: {
      control: "select",
      options: ["horizontal", "vertical"],
    },
    equalWidth: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof ButtonGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  render: () => (
    <ButtonGroup>
      <Button variant="outline">Esquerda</Button>
      <Button variant="outline">Meio</Button>
      <Button variant="outline">Direita</Button>
    </ButtonGroup>
  ),
};

export const Vertical: Story = {
  render: () => (
    <ButtonGroup orientation="vertical">
      <Button variant="outline">Topo</Button>
      <Button variant="outline">Meio</Button>
      <Button variant="outline">Base</Button>
    </ButtonGroup>
  ),
};

export const WithSeparator: Story = {
  render: () => (
    <ButtonGroup>
      <Button variant="outline">Salvar</Button>
      <ButtonGroupSeparator />
      <Button variant="outline">Cancelar</Button>
    </ButtonGroup>
  ),
};

export const WithText: Story = {
  render: () => (
    <ButtonGroup>
      <Button variant="outline">Ação</Button>
      <ButtonGroupText>ou</ButtonGroupText>
      <Button variant="outline">Alternativa</Button>
    </ButtonGroup>
  ),
};

export const EqualWidth: Story = {
  render: () => (
    <ButtonGroup equalWidth className="w-64">
      <Button variant="outline">Sim</Button>
      <Button variant="outline">Não</Button>
      <Button variant="outline">Talvez</Button>
    </ButtonGroup>
  ),
};
