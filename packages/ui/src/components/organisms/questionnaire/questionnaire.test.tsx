import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Questionnaire, type QuestionnaireQuestion, QuestionnaireSummary } from "./questionnaire";

const perguntas: QuestionnaireQuestion[] = [
  {
    id: "entrada",
    title: "Como a pessoa entra?",
    choices: [
      { value: "senha", label: "E-mail e senha" },
      { value: "link", label: "Link mágico por e-mail" },
      { value: "social", label: "Conta do Google ou GitHub" },
    ],
  },
  {
    id: "esqueci",
    title: "Tem “esqueci a senha”?",
    choices: [
      { value: "sim", label: "Sim, com link por e-mail" },
      { value: "nao", label: "Não" },
    ],
  },
];

describe("Questionnaire", () => {
  it("mostra a pergunta atual, o progresso, as opções e a resposta livre", () => {
    render(<Questionnaire questions={perguntas} onSubmit={vi.fn()} />);
    expect(screen.getByText("Pergunta 1 de 2")).toBeInTheDocument();
    const grupo = screen.getByRole("radiogroup", { name: "Como a pessoa entra?" });
    expect(grupo).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(3);
    expect(screen.getByRole("radio", { name: /E-mail e senha/ })).toHaveAttribute(
      "aria-checked",
      "false"
    );
    expect(screen.getByRole("textbox", { name: "Outra resposta" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Pular" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Próxima" })).toBeInTheDocument();
  });

  it("não avança sem resposta e diz o que falta", async () => {
    render(<Questionnaire questions={perguntas} onSubmit={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: "Próxima" }));
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Escolha uma opção ou escreva a sua resposta."
    );
    expect(screen.getByRole("radiogroup")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText("Pergunta 1 de 2")).toBeInTheDocument();
  });

  it("avança, leva o foco para a pergunta seguinte e envia todas as respostas no fim", async () => {
    const onSubmit = vi.fn();
    render(<Questionnaire questions={perguntas} onSubmit={onSubmit} />);
    await userEvent.click(screen.getByRole("radio", { name: /Link mágico/ }));
    expect(screen.getByRole("radio", { name: /Link mágico/ })).toHaveAttribute(
      "aria-checked",
      "true"
    );
    await userEvent.click(screen.getByRole("button", { name: "Próxima" }));

    expect(screen.getByText("Pergunta 2 de 2")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Tem “esqueci a senha”?" })).toHaveFocus();
    expect(screen.queryByRole("button", { name: "Próxima" })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("radio", { name: /Sim, com link/ }));
    await userEvent.click(screen.getByRole("button", { name: "Enviar" }));
    expect(onSubmit).toHaveBeenCalledWith([
      {
        questionId: "entrada",
        question: "Como a pessoa entra?",
        answer: "Link mágico por e-mail",
        skipped: false,
      },
      {
        questionId: "esqueci",
        question: "Tem “esqueci a senha”?",
        answer: "Sim, com link por e-mail",
        skipped: false,
      },
    ]);
  });

  it("escolhe pela tecla do número, mas não enquanto a pessoa digita a resposta livre", async () => {
    render(<Questionnaire questions={perguntas} onSubmit={vi.fn()} />);
    await userEvent.click(screen.getByRole("radio", { name: /E-mail e senha/ }));
    await userEvent.keyboard("3");
    expect(screen.getByRole("radio", { name: /Conta do Google/ })).toHaveAttribute(
      "aria-checked",
      "true"
    );
    // o foco vai junto, para o anel de foco não ficar numa opção e a marca em outra
    expect(screen.getByRole("radio", { name: /Conta do Google/ })).toHaveFocus();

    const livre = screen.getByRole("textbox", { name: "Outra resposta" });
    await userEvent.type(livre, "SSO 2");
    expect(livre).toHaveValue("SSO 2");
    expect(screen.getByRole("radio", { name: /Link mágico/ })).toHaveAttribute(
      "aria-checked",
      "false"
    );
    // digitar a resposta livre desmarca a opção escolhida antes
    expect(screen.getByRole("radio", { name: /Conta do Google/ })).toHaveAttribute(
      "aria-checked",
      "false"
    );
  });

  it("aceita a resposta livre e envia com Enter dentro do campo", async () => {
    const onSubmit = vi.fn();
    render(<Questionnaire questions={[perguntas[0]]} onSubmit={onSubmit} />);
    await userEvent.type(
      screen.getByRole("textbox", { name: "Outra resposta" }),
      "SSO da empresa{Enter}"
    );
    expect(onSubmit).toHaveBeenCalledWith([
      {
        questionId: "entrada",
        question: "Como a pessoa entra?",
        answer: "SSO da empresa",
        skipped: false,
      },
    ]);
  });

  it("pula a pergunta e, na última, envia o que tem", async () => {
    const onSubmit = vi.fn();
    render(<Questionnaire questions={perguntas} onSubmit={onSubmit} />);
    await userEvent.click(screen.getByRole("button", { name: "Pular" }));
    expect(screen.getByText("Pergunta 2 de 2")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Pular" }));
    expect(onSubmit).toHaveBeenCalledWith([
      { questionId: "entrada", question: "Como a pessoa entra?", answer: "", skipped: true },
      { questionId: "esqueci", question: "Tem “esqueci a senha”?", answer: "", skipped: true },
    ]);
  });

  it("com uma pergunta só, não mostra progresso e o botão já é Enviar", () => {
    render(<Questionnaire questions={[perguntas[1]]} onSubmit={vi.fn()} />);
    expect(screen.queryByText(/Pergunta 1 de 1/)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Enviar" })).toBeInTheDocument();
  });

  it("enquanto a pergunta ainda está sendo montada, só avisa que está preparando", () => {
    render(<Questionnaire questions={[]} preparing onSubmit={vi.fn()} />);
    expect(screen.getByText("Preparando a pergunta…")).toBeInTheDocument();
    expect(screen.queryByRole("radiogroup")).not.toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});

describe("QuestionnaireSummary", () => {
  it("lista cada pergunta apagada com a resposta em destaque, e marca a pulada", () => {
    render(
      <QuestionnaireSummary
        answers={[
          {
            questionId: "entrada",
            question: "Como a pessoa entra?",
            answer: "E-mail e senha",
            skipped: false,
          },
          { questionId: "esqueci", question: "Tem “esqueci a senha”?", answer: "", skipped: true },
        ]}
      />
    );
    const itens = screen.getAllByRole("listitem");
    expect(itens).toHaveLength(2);
    expect(itens[0]).toHaveTextContent("Como a pessoa entra? E-mail e senha");
    expect(screen.getByText("Como a pessoa entra?")).toHaveClass("text-muted-foreground");
    expect(itens[1]).toHaveTextContent("Pulou");
  });
});
