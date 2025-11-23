import type { Meta, StoryObj } from "@storybook/react-vite";
import { Source, Sources, SourcesContent, SourcesTrigger } from "./sources";

const meta = {
  title: "Flowtomic UI/Molecules/DataDisplay/Sources",
  component: Sources,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Sources>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Sources>
      <SourcesTrigger count={3} />
      <SourcesContent>
        <Source href="https://example.com/article1" title="Article 1" />
        <Source href="https://example.com/article2" title="Article 2" />
        <Source href="https://example.com/article3" title="Article 3" />
      </SourcesContent>
    </Sources>
  ),
};

export const SingleSource: Story = {
  render: () => (
    <Sources>
      <SourcesTrigger count={1} />
      <SourcesContent>
        <Source href="https://example.com/article" title="Single Article" />
      </SourcesContent>
    </Sources>
  ),
};
