#!/bin/bash
set -e

# Ensure log directory exists
mkdir -p /var/log/mongodb
chown mongodb:mongodb /var/log/mongodb

# Graceful shutdown: dump database before stopping
trap_shutdown() {
  echo "Received shutdown signal — dumping database before exit..."
  if command -v mongodump &> /dev/null; then
    mongodump \
      --uri="mongodb://localhost:27017/${MONGO_DB_NAME:-oauth_containers}" \
      --username="${MONGO_APP_USER}" \
      --password="${MONGO_APP_PASSWORD}" \
      --authenticationDatabase="${MONGO_DB_NAME:-oauth_containers}" \
      --archive="/dump-data/auto-dump.gz" \
      --gzip \
      2>/dev/null || echo "Dump skipped (database may not be ready)."
  fi
  kill -SIGTERM "$CHILD_PID" 2>/dev/null
  wait "$CHILD_PID"
  exit 0
}

trap trap_shutdown SIGTERM SIGINT

# Delegate to the official mongo entrypoint
exec docker-entrypoint.sh "$@" &
CHILD_PID=$!
wait "$CHILD_PID"
