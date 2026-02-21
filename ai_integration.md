# Standard Operating Procedure: Integração Universal AI (Abacus.AI + n8n)

**Objetivo**: Consumir modelos de IA (Claude, OpenAI, Grok) através de um Gateway centralizado no n8n.
**Ferramenta Principal**: Workflow n8n `Universal AI Gateway`
**Endpoint**: `POST <N8N_URL>/webhook/ai-gateway`

---

## 1. Arquitetura

O n8n atua como um **Proxy Reverso de IA**. Em vez de configurar API Keys em cada projeto, todos os projetos enviam requisições para o n8n, que gerencia a autenticação com a Abacus.AI e retorna a resposta.

**Fluxo**:
`Client (Python/JS)` → `Webhook n8n` → `HTTP Request (Abacus API)` → `Client`

---

## 2. Como Usar (via HTTP/cURL)

Faça um POST para a URL do webhook com o seguinte JSON:

```json
{
  "prompt": "Resuma este texto: ...",
  "model": "claude-3-5-sonnet",  // Opcional (default: modelo configurado no n8n)
  "system_message": "Você é um assistente útil." // Opcional
}
```

**Exemplo cURL**:
```bash
curl -X POST http://localhost:5678/webhook/ai-gateway \
  -H "Content-Type: application/json" \
  -d \'{"prompt": "Olá, quem é você?", "model": "grok-1"}\
```

---

## 3. Como Usar (via Script Python)

Utilize o script `execution/abacus_client.py`:

```python
from execution.abacus_client import ask_ai

# Simples
resposta = ask_ai("Crie 3 nomes para um projeto de Kanban")
print(resposta)

# Com modelo específico
resposta = ask_ai("Analise este código", model="gpt-4o")
```

---

## 4. Configuração (Uma vez apenas)

1.  **Abacus API Key**: Deve estar configurada nas Credenciais do n8n (Header Auth ou similar) ou nas variáveis de ambiente do n8n (`ABACUS_API_KEY`).
2.  **Deployment ID**: Se a Abacus exigir Deployment ID, configure no nó HTTP Request do workflow.

## 5. Troubleshooting

*   **Erro 502/500**: Verifique se o n8n está rodando e se a API Key da Abacus é válida.
*   **Response vazia**: Verifique se o modelo selecionado está disponível na sua conta Abacus.
