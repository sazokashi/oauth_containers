#!/bin/bash
# Restores from a dump archive if one exists. Runs once on first startup.

set -e

DUMP_FILE="/dump-data/auto-dump.gz"
DB_NAME="${MONGO_DB_NAME:-oauth_containers}"

if [ -f "$DUMP_FILE" ]; then
  echo "Restoring database from ${DUMP_FILE}..."
  mongorestore \
    --uri="mongodb://localhost:27017/${DB_NAME}" \
    --archive="$DUMP_FILE" \
    --gzip \
    --drop \
    2>&1
  echo "Restore complete."
else
  echo "No dump archive found at ${DUMP_FILE} — starting with empty database."
fi
