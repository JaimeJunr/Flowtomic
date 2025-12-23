/**
 * AuthNavigationLink - Componente Molecule
 *
 * Componente reutilizável para links de navegação entre páginas de autenticação
 *
 * NOTA: Este componente requer que o projeto use um sistema de roteamento compatível
 * (React Router, Next.js Link, etc.). O componente aceita um componente Link customizado.
 */

import type React from "react";

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
}: AuthNavigationLinkProps) {
  const linkClassName = "text-[#5B5FED] dark:text-[#7B7FFF] hover:underline font-semibold";

  const linkContent = LinkComponent ? (
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
