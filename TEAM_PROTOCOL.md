# TEAM_PROTOCOL.md - Protocolo de Gestão de Agentes (L1 -> L4)

## 1. Sistema de Níveis (A Hierarquia)
- **L1 - Observer:** Executa tasks atribuídas. Output revisado.
- **L2 - Advisor:** Recomenda ações e executa com aprovação. Sugere melhorias.
- **L3 - Operator:** Executa autônomo dentro dos guardrails. Reporta resultado.
- **L4 - Autonomous:** Autoridade total. Coordena outros agentes. Reporta ao Leo.

## 2. Contexto Compartilhado (Pasta `shared/`)
O "escritório virtual" onde a inteligência é depositada:
- `shared/TEAM.md`: Registro de quem faz o quê, nível e modelo.
- `shared/outputs/`: Entregas acessíveis por todos.
- `shared/lessons/`: Lições aprendidas por agente (ex: `amora-lessons.md`).
- `shared/context/`: Contexto de negócio compartilhado (`business-context.md`).
- `shared/templates/`: Templates padrão para novos agentes.

## 3. Os 7 Arquivos Sagrados (Por Agente)
Todo agente deve ter estes arquivos em seu workspace:
1.  **IDENTITY.md:** Nome, emoji, background.
2.  **SOUL.md:** Personalidade, tom, valores, hierarquia.
3.  **AGENTS.md:** Regras operacionais e checklist de sessão.
4.  **USER.md:** Quem é o Leo, tom de voz, rotina.
5.  **TOOLS.md:** Integrações e credenciais.
6.  **MEMORY.md:** Índice de memória e topic files.
7.  **WORKING.md:** Task atual, contexto, próximos passos (substituído a cada task).

## 4. Performance Review (Domingos)
Avaliação semanal baseada em:
- **Quality Score:** Output e consistência.
- **Velocidade:** Entrega no prazo.
- **Proatividade:** Sugestões e insights.
- **Aderência:** Respeito aos guardrails e nível.
- **Custo-Benefício:** Tokens gastos vs. Valor entregue.

**Decisões:** ⬆️ Promover | ➡️ Manter | ⬇️ Rebaixar | ❌ Desativar

## 5. As 10 Regras Invioláveis
Embedadas no DNA do Orquestrador e seguidas por todos os agentes:

1.  **Texto > Cérebro:** Se importa, escreve no arquivo. "Mental notes" morrem no restart.
2.  **Todo agente começa L1:** Sem exceções. Confiança se conquista, não se assume.
3.  **SOUL.md define quem o agente É:** Sem alma, é só um chatbot. Personalidade, tom e valores.
4.  **Nunca hardcodar credenciais:** Tudo via integradores/tools seguros. Sem exceções.
5.  **Dado privado não vaza:** Nunca em grupos, nunca em contextos compartilhados, nunca sem permissão.
6.  **Um agente com 8 skills > 8 agentes:** Só cria agente novo quando skill não resolve.
7.  **shared/TEAM.md é obrigatório:** Todo agente lê na sessão. É o org chart vivo.
8.  **Resultado volta como comentário no card:** Não fica perdido em chat. MC (Mission Control) é a source of truth.
9.  **Lição aprendida -> shared/lessons/:** Erro que não vira lição vai se repetir.
10. **Se travou, bloqueia e comenta:** Mover card para "blocked" + explicar o motivo. Nunca ficar parado em silêncio.

## 6. Estratégia de Economia de Tokens (Anti-Ban)
Baseado nas melhores práticas para reduzir custos em até 83%:

1.  **Model Routing (Roteamento):**
    - **Heartbeats:** Usar modelos ultra-baratos (Gemini Flash Lite / GPT-4o mini).
    - **Subagents:** Usar modelos de baixo custo (DeepSeek R1 / Gemini Flash).
    - **Tarefas Complexas:** Reservar Claude Opus/Sonnet apenas para codificação pesada.
2.  **Gerenciamento de Contexto:**
    - Usar `/new` ou `openclaw session reset` ao mudar drasticamente de assunto.
    - Configurar **Compactação Automática** (Flush) para resumir o histórico e enxugar o contexto enviado.
3.  **Skills Cirúrgicas:**
    - Desabilitar skills não utilizadas para diminuir o tamanho do prompt de sistema.
    - Priorizar processamento local (FFMPEG, scripts bash) em vez de enviar dados brutos para IA.
4.  **Delays & API Keys:**
    - Configurar pequenos delays entre requisições de agentes para evitar flag de spam.
    - Usar API Keys de uso geral (Google AI Studio) em vez de chaves sensíveis de IDE.
