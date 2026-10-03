import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { QRCode } from "./qr-code";

function reduzirMovimento(ativo: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: ativo,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

afterEach(() => {
  reduzirMovimento(false);
});

describe("QRCode", () => {
  it("expõe o QR como imagem com rótulo padrão e desenha o SVG dentro", () => {
    const { container } = render(<QRCode value="https://flowtomic.dev" />);
    expect(screen.getByRole("img", { name: "QR code" })).toBeInTheDocument();
    expect(container.querySelector("svg, canvas")).not.toBeNull();
  });

  it("usa o ariaLabel informado como nome acessível", () => {
    render(<QRCode value="x" ariaLabel="Código de pagamento" />);
    expect(screen.getByRole("img", { name: "Código de pagamento" })).toBeInTheDocument();
  });

  it("tamanho lg usa mais respiro que md", () => {
    const { rerender } = render(<QRCode value="x" />);
    expect(screen.getByRole("img")).toHaveClass("p-2");
    rerender(<QRCode value="x" size="lg" />);
    expect(screen.getByRole("img")).toHaveClass("p-3");
  });

  it("animated mostra a faixa de varredura", () => {
    const { container } = render(<QRCode value="x" animated />);
    expect(container.querySelector("[aria-hidden='true']")).not.toBeNull();
  });

  it("sem animated não mostra a faixa de varredura", () => {
    const { container } = render(<QRCode value="x" />);
    expect(container.querySelector("[aria-hidden='true']")).toBeNull();
  });

  it("quem prefere movimento reduzido não vê a varredura mesmo com animated", () => {
    reduzirMovimento(true);
    const { container } = render(<QRCode value="x" animated />);
    expect(container.querySelector("[aria-hidden='true']")).toBeNull();
  });

  it("mudar o valor não recria o QR, só atualiza", () => {
    const { container, rerender } = render(<QRCode value="a" />);
    const antes = container.querySelectorAll("svg").length;
    rerender(<QRCode value="b" />);
    expect(container.querySelectorAll("svg").length).toBe(antes);
  });
});
