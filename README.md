# Telegram Mini App

Minimal Spring Boot backend with a Telegram `/start` handler and a default Angular frontend.

Required backend environment:

- `TELEGRAM_BOT_TOKEN`
- `APP_FRONTEND_URL`

Optional backend environment:

- `APP_START_TEXT`
- `TELEGRAM_USERNAME`

Deploy target path:

- `/opt/miniapp`

Deploy flow:

- GitHub Actions builds `miniapp-backend` and `miniapp-frontend` images.
- Images are packed into `miniapp-images.tar.gz`.
- The archive and deploy script are uploaded to the VM.
- The VM loads images with `docker load` and runs backend, frontend, and Caddy containers with plain Docker.

If the frontend is served directly from the same VM, use:

- `APP_PUBLIC_HOST=144-31-68-159.sslip.io`
- `APP_FRONTEND_URL=https://144-31-68-159.sslip.io`

Use quotes for values with spaces in `/opt/miniapp/.env`, for example:

- `APP_START_TEXT="Привет! Открой мини-приложение по кнопке ниже."`
