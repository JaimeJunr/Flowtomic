import type { Meta, StoryObj } from "@storybook/react-vite";
import { type Reminder, ReminderCard } from "./reminder-card";

const meta = {
  title: "Flowtomic UI/Molecules/Data Display/ReminderCard",
  component: ReminderCard,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Lista de lembretes: horário em mono, título e descrição, com uma ação contornada por linha.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ReminderCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleReminders: Reminder[] = [
  {
    id: "1",
    title: "Revisão de PR com a mantenedora",
    time: "14:00–14:30",
    description: "PR #30, molecules sem template",
  },
];

export const Default: Story = {
  args: {
    reminders: sampleReminders,
    onStartMeeting: (reminder) => console.log("Começar:", reminder),
  },
};

export const WithDismiss: Story = {
  args: {
    reminders: sampleReminders,
    onStartMeeting: (reminder) => console.log("Começar:", reminder),
    onDismiss: (reminder) => console.log("Dispensar:", reminder),
  },
};

export const MultipleReminders: Story = {
  args: {
    reminders: [
      {
        id: "1",
        title: "Revisão de PR com a mantenedora",
        time: "14:00–14:30",
      },
      {
        id: "2",
        title: "Publicar @flowtomic/ui 0.9.0",
        time: "16:00–16:15",
        description: "Workflow Publish no GitHub Actions",
      },
    ],
    onStartMeeting: (reminder) => console.log("Começar:", reminder),
  },
};

export const Empty: Story = {
  args: {
    reminders: [],
  },
};
