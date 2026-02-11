const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();

app.use(cors());
app.use(bodyParser.json());

// Supabase Configuration
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("Missing SUPABASE_URL or SUPABASE_KEY environment variables");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Middleware for authorization (optional extra layer, Supabase has RLS)
app.use((req, res, next) => {
    // Skip auth for static files (public) and OPTIONS requests (CORS)
    if (req.method === 'GET' || req.method === 'OPTIONS') {
        return next();
    }

    const expectedSecret = process.env.KANBAN_SECRET;

    // If no secret configured, allow access (open mode)
    if (!expectedSecret) {
        return next();
    }

    const authHeader = req.headers['authorization'];
    
    // Check for Bearer token match
    if (!authHeader || authHeader !== `Bearer ${expectedSecret}`) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    next();
});

// API Routes

// GET all tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json({ tasks: data });
  } catch (error) {
    console.error("Supabase Error:", error);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

// CREATE a task
app.post('/api/tasks', async (req, res) => {
  const { title } = req.body;
  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }
  
  const newTask = {
      title,
      status: 'todo'
  };

  try {
    const { data, error } = await supabase
        .from('tasks')
        .insert([newTask])
        .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    console.error("Supabase Error:", error);
    res.status(500).json({ error: "Failed to save task" });
  }
});

// UPDATE task status
app.put('/api/tasks/:id', async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;
  
  if (!status) {
    return res.status(400).json({ error: "Status is required" });
  }

  try {
    const { data, error } = await supabase
        .from('tasks')
        .update({ status })
        .eq('id', id)
        .select();

    if (error) throw error;
    
    if (data.length === 0) {
        return res.status(404).json({ error: "Task not found" });
    }

    res.json({ message: "Task updated", task: data[0] });
  } catch (error) {
    console.error("Supabase Error:", error);
    res.status(500).json({ error: "Failed to update task" });
  }
});

// DELETE task
app.delete('/api/tasks/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const { error } = await supabase
            .from('tasks')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.json({ message: "Task deleted", id });
    } catch (error) {
        console.error("Supabase Error:", error);
        res.status(500).json({ error: "Failed to delete task" });
    }
});

module.exports = app;
