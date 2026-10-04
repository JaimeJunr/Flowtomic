import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Suggestion, Suggestions } from "./suggestion";

const meta = {
  title: "Flowtomic UI/Molecules/Data Display/Suggestion",
  component: Suggestions,
  parameters: {
    layout: "centered",
    docs: { description: { component: "Próximas perguntas depois de consultar o DataTable." } },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Suggestions>;
export default meta;
type Story = StoryObj<typeof meta>;

const sugestoes = [
  "Mostrar o código do cabeçalho",
  "E a busca, tem label?",
  "Rodar os testes do DataTable",
];
export const Default: Story = {
  name: "Próximas perguntas",
  render: () => (
    <div className="w-[680px] max-w-[calc(100vw-2rem)]">
      <Suggestions>
        {sugestoes.map((suggestion) => (
          <Suggestion key={suggestion} suggestion={suggestion} />
        ))}
      </Suggestions>
    </div>
  ),
};
function SuggestionsExample() {
  const [selecionada, setSelecionada] = useState("");
  return (
    <div className="w-[680px] max-w-[calc(100vw-2rem)] space-y-4">
      <Suggestions>
        {sugestoes.map((suggestion) => (
          <Suggestion key={suggestion} suggestion={suggestion} onClick={setSelecionada} />
        ))}
      </Suggestions>
      <output className="text-muted-foreground text-[13px]">
        {selecionada ? `Pergunta enviada: ${selecionada}` : "Escolha o que consultar em seguida."}
      </output>
    </div>
  );
}
export const WithOnClick: Story = {
  name: "Selecionar uma pergunta",
  render: () => <SuggestionsExample />,
};

const pedidos = [
  { rotulo: "Ordenar tabela pelo teclado", pedido: "Como faço o DataTable ordenar pelo teclado?" },
  {
    rotulo: "Trocar a cor da marca",
    pedido: "Quais tokens do theme.css eu mudo para trocar a cor da marca?",
  },
  {
    rotulo: "Montar um block de login",
    pedido: "Monte um block de login com os componentes que já existem",
  },
  { rotulo: "O que falta testar", pedido: "Quais componentes ainda não têm teste?" },
];

export const EstadoVazio: Story = {
  name: "Estado vazio (quebra linha)",
  render: () => (
    <div className="w-[560px] max-w-[calc(100vw-2rem)]">
      <Suggestions layout="wrap">
        {pedidos.map(({ rotulo, pedido }) => (
          <Suggestion key={rotulo} suggestion={pedido}>
            {rotulo}
          </Suggestion>
        ))}
      </Suggestions>
    </div>
  ),
};
