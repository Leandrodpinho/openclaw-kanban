# 🚀 OpenClaw Kanban

Quadro Kanban simples para gerenciamento de tarefas, com suporte a desenvolvimento local (SQLite) e deploy na Vercel (Supabase).

## Pré-requisitos

- [Node.js](https://nodejs.org/) 18+
- npm

## Início Rápido (Desenvolvimento Local)

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar o servidor local (usa SQLite automático)
npm start

# 3. Abrir no navegador
open http://localhost:3000
```

> O banco de dados SQLite é salvo em `database.db` na raiz do projeto.

## Deploy na Vercel (Produção)

### 1. Criar projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e crie um projeto
2. No **SQL Editor**, cole e execute o conteúdo de `supabase-schema.sql`
3. Copie a **URL** e a **anon key** do projeto

### 2. Configurar variáveis de ambiente na Vercel

No painel da Vercel → **Settings** → **Environment Variables**:

| Variável | Descrição |
|----------|-----------|
| `SUPABASE_URL` | URL do projeto Supabase |
| `SUPABASE_KEY` | Chave anon do Supabase |
| `KANBAN_SECRET` | *(Opcional)* Token para proteger escrita |

### 3. Deploy

```bash
npx vercel --prod
```

## Autenticação (Opcional)

Para proteger operações de escrita (POST/PUT/DELETE):

1. Defina `KANBAN_SECRET` nas variáveis de ambiente
2. No navegador, abra o console e execute:
   ```javascript
   localStorage.setItem('KANBAN_SECRET', 'seu-token-aqui');
   ```

## API Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/tasks` | Listar todas as tarefas |
| `POST` | `/api/tasks` | Criar tarefa (`{ title }`) |
| `PUT` | `/api/tasks/:id` | Atualizar status (`{ status }`) |
| `DELETE` | `/api/tasks/:id` | Excluir tarefa |

**Status válidos**: `todo`, `inprogress`, `done`, `canceled`

## Estrutura

```
openclaw-kanban/
├── api/index.js        ← Servidor Vercel (Supabase)
├── local-server.js     ← Servidor local (SQLite)
├── public/
│   ├── index.html      ← Interface do Kanban
│   └── script.js       ← Lógica do frontend
├── supabase-schema.sql ← Script de criação do banco
├── vercel.json         ← Configuração de deploy
└── package.json
```

## Licença

MIT
