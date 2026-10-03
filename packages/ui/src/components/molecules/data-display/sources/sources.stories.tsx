import type { Meta, StoryObj } from "@storybook/react-vite";
import { Source, Sources, SourcesContent, SourcesTrigger } from "./sources";

const meta = {
  title: "Flowtomic UI/Molecules/Data Display/Sources",
  component: Sources,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Documentos usados pelo assistente para responder sobre componentes do Flowtomic.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Sources>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "Duas fontes consultadas",
  render: () => (
    <Sources>
      <SourcesTrigger count={2} />
      <SourcesContent>
        <Source
          href="https://github.com/JaimeJunr/Flowtomic/blob/main/docs/componentes/molecules.md"
          title="docs/componentes/molecules.md"
        />
        <Source
          href="https://github.com/JaimeJunr/Flowtomic/blob/main/DESIGN.md"
          title="DESIGN.md"
        />
      </SourcesContent>
    </Sources>
  ),
};
export const SingleSource: Story = {
  name: "Uma fonte consultada",
  render: () => (
    <Sources>
      <SourcesTrigger count={1} />
      <SourcesContent>
        <Source
          href="https://github.com/JaimeJunr/Flowtomic/blob/main/DESIGN.md"
          title="DESIGN.md"
        />
      </SourcesContent>
    </Sources>
  ),
};
