import type { Meta, StoryObj } from "@storybook/react-vite";
import { useForm } from "react-hook-form";
import { Button } from "../../atoms";
import { BaseFormField, FormLayout, type FormSectionConfig } from "./form-layout";

interface FormData {
  name: string;

  email: string;
  website: string;
  phone: string;
  password: string;
  age: number;
  country: string;
  birthDate: Date;
  newsletter: boolean;
  bio: string;
  salary: number;
  price: number;
  role: string;
  enabled: boolean;
  status: string;
  level: number;
  otp: string;
  toggleFlag: boolean;
}

const meta: Meta<typeof FormLayout> = {
  title: "Flowtomic UI/Organisms/FormLayout",
  component: FormLayout,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "O componente FormLayout é um layout de formulário configurável que suporta múltiplos tipos de campo (text, number, select, date, checkbox, textarea) organizados em seções. Construído sobre React Hook Form, oferece validação, formatação de números, layout responsivo em grid e integração completa com o design system.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    form: {
      control: false,
      description: "Instância do useForm do React Hook Form",
      table: {
        type: { summary: "UseFormReturn<T>" },
      },
    },
    sections: {
      control: false,
      description: "Seções do formulário com seus campos",
      table: {
        type: { summary: "FormSectionConfig<T>[]" },
      },
    },
    onSubmit: {
      control: false,
      description: "Callback executado quando o formulário é submetido",
      table: {
        type: { summary: "(values: T) => void" },
      },
    },
    formId: {
      control: "text",
      description: "ID opcional do formulário para submit externo",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "undefined" },
      },
    },
    title: {
      control: "text",
      description: "Título opcional do formulário",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "undefined" },
      },
    },
    description: {
      control: "text",
      description: "Descrição opcional do formulário",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "undefined" },
      },
    },
    headerContent: {
      control: false,
      description: "Conteúdo adicional no header (ex: botões de ação)",
      table: {
        type: { summary: "React.ReactNode" },
        defaultValue: { summary: "undefined" },
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  name: "Padrão",
  parameters: {
    docs: {
      description: {
        story:
          "Exemplo padrão do FormLayout com múltiplas seções contendo diferentes tipos de campo. Demonstra a organização em seções e o layout responsivo em grid.",
      },
    },
  },
  render: () => {
    const form = useForm<FormData>({
      defaultValues: {
        name: "",
        email: "",
        website: "",
        phone: "",
        password: "",
        age: 0,
        country: "",
        birthDate: undefined,
        newsletter: false,
        bio: "",
        salary: 0,
        price: 0,
        role: "",
        enabled: false,
        status: "",
        level: 50,
        otp: "",
        toggleFlag: false,
      },
    });

    const sections: FormSectionConfig<FormData>[] = [
      {
        title: "Informações Pessoais",
        description: "Dados básicos do usuário",
        fields: [
          {
            name: "name",
            label: "Nome Completo",
            type: "text",
            placeholder: "Digite seu nome",
            required: true,
            cols: 2,
          },
          {
            name: "email",
            label: "E-mail",
            type: "text",
            placeholder: "email@exemplo.com",
            required: true,
            cols: 1,
          },
          {
            name: "age",
            label: "Idade",
            type: "number",
            placeholder: "0",
            decimalScale: 0,
            cols: 1,
          },
          {
            name: "birthDate",
            label: "Data de Nascimento",
            type: "date",
            placeholder: "Selecione a data",
            cols: 1,
          },
          {
            name: "country",
            label: "País",
            type: "select",
            placeholder: "Selecione um país",
            options: [
              { label: "Brasil", value: "BR" },
              { label: "Estados Unidos", value: "US" },
              { label: "Portugal", value: "PT" },
            ],
            cols: 1,
          },
        ],
      },
      {
        title: "Informações Adicionais",
        fields: [
          {
            name: "bio",
            label: "Biografia",
            type: "textarea",
            placeholder: "Conte um pouco sobre você",
            description: "Máximo 500 caracteres",
            cols: 3,
          },
          {
            name: "newsletter",
            label: "Desejo receber newsletter",
            type: "checkbox",
            description: "Você pode cancelar a qualquer momento",
            cols: 3,
          },
        ],
      },
    ];

    return (
      <div className="w-[800px]">
        <FormLayout
          form={form}
          sections={sections}
          onSubmit={(data) => {
            console.log("Form submitted:", data);
            alert("Formulário enviado! Veja o console.");
          }}
        />
        <div className="flex justify-end gap-2 mt-4">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Limpar
          </Button>
          <Button type="submit" onClick={form.handleSubmit((data) => console.log(data))}>
            Enviar
          </Button>
        </div>
      </div>
    );
  },
};

export const WithTitleAndHeader: Story = {
  name: "Com Título e Header",
  parameters: {
    docs: {
      description: {
        story:
          "Formulário com título, descrição e conteúdo adicional no header. O headerContent permite adicionar botões de ação ou outros elementos ao cabeçalho.",
      },
    },
  },
  render: () => {
    const form = useForm<FormData>({
      defaultValues: {
        name: "",
        email: "",
        age: 0,
        country: "",
        birthDate: undefined,
        newsletter: false,
        bio: "",
        salary: 0,
        role: "",
      },
    });

    const sections: FormSectionConfig<FormData>[] = [
      {
        title: "Dados Pessoais",
        fields: [
          {
            name: "name",
            label: "Nome",
            type: "text",
            placeholder: "Seu nome",
            required: true,
          },
          {
            name: "email",
            label: "E-mail",
            type: "email",
            placeholder: "seu@email.com",
            required: true,
          },
        ],
      },
    ];

    return (
      <div className="w-[800px]">
        <FormLayout
          form={form}
          sections={sections}
          onSubmit={(data) => console.log(data)}
          title="Cadastro de Usuário"
          description="Preencha os campos abaixo para criar sua conta"
          headerContent={
            <Button variant="outline" size="sm">
              Ajuda
            </Button>
          }
        />
        <div className="flex justify-end mt-4">
          <Button type="submit" onClick={form.handleSubmit((data) => console.log(data))}>
            Criar Conta
          </Button>
        </div>
      </div>
    );
  },
};

export const WithAllFieldTypes: Story = {
  name: "Todos os Tipos de Campo",
  parameters: {
    docs: {
      description: {
        story:
          "Demonstração completa de todos os tipos de campo disponíveis: text, number, select, date, textarea e checkbox. Cada campo inclui descrição e placeholder.",
      },
    },
  },
  render: () => {
    const form = useForm<FormData>({
      defaultValues: {
        name: "",
        email: "",
        age: 0,
        country: "",
        birthDate: undefined,
        newsletter: false,
        bio: "",
        salary: 0,
        role: "",
      },
    });

    const sections: FormSectionConfig<FormData>[] = [
      {
        title: "Todos os Tipos de Campo",
        description: "Demonstração de todos os tipos de campo disponíveis",
        fields: [
          {
            name: "name",
            label: "Campo de Texto",
            type: "text",
            placeholder: "Digite texto",
            description: "Exemplo de campo de texto",
            cols: 2,
          },
          {
            name: "email",
            label: "E-mail",
            type: "email",
            placeholder: "email@exemplo.com",
            description: "Campo do tipo email",
            cols: 1,
          },
          {
            name: "website",
            label: "Website",
            type: "url",
            placeholder: "https://exemplo.com",
            description: "Campo do tipo URL",
            cols: 1,
          },
          {
            name: "phone",
            label: "Telefone",
            type: "tel",
            placeholder: "+55 11 99999-9999",
            description: "Campo do tipo telefone",
            cols: 1,
          },
          {
            name: "password",
            label: "Senha",
            type: "password",
            placeholder: "••••••••",
            description: "Campo de senha com visibilidade inteligente",
            cols: 1,
          },
          {
            name: "age",
            label: "Campo Numérico",
            type: "number",
            placeholder: "0",
            description: "Exemplo de campo numérico",
            decimalScale: 0,
            cols: 1,
          },
          {
            name: "price",
            label: "Preço",
            type: "currency",
            placeholder: "0,00",
            description: "Campo de moeda com separador e prefixo",
            decimalScale: 2,
            prefix: "R$ ",
            cols: 1,
          },
          {
            name: "country",
            label: "Campo de Seleção",
            type: "select",
            placeholder: "Escolha uma opção",
            description: "Exemplo de campo select",
            options: [
              { label: "Opção 1", value: "1" },
              { label: "Opção 2", value: "2" },
              { label: "Opção 3", value: "3" },
            ],
            cols: 1,
          },
          {
            name: "birthDate",
            label: "Campo de Data",
            type: "date",
            placeholder: "Selecione",
            description: "Exemplo de campo de data",
            cols: 1,
          },
          {
            name: "bio",
            label: "Campo de Texto Longo",
            type: "textarea",
            placeholder: "Digite um texto longo",
            description: "Exemplo de textarea",
            cols: 2,
          },
          {
            name: "newsletter",
            label: "Aceito receber e-mails",
            type: "checkbox",
            description: "Exemplo de checkbox",
            cols: 1,
          },
          {
            name: "enabled",
            label: "Habilitado",
            type: "switch",
            description: "Exemplo de switch",
            cols: 1,
          },
          {
            name: "status",
            label: "Status",
            type: "radio",
            description: "Exemplo de radio group",
            radioOptions: [
              { label: "Ativo", value: "ativo" },
              { label: "Inativo", value: "inativo" },
            ],
            cols: 2,
          },
          {
            name: "level",
            label: "Nível",
            type: "slider",
            description: "Exemplo de slider",
            sliderRange: { min: 0, max: 100, step: 1 },
            cols: 3,
          },
          {
            name: "otp",
            label: "Código OTP",
            type: "otp",
            description: "Exemplo de input OTP",
            otpLength: 6,
            cols: 3,
          },
          {
            name: "toggleFlag",
            label: "Ativar Flag",
            type: "toggle",
            description: "Exemplo de toggle",
            cols: 1,
          },
        ],
      },
    ];

    return (
      <div className="w-[900px]">
        <FormLayout
          form={form}
          sections={sections}
          onSubmit={(data) => console.log(data)}
          title="Exemplo Completo"
        />
        <div className="flex justify-end mt-4">
          <Button type="submit" onClick={form.handleSubmit((data) => console.log(data))}>
            Enviar
          </Button>
        </div>
      </div>
    );
  },
};

export const WithMultipleSections: Story = {
  name: "Múltiplas Seções",
  parameters: {
    docs: {
      description: {
        story:
          "Formulário dividido em 4 seções organizadas (Identificação, Dados Complementares, Profissional e Preferências). Ideal para formulários complexos que precisam de organização visual.",
      },
    },
  },
  render: () => {
    const form = useForm<FormData>({
      defaultValues: {
        name: "",
        email: "",
        age: 0,
        country: "",
        birthDate: undefined,
        newsletter: false,
        bio: "",
        salary: 0,
        role: "",
      },
    });

    const sections: FormSectionConfig<FormData>[] = [
      {
        title: "Seção 1: Identificação",
        fields: [
          {
            name: "name",
            label: "Nome",
            type: "text",
            placeholder: "Seu nome",
            required: true,
          },
          {
            name: "email",
            label: "E-mail",
            type: "text",
            placeholder: "seu@email.com",
            required: true,
          },
        ],
      },
      {
        title: "Seção 2: Dados Complementares",
        fields: [
          {
            name: "age",
            label: "Idade",
            type: "number",
            decimalScale: 0,
          },
          {
            name: "birthDate",
            label: "Data de Nascimento",
            type: "date",
          },
        ],
      },
      {
        title: "Seção 3: Profissional",
        fields: [
          {
            name: "role",
            label: "Cargo",
            type: "select",
            options: ["Desenvolvedor", "Designer", "Gerente"],
          },
          {
            name: "salary",
            label: "Salário",
            type: "number",
            decimalScale: 2,
          },
        ],
      },
      {
        title: "Seção 4: Preferências",
        fields: [
          {
            name: "bio",
            label: "Sobre você",
            type: "textarea",
            cols: 3,
          },
          {
            name: "newsletter",
            label: "Receber novidades",
            type: "checkbox",
            cols: 3,
          },
        ],
      },
    ];

    return (
      <div className="w-[900px]">
        <FormLayout
          form={form}
          sections={sections}
          onSubmit={(data) => console.log(data)}
          title="Formulário com Múltiplas Seções"
          description="Exemplo de formulário dividido em seções organizadas"
        />
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => form.reset()}>
            Cancelar
          </Button>
          <Button type="submit" onClick={form.handleSubmit((data) => console.log(data))}>
            Salvar
          </Button>
        </div>
      </div>
    );
  },
};

export const WithDisabledFields: Story = {
  name: "Campos Desabilitados",
  parameters: {
    docs: {
      description: {
        story:
          "Exemplo de formulário com campos desabilitados. Útil para visualização de dados ou formulários em modo leitura.",
      },
    },
  },
  render: () => {
    const form = useForm<FormData>({
      defaultValues: {
        name: "João Silva",
        email: "joao@exemplo.com",
        age: 30,
        country: "BR",
        birthDate: new Date("1994-01-15"),
        newsletter: true,
        bio: "",
        salary: 0,
        role: "",
      },
    });

    const sections: FormSectionConfig<FormData>[] = [
      {
        title: "Dados Bloqueados",
        description: "Campos desabilitados não podem ser editados",
        fields: [
          {
            name: "name",
            label: "Nome",
            type: "text",
            disabled: true,
          },
          {
            name: "email",
            label: "E-mail",
            type: "text",
            disabled: true,
          },
          {
            name: "age",
            label: "Idade",
            type: "number",
            disabled: true,
            decimalScale: 0,
          },
          {
            name: "country",
            label: "País",
            type: "select",
            disabled: true,
            options: [
              { label: "Brasil", value: "BR" },
              { label: "Estados Unidos", value: "US" },
            ],
          },
          {
            name: "birthDate",
            label: "Data de Nascimento",
            type: "date",
            disabled: true,
          },
          {
            name: "newsletter",
            label: "Newsletter",
            type: "checkbox",
            disabled: true,
          },
        ],
      },
    ];

    return (
      <div className="w-[800px]">
        <FormLayout
          form={form}
          sections={sections}
          onSubmit={(data) => console.log(data)}
          title="Campos Desabilitados"
        />
      </div>
    );
  },
};

export const CompactLayout: Story = {
  name: "Layout Compacto",
  parameters: {
    docs: {
      description: {
        story:
          "Layout compacto com 3 campos em uma única seção. Ideal para formulários simples e rápidos de contato.",
      },
    },
  },
  render: () => {
    const form = useForm<FormData>({
      defaultValues: {
        name: "",
        email: "",
        age: 0,
        country: "",
        birthDate: undefined,
        newsletter: false,
        bio: "",
        salary: 0,
        role: "",
      },
    });

    const sections: FormSectionConfig<FormData>[] = [
      {
        title: "Contato Rápido",
        fields: [
          {
            name: "name",
            label: "Nome",
            type: "text",
            placeholder: "Seu nome",
            cols: 1,
          },
          {
            name: "email",
            label: "E-mail",
            type: "text",
            placeholder: "seu@email.com",
            cols: 1,
          },
          {
            name: "country",
            label: "País",
            type: "select",
            options: ["Brasil", "Portugal", "Angola"],
            cols: 1,
          },
        ],
      },
    ];

    return (
      <div className="w-[600px]">
        <FormLayout form={form} sections={sections} onSubmit={(data) => console.log(data)} />
        <div className="flex justify-end mt-4">
          <Button type="submit" onClick={form.handleSubmit((data) => console.log(data))}>
            Enviar
          </Button>
        </div>
      </div>
    );
  },
};

export const simpleLayout: Story = {
  name: "Layout Simples",
  parameters: {
    docs: {
      description: {
        story:
          "Layout simples com apenas 2 campos em uma seção. Útil para formulários diretos e objetivos.",
      },
    },
  },
  render: () => {
    const form = useForm<FormData>({
      defaultValues: {
        name: "",
        email: "",
        age: 0,
        country: "",
        birthDate: undefined,
        newsletter: false,
        bio: "",
        salary: 0,
        role: "",
      },
    });

    const sections: FormSectionConfig<FormData>[] = [
      {
        fields: [
          {
            name: "name",
            label: "Nome",
            type: "text",
            placeholder: "Seu nome",
          },
          {
            name: "email",
            label: "E-mail",
            type: "text",
            placeholder: "seu@email.com",
          },
        ],
      },
    ];

    return (
      <div className="w-[600px]">
        <FormLayout form={form} sections={sections} onSubmit={(data) => console.log(data)} />
        <div className="flex justify-end mt-4">
          <Button type="submit" onClick={form.handleSubmit((data) => console.log(data))}>
            Enviar
          </Button>
        </div>
      </div>
    );
  },
};

export const WithExternalSubmit: Story = {
  name: "Submit Externo",
  parameters: {
    docs: {
      description: {
        story:
          "Demonstra o uso do formId para submeter o formulário através de um botão externo. Útil quando os botões de ação precisam estar fora do componente FormLayout.",
      },
    },
  },
  render: () => {
    const form = useForm<FormData>({
      defaultValues: {
        name: "",
        email: "",
        age: 0,
        country: "",
        birthDate: undefined,
        newsletter: false,
        bio: "",
        salary: 0,
        role: "",
      },
    });

    const sections: FormSectionConfig<FormData>[] = [
      {
        title: "Dados do Usuário",
        fields: [
          {
            name: "name",
            label: "Nome",
            type: "text",
            required: true,
          },
          {
            name: "email",
            label: "E-mail",
            type: "text",
            required: true,
          },
        ],
      },
    ];

    return (
      <div className="w-[700px] space-y-4">
        <div className="bg-muted p-4 rounded-md">
          <p className="text-sm text-muted-foreground">
            Este formulário pode ser submetido por um botão externo usando o formId.
          </p>
        </div>
        <FormLayout
          form={form}
          sections={sections}
          onSubmit={(data) => {
            console.log("Form submitted via external button:", data);
            alert("Formulário enviado! Veja o console.");
          }}
          formId="external-form"
        />
        <div className="flex justify-end gap-2 border-t pt-4">
          <Button variant="outline" onClick={() => form.reset()}>
            Cancelar
          </Button>
          <Button type="submit" form="external-form">
            Salvar (Botão Externo)
          </Button>
        </div>
      </div>
    );
  },
};

export const CustomFieldUsage: Story = {
  name: "Uso Customizado de BaseFormField",
  parameters: {
    docs: {
      description: {
        story:
          "Demonstra o uso direto do componente BaseFormField para criar campos individuais customizados fora do FormLayout. Útil quando você precisa de maior controle sobre a estrutura do formulário.",
      },
    },
  },
  render: () => {
    const form = useForm<FormData>({
      defaultValues: {
        name: "",
        email: "",
        age: 0,
        country: "",
        birthDate: undefined,
        newsletter: false,
        bio: "",
        salary: 0,
        role: "",
      },
    });

    return (
      <div className="w-[600px]">
        <form onSubmit={form.handleSubmit((data) => console.log(data))} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <BaseFormField
              config={{
                name: "name",
                label: "Nome",
                type: "text",
                placeholder: "Digite seu nome",
                required: true,
              }}
              control={form.control}
            />
            <BaseFormField
              config={{
                name: "email",
                label: "E-mail",
                type: "text",
                placeholder: "seu@email.com",
                required: true,
              }}
              control={form.control}
            />
          </div>

          <BaseFormField
            config={{
              name: "bio",
              label: "Biografia",
              type: "textarea",
              placeholder: "Conte sobre você",
              description: "Breve descrição sobre você",
            }}
            control={form.control}
          />

          <div className="flex justify-end">
            <Button type="submit">Enviar</Button>
          </div>
        </form>
      </div>
    );
  },
};

export const NoKnownUsage: Story = {
  name: "Sem Uso Conhecido",
  render: () => (
    <div className="p-4 text-sm text-muted-foreground">
      Este componente ainda não possui uso conhecido em blocks ou outros componentes complexos.
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Este componente ainda não possui uso conhecido em blocks ou componentes mais complexos do Flowtomic.",
      },
    },
  },
};
