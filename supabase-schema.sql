-- =================================================
-- OpenClaw Kanban — Supabase Schema v2.0
-- Execute este SQL no Editor SQL do Supabase
-- =================================================

-- Ativa extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Tabela principal de tarefas ───────────────────────
CREATE TABLE IF NOT EXISTS tasks (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       TEXT NOT NULL,
  description TEXT DEFAULT "";
  status      TEXT NOT NULL DEFAULT "todo"
                CHECK (status IN ("todo", "inprogress", "done", "canceled")),
  priority    TEXT DEFAULT "medium"
                CHECK (priority IN ("high", "medium", "low")),
  category    TEXT DEFAULT ""
                CHECK (category IN ("", "rapel", "estudo", "devocional", "lazer", "seguranca")),
  due_date    TIMESTAMPTZ,
  position    INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Tabela de subtarefas ──────────────────────────────
CREATE TABLE IF NOT EXISTS subtasks (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id     UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  completed   BOOLEAN DEFAULT FALSE,
  position    INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Tabela de histórico de atividade ──────────────────
CREATE TABLE IF NOT EXISTS activity_log (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id     UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  action      TEXT NOT NULL,
  old_value   TEXT,
  new_value   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Índices ───────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks (status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks (priority);
CREATE INDEX IF NOT EXISTS idx_tasks_category ON tasks (category);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks (due_date);
CREATE INDEX IF NOT EXISTS idx_subtasks_task_id ON subtasks (task_id);
CREATE INDEX IF NOT EXISTS idx_activity_task_id ON activity_log (task_id);

-- ─── Trigger: auto-update updated_at ──────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── Migração: se tabela já existe, adicionar colunas ──
-- Execute apenas se a tabela já existir sem as colunas novas:
-- ALTER TABLE tasks ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';
-- ALTER TABLE tasks ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium';
-- ALTER TABLE tasks ADD COLUMN IF NOT EXISTS category TEXT DEFAULT '';
-- ALTER TABLE tasks ADD COLUMN IF NOT EXISTS due_date TIMESTAMPTZ;
-- ALTER TABLE tasks ADD COLUMN IF NOT EXISTS position INTEGER DEFAULT 0;
-- ALTER TABLE tasks ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
