#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/miniapp}"
IMAGE_ARCHIVE="${IMAGE_ARCHIVE:-$APP_DIR/deploy/miniapp-images.tar.gz}"

mkdir -p "$APP_DIR"

if [ ! -f "$APP_DIR/.env" ]; then
    echo "Missing $APP_DIR/.env" >&2
    exit 1
fi

if [ -f "$IMAGE_ARCHIVE" ]; then
    gzip -dc "$IMAGE_ARCHIVE" | docker load
else
    echo "No image archive found at $IMAGE_ARCHIVE; reusing local Docker images."
fi

read_env_value() {
    local name="$1"
    grep -E "^${name}=" "$APP_DIR/.env" | tail -n 1 | cut -d '=' -f 2- | sed -e 's/^"//' -e 's/"$//'
}

configured_public_host="$(read_env_value APP_PUBLIC_HOST || true)"
configured_frontend_url="$(read_env_value APP_FRONTEND_URL || true)"

if [ -n "$configured_public_host" ]; then
    frontend_host="$configured_public_host"
elif printf '%s' "$configured_frontend_url" | grep -q '^https://'; then
    frontend_host="$(printf '%s' "$configured_frontend_url" | sed -E 's#^https://##; s#/.*$##')"
else
    frontend_host="144-31-68-159.sslip.io"
fi

frontend_url="https://$frontend_host"

cat > "$APP_DIR/Caddyfile" <<EOF
{
    auto_https disable_redirects
}

$frontend_host {
    encode gzip
    reverse_proxy miniapp-frontend:80
}
EOF

docker network create miniapp-net >/dev/null 2>&1 || true

docker rm -f miniapp-backend >/dev/null 2>&1 || true
docker rm -f miniapp-frontend >/dev/null 2>&1 || true
docker rm -f miniapp-caddy >/dev/null 2>&1 || true

docker run -d \
    --name miniapp-backend \
    --restart unless-stopped \
    --network miniapp-net \
    --env-file "$APP_DIR/.env" \
    -e SERVER_PORT=8080 \
    -e APP_FRONTEND_URL="$frontend_url" \
    -p 8081:8080 \
    miniapp-backend:latest

docker run -d \
    --name miniapp-frontend \
    --restart unless-stopped \
    --network miniapp-net \
    -p 8082:80 \
    miniapp-frontend:latest

docker run -d \
    --name miniapp-caddy \
    --restart unless-stopped \
    --network miniapp-net \
    -p 443:443 \
    -v "$APP_DIR/Caddyfile:/etc/caddy/Caddyfile:ro" \
    -v "$APP_DIR/caddy-data:/data" \
    -v "$APP_DIR/caddy-config:/config" \
    miniapp-caddy:latest
