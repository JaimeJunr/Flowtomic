import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../../display/avatar";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./hover-card";

const meta = {
  title: "Flowtomic UI/Atoms/Feedback/HoverCard",
  component: HoverCard,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof HoverCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <HoverCard>
      <HoverCardTrigger asChild>
        <button type="button" className="text-sm underline">
          Hover me
        </button>
      </HoverCardTrigger>
      <HoverCardContent>
        <p>Conteúdo do hover card</p>
      </HoverCardContent>
    </HoverCard>
  ),
};

export const PromptInputStyle: Story = {
  render: () => (
    <HoverCard closeDelay={0} openDelay={0}>
      <HoverCardTrigger asChild>
        <button type="button" className="text-sm underline">
          Anexo
        </button>
      </HoverCardTrigger>
      <HoverCardContent className="w-auto p-2" align="start">
        <p className="text-xs">Preview do anexo</p>
      </HoverCardContent>
    </HoverCard>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Exemplo de uso customizado do HoverCard como no PromptInput, usado para preview de anexos com delays customizados e alinhamento específico.",
      },
    },
  },
};
