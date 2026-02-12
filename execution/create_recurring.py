#!/usr/bin/env python3
"""
OpenClaw Kanban — Create Recurring Tasks
Cria tarefas recorrentes diárias (devocional, duolingo, leitura).
Verifica duplicação antes de criar.

Uso:
  python3 execution/create_recurring.py
  python3 execution/create_recurring.py --task devocional
  python3 execution/create_recurring.py --weekdays-only
"""

import argparse
import json
import os
import sys
import urllib.request
import urllib.error
from datetime import datetime
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

# ─── Templates de Tarefas Recorrentes ──────────────────
RECURRING_TASKS = {
    'devocional': {
        'title': 'Devocional Matinal',
        'category': 'devocional',
        'priority': 'high',
    },
    'duolingo': {
        'title': 'Duolingo (15 min)',
        'category': 'estudo',
        'priority': 'medium',
    },
    'leitura': {
        'title': 'Leitura Bíblica',
        'category': 'devocional',
        'priority': 'high',
    },
}


# ─── HTTP Helpers ───────────────────────────────────────
def api_request(method, path, data=None):
    """Faz request HTTP para a API."""
    url = f"{API_URL.rstrip('/')}/{path.lstrip('/')}"
    headers = {'Content-Type': 'application/json'}
    if KANBAN_SECRET:
        headers['Authorization'] = f'Bearer {KANBAN_SECRET}'

    body = json.dumps(data).encode('utf-8') if data else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)

    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return json.loads(resp.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        error_body = e.read().decode('utf-8', errors='replace')
        print(f"❌ HTTP {e.code}: {error_body}", file=sys.stderr)
        return None
    except urllib.error.URLError as e:
        print(f"❌ API offline ({API_URL}): {e.reason}", file=sys.stderr)
        sys.exit(1)


# ─── Logic ──────────────────────────────────────────────
def task_exists_today(title, existing_tasks, today_str):
    """Verifica se tarefa com esse título já existe para hoje."""
    for task in existing_tasks:
        if task.get('title') == title:
            created = task.get('created_at', '')
            if today_str in created:
                return True
            # Também verificar due_date
            due = task.get('due_date', '')
            if due and today_str in due:
                return True
    return False


def create_recurring_tasks(task_filter=None, weekdays_only=False):
    """Cria tarefas recorrentes para hoje."""
    today = datetime.now()
    today_str = today.strftime('%Y-%m-%d')

    # Pular fins de semana se solicitado
    if weekdays_only and today.weekday() >= 5:
        print(f"📅 Hoje é {['segunda','terça','quarta','quinta','sexta','sábado','domingo'][today.weekday()]} — pulando (--weekdays-only)")
        return []

    # Buscar tarefas existentes
    result = api_request('GET', 'tasks')
    existing_tasks = result.get('tasks', []) if result else []

    # Filtrar templates
    templates = RECURRING_TASKS
    if task_filter:
        if task_filter not in templates:
            print(f"❌ Tarefa '{task_filter}' não encontrada. Disponíveis: {', '.join(templates.keys())}", file=sys.stderr)
            sys.exit(1)
        templates = {task_filter: templates[task_filter]}

    created = []
    skipped = []

    for key, template in templates.items():
        if task_exists_today(template['title'], existing_tasks, today_str):
            skipped.append(template['title'])
            continue

        data = {
            **template,
            'due_date': today_str,
        }

        result = api_request('POST', 'tasks', data)
        if result:
            created.append(result)

    # Relatório
    if created:
        print(f"✅ {len(created)} tarefa(s) criada(s) para {today_str}:")
        for t in created:
            print(f"  📌 [{t.get('id')}] {t.get('title')}")

    if skipped:
        print(f"⏭️ {len(skipped)} tarefa(s) já existente(s):")
        for title in skipped:
            print(f"  ↩️ {title}")

    if not created and not skipped:
        print("🤔 Nenhuma tarefa para criar.")

    return created


# ─── CLI ────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description='Criar tarefas recorrentes')
    parser.add_argument('--task', choices=list(RECURRING_TASKS.keys()),
                        help='Criar tarefa específica (default: todas)')
    parser.add_argument('--weekdays-only', action='store_true',
                        help='Pular fins de semana')

    args = parser.parse_args()
    create_recurring_tasks(task_filter=args.task, weekdays_only=args.weekdays_only)


if __name__ == '__main__':
    main()
