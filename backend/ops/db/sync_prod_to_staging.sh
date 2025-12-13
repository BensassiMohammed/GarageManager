#!/bin/bash
set -euo pipefail

# Charger .env
export $(grep -v '^#' "$(dirname "$0")/.env.sync_prod_to_staging" | xargs)

DATE=$(date +%Y%m%d_%H%M%S)
DUMP_FILE="$TEMP_DIR/sync_prod_${DATE}.dump"
mkdir -p "$LOG_DIR"

trap 'rm -f "$DUMP_FILE"' EXIT

echo "[$(date)] Début sync PROD -> STAGING"

# Dump PROD
docker exec "$PROD_CONTAINER" pg_dump -U "$PROD_POSTGRES_USER" -Fc "$PROD_POSTGRES_DB" > "$DUMP_FILE"

# Recréation DB STAGING
docker exec "$STAGING_CONTAINER" psql -U "$STAGING_POSTGRES_USER" -d postgres -c "DROP DATABASE IF EXISTS $STAGING_POSTGRES_DB; CREATE DATABASE $STAGING_POSTGRES_DB;"

# Restore vers STAGING
docker exec -i "$STAGING_CONTAINER" pg_restore -U "$STAGING_POSTGRES_USER" -d "$STAGING_POSTGRES_DB" --clean --if-exists < "$DUMP_FILE"

echo "[$(date)] ✅ Sync terminé"
