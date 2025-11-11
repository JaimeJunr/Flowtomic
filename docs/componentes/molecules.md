# 🧬 Molecules - Componentes Compostos

Componentes moleculares do Flowtomic. São combinações de atoms que formam componentes mais complexos.

## 📦 Componentes Disponíveis (22)

### `button-group`

Grupo de botões para ações relacionadas.

**Dependências**: `clsx`, `tailwind-merge`

### `password-input`

Input de senha com toggle de visibilidade.

**Dependências**: `lucide-react`, `clsx`, `tailwind-merge`

### `image-dropzone`

Área de upload de imagem com drag and drop.

**Dependências**: `lucide-react`, `clsx`, `tailwind-merge`

### `stat-card`

Card de estatística com ícone e valor.

**Dependências**: `flowtomic/logic`, `lucide-react`, `clsx`, `tailwind-merge`

### `data-table`

Tabela avançada com funcionalidades de ordenação e filtro.

**Dependências**: `@tanstack/react-table`, `lucide-react`, `clsx`, `tailwind-merge`

### `menu-dock`

Dock de menu para navegação.

**Dependências**: `clsx`, `tailwind-merge`

### `theme-toggle-button`

Botão para alternar entre temas claro/escuro.

**Dependências**: `lucide-react`, `clsx`, `tailwind-merge`

### `auth-navigation-link`

Link de navegação para páginas de autenticação.

**Dependências**: `clsx`, `tailwind-merge`

### `auth-form-error-message`

Mensagem de erro para formulários de autenticação.

**Dependências**: `clsx`, `tailwind-merge`

### `social-login-buttons`

Botões de login social (Google, GitHub, etc.).

**Dependências**: `lucide-react`, `clsx`, `tailwind-merge`

### `input-group`

Grupo de input com addons e botões integrados.

**Dependências**: `clsx`, `tailwind-merge`

### `artifact`

Container de artifact com header, actions e conteúdo.

**Dependências**: `lucide-react`, `clsx`, `tailwind-merge`

### `message`

Componente de mensagem com suporte a branches e attachments.

**Dependências**: `streamdown`, `lucide-react`, `clsx`, `tailwind-merge`, `ai`

### `suggestion`

Lista de sugestões com scroll horizontal.

**Dependências**: `clsx`, `tailwind-merge`

### `sources`

Lista de fontes colapsável.

**Dependências**: `lucide-react`, `clsx`, `tailwind-merge`

### `tool`

Display de tool com collapsible para mostrar input/output.

**Dependências**: `ai`, `lucide-react`, `clsx`, `tailwind-merge`

### `task`

Item de task com collapsible para mostrar detalhes.

**Dependências**: `lucide-react`, `clsx`, `tailwind-merge`

### `checkpoint`

Checkpoint display com ícone e trigger.

**Dependências**: `lucide-react`, `clsx`, `tailwind-merge`

### `confirmation`

Confirmation dialog wrapper para aprovação de ações.

**Dependências**: `ai`, `clsx`, `tailwind-merge`

### `connection`

Componente ConnectionLineComponent do @xyflow/react para renderizar linhas de conexão temporárias.

**Dependências**: `@xyflow/react`, `clsx`, `tailwind-merge`

### `canvas`

Wrapper do ReactFlow do @xyflow/react para visualização de grafos.

**Dependências**: `@xyflow/react`

**Nota**: Requer importação de CSS: `@xyflow/react/dist/style.css`

### `animated-shiny-text` (Typography)

Texto com efeito shimmer animado para destacar conteúdo. Implementação especializada que usa o componente atômico Shimmer.

**Dependências**: `motion`, `clsx`, `tailwind-merge`

**Localização**: `packages/ui/src/components/molecules/typography/animated-shiny-text`

## 🚀 Instalação

```bash
# Instalar uma molecule específica
npx flowtomic@latest add button-group

# Instalar múltiplas molecules
npx flowtomic@latest add button-group password-input stat-card
```

## 📖 Exemplos de Uso

```typescript
import { ButtonGroup } from "@/components/ui/button-group";
import { PasswordInput } from "@/components/ui/password-input";
import { StatCard } from "@/components/ui/stat-card";

export function Example() {
  return (
    <div>
      <ButtonGroup>
        <Button>Opção 1</Button>
        <Button>Opção 2</Button>
        <Button>Opção 3</Button>
      </ButtonGroup>

      <PasswordInput placeholder="Digite sua senha" />

      <StatCard title="Total de Vendas" value="R$ 10.000" icon={TrendingUp} />
    </div>
  );
}
```
