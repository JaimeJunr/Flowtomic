import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DashboardHeader, type Notification } from "./dashboard-header";

const user = { name: "Mantenedor Flowtomic", email: "mantenedor@flowtomic.dev" };
const notifications: Notification[] = [
  { id: "1", title: "Build do registry falhou", unread: true },
  { id: "2", title: "PR #29 mergeado", unread: true },
  { id: "3", title: "@flowtomic/ui 0.8.0 publicado" },
];

describe("DashboardHeader", () => {
  it("a busca diz 'Buscar' e não mostra atalho que não existe", () => {
    render(<DashboardHeader />);
    expect(screen.getByRole("searchbox", { name: "Buscar" })).toHaveAttribute(
      "placeholder",
      "Buscar"
    );
    expect(screen.queryByText("⌘F")).not.toBeInTheDocument();
  });

  it("o atalho só aparece quando quem usa passa um", () => {
    render(<DashboardHeader searchShortcut="Ctrl+K" />);
    expect(screen.getByText("Ctrl+K")).toBeInTheDocument();
  });

  it("repassa o que a pessoa digita na busca", () => {
    const onSearch = vi.fn();
    render(<DashboardHeader onSearchChange={onSearch} />);
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "stats" } });
    expect(onSearch).toHaveBeenCalledWith("stats");
  });

  it("o botão de notificações diz quantas não foram lidas", () => {
    render(<DashboardHeader notifications={notifications} />);
    expect(screen.getByRole("button", { name: "Notificações, 2 não lidas" })).toBeInTheDocument();
  });

  it("sem não lidas o botão diz só 'Notificações' e o contador não usa cor de erro", () => {
    render(
      <DashboardHeader
        messages={[{ id: "m", title: "Oi", unread: true }]}
        notifications={[notifications[2]]}
      />
    );
    expect(screen.getByRole("button", { name: "Notificações" })).toBeInTheDocument();
    const counter = screen.getByText("1");
    expect(counter.className).not.toMatch(/destructive/);
  });

  it("abre as notificações com título em português e repassa o clique", async () => {
    const onClick = vi.fn();
    render(<DashboardHeader notifications={notifications} onNotificationClick={onClick} />);
    await userEvent.click(screen.getByRole("button", { name: /Notificações/ }));
    expect(await screen.findByText("Notificações")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("menuitem", { name: /PR #29/ }));
    expect(onClick).toHaveBeenCalledWith(notifications[1]);
  });

  it("o menu do perfil só tem ações que funcionam", async () => {
    const onProfile = vi.fn();
    render(<DashboardHeader user={user} onProfileClick={onProfile} />);
    await userEvent.click(screen.getByRole("button", { name: /Mantenedor Flowtomic/ }));
    const items = await screen.findAllByRole("menuitem");
    expect(items.map((i) => i.textContent)).toEqual(["Perfil"]);
    await userEvent.click(items[0]);
    expect(onProfile).toHaveBeenCalledTimes(1);
  });

  it("sem onProfileClick o usuário aparece como texto, sem menu", () => {
    render(<DashboardHeader user={user} />);
    expect(screen.getByText("mantenedor@flowtomic.dev")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Mantenedor/ })).not.toBeInTheDocument();
  });
});
