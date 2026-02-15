// =================================================
// Exemplo de integração OpenClaw → Kanban
// Mostra como criar e gerenciar tarefas via API
// =================================================

const KANBAN_URL = 'http://localhost:3000/api/tasks';

async function createTask(title) {
  try {
    const response = await fetch(KANBAN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title })
    });
    const data = await response.json();
    console.log('Tarefa criada:', data);
    return data.id;
  } catch (error) {
    console.error('Erro ao criar tarefa:', error.message);
  }
}

async function updateStatus(taskId, newStatus) {
  try {
    const response = await fetch(`${KANBAN_URL}/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    const data = await response.json();
    console.log('Status atualizado:', data);
  } catch (error) {
    console.error('Erro ao atualizar status:', error.message);
  }
}

// Exemplo de uso:
// (async () => {
//   const taskId = await createTask('Verificar logs do servidor');
//   await updateStatus(taskId, 'inprogress');
//   await updateStatus(taskId, 'done');
// })();
