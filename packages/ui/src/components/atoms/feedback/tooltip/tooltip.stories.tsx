import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { Button } from "../../actions/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
	TooltipWithMouseFollow,
} from "./tooltip";

const meta = {
  title: "Flowtomic UI/Atoms/Feedback/Tooltip",
  component: Tooltip,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button>Hover me</Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Tooltip</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
};

export const WithLongText: Story = {
  render: () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Hover for long text</Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            This is a longer tooltip text that demonstrates how the tooltip handles multiple lines
            of content.
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
};

export const ArtifactStyle: Story = {
  render: () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon-sm">
            <span className="sr-only">Download</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Download</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Exemplo de uso customizado do Tooltip como no Artifact, usado com botões de ação com ícone e label oculto para acessibilidade.",
      },
    },
  },
};

export const FollowMouse: Story = {
  render: () => (
    <TooltipWithMouseFollow
      content={<p>Este tooltip segue o cursor do mouse com posicionamento inteligente!</p>}
      minWidth={240}
    >
      <Button variant="outline">Hover and move mouse</Button>
    </TooltipWithMouseFollow>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Tooltip com seguimento do mouse e posicionamento inteligente usando React Aria. O tooltip segue o cursor e ajusta sua posição automaticamente para não sair da viewport.",
      },
    },
  },
};

export const FollowMouseWithLongContent: Story = {
  render: () => (
    <TooltipWithMouseFollow
      content={
        <div className="space-y-2">
          <p className="font-semibold">Informações Detalhadas</p>
          <p className="text-xs text-muted-foreground">
            Este tooltip segue o mouse e ajusta sua posição automaticamente para não ultrapassar
            as bordas da tela. Funciona perfeitamente mesmo com conteúdo longo.
          </p>
        </div>
      }
      minWidth={300}
    >
      <Button variant="outline">Hover for detailed info</Button>
    </TooltipWithMouseFollow>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Tooltip com seguimento do mouse e conteúdo longo usando React Aria. Demonstra como o tooltip ajusta sua posição mesmo com muito conteúdo.",
      },
    },
  },
};

export const InteractiveTextExample: Story = {
  render: () => {
    const TooltipWord = ({
      word,
      content,
      children,
    }: {
      word: string;
      content: React.ReactNode;
      children: React.ReactNode;
    }) => (
      <TooltipWithMouseFollow content={content} minWidth={280}>
        <span className="font-semibold text-foreground underline decoration-dotted underline-offset-4 cursor-help">
          {children}
        </span>
      </TooltipWithMouseFollow>
    );

    return (
      <div className="max-w-2xl space-y-4 p-8 bg-background text-foreground">
        <p className="text-base leading-relaxed">
          O Flowtomic começou como uma ideia simples: criar componentes UI reutilizáveis e bem
          documentados. Uma vez que o{" "}
          <TooltipWord
            word="Radix UI"
            content={
              <div className="space-y-1">
                <p className="font-semibold">Radix UI</p>
                <p className="text-xs text-muted-foreground">
                  Biblioteca de componentes primitivos acessíveis e sem estilização. O Flowtomic
                  usa Radix UI como base para garantir acessibilidade em todos os componentes.
                </p>
              </div>
            }
          >
            Radix UI
          </TooltipWord>{" "}
          foi escolhido como base, tivemos que construir toda a camada de estilização e lógica
          sobre ele. O Radix UI em geral é uma excelente biblioteca, mas às vezes precisamos de
          mais controle sobre o comportamento.
        </p>

        <p className="text-base leading-relaxed">
          O sistema foi desenvolvido por{" "}
          <TooltipWord
            word="Jaime"
            content={
              <div className="space-y-1">
                <p className="font-semibold">Jaime</p>
                <p className="text-xs text-muted-foreground">
                  Criador e mantenedor do Flowtomic. Desenvolveu o sistema com foco em
                  reutilização, acessibilidade e documentação completa. Sempre busca melhorar a
                  experiência de desenvolvimento.
                </p>
              </div>
            }
          >
            Jaime
          </TooltipWord>
          . Jaime está trabalhando no projeto há bastante tempo. Ele é um grande ativo para o
          projeto e às vezes tenta implementar funcionalidades de diferentes formas, o que pode
          ser desafiador de gerenciar.
        </p>

        <p className="text-base leading-relaxed">
          Foi então que decidimos criar um{" "}
          <TooltipWord
            word="sistema de design"
            content={
              <div className="space-y-1">
                <p className="font-semibold">Sistema de Design Flowtomic</p>
                <p className="text-xs text-muted-foreground">
                  Um sistema completo de componentes UI baseado em React, TypeScript e Tailwind
                  CSS. Inclui 54 atoms, 24 molecules, 23 organisms, 11 hooks e 3 blocks, todos
                  documentados e testados.
                </p>
              </div>
            }
          >
            sistema de design
          </TooltipWord>
          . Em vez de apenas componentes soltos, começamos a pensar em como usar nossas
          habilidades para construir um futuro melhor para desenvolvimento frontend, com foco em
          qualidade, acessibilidade e experiência do desenvolvedor.
        </p>
      </div>
    );
  },
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        story:
          "Exemplo interativo de texto com tooltips seguindo o mouse. Passe o mouse sobre as palavras em negrito para ver informações detalhadas sobre o Flowtomic.",
      },
    },
  },
};
