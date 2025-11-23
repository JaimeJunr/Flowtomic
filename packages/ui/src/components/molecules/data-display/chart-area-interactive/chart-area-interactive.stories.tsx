import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import type { ChartAreaInteractiveDataPoint } from "./chart-area-interactive";
import { ChartAreaInteractive } from "./chart-area-interactive";

const meta = {
  title: "Flowtomic UI/Molecules/DataDisplay/ChartAreaInteractive",
  component: ChartAreaInteractive,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    defaultTimeRange: {
      control: "select",
      options: ["7d", "30d", "90d"],
    },
    height: {
      control: "text",
    },
  },
} satisfies Meta<typeof ChartAreaInteractive>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleData: ChartAreaInteractiveDataPoint[] = [
  { date: "2024-06-01", desktop: 178, mobile: 200 },
  { date: "2024-06-02", desktop: 470, mobile: 410 },
  { date: "2024-06-03", desktop: 103, mobile: 160 },
  { date: "2024-06-04", desktop: 439, mobile: 380 },
  { date: "2024-06-05", desktop: 88, mobile: 140 },
  { date: "2024-06-06", desktop: 294, mobile: 250 },
  { date: "2024-06-07", desktop: 323, mobile: 370 },
  { date: "2024-06-08", desktop: 385, mobile: 320 },
  { date: "2024-06-09", desktop: 438, mobile: 480 },
  { date: "2024-06-10", desktop: 155, mobile: 200 },
  { date: "2024-06-11", desktop: 92, mobile: 150 },
  { date: "2024-06-12", desktop: 492, mobile: 420 },
  { date: "2024-06-13", desktop: 81, mobile: 130 },
  { date: "2024-06-14", desktop: 426, mobile: 380 },
  { date: "2024-06-15", desktop: 307, mobile: 350 },
  { date: "2024-06-16", desktop: 371, mobile: 310 },
  { date: "2024-06-17", desktop: 475, mobile: 520 },
  { date: "2024-06-18", desktop: 107, mobile: 170 },
  { date: "2024-06-19", desktop: 341, mobile: 290 },
  { date: "2024-06-20", desktop: 408, mobile: 450 },
  { date: "2024-06-21", desktop: 169, mobile: 210 },
  { date: "2024-06-22", desktop: 317, mobile: 270 },
  { date: "2024-06-23", desktop: 480, mobile: 530 },
  { date: "2024-06-24", desktop: 132, mobile: 180 },
  { date: "2024-06-25", desktop: 141, mobile: 190 },
  { date: "2024-06-26", desktop: 434, mobile: 380 },
  { date: "2024-06-27", desktop: 448, mobile: 490 },
  { date: "2024-06-28", desktop: 149, mobile: 200 },
  { date: "2024-06-29", desktop: 103, mobile: 160 },
  { date: "2024-06-30", desktop: 446, mobile: 400 },
];

export const Default: Story = {
  args: {
    data: sampleData,
  },
};

export const CustomTitle: Story = {
  args: {
    data: sampleData,
    title: "Visitors Over Time",
    description: "Desktop and mobile visitors comparison",
  },
};

export const Last7Days: Story = {
  args: {
    data: sampleData,
    defaultTimeRange: "7d",
  },
};

export const Last30Days: Story = {
  args: {
    data: sampleData,
    defaultTimeRange: "30d",
  },
};

export const CustomHeight: Story = {
  args: {
    data: sampleData,
    height: "400px",
  },
};

export const CustomConfig: Story = {
  args: {
    data: sampleData,
    config: {
      visitors: {
        label: "Visitantes",
      },
      desktop: {
        label: "Desktop",
        color: "hsl(221.2 83.2% 53.3%)",
      },
      mobile: {
        label: "Mobile",
        color: "hsl(280 100% 70%)",
      },
    },
    title: "Gráfico de Área Interativo",
    description: "Mostrando visitantes totais dos últimos 3 meses",
  },
};
