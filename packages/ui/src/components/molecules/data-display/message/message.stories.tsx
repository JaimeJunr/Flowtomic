import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Message,
  MessageAction,
  MessageActions,
  MessageAttachment,
  MessageAttachments,
  MessageBranch,
  MessageBranchContent,
  MessageBranchNext,
  MessageBranchPage,
  MessageBranchPrevious,
  MessageBranchSelector,
  MessageContent,
} from "./message";

const meta = {
  title: "Flowtomic UI/Molecules/DataDisplay/Message",
  component: Message,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Message>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UserMessage: Story = {
  render: () => (
    <Message from="user">
      <MessageContent>
        <p>This is a user message</p>
      </MessageContent>
    </Message>
  ),
};

export const AssistantMessage: Story = {
  render: () => (
    <Message from="assistant">
      <MessageContent>
        <p>This is an assistant message</p>
      </MessageContent>
    </Message>
  ),
};

export const WithActions: Story = {
  render: () => (
    <Message from="assistant">
      <MessageContent>
        <p>Message with actions</p>
      </MessageContent>
      <MessageActions>
        <MessageAction tooltip="Copy">Copy</MessageAction>
        <MessageAction tooltip="Edit">Edit</MessageAction>
      </MessageActions>
    </Message>
  ),
};

export const WithAttachments: Story = {
  render: () => (
    <Message from="user">
      <MessageContent>
        <p>Message with attachment</p>
      </MessageContent>
      <MessageAttachments>
        <MessageAttachment
          data={{
            type: "file",
            url: "https://via.placeholder.com/100",
            mediaType: "image/png",
            filename: "image.png",
          }}
        />
      </MessageAttachments>
    </Message>
  ),
};

export const WithBranches: Story = {
  render: () => (
    <Message from="assistant">
      <MessageBranch>
        <MessageBranchContent>
          <MessageContent>
            <p>Branch 1 content</p>
          </MessageContent>
          <MessageContent>
            <p>Branch 2 content</p>
          </MessageContent>
        </MessageBranchContent>
        <MessageBranchSelector from="assistant">
          <MessageBranchPrevious />
          <MessageBranchPage />
          <MessageBranchNext />
        </MessageBranchSelector>
      </MessageBranch>
    </Message>
  ),
};
