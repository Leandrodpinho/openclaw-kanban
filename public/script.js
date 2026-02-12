// Base URL for the API — auto-detects local vs production
const API_URL = window.location.origin + '/api/tasks';

// ─── Load & Render Tasks ───────────────────────────────
async function loadTasks() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const { tasks } = await response.json();

    // Clear every column
    document.querySelectorAll('.task-list').forEach(col => col.innerHTML = '');

    // Reset counters
    const counts = { todo: 0, inprogress: 0, done: 0, canceled: 0 };

    tasks.forEach(task => {
      const status = task.status || 'todo';
      const column = document.querySelector(`#${status} .task-list`);
      if (!column) return; // unknown status — skip

      counts[status] = (counts[status] || 0) + 1;

      const card = document.createElement('div');
      card.className = 'task';
      card.innerHTML = `
        <p>${escapeHtml(task.title)}</p>
        <div class="task-meta">
          <span>${formatDate(task.created_at)}</span>
        </div>
        <div class="actions">
          ${renderActions(task.id, status)}
        </div>
      `;
      column.appendChild(card);
    });

    // Update badges
    Object.entries(counts).forEach(([key, val]) => {
      const badge = document.getElementById(`count-${key}`);
      if (badge) badge.textContent = val;
    });
  } catch (err) {
    console.error('Erro ao carregar tarefas:', err);
  }
}

// ─── Render action buttons based on current status ─────
function renderActions(id, status) {
  const buttons = [];

  if (status === 'todo') {
    buttons.push(`<button class="action-btn btn-start" onclick="updateStatus('${id}','inprogress')">▶ Iniciar</button>`);
    buttons.push(`<button class="action-btn btn-cancel" onclick="updateStatus('${id}','canceled')">✕ Cancelar</button>`);
  }
  if (status === 'inprogress') {
    buttons.push(`<button class="action-btn btn-finish" onclick="updateStatus('${id}','done')">✓ Concluir</button>`);
    buttons.push(`<button class="action-btn btn-cancel" onclick="updateStatus('${id}','canceled')">✕ Cancelar</button>`);
  }
  if (status === 'canceled' || status === 'done') {
    buttons.push(`<button class="action-btn btn-start" onclick="updateStatus('${id}','todo')">↩ Reabrir</button>`);
  }

  buttons.push(`<button class="action-btn btn-delete" onclick="deleteTask('${id}')">🗑</button>`);
  return buttons.join('');
}

// ─── Create Task ───────────────────────────────────────
async function createTask() {
  const input = document.getElementById('newTaskInput');
  const title = input.value.trim();

  if (!title) return alert('Por favor, digite um título para a tarefa.');

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders()
      },
      body: JSON.stringify({ title })
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.error || `HTTP ${response.status}`);
    }

    input.value = '';
    loadTasks();
  } catch (err) {
    console.error('Erro ao criar tarefa:', err);
    alert(`Erro ao criar tarefa: ${err.message}`);
  }
}

// ─── Update Task Status ────────────────────────────────
async function updateStatus(id, newStatus) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders()
      },
      body: JSON.stringify({ status: newStatus })
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.error || `HTTP ${response.status}`);
    }

    loadTasks();
  } catch (err) {
    console.error('Erro ao atualizar status:', err);
    alert(`Erro ao atualizar tarefa: ${err.message}`);
  }
}

// ─── Delete Task ───────────────────────────────────────
async function deleteTask(id) {
  if (!confirm('Tem certeza que deseja excluir esta tarefa permanentemente?')) return;

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: authHeaders()
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.error || `HTTP ${response.status}`);
    }

    loadTasks();
  } catch (err) {
    console.error('Erro ao excluir tarefa:', err);
    alert(`Erro ao excluir tarefa: ${err.message}`);
  }
}

// ─── Handle Enter key on input ─────────────────────────
function handleEnter(event) {
  if (event.key === 'Enter') {
    createTask();
  }
}

// ─── Helpers ───────────────────────────────────────────
function authHeaders() {
  const secret = localStorage.getItem('KANBAN_SECRET') || '';
  if (!secret) return {};
  return { 'Authorization': `Bearer ${secret}` };
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatDate(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ─── Initial load ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', loadTasks);
