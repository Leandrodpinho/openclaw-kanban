# Sistema de Heartbeats

Este documento descreve a configuração e o funcionamento do sistema de heartbeats para o agente 88.

## 1. Objetivo

Monitorar proativamente o status do sistema, o andamento das tarefas e fornecer resumos diários para garantir a operação contínua e eficiente do agente.

## 2. Verificações Periódicas

As seguintes verificações serão realizadas em intervalos regulares:

### 2.1. Checagem de Tarefas Vencidas

*   **Frequência:** Diariamente, às 07:00 AM (GMT-3).
*   **Descrição:** Verifica todas as tarefas no Kanban que estão vencidas ou que vencem no dia atual.
*   **Ferramenta:** `execution/heartbeat.py` (utilizando a API do Kanban).
*   **Ação:** Gerar um relatório das tarefas identificadas.

### 2.2. Status do Sistema

*   **Frequência:** A cada 4 horas.
*   **Descrição:** Verifica a saúde geral dos componentes críticos do sistema (e.g., API do Kanban, serviços externos).
*   **Ferramenta:** `execution/heartbeat.py` (integrando com `health_check.py`).
*   **Ação:** Registrar o status em um log interno.

### 2.3. Resumo Diário

*   **Frequência:** Diariamente, às 22:00 PM (GMT-3).
*   **Descrição:** Compila um resumo das atividades do dia, tarefas concluídas, pendências e quaisquer alertas do sistema.
*   **Ferramenta:** `execution/heartbeat.py`.
*   **Ação:** Gerar um resumo consolidado.

## 3. Implementação

O script `execution/heartbeat.py` será o responsável por orquestrar essas verificações, utilizando a API do Kanban para acessar os dados das tarefas. As saídas das verificações serão registradas internamente e poderão ser consultadas para auditoria e acompanhamento.

## 4. Próximos Passos (Futuras Integrações)

*   Integração com e-mail para envio de relatórios diários.
*   Integração com calendário para agendamento de tarefas de acompanhamento.
*   Integração com plataformas de comunicação (e.g., Discord, Slack) para menções e alertas.
