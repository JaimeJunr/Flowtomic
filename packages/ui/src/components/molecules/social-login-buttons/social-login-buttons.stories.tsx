import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { SocialLoginButtons } from "./social-login-buttons";

const meta = {
  title: "Flowtomic UI/Molecules/SocialLoginButtons",
  component: SocialLoginButtons,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    dividerText: {
      control: "text",
    },
  },
} satisfies Meta<typeof SocialLoginButtons>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onGoogleClick: fn(),
    onAppleClick: fn(),
  },
};

export const CustomDivider: Story = {
  args: {
    onGoogleClick: fn(),
    onAppleClick: fn(),
    dividerText: "ou continue com",
  },
};

export const GoogleOnly: Story = {
  args: {
    onGoogleClick: fn(),
  },
};

export const AppleOnly: Story = {
  args: {
    onAppleClick: fn(),
  },
};
