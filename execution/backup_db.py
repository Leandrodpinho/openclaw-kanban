#!/usr/bin/env python3
"""
OpenClaw Kanban — Backup Database
Faz backup do SQLite local, mantendo últimos 7 backups.

Uso:
  python3 execution/backup_db.py
"""

import os
import shutil
import sys
from datetime import datetime
from pathlib import Path


# ─── Config ─────────────────────────────────────────────
PROJECT_ROOT = Path(__file__).parent.parent
DB_PATH = PROJECT_ROOT / 'database.db'
BACKUP_DIR = PROJECT_ROOT / '.tmp' / 'backups'
MAX_BACKUPS = 7


# ─── Logic ──────────────────────────────────────────────
def backup_database():
    """Copia database.db para .tmp/backups/ com timestamp."""

    if not DB_PATH.exists():
        print(f"❌ Banco de dados não encontrado: {DB_PATH}", file=sys.stderr)
        print("💡 Dica: rode 'npm start' primeiro para criar o banco", file=sys.stderr)
        sys.exit(1)

    # Criar diretório de backup
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)

    # Nome do backup com timestamp
    timestamp = datetime.now().strftime('%Y-%m-%d_%H%M%S')
    backup_name = f"backup_{timestamp}.db"
    backup_path = BACKUP_DIR / backup_name

    # Copiar o banco
    shutil.copy2(DB_PATH, backup_path)
    size_kb = backup_path.stat().st_size / 1024
    print(f"✅ Backup criado: {backup_path.name} ({size_kb:.1f} KB)")

    # Limpeza: manter apenas os últimos N backups
    backups = sorted(BACKUP_DIR.glob('backup_*.db'), key=lambda p: p.stat().st_mtime)
    if len(backups) > MAX_BACKUPS:
        for old_backup in backups[:-MAX_BACKUPS]:
            old_backup.unlink()
            print(f"🗑️ Backup antigo removido: {old_backup.name}")

    remaining = list(BACKUP_DIR.glob('backup_*.db'))
    print(f"📦 Total de backups: {len(remaining)}/{MAX_BACKUPS}")


# ─── CLI ────────────────────────────────────────────────
if __name__ == '__main__':
    backup_database()
