#!/bin/bash
# ─────────────────────────────────────────────────────
#  Деплой Брикет-Бери на Cloudbell VPS
#  Домен: briket-berry.ru
#  Запускать с сервера: bash /var/www/briket-berry/deploy/deploy.sh
# ─────────────────────────────────────────────────────
set -e

PROJECT_DIR="/var/www/briket-berry"
echo ""
echo "🔥 Деплой Брикет-Бери → briket-berry.ru"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ── 1. Обновить код ───────────────────────────────────
echo "📦 [1/5] Обновление кода..."
cd "$PROJECT_DIR"
git pull origin main

# ── 2. Бэкенд ────────────────────────────────────────
echo "⚙️  [2/5] Сборка бэкенда..."
cd "$PROJECT_DIR/backend"
npm ci --production=false
./node_modules/.bin/prisma generate
./node_modules/.bin/prisma migrate deploy
npm run build
echo "    ✓ Бэкенд собран"

# ── 3. Фронтенд ──────────────────────────────────────
echo "🎨 [3/5] Сборка фронтенда..."
cd "$PROJECT_DIR/frontend"
npm ci
npm run build
echo "    ✓ Фронтенд собран → dist/"

# ── 4. Перезапуск PM2 ────────────────────────────────
echo "🔄 [4/5] Перезапуск сервера..."
cd "$PROJECT_DIR"
pm2 reload deploy/ecosystem.config.js --update-env 2>/dev/null || \
pm2 start deploy/ecosystem.config.js
pm2 save
echo "    ✓ PM2 обновлён"

# ── 5. Nginx reload ───────────────────────────────────
echo "🌐 [5/5] Перезагрузка Nginx..."
sudo nginx -t && sudo systemctl reload nginx
echo "    ✓ Nginx перезагружен"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Деплой завершён успешно!"
echo "🔥 Сайт: https://briket-berry.ru"
echo ""
pm2 status
