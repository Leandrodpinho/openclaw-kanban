#!/usr/bin/env python3

import os
import sys
from datetime import datetime

# Adiciona o diretório pai ao PATH para importar kanban_api
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
import kanban_api

LESSONS_LOG_PATH = "/home/ubuntu/88-structure/shared/lessons/lessons_log.md"
MEMORY_MD_PATH = "/home/ubuntu/88-structure/MEMORY.md"

def get_completed_tasks():
    """Busca todas as tarefas concluídas do Kanban."""
    print("Buscando tarefas concluídas...")
    try:
        all_tasks = kanban_api.api_request("GET", "tasks").get("tasks", [])
        completed_tasks = [task for task in all_tasks if task.get("status") == "done"]
        print(f"Encontradas {len(completed_tasks)} tarefas concluídas.")
        return completed_tasks
    except Exception as e:
        print(f"❌ Erro ao buscar tarefas concluídas: {e}")
        return []

def extract_lessons(task):
    """Extrai uma lição aprendida de uma tarefa concluída."""
    # Para simplificar, a lição é a conclusão da tarefa.
    # Em um cenário real, isso poderia envolver análise de descrição, comentários, etc.
    lesson = f"A tarefa '{task.get('title', 'N/A')}' (ID: {task.get('id', 'N/A')}) foi concluída com sucesso."
    if task.get('description'):
        lesson += f" Descrição: {task['description'][:100]}..." if len(task['description']) > 100 else f" Descrição: {task['description']}"
    return lesson

def update_lessons_log(lesson_text):
    """Atualiza o arquivo shared/lessons/lessons_log.md com a nova lição."""
    print(f"Atualizando {LESSONS_LOG_PATH}...")
    try:
        with open(LESSONS_LOG_PATH, "a", encoding="utf-8") as f:
            f.write(f"\n## {datetime.now().strftime('%Y-%m-%d')}\n\n*   **Lição:** {lesson_text}\n*   **Impacto:** Contribui para o conhecimento e aprimoramento do agente.\n*   **Ação:** Registrar para referência futura.\n")
        print("✅ lessons_log.md atualizado.")
    except Exception as e:
        print(f"❌ Erro ao atualizar lessons_log.md: {e}")

def update_memory_md_if_needed():
    """Atualiza MEMORY.md com novos tópicos se necessário (placeholder)."""
    print("Verificando necessidade de atualização de MEMORY.md...")
    # Esta função é um placeholder. A lógica para identificar "novos tópicos"
    # e atualizar MEMORY.md seria complexa, envolvendo NLP e análise de tendências.
    # Por enquanto, apenas registra que a verificação foi feita.
    print("ℹ️ Lógica para atualização de MEMORY.md com novos tópicos ainda não implementada.")

def main():
    print("Iniciando manutenção de memória...")
    completed_tasks = get_completed_tasks()

    if completed_tasks:
        for task in completed_tasks:
            lesson = extract_lessons(task)
            update_lessons_log(lesson)
    else:
        print("Nenhuma tarefa concluída para extrair lições.")

    update_memory_md_if_needed()
    print("Manutenção de memória concluída.")

if __name__ == "__main__":
    main()
