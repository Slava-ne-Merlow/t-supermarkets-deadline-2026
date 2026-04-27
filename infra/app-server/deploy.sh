#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/miniapp}"
IMAGE_ARCHIVE="${IMAGE_ARCHIVE:-$APP_DIR/deploy/miniapp-images.tar.gz}"

mkdir -p "$APP_DIR"

if [ ! -f "$APP_DIR/.env" ]; then
    echo "Missing $APP_DIR/.env" >&2
    exit 1
fi

if [ ! -f "$IMAGE_ARCHIVE" ]; then
    echo "Missing image archive: $IMAGE_ARCHIVE" >&2
    exit 1
fi

gzip -dc "$IMAGE_ARCHIVE" | docker load

docker rm -f miniapp-backend >/dev/null 2>&1 || true
docker rm -f miniapp-frontend >/dev/null 2>&1 || true

docker run -d \
    --name miniapp-backend \
    --restart unless-stopped \
    --env-file "$APP_DIR/.env" \
    -e SERVER_PORT=8080 \
    -p 8081:8080 \
    miniapp-backend:latest

docker run -d \
    --name miniapp-frontend \
    --restart unless-stopped \
    -p 8082:80 \
    miniapp-frontend:latest
