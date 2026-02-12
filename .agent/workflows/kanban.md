---
description: Gerenciar tarefas no OpenClaw Kanban via API
---

# /kanban — Gerenciamento de Tarefas

Use este workflow para gerenciar suas tarefas no Kanban diretamente do Antigravity.

## Configuração
Defina a URL base da API:
- **Local**: `http://localhost:3000/api`
- **Produção**: `https://seu-dominio.vercel.app/api`

Se KANBAN_SECRET estiver ativado, configure o header `Authorization: Bearer <secret>`.

---

## Comandos Disponíveis

### 1. Listar Tarefas
```bash
curl -s "API_URL/tasks" | jq '.tasks[] | {title, status, priority, category}'
```

### 2. Listar por Categoria
```bash
# Exemplo: tarefas da Rapel
curl -s "API_URL/tasks?category=rapel" | jq '.tasks[] | {title, status, priority}'
```

### 3. Criar Tarefa
```bash
curl -s -X POST API_URL/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "TITULO", "priority": "medium", "category": "", "due_date": null}'
```

Campos opcionais: `description`, `priority` (high/medium/low), `category` (rapel/estudo/devocional/lazer/seguranca), `due_date` (YYYY-MM-DD).

### 4. Mover Tarefa
```bash
# Mover para "Em Andamento"
curl -s -X PUT API_URL/tasks/TASK_ID \
  -H "Content-Type: application/json" \
  -d '{"status": "inprogress"}'
```

Status válidos: `todo`, `inprogress`, `done`, `canceled`.

### 5. Editar Tarefa
```bash
curl -s -X PUT API_URL/tasks/TASK_ID \
  -H "Content-Type: application/json" \
  -d '{"title": "Novo Título", "priority": "high", "description": "Detalhes..."}'
```

### 6. Excluir Tarefa
```bash
curl -s -X DELETE API_URL/tasks/TASK_ID
```

### 7. Buscar Tarefas
```bash
curl -s "API_URL/tasks?search=TERMO" | jq '.tasks[] | {title, status}'
```

---

## Categorias e Prioridades

| Categoria | Valor | | Prioridade | Valor |
|-----------|-------|-|------------|-------|
| 🏢 Rapel | `rapel` | | 🔴 Alta | `high` |
| 📖 Estudo | `estudo` | | 🟡 Média | `medium` |
| ✝️ Devocional | `devocional` | | 🟢 Baixa | `low` |
| ⚽ Lazer | `lazer` | | | |
| 🔒 Segurança | `seguranca` | | | |
