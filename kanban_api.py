#!/usr/bin/env python3
"""
OpenClaw Kanban — API Client
Script determinístico para CRUD completo via API REST.

Uso:
  python3 execution/kanban_api.py --action list
  python3 execution/kanban_api.py --action create --title "Tarefa"
  python3 execution/kanban_api.py --action update --id 1 --status done
  python3 execution/kanban_api.py --action delete --id 1
  python3 execution/kanban_api.py --action add_subtask --id 1 --title "Item"
  python3 execution/kanban_api.py --action toggle_subtask --id 1 --subtask_id 2
  python3 execution/kanban_api.py --action delete_subtask --id 1 --subtask_id 2
"""

import argparse
import json
import os
import sys
import urllib.request
import urllib.error
import urllib.parse
from pathlib import Path

# ─── Config ─────────────────────────────────────────────
def load_env():
    """Carrega variáveis do .env se existir."""
    env_path = Path(__file__).parent.parent / ".env"
    if env_path.exists():
        with open(env_path) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, _, value = line.partition("=")
                    os.environ.setdefault(key.strip(), value.strip())

load_env()

API_URL = os.environ.get("API_URL", "http://localhost:3000/api")
KANBAN_SECRET = os.environ.get("KANBAN_SECRET", "")


# ─── HTTP Helpers ───────────────────────────────────────
def api_request(method, path, data=None):
    """Faz request HTTP para a API do Kanban."""
    url = f"{API_URL.rstrip("/")}/{path.lstrip("/")}"

    headers = {"Content-Type": "application/json"}
    if KANBAN_SECRET:
        headers["Authorization"] = f"Bearer {KANBAN_SECRET}"

    body = json.dumps(data).encode("utf-8") if data else None

    req = urllib.request.Request(url, data=body, headers=headers, method=method)

    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8", errors="replace")
        print(f"❌ HTTP {e.code}: {error_body}", file=sys.stderr)
        sys.exit(1)
    except urllib.error.URLError as e:
        print(f"❌ API offline ({API_URL}): {e.reason}", file=sys.stderr)
        print("💡 Dica: rode \'npm start\' para iniciar o servidor local", file=sys.stderr)
        sys.exit(1)


# ─── Actions ────────────────────────────────────────────
def list_tasks(args):
    """Lista tarefas com filtros opcionais."""
    params = {}
    if args.search:
        params["search"] = args.search
    if args.priority:
        params["priority"] = args.priority
    if args.category:
        params["category"] = args.category

    query = urllib.parse.urlencode(params)
    path = f"tasks?{query}" if query else "tasks"
    result = api_request("GET", path)

    tasks = result.get("tasks", [])
    if not tasks:
        print("📋 Nenhuma tarefa encontrada.")
        return

    print(f"📋 {len(tasks)} tarefa(s):\n")
    for t in tasks:
        priority_emoji = {"high": "🔴", "medium": "🟡", "low": "🟢"}.get(t.get("priority", ""), "⚪")
        category_emoji = {
            "rapel": "🏢", "estudo": "📖", "devocional": "✝️",
            "lazer": "⚽", "seguranca": "🔒"
        }.get(t.get("category", ""), "")
        status_map = {"todo": "📥", "inprogress": "🔄", "done": "✅", "canceled": "🚫"}
        status_emoji = status_map.get(t.get("status", ""), "❓")

        due = f" ⏰ {t["due_date"][:10]}" if t.get("due_date") else ""
        subtask_count = len(t.get("subtasks", []))
        subtask_info = f" [{subtask_count} subtarefas]" if subtask_count else ""

        print(f"  {status_emoji} {priority_emoji} [{t["id"]}] {t["title"]}{due} {category_emoji}{subtask_info}")


def create_task(args):
    """Cria uma nova tarefa."""
    if not args.title:
        print("❌ --title é obrigatório para criar tarefa", file=sys.stderr)
        sys.exit(1)

    data = {"title": args.title}
    if args.description:
        data["description"] = args.description
    if args.priority:
        data["priority"] = args.priority
    if args.category:
        data["category"] = args.category
    if args.due_date:
        data["due_date"] = args.due_date

    result = api_request("POST", "tasks", data)
    print(f"✅ Tarefa criada: [{result.get("id")}] {result.get("title")}")
    return result


def update_task(args):
    """Atualiza uma tarefa existente."""
    if not args.id:
        print("❌ --id é obrigatório para atualizar tarefa", file=sys.stderr)
        sys.exit(1)

    data = {}
    if args.title:
        data["title"] = args.title
    if args.description:
        data["description"] = args.description
    if args.status:
        data["status"] = args.status
    if args.priority:
        data["priority"] = args.priority
    if args.category:
        data["category"] = args.category
    if args.due_date:
        data["due_date"] = args.due_date

    if not data:
        print("❌ Nenhum campo para atualizar. Use --title, --status, --priority, etc.", file=sys.stderr)
        sys.exit(1)

    result = api_request("PUT", f"tasks/{args.id}", data)
    task = result.get("task", {})
    print(f"✅ Tarefa atualizada: [{task.get("id")}] {task.get("title")} → {task.get("status")}")


def delete_task(args):
    """Exclui uma tarefa."""
    if not args.id:
        print("❌ --id é obrigatório para excluir tarefa", file=sys.stderr)
        sys.exit(1)

    result = api_request("DELETE", f"tasks/{args.id}")
    print(f"🗑️ Tarefa excluída: {result.get("message", "OK")}")


def add_subtask(args):
    """Adiciona subtarefa a uma tarefa."""
    if not args.id or not args.title:
        print("❌ --id e --title são obrigatórios", file=sys.stderr)
        sys.exit(1)

    result = api_request("POST", f"tasks/{args.id}/subtasks", {"title": args.title})
    print(f"✅ Subtarefa adicionada: [{result.get("id")}] {result.get("title")}")


def toggle_subtask(args):
    """Alterna completed de uma subtarefa."""
    if not args.id or not args.subtask_id:
        print("❌ --id e --subtask_id são obrigatórios", file=sys.stderr)
        sys.exit(1)

    # Buscar estado atual para toggle
    tasks = api_request("GET", "tasks").get("tasks", [])
    task = next((t for t in tasks if str(t["id"]) == str(args.id)), None)
    if not task:
        print(f"❌ Tarefa {args.id} não encontrada", file=sys.stderr)
        sys.exit(1)

    subtask = next((s for s in task.get("subtasks", []) if str(s["id"]) == str(args.subtask_id)), None)
    if not subtask:
        print(f"❌ Subtarefa {args.subtask_id} não encontrada", file=sys.stderr)
        sys.exit(1)

    new_state = not subtask.get("completed", False)
    result = api_request("PUT", f"tasks/{args.id}/subtasks/{args.subtask_id}", {"completed": new_state})
    emoji = "✅" if new_state else "⬜"
    print(f"{emoji} Subtarefa [{args.subtask_id}]: {"concluída" if new_state else "reaberta"}")


def delete_subtask(args):
    """Exclui uma subtarefa."""
    if not args.id or not args.subtask_id:
        print("❌ --id e --subtask_id são obrigatórios", file=sys.stderr)
        sys.exit(1)

    result = api_request("DELETE", f"tasks/{args.id}/subtasks/{args.subtask_id}")
    print(f"🗑️ Subtarefa excluída: {result.get("message", "OK")}")


# ─── CLI ────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description="OpenClaw Kanban — API Client")
    parser.add_argument("--action", required=True,
                        choices=["list", "create", "update", "delete",
                                 "add_subtask", "toggle_subtask", "delete_subtask"],
                        help="Ação a executar")
    parser.add_argument("--id", help="ID da tarefa")
    parser.add_argument("--subtask_id", help="ID da subtarefa")
    parser.add_argument("--title", help="Título da tarefa/subtarefa")
    parser.add_argument("--description", help="Descrição da tarefa")
    parser.add_argument("--status", choices=["todo", "inprogress", "done", "canceled"],
                        help="Status da tarefa")
    parser.add_argument("--priority", choices=["high", "medium", "low"],
                        help="Prioridade")
    parser.add_argument("--category", choices=["rapel", "estudo", "devocional", "lazer", "seguranca"],
                        help="Categoria")
    parser.add_argument("--due_date", help="Data de vencimento (YYYY-MM-DD)")
    parser.add_argument("--search", help="Termo de busca")

    args = parser.parse_args()

    actions = {
        "list": list_tasks,
        "create": create_task,
        "update": update_task,
        "delete": delete_task,
        "add_subtask": add_subtask,
        "toggle_subtask": toggle_subtask,
        "delete_subtask": delete_subtask,
    }

    actions[args.action](args)


if __name__ == "__main__":
    main()
