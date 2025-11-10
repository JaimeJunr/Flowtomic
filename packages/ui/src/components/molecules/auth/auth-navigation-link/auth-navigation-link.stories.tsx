import type { Meta, StoryObj } from "@storybook/react-vite";
import type React from "react";
import { AuthNavigationLink } from "./auth-navigation-link";

const meta = {
  title: "Flowtomic UI/Molecules/Auth/AuthNavigationLink",
  component: AuthNavigationLink,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    text: {
      control: "text",
    },
    linkText: {
      control: "text",
    },
    to: {
      control: "text",
    },
    animated: {
      control: "boolean",
      description: "Aplica efeito de texto animado (AnimatedShinyText) no linkText",
    },
    shimmerWidth: {
      control: "number",
      description: "Largura do shimmer para o efeito animado (apenas quando animated=true)",
    },
  },
} satisfies Meta<typeof AuthNavigationLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    text: "Não tem uma conta?",
    linkText: "Cadastre-se",
    to: "/register",
  },
};

export const LoginLink: Story = {
  args: {
    text: "Já tem uma conta?",
    linkText: "Entrar",
    to: "/login",
  },
};

export const WithCustomLink: Story = {
  render: (args) => {
    // Simulando um componente Link customizado (ex: React Router)
    const CustomLink = ({
      to,
      className,
      children,
    }: {
      to: string;
      className?: string;
      children: React.ReactNode;
    }) => (
      <a href={to} className={className}>
        {children}
      </a>
    );

    return <AuthNavigationLink {...args} LinkComponent={CustomLink} />;
  },
  args: {
    text: "Esqueceu sua senha?",
    linkText: "Redefinir",
    to: "/forgot-password",
  },
};

export const WithAnimatedText: Story = {
  args: {
    text: "Não tem uma conta?",
    linkText: "Cadastre-se",
    to: "/register",
    animated: true,
    shimmerWidth: 100,
  },
};

export const WithAnimatedTextCustomWidth: Story = {
  args: {
    text: "Já tem uma conta?",
    linkText: "Entrar",
    to: "/login",
    animated: true,
    shimmerWidth: 150,
  },
};

export const WithAnimatedTextAndCustomLink: Story = {
  render: (args) => {
    // Simulando um componente Link customizado (ex: React Router)
    const CustomLink = ({
      to,
      className,
      children,
    }: {
      to: string;
      className?: string;
      children: React.ReactNode;
    }) => (
      <a href={to} className={className}>
        {children}
      </a>
    );

    return <AuthNavigationLink {...args} LinkComponent={CustomLink} />;
  },
  args: {
    text: "Esqueceu sua senha?",
    linkText: "Redefinir",
    to: "/forgot-password",
    animated: true,
    shimmerWidth: 120,
  },
};
