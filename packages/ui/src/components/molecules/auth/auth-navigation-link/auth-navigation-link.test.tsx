import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { AuthNavigationLink } from "./auth-navigation-link";

describe("AuthNavigationLink", () => {
  it.each([
    ["Ainda não tem conta?", "Criar conta", "/cadastro"],
    ["", "Entrar", "/entrar?origem=convite#email"],
  ])("link nativo '%s' / '%s' conserva o destino %s e o nome acessível", (text, linkText, to) => {
    render(<AuthNavigationLink text={text} linkText={linkText} to={to} />);
    const link = screen.getByRole("link", { name: linkText });
    expect(link).toHaveAttribute("href", to);
    expect(link.parentElement).toHaveTextContent(`${text} ${linkText}`.trim());
    expect(screen.getAllByRole("link")).toHaveLength(1);
  });

  it.each([
    ["Criar conta", "/cadastro"],
    ["Entrar", "/entrar"],
  ])("Tab alcança o link nativo %s e Enter ativa exatamente o mesmo destino", async (linkText, to) => {
    render(<AuthNavigationLink text="Acesse sua conta:" linkText={linkText} to={to} />);
    const onNavigate = vi.fn();
    const link = screen.getByRole("link", { name: linkText });
    link.addEventListener("click", (event) => {
      event.preventDefault();
      onNavigate(link.getAttribute("href"));
    });
    const user = userEvent.setup();
    await user.tab();
    expect(link).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onNavigate.mock.calls).toEqual([[to]]);
    await user.keyboard(" ");
    expect(onNavigate.mock.calls).toEqual([[to]]);
  });

  it.each([
    ["Criar conta", "/cadastro", "clique"],
    ["Entrar", "/entrar?origem=convite", "teclado"],
  ])("LinkComponent recebe texto e rota de %s e navega por %s / %s", async (linkText, to, route) => {
    const onNavigate = vi.fn();
    function ConsumerLink({
      to: destination,
      className,
      children,
    }: {
      to: string;
      className?: string;
      children: ReactNode;
    }) {
      return (
        <a
          href={destination}
          className={className}
          onClick={(event) => {
            event.preventDefault();
            onNavigate(destination);
          }}
        >
          {children}
        </a>
      );
    }
    render(
      <AuthNavigationLink
        text="Acesse sua conta:"
        linkText={linkText}
        to={to}
        LinkComponent={ConsumerLink}
      />
    );
    const link = screen.getByRole("link", { name: linkText });
    expect(link).toHaveAttribute("href", to);
    const user = userEvent.setup();
    if (route === "clique") await user.click(link);
    else {
      await user.tab();
      expect(link).toHaveFocus();
      await user.keyboard("{Enter}");
    }
    expect(onNavigate.mock.calls).toEqual([[to]]);
  });

  it("atualizar as props substitui texto, nome e destino sem deixar o link anterior", () => {
    const { rerender } = render(
      <AuthNavigationLink text="Ainda não tem conta?" linkText="Criar conta" to="/cadastro" />
    );
    expect(screen.getByRole("link", { name: "Criar conta" })).toHaveAttribute("href", "/cadastro");
    rerender(<AuthNavigationLink text="Já tem conta?" linkText="Entrar" to="/entrar" />);
    expect(screen.queryByRole("link", { name: "Criar conta" })).not.toBeInTheDocument();
    expect(screen.queryByText("Ainda não tem conta?", { exact: false })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Entrar" })).toHaveAttribute("href", "/entrar");
    expect(screen.getByText("Já tem conta?", { exact: false })).toBeInTheDocument();
  });

  it("retirar LinkComponent volta ao link nativo e aceita um destino com fragmento", () => {
    function ConsumerLink({ to, children }: { to: string; children: ReactNode }) {
      return <a href={`/app${to}`}>{children}</a>;
    }
    const { rerender } = render(
      <AuthNavigationLink text="" linkText="Entrar" to="/entrar" LinkComponent={ConsumerLink} />
    );
    expect(screen.getByRole("link", { name: "Entrar" })).toHaveAttribute("href", "/app/entrar");
    rerender(<AuthNavigationLink text="" linkText="Recuperar senha" to="#recuperar" />);
    expect(screen.queryByRole("link", { name: "Entrar" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Recuperar senha" })).toHaveAttribute(
      "href",
      "#recuperar"
    );
    expect(screen.getAllByRole("link")).toHaveLength(1);
  });
});
