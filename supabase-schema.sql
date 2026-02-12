-- =================================================
-- OpenClaw Kanban — Supabase Schema
-- Execute este SQL no Editor SQL do Supabase
-- =================================================

-- Ativa extensão UUID (normalmente já ativa)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de tarefas
CREATE TABLE IF NOT EXISTS tasks (
  id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title     TEXT NOT NULL,
  status    TEXT NOT NULL DEFAULT 'todo'
              CHECK (status IN ('todo', 'inprogress', 'done', 'canceled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índice para ordenação por data
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks (created_at DESC);

-- (Opcional) Habilitar Row Level Security
-- ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow all" ON tasks FOR ALL USING (true);
