import type { Meta, StoryObj } from "@storybook/react-vite";
import { Download, Share2 } from "lucide-react";
import {
  Artifact,
  ArtifactAction,
  ArtifactActions,
  ArtifactClose,
  ArtifactContent,
  ArtifactDescription,
  ArtifactHeader,
  ArtifactTitle,
} from "./artifact";

const meta = {
  title: "Flowtomic UI/Molecules/DataDisplay/Artifact",
  component: Artifact,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Artifact>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Artifact className="w-[400px]">
      <ArtifactHeader>
        <div>
          <ArtifactTitle>Document Title</ArtifactTitle>
          <ArtifactDescription>This is a description of the artifact</ArtifactDescription>
        </div>
        <ArtifactClose />
      </ArtifactHeader>
      <ArtifactContent>
        <p>This is the content of the artifact.</p>
      </ArtifactContent>
    </Artifact>
  ),
};

export const WithActions: Story = {
  render: () => (
    <Artifact className="w-[400px]">
      <ArtifactHeader>
        <div>
          <ArtifactTitle>Document with Actions</ArtifactTitle>
          <ArtifactDescription>Artifact with action buttons</ArtifactDescription>
        </div>
        <ArtifactActions>
          <ArtifactAction icon={Download} tooltip="Download" />
          <ArtifactAction icon={Share2} tooltip="Share" />
          <ArtifactClose />
        </ArtifactActions>
      </ArtifactHeader>
      <ArtifactContent>
        <p>This artifact has action buttons in the header.</p>
      </ArtifactContent>
    </Artifact>
  ),
};
