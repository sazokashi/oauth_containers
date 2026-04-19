#!/bin/bash
# Creates a dedicated application user with readWrite on the app database only.
# Runs once on first container startup (via /docker-entrypoint-initdb.d/).

set -e

DB_NAME="${MONGO_DB_NAME:-oauth_containers}"

mongosh "$DB_NAME" <<EOF
db.createUser({
  user: "${MONGO_APP_USER}",
  pwd: "${MONGO_APP_PASSWORD}",
  roles: [{ role: "readWrite", db: "${DB_NAME}" }]
});
EOF

echo "Application user created on database: ${DB_NAME}"
