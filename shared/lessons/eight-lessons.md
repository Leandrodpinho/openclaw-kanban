# Lessons Learned - Eight (Supervisor)

## [2026-02-20] - Configuração Inicial v4.0
- **Lição:** A transição do Mac para a VPS exige a reconstrução cirúrgica da estrutura de diretórios `shared/` para garantir que sub-agentes tenham acesso aos dados sem re-leitura de logs.
- **Ação:** Implementado sistema de arquivos sagrados e contexto compartilhado conforme framework Amora.
