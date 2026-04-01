#!/bin/bash
# ─────────────────────────────────────────────────────
#  Первоначальная настройка VPS Cloudbell
#  ОС: Ubuntu 22.04 LTS
#  Домен: briket-berry.ru
#  Запускать как root: bash server-setup.sh
# ─────────────────────────────────────────────────────
set -e

echo "🚀 Настройка сервера Cloudbell для Брикет-Бери..."
echo ""

# ── 1. Обновление системы ─────────────────────────────
echo "[1/9] Обновление системы..."
apt-get update -qq && apt-get upgrade -y -qq
apt-get install -y -qq curl wget git unzip build-essential

# ── 2. Node.js 20 LTS ────────────────────────────────
echo "[2/9] Установка Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash - -qq
apt-get install -y -qq nodejs
echo "    Node: $(node -v), npm: $(npm -v)"

# ── 3. PostgreSQL 16 ─────────────────────────────────
echo "[3/9] Установка PostgreSQL..."
apt-get install -y -qq postgresql postgresql-contrib
systemctl enable --now postgresql

# Создать БД и пользователя
DB_PASS=$(openssl rand -base64 24)
sudo -u postgres psql <<SQL
CREATE USER briket_user WITH PASSWORD '$DB_PASS';
CREATE DATABASE briket_berry OWNER briket_user;
GRANT ALL PRIVILEGES ON DATABASE briket_berry TO briket_user;
\q
SQL

echo "    ✓ БД создана"
echo "    DATABASE_URL=postgresql://briket_user:$DB_PASS@localhost:5432/briket_berry"
echo "    ⚠️  Сохраните строку DATABASE_URL выше!"

# ── 4. Nginx ─────────────────────────────────────────
echo "[4/9] Установка Nginx..."
apt-get install -y -qq nginx
systemctl enable --now nginx

# ── 5. Certbot (SSL) ─────────────────────────────────
echo "[5/9] Установка Certbot (SSL)..."
apt-get install -y -qq certbot python3-certbot-nginx

# ── 6. PM2 ───────────────────────────────────────────
echo "[6/9] Установка PM2..."
npm install -g pm2 --quiet
pm2 startup systemd -u www-data --hp /var/www

# ── 7. Директории проекта ────────────────────────────
echo "[7/9] Создание структуры директорий..."
mkdir -p /var/www/briket-berry
mkdir -p /var/www/briket-berry/backend/uploads/{videos,images,reviews}
mkdir -p /var/log/pm2
chown -R www-data:www-data /var/www/briket-berry
chown -R www-data:www-data /var/log/pm2

# ── 8. Nginx site ─────────────────────────────────────
echo "[8/9] Настройка Nginx..."
# Удаляем дефолтный сайт
rm -f /etc/nginx/sites-enabled/default

# Создаём временный конфиг (до клонирования репо)
cat > /etc/nginx/sites-available/briket-berry <<'NGINX'
server {
    listen 80;
    server_name briket-berry.ru www.briket-berry.ru;
    root /var/www/briket-berry/frontend/dist;
    location / { try_files $uri $uri/ /index.html; }
}
NGINX

ln -sf /etc/nginx/sites-available/briket-berry /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# ── 9. UFW Firewall ───────────────────────────────────
echo "[9/9] Настройка файрволла..."
apt-get install -y -qq ufw
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
echo "y" | ufw enable

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Сервер настроен!"
echo ""
echo "📋 СЛЕДУЮЩИЕ ШАГИ:"
echo ""
echo "1. Клонировать репозиторий:"
echo "   cd /var/www/briket-berry"
echo "   git clone https://github.com/YOUR/REPO.git ."
echo ""
echo "2. Создать .env файл:"
echo "   cp backend/.env.example backend/.env"
echo "   nano backend/.env"
echo "   # Вставьте DATABASE_URL от шага 3 выше"
echo "   # Вставьте OPENAI_API_KEY"
echo "   # Смените JWT_SECRET на случайную строку"
echo ""
echo "3. Скопировать nginx конфиг из репо:"
echo "   cp deploy/nginx.conf /etc/nginx/sites-available/briket-berry"
echo ""
echo "4. Получить SSL сертификат:"
echo "   certbot --nginx -d briket-berry.ru -d www.briket-berry.ru"
echo ""
echo "5. Запустить деплой:"
echo "   bash deploy/deploy.sh"
echo ""
echo "6. Засеять начальные данные:"
echo "   cd backend && ./node_modules/.bin/ts-node prisma/seed.ts"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
