import { zodResolver } from "@hookform/resolvers/zod";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../../atoms";
import {
  BaseFormField,
  FormLayout,
  type FormSectionConfig,
  type NumericFilterValue,
} from "./form-layout";

interface FormData {
  name: string;
  email: string;
  website: string;
  phone: string;
  password: string;
  age: number;
  weight: number | undefined;
  country: string;
  /** Valor do campo date (string yyyy-MM-dd ou undefined). O calendário exibe dropdown de mês e ano. */
  birthDate: string | undefined;
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
          'Layout de formulário configurável que suporta múltiplos tipos de campo (text, email, url, tel, password, textarea, number, decimal, currency, select, date, dateRange, checkbox, switch, radio, slider, otp, toggle, numericFilter) organizados em seções. O tipo **date** usa CalendarPopover com dropdown de mês e ano para navegação rápida. Construído sobre React Hook Form, com validação (ex.: Zod), formatação numérica brasileira (vírgula decimal), grid responsivo e integração ao design system. Use `formId` para botão de submit fora do layout (`form="{formId}"`).',
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
    onError: {
      control: false,
      description: "Callback executado quando a validação falha",
      table: {
        type: { summary: "(errors: unknown) => void" },
        defaultValue: { summary: "undefined" },
      },
    },
    formRef: {
      control: false,
      description: "Ref opcional para o elemento form",
      table: {
        type: { summary: "React.RefObject<HTMLFormElement | null>" },
        defaultValue: { summary: "undefined" },
      },
    },
  },
};

export default meta;
type Story = StoryObj;

const defaultFormValues: Partial<FormData> = {
  name: "",
  email: "",
  website: "",
  phone: "",
  password: "",
  age: 0,
  weight: undefined,
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
};

export const Default: Story = {
  name: "Padrão",
  parameters: {
    docs: {
      description: {
        story:
          "Formulário com duas seções: Informações Pessoais (nome, e-mail, idade, peso, data de nascimento com dropdown de mês/ano, país) e Informações Adicionais (biografia, newsletter). Botões de ação usam formId para submit e reset.",
      },
    },
  },
  render: () => {
    const form = useForm<FormData>({
      defaultValues: defaultFormValues as FormData,
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
            name: "weight",
            label: "Peso (kg)",
            type: "decimal",
            placeholder: "Ex: 2,5",
            description: "Campo decimal para pesos e medidas (sem separador de milhares)",
            decimalScale: 2,
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
          formId="default-form"
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
          <Button type="submit" form="default-form">
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
        ...defaultFormValues,
        name: "",
        email: "",
        age: 0,
        country: "",
        birthDate: undefined,
        newsletter: false,
        bio: "",
        salary: 0,
        role: "",
      } as FormData,
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
          formId="title-header-form"
          form={form}
          sections={sections}
          onSubmit={(data) => console.log(data)}
          title="Cadastro de Usuário"
          description="Preencha os campos abaixo para criar sua conta"
          headerContent={
            <Button variant="outline" size="sm" type="button">
              Ajuda
            </Button>
          }
        />
        <div className="flex justify-end mt-4">
          <Button type="submit" form="title-header-form">
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
          "Todos os tipos suportados: text, email, url, tel, password, number, decimal, currency, select, date (com dropdown de mês e ano), textarea, checkbox, switch, radio, slider, otp, toggle. Cada um com descrição e placeholder.",
      },
    },
  },
  render: () => {
    const form = useForm<FormData>({
      defaultValues: defaultFormValues as FormData,
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
            name: "weight",
            label: "Peso (kg)",
            type: "decimal",
            placeholder: "Ex: 2,5",
            description:
              "Campo decimal para pesos e medidas (sem separador de milhares, apenas vírgula como decimal)",
            decimalScale: 2,
            cols: 1,
          },
          {
            name: "price",
            label: "Preço",
            type: "currency",
            placeholder: "0,00",
            description: "Campo de moeda com separador de milhares (ponto) e prefixo R$",
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
            description: "Calendário com dropdown de mês e ano (navegação rápida)",
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
      defaultValues: defaultFormValues as FormData,
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
          formId="multi-section-form"
          form={form}
          sections={sections}
          onSubmit={(data) => console.log(data)}
          title="Formulário com Múltiplas Seções"
          description="Exemplo de formulário dividido em seções organizadas"
        />
        <div className="flex justify-end gap-2 mt-4">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Cancelar
          </Button>
          <Button type="submit" form="multi-section-form">
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
        weight: undefined,
        country: "BR",
        birthDate: "1994-01-15",
        newsletter: true,
        bio: "",
        salary: 0,
        role: "",
      } as FormData,
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
      defaultValues: defaultFormValues as FormData,
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
            placeholder: "Selecione",
            options: [
              { label: "Brasil", value: "BR" },
              { label: "Portugal", value: "PT" },
              { label: "Angola", value: "AO" },
            ],
            cols: 1,
          },
        ],
      },
    ];

    return (
      <div className="w-[600px]">
        <FormLayout
          formId="compact-form"
          form={form}
          sections={sections}
          onSubmit={(data) => console.log(data)}
        />
        <div className="flex justify-end mt-4">
          <Button type="submit" form="compact-form">
            Enviar
          </Button>
        </div>
      </div>
    );
  },
};

export const SimpleLayout: Story = {
  name: "Layout Simples",
  parameters: {
    docs: {
      description: {
        story:
          "Uma seção sem título, com dois campos (nome e e-mail). Submit via botão externo usando formId.",
      },
    },
  },
  render: () => {
    const form = useForm<FormData>({
      defaultValues: defaultFormValues as FormData,
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
        <FormLayout
          formId="simple-form"
          form={form}
          sections={sections}
          onSubmit={(data) => console.log(data)}
        />
        <div className="flex justify-end mt-4">
          <Button type="submit" form="simple-form">
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
        weight: undefined,
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

export const WithOnErrorAndFormRef: Story = {
  name: "onError e formRef",
  parameters: {
    docs: {
      description: {
        story:
          "Demonstra onError (callback quando a validação falha) e formRef (ref para o elemento form). Campos numéricos vazios são enviados como null. Submeta sem preencher para ver os erros e o callback onError.",
      },
    },
  },
  render: () => {
    const schema = z.object({
      name: z.string().min(1, "Nome é obrigatório"),
      age: z.number().nullable(),
      weight: z.number().nullable(),
    });
    type ValidatedFormData = z.infer<typeof schema>;
    const formRef = useRef<HTMLFormElement | null>(null);
    const form = useForm<ValidatedFormData>({
      resolver: zodResolver(schema),
      defaultValues: {
        name: "",
        age: null,
        weight: null,
      },
    });

    const sections: FormSectionConfig<ValidatedFormData>[] = [
      {
        title: "Validação e Erros",
        fields: [
          {
            name: "name",
            label: "Nome",
            type: "text",
            placeholder: "Obrigatório",
            required: true,
          },
          {
            name: "age",
            label: "Idade",
            type: "number",
            placeholder: "Vazio = null",
            decimalScale: 0,
          },
          {
            name: "weight",
            label: "Peso (kg)",
            type: "decimal",
            placeholder: "Vazio = null",
            decimalScale: 2,
          },
        ],
      },
    ];

    return (
      <div className="w-[700px] space-y-4">
        <FormLayout
          form={form}
          sections={sections}
          formRef={formRef}
          onSubmit={(data) => {
            console.log("Submitted:", data);
            alert("Válido! Veja o console.");
          }}
          onError={(errors) => {
            console.log("Validation errors:", errors);
            alert("Corrija os erros antes de enviar.");
          }}
        />
        <div className="flex justify-end gap-2">
          <Button
            type="submit"
            onClick={() =>
              form.handleSubmit(
                (d) => console.log(d),
                (e) => console.log(e)
              )
            }
          >
            Enviar
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
        weight: undefined,
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

export const DecimalFieldExample: Story = {
  name: "Campo Decimal",
  parameters: {
    docs: {
      description: {
        story:
          "Demonstração do novo tipo 'decimal' para valores decimais simples como pesos, medidas e quantidades. Diferente do tipo 'number' (que tem separador de milhares) e 'currency' (que tem prefixo), o tipo 'decimal' é ideal para valores numéricos simples com vírgula como separador decimal, sem separador de milhares. Útil para pesos (kg), medidas (m, cm), quantidades decimais, etc.",
      },
    },
  },
  render: () => {
    interface DecimalFormData {
      productName: string;
      weight: number | undefined;
      quantity: number;
      price: number;
    }

    const form = useForm<DecimalFormData>({
      defaultValues: {
        productName: "",
        weight: undefined,
        quantity: 0,
        price: 0,
      },
    });

    const sections: FormSectionConfig<DecimalFormData>[] = [
      {
        title: "Comparação: Decimal vs Number vs Currency",
        description: "Diferenças entre os tipos numéricos disponíveis",
        fields: [
          {
            name: "productName",
            label: "Nome do Produto",
            type: "text",
            placeholder: "Ex: Arroz",
            required: true,
            cols: 2,
          },
          {
            name: "weight",
            label: "Peso (kg) - Tipo Decimal",
            type: "decimal",
            placeholder: "Ex: 2,5",
            description:
              "Tipo 'decimal': apenas vírgula como separador decimal, sem separador de milhares. Ideal para pesos, medidas e quantidades decimais simples.",
            decimalScale: 2,
            cols: 1,
          },
          {
            name: "quantity",
            label: "Quantidade - Tipo Number",
            type: "number",
            placeholder: "Ex: 1.500",
            description:
              "Tipo 'number': separador de milhares (ponto) e vírgula como decimal. Ideal para números grandes.",
            decimalScale: 0,
            cols: 1,
          },
          {
            name: "price",
            label: "Preço - Tipo Currency",
            type: "currency",
            placeholder: "Ex: 1.250,99",
            description:
              "Tipo 'currency': separador de milhares (ponto), vírgula como decimal e prefixo R$. Ideal para valores monetários.",
            decimalScale: 2,
            prefix: "R$ ",
            cols: 1,
          },
        ],
      },
    ];

    return (
      <div className="w-[900px]">
        <FormLayout
          formId="decimal-example-form"
          form={form}
          sections={sections}
          onSubmit={(data) => {
            console.log("Form submitted:", data);
            alert("Formulário enviado! Veja o console.");
          }}
          title="Exemplo: Tipo Decimal"
          description="Demonstração do tipo 'decimal' para valores decimais simples (pesos, medidas, etc.)"
        />
        <div className="flex justify-end gap-2 mt-4">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Limpar
          </Button>
          <Button type="submit" form="decimal-example-form">
            Enviar
          </Button>
        </div>
      </div>
    );
  },
};

export const WithNumericFilter: Story = {
  name: "Campo NumericFilter",
  parameters: {
    docs: {
      description: {
        story:
          "Campo de filtro numérico com operador (=, >, <, ≥, ≤) e valor. Suporta número, moeda (BRL) e percentual. Útil para filtros de tabela ou formulários de busca.",
      },
    },
  },
  render: () => {
    interface FilterFormData {
      amount: NumericFilterValue | null;
      priceFilter: NumericFilterValue | null;
      discountFilter: NumericFilterValue | null;
    }

    const form = useForm<FilterFormData>({
      defaultValues: {
        amount: { operator: "eq", value: null },
        priceFilter: { operator: "gte", value: 100 },
        discountFilter: { operator: "lte", value: 50 },
      },
    });

    const sections: FormSectionConfig<FilterFormData>[] = [
      {
        title: "Filtros numéricos",
        description: "Campos numericFilter com operador e valor",
        fields: [
          {
            name: "amount",
            label: "Valor (número)",
            type: "numericFilter",
            placeholder: "Digite o valor",
            allowNegative: true,
            decimalScale: 2,
          },
          {
            name: "priceFilter",
            label: "Preço (moeda)",
            type: "numericFilter",
            placeholder: "0,00",
            isCurrency: true,
            currency: "BRL",
          },
          {
            name: "discountFilter",
            label: "Desconto (%)",
            type: "numericFilter",
            placeholder: "0",
            isPercent: true,
            decimalScale: 2,
          },
        ],
      },
    ];

    return (
      <div className="w-[700px]">
        <FormLayout
          formId="numeric-filter-form"
          form={form}
          sections={sections}
          onSubmit={(data) => {
            console.log("Filtros:", data);
            alert("Veja o console para os valores.");
          }}
        />
        <div className="flex justify-end gap-2 mt-4">
          <Button type="submit" form="numeric-filter-form">
            Enviar
          </Button>
        </div>
      </div>
    );
  },
};

export const DateFieldWithDropdown: Story = {
  name: "Campo de Data (dropdown mês/ano)",
  parameters: {
    docs: {
      description: {
        story:
          'O tipo **date** usa CalendarPopover com dropdown de mês e ano (captionLayout="dropdown", fromYear/toYear). Abra o calendário e use os selects para trocar de ano rapidamente, sem navegar mês a mês.',
      },
    },
  },
  render: () => {
    interface DateFormData {
      birthDate: string | undefined;
      eventDate: string | undefined;
    }
    const form = useForm<DateFormData>({
      defaultValues: { birthDate: undefined, eventDate: undefined },
    });
    const sections: FormSectionConfig<DateFormData>[] = [
      {
        title: "Datas",
        description: "Campos de data com calendário e dropdown de mês/ano",
        fields: [
          {
            name: "birthDate",
            label: "Data de Nascimento",
            type: "date",
            placeholder: "Selecione a data",
            required: true,
            disableFuture: true,
            cols: 1,
          },
          {
            name: "eventDate",
            label: "Data do Evento",
            type: "date",
            placeholder: "Selecione",
            disableFuture: false,
            cols: 1,
          },
        ],
      },
    ];
    return (
      <div className="w-[500px]">
        <FormLayout
          formId="date-dropdown-form"
          form={form}
          sections={sections}
          onSubmit={(data) => {
            console.log("Datas:", data);
            alert(`Enviado: ${JSON.stringify(data)}`);
          }}
        />
        <div className="flex justify-end gap-2 mt-4">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Limpar
          </Button>
          <Button type="submit" form="date-dropdown-form">
            Enviar
          </Button>
        </div>
      </div>
    );
  },
};
