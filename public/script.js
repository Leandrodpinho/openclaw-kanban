document.addEventListener('DOMContentLoaded', () => {
  loadTasks();
});

const API_URL = '/api/tasks';

// Mapeamento de status para IDs do DOM
const STATUS_MAP = {
  'todo': 'todo',
  'inprogress': 'inprogress',
  'done': 'done',
  'canceled': 'canceled'
};

async function loadTasks() {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();
    renderTasks(data.tasks);
  } catch (err) {
    console.error("Erro ao carregar tarefas:", err);
  }
}

function renderTasks(tasks) {
  // Limpar colunas
  const columns = {
    todo: document.querySelector('#todo .task-list'),
    inprogress: document.querySelector('#inprogress .task-list'),
    done: document.querySelector('#done .task-list'),
    canceled: document.querySelector('#canceled .task-list')
  };
  
  // Limpar contadores
  const counts = { todo: 0, inprogress: 0, done: 0, canceled: 0 };
  
  for (let key in columns) {
    if (columns[key]) columns[key].innerHTML = '';
  }

  tasks.forEach(task => {
    // Garantir que status "pending" vire "todo" para compatibilidade
    let status = task.status === 'pending' ? 'todo' : task.status;
    if (!columns[status]) status = 'todo'; // Fallback

    const taskCard = createTaskCard(task);
    columns[status].appendChild(taskCard);
    counts[status]++;
  });
  
  // Atualizar badges
  for (let key in counts) {
    const badge = document.getElementById(`count-${key}`);
    if (badge) badge.innerText = counts[key];
  }
}

function createTaskCard(task) {
  const card = document.createElement('div');
  card.className = 'task';
  card.id = `task-${task.id}`;
  
  // Data formatada
  const date = new Date(task.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  
  // Botões de ação baseados no status atual
  let actionsHtml = '';
  
  if (task.status === 'todo' || task.status === 'pending') {
    actionsHtml = `
      <button class="action-btn btn-start" onclick="updateStatus('${task.id}', 'inprogress')">▶ Iniciar</button>
      <button class="action-btn btn-cancel" onclick="updateStatus('${task.id}', 'canceled')">✕ Cancelar</button>
    `;
  } else if (task.status === 'inprogress') {
    actionsHtml = `
      <button class="action-btn btn-finish" onclick="updateStatus('${task.id}', 'done')">✔ Concluir</button>
      <button class="action-btn btn-cancel" onclick="updateStatus('${task.id}', 'canceled')">✕ Cancelar</button>
    `;
  } else if (task.status === 'done') {
    actionsHtml = `
      <button class="action-btn btn-cancel" onclick="updateStatus('${task.id}', 'todo')">↺ Reabrir</button>
    `;
  } else if (task.status === 'canceled') {
    actionsHtml = `
      <button class="action-btn btn-start" onclick="updateStatus('${task.id}', 'todo')">↺ Reativar</button>
    `;
  }

  card.innerHTML = `
    <p>${task.title}</p>
    <div class="task-meta">
      <span>📅 ${date}</span>
      <button class="action-btn btn-delete" onclick="deleteTask('${task.id}')" title="Excluir Permanentemente">🗑</button>
    </div>
    <div class="actions">
      ${actionsHtml}
    </div>
  `;
  
  return card;
}

async function createTask() {
  const input = document.getElementById('newTaskInput');
  const title = input.value.trim();
  
  if (!title) return alert("Por favor, digite um título para a tarefa.");

  try {
    await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }) // Backend define status inicial como 'pending' (que tratamos como todo)
    });
    
    input.value = '';
    loadTasks();
  } catch (err) {
    alert("Erro ao criar tarefa.");
  }
}

async function updateStatus(id, newStatus) {
  try {
    await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    loadTasks();
  } catch (err) {
    alert("Erro ao atualizar status.");
  }
}

async function deleteTask(id) {
  if (!confirm("Tem certeza que deseja excluir esta tarefa permanentemente?")) return;
  
  try {
    await fetch(`${API_URL}/${id}`, {
      method: 'DELETE'
    });
    loadTasks();
  } catch (err) {
    alert("Erro ao excluir tarefa.");
  }
}

function handleEnter(e) {
  if (e.key === 'Enter') createTask();
}
