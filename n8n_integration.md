# Directive: n8n Integration

## Goal
Criar e gerenciar workflows n8n para automação do Kanban — CRUD via webhook, tarefas recorrentes e notificações.

## Prerequisites
- n8n rodando em `localhost:5678` (ou URL configurada em `N8N_URL`)
- API Kanban online (local ou produção)
- `N8N_API_KEY` configurada no `.env`

## Tools
- **MCP**: `n8n_create_workflow`, `n8n_list_workflows`, `n8n_test_workflow`
- **Referência**: `Antigravity.md` (padrões de workflow)
- **Scripts**: `execution/kanban_api.py`, `execution/health_check.py`

## Workflows a Criar

### 1. Kanban CRUD via Webhook
```
Webhook Trigger (POST /webhook/kanban)
  → Switch (action: create|update|delete|list)
    → HTTP Request (API Kanban)
      → Respond to Webhook (JSON)
```
**Uso**: Integrar com Telegram bot, Slack, ou qualquer sistema externo.

### 2. Tarefas Recorrentes (Schedule)
```
Schedule Trigger (cron: 0 6 * * *)
  → Code Node (gerar payload das tarefas do dia)
    → HTTP Request (POST /api/tasks) × N
      → (opcional) Telegram: "Tarefas do dia criadas ✅"
```
**Tarefas padrão**: Devocional, Duolingo, Leitura Bíblica.
**Ver**: `directives/recurring_tasks.md`

### 3. Notificações de Vencimento
```
Schedule Trigger (cron: 0 8 * * *)
  → HTTP Request (GET /api/tasks)
    → Code Node (filtrar due_date ≤ hoje)
      → IF (tem tarefas vencendo)
        → Telegram/Email (lista de tarefas urgentes)
```
**Ver**: `directives/notifications.md`

## Procedure
1. Verificar health do n8n: `python3 execution/health_check.py`
2. Se online, criar workflows via MCP tools
3. Testar cada workflow com `n8n_test_workflow`
4. Ativar workflows para produção

## Edge Cases
- **n8n offline**: Pular criação, registrar no task.md como pendente
- **API offline**: Workflow n8n vai receber erro 5xx — configurar retry
- **Duplicação de tarefas recorrentes**: Verificar se já existe tarefa do dia antes de criar
- **Rate limiting**: Usar batch de no máximo 5 requests por vez

## Learnings
- n8n MCP precisa estar configurado no Antigravity para funcionar
- Expressões n8n usam `={{ }}` — diferente de template literals JS
- Webhook paths devem ser únicos por workflow
