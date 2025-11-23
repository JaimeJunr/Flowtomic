import type { Meta, StoryObj } from "@storybook/react-vite";
import { FileText } from "lucide-react";
import { Button } from "@/components/atoms/actions/button/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "./item";

const meta = {
  title: "Flowtomic UI/Molecules/Forms/Item",
  component: Item,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Item>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <ItemGroup>
      <Item>
        <ItemMedia>
          <FileText />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Documento 1</ItemTitle>
          <ItemDescription>Descrição do documento</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button size="sm" variant="ghost">
            Ações
          </Button>
        </ItemActions>
      </Item>
      <ItemSeparator />
      <Item>
        <ItemMedia>
          <FileText />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Documento 2</ItemTitle>
          <ItemDescription>Outra descrição</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button size="sm" variant="ghost">
            Ações
          </Button>
        </ItemActions>
      </Item>
    </ItemGroup>
  ),
};

export const WithIcon: Story = {
  render: () => (
    <Item>
      <ItemMedia variant="icon">
        <FileText />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>Item com Ícone</ItemTitle>
        <ItemDescription>Descrição do item</ItemDescription>
      </ItemContent>
    </Item>
  ),
};

export const Outline: Story = {
  render: () => (
    <Item variant="outline">
      <ItemMedia>
        <FileText />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>Item Outline</ItemTitle>
        <ItemDescription>Item com variante outline</ItemDescription>
      </ItemContent>
    </Item>
  ),
};
