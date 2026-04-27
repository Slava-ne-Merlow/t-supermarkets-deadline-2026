#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/miniapp}"

mkdir -p "$APP_DIR/app-backend"
mkdir -p "$APP_DIR/app-frontend"

rsync -a --delete services/app-backend/ "$APP_DIR/app-backend/"
rsync -a --delete services/app-frontend/ "$APP_DIR/app-frontend/"
rsync -a infra/app-server/docker-compose.yml "$APP_DIR/docker-compose.yml"

cd "$APP_DIR"
docker compose --env-file "$APP_DIR/.env" up -d --build
