import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useState } from "react";
import { Button } from "../../actions/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../display/card";
import { BackdropBlur } from "./backdrop-blur";

const meta = {
  title: "Flowtomic UI/Atoms/Animation/BackdropBlur",
  component: BackdropBlur,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  argTypes: {
    isOpen: {
      control: "boolean",
      description: "Se o backdrop está visível",
    },
    blurIntensity: {
      control: "number",
      description: "Intensidade do blur (px)",
    },
    opacity: {
      control: "number",
      min: 0,
      max: 1,
      step: 0.1,
      description: "Opacidade do backdrop",
    },
    backgroundColor: {
      control: "color",
      description: "Cor de fundo do backdrop",
    },
    duration: {
      control: "number",
      description: "Duração da transição (segundos)",
    },
  },
} satisfies Meta<typeof BackdropBlur>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div className="relative min-h-screen p-8">
        <div className="flex flex-col items-center gap-4">
          <Button onClick={() => setIsOpen(!isOpen)}>{isOpen ? "Fechar" : "Abrir"} Backdrop</Button>
          <Card className="w-80 z-50 relative">
            <CardHeader>
              <CardTitle>Conteúdo</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Conteúdo sobre o backdrop</p>
            </CardContent>
          </Card>
        </div>
        <BackdropBlur isOpen={isOpen} />
      </div>
    );
  },
};

export const CustomBlurIntensity: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div className="relative min-h-screen p-8">
        <div className="flex flex-col items-center gap-4">
          <Button onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? "Fechar" : "Abrir"} (Blur 20px)
          </Button>
          <Card className="w-80 z-50 relative">
            <CardHeader>
              <CardTitle>Blur Intenso</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Este backdrop usa blur de 20px para um efeito mais intenso.
              </p>
            </CardContent>
          </Card>
        </div>
        <BackdropBlur isOpen={isOpen} blurIntensity={20} />
      </div>
    );
  },
};

export const CustomOpacity: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div className="relative min-h-screen p-8">
        <div className="flex flex-col items-center gap-4">
          <Button onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? "Fechar" : "Abrir"} (Opacidade 0.8)
          </Button>
          <Card className="w-80 z-50 relative">
            <CardHeader>
              <CardTitle>Opacidade Alta</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Este backdrop usa opacidade de 0.8 para um efeito mais escuro.
              </p>
            </CardContent>
          </Card>
        </div>
        <BackdropBlur isOpen={isOpen} opacity={0.8} />
      </div>
    );
  },
};

export const CustomColor: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div className="relative min-h-screen p-8 bg-linear-to-br from-blue-500 to-purple-500">
        <div className="flex flex-col items-center gap-4">
          <Button onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? "Fechar" : "Abrir"} (Cor Azul)
          </Button>
          <Card className="w-80 z-50 relative">
            <CardHeader>
              <CardTitle>Backdrop Colorido</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Este backdrop usa cor azul em vez de preto.
              </p>
            </CardContent>
          </Card>
        </div>
        <BackdropBlur isOpen={isOpen} backgroundColor="rgba(59, 130, 246, 0.5)" />
      </div>
    );
  },
};

export const SlowTransition: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div className="relative min-h-screen p-8">
        <div className="flex flex-col items-center gap-4">
          <Button onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? "Fechar" : "Abrir"} (Transição Lenta)
          </Button>
          <Card className="w-80 z-50 relative">
            <CardHeader>
              <CardTitle>Transição Lenta</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Este backdrop usa transição de 1 segundo para um efeito mais suave.
              </p>
            </CardContent>
          </Card>
        </div>
        <BackdropBlur isOpen={isOpen} duration={1} />
      </div>
    );
  },
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
