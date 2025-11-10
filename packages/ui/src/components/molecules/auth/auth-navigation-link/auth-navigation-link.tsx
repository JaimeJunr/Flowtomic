/**
 * AuthNavigationLink - Componente Molecule
 *
 * Componente reutilizável para links de navegação entre páginas de autenticação
 *
 * NOTA: Este componente requer que o projeto use um sistema de roteamento compatível
 * (React Router, Next.js Link, etc.). O componente aceita um componente Link customizado.
 */

import type React from "react";
import { AnimatedShinyText } from "../../../atoms/typography/animated-shiny-text";

export interface AuthNavigationLinkProps {
  /**
   * Texto principal antes do link
   */
  text: string;
  /**
   * Texto do link
   */
  linkText: string;
  /**
   * Rota de destino
   */
  to: string;
  /**
   * Componente Link customizado (React Router, Next.js, etc.)
   * Se não fornecido, usa <a> padrão
   */
  LinkComponent?: React.ComponentType<{
    to: string;
    className?: string;
    children: React.ReactNode;
  }>;
  /**
   * Classe CSS adicional
   */
  className?: string;
  /**
   * Se true, aplica efeito de texto animado (AnimatedShinyText) no linkText
   * @default false
   */
  animated?: boolean;
  /**
   * Largura do shimmer para o efeito animado (apenas quando animated=true)
   * @default 100
   */
  shimmerWidth?: number;
}

/**
 * Componente reutilizável para links de navegação entre páginas de autenticação
 *
 * Usado em Login e Register para navegação entre as páginas
 */
export function AuthNavigationLink({
  text,
  linkText,
  to,
  LinkComponent,
  className = "",
  animated = false,
  shimmerWidth = 100,
}: AuthNavigationLinkProps) {
  const linkClassName = "text-[#5B5FED] dark:text-[#7B7FFF] hover:underline font-semibold";

  const linkContent = animated ? (
    LinkComponent ? (
      <LinkComponent to={to} className={linkClassName}>
        <AnimatedShinyText
          shimmerWidth={shimmerWidth}
          className="bg-gradient-to-r from-[#5B5FED] from-0% via-white via-50% to-[#5B5FED] to-100% dark:from-[#7B7FFF] dark:via-white dark:to-[#7B7FFF]"
        >
          {linkText}
        </AnimatedShinyText>
      </LinkComponent>
    ) : (
      <a href={to} className={linkClassName}>
        <AnimatedShinyText
          shimmerWidth={shimmerWidth}
          className="bg-gradient-to-r from-[#5B5FED] from-0% via-white via-50% to-[#5B5FED] to-100% dark:from-[#7B7FFF] dark:via-white dark:to-[#7B7FFF]"
        >
          {linkText}
        </AnimatedShinyText>
      </a>
    )
  ) : LinkComponent ? (
    <LinkComponent to={to} className={linkClassName}>
      {linkText}
    </LinkComponent>
  ) : (
    <a href={to} className={linkClassName}>
      {linkText}
    </a>
  );

  return (
    <p className={`text-center text-sm text-gray-600 dark:text-gray-300 ${className}`}>
      {text} {linkContent}
    </p>
  );
}
