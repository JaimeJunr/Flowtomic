import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { SponsoredCard, type SponsoredCardProps } from "./sponsored-card";

const ad: SponsoredCardProps = {
  advertiser: "Constelação",
  title: "API compatível com OpenAI",
  body: "Crie uma chave e use vários modelos com seu saldo da Constelação.",
  href: "https://github.com/JaimeJunr/Flowtomic",
  displayHost: "constelacaoai.com.br",
};

const actions = [
  { label: "Por que estou vendo isto?", onSelect: () => {} },
  { label: "Ocultar anúncio", onSelect: () => {} },
  { label: "Denunciar anúncio", onSelect: () => {}, separated: true },
];

const meta = {
  title: "Flowtomic UI/Molecules/Data Display/Sponsored Card",
  component: SponsoredCard,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Anúncio fora do conteúdo, abaixo da resposta de um chat. O rótulo vem antes de tudo, quem paga vem primeiro e os controles do app ficam num menu de opções. Cores em `--sponsored-*`, separadas da marca.",
      },
    },
  },
  args: { ...ad, actions },
  decorators: [
    (Story) => (
      <div className="max-w-xl">
        <Story />
      </div>
    ),
  ],
  tags: ["autodocs"],
} satisfies Meta<typeof SponsoredCard>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Tab: Story = { name: "Aba, aberto" };

export const TabCollapsible: Story = {
  name: "Aba, recolhível",
  args: { collapsible: true },
};

export const Advertiser: Story = {
  name: "Anunciante com selo ao lado",
  args: { variant: "advertiser" },
};

export const Bar: Story = {
  name: "Barra recolhida",
  args: { variant: "bar", collapsible: true },
};

export const Footnote: Story = {
  name: "Rodapé",
  args: { variant: "footnote" },
};

export const WithLogo: Story = {
  name: "Com logo do anunciante",
  args: {
    logoSrc: "https://github.com/JaimeJunr.png",
    advertiser: "Flowtomic",
    displayHost: "github.com/JaimeJunr/Flowtomic",
  },
};

export const WithExplanation: Story = {
  name: "Com a explicação do app dentro",
  args: {
    children: (
      <p>
        Você vê isto porque o modo com anúncio está ligado e o assunto da conversa foi classificado
        como <strong>Tecnologia</strong>. O anúncio não altera a resposta do modelo.
      </p>
    ),
  },
};

/** O app decide o aberto: só o anúncio da resposta mais recente fica aberto. */
export const OnlyLatestOpen: Story = {
  name: "Conversa: só o mais recente aberto",
  render: (args) => {
    const [openIndex, setOpenIndex] = useState(1);
    return (
      <div className="grid gap-6">
        {[0, 1].map((index) => (
          <div key={index} className="grid gap-3">
            <p className="text-sm">
              {index === 0
                ? "A gente só se cumprimentou."
                : "Crie uma chave em Chaves de API e troque a base URL do seu cliente."}
            </p>
            <SponsoredCard
              {...args}
              collapsible
              open={openIndex === index}
              onOpenChange={(open) => setOpenIndex(open ? index : -1)}
            />
          </div>
        ))}
      </div>
    );
  },
};
