import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { describe, expect, it, vi } from "vitest";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";

function Abas({
  onValueChange,
  disabledSegunda = false,
}: {
  onValueChange?: (v: string) => void;
  disabledSegunda?: boolean;
}) {
  return (
    <Tabs defaultValue="conta" onValueChange={onValueChange}>
      <TabsList aria-label="Configurações">
        <TabsTrigger value="conta">Conta</TabsTrigger>
        <TabsTrigger value="senha" disabled={disabledSegunda}>
          Senha
        </TabsTrigger>
        <TabsTrigger value="plano">Plano</TabsTrigger>
      </TabsList>
      <TabsContent value="conta">Dados da conta</TabsContent>
      <TabsContent value="senha">Troca de senha</TabsContent>
      <TabsContent value="plano">Detalhes do plano</TabsContent>
    </Tabs>
  );
}

describe("Tabs", () => {
  it("mostra só o painel da aba inicial", () => {
    render(<Abas />);
    expect(screen.getByRole("tab", { name: "Conta", selected: true })).toBeInTheDocument();
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Dados da conta");
    expect(screen.queryByText("Troca de senha")).not.toBeInTheDocument();
  });

  it("clicar numa aba troca o painel e avisa a mudança", async () => {
    const onValueChange = vi.fn();
    render(<Abas onValueChange={onValueChange} />);
    await userEvent.click(screen.getByRole("tab", { name: "Senha" }));
    expect(onValueChange).toHaveBeenCalledWith("senha");
    expect(screen.getByRole("tab", { name: "Senha", selected: true })).toBeInTheDocument();
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Troca de senha");
    expect(screen.queryByText("Dados da conta")).not.toBeInTheDocument();
  });

  it("setas do teclado percorrem as abas e a ativação segue o foco", async () => {
    render(<Abas />);
    await userEvent.tab();
    expect(screen.getByRole("tab", { name: "Conta" })).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Senha" })).toHaveFocus();
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Troca de senha");
    await userEvent.keyboard("{End}");
    expect(screen.getByRole("tab", { name: "Plano" })).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Conta" })).toHaveFocus();
  });

  it("aba desabilitada é pulada pelo teclado e não responde ao clique", async () => {
    render(<Abas disabledSegunda />);
    expect(screen.getByRole("tab", { name: "Senha" })).toBeDisabled();
    await userEvent.tab();
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Plano" })).toHaveFocus();
    await userEvent.click(screen.getByRole("tab", { name: "Conta" }));
    await userEvent.click(screen.getByRole("tab", { name: "Senha" }));
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Dados da conta");
  });

  it("aplica className na lista e nas abas", () => {
    render(
      <Tabs defaultValue="a">
        <TabsList className="lista-x" aria-label="L">
          <TabsTrigger value="a" className="aba-x">
            A
          </TabsTrigger>
        </TabsList>
        <TabsContent value="a" className="painel-x">
          Conteúdo A
        </TabsContent>
      </Tabs>
    );
    expect(screen.getByRole("tablist", { name: "L" })).toHaveClass("lista-x");
    expect(screen.getByRole("tab", { name: "A" })).toHaveClass("aba-x");
    expect(screen.getByRole("tabpanel")).toHaveClass("painel-x");
  });

  it("repassa o ref para lista e aba", () => {
    const listaRef = { current: null as HTMLDivElement | null };
    const abaRef = { current: null as HTMLButtonElement | null };
    render(
      <Tabs defaultValue="a">
        <TabsList ref={listaRef}>
          <TabsTrigger value="a" ref={abaRef}>
            A
          </TabsTrigger>
        </TabsList>
      </Tabs>
    );
    expect(listaRef.current).toHaveAttribute("role", "tablist");
    expect(abaRef.current).toHaveAttribute("role", "tab");
  });

  it("não tem violações de acessibilidade", async () => {
    const { container } = render(<Abas />);
    const result = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });
    expect(result.violations).toEqual([]);
  });
});
