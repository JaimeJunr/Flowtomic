import { act, render, screen } from "@testing-library/react";
import { type ComponentType, lazy } from "react";
import { describe, expect, it, vi } from "vitest";
import type { WidgetLayout } from "@/types/dashboard";
import { WidgetRenderer, type WidgetRendererProps } from "./widget-renderer";

const widget: WidgetLayout = { id: "build-ui", type: "build", x: 0, y: 0, w: 4, h: 2 };
const data = { package: "@flowtomic/ui", status: "Concluído" };
type WidgetProps = { widget: WidgetLayout; data?: unknown };

function createRegistry(onRender = vi.fn()) {
  const Component = (props: WidgetProps) => {
    onRender(props);
    return <h2>Registry: {props.widget.id}</h2>;
  };
  return new Map<string, ComponentType<WidgetProps>>([["build", Component]]);
}

function delayedWidget() {
  let resolve!: (module: { default: ComponentType<WidgetProps> }) => void;
  const pending = new Promise<{ default: ComponentType<WidgetProps> }>((done) => {
    resolve = done;
  });
  return { Component: lazy(() => pending), resolve };
}

describe("WidgetRenderer", () => {
  it.each([data, undefined])("render prop recebe widget e data=%j exatos", (data) => {
    const renderWidget = vi.fn((layout: WidgetLayout) => <h2>Render prop: {layout.id}</h2>);
    render(<WidgetRenderer widget={widget} data={data} renderWidget={renderWidget} />);
    expect(renderWidget.mock.calls).toEqual([[widget, data]]);
    expect(screen.getByRole("heading", { name: "Render prop: build-ui" })).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it.each([data, undefined])("registry recebe props exatas com data=%j", (data) => {
    const onRender = vi.fn();
    render(
      <WidgetRenderer widget={widget} data={data} widgetRegistry={createRegistry(onRender)} />
    );
    expect(onRender.mock.calls).toEqual([[{ widget, data }]]);
    expect(screen.getByRole("heading", { name: "Registry: build-ui" })).toBeInTheDocument();
  });

  it.each([
    "conteúdo",
    "null",
  ])("render prop tem prioridade sobre registry e fallback mesmo retornando %s", (result) => {
    const content = result === "conteúdo" ? <h2>Render prop prioritária</h2> : null;
    const onRegistryRender = vi.fn();
    const renderWidget = vi.fn(() => content);
    render(
      <WidgetRenderer
        widget={widget}
        data={data}
        renderWidget={renderWidget}
        widgetRegistry={createRegistry(onRegistryRender)}
        fallback={<p>Fallback</p>}
      />
    );
    expect(renderWidget.mock.calls).toEqual([[widget, data]]);
    expect(onRegistryRender).not.toHaveBeenCalled();
    expect(screen.queryByText("Fallback")).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Registry: build-ui" })).not.toBeInTheDocument();
    if (content)
      expect(screen.getByRole("heading", { name: "Render prop prioritária" })).toBeInTheDocument();
    else expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });

  it.each([
    "render prop",
    "registry",
  ])("loading anuncia a espera, não renderiza %s e libera o conteúdo ao terminar", (route) => {
    const onRender = vi.fn();
    const renderWidget = vi.fn(() => <h2>Render prop carregada</h2>);
    const props: WidgetRendererProps =
      route === "render prop"
        ? { widget, data, renderWidget }
        : { widget, data, widgetRegistry: createRegistry(onRender) };
    const { rerender } = render(<WidgetRenderer {...props} isLoading />);
    expect(screen.getByRole("status", { name: "Carregando widget" })).toBeInTheDocument();
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
    expect(renderWidget).not.toHaveBeenCalled();
    expect(onRender).not.toHaveBeenCalled();
    rerender(<WidgetRenderer {...props} isLoading={false} />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: route === "render prop" ? "Render prop carregada" : "Registry: build-ui",
      })
    ).toBeInTheDocument();
  });

  it.each([
    undefined,
    new Map(),
  ])("tipo sem registro mostra o tipo desconhecido (registry=%j)", (widgetRegistry) => {
    render(
      <WidgetRenderer
        widget={{ ...widget, type: "sem-registro" }}
        widgetRegistry={widgetRegistry}
      />
    );
    expect(screen.getByText("Tipo de widget desconhecido: sem-registro")).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it.each([
    undefined,
    new Map(),
  ])("fallback customizado substitui o aviso de tipo desconhecido (registry=%j)", (widgetRegistry) => {
    render(
      <WidgetRenderer
        widget={widget}
        widgetRegistry={widgetRegistry}
        fallback={<p role="alert">Instale o widget de build.</p>}
      />
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Instale o widget de build.");
    expect(screen.queryByText(/Tipo de widget desconhecido/)).not.toBeInTheDocument();
  });

  it.each([
    0,
    "",
    null,
    false,
  ])("fallback explícito %j é respeitado mesmo sendo falsy", (fallback) => {
    const { container } = render(<WidgetRenderer widget={widget} fallback={fallback} />);
    expect(screen.queryByText(/Tipo de widget desconhecido/)).not.toBeInTheDocument();
    if (fallback === 0) expect(screen.getByText("0")).toBeInTheDocument();
    else expect(container).toBeEmptyDOMElement();
  });

  it.each([
    "render prop",
    "registry",
  ])("Suspense em %s anuncia loading e troca pelo componente real quando ele resolve", async (route) => {
    const { Component, resolve } = delayedWidget();
    const props: WidgetRendererProps =
      route === "render prop"
        ? { widget, renderWidget: (widget, data) => <Component widget={widget} data={data} /> }
        : { widget, widgetRegistry: new Map([[widget.type, Component]]) };
    render(<WidgetRenderer {...props} />);
    expect(screen.getByRole("status", { name: "Carregando widget" })).toBeInTheDocument();
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
    await act(async () => {
      resolve({ default: ({ widget }) => <h2>Build pronto: {widget.id}</h2> });
    });
    expect(
      await screen.findByRole("heading", { name: "Build pronto: build-ui" })
    ).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("mudar o tipo escolhe outro componente registrado e atualizar data entrega os novos dados", () => {
    const onRender = vi.fn();
    const registry = createRegistry(onRender);
    registry.set("test", ({ widget, data }) => (
      <h2>
        Testes: {widget.id} / {String(data)}
      </h2>
    ));
    const { rerender } = render(
      <WidgetRenderer widget={widget} data={data} widgetRegistry={registry} />
    );
    expect(screen.getByRole("heading", { name: "Registry: build-ui" })).toBeInTheDocument();
    rerender(
      <WidgetRenderer
        widget={{ ...widget, type: "test" }}
        data="36 verdes"
        widgetRegistry={registry}
      />
    );
    expect(
      screen.getByRole("heading", { name: "Testes: build-ui / 36 verdes" })
    ).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Registry: build-ui" })).not.toBeInTheDocument();
  });
});
