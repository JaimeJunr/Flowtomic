import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../../atoms";
import {
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorEmpty,
  ModelSelectorGroup,
  ModelSelectorInput,
  ModelSelectorItem,
  ModelSelectorList,
  ModelSelectorLogo,
  ModelSelectorName,
  ModelSelectorTrigger,
} from "./model-selector";

const meta = {
  title: "Flowtomic UI/Organisms/ModelSelector",
  component: ModelSelector,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ModelSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <ModelSelector>
      <ModelSelectorTrigger asChild>
        <Button>Selecionar modelo</Button>
      </ModelSelectorTrigger>
      <ModelSelectorContent>
        <ModelSelectorInput placeholder="Buscar modelo..." />
        <ModelSelectorList>
          <ModelSelectorEmpty>Nenhum modelo encontrado.</ModelSelectorEmpty>
          <ModelSelectorGroup heading="Mais usados">
            <ModelSelectorItem>claude-sonnet-5</ModelSelectorItem>
            <ModelSelectorItem>claude-opus-5-5</ModelSelectorItem>
            <ModelSelectorItem>gpt-6</ModelSelectorItem>
          </ModelSelectorGroup>
        </ModelSelectorList>
      </ModelSelectorContent>
    </ModelSelector>
  ),
};

/** Sem `src`, o logo é a inicial do provedor: nada é buscado fora do app. */
export const ComLogos: Story = {
  render: () => (
    <ModelSelector defaultOpen>
      <ModelSelectorTrigger asChild>
        <Button>Selecionar modelo</Button>
      </ModelSelectorTrigger>
      <ModelSelectorContent>
        <ModelSelectorInput placeholder="Buscar modelo..." />
        <ModelSelectorList>
          <ModelSelectorEmpty>Nenhum modelo encontrado.</ModelSelectorEmpty>
          <ModelSelectorGroup heading="Anthropic">
            <ModelSelectorItem>
              <ModelSelectorLogo provider="anthropic" />
              <ModelSelectorName>claude-sonnet-5</ModelSelectorName>
            </ModelSelectorItem>
            <ModelSelectorItem>
              <ModelSelectorLogo provider="anthropic" />
              <ModelSelectorName>claude-opus-5-5</ModelSelectorName>
            </ModelSelectorItem>
          </ModelSelectorGroup>
          <ModelSelectorGroup heading="OpenAI">
            <ModelSelectorItem>
              <ModelSelectorLogo provider="openai" />
              <ModelSelectorName>gpt-6</ModelSelectorName>
            </ModelSelectorItem>
          </ModelSelectorGroup>
        </ModelSelectorList>
      </ModelSelectorContent>
    </ModelSelector>
  ),
};
