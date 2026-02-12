# Directive: Kanban CRUD Operations

## Goal
Gerenciar tarefas no OpenClaw Kanban via API REST — criar, listar, atualizar, excluir tarefas e subtarefas.

## Inputs
| Campo | Tipo | Obrigatório | Valores |
|-------|------|-------------|---------|
| `title` | string | ✅ (criar) | Texto livre |
| `description` | string | ❌ | Texto livre |
| `priority` | string | ❌ | `high`, `medium`, `low` |
| `category` | string | ❌ | `rapel`, `estudo`, `devocional`, `lazer`, `seguranca` |
| `due_date` | string | ❌ | Formato `YYYY-MM-DD` |
| `status` | string | ❌ (update) | `todo`, `inprogress`, `done`, `canceled` |

## Tools
- **Script**: `execution/kanban_api.py`
- **API Base**: Definida em `.env` como `API_URL`
- **Auth**: Se `KANBAN_SECRET` estiver definido, enviado como `Authorization: Bearer <secret>`

## Procedure

### Listar tarefas
```bash
python3 execution/kanban_api.py --action list
python3 execution/kanban_api.py --action list --category rapel --priority high
python3 execution/kanban_api.py --action list --search "devocional"
```

### Criar tarefa
```bash
python3 execution/kanban_api.py --action create \
  --title "Devocional Matinal" \
  --priority high \
  --category devocional \
  --due_date 2026-02-13
```

### Atualizar tarefa
```bash
python3 execution/kanban_api.py --action update --id TASK_ID \
  --status inprogress --priority high
```

### Excluir tarefa
```bash
python3 execution/kanban_api.py --action delete --id TASK_ID
```

### Subtarefas
```bash
python3 execution/kanban_api.py --action add_subtask --id TASK_ID --title "Item da checklist"
python3 execution/kanban_api.py --action toggle_subtask --id TASK_ID --subtask_id SUB_ID
python3 execution/kanban_api.py --action delete_subtask --id TASK_ID --subtask_id SUB_ID
```

## Outputs
- JSON com dados da tarefa criada/atualizada
- Lista formatada de tarefas (para consumo do LLM)

## Edge Cases
- **API offline**: Script retorna erro claro com sugestão de rodar `npm start`
- **Tarefa não encontrada**: HTTP 404 → mensagem amigável
- **Campos inválidos**: HTTP 400 → exibir validação esperada
- **Sem título**: Script recusa criar sem `--title`

## Learnings
- SQLite usa INTEGER autoincrement, Supabase usa UUID — IDs podem ser diferentes entre ambientes
- O campo `position` é usado para reorder dentro da coluna
- `updated_at` é atualizado automaticamente pelo trigger no Supabase
