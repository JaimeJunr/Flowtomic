import type { Meta, StoryObj } from "@storybook/react-vite";
import type * as React from "react";
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
            Este tooltip segue o mouse e ajusta sua posição automaticamente para não ultrapassar as
            bordas da tela. Funciona perfeitamente mesmo com conteúdo longo.
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
      word: _word,
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
          O Flowtomic é um sistema de design moderno que oferece componentes UI prontos para uso e
          hooks headless para máxima flexibilidade. Construído sobre{" "}
          <TooltipWord
            word="Radix UI"
            content={
              <div className="space-y-1">
                <p className="font-semibold">Radix UI</p>
                <p className="text-xs text-muted-foreground">
                  Biblioteca de componentes primitivos acessíveis e sem estilização. O Flowtomic usa
                  Radix UI como base para garantir acessibilidade (WAI-ARIA compliant) em todos os
                  componentes interativos.
                </p>
              </div>
            }
          >
            Radix UI
          </TooltipWord>{" "}
          e inspirado em shadcn/ui, o Flowtomic permite que você acelere seu desenvolvimento
          mantendo controle total sobre customização. O Radix UI fornece a base sólida de
          acessibilidade, enquanto o Flowtomic adiciona estilização, lógica e documentação completa.
        </p>

        <p className="text-base leading-relaxed">
          O sistema foi desenvolvido seguindo os princípios de{" "}
          <TooltipWord
            word="reutilização"
            content={
              <div className="space-y-1">
                <p className="font-semibold">Reutilização de Código</p>
                <p className="text-xs text-muted-foreground">
                  O Flowtomic segue princípios como DRY (Don't Repeat Yourself) e SOLID para
                  promover reutilização, encapsulamento e abstração. Oferece 54 atoms, 36 molecules,
                  23 organisms, 11 hooks headless e 3 blocks pré-construídos.
                </p>
              </div>
            }
          >
            reutilização
          </TooltipWord>
          . Em vez de recriar as mesmas lógicas e componentes em cada projeto, o Flowtomic fornece
          uma solução reutilizável com componentes prontos ou customizáveis. Isso acelera o
          desenvolvimento seguindo as melhores práticas de engenharia de software, promovendo
          consistência e qualidade em projetos React/TypeScript.
        </p>

        <p className="text-base leading-relaxed">
          O Flowtomic oferece uma{" "}
          <TooltipWord
            word="arquitetura separada"
            content={
              <div className="space-y-1">
                <p className="font-semibold">Separação UI e Lógica</p>
                <p className="text-xs text-muted-foreground">
                  O Flowtomic separa completamente UI (@flowtomic/ui) e lógica (@flowtomic/logic).
                  Hooks headless fornecem apenas lógica, formatação e props de acessibilidade, sem
                  qualquer markup ou estilos. Isso permite máxima flexibilidade e reutilização.
                </p>
              </div>
            }
          >
            arquitetura separada
          </TooltipWord>{" "}
          entre UI e lógica. Os componentes UI são focados em apresentação visual, enquanto os hooks
          headless contêm toda a lógica complexa, cálculos e gerenciamento de estado. Essa separação
          permite reutilizar a lógica em qualquer UI customizada, criar designs únicos mantendo a
          lógica consistente, e testar lógica e UI separadamente.
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
