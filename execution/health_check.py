#!/usr/bin/env python3
"""
OpenClaw Kanban — Health Check
Verifica se API local, produção e n8n estão online.

Uso:
  python3 execution/health_check.py
  python3 execution/health_check.py --json
"""

import argparse
import json
import os
import sys
import urllib.request
import urllib.error
from pathlib import Path


# ─── Config ─────────────────────────────────────────────
def load_env():
    """Carrega variáveis do .env se existir."""
    env_path = Path(__file__).parent.parent / '.env'
    if env_path.exists():
        with open(env_path) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, _, value = line.partition('=')
                    os.environ.setdefault(key.strip(), value.strip())

load_env()

SERVICES = {
    'api_local': {
        'url': 'http://localhost:3000/api/tasks',
        'label': 'API Local (SQLite)',
    },
    'api_production': {
        'url': os.environ.get('PRODUCTION_URL', ''),
        'label': 'API Produção (Supabase)',
    },
    'n8n': {
        'url': os.environ.get('N8N_URL', 'http://localhost:5678'),
        'label': 'n8n Automation',
    },
}


# ─── Logic ──────────────────────────────────────────────
def check_service(name, config):
    """Verifica se um serviço está online."""
    url = config.get('url', '')
    if not url:
        return {'status': 'skipped', 'message': 'URL não configurada'}

    try:
        req = urllib.request.Request(url, method='GET')
        with urllib.request.urlopen(req, timeout=5) as resp:
            return {
                'status': 'online',
                'http_code': resp.status,
                'message': f'HTTP {resp.status} OK',
            }
    except urllib.error.HTTPError as e:
        # Alguns endpoints retornam 401/403 mas estão online
        if e.code in (401, 403):
            return {
                'status': 'online',
                'http_code': e.code,
                'message': f'HTTP {e.code} (auth required, but service is up)',
            }
        return {
            'status': 'error',
            'http_code': e.code,
            'message': f'HTTP {e.code}: {e.reason}',
        }
    except urllib.error.URLError as e:
        return {
            'status': 'offline',
            'message': str(e.reason),
        }
    except Exception as e:
        return {
            'status': 'error',
            'message': str(e),
        }


def run_health_check():
    """Executa health check em todos os serviços."""
    results = {}
    for name, config in SERVICES.items():
        results[name] = {
            'label': config['label'],
            **check_service(name, config),
        }
    return results


# ─── Output ─────────────────────────────────────────────
def print_results(results, as_json=False):
    """Imprime resultados formatados."""
    if as_json:
        print(json.dumps(results, indent=2, ensure_ascii=False))
        return

    print("\n🏥 OpenClaw Kanban — Health Check\n")

    status_emoji = {
        'online': '✅',
        'offline': '❌',
        'error': '⚠️',
        'skipped': '⏭️',
    }

    for name, info in results.items():
        emoji = status_emoji.get(info['status'], '❓')
        print(f"  {emoji} {info['label']}: {info['message']}")

    # Resumo
    online = sum(1 for r in results.values() if r['status'] == 'online')
    total = sum(1 for r in results.values() if r['status'] != 'skipped')
    print(f"\n📊 {online}/{total} serviço(s) online")

    if any(r['status'] == 'offline' for r in results.values()):
        print("\n💡 Dicas:")
        if results.get('api_local', {}).get('status') == 'offline':
            print("  → API Local: rode 'npm start' no diretório do projeto")
        if results.get('n8n', {}).get('status') == 'offline':
            print("  → n8n: rode 'docker compose up -d' para iniciar")


# ─── CLI ────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description='Health check dos serviços')
    parser.add_argument('--json', action='store_true', help='Saída em JSON')

    args = parser.parse_args()
    results = run_health_check()
    print_results(results, as_json=args.json)


if __name__ == '__main__':
    main()
