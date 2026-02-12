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
      status TEXT NOT NULL DEFAULT 'todo',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
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

// ─── API Routes ────────────────────────────────────────

// GET all tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await dbAll('SELECT * FROM tasks ORDER BY created_at DESC');
    res.json({ tasks });
  } catch (err) {
    console.error('Erro ao buscar tarefas:', err.message);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// CREATE a task
app.post('/api/tasks', async (req, res) => {
  const { title } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  try {
    const result = await dbRun(
      'INSERT INTO tasks (title, status, created_at) VALUES (?, ?, ?)',
      [title, 'todo', new Date().toISOString()]
    );
    const task = await dbAll('SELECT * FROM tasks WHERE id = ?', [result.lastID]);
    res.json(task[0]);
  } catch (err) {
    console.error('Erro ao criar tarefa:', err.message);
    res.status(500).json({ error: 'Failed to save task' });
  }
});

// UPDATE task status
app.put('/api/tasks/:id', async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;

  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  const validStatuses = ['todo', 'inprogress', 'done', 'canceled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
  }

  try {
    const result = await dbRun('UPDATE tasks SET status = ? WHERE id = ?', [status, id]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const task = await dbAll('SELECT * FROM tasks WHERE id = ?', [id]);
    res.json({ message: 'Task updated', task: task[0] });
  } catch (err) {
    console.error('Erro ao atualizar tarefa:', err.message);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// DELETE task
app.delete('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;

  try {
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

// ─── Fallback: serve index.html for SPA ────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ─── Start ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 OpenClaw Kanban running at http://localhost:${PORT}`);
});
