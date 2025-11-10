import type { Meta, StoryObj } from "@storybook/react-vite";
import { Briefcase, Calendar, Home, Lock, Settings } from "lucide-react";
import { useState } from "react";
import { MenuDock } from "./menu-dock";

const meta = {
  title: "Flowtomic UI/Molecules/MenuDock",
  component: MenuDock,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "compact", "large"],
    },
    orientation: {
      control: "select",
      options: ["horizontal", "vertical"],
    },
    showLabels: {
      control: "boolean",
    },
    animated: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof MenuDock>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultItems = [
  { label: "Início", icon: Home },
  { label: "Trabalho", icon: Briefcase },
  { label: "Calendário", icon: Calendar },
  { label: "Segurança", icon: Lock },
  { label: "Configurações", icon: Settings },
];

export const Default: Story = {
  render: () => {
    const [activeIndex, setActiveIndex] = useState(0);
    return (
      <MenuDock
        items={defaultItems}
        activeIndex={activeIndex}
        onActiveIndexChange={setActiveIndex}
      />
    );
  },
};

export const Compact: Story = {
  render: () => {
    const [activeIndex, setActiveIndex] = useState(0);
    return (
      <MenuDock
        items={defaultItems}
        variant="compact"
        activeIndex={activeIndex}
        onActiveIndexChange={setActiveIndex}
      />
    );
  },
};

export const Large: Story = {
  render: () => {
    const [activeIndex, setActiveIndex] = useState(0);
    return (
      <MenuDock
        items={defaultItems}
        variant="large"
        activeIndex={activeIndex}
        onActiveIndexChange={setActiveIndex}
      />
    );
  },
};

export const WithoutLabels: Story = {
  render: () => {
    const [activeIndex, setActiveIndex] = useState(0);
    return (
      <MenuDock
        items={defaultItems}
        showLabels={false}
        activeIndex={activeIndex}
        onActiveIndexChange={setActiveIndex}
      />
    );
  },
};

export const Vertical: Story = {
  render: () => {
    const [activeIndex, setActiveIndex] = useState(0);
    return (
      <MenuDock
        items={defaultItems}
        orientation="vertical"
        activeIndex={activeIndex}
        onActiveIndexChange={setActiveIndex}
      />
    );
  },
};

export const NotAnimated: Story = {
  render: () => {
    const [activeIndex, setActiveIndex] = useState(0);
    return (
      <MenuDock
        items={defaultItems}
        animated={false}
        activeIndex={activeIndex}
        onActiveIndexChange={setActiveIndex}
      />
    );
  },
};
