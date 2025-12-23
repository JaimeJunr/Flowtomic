---
name: ivt-lib-rule
description: Instruções detalhadas para agentes de IA externos utilizarem a biblioteca IVT (Investtools Components Library) para construir interfaces React.
applyTo: *.tsx
---

# Guia de Uso da Biblioteca IVT para Agentes de IA

Este documento fornece instruções detalhadas para agentes de IA externos utilizarem a biblioteca **IVT** (Investtools Components Library) para construir interfaces React.

## Visão Geral

A biblioteca **IVT** é uma biblioteca de componentes React baseada em **shadcn/ui** e **Radix UI**, estilizada com **Tailwind CSS**. Ela fornece uma coleção completa de componentes reutilizáveis para construção de interfaces modernas e acessíveis.

### Características Principais

- **Componentes modulares**: Cada componente é exportado como um módulo separado
- **TypeScript**: Totalmente tipado com TypeScript
- **Tailwind CSS**: Estilização baseada em classes utilitárias do Tailwind
- **Acessibilidade**: Componentes seguem padrões WAI-ARIA
- **React 19+**: Requer React versão 19 ou superior

## Instalação e Configuração

### 1. Instalar a Biblioteca

```bash
npm install ivt
```

### 2. Instalar Dependências do React

```bash
npm install react@^19.0.0 react-dom@^19.0.0
```

### 3. Configurar Tailwind CSS

A biblioteca depende do Tailwind CSS. Configure-o no seu projeto:

#### 3.1. Instalar Tailwind CSS

```bash
npm install tailwindcss @tailwindcss/vite
```

#### 3.2. Configurar o Plugin Vite

No arquivo `vite.config.ts`:

```typescript
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss()],
});
```

#### 3.3. Importar Tailwind CSS

No arquivo `index.css` ou `globals.css`:

```css
@import "tailwindcss";
```

#### 3.4. Importar Estilos da Biblioteca

No arquivo principal (`main.tsx` ou `App.tsx`):

```typescript
import "ivt/index.css";
```

## Estrutura de Importação

A biblioteca utiliza **exports nomeados** por módulo. Cada componente é importado do seu próprio caminho:

```typescript
import { ComponentName } from "ivt/module-name";
```

### Padrão de Importação

```typescript
// Componentes UI básicos
import { Button } from "ivt/button";
import { Input } from "ivt/input";
import { Card, CardHeader, CardTitle, CardContent } from "ivt/card";

// Componentes customizados
import { Header, TextWrap } from "ivt/base";
import { DataTableMainFrame } from "ivt/data-table";
import { FileUploader } from "ivt/dropzone";

// Ícones
import { ICON } from "ivt/icon";
```

## Componentes Disponíveis

### Componentes UI Base (shadcn/ui)

Estes componentes seguem o padrão shadcn/ui e são exportados de módulos individuais:

#### Formulários e Inputs

- `ivt/input` - Campo de texto
- `ivt/textarea` - Área de texto
- `ivt/select` - Seleção dropdown
- `ivt/checkbox` - Checkbox
- `ivt/radio-group` - Grupo de radio buttons
- `ivt/switch` - Switch toggle
- `ivt/combobox` - Combobox com busca
- `ivt/multi-select` - Seleção múltipla
- `ivt/date-picker` - Seletor de data
- `ivt/calendar` - Calendário
- `ivt/input-otp` - Input para códigos OTP
- `ivt/slider` - Slider/range input

#### Layout e Estrutura

- `ivt/card` - Card container
- `ivt/separator` - Separador visual
- `ivt/container` - Container (de `ivt/layout`)
- `ivt/aspect-ratio` - Manter proporção
- `ivt/resizable` - Painéis redimensionáveis
- `ivt/scroll-area` - Área com scroll customizado

#### Navegação e Menu

- `ivt/breadcrumb` - Breadcrumb navigation
- `ivt/navigation-menu` - Menu de navegação
- `ivt/menubar` - Barra de menu
- `ivt/dropdown-menu` - Menu dropdown
- `ivt/context-menu` - Menu de contexto
- `ivt/sidebar` - Sidebar lateral

#### Feedback e Overlay

- `ivt/alert` - Alertas
- `ivt/alert-dialog` - Diálogo de confirmação
- `ivt/dialog` - Modal/diálogo
- `ivt/sheet` - Painel lateral (drawer)
- `ivt/drawer` - Drawer mobile
- `ivt/popover` - Popover
- `ivt/tooltip` - Tooltip
- `ivt/hover-card` - Card ao passar mouse
- `ivt/toast` - Notificações toast
- `ivt/sonner` - Sistema de toast avançado

#### Dados e Tabelas

- `ivt/table` - Tabela básica
- `ivt/data-table` - Componentes de tabela de dados (ver seção específica)
- `ivt/pagination` - Paginação
- `ivt/empty` - Estado vazio

#### Outros Componentes

- `ivt/button` - Botão
- `ivt/button-group` - Grupo de botões
- `ivt/badge` - Badge/etiqueta
- `ivt/avatar` - Avatar
- `ivt/progress` - Barra de progresso
- `ivt/skeleton` - Skeleton loader
- `ivt/spinner` - Spinner de loading
- `ivt/tabs` - Abas
- `ivt/accordion` - Accordion
- `ivt/collapsible` - Collapsible
- `ivt/carousel` - Carrossel
- `ivt/chart` - Gráficos
- `ivt/command` - Command palette
- `ivt/toggle` - Toggle button
- `ivt/toggle-group` - Grupo de toggles
- `ivt/kbd` - Teclado visual
- `ivt/field` - Campo de formulário com label
- `ivt/form` - Formulário com react-hook-form
- `ivt/item` - Item de lista

### Componentes Customizados (Investtools)

Estes são componentes específicos da Investtools:

#### Base (`ivt/base`)

- `Header` - Cabeçalho de página
- `TextWrap` - Texto com quebra de linha
- `CalendarPopover` - Popover com calendário
- `CalendarRange` - Seletor de intervalo de datas
- `HoverBadge` - Badge com hover
- `AutoComplete` - Autocomplete customizado
- `DeleteConfirmationModal` - Modal de confirmação de exclusão
- `TooltipIndicator` - Indicador com tooltip

#### Dashboard (`ivt/dash`)

- `DashCard` - Card de dashboard
- `DashCardList` - Lista de cards de dashboard
- `ErrorMessageDashCard` - Card de erro
- `ValuePercentage` - Exibição de valor com percentual

#### Data Table (`ivt/data-table`)

- `DataTableMainFrame` - Frame principal da tabela
- `DataTableMainFrameSortable` - Frame com ordenação
- `DataTableSearch` - Campo de busca
- `DataTableViewOptions` - Opções de visualização
- `DataTablePagination` - Paginação da tabela
- `DataTablePaginationSkeleton` - Skeleton da paginação
- `DataTableRowSkeleton` - Skeleton de linha
- `DataTableSkeleton` - Skeleton completo
- `DataTableStatus` - Status da tabela

#### Dropzone (`ivt/dropzone`)

- `FileUploader` - Upload de arquivos com drag & drop

#### Form Fields (`ivt/form-fields`)

- `ComboboxField` - Campo combobox para formulários

#### Layout (`ivt/layout`)

- `Container` - Container principal
- `ChildContainer` - Container filho
- `ListItem` - Item de lista
- `SectionInfo` - Seção de informações
- `ShowNotFound` - Estado "não encontrado"

#### Shared (`ivt/shared`)

- `ButtonActions` - Grupo de ações de botões

#### Skeleton Component (`ivt/skeleton-component`)

- Componentes de skeleton específicos

#### Table Filter (`ivt/table-filter`)

- Componentes de filtro para tabelas

#### Ícones (`ivt/icon`)

```typescript
import { ICON } from "ivt/icon";

// Ícones disponíveis:
ICON.Active;
ICON.Building;
ICON.Command;
ICON.Filter;
ICON.LineChart;
ICON.Loading;
ICON.MenuDashboard;
ICON.NotAllow;
ICON.Pending;
ICON.Table;
ICON.Update;
```

## Exemplos de Uso

### Exemplo 1: Formulário Básico

```typescript
import { Button } from "ivt/button";
import { Input } from "ivt/input";
import { Label } from "ivt/label";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "ivt/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "ivt/form";

function LoginForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Login</CardTitle>
      </CardHeader>
      <CardContent>
        <Form>
          <FormField
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Form>
      </CardContent>
      <CardFooter>
        <Button type="submit">Entrar</Button>
      </CardFooter>
    </Card>
  );
}
```

### Exemplo 2: Tabela de Dados

```typescript
import { DataTableMainFrame } from "ivt/data-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "ivt/table";

function UserTable({ data }) {
  const columns = [
    { accessorKey: "name", header: "Nome" },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "role", header: "Função" },
  ];

  return (
    <DataTableMainFrame columns={columns} data={data}>
      <Table>
        <TableHeader>
          {columns.map((col) => (
            <TableHead key={col.accessorKey}>{col.header}</TableHead>
          ))}
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.name}</TableCell>
              <TableCell>{row.email}</TableCell>
              <TableCell>{row.role}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </DataTableMainFrame>
  );
}
```

### Exemplo 3: Modal com Formulário

```typescript
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "ivt/dialog";
import { Button } from "ivt/button";
import { Input } from "ivt/input";
import { Label } from "ivt/label";

function CreateUserModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Criar Usuário</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar Novo Usuário</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Nome</Label>
            <Input id="name" />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" />
          </div>
          <Button>Salvar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

### Exemplo 4: Upload de Arquivo

```typescript
import { FileUploader } from "ivt/dropzone";

function FileUpload() {
  const handleUpload = (files: File[]) => {
    console.log("Arquivos selecionados:", files);
  };

  return (
    <FileUploader
      onUpload={handleUpload}
      accept="image/*"
      maxSize={5 * 1024 * 1024} // 5MB
    />
  );
}
```

### Exemplo 5: Uso de Ícones

```typescript
import { ICON } from "ivt/icon";

function StatusIndicator({ status }) {
  const Icon = status === "active" ? ICON.Active : ICON.Pending;

  return (
    <div className="flex items-center gap-2">
      <Icon className="size-4" />
      <span>{status}</span>
    </div>
  );
}
```

## Padrões e Convenções

### 1. Composição de Componentes

Muitos componentes seguem o padrão de composição, onde você importa múltiplas partes:

```typescript
// Card é composto por várias partes
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "ivt/card";
```

### 2. Props `asChild`

Vários componentes suportam a prop `asChild` para renderização como outro elemento:

```typescript
<DialogTrigger asChild>
  <Button>Abrir</Button>
</DialogTrigger>
```

### 3. ClassName e Estilização

Todos os componentes aceitam `className` para customização adicional:

```typescript
<Button className="w-full bg-blue-500">Clique aqui</Button>
```

### 4. Acessibilidade

Os componentes já incluem atributos ARIA e suporte a teclado. Sempre use `Label` com `htmlFor` para inputs:

```typescript
<Label htmlFor="email">Email</Label>
<Input id="email" />
```

### 5. Formulários com react-hook-form

Use os componentes de `ivt/form` para integração com react-hook-form:

```typescript
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormLabel, FormControl } from "ivt/form";

const form = useForm();

<Form {...form}>
  <FormField
    control={form.control}
    name="fieldName"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Label</FormLabel>
        <FormControl>
          <Input {...field} />
        </FormControl>
      </FormItem>
    )}
  />
</Form>;
```

## Diretrizes para Agentes de IA

### Ao Construir Interfaces com IVT

1. **Sempre importe do caminho correto**: Use `ivt/module-name`, não caminhos relativos
2. **Verifique a documentação do componente**: Cada componente tem suas próprias props e requisitos
3. **Use TypeScript**: A biblioteca é totalmente tipada, aproveite o autocomplete
4. **Siga os padrões de composição**: Componentes complexos são compostos por múltiplas partes
5. **Mantenha a acessibilidade**: Use labels, ARIA attributes quando necessário
6. **Estilize com Tailwind**: Use classes Tailwind para customização visual
7. **Considere estados de loading**: Use `Skeleton` ou `Spinner` para estados de carregamento
8. **Trate erros**: Use `Alert` ou `AlertDialog` para feedback de erros
9. **Use formulários adequadamente**: Para formulários complexos, use `ivt/form` com react-hook-form
10. **Teste responsividade**: Componentes são responsivos, mas verifique em diferentes tamanhos

### Estrutura Recomendada de Componente

```typescript
import { Component1, Component2 } from "ivt/module-name";
import { OtherComponent } from "ivt/other-module";

interface MyComponentProps {
  // Props tipadas
}

export function MyComponent({ ...props }: MyComponentProps) {
  // Lógica do componente

  return (
    <Component1>
      <Component2 />
    </Component1>
  );
}
```

### Checklist ao Criar uma Interface

- [ ] Importei todos os componentes necessários de `ivt/*`
- [ ] Importei os estilos: `import "ivt/index.css"`
- [ ] Configurei Tailwind CSS no projeto
- [ ] Componentes estão tipados corretamente
- [ ] Formulários usam `ivt/form` quando apropriado
- [ ] Labels estão associados aos inputs (`htmlFor` e `id`)
- [ ] Estados de loading/erro estão tratados
- [ ] Componente é responsivo
- [ ] Acessibilidade foi considerada

## Recursos Adicionais

- **Storybook**: A biblioteca possui Storybook para visualizar todos os componentes e suas variações
- **TypeScript**: Use o autocomplete do TypeScript para descobrir props disponíveis
- **Tailwind CSS Docs**: Para customização visual, consulte a documentação do Tailwind

## Notas Importantes

- A biblioteca requer **React 19+**
- **Tailwind CSS é obrigatório** para estilização
- Componentes são **tree-shakeable** - apenas os componentes importados são incluídos no bundle
- Todos os componentes são **client components** (não funcionam com SSR sem configuração adicional)
- A biblioteca segue padrões de **shadcn/ui**, então documentação similar pode ser útil como referência

---

**Última atualização**: Baseado na versão 0.5.4 da biblioteca IVT
