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

// Database Setup
const db = new sqlite3.Database(':memory:'); // Using in-memory for demo; switch to file for persistence

db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS tasks (id TEXT PRIMARY KEY, title TEXT, status TEXT, created_at TEXT)");
});

// Helper for generating IDs
function generateId() {
    return Math.random().toString(36).substring(2, 10);
}

// API Routes

// GET all tasks
app.get('/api/tasks', (req, res) => {
  db.all("SELECT * FROM tasks", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ tasks: rows });
  });
});

// CREATE a task
app.post('/api/tasks', (req, res) => {
  const { title } = req.body;
  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }
  
  const id = generateId();
  const status = 'pending';
  const created_at = new Date().toISOString();

  db.run(`INSERT INTO tasks (id, title, status, created_at) VALUES (?, ?, ?, ?)`, 
    [id, title, status, created_at], 
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ id, title, status, created_at });
    }
  );
});

// UPDATE task status
app.put('/api/tasks/:id', (req, res) => {
  const { status } = req.body;
  const { id } = req.params;
  
  if (!status) {
    return res.status(400).json({ error: "Status is required" });
  }

  db.run(`UPDATE tasks SET status = ? WHERE id = ?`, [status, id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.json({ message: "Task updated", id, status });
  });
});

// DELETE task
app.delete('/api/tasks/:id', (req, res) => {
    const { id } = req.params;
    db.run(`DELETE FROM tasks WHERE id = ?`, [id], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: "Task deleted", id });
    });
});


app.listen(PORT, () => {
  console.log(`OpenClaw Kanban running at http://localhost:${PORT}`);
});
