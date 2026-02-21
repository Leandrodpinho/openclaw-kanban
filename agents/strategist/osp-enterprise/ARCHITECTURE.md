# ARCHITECTURE.md - Fluxo OSP Enterprise

## 🏗️ Estrutura do Pipeline
O diagnóstico da Rapel segue este fluxo obrigatório:

1. **INPUT:** O Leo fornece dados de faturamento, custos, NRs ou equipe.
2. **PROCESS:**
   - O Oito aciona o **Strategist**.
   - O Strategist roda os módulos 3, 4 e 10 (Diagnóstico, SWOT e KPIs).
   - Se houver riscos de segurança, o **SafeGuard** é consultado.
3. **OUTPUT:** Relatório consolidado no tópico **Rapel (ID 3)**.

## 🔗 Integração de Agentes
- **Eight:** Orquestra a carga de trabalho.
- **Strategist:** Faz o "trabalho sujo" analítico.
- **Pulse:** Monitora os KPIs gerados após a implementação.
