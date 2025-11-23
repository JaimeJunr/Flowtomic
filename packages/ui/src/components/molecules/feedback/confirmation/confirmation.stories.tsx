import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Confirmation,
  ConfirmationAction,
  ConfirmationActions,
  ConfirmationTitle,
} from "./confirmation";

const meta = {
  title: "Flowtomic UI/Molecules/Feedback/Confirmation",
  component: Confirmation,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Confirmation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Requested: Story = {
  render: () => (
    <Confirmation approval={{ id: "1" }} state="approval-requested" className="w-[400px]">
      <ConfirmationTitle>Do you want to proceed with this action?</ConfirmationTitle>
      <ConfirmationActions>
        <ConfirmationAction variant="outline">Cancel</ConfirmationAction>
        <ConfirmationAction>Confirm</ConfirmationAction>
      </ConfirmationActions>
    </Confirmation>
  ),
};
