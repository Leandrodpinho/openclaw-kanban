// ─── Config ────────────────────────────────────────────
const API_URL = window.location.origin + '/api/tasks';
let allTasks = [];
let currentEditId = null;

// ─── Category & Priority Definitions ───────────────────
const CATEGORIES = {
  rapel: { emoji: '🏢', label: 'Rapel', cssClass: 'tag-cat-rapel' },
  estudo: { emoji: '📖', label: 'Estudo', cssClass: 'tag-cat-estudo' },
  devocional: { emoji: '✝️', label: 'Devocional', cssClass: 'tag-cat-devocional' },
  lazer: { emoji: '⚽', label: 'Lazer', cssClass: 'tag-cat-lazer' },
  seguranca: { emoji: '🔒', label: 'Segurança', cssClass: 'tag-cat-seguranca' },
};

const PRIORITIES = {
  high: { emoji: '🔴', label: 'Alta' },
  medium: { emoji: '🟡', label: 'Média' },
  low: { emoji: '🟢', label: 'Baixa' },
};

const ACTIONS_MAP = {
  created: 'Tarefa criada',
  updated_title: 'Título alterado',
  updated_description: 'Descrição alterada',
  updated_status: 'Status alterado',
  updated_priority: 'Prioridade alterada',
  updated_category: 'Categoria alterada',
  updated_due_date: 'Prazo alterado',
  subtask_added: 'Subtarefa adicionada',
};

// ─── Theme ─────────────────────────────────────────────
function initTheme() {
  const saved = localStorage.getItem('kanban-theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
  updateThemeButton(saved);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('kanban-theme', next);
  updateThemeButton(next);
}

function updateThemeButton(theme) {
  document.getElementById('themeIcon').textContent = theme === 'dark' ? '☀️' : '🌙';
  document.getElementById('themeLabel').textContent = theme === 'dark' ? 'Light' : 'Dark';
}

// ─── Toast ─────────────────────────────────────────────
function showToast(message) {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ─── Load Tasks ────────────────────────────────────────
async function loadTasks() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const { tasks } = await response.json();
    allTasks = tasks;
    renderTasks(tasks);
  } catch (err) {
    console.error('Erro ao carregar tarefas:', err);
    showToast('Erro ao carregar tarefas');
  }
}

// ─── Render Tasks ──────────────────────────────────────
function renderTasks(tasks) {
  document.querySelectorAll('.task-list').forEach(col => col.innerHTML = '');
  const counts = { todo: 0, inprogress: 0, done: 0, canceled: 0 };

  tasks.forEach(task => {
    const status = task.status || 'todo';
    const column = document.querySelector(`[data-status="${status}"]`);
    if (!column) return;
    counts[status]++;
    column.appendChild(createCard(task));
  });

  // Empty states
  document.querySelectorAll('.task-list').forEach(col => {
    if (col.children.length === 0) {
      col.innerHTML = `<div class="empty-state"><div class="empty-icon">📭</div>Nenhuma tarefa</div>`;
    }
  });

  Object.entries(counts).forEach(([key, val]) => {
    const badge = document.getElementById(`count-${key}`);
    if (badge) badge.textContent = val;
  });
}

// ─── Create Card ───────────────────────────────────────
function createCard(task) {
  const card = document.createElement('div');
  card.className = `task-card priority-${task.priority || 'medium'}`;
  card.dataset.id = task.id;
  card.draggable = true;

  // Drag events
  card.addEventListener('dragstart', handleDragStart);
  card.addEventListener('dragend', handleDragEnd);

  // Tags
  let tagsHtml = '';
  const p = task.priority || 'medium';
  tagsHtml += `<span class="tag tag-priority-${p}">${PRIORITIES[p]?.emoji || ''} ${PRIORITIES[p]?.label || p}</span>`;
  if (task.category && CATEGORIES[task.category]) {
    const cat = CATEGORIES[task.category];
    tagsHtml += `<span class="tag ${cat.cssClass}">${cat.emoji} ${cat.label}</span>`;
  }

  // Due date
  let dueHtml = '';
  if (task.due_date) {
    const due = new Date(task.due_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const threeDays = new Date(today);
    threeDays.setDate(threeDays.getDate() + 3);

    let dueClass = 'due-normal';
    let dueIcon = '📅';
    if (due < today) { dueClass = 'due-overdue'; dueIcon = '⚠️'; }
    else if (due < tomorrow) { dueClass = 'due-today'; dueIcon = '⏰'; }
    else if (due < threeDays) { dueClass = 'due-soon'; dueIcon = '📅'; }

    dueHtml = `<span class="card-due ${dueClass}">${dueIcon} ${formatDate(task.due_date)}</span>`;
  }

  // Subtask progress
  let subtaskHtml = '';
  if (task.subtasks && task.subtasks.length > 0) {
    const done = task.subtasks.filter(s => s.completed).length;
    const total = task.subtasks.length;
    const pct = Math.round((done / total) * 100);
    subtaskHtml = `
      <div class="card-subtask-progress">
        <span>☑ ${done}/${total}</span>
        <div class="subtask-bar"><div class="subtask-bar-fill" style="width:${pct}%"></div></div>
      </div>`;
  }

  card.innerHTML = `
    <div class="card-top">
      <span class="card-title" onclick="openModal('${task.id}')">${escapeHtml(task.title)}</span>
      <button class="card-delete" onclick="event.stopPropagation();deleteTask('${task.id}')" title="Excluir">🗑</button>
    </div>
    <div class="card-tags">${tagsHtml} ${dueHtml}</div>
    ${subtaskHtml}
    <div class="card-meta">
      <span>${formatDate(task.created_at)}</span>
      ${task.description ? '<span title="Tem descrição">📝</span>' : ''}
    </div>
    <div class="card-actions">${renderActions(task.id, task.status)}</div>
  `;

  return card;
}

// ─── Render Action Buttons ─────────────────────────────
function renderActions(id, status) {
  const btns = [];
  if (status === 'todo') {
    btns.push(`<button class="action-btn btn-start" onclick="event.stopPropagation();updateStatus('${id}','inprogress')">▶ Iniciar</button>`);
    btns.push(`<button class="action-btn btn-cancel" onclick="event.stopPropagation();updateStatus('${id}','canceled')">✕ Cancelar</button>`);
  }
  if (status === 'inprogress') {
    btns.push(`<button class="action-btn btn-finish" onclick="event.stopPropagation();updateStatus('${id}','done')">✓ Concluir</button>`);
    btns.push(`<button class="action-btn btn-cancel" onclick="event.stopPropagation();updateStatus('${id}','canceled')">✕ Cancelar</button>`);
  }
  if (status === 'done' || status === 'canceled') {
    btns.push(`<button class="action-btn btn-reopen" onclick="event.stopPropagation();updateStatus('${id}','todo')">↩ Reabrir</button>`);
  }
  return btns.join('');
}

// ─── CRUD Operations ──────────────────────────────────
async function createTask() {
  const input = document.getElementById('newTaskInput');
  const title = input.value.trim();
  if (!title) return showToast('Digite um título para a tarefa');

  const priority = document.getElementById('newPriority').value;
  const category = document.getElementById('newCategory').value;
  const due_date = document.getElementById('newDueDate').value || null;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ title, priority, category, due_date })
    });
    if (!response.ok) throw new Error((await response.json().catch(() => ({}))).error || `HTTP ${response.status}`);

    input.value = '';
    document.getElementById('newDueDate').value = '';
    showToast('✅ Tarefa criada!');
    loadTasks();
  } catch (err) {
    console.error('Erro ao criar tarefa:', err);
    showToast(`Erro: ${err.message}`);
  }
}

async function updateStatus(id, newStatus) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ status: newStatus })
    });
    if (!response.ok) throw new Error((await response.json().catch(() => ({}))).error || `HTTP ${response.status}`);

    const labels = { todo: 'A Fazer', inprogress: 'Em Andamento', done: 'Feito', canceled: 'Cancelado' };
    showToast(`Movida para ${labels[newStatus]}`);
    loadTasks();
  } catch (err) {
    console.error('Erro ao atualizar:', err);
    showToast(`Erro: ${err.message}`);
  }
}

async function deleteTask(id) {
  if (!confirm('Excluir esta tarefa permanentemente?')) return;
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: authHeaders()
    });
    if (!response.ok) throw new Error((await response.json().catch(() => ({}))).error || `HTTP ${response.status}`);
    showToast('🗑 Tarefa excluída');
    loadTasks();
  } catch (err) {
    console.error('Erro ao excluir:', err);
    showToast(`Erro: ${err.message}`);
  }
}

// ─── Search & Filter ───────────────────────────────────
let filterTimeout;
function debouncedFilter() {
  clearTimeout(filterTimeout);
  filterTimeout = setTimeout(applyFilters, 300);
}

function applyFilters() {
  const search = document.getElementById('searchInput').value.toLowerCase().trim();
  const priority = document.getElementById('filterPriority').value;
  const category = document.getElementById('filterCategory').value;

  let filtered = allTasks;

  if (search) {
    filtered = filtered.filter(t =>
      t.title.toLowerCase().includes(search) ||
      (t.description || '').toLowerCase().includes(search)
    );
  }
  if (priority) {
    filtered = filtered.filter(t => t.priority === priority);
  }
  if (category) {
    filtered = filtered.filter(t => t.category === category);
  }

  renderTasks(filtered);
}

function clearFilters() {
  document.getElementById('searchInput').value = '';
  document.getElementById('filterPriority').value = '';
  document.getElementById('filterCategory').value = '';
  renderTasks(allTasks);
}

// ─── Drag & Drop ───────────────────────────────────────
let draggedCard = null;

function handleDragStart(e) {
  draggedCard = this;
  this.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', this.dataset.id);
}

function handleDragEnd() {
  this.classList.remove('dragging');
  document.querySelectorAll('.task-list').forEach(col => col.classList.remove('drag-over'));
  draggedCard = null;
}

// Setup drop zones
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.task-list').forEach(col => {
    col.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      col.classList.add('drag-over');
    });

    col.addEventListener('dragleave', () => {
      col.classList.remove('drag-over');
    });

    col.addEventListener('drop', async (e) => {
      e.preventDefault();
      col.classList.remove('drag-over');

      const taskId = e.dataTransfer.getData('text/plain');
      const newStatus = col.dataset.status;

      if (!taskId || !newStatus) return;

      // Find the task and check if status actually changed
      const task = allTasks.find(t => String(t.id) === String(taskId));
      if (task && task.status === newStatus) return;

      await updateStatus(taskId, newStatus);
    });
  });
});

// ─── Modal ─────────────────────────────────────────────
async function openModal(id) {
  currentEditId = id;
  const task = allTasks.find(t => String(t.id) === String(id));
  if (!task) return;

  document.getElementById('editId').value = id;
  document.getElementById('editTitle').value = task.title;
  document.getElementById('editDescription').value = task.description || '';
  document.getElementById('editPriority').value = task.priority || 'medium';
  document.getElementById('editCategory').value = task.category || '';
  document.getElementById('editDueDate').value = task.due_date ? task.due_date.split('T')[0] : '';
  document.getElementById('editStatus').value = task.status || 'todo';

  // Render subtasks
  renderSubtasks(task.subtasks || []);

  // Load activity
  loadActivity(id);

  document.getElementById('editModal').classList.add('active');
}

function closeModal() {
  document.getElementById('editModal').classList.remove('active');
  currentEditId = null;
}

// Close modal on overlay click
document.addEventListener('click', (e) => {
  if (e.target.id === 'editModal') closeModal();
});

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

async function saveTask() {
  const id = document.getElementById('editId').value;
  const data = {
    title: document.getElementById('editTitle').value.trim(),
    description: document.getElementById('editDescription').value.trim(),
    priority: document.getElementById('editPriority').value,
    category: document.getElementById('editCategory').value,
    due_date: document.getElementById('editDueDate').value || null,
    status: document.getElementById('editStatus').value,
  };

  if (!data.title) return showToast('Título é obrigatório');

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error((await response.json().catch(() => ({}))).error || `HTTP ${response.status}`);

    showToast('✅ Tarefa atualizada!');
    closeModal();
    loadTasks();
  } catch (err) {
    console.error('Erro ao salvar:', err);
    showToast(`Erro: ${err.message}`);
  }
}

// ─── Subtasks ──────────────────────────────────────────
function renderSubtasks(subtasks) {
  const container = document.getElementById('subtaskList');
  container.innerHTML = '';

  subtasks.forEach(st => {
    const item = document.createElement('div');
    item.className = 'subtask-item';
    item.innerHTML = `
      <input type="checkbox" ${st.completed ? 'checked' : ''} onchange="toggleSubtask('${st.id}', this.checked)">
      <span class="subtask-text ${st.completed ? 'completed' : ''}">${escapeHtml(st.title)}</span>
      <button class="subtask-delete" onclick="deleteSubtask('${st.id}')">✕</button>
    `;
    container.appendChild(item);
  });
}

async function addSubtask() {
  const input = document.getElementById('newSubtaskInput');
  const title = input.value.trim();
  if (!title || !currentEditId) return;

  try {
    const response = await fetch(`${API_URL}/${currentEditId}/subtasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ title })
    });
    if (!response.ok) throw new Error('Failed to add subtask');

    input.value = '';
    // Refresh task data
    const taskResponse = await fetch(API_URL);
    const { tasks } = await taskResponse.json();
    allTasks = tasks;
    const task = tasks.find(t => String(t.id) === String(currentEditId));
    if (task) renderSubtasks(task.subtasks || []);
    renderTasks(tasks);
  } catch (err) {
    console.error('Erro ao adicionar subtarefa:', err);
    showToast('Erro ao adicionar subtarefa');
  }
}

async function toggleSubtask(subtaskId, completed) {
  try {
    await fetch(`${API_URL}/${currentEditId}/subtasks/${subtaskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ completed })
    });
    // Refresh
    const taskResponse = await fetch(API_URL);
    const { tasks } = await taskResponse.json();
    allTasks = tasks;
    const task = tasks.find(t => String(t.id) === String(currentEditId));
    if (task) renderSubtasks(task.subtasks || []);
    renderTasks(tasks);
  } catch (err) {
    console.error('Erro ao atualizar subtarefa:', err);
  }
}

async function deleteSubtask(subtaskId) {
  try {
    await fetch(`${API_URL}/${currentEditId}/subtasks/${subtaskId}`, {
      method: 'DELETE',
      headers: authHeaders()
    });
    const taskResponse = await fetch(API_URL);
    const { tasks } = await taskResponse.json();
    allTasks = tasks;
    const task = tasks.find(t => String(t.id) === String(currentEditId));
    if (task) renderSubtasks(task.subtasks || []);
    renderTasks(tasks);
  } catch (err) {
    console.error('Erro ao excluir subtarefa:', err);
  }
}

// ─── Activity Log ──────────────────────────────────────
async function loadActivity(taskId) {
  const container = document.getElementById('activityList');
  container.innerHTML = '<div class="activity-item" style="color:var(--text-muted)">Carregando...</div>';

  try {
    const response = await fetch(`${API_URL}/${taskId}/activity`);
    const { activity } = await response.json();

    if (!activity || activity.length === 0) {
      container.innerHTML = '<div class="activity-item" style="color:var(--text-muted)">Sem atividade registrada</div>';
      return;
    }

    container.innerHTML = '';
    activity.forEach(item => {
      const div = document.createElement('div');
      div.className = 'activity-item';
      const actionLabel = ACTIONS_MAP[item.action] || item.action;
      let detail = '';
      if (item.old_value && item.new_value) {
        detail = `${item.old_value} → ${item.new_value}`;
      } else if (item.new_value) {
        detail = item.new_value;
      }
      div.innerHTML = `
        <span>${actionLabel}${detail ? ': ' + escapeHtml(detail) : ''}</span>
        <span>${formatDateTime(item.created_at)}</span>
      `;
      container.appendChild(div);
    });
  } catch (err) {
    container.innerHTML = '<div class="activity-item" style="color:var(--text-muted)">Erro ao carregar</div>';
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
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

function formatDateTime(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

// ─── Init ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  loadTasks();
});
