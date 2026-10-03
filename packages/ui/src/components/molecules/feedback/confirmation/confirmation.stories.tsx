import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Confirmation,
  ConfirmationAccepted,
  ConfirmationAction,
  ConfirmationActions,
  ConfirmationRejected,
  ConfirmationRequest,
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

function DeleteDist(props: {
  state: "approval-requested" | "approval-responded";
  approved?: boolean;
}) {
  return (
    <Confirmation
      state={props.state}
      approval={props.approved === undefined ? { id: "1" } : { id: "1", approved: props.approved }}
      className="w-[400px]"
    >
      <ConfirmationTitle>
        <ConfirmationRequest>Apagar a pasta dist/ do pacote ui?</ConfirmationRequest>
        <ConfirmationAccepted>Permitido: a pasta dist/ foi apagada.</ConfirmationAccepted>
        <ConfirmationRejected>Negado: nada foi apagado.</ConfirmationRejected>
      </ConfirmationTitle>
      <ConfirmationActions>
        <ConfirmationAction variant="outline">Negar</ConfirmationAction>
        <ConfirmationAction>Permitir</ConfirmationAction>
      </ConfirmationActions>
    </Confirmation>
  );
}

export const Requested: Story = {
  args: { state: "approval-requested" },
  render: () => <DeleteDist state="approval-requested" />,
};

export const Accepted: Story = {
  args: { state: "approval-responded" },
  render: () => <DeleteDist state="approval-responded" approved />,
};

export const Rejected: Story = {
  args: { state: "approval-responded" },
  render: () => <DeleteDist state="approval-responded" approved={false} />,
};
