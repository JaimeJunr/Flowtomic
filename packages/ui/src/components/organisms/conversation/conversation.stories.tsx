import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "./conversation";

const meta = {
  title: "Flowtomic UI/Organisms/Conversation",
  component: Conversation,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  // children é obrigatório no tipo do StickToBottom; cada story desenha o seu via render
  args: { children: null },
} satisfies Meta<typeof Conversation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Conversation className="h-[400px]">
      <ConversationContent>
        <div>adiciona o stat-card no dashboard</div>
        <div>Feito — story e barrel export atualizados</div>
        <div>roda `bunx vitest run src/components/atoms/stat-card`?</div>
      </ConversationContent>
      <ConversationScrollButton />
    </Conversation>
  ),
};

export const Empty: Story = {
  render: () => (
    <Conversation className="h-[400px]">
      <ConversationEmptyState />
    </Conversation>
  ),
};

const passos = [
  "adiciona o stat-card no dashboard",
  "Feito — story e barrel export atualizados",
  "roda os testes do stat-card",
  "12 de 12 passando",
  "e o menu de ações, abre pelo teclado?",
  "Abre: Enter e Espaço abrem, Esc fecha e o foco volta para o botão",
  "o tooltip do valor some rápido demais",
  "Subi o atraso para 300 ms, igual ao resto da lib",
  "confere o contraste do texto secundário",
  "4,9:1 no claro e 6,2:1 no escuro, passa AA",
  "abre o PR",
  "PR aberto, CI rodando",
];

export const ConversaLonga: Story = {
  name: "Conversa longa",
  render: () => (
    <Conversation className="h-[400px] border-b border-border">
      <ConversationContent className="gap-4">
        {passos.map((texto, i) => (
          <div key={texto} className={i % 2 === 0 ? "self-end rounded-2xl bg-muted px-4 py-2" : ""}>
            {texto}
          </div>
        ))}
      </ConversationContent>
      <ConversationScrollButton />
    </Conversation>
  ),
};
