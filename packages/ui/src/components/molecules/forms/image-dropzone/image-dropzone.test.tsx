import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { ImageDropzone, type ImageDropzoneProps } from "./image-dropzone";

const png = () => new File(["png"], "flowtomic.png", { type: "image/png" });
const textFile = () => new File(["texto"], "notas.txt", { type: "text/plain" });

function fileInput() {
  return screen.getByLabelText<HTMLInputElement>("Selecionar imagem", { selector: "input" });
}

function dropFiles(files: File[]) {
  fireEvent.drop(screen.getByRole("region", { name: "Dropzone de upload de arquivos" }), {
    dataTransfer: { files },
  });
}

function ControlledDropzone(props: ImageDropzoneProps) {
  const [value, setValue] = useState<File | string | null>(props.value ?? null);
  return (
    <ImageDropzone
      {...props}
      value={value}
      onChange={(file) => {
        props.onChange?.(file);
        setValue(file);
      }}
    />
  );
}

describe("ImageDropzone", () => {
  it("selecionar uma imagem envia o File exato e mostra a prévia quando o dono atualiza value", async () => {
    const onChange = vi.fn();
    const file = png();
    render(<ControlledDropzone onChange={onChange} />);
    await userEvent.upload(fileInput(), file);
    expect(onChange.mock.calls).toEqual([[file]]);
    expect(await screen.findByRole("img", { name: "Prévia da imagem" })).toHaveAttribute(
      "src",
      "data:image/png;base64,cG5n"
    );
    expect(screen.getByRole("button", { name: "Alterar imagem" })).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("seleção rejeita um arquivo que não é imagem mesmo se o seletor entregar esse arquivo", async () => {
    const onChange = vi.fn();
    render(<ImageDropzone onChange={onChange} />);
    const user = userEvent.setup({ applyAccept: false });
    await user.upload(fileInput(), textFile());
    expect(screen.getByRole("alert")).toHaveTextContent("O arquivo deve ser uma imagem");
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("drop aceita só o primeiro arquivo e não abre o seletor", () => {
    const onChange = vi.fn();
    render(<ImageDropzone onChange={onChange} />);
    const onPickerClick = vi.fn();
    fileInput().addEventListener("click", onPickerClick);
    const file = png();
    dropFiles([file, textFile()]);
    expect(onChange.mock.calls).toEqual([[file]]);
    expect(onPickerClick).not.toHaveBeenCalled();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("drop rejeita um arquivo que não é imagem sem pular para o segundo", () => {
    const onChange = vi.fn();
    render(<ImageDropzone onChange={onChange} />);
    dropFiles([textFile(), png()]);
    expect(screen.getByRole("alert")).toHaveTextContent("O arquivo deve ser uma imagem");
    expect(onChange).not.toHaveBeenCalled();
  });

  it.each([
    ["seleção", 4, true],
    ["seleção", 5, false],
    ["drop", 4, true],
    ["drop", 5, false],
  ] as const)("%s com %i bytes respeita o limite inclusivo de 4 bytes", async (route, size, valid) => {
    const onChange = vi.fn();
    render(<ImageDropzone maxSize={4} onChange={onChange} />);
    const file = new File(["x".repeat(size)], "flowtomic.png", { type: "image/png" });
    if (route === "seleção") await userEvent.upload(fileInput(), file);
    else dropFiles([file]);
    if (valid) {
      expect(onChange.mock.calls).toEqual([[file]]);
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    } else {
      expect(screen.getByRole("alert")).toHaveTextContent("O arquivo deve ter no máximo 4 Bytes");
      expect(onChange).not.toHaveBeenCalled();
    }
  });

  it.each([
    [5 * 1024 * 1024, true],
    [5 * 1024 * 1024 + 1, false],
  ])("o limite padrão de 5 MB valida %i bytes", (size, valid) => {
    const onChange = vi.fn();
    render(<ImageDropzone onChange={onChange} />);
    const file = new File([new Uint8Array(size)], "flowtomic.png", { type: "image/png" });
    dropFiles([file]);
    if (valid) expect(onChange.mock.calls).toEqual([[file]]);
    else {
      expect(screen.getByRole("alert")).toHaveTextContent("O arquivo deve ter no máximo 5 MB");
      expect(onChange).not.toHaveBeenCalled();
    }
  });

  it.each([
    ["image/png", true],
    ["image/jpeg", true],
    ["image/gif", false],
  ])("a lista MIME com espaços valida %s", (type, valid) => {
    const onChange = vi.fn();
    render(<ImageDropzone accept="image/png, image/jpeg" onChange={onChange} />);
    const file = new File(["imagem"], "flowtomic", { type });
    dropFiles([file]);
    expect(fileInput()).toHaveAttribute("accept", "image/png, image/jpeg");
    if (valid) expect(onChange.mock.calls).toEqual([[file]]);
    else {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Tipo de arquivo não aceito. Aceitos: image/png, image/jpeg"
      );
      expect(onChange).not.toHaveBeenCalled();
    }
  });

  it.each([
    ["image/*, application/pdf", "image/webp", true],
    ["video/*", "image/png", false],
  ])("accept=%s valida o wildcard para %s", (accept, type, valid) => {
    const onChange = vi.fn();
    render(<ImageDropzone accept={accept} onChange={onChange} />);
    const file = new File(["imagem"], "flowtomic", { type });
    dropFiles([file]);
    if (valid) expect(onChange.mock.calls).toEqual([[file]]);
    else {
      expect(screen.getByRole("alert")).toHaveTextContent(
        `Tipo de arquivo não aceito. Aceitos: ${accept}`
      );
      expect(onChange).not.toHaveBeenCalled();
    }
  });

  it.each([
    ["FLOWTOMIC.PNG", true],
    ["flowtomic.jpg", false],
  ])("accept por extensão .png valida %s sem diferenciar maiúsculas", (name, valid) => {
    const onChange = vi.fn();
    render(<ImageDropzone accept=".png" onChange={onChange} />);
    const file = new File(["imagem"], name, { type: "image/png" });
    dropFiles([file]);
    if (valid) expect(onChange.mock.calls).toEqual([[file]]);
    else {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Tipo de arquivo não aceito. Aceitos: .png"
      );
      expect(onChange).not.toHaveBeenCalled();
    }
  });

  it.each([
    "Selecionar imagem",
    "selecione um arquivo",
  ])("clicar em '%s' abre o mesmo seletor sem emitir onChange", async (name) => {
    const onChange = vi.fn();
    render(<ImageDropzone onChange={onChange} />);
    const onPickerClick = vi.fn();
    fileInput().addEventListener("click", onPickerClick);
    await userEvent.click(screen.getByRole("button", { name }));
    expect(onPickerClick).toHaveBeenCalledTimes(1);
    expect(onChange).not.toHaveBeenCalled();
  });

  it.each([
    "{Enter}",
    " ",
  ])("o botão de seleção abre o seletor pelo teclado com %s", async (key) => {
    render(<ImageDropzone />);
    const onPickerClick = vi.fn();
    fileInput().addEventListener("click", onPickerClick);
    screen.getByRole("button", { name: "Selecionar imagem" }).focus();
    await userEvent.keyboard(key);
    expect(onPickerClick).toHaveBeenCalledTimes(1);
  });

  it("uma URL controlada mostra a imagem; value=null devolve a instrução de seleção", () => {
    const { rerender } = render(
      <ImageDropzone value="/flowtomic.png" helperText="Envie a imagem do componente." />
    );
    expect(screen.getByRole("img", { name: "Prévia da imagem" })).toHaveAttribute(
      "src",
      "/flowtomic.png"
    );
    rerender(<ImageDropzone value={null} helperText="Envie a imagem do componente." />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getByText("Envie a imagem do componente.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Selecionar imagem" })).toBeInTheDocument();
  });

  it("alterar a imagem abre o seletor e respeita o texto customizado dos botões", async () => {
    render(
      <ImageDropzone
        value="/flowtomic.png"
        changeButtonText="Trocar imagem"
        removeButtonText="Limpar imagem"
      />
    );
    const onPickerClick = vi.fn();
    fileInput().addEventListener("click", onPickerClick);
    await userEvent.click(screen.getByRole("button", { name: "Trocar imagem" }));
    expect(onPickerClick).toHaveBeenCalledTimes(1);
    expect(screen.getAllByRole("button", { name: "Limpar imagem" })).toHaveLength(2);
  });

  it.each([
    ["ícone", 0],
    ["texto", 1],
  ] as const)("remover pelo botão de %s limpa arquivo, prévia e erro de validação", async (_kind, index) => {
    const onChange = vi.fn();
    render(<ControlledDropzone onChange={onChange} />);
    const file = png();
    await userEvent.upload(fileInput(), file);
    await screen.findByRole("img", { name: "Prévia da imagem" });
    dropFiles([textFile()]);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    await userEvent.click(screen.getAllByRole("button", { name: "Remover" })[index]);
    expect(onChange.mock.calls).toEqual([[file], [null]]);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(fileInput()).toHaveValue("");
    expect(fileInput().files).toHaveLength(0);
  });

  it("depois de remover é possível selecionar o mesmo arquivo novamente", async () => {
    const onChange = vi.fn();
    render(<ControlledDropzone onChange={onChange} />);
    const file = png();
    await userEvent.upload(fileInput(), file);
    await screen.findByRole("img", { name: "Prévia da imagem" });
    await userEvent.click(screen.getAllByRole("button", { name: "Remover" })[1]);
    await userEvent.upload(fileInput(), file);
    expect(onChange.mock.calls).toEqual([[file], [null], [file]]);
    expect(await screen.findByRole("img", { name: "Prévia da imagem" })).toBeInTheDocument();
  });

  it.each(["seleção", "drop"])("uma imagem válida por %s apaga o erro anterior", async (route) => {
    const onChange = vi.fn();
    render(<ImageDropzone onChange={onChange} />);
    dropFiles([textFile()]);
    expect(screen.getByRole("alert")).toHaveTextContent("O arquivo deve ser uma imagem");
    const file = png();
    if (route === "seleção") await userEvent.upload(fileInput(), file);
    else dropFiles([file]);
    expect(onChange.mock.calls).toEqual([[file]]);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("erro externo tem prioridade; ao removê-lo aparece o erro da validação", () => {
    const { rerender } = render(<ImageDropzone error="O servidor recusou a imagem." />);
    dropFiles([textFile()]);
    expect(screen.getByRole("alert")).toHaveTextContent("O servidor recusou a imagem.");
    expect(screen.queryByText("O arquivo deve ser uma imagem")).not.toBeInTheDocument();
    rerender(<ImageDropzone />);
    expect(screen.getByRole("alert")).toHaveTextContent("O arquivo deve ser uma imagem");
  });

  it("selecionar uma imagem válida não apaga um erro ainda controlado pelo consumidor", async () => {
    const { rerender } = render(<ImageDropzone error="O servidor recusou a imagem." />);
    await userEvent.upload(fileInput(), png());
    expect(screen.getByRole("alert")).toHaveTextContent("O servidor recusou a imagem.");
    rerender(<ImageDropzone />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it.each(["seleção", "drop"])("%s sem arquivo não emite mudança nem erro", (route) => {
    const onChange = vi.fn();
    render(<ImageDropzone onChange={onChange} />);
    if (route === "seleção") fireEvent.change(fileInput(), { target: { files: [] } });
    else dropFiles([]);
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("desabilitado e vazio bloqueia seleção, drop e acesso pelo teclado", async () => {
    const onChange = vi.fn();
    render(<ImageDropzone disabled onChange={onChange} />);
    const onPickerClick = vi.fn();
    fileInput().addEventListener("click", onPickerClick);
    expect(fileInput()).toBeDisabled();
    expect(screen.getByRole("region", { name: "Dropzone de upload de arquivos" })).toHaveAttribute(
      "tabindex",
      "-1"
    );
    for (const button of screen.getAllByRole("button")) {
      expect(button).toBeDisabled();
      await userEvent.click(button);
    }
    await userEvent.upload(fileInput(), png());
    dropFiles([png()]);
    await userEvent.tab();
    expect(document.body).toHaveFocus();
    expect(onChange).not.toHaveBeenCalled();
    expect(onPickerClick).not.toHaveBeenCalled();
  });

  it("desabilitado com prévia bloqueia alterar e os dois botões de remover", async () => {
    const onChange = vi.fn();
    render(<ImageDropzone disabled value="/flowtomic.png" onChange={onChange} />);
    expect(screen.getByRole("img", { name: "Prévia da imagem" })).toBeInTheDocument();
    for (const button of screen.getAllByRole("button")) {
      expect(button).toBeDisabled();
      await userEvent.click(button);
    }
    dropFiles([png()]);
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole("img", { name: "Prévia da imagem" })).toBeInTheDocument();
  });

  it.each([
    undefined,
    "O servidor recusou a imagem.",
  ])("upload com error=%s não tem violações automáticas de acessibilidade", async (error) => {
    const { container } = render(<ImageDropzone error={error} />);
    const result = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });
    expect(result.violations).toEqual([]);
  });
});

describe("ImageDropzone: arrastar sobre a área", () => {
  const area = () => screen.getByRole("region", { name: "Dropzone de upload de arquivos" });

  it("ao arrastar um arquivo sobre a área ela fica destacada, e sai do destaque ao sair ou soltar", () => {
    render(<ImageDropzone />);
    expect(area().className).not.toContain("border-primary");

    fireEvent.dragEnter(area());
    expect(area().className).toContain("border-primary");

    fireEvent.dragLeave(area());
    expect(area().className).not.toContain("border-primary");

    fireEvent.dragEnter(area());
    dropFiles([png()]);
    expect(area().className).not.toContain("border-primary");
  });

  it("desabilitada, a área não ganha destaque ao arrastar", () => {
    render(<ImageDropzone disabled />);
    fireEvent.dragEnter(area());
    expect(area().className).not.toContain("border-primary");
  });

  it("dragover cancela o comportamento padrão do navegador, para a área aceitar o drop", () => {
    render(<ImageDropzone />);
    const naoCancelado = fireEvent.dragOver(area());
    expect(naoCancelado).toBe(false);
  });

  it("com limite zero a mensagem de tamanho diz 0 Bytes", () => {
    render(<ImageDropzone maxSize={0} />);
    dropFiles([png()]);
    expect(screen.getByRole("alert")).toHaveTextContent("O arquivo deve ter no máximo 0 Bytes");
  });

  it("o limite em KB aparece com a unidade certa na mensagem", () => {
    render(<ImageDropzone maxSize={2048} />);
    dropFiles([new File([new Uint8Array(3000)], "a.png", { type: "image/png" })]);
    expect(screen.getByRole("alert")).toHaveTextContent("O arquivo deve ter no máximo 2 KB");
  });
});
