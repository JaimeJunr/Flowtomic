# ⚛️ Regras de Uso do Flowtomic UI e Logic

## Visão Geral

O **Flowtomic** é um sistema de design system modular que fornece:

- **`flowtomic/ui`**: Componentes UI reutilizáveis (atoms, molecules, organisms)
- **`flowtomic/logic`**: Hooks headless e lógica reutilizável
- **`flowtomic`**: CLI para instalação de componentes em projetos externos

## Instalação via CLI

### Inicialização

```bash
# Via npm (Recomendado)
npx flowtomic@latest init
# ou
bunx flowtomic@latest init
```

Isso cria o arquivo `components.json` na raiz do projeto.

### Adicionar Componentes

```bash
# Adicionar um componente
npx flowtomic@latest add button
# ou
bunx flowtomic@latest add button

# Adicionar múltiplos componentes
npx flowtomic@latest add button card input badge
# ou
bunx flowtomic@latest add button card input badge

# Modo interativo (sem especificar componentes)
npx flowtomic@latest add
# ou
bunx flowtomic@latest add

# Listar componentes disponíveis
npx flowtomic@latest list
# ou
bunx flowtomic@latest list
```

### Adicionar Hooks

```bash
# Adicionar um hook
npx flowtomic@latest add use-stat-card
# ou
bunx flowtomic@latest add use-stat-card
```


## Como Funciona

1. **Cópia de Arquivos**: O CLI copia os arquivos dos componentes diretamente para o seu projeto (similar ao shadcn/ui)
2. **Customização Total**: Você pode modificar os componentes copiados conforme necessário
3. **Ajuste Automático de Imports**: Os imports são automaticamente ajustados para usar os aliases do seu projeto
4. **Utils Automático**: O arquivo `utils.ts` (função `cn`) é copiado automaticamente se não existir

## Estrutura de Componentes

### Atoms (13 Componentes Básicos)

Componentes fundamentais e indivisíveis:

- `button` - Botão com variantes
- `badge` - Badge/etiqueta
- `input` - Campo de entrada
- `card` - Card container
- `checkbox` - Checkbox
- `skeleton` - Loading skeleton
- `table` - Tabela base
- `tabs` - Abas
- `alert` - Alerta
- `alert-dialog` - Diálogo de confirmação
- `dialog` - Modal/diálogo
- `dropdown-menu` - Menu dropdown
- `sonner` - Toast notifications

### Molecules (10 Componentes Compostos)

Componentes que combinam atoms:

- `button-group` - Grupo de botões
- `password-input` - Input de senha
- `image-dropzone` - Upload de imagem
- `stat-card` - Card de estatística (usa `use-stat-card` hook)
- `data-table` - Tabela avançada
- `menu-dock` - Dock de menu
- `theme-toggle-button` - Botão de toggle de tema
- `auth-navigation-link` - Link de navegação de auth
- `auth-form-error-message` - Mensagem de erro de formulário
- `social-login-buttons` - Botões de login social

### Organisms (5 Componentes Complexos)

Componentes de alto nível que combinam molecules:

- `dashboard-layout` - Layout de dashboard
- `stats-grid` - Grid de estatísticas
- `monthly-summary` - Resumo mensal
- `dashboard-header-actions` - Ações do header
- `dashboard-movements-section` - Seção de movimentações

### Hooks (1 Hook Headless)

Hooks que fornecem apenas lógica, sem UI:

- `use-stat-card` - Hook headless para StatCard (formatação de valores, cálculo de tendências, props de acessibilidade)

## Uso dos Componentes

### Importação de Componentes

Após instalar via CLI, os componentes são copiados para o seu projeto:

```typescript
// Componentes são importados dos caminhos locais
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
```

### Exemplo de Uso de Componentes

```typescript
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Formulário</CardTitle>
      </CardHeader>
      <CardContent>
        <Input placeholder="Digite algo..." />
        <Button variant="default" size="md">
          Enviar
        </Button>
      </CardContent>
    </Card>
  );
}
```

## Uso dos Hooks

### Importação de Hooks

```typescript
// Hooks são importados dos caminhos locais
import { useStatCard } from "@/hooks/use-stat-card";
```

### Exemplo de Uso de Hooks

```typescript
import { useStatCard } from "@/hooks/use-stat-card";

function MyComponent() {
  const { formattedValue, trend, getCardProps } = useStatCard({
    value: 122380,
    delta: 15.1,
    lastMonth: 105922,
    prefix: "R$ ",
  });

  return (
    <div {...getCardProps()}>
      <span>{formattedValue}</span>
      <Badge variant={trend.variant}>{trend.percentage}</Badge>
    </div>
  );
}
```

**Nota**: O hook `useStatCard` é headless - fornece apenas lógica, formatação e props de acessibilidade. Você controla o markup e styles.

## Configuração (components.json)

O arquivo `components.json` gerado pelo `init`:

```json
{
  "$schema": "https://flowtomic.dev/schema.json",
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/index.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "hooks": "@/hooks"
  },
  "packages": {
    "ui": "flowtomic/ui",
    "logic": "flowtomic/logic"
  }
}
```

### Personalizar Aliases

Você pode editar o `components.json` para ajustar os caminhos conforme sua estrutura de projeto.

## Dependências Comuns

Os componentes podem requerer:

- **React** 18+ ou 19+ (peer dependency)
- **Tailwind CSS** configurado
- **Radix UI** (para componentes interativos):
  - `@radix-ui/react-slot` (button)
  - `@radix-ui/react-label` (input)
  - `@radix-ui/react-checkbox` (checkbox)
  - `@radix-ui/react-tabs` (tabs)
  - `@radix-ui/react-alert-dialog` (alert-dialog)
  - `@radix-ui/react-dialog` (dialog)
  - `@radix-ui/react-dropdown-menu` (dropdown-menu)
- **lucide-react** (para ícones)
- **class-variance-authority** (para variantes)
- **clsx** e **tailwind-merge** (para classes CSS)
- **sonner** (para toast notifications)
- **@tanstack/react-table** (para data-table)
- **flowtomic/logic** (para stat-card)

## Padrões Importantes

1. **Componentes são copiados localmente**: Você pode e deve modificar conforme necessário
2. **Hooks são headless**: Fornecem apenas lógica, sem UI
3. **TypeScript**: Todos os componentes têm tipos exportados
4. **Tailwind CSS**: Todos os componentes usam Tailwind para estilização
5. **Acessibilidade**: Componentes interativos usam Radix UI para acessibilidade

## Troubleshooting

### Erro: "components.json não encontrado"

```bash
npx flowtomic@latest init
# ou
bunx flowtomic@latest init
```

### Erro: "Não foi possível encontrar o repositório Flowtomic"

Este erro geralmente ocorre quando o repositório não pode ser encontrado. O CLI tenta encontrar o repositório de várias formas:

- **Variável de ambiente** `FLOWTOMIC_REPO_PATH`:

```bash
export FLOWTOMIC_REPO_PATH=/caminho/para/flowtomic
npx flowtomic add button
```

- **Caminho relativo** (se executado do repositório)

- **Caminhos padrão** (desenvolvimento local)

### Erro: "Componente não encontrado"

```bash
# Ver lista de componentes disponíveis
npx flowtomic@latest list
# ou
bunx flowtomic@latest list
```

## Quando Usar Cada Tipo

- **Atoms**: Use quando precisar de componentes básicos e reutilizáveis
- **Molecules**: Use quando precisar de componentes compostos que combinam atoms
- **Organisms**: Use quando precisar de componentes complexos e específicos de contexto
- **Hooks**: Use quando precisar apenas de lógica sem UI

## Boas Práticas

1. **Sempre** verificar se o componente já existe antes de criar um novo
2. **Sempre** usar os componentes do Flowtomic quando disponíveis
3. **Modificar** componentes copiados conforme necessário para seu projeto
4. **Manter** consistência visual usando os componentes do sistema
5. **Usar** hooks headless para lógica reutilizável sem acoplamento de UI
6. **Componentes são copiados localmente**: Você pode e deve modificar conforme necessário
7. **Hooks são headless**: Fornecem apenas lógica, sem UI - você controla o markup e styles
8. **TypeScript**: Todos os componentes têm tipos exportados
9. **Tailwind CSS**: Todos os componentes usam Tailwind para estilização
10. **Acessibilidade**: Componentes interativos usam Radix UI para acessibilidade

## Resolução do Repositório

Quando usando npm (`npx flowtomic@latest`), o repositório é resolvido automaticamente através do pacote publicado.

O CLI resolve o repositório na seguinte ordem:

1. Variável de ambiente `FLOWTOMIC_REPO_PATH`
2. Caminho relativo (se executado do repositório)
3. Caminhos padrão para desenvolvimento local
4. Download automático do GitHub quando necessário

## Aliases Suportados

O CLI suporta aliases comuns para componentes:

- `btn` → `button`
- `input-field` → `input`
- `stat` → `stat-card`
- `table` → `data-table`
- `menu` → `menu-dock`
- `theme-toggle` → `theme-toggle-button`
- `layout` → `dashboard-layout`
- `grid` → `stats-grid`
- `summary` → `monthly-summary`
- `header-actions` → `dashboard-header-actions`
- `movements` → `dashboard-movements-section`
