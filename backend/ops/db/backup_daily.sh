#!/bin/bash
set -euo pipefail

# Charger .env
export $(grep -v '^#' "$(dirname "$0")/.env.backup_daily" | xargs)

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_${POSTGRES_DB}_${DATE}.dump"
mkdir -p "$BACKUP_DIR"

echo "[$(date)] Début backup $POSTGRES_DB"
docker exec "$POSTGRES_CONTAINER" pg_dump -U "$POSTGRES_USER" -Fc "$POSTGRES_DB" > "$BACKUP_FILE"

echo "[$(date)] Backup OK : $BACKUP_FILE ($(du -h "$BACKUP_FILE" | cut -f1))"

# Rotation anciens backups
find "$BACKUP_DIR" -type f -name "*.dump" -mtime +"$RETENTION_DAYS" -delete
echo "[$(date)] Rotation terminée"
