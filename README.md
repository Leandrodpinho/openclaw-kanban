# 🚀 OpenClaw Kanban

Quadro Kanban premium para gerenciamento de tarefas, com dark mode, drag & drop, filtros, subtarefas e integração com n8n.

![Status](https://img.shields.io/badge/status-active-brightgreen)
![Node](https://img.shields.io/badge/node-18%2B-blue)

## ✨ Features

- 🎨 **Dark Mode** — Toggle com persistência via localStorage
- 🖱️ **Drag & Drop** — Arraste cards entre colunas (HTML5 nativo)
- 🔍 **Busca e Filtros** — Por texto, prioridade e categoria
- 📝 **Modal de Edição** — Título, descrição, prioridade, categoria, due date
- ✅ **Subtarefas** — Checklist expansível dentro de cada tarefa
- 📊 **Activity Log** — Histórico de alterações por tarefa
- 🔴🟡🟢 **Prioridades** — Alta, Média, Baixa com badges coloridos
- 🏷️ **Categorias** — 🏢 Rapel, 📖 Estudo, ✝️ Devocional, ⚽ Lazer, 🔒 Segurança
- ⏰ **Due Date Alerts** — Alerta visual (vermelho se vencido, amarelo se hoje)
- 🤖 **Automação** — Scripts Python e integração n8n

## Pré-requisitos

- [Node.js](https://nodejs.org/) 18+
- [Python 3](https://www.python.org/) (para scripts de automação)
- npm

## Início Rápido (Desenvolvimento Local)

```bash
# 1. Instalar dependências
npm install

# 2. Copiar configuração
cp .env.example .env

# 3. Iniciar o servidor local (usa SQLite automático)
npm start

# 4. Abrir no navegador
open http://localhost:3000
```

> O banco de dados SQLite é salvo em `database.db` na raiz do projeto.

## Deploy na Vercel (Produção)

### 1. Criar projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e crie um projeto
2. No **SQL Editor**, cole e execute o conteúdo de `supabase-schema.sql`
3. Copie a **URL** e a **anon key** do projeto

### 2. Configurar variáveis de ambiente na Vercel

No painel da Vercel → **Settings** → **Environment Variables**:

| Variável | Descrição | Obrigatório |
|----------|-----------|-------------|
| `SUPABASE_URL` | URL do projeto Supabase | ✅ |
| `SUPABASE_KEY` | Chave anon do Supabase | ✅ |
| `KANBAN_SECRET` | Token para proteger escrita | ❌ |

### 3. Deploy

```bash
npx vercel --prod
```

## 🔐 Autenticação (Opcional)

Para proteger operações de escrita (POST/PUT/DELETE):

1. Defina `KANBAN_SECRET` nas variáveis de ambiente
2. No navegador, abra o console e execute:
   ```javascript
   localStorage.setItem('KANBAN_SECRET', 'seu-token-aqui');
   ```

## 📡 API Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/tasks` | Listar tarefas (`?search=&priority=&category=`) |
| `POST` | `/api/tasks` | Criar tarefa (`{title, description, priority, category, due_date}`) |
| `PUT` | `/api/tasks/:id` | Atualizar tarefa (qualquer campo) |
| `DELETE` | `/api/tasks/:id` | Excluir tarefa |
| `POST` | `/api/tasks/:id/subtasks` | Criar subtarefa (`{title}`) |
| `PUT` | `/api/tasks/:id/subtasks/:sid` | Atualizar subtarefa (`{title, completed}`) |
| `DELETE` | `/api/tasks/:id/subtasks/:sid` | Excluir subtarefa |
| `GET` | `/api/tasks/:id/activity` | Histórico de atividade |
| `PUT` | `/api/tasks/reorder` | Reordenar (`{updates: [{id, position, status?}]}`) |

**Status válidos**: `todo`, `inprogress`, `done`, `canceled`

## 🤖 Automação (Scripts Python)

Scripts determinísticos em `execution/` — sem dependências externas:

```bash
# Listar tarefas
python3 execution/kanban_api.py --action list

# Criar tarefa
python3 execution/kanban_api.py --action create --title "Minha Tarefa" --priority high

# Verificar tarefas vencendo
python3 execution/check_due_tasks.py

# Criar tarefas recorrentes do dia
python3 execution/create_recurring.py

# Backup do banco local
python3 execution/backup_db.py

# Health check dos serviços
python3 execution/health_check.py
```

## 📁 Estrutura

```
openclaw-kanban/
├── api/index.js           ← Servidor Vercel (Supabase)
├── local-server.js        ← Servidor local (SQLite)
├── public/
│   ├── index.html         ← Interface do Kanban
│   └── script.js          ← Lógica do frontend
├── directives/            ← Layer 1: SOPs (Markdown)
│   ├── kanban_crud.md
│   ├── n8n_integration.md
│   ├── deploy.md
│   ├── recurring_tasks.md
│   └── notifications.md
├── execution/             ← Layer 3: Scripts Python
│   ├── kanban_api.py
│   ├── check_due_tasks.py
│   ├── create_recurring.py
│   ├── backup_db.py
│   └── health_check.py
├── .agent/workflows/      ← Workflows Antigravity
│   └── kanban.md
├── Antigravity.md         ← Guia n8n
├── supabase-schema.sql    ← Schema do banco
├── vercel.json            ← Config de deploy
├── .env.example           ← Variáveis de ambiente
└── package.json
```

## 🏗️ Arquitetura 3 Camadas

| Camada | Função | Local |
|--------|--------|-------|
| **Directive** | SOPs em Markdown — o que fazer | `directives/` |
| **Orchestration** | LLM/Agent — decisão inteligente | Antigravity |
| **Execution** | Scripts Python — execução determinística | `execution/` |

## Licença

MIT
