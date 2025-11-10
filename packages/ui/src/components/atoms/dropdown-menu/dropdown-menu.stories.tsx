import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { Button } from "../button/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";

const meta = {
  title: "Flowtomic UI/Atoms/DropdownMenu",
  component: DropdownMenu,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof DropdownMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Abrir Menu</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={fn()}>Perfil</DropdownMenuItem>
        <DropdownMenuItem onClick={fn()}>Configurações</DropdownMenuItem>
        <DropdownMenuItem onClick={fn()}>Equipe</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={fn()}>Sair</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const WithLabels: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Conta</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={fn()}>Perfil</DropdownMenuItem>
        <DropdownMenuItem onClick={fn()}>Cobrança</DropdownMenuItem>
        <DropdownMenuItem onClick={fn()}>Equipe</DropdownMenuItem>
        <DropdownMenuItem onClick={fn()}>Assinatura</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const WithSeparators: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Opções</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={fn()}>Novo Arquivo</DropdownMenuItem>
        <DropdownMenuItem onClick={fn()}>Abrir Arquivo</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={fn()}>Salvar</DropdownMenuItem>
        <DropdownMenuItem onClick={fn()}>Salvar Como</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={fn()}>Exportar</DropdownMenuItem>
        <DropdownMenuItem onClick={fn()}>Imprimir</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};
