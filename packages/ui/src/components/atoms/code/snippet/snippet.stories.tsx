import type { Meta, StoryObj } from "@storybook/react-vite";
import { Snippet, SnippetCopyButton } from "./snippet";

const meta = {
  title: "Flowtomic UI/Atoms/Code/Snippet",
  component: Snippet,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["inline", "multiline"],
    },
    showCopyButton: {
      control: "boolean",
    },
    children: {
      control: "text",
    },
  },
} satisfies Meta<typeof Snippet>;

export default meta;
type Story = StoryObj<typeof meta>;

const inlineCode = "npm install @flowtomic/ui";
const multilineCode = `npm install @flowtomic/ui
npm install @flowtomic/logic
npm install @flowtomic/styles`;

export const Inline: Story = {
  args: {
    children: inlineCode,
    variant: "inline",
  },
};

export const Multiline: Story = {
  args: {
    children: multilineCode,
    variant: "multiline",
  },
};

export const InlineWithCopyButton: Story = {
  render: () => (
    <Snippet variant="inline">
      {inlineCode}
      <SnippetCopyButton />
    </Snippet>
  ),
};

export const MultilineWithCopyButton: Story = {
  render: () => (
    <Snippet variant="multiline">
      {multilineCode}
      <SnippetCopyButton />
    </Snippet>
  ),
};

export const CustomCopyButton: Story = {
  render: () => (
    <Snippet variant="multiline">
      {multilineCode}
      <SnippetCopyButton />
    </Snippet>
  ),
};

export const InlineInText: Story = {
  render: () => (
    <div className="space-y-4">
      <p>
        Para instalar o Flowtomic, execute o comando{" "}
        <Snippet variant="inline">npm install @flowtomic/ui</Snippet> no terminal.
      </p>
      <p>
        Ou use o CLI: <Snippet variant="inline">npx flowtomic@latest init</Snippet>
      </p>
    </div>
  ),
  parameters: {
    layout: "padded",
  },
};

export const LongMultiline: Story = {
  args: {
    children: `function greet(name: string) {
  return \`Hello, \${name}!\`;
}

const message = greet("World");
console.log(message);`,
    variant: "multiline",
    showCopyButton: true,
  },
  parameters: {
    layout: "padded",
  },
};

export const JSONSnippet: Story = {
  args: {
    children: JSON.stringify({ name: "Flowtomic", version: "1.0.0", type: "library" }, null, 2),
    variant: "multiline",
    showCopyButton: true,
  },
  parameters: {
    layout: "padded",
  },
};
