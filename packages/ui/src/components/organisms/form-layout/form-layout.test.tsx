import { render, screen } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { describe, expect, it } from "vitest";
import { FormLayout, type FormSectionConfig } from "./form-layout";

interface FormData {
  name: string;
}

function Wrapper({ sections }: { sections: FormSectionConfig<FormData>[] }) {
  const form = useForm<FormData>({ defaultValues: { name: "" } });
  return <FormLayout form={form} sections={sections} onSubmit={() => {}} />;
}

describe("FormLayout", () => {
  it("título de seção usa o token de cor do tema, não um cinza fixo (text-gray-900)", () => {
    const sections: FormSectionConfig<FormData>[] = [
      {
        title: "Dados pessoais",
        fields: [{ name: "name", label: "Nome", type: "text" }],
      },
    ];
    render(<Wrapper sections={sections} />);

    const sectionTitle = screen.getByText("Dados pessoais");
    expect(sectionTitle).toHaveClass("text-foreground");
    expect(sectionTitle).not.toHaveClass("text-gray-900");
  });
});
