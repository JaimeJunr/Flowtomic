/**
 * Flowtomic Dashboard Block
 *
 * Dashboard completo com sidebar, header, estatísticas, gráficos, listas de projetos e equipe, e timer
 */

"use client";

import { useProjectProgress, useProjectStats } from "@flowtomic/logic";
import { ArrowRight, Code, Layers, TestTube, Zap } from "lucide-react";
import { useState } from "react";
import { SidebarProvider } from "@/components/atoms/layout";
import {
  BarChart,
  CircularProgressChart,
  DashboardHeader,
  ProjectList,
  ReminderCard,
  SidebarNavigation,
  StatCard,
  TeamMemberList,
  TimeTracker,
} from "@/components/molecules";
import type { Project as ProjectListProject } from "@/components/molecules/data-display/project-list";
import type { Reminder } from "@/components/molecules/data-display/reminder-card";
import type { TeamMember } from "@/components/molecules/data-display/team-member-list";
import type { DashboardUser, Notification } from "@/components/molecules/layout/dashboard-header";
import { ResizableLayout } from "@/components/organisms";

// Dados de exemplo
const sampleProjects = [
  { id: "1", status: "running" as const, name: "Project A" },
  { id: "2", status: "running" as const, name: "Project B" },
  { id: "3", status: "ended" as const, name: "Project C" },
  { id: "4", status: "ended" as const, name: "Project D" },
  { id: "5", status: "pending" as const, name: "Project E" },
  { id: "6", status: "pending" as const, name: "Project F" },
  { id: "7", status: "on-hold" as const, name: "Project G" },
  { id: "8", status: "running" as const, name: "Project H" },
  { id: "9", status: "running" as const, name: "Project I" },
  { id: "10", status: "running" as const, name: "Project J" },
  { id: "11", status: "running" as const, name: "Project K" },
  { id: "12", status: "running" as const, name: "Project L" },
  { id: "13", status: "ended" as const, name: "Project M" },
  { id: "14", status: "ended" as const, name: "Project N" },
  { id: "15", status: "ended" as const, name: "Project O" },
  { id: "16", status: "ended" as const, name: "Project P" },
  { id: "17", status: "ended" as const, name: "Project Q" },
  { id: "18", status: "ended" as const, name: "Project R" },
  { id: "19", status: "ended" as const, name: "Project S" },
  { id: "20", status: "ended" as const, name: "Project T" },
  { id: "21", status: "ended" as const, name: "Project U" },
  { id: "22", status: "ended" as const, name: "Project V" },
  { id: "23", status: "ended" as const, name: "Project W" },
  { id: "24", status: "ended" as const, name: "Project X" },
];

const projectListData: ProjectListProject[] = [
  {
    id: "1",
    name: "Develop API Endpoints",
    dueDate: new Date(2024, 10, 26),
    icon: <ArrowRight className="h-5 w-5 text-blue-600" />,
    iconColor: "rgba(37, 99, 235, 0.1)",
  },
  {
    id: "2",
    name: "Onboarding Flow",
    dueDate: new Date(2024, 10, 28),
    icon: <Layers className="h-5 w-5 text-green-600" />,
    iconColor: "rgba(22, 163, 74, 0.1)",
  },
  {
    id: "3",
    name: "Build Dashboard",
    dueDate: new Date(2024, 10, 30),
    icon: <Code className="h-5 w-5 text-yellow-600" />,
    iconColor: "rgba(202, 138, 4, 0.1)",
  },
  {
    id: "4",
    name: "Optimize Page Load",
    dueDate: new Date(2024, 11, 5),
    icon: <Zap className="h-5 w-5 text-orange-600" />,
    iconColor: "rgba(234, 88, 12, 0.1)",
  },
  {
    id: "5",
    name: "Cross-Browser Testing",
    dueDate: new Date(2024, 11, 6),
    icon: <TestTube className="h-5 w-5 text-purple-600" />,
    iconColor: "rgba(147, 51, 234, 0.1)",
  },
];

const teamMembers: TeamMember[] = [
  {
    id: "1",
    name: "Alexandra Deff",
    task: "Github Project Repository",
    status: "completed",
  },
  {
    id: "2",
    name: "Edwin Adenike",
    task: "Integrate User Authentication System",
    status: "in-progress",
  },
  {
    id: "3",
    name: "Isaac Oluwatemilorun",
    task: "Develop Search and Filter Functionality",
    status: "pending",
  },
  {
    id: "4",
    name: "David Oshodi",
    task: "Responsive Layout for Homepage",
    status: "in-progress",
  },
];

const reminders: Reminder[] = [
  {
    id: "1",
    title: "Meeting with Arc Company",
    time: "02.00 pm - 04.00 pm",
  },
];

const user: DashboardUser = {
  name: "Totok Michael",
  email: "tmichael20@mail.com",
};

const notifications: Notification[] = [
  {
    id: "1",
    title: "New project assigned",
    unread: true,
  },
];

const messages: Notification[] = [
  {
    id: "1",
    title: "New message",
    unread: true,
  },
];

export default function FlowtomicDashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchValue, setSearchValue] = useState("");

  // Calcular estatísticas
  const { total, ended, running, pending } = useProjectStats({
    projects: sampleProjects,
  });

  // Calcular progresso
  const progressProjects = sampleProjects.map((p) => ({
    id: p.id,
    status:
      p.status === "ended"
        ? ("completed" as const)
        : p.status === "running"
          ? ("in-progress" as const)
          : ("pending" as const),
  }));
  const { percentage: progressPercentage } = useProjectProgress({
    projects: progressProjects,
  });

  // Dados do gráfico de barras
  const barChartData = [
    { label: "S", value: 0 },
    { label: "M", value: 45 },
    { label: "T", value: 74 },
    { label: "W", value: 60 },
    { label: "T", value: 0 },
    { label: "F", value: 0 },
    { label: "S", value: 0 },
  ];

  return (
    <SidebarProvider>
      <ResizableLayout
        sidebar={
          <SidebarNavigation
            appName="Flowtomic"
            mobileAppCard={{
              title: "Download our Mobile App",
              buttonText: "Download",
              onDownload: () => console.log("Download app"),
            }}
            onNavigate={(item) => console.log("Navigate:", item)}
          />
        }
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        persistKey="flowtomic-dashboard-sidebar"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <DashboardHeader
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            user={user}
            notifications={notifications}
            messages={messages}
          />

          {/* Conteúdo Principal */}
          <div className="flex-1 overflow-auto p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Título */}
              <div>
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground mt-1">
                  Plan, prioritize, and accomplish your tasks with ease.
                </p>
              </div>

              {/* Cards de Resumo de Projetos */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  title="Total Projects"
                  value={total}
                  lastMonth={20}
                  color="primary"
                  variant="compact"
                />
                <StatCard
                  title="Ended Projects"
                  value={ended}
                  lastMonth={8}
                  color="info"
                  variant="compact"
                />
                <StatCard
                  title="Running Projects"
                  value={running}
                  lastMonth={10}
                  color="success"
                  variant="compact"
                />
                <StatCard
                  title="Pending Project"
                  value={pending}
                  subtitle="On Discuss"
                  color="warning"
                  variant="compact"
                />
              </div>

              {/* Grid Principal */}
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Coluna Esquerda */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Project Analytics */}
                  <BarChart
                    data={barChartData}
                    title="Project Analytics"
                    height={200}
                    showValues={true}
                  />

                  {/* Reminders */}
                  <ReminderCard
                    reminders={reminders}
                    title="Reminders"
                    actionButtonText="Start Meeting"
                    onStartMeeting={(reminder) => console.log("Start:", reminder)}
                  />

                  {/* Project List */}
                  <ProjectList
                    projects={projectListData}
                    title="Project"
                    addButtonText="+ New"
                    onProjectClick={(project) => console.log("Project:", project)}
                    onAddNew={() => console.log("Add new project")}
                  />
                </div>

                {/* Coluna Direita */}
                <div className="space-y-6">
                  {/* Team Collaboration */}
                  <TeamMemberList
                    members={teamMembers}
                    title="Team Collaboration"
                    addButtonText="+ Add Member"
                    onMemberClick={(member) => console.log("Member:", member)}
                    onAddMember={() => console.log("Add member")}
                  />

                  {/* Project Progress */}
                  <CircularProgressChart
                    value={progressPercentage}
                    label="Project Ended"
                    title="Project Progress"
                    size={200}
                    legend={[
                      { label: "Completed", color: "hsl(var(--primary))" },
                      { label: "In Progress", color: "hsl(var(--success))" },
                      { label: "Pending", color: "hsl(var(--muted))" },
                    ]}
                  />

                  {/* Time Tracker */}
                  <TimeTracker
                    title="Time Tracker"
                    initialTime={0}
                    format="HH:mm:ss"
                    backgroundColor="hsl(var(--primary))"
                    className="text-primary-foreground"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </ResizableLayout>
    </SidebarProvider>
  );
}
