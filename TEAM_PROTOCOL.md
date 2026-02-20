# TEAM_PROTOCOL.md - Protocolo de Gestão de Agentes (L1 -> L4)

## 1. Sistema de Níveis (A Hierarquia)
- **L1 - Observer:** Executa tasks atribuídas. Output revisado.
- **L2 - Advisor:** Recomenda ações e executa com aprovação. Sugere melhorias.
- **L3 - Operator:** Executa autônomo dentro dos guardrails. Reporta resultado.
- **L4 - Autonomous:** Autoridade total. Coordena outros agentes. Reporta ao Leo.

## 2. Contexto Compartilhado (Pasta `shared/`)
O "escritório virtual" onde a inteligência é depositada e acessível por todos os agentes:
- `shared/TEAM.md`: Registry global (quem faz o quê, nível, modelo, canal).
- `shared/outputs/`: Entregas finais dos agentes.
- `shared/lessons/`: Lições aprendidas por agente (ex: `eight-lessons.md`). Fundamental para evitar repetição de erros.
- `shared/context/`: Contexto de negócio compartilhado (`business-context.md`).
- `shared/templates/`: Blueprints para `WORKING.md` e `HEARTBEAT.md`.

## 3. Contexto Individual (WORKING.md)
Cada agente possui seu arquivo `WORKING.md` curto (~30 linhas), sobrescrito a cada nova task. Ele não é um histórico, mas o foco do que o agente está fazendo no exato momento.

### Estrutura Padrão:
- **## Task Atual:** Detalhes do card, status e atribuição.
- **## Contexto:** Definições de tom, referências e objetivos.
- **## Próximos Passos:** Checklist técnico de execução.
- **## Bloqueios:** O que impede o avanço.

## 4. Os 7 Arquivos Sagrados (Por Agente)
Todo agente deve ter estes arquivos em seu workspace:
1.  **IDENTITY.md:** Nome, emoji, background.
2.  **SOUL.md:** Personalidade, tom, valores, hierarquia.
3.  **AGENTS.md:** Regras operacionais e checklist de sessão.
4.  **USER.md:** Quem é o Leo, tom de voz, rotina.
5.  **TOOLS.md:** Integrações e credenciais.
6.  **MEMORY.md:** Índice de memória e topic files.
7.  **WORKING.md:** Foco atual do agente.

## 5. Performance Review (Domingos)
Avaliação semanal baseada em:
- **Quality Score:** Output e consistência.
- **Velocidade:** Entrega no prazo.
- **Proatividade:** Sugestões e insights.
- **Aderência:** Respeito aos guardrails e nível.
- **Custo-Benefício:** Tokens gastos vs. Valor entregue.

**Decisões:** ⬆️ Promover | ➡️ Manter | ⬇️ Rebaixar | ❌ Desativar

## 6. As 10 Regras Invioláveis
1. Texto > Cérebro.
2. Todo agente começa L1.
3. SOUL.md define quem o agente É.
4. Nunca hardcodar credenciais.
5. Dado privado não vaza.
6. Um agente com 8 skills > 8 agentes.
7. shared/TEAM.md é obrigatório.
8. Resultado volta como comentário no card.
9. Lição aprendida -> shared/lessons/.
10. Se travou, bloqueia e comenta.

## 7. Estratégia de Economia de Tokens (Anti-Ban)
1. Model Routing (Heartbeats no Flash Lite).
2. Gerenciamento de Contexto (Flush automático).
3. Skills Cirúrgicas.
4. Delays & API Keys.
