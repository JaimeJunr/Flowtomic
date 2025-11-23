import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useState } from "react";
import { Button } from "../../actions/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../display/card";
import { Animated3D } from "./animated-3d";

const meta = {
  title: "Flowtomic UI/Atoms/Animation/Animated3D",
  component: Animated3D,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    isOpen: {
      control: "boolean",
      description: "Se a animação está ativa (aberta)",
    },
    initialRotateX: {
      control: "number",
      description: "Rotação inicial em X (graus)",
    },
    initialRotateY: {
      control: "number",
      description: "Rotação inicial em Y (graus)",
    },
    initialTranslateZ: {
      control: "number",
      description: "Profundidade inicial (translateZ em px)",
    },
    initialScale: {
      control: "number",
      description: "Escala inicial",
    },
    initialOpacity: {
      control: "number",
      description: "Opacidade inicial",
    },
    perspective: {
      control: "text",
      description: "Perspectiva CSS (px)",
    },
    disabled: {
      control: "boolean",
      description: "Se deve desabilitar a animação",
    },
  },
} satisfies Meta<typeof Animated3D>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div className="flex flex-col items-center gap-4">
        <Button onClick={() => setIsOpen(!isOpen)}>{isOpen ? "Fechar" : "Abrir"} Animação</Button>
        <Animated3D isOpen={isOpen}>
          <Card className="w-80">
            <CardHeader>
              <CardTitle>Card Animado</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Conteúdo do card</p>
            </CardContent>
          </Card>
        </Animated3D>
      </div>
    );
  },
};

export const WithCustomRotation: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div className="flex flex-col items-center gap-4">
        <Button onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? "Fechar" : "Abrir"} (Rotação 35°)
        </Button>
        <Animated3D isOpen={isOpen} initialRotateX={35}>
          <Card className="w-80">
            <CardHeader>
              <CardTitle>Rotação Customizada</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Este card usa rotação inicial de 35 graus para um efeito mais dramático.
              </p>
            </CardContent>
          </Card>
        </Animated3D>
      </div>
    );
  },
};

export const WithRotationY: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div className="flex flex-col items-center gap-4">
        <Button onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? "Fechar" : "Abrir"} (Rotação Y)
        </Button>
        <Animated3D isOpen={isOpen} initialRotateX={20} initialRotateY={15}>
          <Card className="w-80">
            <CardHeader>
              <CardTitle>Rotação em Y</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Este card usa rotação em X e Y para um efeito 3D mais pronunciado.
              </p>
            </CardContent>
          </Card>
        </Animated3D>
      </div>
    );
  },
};

export const WithCustomScale: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div className="flex flex-col items-center gap-4">
        <Button onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? "Fechar" : "Abrir"} (Escala 0.7)
        </Button>
        <Animated3D isOpen={isOpen} initialScale={0.7}>
          <Card className="w-80">
            <CardHeader>
              <CardTitle>Escala Customizada</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Este card começa com escala de 0.7 em vez do padrão de 0.9.
              </p>
            </CardContent>
          </Card>
        </Animated3D>
      </div>
    );
  },
};

export const WithCustomPerspective: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div className="flex flex-col items-center gap-4">
        <Button onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? "Fechar" : "Abrir"} (Perspectiva 2000px)
        </Button>
        <Animated3D isOpen={isOpen} perspective="2000px">
          <Card className="w-80">
            <CardHeader>
              <CardTitle>Perspectiva Customizada</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Este card usa perspectiva de 2000px para um efeito mais sutil.
              </p>
            </CardContent>
          </Card>
        </Animated3D>
      </div>
    );
  },
};

export const Disabled: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div className="flex flex-col items-center gap-4">
        <Button onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? "Fechar" : "Abrir"} (Desabilitado)
        </Button>
        <Animated3D isOpen={isOpen} disabled>
          <Card className="w-80">
            <CardHeader>
              <CardTitle>Animação Desabilitada</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Este card não tem animação, mesmo com isOpen mudando.
              </p>
            </CardContent>
          </Card>
        </Animated3D>
      </div>
    );
  },
};

export const MultipleCards: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div className="flex flex-col items-center gap-4">
        <Button onClick={() => setIsOpen(!isOpen)}>{isOpen ? "Fechar" : "Abrir"} Todos</Button>
        <div className="flex gap-4">
          <Animated3D isOpen={isOpen} initialRotateX={10}>
            <Card className="w-64">
              <CardHeader>
                <CardTitle>Card 1</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Primeiro card</p>
              </CardContent>
            </Card>
          </Animated3D>
          <Animated3D isOpen={isOpen} initialRotateX={15} transition={{ delay: 0.1 }}>
            <Card className="w-64">
              <CardHeader>
                <CardTitle>Card 2</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Segundo card (delay)</p>
              </CardContent>
            </Card>
          </Animated3D>
          <Animated3D isOpen={isOpen} initialRotateX={20} transition={{ delay: 0.2 }}>
            <Card className="w-64">
              <CardHeader>
                <CardTitle>Card 3</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Terceiro card (delay)</p>
              </CardContent>
            </Card>
          </Animated3D>
        </div>
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
