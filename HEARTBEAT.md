# HEARTBEAT.md - Verificações de Status do 8 v2.1

## Verificações Periódicas (Rapel)

### Diário
- [ ] Tarefas vencidas ou próximas do prazo no Kanban
- [ ] Status das entregas da semana
- [ ] Alertas de compliance SST pendentes

### Semanal
- [ ] Revisão do pipeline comercial
- [ ] Atualização de MEMORY.md com lições da semana
- [ ] Status financeiro (metas vs realizado)

### Quinzenal
- [ ] Performance Review do 8
- [ ] Revisão de shared/lessons/ por modo
- [ ] Atualização do TASK_KANBAN.md

## Implementação
O script execution/heartbeat.py orquestra as verificações usando a API do Kanban. Saídas registradas internamente para auditoria.

## Regras
- Horário de silêncio: 23h–7h (exceto urgências)
- Não enviar mensagens sem conteúdo útil
- Batching: combinar verificações na mesma sessão pra economizar tokens
- Se nada precisa de atenção: HEARTBEAT_OK
