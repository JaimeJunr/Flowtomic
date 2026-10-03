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
          <ItemTitle>DESIGN.md</ItemTitle>
          <ItemDescription>Tokens, tipografia e regras visuais</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button size="sm" variant="ghost">
            Abrir
          </Button>
        </ItemActions>
      </Item>
      <ItemSeparator />
      <Item>
        <ItemMedia>
          <FileText />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>docs/componentes/molecules.md</ItemTitle>
          <ItemDescription>As 47 molecules, com dependências</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button size="sm" variant="ghost">
            Abrir
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
        <ItemTitle>README.md</ItemTitle>
        <ItemDescription>Como instalar e usar o pacote</ItemDescription>
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
        <ItemTitle>CLAUDE.md</ItemTitle>
        <ItemDescription>Regras do projeto para quem edita o código</ItemDescription>
      </ItemContent>
    </Item>
  ),
};
