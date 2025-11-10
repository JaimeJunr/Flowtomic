# flowtomic

CLI para instalação de componentes e hooks do Flowtomic em projetos.

## Instalação e Uso

### Via GitHub (sem publicar no npm)

```bash
# Inicializar configuração
bunx github:JaimeJunr/Flowtomic/cli init

# Ou se o repositório for privado/local
bunx /caminho/para/flowtomic/cli init
```

### Via npx (se publicado no npm)

```bash
npx flowtomic@latest init
```

## Comandos

### `init`

Inicializa a configuração do Flowtomic no projeto, criando o arquivo `components.json`.

```bash
npx flowtomic@latest init
# ou
bunx flowtomic@latest init
```

**O que faz**:

- Cria o arquivo `components.json` na raiz do projeto
- Configura os aliases e caminhos padrão
- Permite customização dos caminhos de instalação

### `add`

Adiciona componentes ou hooks ao projeto. Os arquivos são copiados diretamente para o seu projeto, permitindo customização total (similar ao shadcn/ui).

```bash
# Adicionar um componente específico
npx flowtomic@latest add button

# Adicionar múltiplos componentes
npx flowtomic@latest add button card input

# Adicionar hooks
npx flowtomic@latest add use-stat-card

# Modo interativo (sem especificar componentes)
npx flowtomic@latest add
```

**O que faz**:

- Copia os arquivos do componente para `components/ui/` (ou caminho configurado)
- Ajusta os imports para usar os aliases do seu projeto
- Instala dependências necessárias (se configurado)

### `add-block`

Adiciona um block completo ao projeto.

```bash
# Adicionar um block específico
npx flowtomic@latest add-block dashboard-01
```

**O que faz**:

- Copia todos os arquivos do block
- Instala dependências necessárias
- Ajusta imports e caminhos

### `list`

Lista todos os componentes, hooks e blocks disponíveis.

```bash
npx flowtomic@latest list
```

**Saída**:

- Lista de atoms (13)
- Lista de molecules (10)
- Lista de organisms (5)
- Lista de hooks (1)
- Lista de blocks (1)

## Como Funciona

O CLI copia os arquivos dos componentes/hooks do repositório Flowtomic diretamente para o seu projeto, permitindo customização total (similar ao shadcn/ui).

### Resolução do Repositório

O CLI tenta encontrar o repositório Flowtomic de várias formas:

1. **Variável de ambiente** `FLOWTOMIC_REPO_PATH`

   ```bash
   export FLOWTOMIC_REPO_PATH=/caminho/para/flowtomic
   npx flowtomic@latest add button
   ```

2. **Caminho relativo** (se executado do repositório)

3. **Caminhos padrão** (desenvolvimento local)

### Variáveis de Ambiente

- **`FLOWTOMIC_REPO_PATH`**: Caminho local para o repositório (para desenvolvimento)
- **`FLOWTOMIC_REPO_URL`**: URL do repositório GitHub (padrão: `JaimeJunr/Flowtomic`)

**SEMPRE configure** essas variáveis quando trabalhar com desenvolvimento local.

## Configuração

O comando `init` cria um arquivo `components.json` na raiz do projeto:

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

### Customizar Caminhos

Edite o arquivo `components.json` para ajustar caminhos e aliases:

```json
{
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/app/globals.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

## Componentes Disponíveis

### Atoms

- button
- badge
- input
- card
- checkbox
- skeleton
- table
- tabs
- alert
- alert-dialog
- dialog
- dropdown-menu
- sonner

### Molecules

- button-group
- password-input
- image-dropzone
- stat-card
- data-table
- menu-dock
- theme-toggle-button

### Organisms

- dashboard-layout
- stats-grid
- monthly-summary
- dashboard-header-actions
- dashboard-movements-section

### Hooks

- use-stat-card

## Exemplos Práticos

### Fluxo Básico

```bash
# 1. Inicializar configuração
npx flowtomic@latest init

# 2. Adicionar componentes básicos
npx flowtomic@latest add button card input

# 3. Adicionar um block completo
npx flowtomic@latest add-block dashboard-01

# 4. Usar no projeto
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
```

### Criar Formulário de Login

```bash
# 1. Adicionar componentes necessários
npx flowtomic@latest add input button card password-input
```

```typescript
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Login</CardTitle>
      </CardHeader>
      <CardContent>
        <Input placeholder="Email" type="email" />
        <PasswordInput placeholder="Senha" />
        <Button>Entrar</Button>
      </CardContent>
    </Card>
  );
}
```

### Criar Dashboard

```bash
# 1. Adicionar block completo
npx flowtomic@latest add-block dashboard-01

# 2. O block já vem com todos os componentes necessários
```

### Criar Tabela de Dados

```bash
# 1. Adicionar data-table
npx flowtomic@latest add data-table
```

```typescript
import { DataTable } from "@/components/ui/data-table";

export function UsersTable() {
  const columns = [
    { accessorKey: "name", header: "Nome" },
    { accessorKey: "email", header: "Email" },
  ];

  const data = [
    { name: "João", email: "joao@example.com" },
    { name: "Maria", email: "maria@example.com" },
  ];

  return <DataTable columns={columns} data={data} />;
}
```

## Compatibilidade com shadcn CLI

O Flowtomic é compatível com o shadcn CLI:

```bash
# Usar registry do Flowtomic com shadcn CLI
npx shadcn@latest add https://registry.flowtomic.dev/all.json
```

## Boas Práticas

- [ ] **SEMPRE inicialize** o projeto com `init` antes de adicionar componentes
- [ ] **SEMPRE adicione** componentes conforme necessário, não todos de uma vez
- [ ] **SEMPRE customize** componentes após a instalação para atender suas necessidades
- [ ] **SEMPRE mantenha** componentes atualizados verificando atualizações no repositório
- [ ] **SEMPRE verifique** dependências necessárias antes de usar componentes

## Troubleshooting

### Problemas Comuns

- **Erro: "components.json não encontrado"**

  - **Solução**: **SEMPRE execute** `npx flowtomic init` primeiro

- **Erro: "Não foi possível encontrar o repositório"**

  - **Solução**: **SEMPRE defina** `FLOWTOMIC_REPO_PATH` ou use caminho local

- **Erro: "Componente não encontrado"**

  - **Solução**: **SEMPRE verifique** componentes disponíveis com `npx flowtomic@latest list`

- **Imports incorretos**

  - **Solução**: **SEMPRE verifique** o arquivo `components.json` e os aliases configurados no seu projeto

- **Dependências faltando**

  - **Solução**: **SEMPRE instale** dependências necessárias manualmente ou configure o CLI para instalar automaticamente

- **Erro ao inicializar**

  - **Solução**: **SEMPRE verifique** se está na raiz do projeto e tem permissões de escrita

### Soluções Detalhadas

#### Problema: Componente não encontrado

```bash
# SEMPRE verifique componentes disponíveis
npx flowtomic@latest list
```

#### Problema: Imports incorretos

- [ ] **SEMPRE verifique** arquivo `components.json`
- [ ] **SEMPRE confirme** que aliases estão corretos no `tsconfig.json` ou `jsconfig.json`
- [ ] **SEMPRE valide** que caminhos de instalação estão corretos

#### Problema: Dependências faltando

- [ ] **SEMPRE instale** dependências necessárias manualmente
- [ ] **SEMPRE verifique** `package.json` do componente para dependências
- [ ] **SEMPRE consulte** documentação do componente para requisitos

## Desenvolvimento

Para desenvolver o CLI localmente:

```bash
cd flowtomic/cli
bun install
bun run dev
bun run build
```

Para usar o repositório local em desenvolvimento:

```bash
export FLOWTOMIC_REPO_PATH=/caminho/para/flowtomic
npx flowtomic@latest add button
```
