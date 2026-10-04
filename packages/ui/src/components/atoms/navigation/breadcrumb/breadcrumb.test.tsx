import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./breadcrumb";

function Trilha() {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/docs">Docs</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbEllipsis />
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>DataTable</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}

describe("Breadcrumb", () => {
  it("a trilha tem nome em português", () => {
    render(<Trilha />);
    expect(screen.getByRole("navigation", { name: "Trilha de navegação" })).toBeInTheDocument();
  });

  it("a página atual é marcada e não leva a lugar nenhum", () => {
    render(<Trilha />);
    const atual = screen.getByText("DataTable");
    expect(atual).toHaveAttribute("aria-current", "page");
    expect(atual).toHaveAttribute("aria-disabled", "true");
    expect(atual).not.toHaveAttribute("href");
    expect(screen.getByRole("link", { name: "Docs" })).toHaveAttribute("href", "/docs");
  });

  it("as reticências não têm texto em inglês", () => {
    render(<Trilha />);
    expect(screen.queryByText("More")).not.toBeInTheDocument();
  });
});
