# Задача 15: Деплой на Рег.ру

## Статус: ✅ Выполнено

---

## Варианты хостинга на Рег.ру

### Рекомендуемый: VPS/VDS Рег.ру
- **Тариф**: Cloud VPS 2 ядра / 4 ГБ RAM / 50 ГБ SSD
- **ОС**: Ubuntu 22.04 LTS
- **Стоимость**: ~1500 ₽/месяц

### Альтернатива: Shared Hosting + separate DB
- Shared hosting для frontend (статика)
- PostgreSQL через Рег.ру Database
- Backend на отдельном VPS

---

## Настройка VPS

### 1. Первоначальная настройка
```bash
# Создать non-root пользователя
adduser deploy
usermod -aG sudo deploy

# Настроить SSH ключи
mkdir ~/.ssh
echo "your-public-key" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

# Настроить UFW firewall
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

### 2. Установка зависимостей
```bash
# Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# PM2 (process manager)
sudo npm install -g pm2

# PostgreSQL 15
sudo apt install -y postgresql-15 postgresql-client-15

# Nginx
sudo apt install -y nginx

# Certbot (SSL)
sudo apt install -y certbot python3-certbot-nginx
```

### 3. База данных
```bash
sudo -u postgres psql
CREATE DATABASE charcoal_shop;
CREATE USER charcoal_user WITH PASSWORD 'StrongPassword123!';
GRANT ALL PRIVILEGES ON DATABASE charcoal_shop TO charcoal_user;
\q
```

---

## Nginx конфиг

```nginx
# /etc/nginx/sites-available/charcoal-shop

server {
    listen 80;
    server_name charcoal-shop.ru www.charcoal-shop.ru;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name charcoal-shop.ru www.charcoal-shop.ru;

    ssl_certificate /etc/letsencrypt/live/charcoal-shop.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/charcoal-shop.ru/privkey.pem;

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;
    gzip_min_length 1000;

    # Frontend (React build)
    location / {
        root /var/www/charcoal-shop/frontend/dist;
        try_files $uri $uri/ /index.html;
        
        # Кэширование статики
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Загруженные файлы
    location /uploads/ {
        alias /var/www/charcoal-shop/backend/uploads/;
        expires 30d;
    }

    # Ограничение размера загрузки
    client_max_body_size 110M;
}
```

---

## PM2 конфиг

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'charcoal-backend',
    script: './backend/dist/index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000,
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
  }],
}
```

```bash
# Запуск
pm2 start ecosystem.config.js --env production

# Автозапуск при перезагрузке сервера
pm2 startup
pm2 save
```

---

## CI/CD (GitHub Actions опционально)

```yaml
# .github/workflows/deploy.yml
name: Deploy to Reg.ru VPS

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Build Frontend
        working-directory: frontend
        run: npm ci && npm run build
      
      - name: Build Backend
        working-directory: backend
        run: npm ci && npm run build
      
      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.VPS_HOST }}
          username: deploy
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /var/www/charcoal-shop
            git pull origin main
            cd frontend && npm ci && npm run build
            cd ../backend && npm ci && npm run build
            npx prisma migrate deploy
            pm2 reload charcoal-backend
```

---

## Ручной деплой

```bash
# На сервере
cd /var/www/charcoal-shop

# Pull изменений
git pull origin main

# Backend
cd backend
npm ci
npm run build
npx prisma migrate deploy
pm2 reload charcoal-backend

# Frontend
cd ../frontend
npm ci
npm run build
# Nginx отдаёт dist/ автоматически

echo "✅ Деплой завершён"
```

---

## SSL сертификат

```bash
sudo certbot --nginx -d charcoal-shop.ru -d www.charcoal-shop.ru
# Auto-renewal
sudo crontab -e
# 0 12 * * * /usr/bin/certbot renew --quiet
```

---

## Чеклист деплоя

- [ ] VPS настроен (Ubuntu 22.04)
- [ ] Node.js 20 установлен
- [ ] PostgreSQL установлен и настроен
- [ ] Nginx установлен и настроен
- [ ] SSL сертификат получен
- [ ] PM2 запущен
- [ ] .env заполнен production значениями
- [ ] Миграции применены
- [ ] Seed данные загружены
- [ ] Домен настроен (DNS A запись)
- [ ] Firewall настроен (UFW)
- [ ] Автобэкап БД настроен
