import requests
import json
import sys

# Configuration matches the user's Vercel settings (including typos/secrets)
BASE_URL = "https://openclaw-kanban-sable.vercel.app/api/tasks"
SECRET = "LeoKanbanSecret2026"  # As seen in screenshot
HEADERS = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {SECRET}"
}

def log(msg, type="INFO"):
    print(f"[{type}] {msg}")

def run_simulation():
    log(f"Starting simulation against {BASE_URL}...")

    # 1. CREATE
    log("1. Creating Task \'Simulacao Gemini\'...")
    payload = {
        "title": "Simulacao Gemini Pro",
        "description": "Teste automatizado de validacao",
        "priority": "high",
        "category": "seguranca"
    }
    
    try:
        resp = requests.post(BASE_URL, json=payload, headers=HEADERS)
        if resp.status_code != 200:
            log(f"FAILED to create: {resp.status_code} - {resp.text}", "ERROR")
            return
        
        task = resp.json()
        task_id = task.get("id")
        log(f"SUCCESS: Task created with ID {task_id}")
        
    except Exception as e:
        log(f"EXCEPTION during create: {e}", "CRITICAL")
        return

    # 2. READ
    log("2. Verifying Task in list...")
    resp = requests.get(BASE_URL, headers=HEADERS)
    tasks = resp.json().get("tasks", [])
    found = any(t["id"] == task_id for t in tasks)
    
    if found:
        log("SUCCESS: Task found in list")
    else:
        log("FAILED: Task not found in list", "ERROR")

    # 3. UPDATE
    log(f"3. Moving Task {task_id} to \'Done\'...")
    update_payload = {"status": "done"}
    resp = requests.put(f"{BASE_URL}/{task_id}", json=update_payload, headers=HEADERS)
    if resp.status_code == 200:
        log("SUCCESS: Status updated to \'done\'")
    else:
        log(f"FAILED to update: {resp.text}", "ERROR")

    # 4. DELETE
    log(f"4. Cleaning up (Deleting Task {task_id})...")
    resp = requests.delete(f"{BASE_URL}/{task_id}", headers=HEADERS)
    if resp.status_code == 200:
        log("SUCCESS: Task deleted")
    else:
        log(f"FAILED to delete: {resp.text}", "ERROR")

    log("Simulation Complete. System is fully operational if all steps succeeded.")

if __name__ == "__main__":
    run_simulation()
