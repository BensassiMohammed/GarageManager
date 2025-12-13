#!/bin/bash
set -euo pipefail

# --- CONFIGURATION (Chemins) ---
SCRIPT_DIR="$(dirname "$0")"

# Charger .env
export $(grep -v '^#' "$SCRIPT_DIR/.env.sync_prod_to_staging" | xargs)

# Vérification des variables critiques
: "${PROD_CONTAINER:?Variable PROD_CONTAINER non définie}"
: "${STAGING_CONTAINER:?Variable STAGING_CONTAINER non définie}"
: "${PROD_POSTGRES_DB:?Variable PROD_POSTGRES_DB non définie}"
: "${STAGING_POSTGRES_DB:?Variable STAGING_POSTGRES_DB non définie}"
: "${PROD_POSTGRES_USER:?Variable PROD_POSTGRES_USER non définie}"
: "${STAGING_POSTGRES_USER:?Variable STAGING_POSTGRES_USER non définie}"

# Dossiers temporaires et logs
TEMP_DIR="/tmp/pg_sync_dumps"
LOG_DIR="$SCRIPT_DIR/logs"

DATE=$(date +%Y%m%d_%H%M%S)
DUMP_FILE="$TEMP_DIR/sync_prod_${DATE}.dump"

mkdir -p "$TEMP_DIR"
mkdir -p "$LOG_DIR"

# Assure la suppression du fichier dump temporaire en cas d'interruption
trap 'rm -f "$DUMP_FILE"; echo "[$(date)] ⚠️ Fichier dump temporaire supprimé."' EXIT

echo "[$(date)] 🚀 Début synchronisation PROD -> STAGING"
echo "  Source (PROD DB): $PROD_POSTGRES_DB dans $PROD_CONTAINER"
echo "  Cible (STAGING DB): $STAGING_POSTGRES_DB dans $STAGING_CONTAINER"
echo "---"

# --- 1. DUMP DE LA BASE DE DONNÉES DE PRODUCTION ---
echo "[$(date)] 📥 Dump de la base de données PROD en cours..."
if docker exec "$PROD_CONTAINER" pg_dump -U "$PROD_POSTGRES_USER" -Fc "$PROD_POSTGRES_DB" > "$DUMP_FILE"; then
    echo "[$(date)] ✅ Dump PROD réussi."
else
    echo "[$(date)] ❌ ERREUR lors du dump de PROD. Arrêt du script."
    exit 1
fi

# --- 2. RECRÉATION DB STAGING (CORRIGÉE) ---
# L'erreur "DROP DATABASE cannot run inside a transaction block" nécessite de séparer les commandes.

# Terminer toutes les connexions actives sur la base STAGING avant suppression
echo "[$(date)] 🔌 Terminaison des connexions actives sur STAGING..."
docker exec "$STAGING_CONTAINER" psql -U "$STAGING_POSTGRES_USER" -d postgres -c "
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = '$STAGING_POSTGRES_DB'
  AND pid <> pg_backend_pid();
" || true
# Petit délai pour s'assurer que les connexions sont bien fermées
sleep 2

echo "[$(date)] 🗑️ Suppression de la base de données STAGING en cours..."
if docker exec "$STAGING_CONTAINER" psql -U "$STAGING_POSTGRES_USER" -d postgres -c "DROP DATABASE IF EXISTS $STAGING_POSTGRES_DB;"; then
    echo "[$(date)] ✅ Suppression DB STAGING réussie."
else
    echo "[$(date)] ❌ ERREUR lors de la suppression de la DB STAGING. Arrêt du script."
    exit 1
fi

echo "[$(date)] ✨ Création de la base de données STAGING en cours..."
if docker exec "$STAGING_CONTAINER" psql -U "$STAGING_POSTGRES_USER" -d postgres -c "CREATE DATABASE $STAGING_POSTGRES_DB;"; then
    echo "[$(date)] ✅ Création DB STAGING réussie."
else
    echo "[$(date)] ❌ ERREUR lors de la création de la DB STAGING. Arrêt du script."
    exit 1
fi

# --- 3. RESTAURATION VERS STAGING ---
echo "[$(date)] 📤 Restauration des données vers STAGING en cours..."
if docker exec -i "$STAGING_CONTAINER" pg_restore -U "$STAGING_POSTGRES_USER" -d "$STAGING_POSTGRES_DB" --no-owner --no-acl -v < "$DUMP_FILE"; then
    echo "[$(date)] ✅ Restauration vers STAGING réussie."
else
    echo "[$(date)] ❌ ERREUR lors de la restauration vers STAGING. Vérifiez les logs."
    exit 1
fi

echo "---"
echo "[$(date)] 🎉 Sync PROD -> STAGING terminé avec succès !"