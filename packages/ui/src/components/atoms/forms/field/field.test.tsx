import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Input } from "../input/input";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from "./field";

describe("Field", () => {
  describe("Renderização", () => {
    it("deve renderizar o Field", () => {
      render(
        <Field>
          <FieldLabel htmlFor="test">Teste</FieldLabel>
          <Input id="test" />
        </Field>
      );
      const label = screen.getByText("Teste");
      expect(label).toBeInTheDocument();
    });

    it("deve renderizar FieldLabel", () => {
      render(
        <Field>
          <FieldLabel htmlFor="test">Label</FieldLabel>
        </Field>
      );
      const label = screen.getByText("Label");
      expect(label).toBeInTheDocument();
    });

    it("deve renderizar FieldDescription", () => {
      render(
        <Field>
          <FieldLabel htmlFor="test">Label</FieldLabel>
          <FieldDescription>Descrição do campo</FieldDescription>
        </Field>
      );
      const description = screen.getByText("Descrição do campo");
      expect(description).toBeInTheDocument();
    });

    it("deve renderizar FieldError", () => {
      render(
        <Field>
          <FieldLabel htmlFor="test">Label</FieldLabel>
          <FieldError>Erro no campo</FieldError>
        </Field>
      );
      const error = screen.getByText("Erro no campo");
      expect(error).toBeInTheDocument();
    });
  });

  describe("Associação Label-Input", () => {
    it("deve associar label ao input via htmlFor", async () => {
      const user = userEvent.setup();
      render(
        <Field>
          <FieldLabel htmlFor="email">E-mail</FieldLabel>
          <Input id="email" placeholder="email@exemplo.com" />
        </Field>
      );
      const label = screen.getByText("E-mail");
      const input = screen.getByPlaceholderText("email@exemplo.com");
      await user.click(label);
      expect(input).toHaveFocus();
    });
  });

  describe("Orientação", () => {
    it("deve renderizar com orientação vertical por padrão", () => {
      const { container } = render(
        <Field>
          <FieldLabel htmlFor="test">Label</FieldLabel>
          <Input id="test" />
        </Field>
      );
      const field = container.querySelector('[data-slot="field"]');
      expect(field).toBeInTheDocument();
    });

    it("deve renderizar com orientação horizontal", () => {
      const { container } = render(
        <Field orientation="horizontal">
          <FieldLabel htmlFor="test">Label</FieldLabel>
          <Input id="test" />
        </Field>
      );
      const field = container.querySelector('[data-slot="field"]');
      expect(field).toBeInTheDocument();
    });
  });

  describe("Acessibilidade", () => {
    it("deve ter estrutura semântica correta", () => {
      render(
        <Field>
          <FieldLabel htmlFor="test">Label</FieldLabel>
          <FieldDescription>Descrição</FieldDescription>
          <Input id="test" />
          <FieldError>Erro</FieldError>
        </Field>
      );
      const label = screen.getByText("Label");
      const input = screen.getByLabelText("Label");
      expect(label).toBeInTheDocument();
      expect(input).toBeInTheDocument();
    });
  });
});

describe("Field - orientação e agrupamento", () => {
  it("deve expor a orientação escolhida em data-orientation", () => {
    render(
      <>
        <Field aria-label="padrão" />
        <Field aria-label="horizontal" orientation="horizontal" />
        <Field aria-label="responsivo" orientation="responsive" />
      </>
    );

    expect(screen.getByRole("group", { name: "padrão" })).toHaveAttribute(
      "data-orientation",
      "vertical"
    );
    expect(screen.getByRole("group", { name: "horizontal" })).toHaveAttribute(
      "data-orientation",
      "horizontal"
    );
    expect(screen.getByRole("group", { name: "responsivo" })).toHaveAttribute(
      "data-orientation",
      "responsive"
    );
  });

  it("deve agrupar campos em um fieldset com legenda acessível", () => {
    render(
      <FieldSet>
        <FieldLegend>Dados pessoais</FieldLegend>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="nome">Nome</FieldLabel>
            <Input id="nome" />
          </Field>
        </FieldGroup>
      </FieldSet>
    );

    const grupo = screen.getByRole("group", { name: "Dados pessoais" });
    expect(grupo).toContainElement(screen.getByRole("textbox", { name: "Nome" }));
  });

  it("deve usar a variante legend por padrão e aceitar a variante label", () => {
    render(
      <>
        <FieldLegend>Título</FieldLegend>
        <FieldLegend variant="label">Rótulo</FieldLegend>
      </>
    );

    expect(screen.getByText("Título")).toHaveAttribute("data-variant", "legend");
    expect(screen.getByText("Rótulo")).toHaveAttribute("data-variant", "label");
  });

  it("deve repassar className e props aos blocos de layout", () => {
    render(
      <FieldSet className="meu-set" data-testid="set">
        <FieldGroup className="meu-grupo" data-testid="grupo">
          <Field className="meu-campo" aria-label="campo">
            <FieldContent className="meu-conteudo" data-testid="conteudo">
              <FieldTitle className="meu-titulo">Título do campo</FieldTitle>
            </FieldContent>
          </Field>
        </FieldGroup>
      </FieldSet>
    );

    expect(screen.getByTestId("set")).toHaveClass("meu-set");
    expect(screen.getByTestId("grupo")).toHaveClass("meu-grupo");
    expect(screen.getByRole("group", { name: "campo" })).toHaveClass("meu-campo");
    expect(screen.getByTestId("conteudo")).toHaveClass("meu-conteudo");
    expect(screen.getByText("Título do campo")).toHaveClass("meu-titulo");
  });

  it("deve renderizar FieldTitle como rótulo visual do campo sem associar a um input", () => {
    render(
      <Field>
        <FieldTitle>Preferências</FieldTitle>
      </Field>
    );

    expect(screen.getByText("Preferências")).toHaveAttribute("data-slot", "field-label");
  });
});

describe("FieldSeparator", () => {
  it("deve renderizar só a linha quando não há texto", () => {
    render(<FieldSeparator data-testid="sep" />);

    const separador = screen.getByTestId("sep");
    expect(separador).toHaveAttribute("data-content", "false");
    expect(separador.querySelector('[data-slot="field-separator-content"]')).toBeNull();
  });

  it("deve exibir o texto sobre a linha quando informado", () => {
    render(<FieldSeparator data-testid="sep">ou continue com</FieldSeparator>);

    expect(screen.getByTestId("sep")).toHaveAttribute("data-content", "true");
    expect(screen.getByText("ou continue com")).toBeInTheDocument();
  });
});

describe("FieldError - mensagens", () => {
  it("não deve renderizar nada sem filhos e sem erros", () => {
    render(<FieldError />);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("não deve renderizar nada com lista de erros vazia", () => {
    render(<FieldError errors={[]} />);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("deve exibir a mensagem de um único erro como texto", () => {
    render(<FieldError errors={[{ message: "E-mail inválido" }]} />);

    const alerta = screen.getByRole("alert");
    expect(alerta).toHaveTextContent("E-mail inválido");
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("deve listar vários erros diferentes", () => {
    render(<FieldError errors={[{ message: "Muito curto" }, { message: "Falta um número" }]} />);

    const itens = screen.getAllByRole("listitem");
    expect(itens.map((item) => item.textContent)).toEqual(["Muito curto", "Falta um número"]);
  });

  it("deve esconder mensagens repetidas", () => {
    render(<FieldError errors={[{ message: "Obrigatório" }, { message: "Obrigatório" }]} />);

    expect(screen.getByRole("alert")).toHaveTextContent("Obrigatório");
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("deve ignorar erros sem mensagem na lista", () => {
    render(<FieldError errors={[{ message: "Muito curto" }, undefined, {}]} />);

    expect(screen.getAllByRole("listitem")).toHaveLength(1);
    expect(screen.getByRole("listitem")).toHaveTextContent("Muito curto");
  });

  it("deve preferir os filhos à lista de erros", () => {
    render(<FieldError errors={[{ message: "Da lista" }]}>Dos filhos</FieldError>);

    expect(screen.getByRole("alert")).toHaveTextContent("Dos filhos");
    expect(screen.queryByText("Da lista")).not.toBeInTheDocument();
  });

  it("não deve renderizar alerta quando o único erro não tem mensagem", () => {
    render(<FieldError errors={[undefined]} />);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
