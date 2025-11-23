import type { Meta, StoryObj } from "@storybook/react-vite";
import { type Reminder, ReminderCard } from "./reminder-card";

const meta = {
  title: "Flowtomic UI/Molecules/Data Display/ReminderCard",
  component: ReminderCard,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "Card de lembretes com horário e botão de ação.",
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
    title: "Meeting with Arc Company",
    time: "02.00 pm - 04.00 pm",
    description: "Quarterly review meeting",
  },
];

export const Default: Story = {
  args: {
    reminders: sampleReminders,
    title: "Reminders",
    actionButtonText: "Start Meeting",
    onStartMeeting: (reminder) => console.log("Start meeting:", reminder),
  },
};

export const WithDismiss: Story = {
  args: {
    reminders: sampleReminders,
    title: "Reminders",
    actionButtonText: "Start Meeting",
    onStartMeeting: (reminder) => console.log("Start meeting:", reminder),
    onDismiss: (reminder) => console.log("Dismiss:", reminder),
  },
};

export const MultipleReminders: Story = {
  args: {
    reminders: [
      {
        id: "1",
        title: "Meeting with Arc Company",
        time: "02.00 pm - 04.00 pm",
      },
      {
        id: "2",
        title: "Team Standup",
        time: "10.00 am - 10.30 am",
      },
    ],
    title: "Reminders",
    actionButtonText: "Start",
    onStartMeeting: (reminder) => console.log("Start:", reminder),
  },
};

export const Empty: Story = {
  args: {
    reminders: [],
    title: "Reminders",
    actionButtonText: "Start Meeting",
  },
};
