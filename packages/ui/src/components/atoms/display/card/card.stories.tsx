import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { Button } from "../../actions/button/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./card";

const meta = {
  title: "Flowtomic UI/Atoms/Display/Card",
  component: Card,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card>
      <CardContent className="pt-6">
        <p>Conteúdo do card</p>
      </CardContent>
    </Card>
  ),
};

export const Simple: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardContent className="pt-6">
        <p>Card simples apenas com conteúdo</p>
      </CardContent>
    </Card>
  ),
};

export const WithHeader: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Card com Cabeçalho</CardTitle>
        <CardDescription>Este card possui uma seção de cabeçalho</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Conteúdo vai aqui</p>
      </CardContent>
    </Card>
  ),
};

export const WithFooter: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardContent className="pt-6">
        <p>Conteúdo do card</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Cancelar</Button>
        <Button>Salvar</Button>
      </CardFooter>
    </Card>
  ),
};

export const Complete: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Card Completo</CardTitle>
        <CardDescription>Este é um exemplo de card completo</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Este card inclui seções de cabeçalho, conteúdo e rodapé.</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Cancelar</Button>
        <Button>Confirmar</Button>
      </CardFooter>
    </Card>
  ),
};

export const StatCardStyle: Story = {
  render: () => (
    <Card className="transition-all duration-300 hover:shadow-lg hover:scale-[1.01] border bg-card border-border">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4 sm:pb-6 border-0">
        <div className="space-y-1 flex-1 min-w-0 pr-2">
          <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide truncate">
            Receita Total
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-2.5">
          <span className="text-xl sm:text-2xl font-medium text-foreground tracking-tight break-words text-accent">
            R$ 122.380,00
          </span>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed pt-1 break-words">
          Comparado ao mês anterior
        </p>
      </CardContent>
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Exemplo de uso customizado do Card como no StatCard, com layout específico para exibição de estatísticas, hover effects e estrutura responsiva.",
      },
    },
  },
};
