/**
 * Mapeamento de componentes disponíveis
 *
 * Este arquivo mapeia os nomes dos componentes para seus caminhos no repositório
 */

export interface ComponentInfo {
  name: string;
  type: "atom" | "molecule" | "organism";
  path: string;
  files: string[];
  dependencies?: string[];
}

/**
 * Mapeamento completo de todos os componentes disponíveis
 */
export const COMPONENT_MAP: Record<string, ComponentInfo> = {
  // Atoms
  button: {
    name: "button",
    type: "atom",
    path: "packages/ui/src/components/atoms/button",
    files: ["button.tsx", "index.ts"],
    dependencies: ["@radix-ui/react-slot", "class-variance-authority", "clsx", "tailwind-merge"],
  },
  badge: {
    name: "badge",
    type: "atom",
    path: "packages/ui/src/components/atoms/badge",
    files: ["badge.tsx", "index.ts"],
    dependencies: ["class-variance-authority", "clsx", "tailwind-merge"],
  },
  input: {
    name: "input",
    type: "atom",
    path: "packages/ui/src/components/atoms/input",
    files: ["input.tsx", "index.ts"],
    dependencies: ["@radix-ui/react-label", "clsx", "tailwind-merge"],
  },
  card: {
    name: "card",
    type: "atom",
    path: "packages/ui/src/components/atoms/card",
    files: ["card.tsx", "index.ts"],
    dependencies: ["clsx", "tailwind-merge"],
  },
  checkbox: {
    name: "checkbox",
    type: "atom",
    path: "packages/ui/src/components/atoms/checkbox",
    files: ["checkbox.tsx", "index.ts"],
    dependencies: ["@radix-ui/react-checkbox", "clsx", "tailwind-merge"],
  },
  skeleton: {
    name: "skeleton",
    type: "atom",
    path: "packages/ui/src/components/atoms/skeleton",
    files: ["skeleton.tsx", "index.ts"],
    dependencies: ["clsx", "tailwind-merge"],
  },
  table: {
    name: "table",
    type: "atom",
    path: "packages/ui/src/components/atoms/table",
    files: ["table.tsx", "index.ts"],
    dependencies: ["clsx", "tailwind-merge"],
  },
  tabs: {
    name: "tabs",
    type: "atom",
    path: "packages/ui/src/components/atoms/tabs",
    files: ["tabs.tsx", "index.ts"],
    dependencies: ["@radix-ui/react-tabs", "clsx", "tailwind-merge"],
  },
  alert: {
    name: "alert",
    type: "atom",
    path: "packages/ui/src/components/atoms/alert",
    files: ["alert.tsx", "index.ts"],
    dependencies: ["clsx", "tailwind-merge"],
  },
  "alert-dialog": {
    name: "alert-dialog",
    type: "atom",
    path: "packages/ui/src/components/atoms/alert-dialog",
    files: ["alert-dialog.tsx", "index.ts"],
    dependencies: ["@radix-ui/react-alert-dialog", "clsx", "tailwind-merge"],
  },
  dialog: {
    name: "dialog",
    type: "atom",
    path: "packages/ui/src/components/atoms/dialog",
    files: ["dialog.tsx", "index.ts"],
    dependencies: ["@radix-ui/react-dialog", "clsx", "tailwind-merge"],
  },
  "dropdown-menu": {
    name: "dropdown-menu",
    type: "atom",
    path: "packages/ui/src/components/atoms/dropdown-menu",
    files: ["dropdown-menu.tsx", "index.ts"],
    dependencies: ["@radix-ui/react-dropdown-menu", "clsx", "tailwind-merge"],
  },
  sonner: {
    name: "sonner",
    type: "atom",
    path: "packages/ui/src/components/atoms/sonner",
    files: ["sonner.tsx", "index.ts"],
    dependencies: ["sonner", "lucide-react", "clsx", "tailwind-merge"],
  },

  // Molecules
  "button-group": {
    name: "button-group",
    type: "molecule",
    path: "packages/ui/src/components/molecules/button-group",
    files: ["button-group.tsx", "index.ts"],
    dependencies: ["clsx", "tailwind-merge"],
  },
  "password-input": {
    name: "password-input",
    type: "molecule",
    path: "packages/ui/src/components/molecules/password-input",
    files: ["password-input.tsx", "index.ts"],
    dependencies: ["lucide-react", "clsx", "tailwind-merge"],
  },
  "image-dropzone": {
    name: "image-dropzone",
    type: "molecule",
    path: "packages/ui/src/components/molecules/image-dropzone",
    files: ["image-dropzone.tsx", "index.ts"],
    dependencies: ["lucide-react", "clsx", "tailwind-merge"],
  },
  "stat-card": {
    name: "stat-card",
    type: "molecule",
    path: "packages/ui/src/components/molecules/stat-card",
    files: ["stat-card.tsx", "index.ts"],
    dependencies: ["flowtomic/logic", "lucide-react", "clsx", "tailwind-merge"],
  },
  "data-table": {
    name: "data-table",
    type: "molecule",
    path: "packages/ui/src/components/molecules/data-table",
    files: ["data-table.tsx", "index.ts"],
    dependencies: ["@tanstack/react-table", "lucide-react", "clsx", "tailwind-merge"],
  },
  "menu-dock": {
    name: "menu-dock",
    type: "molecule",
    path: "packages/ui/src/components/molecules/menu-dock",
    files: ["menu-dock.tsx", "index.ts"],
    dependencies: ["clsx", "tailwind-merge"],
  },
  "theme-toggle-button": {
    name: "theme-toggle-button",
    type: "molecule",
    path: "packages/ui/src/components/molecules/theme/theme-toggle-button",
    files: ["theme-toggle-button.tsx", "index.ts"],
    dependencies: ["lucide-react", "clsx", "tailwind-merge"],
  },
  "auth-navigation-link": {
    name: "auth-navigation-link",
    type: "molecule",
    path: "packages/ui/src/components/molecules/auth/auth-navigation-link",
    files: ["auth-navigation-link.tsx", "index.ts"],
    dependencies: ["clsx", "tailwind-merge"],
  },
  "auth-form-error-message": {
    name: "auth-form-error-message",
    type: "molecule",
    path: "packages/ui/src/components/molecules/auth/auth-form-error-message",
    files: ["auth-form-error-message.tsx", "index.ts"],
    dependencies: ["clsx", "tailwind-merge"],
  },
  "social-login-buttons": {
    name: "social-login-buttons",
    type: "molecule",
    path: "packages/ui/src/components/molecules/social-login-buttons",
    files: ["social-login-buttons.tsx", "index.ts"],
    dependencies: ["lucide-react", "clsx", "tailwind-merge"],
  },

  // Organisms
  "dashboard-layout": {
    name: "dashboard-layout",
    type: "organism",
    path: "packages/ui/src/components/organisms/dashboard-layout",
    files: ["dashboard-layout.tsx", "index.ts"],
    dependencies: ["clsx", "tailwind-merge"],
  },
  "stats-grid": {
    name: "stats-grid",
    type: "organism",
    path: "packages/ui/src/components/organisms/stats-grid",
    files: ["stats-grid.tsx", "index.ts"],
    dependencies: ["clsx", "tailwind-merge"],
  },
  "monthly-summary": {
    name: "monthly-summary",
    type: "organism",
    path: "packages/ui/src/components/organisms/monthly-summary",
    files: ["monthly-summary.tsx", "index.ts"],
    dependencies: ["lucide-react", "clsx", "tailwind-merge"],
  },
  "dashboard-header-actions": {
    name: "dashboard-header-actions",
    type: "organism",
    path: "packages/ui/src/components/organisms/dashboard-header-actions",
    files: ["dashboard-header-actions.tsx", "index.ts"],
    dependencies: ["lucide-react", "clsx", "tailwind-merge"],
  },
  "dashboard-movements-section": {
    name: "dashboard-movements-section",
    type: "organism",
    path: "packages/ui/src/components/organisms/dashboard-movements-section",
    files: ["dashboard-movements-section.tsx", "index.ts"],
    dependencies: ["lucide-react", "clsx", "tailwind-merge"],
  },
};

/**
 * Mapeamento de hooks disponíveis
 */
export const HOOK_MAP: Record<string, ComponentInfo> = {
  "use-stat-card": {
    name: "useStatCard",
    type: "atom",
    path: "packages/logic/src/hooks/useStatCard",
    files: ["useStatCard.ts"],
    dependencies: ["react"],
  },
};

/**
 * Busca um componente ou hook pelo nome
 */
export function findComponent(name: string): ComponentInfo | null {
  // Normalizar nome
  const normalized = name.toLowerCase().replace(/\s+/g, "-");

  // Buscar em componentes
  if (COMPONENT_MAP[normalized]) {
    return COMPONENT_MAP[normalized];
  }

  // Buscar em hooks
  if (HOOK_MAP[normalized]) {
    return HOOK_MAP[normalized];
  }

  // Tentar busca por alias comum
  const aliases: Record<string, string> = {
    btn: "button",
    "input-field": "input",
    stat: "stat-card",
    table: "data-table",
    menu: "menu-dock",
    "theme-toggle": "theme-toggle-button",
    layout: "dashboard-layout",
    grid: "stats-grid",
    summary: "monthly-summary",
    "header-actions": "dashboard-header-actions",
    movements: "dashboard-movements-section",
  };

  if (aliases[normalized]) {
    return COMPONENT_MAP[aliases[normalized]] || HOOK_MAP[aliases[normalized]] || null;
  }

  return null;
}

/**
 * Lista todos os componentes disponíveis
 */
export function listComponents(): ComponentInfo[] {
  return Object.values(COMPONENT_MAP);
}

/**
 * Lista todos os hooks disponíveis
 */
export function listHooks(): ComponentInfo[] {
  return Object.values(HOOK_MAP);
}
