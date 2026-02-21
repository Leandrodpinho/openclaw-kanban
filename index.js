const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();

app.use(cors());
app.use(bodyParser.json());

// ─── Supabase Configuration ───────────────────────────
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.URL_SUPABASE;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('⚠️  Missing SUPABASE_URL (or URL_SUPABASE) or SUPABASE_KEY environment variables.');
  console.error('   Set them in Vercel Dashboard → Settings → Environment Variables.');
}

const supabase = createClient(SUPABASE_URL || '', SUPABASE_KEY || '');

// ─── Auth Middleware (optional – Supabase has RLS) ─────
app.use((req, res, next) => {
  if (req.method === 'GET' || req.method === 'OPTIONS') return next();

  // Support both correct spelling (KANBAN) and common typo (KABAN)
  const expectedSecret = process.env.KANBAN_SECRET || process.env.KABAN_SECRET;
  if (!expectedSecret) return next(); // open mode

  const authHeader = req.headers['authorization'];
  if (!authHeader || authHeader !== `Bearer ${expectedSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});

// ─── Helper: log activity ─────────────────────────────
async function logActivity(taskId, action, oldValue, newValue) {
  try {
    await supabase.from('activity_log').insert([{
      task_id: taskId,
      action,
      old_value: oldValue || null,
      new_value: newValue || null
    }]);
  } catch (err) {
    console.error('Activity log error:', err);
  }
}

// ─── GET all tasks ─────────────────────────────────────
app.get('/api/tasks', async (req, res) => {
  try {
    const { search, priority, category, status: filterStatus } = req.query;

    let query = supabase
      .from('tasks')
      .select('*, subtasks(*)')
      .order('position', { ascending: true })
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }
    if (priority) {
      query = query.eq('priority', priority);
    }
    if (category) {
      query = query.eq('category', category);
    }
    if (filterStatus) {
      query = query.eq('status', filterStatus);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Sort subtasks by position
    data.forEach(task => {
      if (task.subtasks) {
        task.subtasks.sort((a, b) => a.position - b.position);
      }
    });

    res.json({ tasks: data });
  } catch (error) {
    console.error('Supabase Error:', error);
    res.status(500).json({
      error: 'Failed to fetch tasks',
      details: error.message,
      hint: error.hint,
      code: error.code
    });
  }
});

// ─── CREATE a task ─────────────────────────────────────
app.post('/api/tasks', async (req, res) => {
  const { title, description, priority, category, due_date } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  try {
    const insertData = {
      title,
      status: 'todo',
      description: description || '',
      priority: priority || 'medium',
      category: category || '',
      due_date: due_date || null
    };

    const { data, error } = await supabase
      .from('tasks')
      .insert([insertData])
      .select('*, subtasks(*)');

    if (error) throw error;
    await logActivity(data[0].id, 'created', null, title);
    res.json(data[0]);
  } catch (error) {
    console.error('Supabase Error:', error);
    res.status(500).json({
      error: 'Failed to save task',
      details: error.message,
      hint: error.hint,
      code: error.code
    });
  }
});

// ─── UPDATE task ──────────────────────────────────────
app.put('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description, status, priority, category, due_date, position } = req.body;

  const validStatuses = ['todo', 'inprogress', 'done', 'canceled'];
  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
  }

  const validPriorities = ['high', 'medium', 'low'];
  if (priority && !validPriorities.includes(priority)) {
    return res.status(400).json({ error: `Invalid priority. Must be one of: ${validPriorities.join(', ')}` });
  }

  try {
    // Get current task for activity logging
    const { data: current } = await supabase.from('tasks').select('*').eq('id', id).single();
    if (!current) return res.status(404).json({ error: 'Task not found' });

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (category !== undefined) updateData.category = category;
    if (due_date !== undefined) updateData.due_date = due_date;
    if (position !== undefined) updateData.position = position;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const { data, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', id)
      .select('*, subtasks(*)');

    if (error) throw error;
    if (data.length === 0) return res.status(404).json({ error: 'Task not found' });

    // Log changes
    for (const [key, val] of Object.entries(updateData)) {
      if (current[key] !== val) {
        await logActivity(id, `updated_${key}`, String(current[key] ?? ''), String(val ?? ''));
      }
    }

    res.json({ message: 'Task updated', task: data[0] });
  } catch (error) {
    console.error('Supabase Error:', error);
    res.status(500).json({
      error: 'Failed to update task',
      details: error.message,
      hint: error.hint,
      code: error.code
    });
  }
});

// ─── REORDER tasks ────────────────────────────────────
app.put('/api/tasks/reorder', async (req, res) => {
  const { updates } = req.body; // [{id, position, status?}]

  if (!updates || !Array.isArray(updates)) {
    return res.status(400).json({ error: 'updates array is required' });
  }

  try {
    for (const item of updates) {
      const updateData = { position: item.position };
      if (item.status) updateData.status = item.status;

      await supabase.from('tasks').update(updateData).eq('id', item.id);
    }
    res.json({ message: 'Reorder successful' });
  } catch (error) {
    console.error('Supabase Error:', error);
    res.status(500).json({ error: 'Failed to reorder tasks' });
  }
});

// ─── DELETE task ───────────────────────────────────────
app.delete('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Task deleted', id });
  } catch (error) {
    console.error('Supabase Error:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// ─── SUBTASKS ─────────────────────────────────────────
app.post('/api/tasks/:id/subtasks', async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;

  if (!title) return res.status(400).json({ error: 'Title is required' });

  try {
    const { data, error } = await supabase
      .from('subtasks')
      .insert([{ task_id: id, title }])
      .select();

    if (error) throw error;
    await logActivity(id, 'subtask_added', null, title);
    res.json(data[0]);
  } catch (error) {
    console.error('Supabase Error:', error);
    res.status(500).json({ error: 'Failed to create subtask' });
  }
});

app.put('/api/tasks/:id/subtasks/:sid', async (req, res) => {
  const { sid } = req.params;
  const { title, completed } = req.body;

  const updateData = {};
  if (title !== undefined) updateData.title = title;
  if (completed !== undefined) updateData.completed = completed;

  try {
    const { data, error } = await supabase
      .from('subtasks')
      .update(updateData)
      .eq('id', sid)
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    console.error('Supabase Error:', error);
    res.status(500).json({ error: 'Failed to update subtask' });
  }
});

app.delete('/api/tasks/:id/subtasks/:sid', async (req, res) => {
  const { sid } = req.params;

  try {
    const { error } = await supabase
      .from('subtasks')
      .delete()
      .eq('id', sid);

    if (error) throw error;
    res.json({ message: 'Subtask deleted' });
  } catch (error) {
    console.error('Supabase Error:', error);
    res.status(500).json({ error: 'Failed to delete subtask' });
  }
});

// ─── ACTIVITY LOG ─────────────────────────────────────
app.get('/api/tasks/:id/activity', async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from('activity_log')
      .select('*')
      .eq('task_id', id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    res.json({ activity: data });
  } catch (error) {
    console.error('Supabase Error:', error);
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
});

// ─── Catch-all: redirect root/unknown GETs to frontend ──
app.get('*', (req, res) => {
  res.redirect('/index.html');
});

module.exports = app;
