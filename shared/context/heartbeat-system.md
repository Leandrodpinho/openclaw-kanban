# HEARTBEAT_SYSTEM.md - Ciclo de Heartbeat Escalonado (Staggered)

Inspirado na estrutura da Amora (Bruno Okamoto). Os agentes não ficam "always on", eles acordam em intervalos para economizar tokens.

## 1. Funcionamento
A cada 15 minutos (ou conforme configurado no `openclaw.json`), o sistema dispara um poll. Para economizar tokens, o fluxo é:
1. Agente acorda -> 2. Lê `WORKING.md` -> 3. Checa Mission Control (Backlog) -> 4. Trabalha ou Volta a dormir.

## 2. Escalonamento de Agentes (Minutos do Ciclo)
Para evitar picos de custo e sobreposição, os agentes acordam em minutos diferentes:

| Minuto | Agente | Foco Principal | Modelo Recomendado |
| :--- | :--- | :--- | :--- |
| **:00** | **🧠 Eight** | Delegar tasks e Supervisão | Gemini Flash Lite |
| **:02** | **📊 Strategist** | Atualizar KPIs da Rapel | Gemini Flash |
| **:04** | **🛡️ SafeGuard** | Auditoria de SST/NRs | Gemini Flash Lite |
| **:06** | **🎯 Hunter** | Monitorar Licitações | Gemini Flash |
| **:08** | **💰 Money** | Controle Financeiro | Gemini Flash Lite |
| **:10** | **📱 Viral** | Transcrição e Social Media | Gemini Flash |
| **:12** | **🏃 Coach** | Hábitos e Treinos | Gemini Flash Lite |
| **:14** | **💓 Pulse** | Alertas Críticos | Gemini Flash Lite |

## 3. Gestão de Tokens (Estratégia Anti-Ban)
- **Model Routing:** Heartbeats SEMPRE usarão os modelos mais baratos (Gemini Flash Lite ou GPT-4o mini).
- **Silent Mode:** Se o agente ler o `WORKING.md` e não houver nada novo no Backlog, ele responde apenas `HEARTBEAT_OK` (consumo mínimo).
- **Flush Automático:** Ao atingir 20% do contexto, a sessão do heartbeat é compactada.

---
_Protocolo de Heartbeat v4.0. Ativar após pareamento do Gateway._ 🎱
