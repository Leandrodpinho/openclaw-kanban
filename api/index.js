const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { kv } = require('@vercel/kv'); // Redis client from Vercel

const app = express();

app.use(cors());
app.use(bodyParser.json());

// Middleware for authorization
app.use((req, res, next) => {
    // Skip auth for static files (public) and OPTIONS requests (CORS)
    if (req.method === 'GET' || req.method === 'OPTIONS') {
        return next();
    }

    const authHeader = req.headers['authorization'];
    const expectedSecret = process.env.KANBAN_SECRET;

    // If no secret configured, warn but allow (or deny if stricter policy desired)
    if (!expectedSecret) {
        console.warn("WARNING: KANBAN_SECRET not set. API is open.");
        return next();
    }

    if (!authHeader || authHeader !== `Bearer ${expectedSecret}`) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    next();
});

// Helper for generating IDs
function generateId() {
    return Math.random().toString(36).substring(2, 10);
}

// API Routes

// GET all tasks (Fetch from Redis)
app.get('/api/tasks', async (req, res) => {
  try {
    // Scan for keys starting with 'task:'
    // Note: 'keys' is not recommended for production with millions of keys, but fine for a kanban.
    const keys = await kv.keys('task:*');
    
    if (keys.length === 0) {
      return res.json({ tasks: [] });
    }
    
    // Fetch values for all keys
    // mget requires arguments, not an array, but vercel/kv supports array if passed correctly or iterate.
    // Let's iterate for safety or use mget with spread if keys is small.
    // Safe approach: Promise.all
    const tasks = await Promise.all(keys.map(key => kv.get(key)));
    res.json({ tasks: tasks.filter(t => t) }); // Filter out nulls
  } catch (error) {
    console.error("Redis Error:", error);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

// CREATE a task (Save to Redis)
app.post('/api/tasks', async (req, res) => {
  const { title } = req.body;
  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }
  
  const id = generateId();
  const status = 'todo';
  const created_at = new Date().toISOString();
  
  const task = { id, title, status, created_at };

  try {
    await kv.set(`task:${id}`, task);
    res.json(task);
  } catch (error) {
    console.error("Redis Error:", error);
    res.status(500).json({ error: "Failed to save task" });
  }
});

// UPDATE task status (Update Redis)
app.put('/api/tasks/:id', async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;
  
  if (!status) {
    return res.status(400).json({ error: "Status is required" });
  }

  try {
    const task = await kv.get(`task:${id}`);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    task.status = status;
    await kv.set(`task:${id}`, task);
    
    res.json({ message: "Task updated", id, status });
  } catch (error) {
    console.error("Redis Error:", error);
    res.status(500).json({ error: "Failed to update task" });
  }
});

// DELETE task (Remove from Redis)
app.delete('/api/tasks/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const deleted = await kv.del(`task:${id}`);
        if (deleted === 0) {
            return res.status(404).json({ error: "Task not found" });
        }
        res.json({ message: "Task deleted", id });
    } catch (error) {
        console.error("Redis Error:", error);
        res.status(500).json({ error: "Failed to delete task" });
    }
});

module.exports = app;