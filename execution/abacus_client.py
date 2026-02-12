import os
import sys
import json
import requests
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

N8N_WEBHOOK_URL = os.getenv("N8N_URL", "http://localhost:5678/webhook/ai-gateway")
if not N8N_WEBHOOK_URL.endswith("ai-gateway"):
    # Ajuste caso a env var seja apenas a base URL
    if N8N_WEBHOOK_URL.endswith("/"):
        N8N_WEBHOOK_URL += "webhook/ai-gateway"
    else:
        N8N_WEBHOOK_URL += "/webhook/ai-gateway"

def ask_ai(prompt, model=None, system_message=None):
    """
    Envia um prompt para o Universal AI Gateway no n8n.
    
    Args:
        prompt (str): O texto para a IA processar.
        model (str, optional): O modelo a ser usado (ex: 'claude-3-5-sonnet').
        system_message (str, optional): Instrução de sistema.
        
    Returns:
        str: A resposta da IA ou mensagem de erro.
    """
    payload = {
        "prompt": prompt
    }
    
    if model:
        payload["model"] = model
    if system_message:
        payload["system_message"] = system_message
        
    try:
        response = requests.post(N8N_WEBHOOK_URL, json=payload, timeout=60)
        response.raise_for_status()
        
        data = response.json()
        
        # Tenta extrair a resposta de diferentes formatos possíveis retornados pelo n8n
        if isinstance(data, dict):
             if "response" in data:
                 return data["response"]
             elif "text" in data:
                 return data["text"]
             elif "content" in data:
                 return data["content"]
        
        return str(data)
        
    except requests.exceptions.RequestException as e:
        if isinstance(e, requests.exceptions.HTTPError) and e.response.status_code == 404:
            return (
                "❌ Erro 404: Workflow não encontrado ou inativo.\n"
                "👉 Verifique se o workflow 'Universal AI Gateway' está ATIVO no n8n:\n"
                "   http://localhost:5678/workflow/qrSf6mjGyOjwK0WK"
            )
        return f"Error connecting to AI Gateway: {str(e)}"

if __name__ == "__main__":
    # Teste rápido linha de comando
    if len(sys.argv) > 1:
        user_prompt = " ".join(sys.argv[1:])
        print(f"🤖 Perguntando: {user_prompt}")
        print(f"💬 Resposta:\n{ask_ai(user_prompt)}")
    else:
        print("Uso: python3 abacus_client.py 'Sua pergunta aqui'")
        print("Teste default: Quem descobriu o Brasil?")
        print(f"💬 Resposta:\n{ask_ai('Quem descobriu o Brasil?')}")
