/**
 * # Checkbox Component Stories
 *
 * Stories do componente Checkbox demonstrando estados, uso com labels e casos de uso.
 *
 * ## Características
 *
 * - **Estados**: checked, unchecked, disabled
 * - **Labels**: Suporte a labels associados
 * - **Acessibilidade**: Navegação completa por teclado
 *
 * @see [Checkbox Component](./checkbox.tsx) para documentação completa do componente
 */
import { Label } from "@radix-ui/react-label";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Checkbox } from "./checkbox";

const meta = {
  title: "Flowtomic UI/Atoms/Forms/Checkbox",
  component: Checkbox,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    checked: {
      control: "boolean",
    },
    disabled: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * ## Exemplo Padrão
 *
 * Checkbox básico sem estado inicial.
 */
export const Default: Story = {
	args: {
		id: "checkbox-default",
	},
	parameters: {
		docs: {
			description: {
				story: "Checkbox básico sem estado inicial. Use quando o estado será controlado externamente.",
			},
		},
	},
};

/**
 * ## Checked
 *
 * Checkbox pré-marcado usando defaultChecked.
 */
export const Checked: Story = {
	render: () => (
		<div className="flex items-center space-x-2">
			<Checkbox id="checked" defaultChecked />
			<Label
				htmlFor="checked"
				className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
			>
				Já marcado
			</Label>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story:
					"Checkbox pré-marcado usando defaultChecked. Use quando o checkbox deve iniciar marcado.",
			},
		},
	},
};

/**
 * ## Desabilitado
 *
 * Checkbox desabilitado, não interativo.
 */
export const Disabled: Story = {
	render: () => (
		<div className="flex items-center space-x-2">
			<Checkbox id="disabled" disabled />
			<Label
				htmlFor="disabled"
				className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
			>
				Checkbox desabilitado
			</Label>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story:
					"Checkbox desabilitado. Não é interativo e possui opacidade reduzida para feedback visual.",
			},
		},
	},
};

/**
 * ## Desabilitado e Marcado
 *
 * Checkbox desabilitado e pré-marcado.
 */
export const DisabledChecked: Story = {
	render: () => (
		<div className="flex items-center space-x-2">
			<Checkbox id="disabled-checked" disabled defaultChecked />
			<Label
				htmlFor="disabled-checked"
				className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
			>
				Desabilitado e marcado
			</Label>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story:
					"Checkbox desabilitado e pré-marcado. Útil para exibir estados que não podem ser alterados.",
			},
		},
	},
};

/**
 * ## Múltiplos Checkboxes
 *
 * Exemplo de múltiplos checkboxes para seleção de várias opções.
 */
export const Multiple: Story = {
	render: () => (
		<div className="space-y-3">
			<div className="flex items-center space-x-2">
				<Checkbox id="option1" />
				<Label
					htmlFor="option1"
					className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
				>
					Opção 1
				</Label>
			</div>
			<div className="flex items-center space-x-2">
				<Checkbox id="option2" defaultChecked />
				<Label
					htmlFor="option2"
					className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
				>
					Opção 2
				</Label>
			</div>
			<div className="flex items-center space-x-2">
				<Checkbox id="option3" />
				<Label
					htmlFor="option3"
					className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
				>
					Opção 3
				</Label>
			</div>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story:
					"Exemplo de múltiplos checkboxes para seleção de várias opções. Cada checkbox é independente.",
			},
		},
	},
};

/**
 * ## Uso em DataTable
 *
 * Exemplo de uso do Checkbox em contexto de DataTable para seleção de linhas.
 */
export const DataTableStyle: Story = {
	render: () => (
		<div className="flex items-center space-x-2">
			<Checkbox id="row-select" />
			<Label
				htmlFor="row-select"
				className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 sr-only"
			>
				Selecionar linha
			</Label>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story:
					"Exemplo de uso customizado do Checkbox como no DataTable, usado para seleção de linhas com label oculto para acessibilidade.",
			},
		},
	},
};

/**
 * ## Teste de Acessibilidade
 *
 * Valida que o Checkbox é renderizado corretamente e possui estrutura acessível.
 */
export const Accessibility: Story = {
	args: {
		id: "checkbox-accessibility",
	},
	parameters: {
		docs: {
			description: {
				story:
					"Teste de acessibilidade do Checkbox. Valida renderização e estrutura básica do componente.",
			},
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const checkbox = canvas.getByRole("checkbox");
		expect(checkbox).toBeInTheDocument();
	},
};
