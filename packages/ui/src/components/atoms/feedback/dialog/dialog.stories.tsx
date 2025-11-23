import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { fn } from "storybook/test";
import { Button } from "../../actions/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";

const meta = {
  title: "Flowtomic UI/Atoms/Feedback/Dialog",
  component: Dialog,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Abrir Diálogo</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Título</DialogTitle>
          <DialogDescription>Descrição do diálogo</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  ),
};

export const Simple: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Abrir Diálogo Simples</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Diálogo Simples</DialogTitle>
          <DialogDescription>
            Este é um diálogo simples com apenas título e descrição.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  ),
};

export const WithForm: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Criar Conta</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar Nova Conta</DialogTitle>
          <DialogDescription>
            Preencha o formulário abaixo para criar uma nova conta.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              placeholder="email@exemplo.com"
              className="w-full rounded-md border px-3 py-2"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Senha
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              className="w-full rounded-md border px-3 py-2"
            />
          </div>
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={fn()}>
            Cancelar
          </Button>
          <Button onClick={fn()}>Criar Conta</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const ModelSelectorStyle: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Selecionar Modelo</Button>
      </DialogTrigger>
      <DialogContent className="p-0">
        <DialogTitle className="sr-only">Selecionar Modelo</DialogTitle>
        <div className="p-4">
          <p>Conteúdo do seletor de modelo</p>
        </div>
      </DialogContent>
    </Dialog>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Exemplo de uso customizado do Dialog como no ModelSelector, com padding zero no content, título oculto para acessibilidade e conteúdo customizado.",
      },
    },
  },
};
