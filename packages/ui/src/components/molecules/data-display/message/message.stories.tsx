import type { Meta, StoryObj } from "@storybook/react-vite";
import { Copy, RotateCcw } from "lucide-react";
import { useState } from "react";
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
    docs: {
      description: {
        component: "Uma conversa sobre ordenação, busca e testes dos componentes do Flowtomic.",
      },
    },
  },
  tags: ["autodocs"],
  args: { from: "assistant" },
  argTypes: {
    from: {
      control: "select",
      options: ["user", "assistant", "system"],
      description: "Papel de quem enviou a mensagem.",
    },
  },
} satisfies Meta<typeof Message>;
export default meta;
type Story = StoryObj<typeof meta>;

const pergunta = "Como faço o DataTable ordenar pelo teclado?";
const resposta =
  "Use um botão no cabeçalho da coluna. Assim a pessoa alcança a ordenação com Tab e a ativa com Enter ou Espaço.";
const largura = "w-[620px] max-w-[calc(100vw-2rem)]";

export const Default: Story = {
  name: "Conversa sobre o DataTable",
  render: () => (
    <div className={`${largura} space-y-6`}>
      <Message from="user">
        <MessageContent>{pergunta}</MessageContent>
      </Message>
      <Message from="assistant">
        <MessageContent>{resposta}</MessageContent>
      </Message>
    </div>
  ),
};
export const UserMessage: Story = {
  name: "Pergunta do usuário",
  args: { from: "user" },
  render: () => (
    <div className={largura}>
      <Message from="user">
        <MessageContent>{pergunta}</MessageContent>
      </Message>
    </div>
  ),
};
export const AssistantMessage: Story = {
  name: "Resposta do assistente",
  render: () => (
    <div className={largura}>
      <Message from="assistant">
        <MessageContent>{resposta}</MessageContent>
      </Message>
    </div>
  ),
};

function ActionsExample() {
  const [texto, setTexto] = useState(resposta);
  const [copiado, setCopiado] = useState(false);
  return (
    <div className={largura}>
      <Message from="assistant">
        <div className="space-y-2">
          <MessageContent>{texto}</MessageContent>
          <MessageActions>
            <MessageAction
              tooltip={copiado ? "Resposta copiada" : "Copiar resposta"}
              onClick={async () => {
                await navigator.clipboard.writeText(texto);
                setCopiado(true);
              }}
            >
              <Copy className="size-4" />
            </MessageAction>
            <MessageAction
              tooltip="Gerar outra versão"
              onClick={() => {
                setTexto(
                  'Coloque a ação de ordenar dentro de um Button com variant="ghost". Confira o nome acessível do botão e a ordem do foco no teste.'
                );
                setCopiado(false);
              }}
            >
              <RotateCcw className="size-4" />
            </MessageAction>
          </MessageActions>
        </div>
      </Message>
    </div>
  );
}
export const WithActions: Story = { name: "Ações da resposta", render: () => <ActionsExample /> };

function AttachmentsExample() {
  const [anexado, setAnexado] = useState(true);
  return (
    <div className={largura}>
      <Message from="user">
        <div className="space-y-3">
          <MessageContent>
            A busca também precisa de um nome acessível?{" "}
            {anexado ? "Anexei os testes atuais." : "Removi o anexo para revisar os testes."}
          </MessageContent>
          <MessageAttachments>
            {anexado && (
              <MessageAttachment
                data={{
                  type: "file",
                  url: "https://github.com/JaimeJunr/Flowtomic/blob/main/packages/ui/src/components/molecules/data-display/data-table/data-table.test.tsx",
                  mediaType: "text/plain",
                  filename: "data-table.test.tsx",
                }}
                onRemove={() => setAnexado(false)}
              />
            )}
          </MessageAttachments>
        </div>
      </Message>
    </div>
  );
}
export const WithAttachments: Story = {
  name: "Arquivo de teste anexado",
  args: { from: "user" },
  render: () => <AttachmentsExample />,
};

export const WithBranches: Story = {
  name: "Versões da resposta",
  render: () => (
    <div className={largura}>
      <Message from="assistant">
        <MessageBranch defaultBranch={1}>
          <MessageBranchContent>
            <MessageContent key="cabecalho">
              Use um botão no cabeçalho da coluna para ordenar.
            </MessageContent>
            <MessageContent key="teclado">{resposta}</MessageContent>
            <MessageContent key="teste">
              No teste, avance o foco com Tab, pressione Enter e confira a ordem das linhas. Depois
              verifique se a busca tem um nome acessível.
            </MessageContent>
          </MessageBranchContent>
          <MessageBranchSelector from="assistant">
            <MessageBranchPrevious />
            <MessageBranchPage />
            <MessageBranchNext />
          </MessageBranchSelector>
        </MessageBranch>
      </Message>
    </div>
  ),
};

export const MessageResponseDefault: Story = {
  name: "Resposta com Markdown",
  render: () => (
    <div className={largura}>
      <MessageResponse>{`## Ordenação pelo teclado

O cabeçalho precisa de **uma ação com nome acessível**. Use um botão e deixe o foco visível.

1. Localize a coluna em \`data-table.tsx\`.
2. Use \`Button\` com \`variant="ghost"\` no cabeçalho.
3. Confira Tab e Enter em \`data-table.test.tsx\`.

Veja os [componentes disponíveis](https://github.com/JaimeJunr/Flowtomic/blob/main/docs/componentes/molecules.md).

> A busca também precisa de um nome acessível. Placeholder sozinho não substitui o rótulo.`}</MessageResponse>
    </div>
  ),
};
export const MessageResponseWithCode: Story = {
  name: "Código do cabeçalho",
  render: () => (
    <div className={largura}>
      <MessageResponse>{`## Ação de ordenar

Use o botão do Flowtomic dentro da definição da coluna:

\`\`\`tsx
header: ({ column }) => (
  <Button
    variant="ghost"
    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
  >
    Nome
  </Button>
)
\`\`\`

Execute o teste pelo pacote UI:

\`\`\`bash
bunx vitest run src/components/molecules/data-display/data-table/data-table.test.tsx
\`\`\``}</MessageResponse>
    </div>
  ),
};
export const MessageResponseWithMath: Story = {
  name: "Cálculo da cobertura",
  render: () => (
    <div className={largura}>
      <MessageResponse>{`## Cobertura dos testes

A cobertura de linhas relaciona as linhas executadas às linhas instrumentadas:

$$
C = \\frac{L_{executadas}}{L_{instrumentadas}} \\times 100
$$

Se o teste executar $18$ de $24$ linhas, a cobertura será $75\\%$. Confira também os ramos de ordenação crescente e decrescente.`}</MessageResponse>
    </div>
  ),
};
export const MessageResponseWithTable: Story = {
  name: "Componentes consultados",
  render: () => (
    <div className={largura}>
      <MessageResponse>{`## O que revisar no DataTable

| Componente | Categoria | Verificação |
|------------|-----------|-------------|
| Button | Átomo | Nome da ação de ordenar |
| Input | Átomo | Rótulo da busca |
| DataTable | Molécula | Ordem das linhas após Enter |

Use os tokens de \`DESIGN.md\` para fundo, texto e foco. Os exemplos ficam em \`docs/componentes/molecules.md\`.`}</MessageResponse>
    </div>
  ),
};
export const MessageResponseStreaming: Story = {
  name: "Resposta sendo escrita",
  render: () => (
    <div className={largura}>
      <MessageResponse>{`## Conferindo o cabeçalho

O assistente está consultando \`data-table.tsx\`.

Para ordenar pelo teclado, use **um botão no cabeçalho`}</MessageResponse>
    </div>
  ),
};
export const MessageResponseWithoutParsing: Story = {
  name: "Markdown sem completar tokens",
  render: () => (
    <div className={largura}>
      <MessageResponse parseIncompleteMarkdown={false}>{`## Resposta recebida

O texto abaixo mantém os delimitadores como chegaram:

Confira **o nome acessível do botão`}</MessageResponse>
    </div>
  ),
};
export const MessageResponseInMessage: Story = {
  name: "Resposta na conversa",
  render: () => (
    <div className={largura}>
      <Message from="assistant">
        <MessageContent>
          <MessageResponse>{`Use **Button** no cabeçalho para que Tab e Enter funcionem com o comportamento nativo do navegador.

Depois, abra \`data-table.test.tsx\` e confira:

- O nome acessível da ação de ordenar.
- A ordem das linhas depois de Enter.
- O rótulo da busca e a mensagem quando o filtro não encontra linhas.

A referência visual está em [DESIGN.md](https://github.com/JaimeJunr/Flowtomic/blob/main/DESIGN.md).`}</MessageResponse>
        </MessageContent>
      </Message>
    </div>
  ),
};
