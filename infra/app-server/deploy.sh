#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/miniapp}"
IMAGE_ARCHIVE="${IMAGE_ARCHIVE:-$APP_DIR/deploy/miniapp-images.tar.gz}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

mkdir -p "$APP_DIR"

if [ ! -f "$APP_DIR/.env" ]; then
    echo "Missing $APP_DIR/.env" >&2
    exit 1
fi

if [ ! -f "$IMAGE_ARCHIVE" ]; then
    echo "Missing image archive: $IMAGE_ARCHIVE" >&2
    exit 1
fi

cp "$SCRIPT_DIR/docker-compose.yml" "$APP_DIR/docker-compose.yml"

gzip -dc "$IMAGE_ARCHIVE" | docker load

cd "$APP_DIR"

set -a
# shellcheck disable=SC1091
. "$APP_DIR/.env"
set +a

if docker compose version >/dev/null 2>&1; then
    docker compose up -d
elif command -v docker-compose >/dev/null 2>&1; then
    docker-compose up -d
else
    echo "Docker Compose is not installed. Install docker compose plugin or docker-compose." >&2
    exit 1
fi
