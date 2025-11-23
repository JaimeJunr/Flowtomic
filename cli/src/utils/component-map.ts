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
  autocomplete: {
    name: "autocomplete",
    type: "atom",
    path: "packages/ui/src/components/atoms/autocomplete",
    files: ["autocomplete.tsx", "index.ts"],
    dependencies: ["@radix-ui/react-popover", "lucide-react", "clsx", "tailwind-merge"],
  },
  tooltip: {
    name: "tooltip",
    type: "atom",
    path: "packages/ui/src/components/atoms/tooltip",
    files: ["tooltip.tsx", "index.ts"],
    dependencies: ["@radix-ui/react-tooltip", "clsx", "tailwind-merge"],
  },
  command: {
    name: "command",
    type: "atom",
    path: "packages/ui/src/components/atoms/command",
    files: ["command.tsx", "index.ts"],
    dependencies: ["cmdk", "lucide-react", "clsx", "tailwind-merge"],
  },
  collapsible: {
    name: "collapsible",
    type: "atom",
    path: "packages/ui/src/components/atoms/collapsible",
    files: ["collapsible.tsx", "index.ts"],
    dependencies: ["@radix-ui/react-collapsible", "clsx", "tailwind-merge"],
  },
  "scroll-area": {
    name: "scroll-area",
    type: "atom",
    path: "packages/ui/src/components/atoms/scroll-area",
    files: ["scroll-area.tsx", "index.ts"],
    dependencies: ["@radix-ui/react-scroll-area", "clsx", "tailwind-merge"],
  },
  "hover-card": {
    name: "hover-card",
    type: "atom",
    path: "packages/ui/src/components/atoms/hover-card",
    files: ["hover-card.tsx", "index.ts"],
    dependencies: ["@radix-ui/react-hover-card", "clsx", "tailwind-merge"],
  },
  separator: {
    name: "separator",
    type: "atom",
    path: "packages/ui/src/components/atoms/separator",
    files: ["separator.tsx", "index.ts"],
    dependencies: ["@radix-ui/react-separator", "clsx", "tailwind-merge"],
  },
  loader: {
    name: "loader",
    type: "atom",
    path: "packages/ui/src/components/atoms/loader",
    files: ["loader.tsx", "index.ts"],
    dependencies: ["clsx", "tailwind-merge"],
  },
  shimmer: {
    name: "shimmer",
    type: "atom",
    path: "packages/ui/src/components/atoms/shimmer",
    files: ["shimmer.tsx", "index.ts"],
    dependencies: ["motion", "clsx", "tailwind-merge"],
  },
  "code-block": {
    name: "code-block",
    type: "atom",
    path: "packages/ui/src/components/atoms/code/code-block",
    files: ["code-block.tsx", "index.ts"],
    dependencies: ["shiki", "lucide-react", "clsx", "tailwind-merge"],
  },
  snippet: {
    name: "snippet",
    type: "atom",
    path: "packages/ui/src/components/atoms/code/snippet",
    files: ["snippet.tsx", "index.ts"],
    dependencies: ["lucide-react", "clsx", "tailwind-merge"],
  },
  "inline-citation": {
    name: "inline-citation",
    type: "atom",
    path: "packages/ui/src/components/atoms/inline-citation",
    files: ["inline-citation.tsx", "index.ts"],
    dependencies: ["lucide-react", "clsx", "tailwind-merge"],
  },
  label: {
    name: "label",
    type: "atom",
    path: "packages/ui/src/components/atoms/forms/label",
    files: ["label.tsx", "index.ts"],
    dependencies: ["@radix-ui/react-label", "clsx", "tailwind-merge"],
  },
  "radio-group": {
    name: "radio-group",
    type: "atom",
    path: "packages/ui/src/components/atoms/forms/radio-group",
    files: ["radio-group.tsx", "index.ts"],
    dependencies: ["@radix-ui/react-radio-group", "lucide-react", "clsx", "tailwind-merge"],
  },
  switch: {
    name: "switch",
    type: "atom",
    path: "packages/ui/src/components/atoms/forms/switch",
    files: ["switch.tsx", "index.ts"],
    dependencies: ["@radix-ui/react-switch", "clsx", "tailwind-merge"],
  },
  textarea: {
    name: "textarea",
    type: "atom",
    path: "packages/ui/src/components/atoms/forms/textarea",
    files: ["textarea.tsx", "index.ts"],
    dependencies: ["clsx", "tailwind-merge"],
  },
  slider: {
    name: "slider",
    type: "atom",
    path: "packages/ui/src/components/atoms/forms/slider",
    files: ["slider.tsx", "index.ts"],
    dependencies: ["@radix-ui/react-slider", "clsx", "tailwind-merge"],
  },
  toggle: {
    name: "toggle",
    type: "atom",
    path: "packages/ui/src/components/atoms/forms/toggle",
    files: ["toggle.tsx", "index.ts"],
    dependencies: ["@radix-ui/react-toggle", "class-variance-authority", "clsx", "tailwind-merge"],
  },
  popover: {
    name: "popover",
    type: "atom",
    path: "packages/ui/src/components/atoms/feedback/popover",
    files: ["popover.tsx", "index.ts"],
    dependencies: ["@radix-ui/react-popover", "clsx", "tailwind-merge"],
  },
  sheet: {
    name: "sheet",
    type: "atom",
    path: "packages/ui/src/components/atoms/feedback/sheet",
    files: ["sheet.tsx", "index.ts"],
    dependencies: ["@radix-ui/react-dialog", "lucide-react", "clsx", "tailwind-merge"],
  },
  breadcrumb: {
    name: "breadcrumb",
    type: "atom",
    path: "packages/ui/src/components/atoms/navigation/breadcrumb",
    files: ["breadcrumb.tsx", "index.ts"],
    dependencies: ["@radix-ui/react-slot", "lucide-react", "clsx", "tailwind-merge"],
  },
  pagination: {
    name: "pagination",
    type: "atom",
    path: "packages/ui/src/components/atoms/navigation/pagination",
    files: ["pagination.tsx", "index.ts"],
    dependencies: ["lucide-react", "clsx", "tailwind-merge"],
  },
  spinner: {
    name: "spinner",
    type: "atom",
    path: "packages/ui/src/components/atoms/animation/spinner",
    files: ["spinner.tsx", "index.ts"],
    dependencies: ["lucide-react", "clsx", "tailwind-merge"],
  },
  "encrypted-text": {
    name: "encrypted-text",
    type: "atom",
    path: "packages/ui/src/components/atoms/animation/encrypted-text",
    files: ["encrypted-text.tsx", "index.ts"],
    dependencies: ["motion", "clsx", "tailwind-merge"],
  },
  accordion: {
    name: "accordion",
    type: "atom",
    path: "packages/ui/src/components/atoms/layout/accordion",
    files: ["accordion.tsx", "index.ts"],
    dependencies: ["@radix-ui/react-accordion", "lucide-react", "clsx", "tailwind-merge"],
  },
  "aspect-ratio": {
    name: "aspect-ratio",
    type: "atom",
    path: "packages/ui/src/components/atoms/layout/aspect-ratio",
    files: ["aspect-ratio.tsx", "index.ts"],
    dependencies: ["@radix-ui/react-aspect-ratio"],
  },
  "toggle-group": {
    name: "toggle-group",
    type: "atom",
    path: "packages/ui/src/components/atoms/layout/toggle-group",
    files: ["toggle-group.tsx", "index.ts"],
    dependencies: [
      "@radix-ui/react-toggle-group",
      "class-variance-authority",
      "clsx",
      "tailwind-merge",
    ],
  },
  drawer: {
    name: "drawer",
    type: "atom",
    path: "packages/ui/src/components/atoms/layout/drawer",
    files: ["drawer.tsx", "index.ts"],
    dependencies: ["vaul", "clsx", "tailwind-merge"],
  },
  sidebar: {
    name: "sidebar",
    type: "atom",
    path: "packages/ui/src/components/atoms/layout/sidebar",
    files: ["sidebar.tsx", "index.ts"],
    dependencies: [
      "@radix-ui/react-slot",
      "class-variance-authority",
      "lucide-react",
      "@flowtomic/logic",
      "clsx",
      "tailwind-merge",
    ],
  },
  empty: {
    name: "empty",
    type: "atom",
    path: "packages/ui/src/components/atoms/display/empty",
    files: ["empty.tsx", "index.ts"],
    dependencies: ["class-variance-authority", "clsx", "tailwind-merge"],
  },
  kbd: {
    name: "kbd",
    type: "atom",
    path: "packages/ui/src/components/atoms/display/kbd",
    files: ["kbd.tsx", "index.ts"],
    dependencies: ["clsx", "tailwind-merge"],
  },
  "context-menu": {
    name: "context-menu",
    type: "atom",
    path: "packages/ui/src/components/atoms/actions/context-menu",
    files: ["context-menu.tsx", "index.ts"],
    dependencies: ["@radix-ui/react-context-menu", "lucide-react", "clsx", "tailwind-merge"],
  },
  field: {
    name: "field",
    type: "atom",
    path: "packages/ui/src/components/atoms/forms/field",
    files: ["field.tsx", "index.ts"],
    dependencies: ["class-variance-authority", "lucide-react", "clsx", "tailwind-merge"],
  },
  form: {
    name: "form",
    type: "atom",
    path: "packages/ui/src/components/atoms/forms/form",
    files: ["form.tsx", "index.ts"],
    dependencies: [
      "@radix-ui/react-label",
      "@radix-ui/react-slot",
      "react-hook-form",
      "clsx",
      "tailwind-merge",
    ],
  },
  "input-otp": {
    name: "input-otp",
    type: "atom",
    path: "packages/ui/src/components/atoms/forms/input-otp",
    files: ["input-otp.tsx", "index.ts"],
    dependencies: ["input-otp", "lucide-react", "clsx", "tailwind-merge"],
  },
  menubar: {
    name: "menubar",
    type: "atom",
    path: "packages/ui/src/components/atoms/navigation/menubar",
    files: ["menubar.tsx", "index.ts"],
    dependencies: ["@radix-ui/react-menubar", "lucide-react", "clsx", "tailwind-merge"],
  },
  "navigation-menu": {
    name: "navigation-menu",
    type: "atom",
    path: "packages/ui/src/components/atoms/navigation/navigation-menu",
    files: ["navigation-menu.tsx", "index.ts"],
    dependencies: [
      "@radix-ui/react-navigation-menu",
      "class-variance-authority",
      "lucide-react",
      "clsx",
      "tailwind-merge",
    ],
  },
  calendar: {
    name: "calendar",
    type: "atom",
    path: "packages/ui/src/components/atoms/data-display/calendar",
    files: ["calendar.tsx", "index.ts"],
    dependencies: ["react-day-picker", "lucide-react", "clsx", "tailwind-merge"],
  },
  carousel: {
    name: "carousel",
    type: "atom",
    path: "packages/ui/src/components/atoms/data-display/carousel",
    files: ["carousel.tsx", "index.ts"],
    dependencies: ["embla-carousel-react", "lucide-react", "clsx", "tailwind-merge"],
  },
  chart: {
    name: "chart",
    type: "atom",
    path: "packages/ui/src/components/atoms/data-display/chart",
    files: ["chart.tsx", "index.ts"],
    dependencies: ["recharts", "clsx", "tailwind-merge"],
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
  "input-group": {
    name: "input-group",
    type: "molecule",
    path: "packages/ui/src/components/molecules/input-group",
    files: ["input-group.tsx", "index.ts"],
    dependencies: ["clsx", "tailwind-merge"],
  },
  artifact: {
    name: "artifact",
    type: "molecule",
    path: "packages/ui/src/components/molecules/artifact",
    files: ["artifact.tsx", "index.ts"],
    dependencies: ["lucide-react", "clsx", "tailwind-merge"],
  },
  message: {
    name: "message",
    type: "molecule",
    path: "packages/ui/src/components/molecules/message",
    files: ["message.tsx", "index.ts"],
    dependencies: ["streamdown", "lucide-react", "clsx", "tailwind-merge", "ai"],
  },
  suggestion: {
    name: "suggestion",
    type: "molecule",
    path: "packages/ui/src/components/molecules/suggestion",
    files: ["suggestion.tsx", "index.ts"],
    dependencies: ["clsx", "tailwind-merge"],
  },
  sources: {
    name: "sources",
    type: "molecule",
    path: "packages/ui/src/components/molecules/sources",
    files: ["sources.tsx", "index.ts"],
    dependencies: ["lucide-react", "clsx", "tailwind-merge"],
  },
  tool: {
    name: "tool",
    type: "molecule",
    path: "packages/ui/src/components/molecules/tool",
    files: ["tool.tsx", "index.ts"],
    dependencies: ["ai", "lucide-react", "clsx", "tailwind-merge"],
  },
  task: {
    name: "task",
    type: "molecule",
    path: "packages/ui/src/components/molecules/task",
    files: ["task.tsx", "index.ts"],
    dependencies: ["lucide-react", "clsx", "tailwind-merge"],
  },
  checkpoint: {
    name: "checkpoint",
    type: "molecule",
    path: "packages/ui/src/components/molecules/checkpoint",
    files: ["checkpoint.tsx", "index.ts"],
    dependencies: ["lucide-react", "clsx", "tailwind-merge"],
  },
  confirmation: {
    name: "confirmation",
    type: "molecule",
    path: "packages/ui/src/components/molecules/confirmation",
    files: ["confirmation.tsx", "index.ts"],
    dependencies: ["ai", "clsx", "tailwind-merge"],
  },
  "chart-area-interactive": {
    name: "chart-area-interactive",
    type: "molecule",
    path: "packages/ui/src/components/molecules/data-display/chart-area-interactive",
    files: ["chart-area-interactive.tsx", "index.ts"],
    dependencies: ["recharts", "clsx", "tailwind-merge"],
  },
  "chart-bar-interactive": {
    name: "chart-bar-interactive",
    type: "molecule",
    path: "packages/ui/src/components/molecules/data-display/chart-bar-interactive",
    files: ["chart-bar-interactive.tsx", "index.ts"],
    dependencies: ["recharts", "clsx", "tailwind-merge"],
  },
  item: {
    name: "item",
    type: "molecule",
    path: "packages/ui/src/components/molecules/forms/item",
    files: ["item.tsx", "index.ts"],
    dependencies: ["@radix-ui/react-slot", "class-variance-authority", "clsx", "tailwind-merge"],
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
  conversation: {
    name: "conversation",
    type: "organism",
    path: "packages/ui/src/components/organisms/conversation",
    files: ["conversation.tsx", "index.ts"],
    dependencies: ["use-stick-to-bottom", "lucide-react", "clsx", "tailwind-merge"],
  },
  "model-selector": {
    name: "model-selector",
    type: "organism",
    path: "packages/ui/src/components/organisms/model-selector",
    files: ["model-selector.tsx", "index.ts"],
    dependencies: ["cmdk", "clsx", "tailwind-merge"],
  },
  image: {
    name: "image",
    type: "organism",
    path: "packages/ui/src/components/organisms/image",
    files: ["image.tsx", "index.ts"],
    dependencies: ["ai", "clsx", "tailwind-merge"],
  },
  "open-in-chat": {
    name: "open-in-chat",
    type: "organism",
    path: "packages/ui/src/components/organisms/open-in-chat",
    files: ["open-in-chat.tsx", "index.ts"],
    dependencies: ["lucide-react", "clsx", "tailwind-merge"],
  },
  panel: {
    name: "panel",
    type: "organism",
    path: "packages/ui/src/components/organisms/panel",
    files: ["panel.tsx", "index.ts"],
    dependencies: ["@xyflow/react", "clsx", "tailwind-merge"],
  },
  toolbar: {
    name: "toolbar",
    type: "organism",
    path: "packages/ui/src/components/organisms/toolbar",
    files: ["toolbar.tsx", "index.ts"],
    dependencies: ["@xyflow/react", "clsx", "tailwind-merge"],
  },
  controls: {
    name: "controls",
    type: "organism",
    path: "packages/ui/src/components/organisms/controls",
    files: ["controls.tsx", "index.ts"],
    dependencies: ["@xyflow/react", "clsx", "tailwind-merge"],
  },
  connection: {
    name: "connection",
    type: "molecule",
    path: "packages/ui/src/components/molecules/connection",
    files: ["connection.tsx", "index.ts"],
    dependencies: ["@xyflow/react", "clsx", "tailwind-merge"],
  },
  queue: {
    name: "queue",
    type: "organism",
    path: "packages/ui/src/components/organisms/queue",
    files: ["queue.tsx", "index.ts"],
    dependencies: ["lucide-react", "clsx", "tailwind-merge"],
  },
  reasoning: {
    name: "reasoning",
    type: "organism",
    path: "packages/ui/src/components/organisms/reasoning",
    files: ["reasoning.tsx", "index.ts"],
    dependencies: [
      "@radix-ui/react-use-controllable-state",
      "streamdown",
      "lucide-react",
      "clsx",
      "tailwind-merge",
    ],
  },
  plan: {
    name: "plan",
    type: "organism",
    path: "packages/ui/src/components/organisms/plan",
    files: ["plan.tsx", "index.ts"],
    dependencies: ["lucide-react", "clsx", "tailwind-merge"],
  },
  "web-preview": {
    name: "web-preview",
    type: "organism",
    path: "packages/ui/src/components/organisms/web-preview",
    files: ["web-preview.tsx", "index.ts"],
    dependencies: ["lucide-react", "clsx", "tailwind-merge"],
  },
  "script-editor": {
    name: "script-editor",
    type: "organism",
    path: "packages/ui/src/components/organisms/script-editor",
    files: ["script-editor.tsx", "index.ts"],
    dependencies: ["@flowtomic/logic", "lucide-react", "clsx", "tailwind-merge"],
  },
  "chain-of-thought": {
    name: "chain-of-thought",
    type: "organism",
    path: "packages/ui/src/components/organisms/chain-of-thought",
    files: ["chain-of-thought.tsx", "index.ts"],
    dependencies: [
      "@radix-ui/react-use-controllable-state",
      "lucide-react",
      "clsx",
      "tailwind-merge",
    ],
  },
  context: {
    name: "context",
    type: "organism",
    path: "packages/ui/src/components/organisms/context",
    files: ["context.tsx", "index.ts"],
    dependencies: ["tokenlens", "ai", "lucide-react", "clsx", "tailwind-merge"],
  },
  "prompt-input": {
    name: "prompt-input",
    type: "organism",
    path: "packages/ui/src/components/organisms/prompt-input",
    files: ["prompt-input.tsx", "index.ts"],
    dependencies: ["ai", "nanoid", "lucide-react", "cmdk", "clsx", "tailwind-merge"],
  },
  canvas: {
    name: "canvas",
    type: "molecule",
    path: "packages/ui/src/components/molecules/canvas",
    files: ["canvas.tsx", "index.ts"],
    dependencies: ["@xyflow/react"],
  },
  node: {
    name: "node",
    type: "organism",
    path: "packages/ui/src/components/organisms/node",
    files: ["node.tsx", "index.ts"],
    dependencies: ["@xyflow/react", "clsx", "tailwind-merge"],
  },
  edge: {
    name: "edge",
    type: "organism",
    path: "packages/ui/src/components/organisms/edge",
    files: ["edge.tsx", "index.ts"],
    dependencies: ["@xyflow/react", "clsx", "tailwind-merge"],
  },
  "resizable-layout": {
    name: "resizable-layout",
    type: "organism",
    path: "packages/ui/src/components/organisms/resizable-layout",
    files: ["resizable-layout.tsx", "index.ts"],
    dependencies: [
      "@flowtomic/logic",
      "react-resizable-panels",
      "lucide-react",
      "clsx",
      "tailwind-merge",
    ],
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
