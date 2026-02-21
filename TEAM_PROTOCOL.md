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
- `shared/lessons/`: Lições aprendidas por agente. Fundamental para evitar repetição de erros.
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
1. IDENTITY.md | 2. SOUL.md | 3. AGENTS.md | 4. USER.md | 5. TOOLS.md | 6. MEMORY.md | 7. WORKING.md

## 5. As 10 Regras Invioláveis
Embedadas no DNA do Orquestrador e seguidas por todos os agentes:

1.  **Texto > Cérebro:** Se importa, escreve no arquivo. "Mental notes" morrem no restart.
2.  **Todo agente começa L1:** Sem exceções. Confiança se conquista, não se assume.
3.  **SOUL.md define quem o agente É:** Sem alma, é só um chatbot. Personalidade, tom e valores.
4.  **Nunca hardcodar credenciais:** Tudo via integradores/tools seguros (ex: `TOOLS.md`). Sem exceções.
5.  **Dado privado não vaza:** Nunca em grupos, nunca em contextos compartilhados, nunca sem permissão.
6.  **Um agente com 8 skills > 8 agentes:** Só cria agente novo quando skill não resolve.
7.  **shared/TEAM.md é obrigatório:** Todo agente lê na sessão. É o org chart vivo.
8.  **Resultado volta como comentário no card:** Não fica perdido em chat. Mission Control é a source of truth.
9.  **Lição aprendida -> shared/lessons/:** Erro que não vira lição vai se repetir.
10. **Se travou, bloqueia e comenta:** Mover card para "blocked" + explicar o motivo. Nunca ficar parado em silêncio.

## 6. Performance Review (Domingos)
Avaliação semanal baseada em Quality Score, Velocidade, Proatividade e Custo-Benefício.

## 7. Estratégia de Economia de Tokens (Anti-Ban)
1. Model Routing (Heartbeats no Flash Lite).
2. Gerenciamento de Contexto (Flush automático).
3. Skills Cirúrgicas.
4. Delays & API Keys.
