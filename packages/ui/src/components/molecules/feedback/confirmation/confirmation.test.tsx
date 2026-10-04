import { render, screen } from "@testing-library/react";
import axe from "axe-core";
import { describe, expect, it, vi } from "vitest";
import {
  Confirmation,
  ConfirmationAccepted,
  ConfirmationAction,
  ConfirmationActions,
  ConfirmationRejected,
  ConfirmationRequest,
  ConfirmationTitle,
} from "./confirmation";

function Pedido({
  state,
  approved,
}: {
  state: "approval-requested" | "approval-responded";
  approved?: boolean;
}) {
  return (
    <Confirmation
      state={state}
      approval={approved === undefined ? { id: "1" } : { id: "1", approved }}
    >
      <ConfirmationTitle>
        <ConfirmationRequest>Apagar a pasta dist/ do pacote ui?</ConfirmationRequest>
        <ConfirmationAccepted>Permitido: a pasta dist/ foi apagada</ConfirmationAccepted>
        <ConfirmationRejected>Negado: nada foi apagado</ConfirmationRejected>
      </ConfirmationTitle>
      <ConfirmationActions>
        <ConfirmationAction variant="outline">Negar</ConfirmationAction>
        <ConfirmationAction>Permitir</ConfirmationAction>
      </ConfirmationActions>
    </Confirmation>
  );
}

describe("Confirmation", () => {
  it("pedido mostra a pergunta e as duas ações", () => {
    render(<Pedido state="approval-requested" />);
    expect(screen.getByText("Apagar a pasta dist/ do pacote ui?")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Negar" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Permitir" })).toBeInTheDocument();
  });

  it("respondido some com as ações e mostra o resultado", () => {
    const { rerender } = render(<Pedido state="approval-responded" approved />);
    expect(screen.getByText("Permitido: a pasta dist/ foi apagada")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    rerender(<Pedido state="approval-responded" approved={false} />);
    expect(screen.getByText("Negado: nada foi apagado")).toBeInTheDocument();
  });

  it("a classe de quem usa soma com a da ação, sem apagar o espaçamento da ação", () => {
    render(
      <Confirmation state="approval-requested" approval={{ id: "1" }}>
        <ConfirmationActions>
          <ConfirmationAction className="w-full">Permitir</ConfirmationAction>
        </ConfirmationActions>
      </Confirmation>
    );
    const button = screen.getByRole("button", { name: "Permitir" });
    expect(button.className).toMatch(/\bw-full\b/);
    expect(button.className).toMatch(/\bpx-3\.5\b/);
  });
});

type EstadoDoPedido = Parameters<typeof Confirmation>[0]["state"];

function PedidoCompleto({
  state,
  approval,
}: {
  state: EstadoDoPedido;
  approval?: { id: string; approved?: boolean };
}) {
  return (
    <Confirmation state={state} approval={approval as never}>
      <ConfirmationTitle>
        <ConfirmationRequest>Pergunta</ConfirmationRequest>
        <ConfirmationAccepted>Permitido</ConfirmationAccepted>
        <ConfirmationRejected>Negado</ConfirmationRejected>
      </ConfirmationTitle>
      <ConfirmationActions>
        <ConfirmationAction>Permitir</ConfirmationAction>
      </ConfirmationActions>
    </Confirmation>
  );
}

describe("Confirmation: quando aparece e o que mostra em cada estado", () => {
  it("sem approval não renderiza nada", () => {
    const { container } = render(<PedidoCompleto state="approval-requested" />);
    expect(container).toBeEmptyDOMElement();
  });

  it.each([
    "input-streaming",
    "input-available",
  ] as const)("no estado %s ainda não há pedido para mostrar", (state) => {
    const { container } = render(<PedidoCompleto state={state} approval={{ id: "1" }} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("pedido pendente mostra só a pergunta, nem permitido nem negado", () => {
    render(<PedidoCompleto state="approval-requested" approval={{ id: "1" }} />);
    expect(screen.getByText("Pergunta")).toBeInTheDocument();
    expect(screen.queryByText("Permitido")).not.toBeInTheDocument();
    expect(screen.queryByText("Negado")).not.toBeInTheDocument();
  });

  it("aprovado mas ainda pendente não anuncia o resultado", () => {
    render(<PedidoCompleto state="approval-requested" approval={{ id: "1", approved: true }} />);
    expect(screen.queryByText("Permitido")).not.toBeInTheDocument();
  });

  it("negado mas ainda pendente não anuncia o resultado", () => {
    render(<PedidoCompleto state="approval-requested" approval={{ id: "1", approved: false }} />);
    expect(screen.queryByText("Negado")).not.toBeInTheDocument();
  });

  it.each([
    "approval-responded",
    "output-denied",
    "output-available",
  ] as const)("aprovado em %s mostra Permitido e esconde Negado, a pergunta e as ações", (state) => {
    render(<PedidoCompleto state={state} approval={{ id: "1", approved: true }} />);
    expect(screen.getByText("Permitido")).toBeInTheDocument();
    expect(screen.queryByText("Negado")).not.toBeInTheDocument();
    expect(screen.queryByText("Pergunta")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Permitir" })).not.toBeInTheDocument();
  });

  it.each([
    "approval-responded",
    "output-denied",
    "output-available",
  ] as const)("negado em %s mostra Negado e esconde Permitido", (state) => {
    render(<PedidoCompleto state={state} approval={{ id: "1", approved: false }} />);
    expect(screen.getByText("Negado")).toBeInTheDocument();
    expect(screen.queryByText("Permitido")).not.toBeInTheDocument();
  });

  it("respondido sem decisão registrada não mostra nem Permitido nem Negado", () => {
    render(<PedidoCompleto state="approval-responded" approval={{ id: "1" }} />);
    expect(screen.queryByText("Permitido")).not.toBeInTheDocument();
    expect(screen.queryByText("Negado")).not.toBeInTheDocument();
  });

  it("os subcomponentes fora de Confirmation falham com mensagem clara", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<ConfirmationRequest>x</ConfirmationRequest>)).toThrow(
      "Confirmation components must be used within Confirmation"
    );
    expect(() => render(<ConfirmationAccepted>x</ConfirmationAccepted>)).toThrow(
      "Confirmation components must be used within Confirmation"
    );
    expect(() => render(<ConfirmationActions />)).toThrow(
      "Confirmation components must be used within Confirmation"
    );
    consoleSpy.mockRestore();
  });

  it("repassa className ao alerta e às ações", () => {
    render(
      <Confirmation
        state="approval-requested"
        approval={{ id: "1" }}
        className="alerta-extra"
        role="alertdialog"
        aria-label="Confirmar ação"
      >
        <ConfirmationActions className="acoes-extra">
          <ConfirmationAction>Permitir</ConfirmationAction>
        </ConfirmationActions>
      </Confirmation>
    );
    expect(screen.getByRole("alertdialog", { name: "Confirmar ação" })).toHaveClass("alerta-extra");
    expect(screen.getByRole("button", { name: "Permitir" }).parentElement).toHaveClass(
      "acoes-extra"
    );
  });

  it("não tem violações de acessibilidade com o pedido aberto", async () => {
    const { container } = render(
      <PedidoCompleto state="approval-requested" approval={{ id: "1" }} />
    );
    const resultado = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });
    expect(resultado.violations).toEqual([]);
  });
});
