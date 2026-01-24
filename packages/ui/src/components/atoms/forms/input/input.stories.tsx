/**
 * # Input Component Stories
 *
 * Stories do componente Input demonstrando todas as variantes, tamanhos, estados e casos de uso.
 *
 * ## Características
 *
 * - **Variantes**: default, error, success
 * - **Tamanhos**: default, sm, lg
 * - **Labels e Helpers**: Suporte a labels e textos de ajuda
 * - **Validação**: Exibição de mensagens de erro
 *
 * @see [Input Component](./input.tsx) para documentação completa do componente
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Input } from "./input";

const meta = {
  title: "Flowtomic UI/Atoms/Forms/Input",
  component: Input,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: ["default", "sm", "lg"],
    },
    variant: {
      control: "select",
      options: ["default", "error", "success"],
    },
    type: {
      control: "select",
      options: ["text", "email", "password", "number", "tel", "url"],
    },
    disabled: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * ## Exemplo Padrão
 *
 * Input básico sem configurações adicionais.
 */
export const Default: Story = {
	args: {
		placeholder: "Digite o texto...",
	},
	parameters: {
		docs: {
			description: {
				story: "Input básico sem label ou mensagens. Use quando o contexto já fornece informação suficiente.",
			},
		},
	},
};

/**
 * ## Com Label
 *
 * Input com label associado para melhor acessibilidade.
 */
export const WithLabel: Story = {
	args: {
		label: "E-mail",
		placeholder: "email@exemplo.com",
		type: "email",
	},
	parameters: {
		docs: {
			description: {
				story:
					"Input com label associado. O label é automaticamente vinculado ao input via htmlFor/id para melhor acessibilidade.",
			},
		},
	},
};

/**
 * ## Com Texto de Ajuda
 *
 * Input com texto de ajuda para orientar o usuário.
 */
export const WithHelperText: Story = {
	args: {
		label: "Senha",
		type: "password",
		helperText: "Deve ter pelo menos 8 caracteres",
	},
	parameters: {
		docs: {
			description: {
				story:
					"Input com texto de ajuda. Use para fornecer orientações ao usuário sobre o que é esperado no campo.",
			},
		},
	},
};

/**
 * ## Estado de Erro
 *
 * Input com mensagem de erro e variante visual de erro.
 */
export const ErrorState: Story = {
	args: {
		label: "E-mail",
		variant: "error",
		error: "Endereço de e-mail inválido",
		placeholder: "email@exemplo.com",
	},
	parameters: {
		docs: {
			description: {
				story:
					"Input em estado de erro. A mensagem de erro é exibida abaixo do input e a borda fica vermelha para feedback visual imediato.",
			},
		},
	},
};

/**
 * ## Estado de Sucesso
 *
 * Input com variante visual de sucesso.
 */
export const Success: Story = {
	args: {
		label: "E-mail",
		variant: "success",
		placeholder: "email@exemplo.com",
		defaultValue: "valido@email.com",
	},
	parameters: {
		docs: {
			description: {
				story:
					"Input em estado de sucesso. A borda fica verde para indicar que o valor é válido.",
			},
		},
	},
};

/**
 * ## Tamanho Pequeno
 *
 * Input com tamanho pequeno, útil para espaços compactos.
 */
export const Small: Story = {
	args: {
		size: "sm",
		placeholder: "Input pequeno",
	},
	parameters: {
		docs: {
			description: {
				story: "Input com tamanho pequeno. Use em espaços compactos ou quando o input precisa ser discreto.",
			},
		},
	},
};

/**
 * ## Tamanho Grande
 *
 * Input com tamanho grande, útil para maior destaque visual.
 */
export const Large: Story = {
	args: {
		size: "lg",
		placeholder: "Input grande",
	},
	parameters: {
		docs: {
			description: {
				story:
					"Input com tamanho grande. Use quando o input precisa de maior destaque visual ou em interfaces com mais espaço.",
			},
		},
	},
};

/**
 * ## Estado Desabilitado
 *
 * Input desabilitado, não interativo e com feedback visual.
 */
export const Disabled: Story = {
	args: {
		label: "Input Desabilitado",
		disabled: true,
		defaultValue: "Não pode editar",
	},
	parameters: {
		docs: {
			description: {
				story:
					"Input em estado desabilitado. Não é interativo e possui opacidade reduzida para feedback visual.",
			},
		},
	},
};

/**
 * ## Uso em DataTable
 *
 * Exemplo de uso do Input em contexto de DataTable para busca e filtros.
 */
export const DataTableStyle: Story = {
	render: () => (
		<div className="flex flex-col gap-4">
			<Input placeholder="Buscar..." className="max-w-sm" />
			<Input placeholder="Filtrar por nome..." className="max-w-sm" />
		</div>
	),
	parameters: {
		docs: {
			description: {
				story:
					"Exemplo de uso customizado do Input como no DataTable, usado para busca e filtros com largura limitada.",
			},
		},
	},
};

/**
 * ## Teste de Acessibilidade
 *
 * Valida que o Input é renderizado corretamente e possui estrutura acessível.
 */
export const Accessibility: Story = {
	args: {
		label: "Input Acessível",
		placeholder: "Digite aqui",
	},
	parameters: {
		docs: {
			description: {
				story:
					"Teste de acessibilidade do Input. Valida renderização, label associado e estrutura básica do componente.",
			},
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const input = canvas.getByLabelText("Input Acessível");
		expect(input).toBeInTheDocument();
		expect(input.tagName).toBe("INPUT");
	},
};
