# Directive: Deploy

## Goal
Fazer deploy do OpenClaw Kanban na Vercel com Supabase como backend de produção.

## Prerequisites
- Conta na [Vercel](https://vercel.com)
- Projeto no [Supabase](https://supabase.com) com schema aplicado
- Vercel CLI instalado (`npm i -g vercel`)

## Tools
- **CLI**: `vercel`, `npx vercel --prod`
- **Supabase Dashboard**: SQL Editor para migrações
- **Script**: `execution/health_check.py` (verificação pós-deploy)

## Procedure

### 1. Preparar Supabase
1. Acessar [supabase.com](https://supabase.com) → projeto
2. Ir em **SQL Editor**
3. Colar e executar o conteúdo de `supabase-schema.sql`
4. Copiar **URL** e **anon key** do projeto (Settings → API)

### 2. Configurar Vercel
No painel Vercel → **Settings** → **Environment Variables**:

| Variável | Valor | Obrigatório |
|----------|-------|-------------|
| `SUPABASE_URL` | `https://xxx.supabase.co` | ✅ |
| `SUPABASE_KEY` | Chave anon do projeto | ✅ |
| `KANBAN_SECRET` | Token para proteger escrita | ❌ |

### 3. Deploy
```bash
cd "/Users/leandropinho/Openclaw Kanban/openclaw-kanban"
npx vercel --prod
```

### 4. Verificação Pós-Deploy
```bash
# Atualizar API_URL no .env com URL de produção
python3 execution/health_check.py
```

## Edge Cases
- **Erro "Cannot find module"**: Verificar que `@supabase/supabase-js` está no `dependencies` (não `devDependencies`)
- **CORS**: O `cors()` do Express já permite todas as origens
- **vercel.json**: Rewrite de `/api/*` para `/api/index.js` — não alterar
- **Rotas estáticas**: `index.html` e `public/` são servidos automaticamente pela Vercel

## Learnings
- A Vercel executa `api/index.js` como serverless function
- O `local-server.js` NÃO é usado em produção — é só SQLite local
- Migrações SQL devem ser executadas manualmente no Supabase Dashboard
