import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { dateAndTimeToIso, InlineDateTimeEditor, isoToDateAndTime } from "./inline-datetime-editor";

const meta = {
  title: "Flowtomic UI/Molecules/Forms/InlineDateTimeEditor",
  component: InlineDateTimeEditor,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Editor inline de data e hora. Exibe a data/hora formatada; ao clicar, alterna para modo edição com input date + input time + Salvar/Cancelar.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    value: { control: "text" },
    isEditing: { control: "boolean" },
    saving: { control: "boolean" },
    locale: { control: "text" },
    saveLabel: { control: "text" },
    cancelLabel: { control: "text" },
    savingLabel: { control: "text" },
    onStartEdit: { action: "onStartEdit" },
    onSave: { action: "onSave" },
    onCancel: { action: "onCancel" },
  },
} satisfies Meta<typeof InlineDateTimeEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultIso = "2025-03-04T14:30:00";

function InlineDateTimeEditorControlled() {
  const [value, setValue] = useState(defaultIso);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async (iso: string) => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setValue(iso);
    setIsEditing(false);
    setSaving(false);
  };

  return (
    <div className="min-w-[320px]">
      <InlineDateTimeEditor
        value={value}
        isEditing={isEditing}
        onStartEdit={() => setIsEditing(true)}
        onSave={handleSave}
        onCancel={() => setIsEditing(false)}
        saving={saving}
        locale="pt-BR"
      />
      <p className="mt-2 text-xs text-muted-foreground">
        ISO: {value} • {isoToDateAndTime(value).date} {isoToDateAndTime(value).time}
      </p>
    </div>
  );
}

export const Default: Story = {
  render: () => <InlineDateTimeEditorControlled />,
};

export const Editing: Story = {
  args: {
    value: defaultIso,
    isEditing: true,
    saving: false,
    onStartEdit: () => {},
    onSave: (iso) => console.log("save", iso),
    onCancel: () => {},
  },
};

export const Saving: Story = {
  args: {
    value: defaultIso,
    isEditing: true,
    saving: true,
    saveLabel: "Salvar",
    savingLabel: "Salvando…",
    onStartEdit: () => {},
    onSave: () => {},
    onCancel: () => {},
  },
};

export const Helpers: Story = {
  render: () => {
    const iso = "2025-03-04T09:15:00";
    const { date, time } = isoToDateAndTime(iso);
    const back = dateAndTimeToIso(date, time);
    return (
      <div className="text-sm space-y-2">
        <p>
          <code>isoToDateAndTime("{iso}")</code> → date: {date}, time: {time}
        </p>
        <p>
          <code>
            dateAndTimeToIso("{date}", "{time}")
          </code>{" "}
          → {back}
        </p>
      </div>
    );
  },
};
