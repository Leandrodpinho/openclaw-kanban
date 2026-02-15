const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// ─── SQLite Database Setup ─────────────────────────────
const DB_PATH = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Erro ao abrir banco de dados:', err.message);
    process.exit(1);
  }
  console.log(`SQLite conectado: ${DB_PATH}`);
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      status TEXT NOT NULL DEFAULT 'todo',
      priority TEXT DEFAULT 'medium',
      category TEXT DEFAULT '',
      due_date TEXT,
      position INTEGER DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS subtasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      completed INTEGER DEFAULT 0,
      position INTEGER DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS activity_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
      action TEXT NOT NULL,
      old_value TEXT,
      new_value TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  // Migration: add columns if they don't exist (SQLite doesn't have IF NOT EXISTS for ALTER)
  const cols = ['description', 'priority', 'category', 'due_date', 'position', 'updated_at'];
  db.all("PRAGMA table_info(tasks)", (err, rows) => {
    if (err) return;
    const existingCols = rows.map(r => r.name);
    if (!existingCols.includes('description')) db.run("ALTER TABLE tasks ADD COLUMN description TEXT DEFAULT ''");
    if (!existingCols.includes('priority')) db.run("ALTER TABLE tasks ADD COLUMN priority TEXT DEFAULT 'medium'");
    if (!existingCols.includes('category')) db.run("ALTER TABLE tasks ADD COLUMN category TEXT DEFAULT ''");
    if (!existingCols.includes('due_date')) db.run("ALTER TABLE tasks ADD COLUMN due_date TEXT");
    if (!existingCols.includes('position')) db.run("ALTER TABLE tasks ADD COLUMN position INTEGER DEFAULT 0");
    if (!existingCols.includes('updated_at')) db.run("ALTER TABLE tasks ADD COLUMN updated_at TEXT DEFAULT (datetime('now'))");
  });
});

// ─── Helper: run db as promise ─────────────────────────
function dbAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => err ? reject(err) : resolve(rows));
  });
}

function dbRun(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      err ? reject(err) : resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function dbGet(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => err ? reject(err) : resolve(row));
  });
}

// ─── Helper: log activity ─────────────────────────────
async function logActivity(taskId, action, oldValue, newValue) {
  try {
    await dbRun(
      'INSERT INTO activity_log (task_id, action, old_value, new_value) VALUES (?, ?, ?, ?)',
      [taskId, action, oldValue || null, newValue || null]
    );
  } catch (err) {
    console.error('Activity log error:', err.message);
  }
}

// ─── API Routes ────────────────────────────────────────

// GET all tasks with subtasks
app.get('/api/tasks', async (req, res) => {
  try {
    const { search, priority, category, status: filterStatus } = req.query;

    let sql = 'SELECT * FROM tasks WHERE 1=1';
    const params = [];

    if (search) {
      sql += ' AND (title LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (priority) {
      sql += ' AND priority = ?';
      params.push(priority);
    }
    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }
    if (filterStatus) {
      sql += ' AND status = ?';
      params.push(filterStatus);
    }

    sql += ' ORDER BY position ASC, created_at DESC';

    const tasks = await dbAll(sql, params);

    // Attach subtasks
    for (const task of tasks) {
      task.subtasks = await dbAll(
        'SELECT * FROM subtasks WHERE task_id = ? ORDER BY position ASC',
        [task.id]
      );
      // Convert SQLite boolean
      task.subtasks.forEach(st => { st.completed = !!st.completed; });
    }

    res.json({ tasks });
  } catch (err) {
    console.error('Erro ao buscar tarefas:', err.message);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// CREATE a task
app.post('/api/tasks', async (req, res) => {
  const { title, description, priority, category, due_date } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  try {
    const result = await dbRun(
      'INSERT INTO tasks (title, description, status, priority, category, due_date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [title, description || '', 'todo', priority || 'medium', category || '', due_date || null, new Date().toISOString(), new Date().toISOString()]
    );
    const task = await dbGet('SELECT * FROM tasks WHERE id = ?', [result.lastID]);
    task.subtasks = [];
    await logActivity(task.id, 'created', null, title);
    res.json(task);
  } catch (err) {
    console.error('Erro ao criar tarefa:', err.message);
    res.status(500).json({ error: 'Failed to save task' });
  }
});

// UPDATE task
app.put('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description, status, priority, category, due_date, position } = req.body;

  const validStatuses = ['todo', 'inprogress', 'done', 'canceled'];
  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
  }

  try {
    const current = await dbGet('SELECT * FROM tasks WHERE id = ?', [id]);
    if (!current) return res.status(404).json({ error: 'Task not found' });

    const fields = [];
    const params = [];

    if (title !== undefined) { fields.push('title = ?'); params.push(title); }
    if (description !== undefined) { fields.push('description = ?'); params.push(description); }
    if (status !== undefined) { fields.push('status = ?'); params.push(status); }
    if (priority !== undefined) { fields.push('priority = ?'); params.push(priority); }
    if (category !== undefined) { fields.push('category = ?'); params.push(category); }
    if (due_date !== undefined) { fields.push('due_date = ?'); params.push(due_date); }
    if (position !== undefined) { fields.push('position = ?'); params.push(position); }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    fields.push('updated_at = ?');
    params.push(new Date().toISOString());
    params.push(id);

    await dbRun(`UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`, params);

    const task = await dbGet('SELECT * FROM tasks WHERE id = ?', [id]);
    task.subtasks = await dbAll('SELECT * FROM subtasks WHERE task_id = ? ORDER BY position ASC', [id]);
    task.subtasks.forEach(st => { st.completed = !!st.completed; });

    // Log changes
    const updateData = { title, description, status, priority, category, due_date, position };
    for (const [key, val] of Object.entries(updateData)) {
      if (val !== undefined && current[key] !== val) {
        await logActivity(id, `updated_${key}`, String(current[key] ?? ''), String(val ?? ''));
      }
    }

    res.json({ message: 'Task updated', task });
  } catch (err) {
    console.error('Erro ao atualizar tarefa:', err.message);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// REORDER tasks
app.put('/api/tasks/reorder', async (req, res) => {
  const { updates } = req.body;

  if (!updates || !Array.isArray(updates)) {
    return res.status(400).json({ error: 'updates array is required' });
  }

  try {
    for (const item of updates) {
      const fields = ['position = ?'];
      const params = [item.position];
      if (item.status) { fields.push('status = ?'); params.push(item.status); }
      fields.push('updated_at = ?');
      params.push(new Date().toISOString());
      params.push(item.id);
      await dbRun(`UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`, params);
    }
    res.json({ message: 'Reorder successful' });
  } catch (err) {
    console.error('Erro ao reordenar:', err.message);
    res.status(500).json({ error: 'Failed to reorder tasks' });
  }
});

// DELETE task
app.delete('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Delete subtasks and activity first (for SQLite without ON DELETE CASCADE support)
    await dbRun('DELETE FROM subtasks WHERE task_id = ?', [id]);
    await dbRun('DELETE FROM activity_log WHERE task_id = ?', [id]);
    const result = await dbRun('DELETE FROM tasks WHERE id = ?', [id]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ message: 'Task deleted', id });
  } catch (err) {
    console.error('Erro ao excluir tarefa:', err.message);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// ─── SUBTASKS ─────────────────────────────────────────
app.post('/api/tasks/:id/subtasks', async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;

  if (!title) return res.status(400).json({ error: 'Title is required' });

  try {
    const result = await dbRun(
      'INSERT INTO subtasks (task_id, title) VALUES (?, ?)',
      [id, title]
    );
    const subtask = await dbGet('SELECT * FROM subtasks WHERE id = ?', [result.lastID]);
    subtask.completed = !!subtask.completed;
    await logActivity(id, 'subtask_added', null, title);
    res.json(subtask);
  } catch (err) {
    console.error('Erro ao criar subtarefa:', err.message);
    res.status(500).json({ error: 'Failed to create subtask' });
  }
});

app.put('/api/tasks/:id/subtasks/:sid', async (req, res) => {
  const { sid } = req.params;
  const { title, completed } = req.body;

  const fields = [];
  const params = [];
  if (title !== undefined) { fields.push('title = ?'); params.push(title); }
  if (completed !== undefined) { fields.push('completed = ?'); params.push(completed ? 1 : 0); }

  if (fields.length === 0) return res.status(400).json({ error: 'No fields to update' });

  params.push(sid);

  try {
    await dbRun(`UPDATE subtasks SET ${fields.join(', ')} WHERE id = ?`, params);
    const subtask = await dbGet('SELECT * FROM subtasks WHERE id = ?', [sid]);
    subtask.completed = !!subtask.completed;
    res.json(subtask);
  } catch (err) {
    console.error('Erro ao atualizar subtarefa:', err.message);
    res.status(500).json({ error: 'Failed to update subtask' });
  }
});

app.delete('/api/tasks/:id/subtasks/:sid', async (req, res) => {
  const { sid } = req.params;

  try {
    await dbRun('DELETE FROM subtasks WHERE id = ?', [sid]);
    res.json({ message: 'Subtask deleted' });
  } catch (err) {
    console.error('Erro ao excluir subtarefa:', err.message);
    res.status(500).json({ error: 'Failed to delete subtask' });
  }
});

// ─── ACTIVITY LOG ─────────────────────────────────────
app.get('/api/tasks/:id/activity', async (req, res) => {
  const { id } = req.params;

  try {
    const activity = await dbAll(
      'SELECT * FROM activity_log WHERE task_id = ? ORDER BY created_at DESC LIMIT 50',
      [id]
    );
    res.json({ activity });
  } catch (err) {
    console.error('Erro ao buscar atividade:', err.message);
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
});

// ─── Fallback: serve index.html for SPA ────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ─── Start ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 OpenClaw Kanban running at http://localhost:${PORT}`);
});
