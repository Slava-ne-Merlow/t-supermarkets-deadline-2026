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

If the frontend is served directly from the same VM, use:

- `APP_FRONTEND_URL=http://144.31.68.159:8082`
