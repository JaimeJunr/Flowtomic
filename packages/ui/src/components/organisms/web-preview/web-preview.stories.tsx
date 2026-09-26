import type { Meta, StoryObj } from "@storybook/react-vite";
import { WebPreview, WebPreviewBody, WebPreviewNavigation, WebPreviewUrl } from "./web-preview";

const meta = {
  title: "Flowtomic UI/Organisms/WebPreview",
  component: WebPreview,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof WebPreview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    defaultUrl: "http://localhost:6006",
    children: (
      <>
        <WebPreviewNavigation>
          <WebPreviewUrl />
        </WebPreviewNavigation>
        <WebPreviewBody />
      </>
    ),
  },
};
