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
  MessageResponse,
} from "./message";

const meta = {
  title: "Flowtomic UI/Molecules/Data Display/Message",
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

// MessageResponse Stories
const messageResponseMeta = {
  title: "Flowtomic UI/Molecules/Data Display/Message/MessageResponse",
  component: MessageResponse,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof MessageResponse>;

export const MessageResponseDefault: StoryObj<typeof messageResponseMeta> = {
  render: () => (
    <div className="w-full max-w-2xl">
      <MessageResponse>
        {`# Heading 1

This is a **bold** text and this is *italic* text.

## Heading 2

Here's a list:
- Item 1
- Item 2
- Item 3

### Code Example

Here's some inline code: \`const x = 10;\`

And a code block:

\`\`\`typescript
function greet(name: string) {
  return \`Hello, \${name}!\`;
}
\`\`\`

### Links

Check out [Flowtomic](https://flowtomic.dev) for more components.

### Blockquote

> This is a blockquote with some important information.`}
      </MessageResponse>
    </div>
  ),
};

export const MessageResponseWithCode: StoryObj<typeof messageResponseMeta> = {
  render: () => (
    <div className="w-full max-w-2xl">
      <MessageResponse>
        {`# Code Examples

## JavaScript

\`\`\`javascript
const data = {
  name: "Flowtomic",
  version: "0.1.15",
};

console.log(data);
\`\`\`

## TypeScript

\`\`\`typescript
interface User {
  id: number;
  name: string;
  email: string;
}

const user: User = {
  id: 1,
  name: "John Doe",
  email: "john@example.com",
};
\`\`\`

## Python

\`\`\`python
def greet(name: str) -> str:
    return f"Hello, {name}!"

print(greet("World"))
\`\`\``}
      </MessageResponse>
    </div>
  ),
};

export const MessageResponseWithMath: StoryObj<typeof messageResponseMeta> = {
  render: () => (
    <div className="w-full max-w-2xl">
      <MessageResponse>
        {`# Mathematical Formulas

## Inline Math

The quadratic formula is $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$

## Block Math

$$
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
$$

## Complex Formula

$$
\\sum_{n=1}^{\\infty} \\frac{1}{n^2} = \\frac{\\pi^2}{6}
$$`}
      </MessageResponse>
    </div>
  ),
};

export const MessageResponseWithTable: StoryObj<typeof messageResponseMeta> = {
  render: () => (
    <div className="w-full max-w-2xl">
      <MessageResponse>
        {`# Data Table

| Component | Type | Status |
|-----------|------|--------|
| Button | Atom | ✅ Ready |
| Card | Atom | ✅ Ready |
| DataTable | Molecule | ✅ Ready |
| Dashboard | Organism | 🚧 In Progress |

## Features

- **Markdown Support**: Full GitHub Flavored Markdown
- **Code Highlighting**: Syntax highlighting with Shiki
- **Math Support**: LaTeX formulas with KaTeX
- **Security**: Hardened against XSS attacks`}
      </MessageResponse>
    </div>
  ),
};

export const MessageResponseStreaming: StoryObj<typeof messageResponseMeta> = {
  render: () => (
    <div className="w-full max-w-2xl">
      <MessageResponse>
        {`# Streaming Response

This demonstrates how **incomplete markdown tokens** are handled during streaming.

## Incomplete Tokens

When streaming, you might see:
- Incomplete **bold formatting
- Incomplete *italic* formatting
- Incomplete \`code blocks
- Incomplete [links

The component automatically handles these cases to prevent broken rendering.`}
      </MessageResponse>
    </div>
  ),
};

export const MessageResponseWithoutParsing: StoryObj<typeof messageResponseMeta> = {
  render: () => (
    <div className="w-full max-w-2xl">
      <MessageResponse parseIncompleteMarkdown={false}>
        {`# Without Incomplete Parsing

This example shows the component with \`parseIncompleteMarkdown\` disabled.

**Note**: This is useful when you want to display raw markdown or handle parsing yourself.`}
      </MessageResponse>
    </div>
  ),
};

export const MessageResponseInMessage: StoryObj<typeof meta> = {
  render: () => (
    <Message from="assistant">
      <MessageContent>
        <MessageResponse>
          {`# AI Response Example

This is how **MessageResponse** works inside a **Message** component.

## Features

- ✅ Streaming support
- ✅ Code highlighting
- ✅ Math formulas
- ✅ Tables and lists
- ✅ Security hardened

\`\`\`typescript
const response = <MessageResponse>Hello, World!</MessageResponse>;
\`\`\``}
        </MessageResponse>
      </MessageContent>
    </Message>
  ),
};
