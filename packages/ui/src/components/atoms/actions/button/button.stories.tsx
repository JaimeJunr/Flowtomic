/**
 * # Button Component Stories
 *
 * Stories do componente Button demonstrando todas as variantes, tamanhos, estados e casos de uso.
 *
 * ## Variantes Disponíveis
 *
 * - **default**: Variante primária com cor de tema
 * - **destructive**: Variante para ações destrutivas
 * - **outline**: Variante com borda e fundo transparente
 * - **secondary**: Variante secundária com cor neutra
 * - **ghost**: Variante sem fundo, apenas texto
 * - **link**: Variante estilizada como link
 * - **success**: Variante para ações de sucesso
 * - **info**: Variante para informações
 * - **natural**: Variante com estilo natural e borda
 *
 * ## Tamanhos
 *
 * - **default**: Tamanho padrão
 * - **sm**: Tamanho pequeno
 * - **lg**: Tamanho grande
 * - **icon**: Tamanho para ícone
 * - **icon-sm**: Tamanho pequeno para ícone
 * - **icon-lg**: Tamanho grande para ícone
 *
 * ## Funcionalidades Especiais
 *
 * - **asChild**: Composição com outros componentes via Radix UI Slot
 * - **animated**: Animações sutis via Framer Motion
 * - **disabled**: Estado desabilitado
 *
 * @see [Button Component](./button.tsx) para documentação completa do componente
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Download, MoreHorizontal } from "lucide-react";
import { expect, fn, userEvent, within } from "storybook/test";
import React from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "../dropdown-menu/dropdown-menu";
import { Button } from "./button";

const meta = {
  title: "Flowtomic UI/Atoms/Actions/Button",
  component: Button,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "O componente Button é um elemento interativo usado para acionar ações ou eventos dentro da interface do usuário. Ele suporta múltiplas variantes de estilo (padrão, destrutivo, contorno, secundário, fantasma, link, sucesso, informação, natural) e tamanhos (padrão, pequeno, grande, ícone em vários tamanhos), permitindo flexibilidade na apresentação conforme o contexto da aplicação. Além disso, o botão pode ser configurado para ser animado ou desabilitado, aprimorando a experiência do usuário.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: [
        "default",
        "destructive",
        "outline",
        "secondary",
        "ghost",
        "link",
        "success",
        "info",
        "natural",
      ],
      description: "Variante semântica de estilo.",
      table: {
        type: {
          summary:
            "'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'success' | 'info' | 'natural'",
        },
        category: "Estilo",
        defaultValue: { summary: "default" },
      },
    },
    animated: {
      control: "boolean",
      description: "Ativa animações sutis de hover/focus específicas da variante.",
      table: {
        type: { summary: "boolean" },
        category: "Comportamento",
        defaultValue: { summary: "false" },
      },
    },
    size: {
      control: "select",
      options: ["default", "sm", "lg", "icon", "icon-sm", "icon-lg"],
      description: "Tamanho do botão incluindo opção de ícone dedicado.",
      table: {
        type: { summary: "...sizes" },
        category: "Layout",
        defaultValue: { summary: "default" },
      },
    },
    disabled: {
      control: "boolean",
      description: "Estado desabilitado sem interação ou foco.",
      table: {
        type: { summary: "boolean" },
        category: "Estado",
        defaultValue: { summary: "false" },
      },
    },
    children: {
      description: "Conteúdo interno (texto e/ou ícones).",
      table: { type: { summary: "React.ReactNode" }, category: "Conteúdo" },
    },
    onClick: {
      description: "Callback de clique (usado em teste de interação).",
      table: { type: { summary: "(event) => void" }, category: "Eventos" },
    },
  },
  args: { onClick: fn() },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * ## Exemplo Padrão
 *
 * Button com configuração padrão (variante `default`, tamanho `default`).
 */
export const Default: Story = {
	args: {
		children: "Botão",
	},
	parameters: {
		docs: {
			description: {
				story:
					"Button com configuração padrão. Use esta variante para ações primárias ou principais na interface.",
			},
		},
	},
};

/**
 * ## Variante Destrutiva
 *
 * Button para ações destrutivas ou perigosas, como excluir ou remover.
 */
export const Destructive: Story = {
	args: {
		variant: "destructive",
		children: "Destrutivo",
	},
	parameters: {
		docs: {
			description: {
				story:
					"Variante destrutiva com cor vermelha. Use para ações que podem ter consequências irreversíveis, como excluir ou remover itens.",
			},
		},
	},
};

/**
 * ## Variante Outline
 *
 * Button com borda e fundo transparente, útil para ações secundárias.
 */
export const Outline: Story = {
	args: {
		variant: "outline",
		children: "Contorno",
	},
	parameters: {
		docs: {
			description: {
				story:
					"Variante outline com borda e fundo transparente. Use para ações secundárias ou quando quiser menos destaque visual.",
			},
		},
	},
};

/**
 * ## Variante Secundária
 *
 * Button com estilo secundário, útil para ações menos importantes.
 */
export const Secondary: Story = {
	args: {
		variant: "secondary",
		children: "Secundário",
	},
	parameters: {
		docs: {
			description: {
				story:
					"Variante secundária com cor neutra. Use para ações complementares ou menos importantes que a ação primária.",
			},
		},
	},
};

/**
 * ## Variante Ghost
 *
 * Button sem fundo, apenas texto, útil para ações discretas.
 */
export const Ghost: Story = {
	args: {
		variant: "ghost",
		children: "Fantasma",
	},
	parameters: {
		docs: {
			description: {
				story:
					"Variante ghost sem fundo, apenas texto. Use para ações discretas ou quando o espaço visual é limitado.",
			},
		},
	},
};

/**
 * ## Variante Link
 *
 * Button estilizado como link, útil para navegação ou ações de texto.
 */
export const Link: Story = {
	args: {
		variant: "link",
		children: "Link",
	},
	parameters: {
		docs: {
			description: {
				story:
					"Variante link estilizada como link com sublinhado no hover. Use para navegação ou ações que se parecem com links.",
			},
		},
	},
};

/**
 * ## Variante Success
 *
 * Button para ações de sucesso ou confirmação.
 */
export const Success: Story = {
	args: {
		variant: "success",
		children: "Sucesso",
	},
	parameters: {
		docs: {
			description: {
				story:
					"Variante success com cor verde. Use para ações de sucesso, confirmação ou estados positivos.",
			},
		},
	},
};

/**
 * ## Variante Info
 *
 * Button para exibir informações ou ações informativas.
 */
export const Info: Story = {
	args: {
		variant: "info",
		children: "Informação",
	},
	parameters: {
		docs: {
			description: {
				story:
					"Variante info com cor accent. Use para exibir informações ou ações informativas.",
			},
		},
	},
};

/**
 * ## Tamanho Pequeno
 *
 * Button com tamanho pequeno, útil para espaços compactos.
 */
export const Small: Story = {
	args: {
		size: "sm",
		children: "Botão Pequeno",
	},
	parameters: {
		docs: {
			description: {
				story:
					"Button com tamanho pequeno. Use em espaços compactos ou quando o botão precisa ser discreto.",
			},
		},
	},
};

/**
 * ## Tamanho Grande
 *
 * Button com tamanho grande, útil para maior destaque visual.
 */
export const Large: Story = {
	args: {
		size: "lg",
		children: "Botão Grande",
	},
	parameters: {
		docs: {
			description: {
				story:
					"Button com tamanho grande. Use quando o botão precisa de maior destaque visual ou em interfaces com mais espaço.",
			},
		},
	},
};

/**
 * ## Estado Desabilitado
 *
 * Button desabilitado, não interativo e com feedback visual.
 */
export const Disabled: Story = {
	args: {
		disabled: true,
		children: "Desabilitado",
	},
	parameters: {
		docs: {
			description: {
				story:
					"Button em estado desabilitado. Não é interativo e possui opacidade reduzida para feedback visual.",
			},
		},
	},
};

/**
 * ## Com Ícone
 *
 * Button com ícone e texto, demonstrando uso de ícones do Lucide React.
 */
export const WithIcon: Story = {
	args: {
		children: (
			<>
				<Download />
				Download
			</>
		),
	},
	parameters: {
		docs: {
			description: {
				story:
					"Button com ícone e texto. Os ícones são automaticamente estilizados e espaçados quando usados dentro do Button.",
			},
		},
	},
};

/**
 * ## Variante Natural
 *
 * Button com estilo natural e borda, útil para interfaces mais orgânicas.
 */
export const Natural: Story = {
	args: {
		variant: "natural",
		children: "Natural",
	},
	parameters: {
		docs: {
			description: {
				story:
					"Variante natural com estilo mais orgânico e borda. Use em interfaces que buscam um visual mais natural ou menos formal.",
			},
		},
	},
};

/**
 * ## Button Animado
 *
 * Button com animações sutis via Framer Motion.
 */
export const Animated: Story = {
	args: {
		variant: "natural",
		animated: true,
		children: "Animado",
	},
	parameters: {
		docs: {
			description: {
				story:
					"Button com animações sutis ativadas. Ao passar o mouse, o botão aumenta ligeiramente (scale 1.02) e ao clicar diminui (scale 0.98).",
			},
		},
	},
};

export const UsageInStatCard: Story = {
  args: { children: "" },
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
          <DropdownMenuItem>Configurações</DropdownMenuItem>
          <DropdownMenuItem>Adicionar Alerta</DropdownMenuItem>
          <DropdownMenuItem>Fixar no Dashboard</DropdownMenuItem>
          <DropdownMenuItem>Compartilhar</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-error">Remover</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Uso contextual em StatCard como trigger de DropdownMenu com ícone minimalista e estilização utilitária.",
      },
    },
  },
};

export const Accessibility: Story = {
  args: { children: "Acessível" },
  parameters: {
    docs: {
      description: {
        story:
          "Demonstra foco via teclado e acionamento por Enter/Espaço para validar acessibilidade básica do botão.",
      },
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const btn = await canvas.getByRole("button", { name: /Acessível/i });
    await userEvent.tab(); // move foco
    expect(btn).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    // onClick fn() foi definido em meta.args; podemos verificar chamadas
    if (typeof args.onClick === "function") {
      // @ts-expect-error - fn possui mock.calls
      expect(args.onClick.mock.calls.length).toBeGreaterThan(0);
    }
  },
};
