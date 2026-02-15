import requests

def test_endpoint(url_suffix, name):
    url = f"http://localhost:5678{url_suffix}"
    print(f"--- Testando {name} ({url}) ---")
    try:
        response = requests.post(url, json={"prompt": "Ping"})
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text[:100]}")
        return response.status_code
    except Exception as e:
        print(f"Erro: {e}")
        return None

print("=== DIAGNÓSTICO N8N ===")
prod = test_endpoint("/webhook/ai-gateway", "PRODUÇÃO")
test = test_endpoint("/webhook-test/ai-gateway", "TESTE (Precisa de 'Executar' na UI)")

if prod == 200:
    print("\n✅ SUCESSO! Endpoint de Produção está funcionado.")
elif test == 200:
    print("\n⚠️ AVISO: Apenas Endpoint de Teste funcionou.")
    print("👉 Solução: O workflow não está 'Publicado' corretamente, mas está em modo de teste.")
else:
    print("\n❌ FALHA TOTAL: Nenhum endpoint respondeu.")
