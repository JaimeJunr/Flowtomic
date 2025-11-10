import type { Meta, StoryObj } from "@storybook/react-vite";
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
  title: "Flowtomic UI/Atoms/Table",
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
    <Table className="w-[800px]">
      <TableCaption>Uma lista de suas faturas recentes.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Fatura</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Método</TableHead>
          <TableHead className="text-right">Valor</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice) => (
          <TableRow key={invoice.invoice}>
            <TableCell className="font-medium">{invoice.invoice}</TableCell>
            <TableCell>{invoice.paymentStatus}</TableCell>
            <TableCell>{invoice.paymentMethod}</TableCell>
            <TableCell className="text-right">{invoice.totalAmount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={3}>Total</TableCell>
          <TableCell className="text-right">R$ 2.250,00</TableCell>
        </TableRow>
      </TableFooter>
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
