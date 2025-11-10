import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { ImageDropzone } from "./image-dropzone";

const meta = {
  title: "Flowtomic UI/Molecules/ImageDropzone",
  component: ImageDropzone,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    maxSize: {
      control: "number",
    },
    disabled: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof ImageDropzone>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const [file, setFile] = useState<File | null>(null);
    return (
      <div className="w-[500px]">
        <ImageDropzone {...args} value={file} onChange={setFile} />
      </div>
    );
  },
};

export const WithPreview: Story = {
  render: () => {
    const [file, setFile] = useState<File | null>(null);
    return (
      <div className="w-[500px]">
        <ImageDropzone value={file} onChange={setFile} />
      </div>
    );
  },
};

export const Disabled: Story = {
  render: () => {
    const [file, setFile] = useState<File | null>(null);
    return (
      <div className="w-[500px]">
        <ImageDropzone value={file} onChange={setFile} disabled />
      </div>
    );
  },
};

export const WithHelperText: Story = {
  render: () => {
    const [file, setFile] = useState<File | null>(null);
    return (
      <div className="w-[500px]">
        <ImageDropzone
          value={file}
          onChange={setFile}
          helperText="Formatos aceitos: JPG, PNG, GIF. Tamanho máximo: 5MB"
        />
      </div>
    );
  },
};

export const WithError: Story = {
  render: () => {
    const [file, setFile] = useState<File | null>(null);
    return (
      <div className="w-[500px]">
        <ImageDropzone
          value={file}
          onChange={setFile}
          error="Por favor, selecione um arquivo de imagem válido"
        />
      </div>
    );
  },
};

export const CustomMaxSize: Story = {
  render: () => {
    const [file, setFile] = useState<File | null>(null);
    return (
      <div className="w-[500px]">
        <ImageDropzone
          value={file}
          onChange={setFile}
          maxSize={10 * 1024 * 1024}
          helperText="Tamanho máximo: 10MB"
        />
      </div>
    );
  },
};
