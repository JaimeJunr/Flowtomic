import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { AnnouncementBar } from "./announcement-bar";

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});
afterEach(() => {
  window.localStorage.clear();
  vi.restoreAllMocks();
});

describe("AnnouncementBar", () => {
  it("renderiza texto, ícone e link dentro de um aside rotulado", () => {
    render(
      <AnnouncementBar icon={<svg data-testid="icone" />} action={{ label: "Ler", href: "/log" }}>
        A 1.0 saiu.
      </AnnouncementBar>
    );
    const aside = screen.getByRole("complementary", { name: "Aviso" });
    expect(aside).toHaveAttribute("data-slot", "announcement-bar");
    expect(aside).toHaveTextContent("A 1.0 saiu.");
    expect(screen.getByTestId("icone")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ler" })).toHaveAttribute("href", "/log");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("usa o rótulo informado", () => {
    render(<AnnouncementBar label="Novidade">Oi</AnnouncementBar>);
    expect(screen.getByRole("complementary", { name: "Novidade" })).toBeInTheDocument();
  });

  it("fechar chama onDismiss e some", async () => {
    const onDismiss = vi.fn();
    render(<AnnouncementBar onDismiss={onDismiss}>Aviso</AnnouncementBar>);
    await userEvent.click(screen.getByRole("button", { name: "Fechar aviso" }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByText("Aviso")).not.toBeInTheDocument());
  });

  it("com storageKey, não reaparece ao remontar", async () => {
    const { unmount } = render(<AnnouncementBar storageKey="aviso-1">Aviso</AnnouncementBar>);
    await userEvent.click(screen.getByRole("button", { name: "Fechar aviso" }));
    await waitFor(() => expect(screen.queryByText("Aviso")).not.toBeInTheDocument());
    unmount();
    render(<AnnouncementBar storageKey="aviso-1">Aviso</AnnouncementBar>);
    expect(screen.queryByText("Aviso")).not.toBeInTheDocument();
  });

  it("storage que lança erro não quebra", async () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("bloqueado");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("bloqueado");
    });
    render(<AnnouncementBar storageKey="aviso-2">Aviso</AnnouncementBar>);
    expect(screen.getByText("Aviso")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Fechar aviso" }));
    await waitFor(() => expect(screen.queryByText("Aviso")).not.toBeInTheDocument());
  });

  it("dismissible={false} não mostra o botão", () => {
    render(<AnnouncementBar dismissible={false}>Aviso</AnnouncementBar>);
    expect(screen.queryByRole("button", { name: "Fechar aviso" })).not.toBeInTheDocument();
  });

  it("controlado: open manda e onOpenChange avisa", async () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <AnnouncementBar open onOpenChange={onOpenChange}>
        Aviso
      </AnnouncementBar>
    );
    await userEvent.click(screen.getByRole("button", { name: "Fechar aviso" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(screen.getByText("Aviso")).toBeInTheDocument();
    rerender(
      <AnnouncementBar open={false} onOpenChange={onOpenChange}>
        Aviso
      </AnnouncementBar>
    );
    await waitFor(() => expect(screen.queryByText("Aviso")).not.toBeInTheDocument());
  });

  it("com movimento reduzido, some na hora", async () => {
    render(
      <MotionConfig reducedMotion="always">
        <AnnouncementBar>Aviso</AnnouncementBar>
      </MotionConfig>
    );
    await userEvent.click(screen.getByRole("button", { name: "Fechar aviso" }));
    expect(screen.queryByText("Aviso")).not.toBeInTheDocument();
  });
});
