# Directive: Notificações de Vencimento

## Goal
Alertar sobre tarefas com due_date vencendo hoje ou amanhã, evitando que prazos passem despercebidos.

## Tools
- **Script**: `execution/check_due_tasks.py`
- **n8n**: Schedule Trigger → Filter → Telegram/Email (quando online)

## Procedure

### Via Script (manual)
```bash
# Verificar tarefas vencendo hoje e amanhã
python3 execution/check_due_tasks.py

# Apenas hoje
python3 execution/check_due_tasks.py --today-only
```

### Via crontab (sem n8n)
```bash
# Todos os dias às 8h
0 8 * * * cd "/Users/leandropinho/Openclaw Kanban/openclaw-kanban" && python3 execution/check_due_tasks.py
```

### Via n8n (quando online)
1. Schedule Trigger (08:00 diário)
2. HTTP Request → GET /api/tasks
3. Code Node → filtrar `due_date ≤ amanhã` e `status ≠ done`
4. IF → tem tarefas → Telegram/Email com lista

## Outputs
```json
{
  "overdue": [{"title": "Relatório", "due_date": "2026-02-11", "priority": "high"}],
  "due_today": [{"title": "Reunião", "due_date": "2026-02-12", "priority": "medium"}],
  "due_tomorrow": [{"title": "Entrega", "due_date": "2026-02-13", "priority": "low"}]
}
```

## Edge Cases
- **Sem tarefas vencendo**: Retorna listas vazias, sem notificação
- **Tarefa sem due_date**: Ignorada (não aparece nos alertas)
- **Tarefa concluída**: Filtrada (status = `done` ou `canceled`)
- **Fuso horário**: Usa timezone do sistema — comparação em data local
