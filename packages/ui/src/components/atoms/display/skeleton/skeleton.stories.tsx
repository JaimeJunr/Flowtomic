import type { Meta, StoryObj } from "@storybook/react-vite";
import { Card, CardContent, CardHeader } from "../card/card";
import { CardSkeleton, Skeleton, TableSkeleton } from "./skeleton";

const meta = {
  title: "Flowtomic UI/Atoms/Display/Skeleton",
  component: Skeleton,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    className: "h-4 w-[250px]",
  },
};

export const Circle: Story = {
  args: {
    className: "h-12 w-12 rounded-full",
  },
};

export const Text: Story = {
  render: () => (
    <div className="space-y-2 w-[400px]">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  ),
};

export const CardSkeletonStory: Story = {
  render: () => <CardSkeleton />,
};

export const Table: Story = {
  render: () => <TableSkeleton />,
};

export const Avatar: Story = {
  render: () => (
    <div className="flex items-center space-x-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
  ),
};

export const CardContentSkeleton: Story = {
  render: () => (
    <Card className="w-[400px]">
      <CardHeader>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-32 w-full" />
      </CardContent>
    </Card>
  ),
};

export const StatsGridStyle: Story = {
  render: () => {
    const cardIds = ["card-1", "card-2", "card-3", "card-4"];
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cardIds.map((id) => (
          <Card key={id} className="border">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4 border-0">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent className="space-y-2.5">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-4 w-40" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Exemplo de uso customizado do Skeleton como no StatsGrid, usado para exibir loading state de múltiplos cards de estatísticas em grid responsivo.",
      },
    },
  },
};
