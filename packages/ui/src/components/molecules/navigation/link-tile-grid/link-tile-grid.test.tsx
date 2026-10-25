import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Star } from "lucide-react";
import { describe, expect, it } from "vitest";
import { type LinkTile, LinkTileGrid } from "./link-tile-grid";

const items: LinkTile[] = [
  { id: "a", label: "Ações", href: "/acoes" },
  { id: "b", label: "Dados", href: "/dados" },
  { id: "c", label: "Formulários", href: "/formularios" },
];

const grid = (container: HTMLElement) =>
  container.querySelector('[data-slot="link-tile-grid"]') as HTMLElement;
const list = () => screen.getByRole("list");

describe("LinkTileGrid", () => {
  it("renderiza um navigation nomeado com lista e um link por item", () => {
    render(<LinkTileGrid items={items} />);
    const nav = screen.getByRole("navigation", { name: "Atalhos" });
    expect(within(nav).getByRole("list")).toBeInTheDocument();
    expect(within(nav).getAllByRole("listitem")).toHaveLength(3);
    expect(screen.getByRole("link", { name: "Dados" })).toHaveAttribute("href", "/dados");
    expect(screen.getAllByRole("link")).toHaveLength(3);
  });

  it("label troca o nome do navigation", () => {
    render(<LinkTileGrid items={items} label="Categorias" />);
    expect(screen.getByRole("navigation", { name: "Categorias" })).toBeInTheDocument();
  });

  it("labelledBy usa aria-labelledby e remove o aria-label", () => {
    const { container } = render(
      <>
        <h2 id="titulo">Casos de uso</h2>
        <LinkTileGrid items={items} label="Ignorado" labelledBy="titulo" />
      </>
    );
    const nav = grid(container);
    expect(nav).toHaveAttribute("aria-labelledby", "titulo");
    expect(nav).not.toHaveAttribute("aria-label");
    expect(screen.getByRole("navigation", { name: "Casos de uso" })).toBe(nav);
  });

  it("mostra o ícone aria-hidden no quadrado tingido; sem icon, não há slot", () => {
    const { container } = render(
      <LinkTileGrid
        items={[
          { id: "a", label: "Com", href: "/a", icon: <Star data-testid="estrela" /> },
          { id: "b", label: "Sem", href: "/b" },
        ]}
      />
    );
    const icons = container.querySelectorAll('[data-slot="link-tile-icon"]');
    expect(icons).toHaveLength(1);
    expect(icons[0]).toHaveAttribute("aria-hidden", "true");
    expect(within(icons[0] as HTMLElement).getByTestId("estrela")).toBeInTheDocument();
  });

  it("external abre em nova aba e avisa no nome acessível", () => {
    const { container } = render(
      <LinkTileGrid items={[{ id: "a", label: "Docs", href: "https://x.dev", external: true }]} />
    );
    const link = screen.getByRole("link", { name: "Docs (abre em nova aba)" });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link.getAttribute("rel")).toContain("noreferrer");
    expect(container.querySelector('[data-slot="link-tile-arrow"]')).toBeInTheDocument();
  });

  it("link interno não leva target nem rel", () => {
    render(<LinkTileGrid items={items} />);
    const link = screen.getByRole("link", { name: "Ações" });
    expect(link).not.toHaveAttribute("target");
    expect(link).not.toHaveAttribute("rel");
  });

  it("disabled não é link, tem aria-disabled e fica fora do Tab", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <LinkTileGrid
        items={[
          { id: "a", label: "Ativo", href: "/a" },
          { id: "b", label: "Inativo", href: "/b", disabled: true },
        ]}
      />
    );
    expect(screen.queryByRole("link", { name: "Inativo" })).not.toBeInTheDocument();
    const tiles = container.querySelectorAll('[data-slot="link-tile"]');
    expect(tiles[1]?.tagName).toBe("SPAN");
    expect(tiles[1]).toHaveAttribute("aria-disabled", "true");
    expect(tiles[1]).toHaveAttribute("data-disabled");
    await user.tab();
    expect(screen.getByRole("link", { name: "Ativo" })).toHaveFocus();
    await user.tab();
    expect(tiles[1]).not.toHaveFocus();
  });

  it("columns limita o máximo de colunas", () => {
    const { rerender } = render(<LinkTileGrid items={items} />);
    expect(list().className).toContain("@min-[1100px]:grid-cols-4");
    rerender(<LinkTileGrid items={items} columns={3} />);
    expect(list().className).toContain("@min-[768px]:grid-cols-3");
    expect(list().className).not.toContain("grid-cols-4");
    rerender(<LinkTileGrid items={items} columns={2} />);
    expect(list().className).toContain("@min-[480px]:grid-cols-2");
    expect(list().className).not.toContain("grid-cols-3");
    expect(list().className).not.toContain("grid-cols-4");
  });

  it("a grade começa em uma coluna e o @container fica no nav", () => {
    const { container } = render(<LinkTileGrid items={items} />);
    expect(list().className).toMatch(/(^|\s)grid-cols-1(\s|$)/);
    expect(grid(container).className).toContain("@container");
  });

  it("renderLink recebe href e item e o elemento devolvido substitui o <a>", () => {
    const recebido: { href?: string; id?: string } = {};
    render(
      <LinkTileGrid
        items={items.slice(0, 1)}
        renderLink={({ item, href, className, children }) => {
          recebido.href = href;
          recebido.id = item.id;
          return (
            <button type="button" data-testid="custom" data-href={href} className={className}>
              {children}
            </button>
          );
        }}
      />
    );
    expect(recebido).toEqual({ href: "/acoes", id: "a" });
    expect(screen.getByTestId("custom")).toHaveTextContent("Ações");
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("mostra description e badge quando passados", () => {
    render(
      <LinkTileGrid
        items={[
          { id: "a", label: "Ações", href: "/a", description: "Botões e gatilhos", badge: "Novo" },
          { id: "b", label: "Dados", href: "/b" },
        ]}
      />
    );
    expect(screen.getByText("Botões e gatilhos")).toBeInTheDocument();
    expect(screen.getByText("Novo")).toHaveAttribute("data-slot", "badge");
    expect(screen.getAllByText(/Novo|Botões/)).toHaveLength(2);
  });

  it("repassa className e props ao nav", () => {
    const { container } = render(
      <LinkTileGrid items={items} className="max-w-lg" data-testid="raiz" />
    );
    expect(grid(container)).toHaveClass("max-w-lg", "@container");
    expect(screen.getByTestId("raiz")).toBe(grid(container));
  });
});
