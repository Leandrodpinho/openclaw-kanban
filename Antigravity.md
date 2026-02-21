# Antigravity.md — Guia de Workflows n8n para OpenClaw Kanban

Este arquivo documenta como criar e gerenciar workflows n8n para o OpenClaw Kanban.

---

## 🔗 API Endpoints

Base URL: `https://seu-dominio.vercel.app/api` (produção) ou `http://localhost:3000/api` (local)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/tasks` | Listar tarefas (query: `?search=&priority=&category=`) |
| `POST` | `/tasks` | Criar tarefa (`{title, description, priority, category, due_date}`) |
| `PUT` | `/tasks/:id` | Atualizar tarefa (qualquer campo) |
| `DELETE` | `/tasks/:id` | Excluir tarefa |
| `POST` | `/tasks/:id/subtasks` | Criar subtarefa (`{title}`) |
| `PUT` | `/tasks/:id/subtasks/:sid` | Atualizar subtarefa (`{title, completed}`) |
| `DELETE` | `/tasks/:id/subtasks/:sid` | Excluir subtarefa |
| `GET` | `/tasks/:id/activity` | Histórico de atividade |
| `PUT` | `/tasks/reorder` | Reordenar (`{updates: [{id, position, status?}]}`) |

### Autenticação (opcional)
Se `KANBAN_SECRET` estiver configurado, envie `Authorization: Bearer <secret>` em POST/PUT/DELETE.

---

## 🏗️ Padrões de Workflow n8n

### 1. Webhook → CRUD
```
Webhook Trigger → Switch (action) → HTTP Request (API) → Respond
```
Use para integrar com Telegram, Slack, ou qualquer sistema externo.

### 2. Tarefas Recorrentes
```
Schedule Trigger (cron) → HTTP Request (POST /api/tasks) → Respond
```
Crie tarefas automáticas diárias (devocional, duolingo, leitura).

### 3. Notificações de Vencimento
```
Schedule Trigger → HTTP Request (GET /api/tasks) → Filter (vencendo hoje) → Telegram/Email
```

---

## ⚙️ Configuração do n8n

### Docker Compose
```yaml
services:
  n8n:
    image: n8nio/n8n
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=sua-senha
    volumes:
      - n8n_data:/home/node/.n8n
volumes:
  n8n_data:
```

### n8n-MCP Server
O servidor MCP já está instalado e configurado. Para usar via Antigravity:
- Listar workflows: `n8n_list_workflows`
- Criar workflow: `n8n_create_workflow`
- Executar: `n8n_test_workflow`

---

## 📋 Categorias Disponíveis

| Categoria | Valor | Emoji |
|-----------|-------|-------|
| Rapel | `rapel` | 🏢 |
| Estudo | `estudo` | 📖 |
| Devocional | `devocional` | ✝️ |
| Lazer | `lazer` | ⚽ |
| Segurança | `seguranca` | 🔒 |

## 🎯 Prioridades

| Prioridade | Valor | Emoji |
|------------|-------|-------|
| Alta | `high` | 🔴 |
| Média | `medium` | 🟡 |
| Baixa | `low` | 🟢 |

---

## 🤖 Exemplo: Criar Tarefa via curl

```bash
curl -X POST https://seu-dominio.vercel.app/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_SECRET" \
  -d \'{
    "title": "Devocional Matinal",
    "priority": "high",
    "category": "devocional",
    "due_date": "2026-02-13"
  }\
```

## 🤖 Exemplo: Listar Tarefas

```bash
curl "https://seu-dominio.vercel.app/api/tasks?category=rapel&priority=high"
```
