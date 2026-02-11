async function createTask() {
  const input = document.getElementById('newTaskInput');
  const title = input.value.trim();
  
  if (!title) return alert("Por favor, digite um título para a tarefa.");

  try {
    const secret = localStorage.getItem('KANBAN_SECRET') || '';
    
    await fetch(API_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': secret ? `Bearer ${secret}` : '' 
      },
      body: JSON.stringify({ title })
    });
    
    input.value = '';
    loadTasks();
  } catch (err) {
    alert("Erro ao criar tarefa (Verifique o KANBAN_SECRET no localStorage).");
  }
}

async function updateStatus(id, newStatus) {
  try {
    const secret = localStorage.getItem('KANBAN_SECRET') || '';

    await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': secret ? `Bearer ${secret}` : ''
      },
      body: JSON.stringify({ status: newStatus })
    });
    loadTasks();
  } catch (err) {
    alert("Erro ao atualizar status (Verifique o KANBAN_SECRET).");
  }
}

async function deleteTask(id) {
  if (!confirm("Tem certeza que deseja excluir esta tarefa permanentemente?")) return;
  
  try {
    const secret = localStorage.getItem('KANBAN_SECRET') || '';

    await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: { 
        'Authorization': secret ? `Bearer ${secret}` : ''
      }
    });
    loadTasks();
  } catch (err) {
    alert("Erro ao excluir tarefa (Verifique o KANBAN_SECRET).");
  }
}
