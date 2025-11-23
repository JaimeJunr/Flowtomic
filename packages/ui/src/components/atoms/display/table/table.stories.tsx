import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";

const meta = {
  title: "Flowtomic UI/Atoms/Display/Table",
  component: Table,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

const invoices = [
  {
    invoice: "FAT001",
    paymentStatus: "Pago",
    totalAmount: "R$ 250,00",
    paymentMethod: "Cartão de Crédito",
  },
  {
    invoice: "FAT002",
    paymentStatus: "Pendente",
    totalAmount: "R$ 150,00",
    paymentMethod: "PayPal",
  },
  {
    invoice: "FAT003",
    paymentStatus: "Não Pago",
    totalAmount: "R$ 350,00",
    paymentMethod: "Transferência Bancária",
  },
  {
    invoice: "FAT004",
    paymentStatus: "Pago",
    totalAmount: "R$ 450,00",
    paymentMethod: "Cartão de Crédito",
  },
  {
    invoice: "FAT005",
    paymentStatus: "Pago",
    totalAmount: "R$ 550,00",
    paymentMethod: "PayPal",
  },
  {
    invoice: "FAT006",
    paymentStatus: "Pendente",
    totalAmount: "R$ 200,00",
    paymentMethod: "Transferência Bancária",
  },
  {
    invoice: "FAT007",
    paymentStatus: "Não Pago",
    totalAmount: "R$ 300,00",
    paymentMethod: "Cartão de Crédito",
  },
];

export const Default: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Coluna 1</TableHead>
          <TableHead>Coluna 2</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Linha 1</TableCell>
          <TableCell>Dado 1</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Linha 2</TableCell>
          <TableCell>Dado 2</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};

export const Simple: Story = {
  render: () => (
    <Table className="w-[500px]">
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>E-mail</TableHead>
          <TableHead>Função</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className="font-medium">João Silva</TableCell>
          <TableCell>joao@exemplo.com</TableCell>
          <TableCell>Admin</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">Maria Santos</TableCell>
          <TableCell>maria@exemplo.com</TableCell>
          <TableCell>Usuário</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">Pedro Costa</TableCell>
          <TableCell>pedro@exemplo.com</TableCell>
          <TableCell>Usuário</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};

export const WithoutFooter: Story = {
  render: () => (
    <Table className="w-[600px]">
      <TableCaption>Relatório de vendas mensal</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Mês</TableHead>
          <TableHead>Vendas</TableHead>
          <TableHead className="text-right">Crescimento</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className="font-medium">Janeiro</TableCell>
          <TableCell>R$ 10.000</TableCell>
          <TableCell className="text-right">+5%</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">Fevereiro</TableCell>
          <TableCell>R$ 12.000</TableCell>
          <TableCell className="text-right">+20%</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">Março</TableCell>
          <TableCell>R$ 15.000</TableCell>
          <TableCell className="text-right">+25%</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};

export const DataTableStyle: Story = {
  render: () => (
    <div className="w-full max-w-4xl rounded-xl border border-border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">ID</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-medium">001</TableCell>
            <TableCell>Item 1</TableCell>
            <TableCell>Ativo</TableCell>
            <TableCell className="text-right">-</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">002</TableCell>
            <TableCell>Item 2</TableCell>
            <TableCell>Inativo</TableCell>
            <TableCell className="text-right">-</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Exemplo de uso customizado do Table como no DataTable, com container estilizado, bordas arredondadas e sombra.",
      },
    },
  },
};
