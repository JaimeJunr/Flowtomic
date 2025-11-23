import type { Meta, StoryObj } from "@storybook/react-vite";
import { Suggestion, Suggestions } from "./suggestion";

const meta = {
  title: "Flowtomic UI/Molecules/DataDisplay/Suggestion",
  component: Suggestions,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Suggestions>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleSuggestions = [
  "What is React?",
  "How to use hooks?",
  "Best practices for TypeScript",
  "CSS Grid vs Flexbox",
  "Node.js performance tips",
];

export const Default: Story = {
  render: () => (
    <Suggestions className="w-[500px]">
      {sampleSuggestions.map((suggestion) => (
        <Suggestion key={suggestion} suggestion={suggestion} />
      ))}
    </Suggestions>
  ),
};

export const WithOnClick: Story = {
  render: () => (
    <Suggestions className="w-[500px]">
      {sampleSuggestions.map((suggestion) => (
        <Suggestion
          key={suggestion}
          suggestion={suggestion}
          onClick={(s) => {
            console.log("Clicked:", s);
          }}
        />
      ))}
    </Suggestions>
  ),
};
