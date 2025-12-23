# Make Component IVT

## Overview

Cria componentes React utilizando a biblioteca **IVT** (Investtools Components Library), seguindo as regras especializadas da `ivt-lib-rule`.

Garante que novos componentes sigam padrões de acessibilidade, performance e design system da biblioteca IVT.

Utiliza componentes da IVT baseados em shadcn/ui, Radix UI e Tailwind CSS para implementação completa e consistente.

## Parâmetros

- **--name**: Nome do componente (obrigatório, PascalCase)
- **--type**: Tipo do componente - `atom` | `molecule` | `organism` | `page` | `component`
  (opcional, se não for passado, decida automaticamente)
- **--animated**: Incluir animações com Framer Motion (opcional, padrão: `false`)
- **--path**: Caminho de destino relativo a `frontend/src/presentation/components/` (opcional)

## 1. Preparação e Carregamento de Regras

- [ ] **SEMPRE carregue** a regra da biblioteca IVT: `fetch_rules(["front/ivt-lib-rule"])`
- [ ] **SEMPRE carregue** as regras de componentes React: `fetch_rules(["front/react-components"])`
- [ ] **SEMPRE carregue** as regras de designer React: `fetch_rules(["front/designer-react"])`
- [ ] **SEMPRE valide** parâmetros fornecidos (nome, tipo, path)
- [ ] **SEMPRE verifique** se componente já existe no caminho especificado
- [ ] **SEMPRE confirme** estrutura de diretórios do projeto antes de criar
- [ ] **SEMPRE verifique** se projeto tem React 19+ e Tailwind CSS configurado

## 2. Planejamento da Arquitetura do Componente

- [ ] **SEMPRE determine** o tipo (`atom`, `molecule`, `organism`, `page` ou `component`) se não foi fornecido,
      baseando-se na complexidade do componente
- [ ] **SEMPRE descreva** plano de arquitetura do componente em pseudocódigo detalhado
- [ ] **SEMPRE identifique** componentes IVT necessários (`ivt/button`, `ivt/card`, `ivt/input`, etc.)
- [ ] **SEMPRE defina** interface TypeScript para props do componente
- [ ] **SEMPRE planeje** uso de componentes customizados IVT quando apropriado (`ivt/base`, `ivt/data-table`, etc.)
- [ ] **SEMPRE confirme** abordagem antes de escrever código completo

## 3. Implementação do Componente

### 3.1 Estrutura Base

- [ ] **SEMPRE use** `forwardRef` para componentes interativos
- [ ] **SEMPRE implemente** interface TypeScript rigorosa para todas as props
- [ ] **SEMPRE exporte** componente com `displayName` apropriado
- [ ] **SEMPRE use** função utilitária `cn()` para classes condicionais (se disponível no projeto)
- [ ] **SEMPRE siga** padrões de importação da IVT: `import { Component } from "ivt/module-name"`

### 3.2 Importação de Componentes IVT

- [ ] **SEMPRE importe** componentes do caminho correto: `ivt/module-name`, nunca caminhos relativos
- [ ] **SEMPRE use** exports nomeados da biblioteca IVT
- [ ] **SEMPRE importe** múltiplas partes de componentes compostos quando necessário:
  ```typescript
  import { Card, CardHeader, CardTitle, CardContent } from "ivt/card";
  ```
- [ ] **SEMPRE verifique** se estilos da IVT estão importados: `import "ivt/index.css"`
- [ ] **SEMPRE use** componentes customizados IVT quando apropriado (`ivt/base`, `ivt/data-table`, `ivt/dash`, etc.)

### 3.3 Estilização e Design System

- [ ] **SEMPRE use** classes Tailwind para estilização adicional
- [ ] **SEMPRE utilize** componentes IVT como base, estendendo com `className` quando necessário
- [ ] **SEMPRE implemente** estados de foco e indicadores de acessibilidade
- [ ] **SEMPRE siga** padrões de espaçamento e tipografia da biblioteca IVT
- [ ] **SEMPRE suporte** modo escuro através de variáveis CSS do Tailwind

### 3.4 Acessibilidade

- [ ] **SEMPRE implemente** rótulos, papéis e propriedades ARIA corretamente
- [ ] **SEMPRE garanta** navegação por teclado totalmente funcional
- [ ] **SEMPRE forneça** gerenciamento de foco e indicadores visuais adequados
- [ ] **SEMPRE inclua** suporte a leitores de tela com anúncios apropriados
- [ ] **SEMPRE use** `Label` com `htmlFor` para inputs: `<Label htmlFor="email">Email</Label>`
- [ ] **SEMPRE siga** diretrizes WCAG 2.1 nível AA

### 3.5 Animações (se --animated)

- [ ] **SEMPRE use** componentes `motion` do Framer Motion quando animações forem solicitadas
- [ ] **SEMPRE crie** motion variants reutilizáveis para linguagem de animação consistente
- [ ] **SEMPRE implemente** `useReducedMotion` para respeitar preferências de acessibilidade
- [ ] **SEMPRE priorize** animações de `transform` e `opacity` para aceleração via GPU
- [ ] **SEMPRE use** `AnimatePresence` para animações de entrada e saída quando necessário
- [ ] **SEMPRE mantenha** performance a 60fps

### 3.6 Formulários

- [ ] **SEMPRE use** `ivt/form` com react-hook-form para formulários complexos
- [ ] **SEMPRE use** `FormField`, `FormItem`, `FormLabel`, `FormControl` da IVT
- [ ] **SEMPRE integre** com `useForm` do react-hook-form
- [ ] **SEMPRE valide** inputs usando validação do react-hook-form

## 4. Integração com Biblioteca IVT

- [ ] **SEMPRE estenda** componentes existentes da IVT em vez de recriá-los
- [ ] **SEMPRE use** primitivos do Radix UI através da IVT como base
- [ ] **SEMPRE siga** padrões e convenções da API de componentes da IVT
- [ ] **SEMPRE use** componentes customizados IVT quando apropriado:
  - `ivt/base` - Componentes base customizados (Header, TextWrap, etc.)
  - `ivt/data-table` - Componentes de tabela de dados
  - `ivt/dash` - Componentes de dashboard
  - `ivt/dropzone` - Upload de arquivos
  - `ivt/layout` - Componentes de layout
  - `ivt/shared` - Componentes compartilhados
- [ ] **SEMPRE use** ícones da IVT: `import { ICON } from "ivt/icon"`
- [ ] **SEMPRE crie** componentes que se integrem perfeitamente aos demais componentes da IVT

## 5. Validação e Testes

- [ ] **SEMPRE verifique** que componente está totalmente funcional sem placeholders
- [ ] **SEMPRE inclua** todos os imports, tipos e exportações necessários
- [ ] **SEMPRE valide** que código segue boas práticas DRY (Don't Repeat Yourself)
- [ ] **SEMPRE teste** componente com tecnologias assistivas em mente
- [ ] **SEMPRE confirme** que animações respeitam `prefers-reduced-motion`
- [ ] **SEMPRE verifique** que imports estão usando caminhos corretos da IVT (`ivt/module-name`)
- [ ] **SEMPRE confirme** que estilos da IVT estão importados

## Checklist de Validação Final

- [ ] **SEMPRE verifique** que regras `ivt-lib-rule`, `react-components` e `designer-react` foram aplicadas
- [ ] **SEMPRE confirme** que componente segue padrões da biblioteca IVT (foco principal)
- [ ] **SEMPRE valide** que acessibilidade está implementada corretamente
- [ ] **SEMPRE verifique** que TypeScript está sem erros
- [ ] **SEMPRE confirme** que imports usam caminhos corretos da IVT (`ivt/module-name`)
- [ ] **SEMPRE valide** que estilos da IVT estão importados (`import "ivt/index.css"`)
- [ ] **SEMPRE verifique** que componentes customizados IVT foram usados quando apropriado
- [ ] **SEMPRE valide** que animações (se aplicável) são performáticas e acessíveis
- [ ] **SEMPRE garanta** que componente está completo sem partes faltando
- [ ] **SEMPRE confirme** que código está limpo e bem estruturado
- [ ] **SEMPRE verifique** que formulários usam `ivt/form` quando apropriado
- [ ] **SEMPRE confirme** que labels estão associados aos inputs (`htmlFor` e `id`)

## Exemplos de Uso

```bash
# Criar componente básico usando IVT
make-component-ivt --name="Button" --type="atom"

# Criar componente com animações
make-component-ivt --name="AnimatedCard" --type="molecule" --animated

# Criar componente em caminho específico
make-component-ivt --name="DashboardWidget" --type="organism" --path="dashboard/"

# Criar componente de formulário
make-component-ivt --name="UserForm" --type="molecule"
```

## Exemplos de Estrutura de Componente IVT

### Exemplo 1: Componente Básico com Card

```typescript
import { Card, CardHeader, CardTitle, CardContent } from "ivt/card";
import { Button } from "ivt/button";

interface MyCardProps {
  title: string;
  children: React.ReactNode;
}

export function MyCard({ title, children }: MyCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
```

### Exemplo 2: Componente com Formulário

```typescript
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormLabel, FormControl } from "ivt/form";
import { Input } from "ivt/input";
import { Button } from "ivt/button";

interface UserFormProps {
  onSubmit: (data: FormData) => void;
}

export function UserForm({ onSubmit }: UserFormProps) {
  const form = useForm();

  return (
    <Form {...form}>
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input type="email" {...field} />
            </FormControl>
          </FormItem>
        )}
      />
      <Button type="submit">Salvar</Button>
    </Form>
  );
}
```

### Exemplo 3: Componente com Ícones IVT

```typescript
import { ICON } from "ivt/icon";
import { Badge } from "ivt/badge";

interface StatusBadgeProps {
  status: "active" | "pending";
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const Icon = status === "active" ? ICON.Active : ICON.Pending;

  return (
    <Badge>
      <Icon className="size-4" />
      <span>{status}</span>
    </Badge>
  );
}
```

## Notas Importantes

- **SEMPRE priorize** acessibilidade e experiência do usuário acima da complexidade
- **SEMPRE implemente** toda funcionalidade solicitada completamente
- **NUNCA deixe** placeholders, todos ou partes faltando
- **SEMPRE seja** conciso e evite texto desnecessário
- **SEMPRE use** imports da IVT: `import { Component } from "ivt/module-name"`
- **SEMPRE verifique** se estilos da IVT estão importados: `import "ivt/index.css"`
- **SEMPRE use** React 19+ (requisito da biblioteca IVT)
- **SEMPRE configure** Tailwind CSS no projeto antes de usar componentes IVT
- **SEMPRE consulte** a documentação da IVT para componentes disponíveis e suas props
