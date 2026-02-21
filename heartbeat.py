#!/usr/bin/env python3

import argparse
import json
import os
import sys
from datetime import datetime, timedelta

# Adiciona o diretório pai ao PATH para importar kanban_api
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
import kanban_api

# Adiciona o diretório pai ao PATH para importar health_check
# sys.path.append(os.path.dirname(os.path.abspath(__file__)))
# import health_check # Será implementado na próxima etapa

def check_overdue_tasks():
    """Verifica tarefas vencidas e as que vencem hoje."""
    print("--- Verificando Tarefas Vencidas e do Dia ---")
    today = datetime.now().date()
    overdue_tasks = []
    due_today_tasks = []

    try:
        all_tasks = kanban_api.api_request("GET", "tasks").get("tasks", [])
        for task in all_tasks:
            if task.get("status") in ["done", "canceled"]:
                continue

            due_date_str = task.get("due_date")
            if due_date_str:
                due_date = datetime.fromisoformat(due_date_str).date()
                if due_date < today:
                    overdue_tasks.append(task)
                elif due_date == today:
                    due_today_tasks.append(task)

        if overdue_tasks:
            print("🔴 Tarefas Vencidas:")
            for task in overdue_tasks:
                print(f"  - [{task['id']}] {task['title']} (Venceu em: {task['due_date'][:10]})")
        else:
            print("✅ Nenhuma tarefa vencida.")

        if due_today_tasks:
            print("🟡 Tarefas para Hoje:")
            for task in due_today_tasks:
                print(f"  - [{task['id']}] {task['title']} (Vence Hoje: {task['due_date'][:10]})")
        else:
            print("✅ Nenhuma tarefa vencendo hoje.")

    except Exception as e:
        print(f"❌ Erro ao verificar tarefas: {e}")

    print("--------------------------------------------")
    return {"overdue": overdue_tasks, "due_today": due_today_tasks}

def check_system_status():
    """Verifica o status do sistema (simulado por enquanto)."""
    print("--- Verificando Status do Sistema ---")
    # TODO: Integrar com health_check.py real
    system_ok = True # Simulação
    if system_ok:
        print("✅ Sistema operando normalmente.")
    else:
        print("❌ Alerta: Problemas detectados no sistema.")
    print("-------------------------------------")
    return {"status_ok": system_ok}

def generate_daily_summary():
    """Gera um resumo diário das atividades."""
    print("--- Gerando Resumo Diário ---")
    today = datetime.now().date()
    completed_today = []
    
    try:
        all_tasks = kanban_api.api_request("GET", "tasks").get("tasks", [])
        for task in all_tasks:
            if task.get("status") == "done":
                updated_at_str = task.get("updated_at")
                if updated_at_str:
                    updated_at_date = datetime.fromisoformat(updated_at_str).date()
                    if updated_at_date == today:
                        completed_today.append(task)

        print(f"Resumo Diário - {today.strftime('%Y-%m-%d')}\n")
        print(f"Tarefas Concluídas Hoje ({len(completed_today)}):")
        if completed_today:
            for task in completed_today:
                print(f"  - [{task['id']}] {task['title']}")
        else:
            print("  Nenhuma tarefa concluída hoje.")

        # Incluir informações de tarefas vencidas/do dia do check_overdue_tasks
        task_status = check_overdue_tasks()
        if task_status["overdue"]:
            print(f"\nTarefas Vencidas ({len(task_status['overdue'])}):")
            for task in task_status["overdue"]:
                print(f"  - [{task['id']}] {task['title']} (Venceu em: {task['due_date'][:10]})")
        
        if task_status["due_today"]:
            print(f"\nTarefas para Hoje ({len(task_status['due_today'])}):")
            for task in task_status["due_today"]:
                print(f"  - [{task['id']}] {task['title']} (Vence Hoje: {task['due_date'][:10]})")

    except Exception as e:
        print(f"❌ Erro ao gerar resumo diário: {e}")

    print("-----------------------------------")

def main():
    parser = argparse.ArgumentParser(description="Sistema de Heartbeats para o agente 88.")
    parser.add_argument("--action", required=True,
                        choices=["check_overdue", "check_system", "daily_summary"],
                        help="Ação a executar: verificar tarefas vencidas, status do sistema ou resumo diário.")
    
    args = parser.parse_args()

    if args.action == "check_overdue":
        check_overdue_tasks()
    elif args.action == "check_system":
        check_system_status()
    elif args.action == "daily_summary":
        generate_daily_summary()

if __name__ == "__main__":
    main()
