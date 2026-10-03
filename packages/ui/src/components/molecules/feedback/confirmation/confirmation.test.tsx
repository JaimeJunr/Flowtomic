import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
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
