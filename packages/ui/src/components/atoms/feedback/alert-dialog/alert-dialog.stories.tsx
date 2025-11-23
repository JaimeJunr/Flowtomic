import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { Button } from "../../actions/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./alert-dialog";

const meta = {
  title: "Flowtomic UI/Atoms/Feedback/AlertDialog",
  component: AlertDialog,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    animation: {
      control: "select",
      options: ["depth", "bottom", "top", "left", "right", "center", "3d"],
      description: "Tipo de animação do AlertDialog",
      table: {
        type: { summary: "depth | bottom | top | left | right | center | 3d" },
        defaultValue: { summary: "depth" },
      },
    },
  },
} satisfies Meta<typeof AlertDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button>Abrir Diálogo</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Título</AlertDialogTitle>
          <AlertDialogDescription>Descrição do diálogo</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction>Confirmar</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
};

export const WithCustomActions: Story = {
  render: (args) => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline">Abrir Diálogo</Button>
      </AlertDialogTrigger>
      <AlertDialogContent animation={args.animation}>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar Ação</AlertDialogTitle>
          <AlertDialogDescription>
            Você tem certeza que deseja prosseguir com esta ação?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={fn()}>Não, cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={fn()}>Sim, continuar</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
  args: {
    animation: "depth",
  },
};

export const SimpleMessage: Story = {
  render: (args) => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button>Mostrar Alerta</Button>
      </AlertDialogTrigger>
      <AlertDialogContent animation={args.animation}>
        <AlertDialogHeader>
          <AlertDialogTitle>Aviso</AlertDialogTitle>
          <AlertDialogDescription>Suas alterações foram salvas com sucesso.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={fn()}>OK</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
  args: {
    animation: "depth",
  },
};

export const AnimationDepth: Story = {
  name: "Animação: Profundidade (Depth)",
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button>Efeito de Profundidade</Button>
      </AlertDialogTrigger>
      <AlertDialogContent animation="depth">
        <AlertDialogHeader>
          <AlertDialogTitle>Efeito de Profundidade</AlertDialogTitle>
          <AlertDialogDescription>
            Este diálogo surge do fundo com efeito de profundidade usando zoom e fade.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={fn()}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={fn()}>Confirmar</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
};

export const AnimationBottom: Story = {
  name: "Animação: De Baixo (Bottom)",
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button>Deslizar de Baixo</Button>
      </AlertDialogTrigger>
      <AlertDialogContent animation="bottom">
        <AlertDialogHeader>
          <AlertDialogTitle>Desliza de Baixo</AlertDialogTitle>
          <AlertDialogDescription>
            Este diálogo desliza de baixo para cima com animação suave.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={fn()}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={fn()}>Confirmar</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
};

export const AnimationTop: Story = {
  name: "Animação: De Cima (Top)",
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button>Deslizar de Cima</Button>
      </AlertDialogTrigger>
      <AlertDialogContent animation="top">
        <AlertDialogHeader>
          <AlertDialogTitle>Desliza de Cima</AlertDialogTitle>
          <AlertDialogDescription>
            Este diálogo desliza de cima para baixo com animação suave.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={fn()}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={fn()}>Confirmar</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
};

export const AnimationLeft: Story = {
  name: "Animação: Da Esquerda (Left)",
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button>Deslizar da Esquerda</Button>
      </AlertDialogTrigger>
      <AlertDialogContent animation="left">
        <AlertDialogHeader>
          <AlertDialogTitle>Desliza da Esquerda</AlertDialogTitle>
          <AlertDialogDescription>
            Este diálogo desliza da esquerda para o centro com animação suave.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={fn()}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={fn()}>Confirmar</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
};

export const AnimationRight: Story = {
  name: "Animação: Da Direita (Right)",
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button>Deslizar da Direita</Button>
      </AlertDialogTrigger>
      <AlertDialogContent animation="right">
        <AlertDialogHeader>
          <AlertDialogTitle>Desliza da Direita</AlertDialogTitle>
          <AlertDialogDescription>
            Este diálogo desliza da direita para o centro com animação suave.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={fn()}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={fn()}>Confirmar</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
};

export const AnimationCenter: Story = {
  name: "Animação: Centro (Center)",
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button>Zoom do Centro</Button>
      </AlertDialogTrigger>
      <AlertDialogContent animation="center">
        <AlertDialogHeader>
          <AlertDialogTitle>Zoom do Centro</AlertDialogTitle>
          <AlertDialogDescription>
            Este diálogo faz zoom do centro sem deslizar, apenas com efeito de escala.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={fn()}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={fn()}>Confirmar</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
};

export const Animation3D: Story = {
  name: "Animação: 3D com Perspectiva",
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button>Animação 3D</Button>
      </AlertDialogTrigger>
      <AlertDialogContent animation="3d" backdropBlur showCloseButton>
        <AlertDialogHeader>
          <AlertDialogTitle>Animação 3D Premium</AlertDialogTitle>
          <AlertDialogDescription>
            Este diálogo usa animações 3D com perspectiva, backdrop blur e efeitos de profundidade.
            Perfeito para experiências premium e interações sofisticadas.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={fn()}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={fn()}>Confirmar</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
};

export const Animation3DWithoutBlur: Story = {
  name: "Animação: 3D sem Backdrop Blur",
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button>3D sem Blur</Button>
      </AlertDialogTrigger>
      <AlertDialogContent animation="3d" backdropBlur={false} showCloseButton>
        <AlertDialogHeader>
          <AlertDialogTitle>3D sem Backdrop Blur</AlertDialogTitle>
          <AlertDialogDescription>
            Versão 3D sem backdrop blur para melhor performance em dispositivos mais antigos.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={fn()}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={fn()}>Confirmar</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
};

export const NoKnownUsage: Story = {
  render: () => (
    <div className="p-4 text-sm text-muted-foreground">
      Este componente ainda não possui uso conhecido em componentes mais complexos.
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Este componente ainda não possui uso conhecido em molecules ou organisms.",
      },
    },
  },
};
