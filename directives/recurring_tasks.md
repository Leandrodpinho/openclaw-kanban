# Directive: Tarefas Recorrentes

## Goal
Criar tarefas automáticas diárias no Kanban para hábitos e rotinas.

## Tarefas Padrão

| Tarefa | Categoria | Prioridade | Horário |
|--------|-----------|------------|---------|
| Devocional Matinal | `devocional` | `high` | 06:00 |
| Duolingo (15 min) | `estudo` | `medium` | 06:00 |
| Leitura Bíblica | `devocional` | `high` | 06:00 |

## Tools
- **Script**: `execution/create_recurring.py`
- **n8n**: Schedule Trigger (quando online)

## Procedure

### Via Script (manual ou cron)
```bash
# Criar todas as tarefas do dia
python3 execution/create_recurring.py

# Criar tarefa específica
python3 execution/create_recurring.py --task devocional
```

### Via crontab (sem n8n)
```bash
# Adicionar ao crontab: todos os dias às 6h
0 6 * * * cd "/Users/leandropinho/Openclaw Kanban/openclaw-kanban" && python3 execution/create_recurring.py
```

### Via n8n (quando online)
- Usar workflow "Tarefas Recorrentes" (Schedule Trigger → POST /api/tasks)
- Ver `directives/n8n_integration.md` para detalhes

## Edge Cases
- **Duplicação**: O script verifica se já existe tarefa com mesmo título e data antes de criar
- **API offline**: Script falha graciosamente e imprime erro
- **Fim de semana**: Para pular fins de semana, usar flag `--weekdays-only`

## Outputs
- Lista de tarefas criadas (JSON)
- Mensagem de confirmação: "3 tarefas criadas para 2026-02-12"
