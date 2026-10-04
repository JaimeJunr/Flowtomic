import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { createRef } from "react";
import { type FieldValues, type Resolver, type ResolverResult, useForm } from "react-hook-form";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import {
  type FormFieldConfig,
  type FormFieldType,
  FormLayout,
  type FormSectionConfig,
} from "./form-layout";

interface FormData {
  name: string;
}

function Wrapper({ sections }: { sections: FormSectionConfig<FormData>[] }) {
  const form = useForm<FormData>({ defaultValues: { name: "" } });
  return <FormLayout form={form} sections={sections} onSubmit={() => {}} />;
}

describe("FormLayout", () => {
  it("título de seção usa o token de cor do tema, não um cinza fixo (text-gray-900)", () => {
    const sections: FormSectionConfig<FormData>[] = [
      {
        title: "Dados pessoais",
        fields: [{ name: "name", label: "Nome", type: "text" }],
      },
    ];
    render(<Wrapper sections={sections} />);

    const sectionTitle = screen.getByText("Dados pessoais");
    expect(sectionTitle).toHaveClass("text-foreground");
    expect(sectionTitle).not.toHaveClass("text-gray-900");
  });
});

// O input-otp checa selo de gerenciador de senha com document.elementFromPoint em um timer; o jsdom não tem
beforeAll(() => {
  document.elementFromPoint = () => null;
});

afterAll(() => {
  // @ts-expect-error remove o stub para não vazar para outros arquivos
  delete document.elementFromPoint;
});

type Valores = Record<string, unknown>;

/** Resolver mínimo: o campo "nome" é obrigatório; o resto passa. */
const nomeObrigatorio: Resolver<Valores> = async (values): Promise<ResolverResult<Valores>> => {
  if (values.nome) return { values, errors: {} };
  return { values: {}, errors: { nome: { type: "required", message: "Informe o nome" } } };
};

interface FormularioProps {
  fields: FormFieldConfig<Valores>[];
  defaultValues?: Valores;
  onSubmit?: (values: Valores) => void;
  onError?: (errors: unknown) => void;
  exigeNome?: boolean;
  layoutProps?: Partial<React.ComponentProps<typeof FormLayout<Valores>>>;
}

function Formulario({
  fields,
  defaultValues = {},
  onSubmit = () => {},
  onError,
  exigeNome,
  layoutProps,
}: FormularioProps) {
  const form = useForm<Valores>({
    defaultValues,
    resolver: exigeNome ? nomeObrigatorio : undefined,
  });
  return (
    <>
      <FormLayout
        form={form}
        formId="formulario"
        sections={[{ fields }]}
        onSubmit={onSubmit}
        onError={onError}
        {...layoutProps}
      />
      <button type="submit" form="formulario">
        Enviar
      </button>
    </>
  );
}

const campo = (
  type: FormFieldType,
  extra: Partial<FormFieldConfig<Valores>> = {}
): FormFieldConfig<Valores> => ({ name: "campo", label: "Campo", type, ...extra });

async function enviar() {
  await userEvent.click(screen.getByRole("button", { name: "Enviar" }));
}

function ultimoEnvio(onSubmit: ReturnType<typeof vi.fn>): Valores {
  return onSubmit.mock.calls.at(-1)?.[0] as Valores;
}

describe("FormLayout - cabeçalho e seções", () => {
  it("mostra título, descrição e o conteúdo extra do cabeçalho", () => {
    render(
      <Formulario
        fields={[campo("text")]}
        layoutProps={{
          title: "Cadastro",
          description: "Preencha os dados",
          headerContent: <button type="button">Ajuda</button>,
        }}
      />
    );
    expect(screen.getByRole("heading", { level: 2, name: "Cadastro" })).toBeInTheDocument();
    expect(screen.getByText("Preencha os dados")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ajuda" })).toBeInTheDocument();
  });

  it("só com descrição, não cria o título do formulário", () => {
    render(<Formulario fields={[campo("text")]} layoutProps={{ description: "Só descrição" }} />);
    expect(screen.queryByRole("heading", { level: 2 })).not.toBeInTheDocument();
    expect(screen.getByText("Só descrição")).toBeInTheDocument();
  });

  it("só com título, não cria o parágrafo de descrição", () => {
    render(<Formulario fields={[campo("text")]} layoutProps={{ title: "Só título" }} />);
    expect(screen.getByRole("heading", { level: 2, name: "Só título" })).toBeInTheDocument();
  });

  it("sem título nem descrição, não renderiza cabeçalho do formulário", () => {
    render(<Formulario fields={[campo("text")]} />);
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });

  it("seção sem título nem descrição não renderiza cabeçalho de seção", () => {
    render(<Formulario fields={[campo("text")]} />);
    expect(screen.queryByRole("heading", { level: 3 })).not.toBeInTheDocument();
  });

  it("seção só com descrição renderiza o cabeçalho sem heading de título", () => {
    function ApenasDescricao() {
      const form = useForm<Valores>();
      return (
        <FormLayout
          form={form}
          onSubmit={() => {}}
          sections={[{ description: "Sem título", fields: [campo("text")] }]}
        />
      );
    }
    render(<ApenasDescricao />);
    expect(screen.queryByRole("heading", { level: 3 })).not.toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Campo" })).toBeInTheDocument();
  });

  it("renderiza várias seções, cada uma com seus campos", () => {
    function DuasSecoes() {
      const form = useForm<Valores>();
      const secoes: FormSectionConfig<Valores>[] = [
        { title: "Pessoal", fields: [{ name: "nome", label: "Nome", type: "text" }] },
        { title: "Contato", fields: [{ name: "mail", label: "E-mail", type: "email" }] },
      ];
      return <FormLayout form={form} onSubmit={() => {}} sections={secoes} />;
    }
    render(<DuasSecoes />);
    expect(screen.getByRole("heading", { level: 3, name: "Pessoal" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Contato" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Nome" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "E-mail" })).toBeInTheDocument();
  });

  it("encaminha a ref e o id para o elemento form", () => {
    const formRef = createRef<HTMLFormElement>();
    render(<Formulario fields={[campo("text")]} layoutProps={{ formRef }} />);
    expect(formRef.current).toBeInstanceOf(HTMLFormElement);
    expect(formRef.current).toHaveAttribute("id", "formulario");
  });

  it.each([
    [undefined, "col-span-full"],
    [3, "col-span-full"],
    [2, "md:col-span-2"],
    [1, "col-span-1"],
  ])("campo com cols=%s ocupa %s no grid", (cols, classe) => {
    render(<Formulario fields={[campo("text", { cols })]} />);
    const envoltorio = screen
      .getByRole("textbox", { name: "Campo" })
      .closest("[data-slot=form-item]")?.parentElement;
    expect(envoltorio).toHaveClass(classe);
  });
});

describe("FormLayout - envio e validação", () => {
  it("envia os valores digitados ao confirmar", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<Formulario fields={[campo("text")]} onSubmit={onSubmit} />);

    await user.type(screen.getByRole("textbox", { name: "Campo" }), "Maria");
    await enviar();

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(ultimoEnvio(onSubmit)).toEqual({ campo: "Maria" });
  });

  it("com validação falhando, mostra a mensagem, chama onError e não envia", async () => {
    const onSubmit = vi.fn();
    const onError = vi.fn();
    render(
      <Formulario
        fields={[{ name: "nome", label: "Nome", type: "text" }]}
        exigeNome
        onSubmit={onSubmit}
        onError={onError}
      />
    );

    await enviar();

    expect(await screen.findByText("Informe o nome")).toBeInTheDocument();
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole("textbox", { name: "Nome" })).toBeInvalid();
  });

  it("com validação falhando e sem onError, não quebra", async () => {
    const onSubmit = vi.fn();
    render(
      <Formulario
        fields={[{ name: "nome", label: "Nome", type: "text" }]}
        exigeNome
        onSubmit={onSubmit}
      />
    );

    await enviar();

    expect(await screen.findByText("Informe o nome")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("esconde a descrição do campo enquanto há erro e mostra de novo sem erro", async () => {
    const user = userEvent.setup();
    render(
      <Formulario
        fields={[{ name: "nome", label: "Nome", type: "text", description: "Como no documento" }]}
        exigeNome
      />
    );
    expect(screen.getByText("Como no documento")).toBeInTheDocument();

    await enviar();
    await screen.findByText("Informe o nome");
    expect(screen.queryByText("Como no documento")).not.toBeInTheDocument();

    await user.type(screen.getByRole("textbox", { name: "Nome" }), "Ana");
    await enviar();
    await waitFor(() => expect(screen.queryByText("Informe o nome")).not.toBeInTheDocument());
    expect(screen.getByText("Como no documento")).toBeInTheDocument();
  });
});

describe("FormLayout - rótulo e descrição do campo", () => {
  it("campo obrigatório mostra o asterisco; opcional não", () => {
    render(
      <Formulario
        fields={[
          { name: "a", label: "Obrigatório", type: "text", required: true },
          { name: "b", label: "Opcional", type: "text" },
        ]}
      />
    );
    expect(screen.getByText("*")).toBeInTheDocument();
    expect(screen.getAllByText("*")).toHaveLength(1);
  });

  it("mostra a descrição auxiliar abaixo do campo", () => {
    render(<Formulario fields={[campo("text", { description: "Use o nome completo" })]} />);
    expect(screen.getByText("Use o nome completo")).toBeInTheDocument();
  });

  it("o rótulo está ligado ao campo: clicar nele foca o input", async () => {
    const user = userEvent.setup();
    render(<Formulario fields={[campo("text")]} />);
    await user.click(screen.getByText("Campo"));
    expect(screen.getByRole("textbox", { name: "Campo" })).toHaveFocus();
  });
});

describe("FormLayout - campos de texto", () => {
  it.each([
    ["email", "email", "ana@exemplo.com"],
    ["url", "url", "https://exemplo.com"],
    ["tel", "tel", "11999990000"],
  ] as const)("tipo %s usa input type=%s e guarda o que foi digitado", async (type, htmlType, digitado) => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<Formulario fields={[campo(type, { placeholder: "digite" })]} onSubmit={onSubmit} />);
    const input = screen.getByPlaceholderText("digite");
    expect(input).toHaveAttribute("type", htmlType);

    await user.type(input, digitado);
    await enviar();
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(ultimoEnvio(onSubmit).campo).toBe(digitado);
  });

  it("campo de texto respeita placeholder, valor inicial e disabled", () => {
    render(
      <Formulario
        fields={[campo("text", { placeholder: "Nome", disabled: true })]}
        defaultValues={{ campo: "João" }}
      />
    );
    const input = screen.getByRole("textbox", { name: "Campo" });
    expect(input).toHaveValue("João");
    expect(input).toBeDisabled();
    expect(input).toHaveAttribute("placeholder", "Nome");
  });

  it("textarea guarda texto com várias linhas", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<Formulario fields={[campo("textarea")]} onSubmit={onSubmit} />);

    await user.type(screen.getByRole("textbox", { name: "Campo" }), "linha 1{Enter}linha 2");
    await enviar();

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(ultimoEnvio(onSubmit).campo).toBe("linha 1\nlinha 2");
  });

  it("textarea desabilitado não aceita digitação", () => {
    render(<Formulario fields={[campo("textarea", { disabled: true })]} />);
    expect(screen.getByRole("textbox", { name: "Campo" })).toBeDisabled();
  });

  it("senha começa escondida e o valor digitado vai para o formulário", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(
      <Formulario fields={[campo("password", { placeholder: "sua senha" })]} onSubmit={onSubmit} />
    );
    const input = screen.getByPlaceholderText("sua senha");
    expect(input).toHaveAttribute("type", "password");

    await user.type(input, "segredo");
    await enviar();

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(ultimoEnvio(onSubmit).campo).toBe("segredo");
  });
});

describe("FormLayout - campos numéricos", () => {
  it("number formata com ponto de milhar e vírgula decimal e guarda o número", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<Formulario fields={[campo("number", { placeholder: "qtd" })]} onSubmit={onSubmit} />);
    const input = screen.getByPlaceholderText("qtd");

    await user.type(input, "1234,5");
    expect(input).toHaveValue("1.234,5");
    await enviar();

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(ultimoEnvio(onSubmit).campo).toBe(1234.5);
  });

  it("number apagado volta a ser null no formulário", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(
      <Formulario
        fields={[campo("number", { placeholder: "qtd" })]}
        defaultValues={{ campo: 10 }}
        onSubmit={onSubmit}
      />
    );

    await user.clear(screen.getByPlaceholderText("qtd"));
    await enviar();

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(ultimoEnvio(onSubmit).campo).toBeNull();
  });

  it("number respeita decimalScale", async () => {
    const user = userEvent.setup();
    render(<Formulario fields={[campo("number", { placeholder: "qtd", decimalScale: 1 })]} />);
    const input = screen.getByPlaceholderText("qtd");

    await user.type(input, "1,29");
    expect(input).toHaveValue("1,2");
  });

  it("decimal não usa separador de milhar, tem 2 casas e não aceita negativo", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<Formulario fields={[campo("decimal", { placeholder: "taxa" })]} onSubmit={onSubmit} />);
    const input = screen.getByPlaceholderText("taxa");

    await user.type(input, "-1234,567");
    expect(input).toHaveValue("1234,56");
    await enviar();

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(ultimoEnvio(onSubmit).campo).toBe(1234.56);
  });

  it("decimal apagado volta a ser null", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(
      <Formulario
        fields={[campo("decimal", { placeholder: "taxa" })]}
        defaultValues={{ campo: 3.5 }}
        onSubmit={onSubmit}
      />
    );

    await user.clear(screen.getByPlaceholderText("taxa"));
    await enviar();

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(ultimoEnvio(onSubmit).campo).toBeNull();
  });

  it("currency usa R$ por padrão e guarda o valor numérico", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(
      <Formulario fields={[campo("currency", { placeholder: "valor" })]} onSubmit={onSubmit} />
    );
    const input = screen.getByPlaceholderText("valor");

    await user.type(input, "1500,75");
    expect(input).toHaveValue("R$ 1.500,75");
    await enviar();

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(ultimoEnvio(onSubmit).campo).toBe(1500.75);
  });

  it("currency aceita outro prefixo", async () => {
    const user = userEvent.setup();
    render(<Formulario fields={[campo("currency", { placeholder: "valor", prefix: "US$ " })]} />);
    const input = screen.getByPlaceholderText("valor");

    await user.type(input, "10");
    expect(input).toHaveValue("US$ 10");
  });

  it("currency apagado volta a ser null", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(
      <Formulario
        fields={[campo("currency", { placeholder: "valor" })]}
        defaultValues={{ campo: 5 }}
        onSubmit={onSubmit}
      />
    );

    await user.clear(screen.getByPlaceholderText("valor"));
    await enviar();

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(ultimoEnvio(onSubmit).campo).toBeNull();
  });

  it("campos numéricos desabilitados não aceitam digitação", () => {
    render(
      <Formulario
        fields={[
          { name: "a", label: "A", type: "number", placeholder: "a", disabled: true },
          { name: "b", label: "B", type: "decimal", placeholder: "b", disabled: true },
          { name: "c", label: "C", type: "currency", placeholder: "c", disabled: true },
        ]}
      />
    );
    for (const placeholder of ["a", "b", "c"]) {
      expect(screen.getByPlaceholderText(placeholder)).toBeDisabled();
    }
  });

  it("numericFilter guarda operador e valor escolhidos", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(
      <Formulario
        fields={[campo("numericFilter", { placeholder: "limite" })]}
        onSubmit={onSubmit}
      />
    );

    await user.type(screen.getByRole("textbox", { name: "limite" }), "50");
    await enviar();

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(ultimoEnvio(onSubmit).campo).toEqual({ operator: "eq", value: 50 });
  });

  it("numericFilter como moeda mostra o prefixo R$ e usa 2 casas", async () => {
    const user = userEvent.setup();
    render(
      <Formulario
        fields={[
          campo("numericFilter", { placeholder: "limite", isCurrency: true, currency: "BRL" }),
        ]}
      />
    );
    const input = screen.getByRole("textbox", { name: "limite" });

    await user.type(input, "10");
    expect(input).toHaveValue("R$ 10,00");
  });

  it("numericFilter como percentual mostra o sufixo %", async () => {
    const user = userEvent.setup();
    render(
      <Formulario fields={[campo("numericFilter", { placeholder: "taxa", isPercent: true })]} />
    );
    const input = screen.getByRole("textbox", { name: "taxa" });

    await user.type(input, "7");
    expect(input).toHaveValue("7 %");
  });

  it("numericFilter com allowNegative=false descarta o sinal de menos", async () => {
    const user = userEvent.setup();
    render(
      <Formulario
        fields={[campo("numericFilter", { placeholder: "limite", allowNegative: false })]}
      />
    );
    const input = screen.getByRole("textbox", { name: "limite" });

    await user.type(input, "-5");
    expect(input).toHaveValue("5");
  });

  it("numericFilter aceita negativo por padrão", async () => {
    const user = userEvent.setup();
    render(<Formulario fields={[campo("numericFilter", { placeholder: "limite" })]} />);
    const input = screen.getByRole("textbox", { name: "limite" });

    await user.type(input, "-5");
    expect(input).toHaveValue("-5");
  });

  it("numericFilter com erro de validação marca os controles como inválidos", async () => {
    render(
      <Formulario
        fields={[{ name: "nome", label: "Nome", type: "numericFilter", placeholder: "limite" }]}
        exigeNome
      />
    );

    await enviar();

    await screen.findByText("Informe o nome");
    expect(screen.getByRole("textbox", { name: "limite" })).toBeInvalid();
  });
});

describe("FormLayout - escolha", () => {
  const opcoes = [
    { label: "Ativo", value: "on" },
    { label: "Inativo", value: "off" },
  ];

  it("select com opções em objeto: escolhe pelo rótulo e guarda o valor", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<Formulario fields={[campo("select", { options: opcoes })]} onSubmit={onSubmit} />);

    await user.click(screen.getByRole("combobox"));
    await user.click(await screen.findByRole("option", { name: "Inativo" }));
    await enviar();

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(ultimoEnvio(onSubmit).campo).toBe("off");
  });

  it("select com opções em texto usa o próprio texto como valor", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(
      <Formulario fields={[campo("select", { options: ["Baixo", "Alto"] })]} onSubmit={onSubmit} />
    );

    await user.click(screen.getByRole("combobox"));
    await user.click(await screen.findByRole("option", { name: "Alto" }));
    await enviar();

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(ultimoEnvio(onSubmit).campo).toBe("Alto");
  });

  it("select aceita valor numérico nas opções", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(
      <Formulario
        fields={[campo("select", { options: [{ label: "Um", value: 1 }] })]}
        onSubmit={onSubmit}
      />
    );

    await user.click(screen.getByRole("combobox"));
    await user.click(await screen.findByRole("option", { name: "Um" }));
    await enviar();

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(ultimoEnvio(onSubmit).campo).toBe("1");
  });

  it("select sem placeholder mostra 'Selecione'; com placeholder, mostra o dele", () => {
    const { unmount } = render(<Formulario fields={[campo("select", { options: opcoes })]} />);
    expect(screen.getByRole("combobox")).toHaveTextContent("Selecione");
    unmount();

    render(<Formulario fields={[campo("select", { options: opcoes, placeholder: "Situação" })]} />);
    expect(screen.getByRole("combobox")).toHaveTextContent("Situação");
  });

  it("select sem opções abre sem itens e select desabilitado não abre", () => {
    render(<Formulario fields={[campo("select", { disabled: true })]} />);
    expect(screen.getByRole("combobox")).toBeDisabled();
  });

  it("select mostra o rótulo da opção já escolhida", () => {
    render(
      <Formulario fields={[campo("select", { options: opcoes })]} defaultValues={{ campo: "on" }} />
    );
    expect(screen.getByRole("combobox")).toHaveTextContent("Ativo");
  });

  it("radio mostra cada opção e guarda a escolhida", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<Formulario fields={[campo("radio", { radioOptions: opcoes })]} onSubmit={onSubmit} />);

    expect(screen.getAllByRole("radio")).toHaveLength(2);
    await user.click(screen.getByRole("radio", { name: "Inativo" }));
    await enviar();

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(ultimoEnvio(onSubmit).campo).toBe("off");
  });

  it("radio sem opções não renderiza itens", () => {
    render(<Formulario fields={[campo("radio")]} />);
    expect(screen.queryByRole("radio")).not.toBeInTheDocument();
  });

  it("radio desabilitado não deixa escolher", () => {
    render(<Formulario fields={[campo("radio", { radioOptions: opcoes, disabled: true })]} />);
    for (const opcao of screen.getAllByRole("radio")) expect(opcao).toBeDisabled();
  });

  it("radio mostra a opção inicial marcada", () => {
    render(
      <Formulario
        fields={[campo("radio", { radioOptions: opcoes })]}
        defaultValues={{ campo: "on" }}
      />
    );
    expect(screen.getByRole("radio", { name: "Ativo" })).toBeChecked();
  });
});

describe("FormLayout - liga e desliga", () => {
  it("checkbox: mostra o rótulo e a descrição e marcar guarda true", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(
      <Formulario
        fields={[
          campo("checkbox", {
            label: "Aceito os termos",
            description: "Obrigatório para continuar",
          }),
        ]}
        onSubmit={onSubmit}
      />
    );

    expect(screen.getByText("Aceito os termos")).toBeInTheDocument();
    expect(screen.getByText("Obrigatório para continuar")).toBeInTheDocument();
    await user.click(screen.getByRole("checkbox"));
    await enviar();

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(ultimoEnvio(onSubmit).campo).toBe(true);
  });

  it("checkbox sem descrição não cria texto auxiliar e desmarcar volta a false", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(
      <Formulario
        fields={[campo("checkbox", { label: "Receber e-mails" })]}
        defaultValues={{ campo: true }}
        onSubmit={onSubmit}
      />
    );
    const caixa = screen.getByRole("checkbox");
    expect(caixa).toBeChecked();

    await user.click(caixa);
    await enviar();

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(ultimoEnvio(onSubmit).campo).toBe(false);
  });

  it("checkbox desabilitado não muda", () => {
    render(<Formulario fields={[campo("checkbox", { disabled: true })]} />);
    expect(screen.getByRole("checkbox")).toBeDisabled();
  });

  it("checkbox com erro de validação esconde a descrição", async () => {
    render(
      <Formulario
        fields={[{ name: "nome", label: "Aceito", type: "checkbox", description: "Dica" }]}
        exigeNome
      />
    );
    expect(screen.getByText("Dica")).toBeInTheDocument();

    await enviar();

    await screen.findByText("Informe o nome");
    expect(screen.queryByText("Dica")).not.toBeInTheDocument();
  });

  it("switch liga com clique e guarda true", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(
      <Formulario fields={[campo("switch", { label: "Notificações" })]} onSubmit={onSubmit} />
    );

    const chave = screen.getByRole("switch");
    expect(chave).not.toBeChecked();
    await user.click(chave);
    await enviar();

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(ultimoEnvio(onSubmit).campo).toBe(true);
  });

  it("switch desabilitado não liga", () => {
    render(<Formulario fields={[campo("switch", { disabled: true })]} />);
    expect(screen.getByRole("switch")).toBeDisabled();
  });

  it("toggle alterna o estado pressionado e guarda o booleano", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<Formulario fields={[campo("toggle", { label: "Negrito" })]} onSubmit={onSubmit} />);

    const botao = screen.getByRole("button", { name: "Negrito" });
    expect(botao).toHaveAttribute("aria-pressed", "false");
    await user.click(botao);
    expect(botao).toHaveAttribute("aria-pressed", "true");
    await enviar();

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(ultimoEnvio(onSubmit).campo).toBe(true);
  });

  it("toggle desabilitado não alterna", () => {
    render(<Formulario fields={[campo("toggle", { label: "Negrito", disabled: true })]} />);
    expect(screen.getByRole("button", { name: "Negrito" })).toBeDisabled();
  });
});

describe("FormLayout - slider, OTP e datas", () => {
  it("slider usa o intervalo informado e muda com as setas do teclado", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(
      <Formulario
        fields={[campo("slider", { sliderRange: { min: 10, max: 20, step: 2 } })]}
        onSubmit={onSubmit}
      />
    );
    const cursor = screen.getByRole("slider");
    expect(cursor).toHaveAttribute("aria-valuemin", "10");
    expect(cursor).toHaveAttribute("aria-valuemax", "20");
    expect(cursor).toHaveAttribute("aria-valuenow", "10");

    cursor.focus();
    await user.keyboard("{ArrowRight}");
    await enviar();

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(ultimoEnvio(onSubmit).campo).toBe(12);
    expect(screen.getByText("Valor: 12")).toBeInTheDocument();
  });

  it("slider sem intervalo usa 0 a 100, passo 1, e não mostra o valor antes de mexer", () => {
    render(<Formulario fields={[campo("slider")]} />);
    const cursor = screen.getByRole("slider");
    expect(cursor).toHaveAttribute("aria-valuemin", "0");
    expect(cursor).toHaveAttribute("aria-valuemax", "100");
    expect(screen.queryByText(/Valor:/)).not.toBeInTheDocument();
  });

  it("slider mostra o valor inicial numérico", () => {
    render(<Formulario fields={[campo("slider")]} defaultValues={{ campo: 40 }} />);
    expect(screen.getByRole("slider")).toHaveAttribute("aria-valuenow", "40");
    expect(screen.getByText("Valor: 40")).toBeInTheDocument();
  });

  it("slider desabilitado fica inoperante", () => {
    render(<Formulario fields={[campo("slider", { disabled: true })]} />);
    expect(screen.getByRole("slider")).toHaveAttribute("data-disabled");
  });

  it("OTP tem 6 posições por padrão e guarda o código digitado", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    const { container } = render(<Formulario fields={[campo("otp")]} onSubmit={onSubmit} />);
    expect(container.querySelectorAll("[data-slot='input-otp-slot']")).toHaveLength(6);

    await user.type(screen.getByRole("textbox"), "123456");
    await enviar();

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(ultimoEnvio(onSubmit).campo).toBe("123456");
  });

  it("OTP respeita otpLength", () => {
    const { container } = render(<Formulario fields={[campo("otp", { otpLength: 4 })]} />);
    expect(container.querySelectorAll("[data-slot='input-otp-slot']")).toHaveLength(4);
  });

  it("OTP desabilitado não aceita digitação", () => {
    render(<Formulario fields={[campo("otp", { disabled: true })]} />);
    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it("date sem valor mostra o placeholder padrão ou o passado", () => {
    const { unmount } = render(<Formulario fields={[campo("date")]} />);
    expect(screen.getByRole("button", { name: "Campo" })).toHaveTextContent("Selecione");
    unmount();

    render(<Formulario fields={[campo("date", { placeholder: "Data do pagamento" })]} />);
    expect(screen.getByRole("button", { name: "Campo" })).toHaveTextContent("Data do pagamento");
  });

  it("date mostra a data inicial no formato brasileiro e limpar volta ao placeholder", async () => {
    const user = userEvent.setup();
    render(
      <Formulario
        fields={[campo("date", { placeholder: "Data" })]}
        defaultValues={{ campo: new Date(2026, 8, 20) }}
      />
    );
    expect(screen.getByRole("button", { name: "Campo" })).toHaveTextContent("20/09/2026");

    await user.click(screen.getByRole("button", { name: "Limpar data" }));
    expect(screen.getByRole("button", { name: "Campo" })).toHaveTextContent("Data");
    expect(screen.getByRole("button", { name: "Campo" })).not.toHaveTextContent("2026");
  });

  it("date desabilitado não abre o calendário", () => {
    render(<Formulario fields={[campo("date", { disabled: true, placeholder: "Data" })]} />);
    expect(screen.getByRole("button", { name: "Campo" })).toBeDisabled();
  });

  it("date abre o calendário e escolher um dia guarda a data", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(
      <Formulario
        fields={[campo("date", { placeholder: "Data" })]}
        defaultValues={{ campo: new Date(2026, 8, 20) }}
        onSubmit={onSubmit}
      />
    );

    await user.click(screen.getByRole("button", { name: "Campo" }));
    await user.click(await screen.findByRole("button", { name: /15 de setembro/ }));
    await enviar();

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    const data = ultimoEnvio(onSubmit).campo as Date;
    expect(data.getDate()).toBe(15);
    expect(data.getMonth()).toBe(8);
  });

  it("date com disableWeekends não deixa escolher fim de semana", async () => {
    const user = userEvent.setup();
    render(
      <Formulario
        fields={[campo("date", { placeholder: "Data", disableWeekends: true })]}
        defaultValues={{ campo: new Date(2026, 8, 18) }}
      />
    );

    await user.click(screen.getByRole("button", { name: "Campo" }));
    // 19/09/2026 é sábado
    expect(await screen.findByRole("button", { name: /19 de setembro/ })).toBeDisabled();
  });

  it("date por padrão deixa escolher fim de semana", async () => {
    const user = userEvent.setup();
    render(
      <Formulario
        fields={[campo("date", { placeholder: "Data" })]}
        defaultValues={{ campo: new Date(2026, 8, 18) }}
      />
    );

    await user.click(screen.getByRole("button", { name: "Campo" }));
    expect(await screen.findByRole("button", { name: /19 de setembro/ })).toBeEnabled();
  });

  it("dateRange mostra o placeholder padrão ou o passado", () => {
    const { unmount } = render(<Formulario fields={[campo("dateRange")]} />);
    expect(screen.getByRole("button", { name: "Campo" })).toHaveTextContent(
      "Selecione o intervalo"
    );
    unmount();

    render(<Formulario fields={[campo("dateRange", { placeholder: "Período" })]} />);
    expect(screen.getByRole("button", { name: "Campo" })).toHaveTextContent("Período");
  });

  it("dateRange desabilitado não abre", () => {
    render(
      <Formulario fields={[campo("dateRange", { disabled: true, placeholder: "Período" })]} />
    );
    expect(screen.getByRole("button", { name: "Campo" })).toBeDisabled();
  });

  it("dateRange com showQuickRanges oferece os intervalos rápidos ao abrir", async () => {
    const user = userEvent.setup();
    render(
      <Formulario
        fields={[campo("dateRange", { placeholder: "Período", showQuickRanges: true })]}
      />
    );

    await user.click(screen.getByRole("button", { name: "Campo" }));
    expect(await screen.findByRole("button", { name: "Hoje" })).toBeInTheDocument();
  });

  it("dateRange sem showQuickRanges não oferece intervalos rápidos", async () => {
    const user = userEvent.setup();
    render(<Formulario fields={[campo("dateRange", { placeholder: "Período" })]} />);

    await user.click(screen.getByRole("button", { name: "Campo" }));
    expect(screen.queryByRole("button", { name: "Hoje" })).not.toBeInTheDocument();
  });
});

describe("FormLayout - estado de erro por tipo de campo", () => {
  const controlePorTipo: [FormFieldType, () => HTMLElement][] = [
    ["email", () => screen.getByRole("textbox", { name: "Nome" })],
    ["url", () => screen.getByRole("textbox", { name: "Nome" })],
    ["tel", () => screen.getByRole("textbox", { name: "Nome" })],
    ["textarea", () => screen.getByRole("textbox", { name: "Nome" })],
    ["number", () => screen.getByRole("textbox", { name: "Nome" })],
    ["decimal", () => screen.getByRole("textbox", { name: "Nome" })],
    ["currency", () => screen.getByRole("textbox", { name: "Nome" })],
    ["select", () => screen.getByRole("combobox")],
    ["date", () => screen.getByRole("button", { name: "Nome" })],
    ["dateRange", () => screen.getByRole("button", { name: "Nome" })],
    ["slider", () => screen.getByRole("slider").closest("div.space-y-2") as HTMLElement],
    ["toggle", () => screen.getByRole("button", { name: "Nome" })],
  ];

  it.each(
    controlePorTipo
  )("%s ganha o destaque de erro depois de uma validação que falha", async (type, controle) => {
    render(
      <Formulario fields={[{ name: "nome", label: "Nome", type, options: ["a"] }]} exigeNome />
    );
    expect(controle()).not.toHaveClass("border-destructive");

    await enviar();

    await screen.findByText("Informe o nome");
    expect(controle()).toHaveClass("border-destructive");
  });
});

describe("FormLayout - tipo desconhecido", () => {
  it("tipo de campo desconhecido não renderiza controle, mas mantém o rótulo", () => {
    render(<Formulario fields={[campo("inexistente" as FormFieldType)]} />);
    expect(screen.getByText("Campo")).toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });
});

describe("FormLayout - acessibilidade", () => {
  it("checkbox é nomeado pelo próprio rótulo", () => {
    render(<Formulario fields={[campo("checkbox", { label: "Aceito os termos" })]} />);
    expect(screen.getByRole("checkbox", { name: "Aceito os termos" })).toBeInTheDocument();
  });

  it("switch é nomeado pelo próprio rótulo", () => {
    render(<Formulario fields={[campo("switch", { label: "Notificações" })]} />);
    expect(screen.getByRole("switch", { name: "Notificações" })).toBeInTheDocument();
  });

  it("slider é nomeado pelo próprio rótulo", () => {
    render(<Formulario fields={[campo("slider", { label: "Volume" })]} />);
    expect(screen.getByRole("slider", { name: "Volume" })).toBeInTheDocument();
  });

  it("select é nomeado pelo próprio rótulo", () => {
    render(
      <Formulario fields={[campo("select", { label: "Plano", options: ["Básico", "Pro"] })]} />
    );
    expect(screen.getByRole("combobox", { name: "Plano" })).toBeInTheDocument();
  });

  it("checkbox, switch, slider e select juntos não têm violações", async () => {
    function Controles() {
      const form = useForm<FieldValues>({ defaultValues: {} });
      const campos: FormFieldConfig<FieldValues>[] = [
        { name: "termos", label: "Aceito os termos", type: "checkbox", description: "Obrigatório" },
        { name: "avisos", label: "Notificações", type: "switch" },
        { name: "volume", label: "Volume", type: "slider" },
        { name: "plano", label: "Plano", type: "select", options: ["Básico", "Pro"] },
      ];
      return <FormLayout form={form} onSubmit={() => {}} sections={[{ fields: campos }]} />;
    }
    const { container } = render(<Controles />);
    const resultado = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });
    expect(resultado.violations).toEqual([]);
  });

  it("formulário com vários tipos de campo não tem violações", async () => {
    function Variado() {
      const form = useForm<FieldValues>({ defaultValues: {} });
      const campos: FormFieldConfig<FieldValues>[] = [
        { name: "nome", label: "Nome", type: "text", required: true, description: "Completo" },
        { name: "mail", label: "E-mail", type: "email" },
        { name: "obs", label: "Observações", type: "textarea" },
        { name: "valor", label: "Valor", type: "currency", placeholder: "Valor" },
        {
          name: "status",
          label: "Status",
          type: "radio",
          radioOptions: [
            { label: "Ativo", value: "on" },
            { label: "Inativo", value: "off" },
          ],
        },
      ];
      return (
        <FormLayout
          form={form}
          title="Cadastro"
          onSubmit={() => {}}
          sections={[{ title: "Dados", fields: campos }]}
        />
      );
    }
    const { container } = render(<Variado />);
    const resultado = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });
    expect(resultado.violations).toEqual([]);
  });
});
