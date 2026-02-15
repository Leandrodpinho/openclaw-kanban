#!/usr/bin/env python3
"""
OpenClaw Kanban — Check Due Tasks
Verifica tarefas vencendo hoje, amanhã ou já vencidas.

Uso:
  python3 execution/check_due_tasks.py
  python3 execution/check_due_tasks.py --today-only
  python3 execution/check_due_tasks.py --json
"""

import argparse
import json
import os
import sys
import urllib.request
import urllib.error
from datetime import datetime, timedelta
from pathlib import Path


# ─── Config ─────────────────────────────────────────────
def load_env():
    """Carrega variáveis do .env se existir."""
    env_path = Path(__file__).parent.parent / '.env'
    if env_path.exists():
        with open(env_path) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, _, value = line.partition('=')
                    os.environ.setdefault(key.strip(), value.strip())

load_env()

API_URL = os.environ.get('API_URL', 'http://localhost:3000/api')
KANBAN_SECRET = os.environ.get('KANBAN_SECRET', '')


# ─── HTTP ───────────────────────────────────────────────
def fetch_tasks():
    """Busca todas as tarefas da API."""
    url = f"{API_URL.rstrip('/')}/tasks"
    headers = {'Content-Type': 'application/json'}
    if KANBAN_SECRET:
        headers['Authorization'] = f'Bearer {KANBAN_SECRET}'

    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            return data.get('tasks', [])
    except urllib.error.URLError as e:
        print(f"❌ API offline ({API_URL}): {e}", file=sys.stderr)
        sys.exit(1)


# ─── Logic ──────────────────────────────────────────────
def check_due_tasks(today_only=False):
    """Categoriza tarefas por urgência de vencimento."""
    tasks = fetch_tasks()
    today = datetime.now().date()
    tomorrow = today + timedelta(days=1)

    result = {
        'overdue': [],
        'due_today': [],
        'due_tomorrow': [],
    }

    for task in tasks:
        # Ignorar concluídas e canceladas
        if task.get('status') in ('done', 'canceled'):
            continue

        due = task.get('due_date')
        if not due:
            continue

        # Parsear data (formato ISO)
        try:
            due_date = datetime.fromisoformat(due.replace('Z', '+00:00')).date()
        except (ValueError, AttributeError):
            continue

        entry = {
            'id': task['id'],
            'title': task['title'],
            'due_date': str(due_date),
            'priority': task.get('priority', 'medium'),
            'category': task.get('category', ''),
            'status': task.get('status', 'todo'),
        }

        if due_date < today:
            result['overdue'].append(entry)
        elif due_date == today:
            result['due_today'].append(entry)
        elif due_date == tomorrow and not today_only:
            result['due_tomorrow'].append(entry)

    return result


# ─── Output ─────────────────────────────────────────────
def print_results(result, as_json=False):
    """Imprime resultados formatados."""
    if as_json:
        print(json.dumps(result, indent=2, ensure_ascii=False))
        return

    total = sum(len(v) for v in result.values())

    if total == 0:
        print("✨ Nenhuma tarefa vencendo. Tudo em dia!")
        return

    priority_emoji = {'high': '🔴', 'medium': '🟡', 'low': '🟢'}

    if result['overdue']:
        print(f"\n⚠️ VENCIDAS ({len(result['overdue'])}):")
        for t in result['overdue']:
            p = priority_emoji.get(t['priority'], '⚪')
            print(f"  {p} [{t['id']}] {t['title']} — venceu em {t['due_date']}")

    if result['due_today']:
        print(f"\n🔔 VENCE HOJE ({len(result['due_today'])}):")
        for t in result['due_today']:
            p = priority_emoji.get(t['priority'], '⚪')
            print(f"  {p} [{t['id']}] {t['title']}")

    if result['due_tomorrow']:
        print(f"\n📅 VENCE AMANHÃ ({len(result['due_tomorrow'])}):")
        for t in result['due_tomorrow']:
            p = priority_emoji.get(t['priority'], '⚪')
            print(f"  {p} [{t['id']}] {t['title']}")

    print(f"\n📊 Total: {total} tarefa(s) requerendo atenção")


# ─── CLI ────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description='Verificar tarefas vencendo')
    parser.add_argument('--today-only', action='store_true', help='Apenas tarefas de hoje')
    parser.add_argument('--json', action='store_true', help='Saída em JSON')

    args = parser.parse_args()
    result = check_due_tasks(today_only=args.today_only)
    print_results(result, as_json=args.json)


if __name__ == '__main__':
    main()
