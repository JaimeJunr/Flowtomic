/**
 * # DropdownMenu Component Stories
 *
 * Stories do componente DropdownMenu demonstrando uso básico, labels, separadores, acessibilidade e casos de uso.
 *
 * ## Características
 *
 * - **Trigger Flexível**: Suporta qualquer elemento como trigger
 * - **Labels e Separadores**: Organização visual do menu
 * - **Acessibilidade**: Navegação completa por teclado
 * - **Composição**: Integração com outros componentes (Button, ícones)
 *
 * @see [DropdownMenu Component](./dropdown-menu.tsx) para documentação completa do componente
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { MoreHorizontal, Settings, Share2, Trash, TriangleAlert } from "lucide-react";
import { expect, fn, userEvent, within } from "storybook/test";
import React from "react";
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
  title: "Flowtomic UI/Atoms/Actions/DropdownMenu",
  component: DropdownMenu,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "DropdownMenu fornece menu contextual leve com foco em acessibilidade via Radix primitives. Use para ações secundárias agrupadas em trigger discreto (texto ou ícone).",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof DropdownMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * ## Exemplo Padrão
 *
 * DropdownMenu básico com itens simples.
 */
export const Default: Story = {
	render: () => (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button>Abrir Menu</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				<DropdownMenuItem>Item 1</DropdownMenuItem>
				<DropdownMenuItem>Item 2</DropdownMenuItem>
				<DropdownMenuItem>Item 3</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	),
	parameters: {
		docs: {
			description: {
				story:
					"DropdownMenu básico com itens simples. Clique no botão para abrir o menu.",
			},
		},
	},
};

/**
 * ## Com Labels
 *
 * DropdownMenu com label e separador para organização visual.
 */
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
	parameters: {
		docs: {
			description: {
				story:
					"DropdownMenu com label e separador para organização visual. Útil para agrupar itens relacionados.",
			},
		},
	},
};

/**
 * ## Com Separadores
 *
 * DropdownMenu com múltiplos separadores para organização de grupos de ações.
 */
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
	parameters: {
		docs: {
			description: {
				story:
					"DropdownMenu com múltiplos separadores para organização de grupos de ações relacionadas.",
			},
		},
	},
};

/**
 * ## Uso em StatCard
 *
 * Exemplo de uso do DropdownMenu em contexto de StatCard com trigger ícone e ações agrupadas.
 */
export const UsageInStatCard: Story = {
	args: {},
	render: () => (
		<div className="flex flex-col gap-4">
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8 -me-1.5 text-muted-foreground hover:text-foreground"
					>
						<MoreHorizontal className="h-4 w-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" side="bottom">
					<DropdownMenuItem>
						<Settings className="mr-2 h-4 w-4" />
						Configurações
					</DropdownMenuItem>
					<DropdownMenuItem>
						<TriangleAlert className="mr-2 h-4 w-4" />
						Adicionar Alerta
					</DropdownMenuItem>
					<DropdownMenuItem>
						<Share2 className="mr-2 h-4 w-4" />
						Compartilhar
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem className="text-error">
						<Trash className="mr-2 h-4 w-4" />
						Remover
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story:
					"Uso contextual em StatCard com trigger ícone e ações agrupadas. Demonstra integração com outros componentes.",
			},
		},
	},
};

/**
 * ## Teste de Acessibilidade
 *
 * Valida abertura via teclado e navegação por setas.
 */
export const Accessibility: Story = {
	args: {},
	render: () => (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button size="icon" aria-label="Abrir ações">
					<MoreHorizontal />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				<DropdownMenuItem onClick={fn()}>Primeira</DropdownMenuItem>
				<DropdownMenuItem onClick={fn()}>Segunda</DropdownMenuItem>
				<DropdownMenuItem onClick={fn()}>Terceira</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	),
	parameters: {
		docs: {
			description: {
				story:
					"Demonstra abertura via teclado (Enter) e foco sequencial em itens do menu para acessibilidade básica.",
			},
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const trigger = await canvas.getByRole("button", { name: /Abrir ações/i });
		await userEvent.tab();
		expect(trigger).toHaveFocus();
		await userEvent.keyboard("{Enter}");
		const firstItem = await canvas.getByText("Primeira");
		expect(firstItem).toBeVisible();
		await userEvent.keyboard("{ArrowDown}");
	},
};
