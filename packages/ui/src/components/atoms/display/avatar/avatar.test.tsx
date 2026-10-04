import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";

describe("Avatar", () => {
  it("mostra a imagem com o texto alternativo informado", () => {
    render(
      <Avatar>
        <AvatarImage src="/ana.png" alt="Foto de Ana" />
        <AvatarFallback>AN</AvatarFallback>
      </Avatar>
    );
    expect(screen.getByRole("img", { name: "Foto de Ana" })).toHaveAttribute("src", "/ana.png");
  });

  it("sem alt a imagem é decorativa e não aparece como imagem acessível", () => {
    render(
      <Avatar>
        <AvatarImage src="/ana.png" />
      </Avatar>
    );
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getByRole("presentation")).toHaveAttribute("alt", "");
  });

  it("o fallback mostra as iniciais quando não há imagem", () => {
    render(
      <Avatar>
        <AvatarFallback>JB</AvatarFallback>
      </Avatar>
    );
    expect(screen.getByText("JB")).toBeInTheDocument();
  });

  it("className extra é somada às classes base do avatar", () => {
    const { container } = render(<Avatar className="size-16">x</Avatar>);
    expect(container.firstElementChild).toHaveClass("size-16", "rounded-full");
  });
});
