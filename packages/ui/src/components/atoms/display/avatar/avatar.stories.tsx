import type { Meta, StoryObj } from "@storybook/react-vite";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import logoDark from "./logo_dark.svg";

const meta = {
  title: "Flowtomic UI/Atoms/Display/Avatar",
  component: Avatar,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Avatar>
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
  ),
};

export const WithFallback: Story = {
  render: () => (
    <Avatar>
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
  ),
};

export const Multiple: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar>
        <AvatarImage src="https://avatars.githubusercontent.com/u/138415231?v=4" alt="@jaimejunr" />
        <AvatarFallback>JJ</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarImage src={logoDark} alt="react" />
        <AvatarFallback>R</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    </div>
  ),
};

export const Large: Story = {
  render: () => (
    <Avatar className="h-20 w-20">
      <AvatarImage src="https://avatars.githubusercontent.com/u/138415231?v=4" alt="@jaimejunr" />
      <AvatarFallback className="text-lg">JJ</AvatarFallback>
    </Avatar>
  ),
};

export const Small: Story = {
  render: () => (
    <Avatar className="h-8 w-8">
      <AvatarImage src="https://avatars.githubusercontent.com/u/138415231?v=4" alt="@jaimejunr" />
      <AvatarFallback className="text-xs">JJ</AvatarFallback>
    </Avatar>
  ),
};

export const NoKnownUsage: Story = {
  render: () => (
    <div className="p-4 text-sm text-muted-foreground">
      Este componente ainda não possui uso conhecido em componentes mais complexos.
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Este componente ainda não possui uso conhecido em molecules ou organisms.",
      },
    },
  },
};
