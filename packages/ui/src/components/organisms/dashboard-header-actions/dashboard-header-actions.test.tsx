import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { DashboardHeaderActions } from "./dashboard-header-actions";

const dashboards = [
  { id: "a", name: "Dashboard A" },
  { id: "b", name: "Dashboard B" },
];

describe("DashboardHeaderActions", () => {
  describe("Seletor de dashboard acessível", () => {
    it("expõe o select de dashboard ativo com nome acessível", () => {
      render(<DashboardHeaderActions dashboards={dashboards} activeDashboardId="a" />);
      expect(screen.getByRole("combobox", { name: "Painel ativo" })).toBeInTheDocument();
    });
  });
});

describe("DashboardHeaderActions - seletor de dashboard", () => {
  it("com um único dashboard, não mostra o seletor", () => {
    render(<DashboardHeaderActions dashboards={[dashboards[0]]} />);
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });

  it("sem dashboards, não mostra o seletor", () => {
    render(<DashboardHeaderActions />);
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });

  it("seleciona o dashboard ativo e lista todas as opções", () => {
    render(<DashboardHeaderActions dashboards={dashboards} activeDashboardId="b" />);
    const seletor = screen.getByRole("combobox", { name: "Painel ativo" });
    expect(seletor).toHaveValue("b");
    expect(screen.getByRole("option", { name: "Dashboard A" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Dashboard B" })).toBeInTheDocument();
  });

  it("sem dashboard ativo, o seletor mostra a primeira opção da lista", () => {
    render(<DashboardHeaderActions dashboards={dashboards} />);
    expect(screen.getByRole("option", { name: "Dashboard A", selected: true })).toBeInTheDocument();
  });

  it("avisa o id do dashboard escolhido pelo usuário", async () => {
    const onSwitchDashboard = vi.fn();
    const user = userEvent.setup();
    render(
      <DashboardHeaderActions
        dashboards={dashboards}
        activeDashboardId="a"
        onSwitchDashboard={onSwitchDashboard}
      />
    );

    await user.selectOptions(screen.getByRole("combobox", { name: "Painel ativo" }), "b");
    expect(onSwitchDashboard).toHaveBeenCalledWith("b");
  });

  it("trocar de dashboard sem callback não quebra", async () => {
    const user = userEvent.setup();
    render(<DashboardHeaderActions dashboards={dashboards} activeDashboardId="a" />);

    await expect(
      user.selectOptions(screen.getByRole("combobox", { name: "Painel ativo" }), "b")
    ).resolves.not.toThrow();
  });
});

describe("DashboardHeaderActions - botões de ação", () => {
  it("sem nenhum callback, não renderiza botões", () => {
    render(<DashboardHeaderActions />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("só mostra os botões cujos callbacks foram passados", () => {
    render(<DashboardHeaderActions onSaveAsNew={() => {}} />);
    expect(screen.getByRole("button", { name: "Salvar Como" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Atualizar" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Lista|Grade/ })).not.toBeInTheDocument();
  });

  it("clicar em Salvar Como chama onSaveAsNew", async () => {
    const onSaveAsNew = vi.fn();
    const user = userEvent.setup();
    render(<DashboardHeaderActions onSaveAsNew={onSaveAsNew} />);

    await user.click(screen.getByRole("button", { name: "Salvar Como" }));
    expect(onSaveAsNew).toHaveBeenCalledTimes(1);
  });

  it("clicar em Atualizar chama onRefresh", async () => {
    const onRefresh = vi.fn();
    const user = userEvent.setup();
    render(<DashboardHeaderActions onRefresh={onRefresh} />);

    await user.click(screen.getByRole("button", { name: "Atualizar" }));
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it("no layout em grade, o botão oferece trocar para Lista", async () => {
    const onToggleLayout = vi.fn();
    const user = userEvent.setup();
    render(<DashboardHeaderActions layout="grid" onToggleLayout={onToggleLayout} />);

    await user.click(screen.getByRole("button", { name: "Lista" }));
    expect(onToggleLayout).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("button", { name: "Grade" })).not.toBeInTheDocument();
  });

  it("no layout em lista, o botão oferece trocar para Grade", () => {
    render(<DashboardHeaderActions layout="list" onToggleLayout={() => {}} />);
    expect(screen.getByRole("button", { name: "Grade" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Lista" })).not.toBeInTheDocument();
  });

  it("sem layout informado, assume grade e oferece Lista", () => {
    render(<DashboardHeaderActions onToggleLayout={() => {}} />);
    expect(screen.getByRole("button", { name: "Lista" })).toBeInTheDocument();
  });

  it("carregando: o botão Atualizar fica desabilitado e não dispara onRefresh", async () => {
    const onRefresh = vi.fn();
    const user = userEvent.setup();
    render(<DashboardHeaderActions isLoading onRefresh={onRefresh} />);
    const atualizar = screen.getByRole("button", { name: "Atualizar" });

    expect(atualizar).toBeDisabled();
    await user.click(atualizar);
    expect(onRefresh).not.toHaveBeenCalled();
  });

  it("fora do carregamento, o botão Atualizar fica habilitado", () => {
    render(<DashboardHeaderActions onRefresh={() => {}} />);
    expect(screen.getByRole("button", { name: "Atualizar" })).toBeEnabled();
  });

  it("os botões são alcançáveis e acionáveis pelo teclado", async () => {
    const onSaveAsNew = vi.fn();
    const user = userEvent.setup();
    render(<DashboardHeaderActions onSaveAsNew={onSaveAsNew} onRefresh={() => {}} />);

    await user.tab();
    expect(screen.getByRole("button", { name: "Salvar Como" })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onSaveAsNew).toHaveBeenCalledTimes(1);
  });
});

describe("DashboardHeaderActions - rótulos customizados", () => {
  it("usa os rótulos passados no lugar dos padrões em pt-BR", () => {
    render(
      <DashboardHeaderActions
        onSaveAsNew={() => {}}
        onToggleLayout={() => {}}
        onRefresh={() => {}}
        labels={{ saveAsNew: "Duplicar", listLayout: "Em linhas", refresh: "Recarregar" }}
      />
    );
    expect(screen.getByRole("button", { name: "Duplicar" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Em linhas" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Recarregar" })).toBeInTheDocument();
  });

  it("rótulo gridLayout customizado aparece quando o layout atual é lista", () => {
    render(
      <DashboardHeaderActions
        layout="list"
        onToggleLayout={() => {}}
        labels={{ gridLayout: "Em blocos" }}
      />
    );
    expect(screen.getByRole("button", { name: "Em blocos" })).toBeInTheDocument();
  });
});

describe("DashboardHeaderActions - ref e acessibilidade", () => {
  it("encaminha a ref para o elemento raiz", () => {
    const ref = createRef<HTMLDivElement>();
    render(<DashboardHeaderActions ref={ref} className="gap-8" />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveClass("gap-8");
  });

  it("com todas as ações e o seletor, não tem violações de acessibilidade", async () => {
    const { container } = render(
      <DashboardHeaderActions
        dashboards={dashboards}
        activeDashboardId="a"
        onSwitchDashboard={() => {}}
        onSaveAsNew={() => {}}
        onToggleLayout={() => {}}
        onRefresh={() => {}}
      />
    );
    const resultado = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });
    expect(resultado.violations).toEqual([]);
  });
});
