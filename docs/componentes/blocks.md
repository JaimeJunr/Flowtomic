# 🧱 Blocks - Componentes Pré-construídos

Blocks são componentes completos e prontos para uso, combinando múltiplos organisms, molecules e atoms.

## 📦 Blocks Disponíveis (3)

### `dashboard-01`

Dashboard simples com cards usando componentes do Flowtomic.

**Dependências**: `card`, `button`

**Arquivos**:

- `blocks/dashboard-01/page.tsx` → `app/dashboard/page.tsx`

**Categoria**: `dashboard`

### `flowtomic-dashboard`

Dashboard completo com sidebar, header, estatísticas, gráficos, listas de projetos e equipe, e timer.

**Dependências**: `button`, `card`, `input`, `avatar`, `badge`, `progress`, `stat-card`, `sidebar-navigation`, `dashboard-header`, `bar-chart`, `circular-progress-chart`, `project-list`, `team-member-list`, `reminder-card`, `time-tracker`, `resizable-layout`

**Arquivos**:

- `blocks/flowtomic-dashboard/page.tsx` → `app/dashboard/page.tsx`

**Categoria**: `dashboard`, `admin`

### `developer-panel`

Painel de desenvolvedor completo com informações do sistema, ambiente, ferramentas de desenvolvimento e editor de scripts integrado.

**Dependências**: `button`, `card`, `badge`, `tabs`, `script-editor`

**Arquivos**:

- `blocks/developer-panel/page.tsx` → `app/developer/page.tsx`

**Categoria**: `developer`, `admin`, `tools`

**Funcionalidades**:

- Informações do usuário atual (nome, email, role, token)
- Status de health check do sistema
- Informações da aplicação (nome, versão, descrição)
- Informações do ambiente frontend (API URL, modo, timezone, resolução)
- Ferramentas de desenvolvimento (Swagger UI, API Docs, Health Check)
- Informações do navegador (User Agent, timestamp)
- Editor de scripts integrado com terminal interativo

## 🚀 Instalação

```bash
# Adicionar um block completo
npx flowtomic@latest add-block dashboard-01

# Adicionar o dashboard completo do Flowtomic
npx flowtomic@latest add-block flowtomic-dashboard

# Adicionar o painel de desenvolvedor
npx flowtomic@latest add-block developer-panel
```

O block será instalado com todos os seus arquivos e dependências automaticamente.

## 📖 Estrutura

Os blocks são instalados como páginas completas e podem ser customizados após a instalação.

## 🎯 Como Funciona

1. O CLI copia os arquivos do block para o seu projeto
2. As dependências necessárias são instaladas automaticamente
3. Os imports são ajustados para usar os aliases do seu projeto
4. Você pode customizar o block após a instalação

## 📝 Exemplos

Após instalar `dashboard-01`, você terá uma página completa de dashboard em `app/dashboard/page.tsx` (ou no caminho especificado pelo block).

Após instalar `flowtomic-dashboard`, você terá um dashboard completo com:

- Sidebar de navegação
- Header com busca e perfil
- Cards de estatísticas de projetos
- Gráfico de barras de analytics
- Lista de projetos
- Lista de membros da equipe
- Card de lembretes
- Gráfico circular de progresso
- Timer com controles

Após instalar `developer-panel`, você terá um painel completo de desenvolvedor com:

- Cards informativos sobre usuário, sistema, ambiente e navegador
- Health check do sistema
- Acesso rápido a ferramentas de desenvolvimento (Swagger, API Docs)
- Editor de scripts com terminal interativo
- Suporte a cópia de informações (token, URLs, User Agent)
