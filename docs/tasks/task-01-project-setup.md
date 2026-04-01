# Задача 01: Настройка проекта и инфраструктуры

## Статус: ✅ Выполнено

## Описание
Инициализация монорепозитория, настройка зависимостей, конфигурация TypeScript, Tailwind CSS, ESLint, Prettier.

---

## Frontend (React + TypeScript + Vite)

### Установка зависимостей
```bash
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install

# Стилизация
npm install tailwindcss @tailwindcss/forms @tailwindcss/typography postcss autoprefixer
npx tailwindcss init -p

# Анимации
npm install framer-motion gsap @gsap/react

# Маршрутизация
npm install react-router-dom

# Состояние
npm install zustand

# Формы и валидация
npm install react-hook-form zod @hookform/resolvers

# Запросы к API
npm install @tanstack/react-query axios

# SEO
npm install react-helmet-async

# UI иконки
npm install lucide-react

# Утилиты
npm install clsx tailwind-merge date-fns

# Dev зависимости
npm install -D @types/node prettier eslint-config-prettier
```

### `vite.config.ts`
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          animation: ['framer-motion', 'gsap'],
          query: ['@tanstack/react-query', 'axios'],
        },
      },
    },
  },
})
```

### `tailwind.config.ts`
```typescript
import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: '#FF6B2B',
          'orange-dark': '#E85520',
          'orange-light': '#FF8C5A',
          red: '#CC2200',
          black: '#0A0A0A',
          'dark': '#111111',
          'dark-2': '#1A1A1A',
          'gray': '#2A2A2A',
          'gray-light': '#444444',
          gold: '#D4A017',
          'gold-light': '#F0C040',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Montserrat', 'system-ui', 'sans-serif'],
      },
      animation: {
        'flame': 'flame 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'spark': 'spark 1.5s ease-out infinite',
        'counter': 'counter 0.5s ease-out',
      },
      keyframes: {
        flame: {
          '0%, 100%': { transform: 'scaleY(1) rotate(-2deg)' },
          '50%': { transform: 'scaleY(1.1) rotate(2deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 107, 43, 0.5)' },
          '50%': { boxShadow: '0 0 40px rgba(255, 107, 43, 0.9)' },
        },
        spark: {
          '0%': { transform: 'translateY(0) scale(1)', opacity: '1' },
          '100%': { transform: 'translateY(-100px) scale(0)', opacity: '0' },
        },
      },
      backgroundImage: {
        'fire-gradient': 'linear-gradient(180deg, #1a0500 0%, #0A0A0A 100%)',
        'ember-gradient': 'radial-gradient(ellipse at center, #FF6B2B 0%, #CC2200 50%, #0A0A0A 100%)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
} satisfies Config
```

---

## Backend (Node.js + TypeScript + Express)

### Установка зависимостей
```bash
mkdir backend && cd backend
npm init -y

# Основное
npm install express cors helmet morgan compression
npm install @prisma/client
npm install jsonwebtoken bcryptjs
npm install zod
npm install multer
npm install nodemailer
npm install express-rate-limit
npm install uuid
npm install dotenv

# YooKassa
npm install yookassa

# Dev зависимости
npm install -D typescript ts-node nodemon
npm install -D @types/express @types/cors @types/morgan
npm install -D @types/jsonwebtoken @types/bcryptjs
npm install -D @types/multer @types/nodemailer @types/uuid @types/node
npm install -D prisma
```

### `tsconfig.json` (backend)
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

## Переменные окружения

### `.env.example` (backend)
```env
# Server
NODE_ENV=development
PORT=5000
API_URL=http://localhost:5000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/charcoal_shop

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Admin
ADMIN_EMAIL=admin@charcoal-shop.ru
ADMIN_PASSWORD=SecureAdminPassword123!

# YooKassa
YOOKASSA_SHOP_ID=your-shop-id
YOOKASSA_SECRET_KEY=your-secret-key
YOOKASSA_RETURN_URL=https://charcoal-shop.ru/order/success

# Email (SMTP)
SMTP_HOST=smtp.mail.ru
SMTP_PORT=465
SMTP_USER=info@charcoal-shop.ru
SMTP_PASS=your-email-password
NOTIFICATION_EMAIL=orders@charcoal-shop.ru

# File Upload
MAX_FILE_SIZE=104857600  # 100MB
UPLOAD_PATH=./uploads

# OpenAI (для ИИ-консультанта)
OPENAI_API_KEY=your-openai-key
AI_MODEL=gpt-4o-mini

# CORS
ALLOWED_ORIGINS=http://localhost:3000,https://charcoal-shop.ru

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 минут
RATE_LIMIT_MAX=100
```

---

## Структура папок (создать командами)

```bash
# Backend структура
mkdir -p backend/src/{routes,controllers,services,middleware,utils,types}
mkdir -p backend/prisma
mkdir -p backend/uploads/{videos,images,reviews}

# Frontend структура
mkdir -p frontend/src/{components/{layout,home,products,reviews,order,admin,ui},pages,hooks,store,types,utils,styles}
mkdir -p frontend/public/{videos,images}
```

---

## Git инициализация

```bash
cd charcoal-shop
git init
git add .
git commit -m "feat(setup): initial project setup"
```

### `.gitignore`
```
node_modules/
dist/
build/
.env
.env.local
uploads/
*.log
.DS_Store
```

---

## Чеклист выполнения

- [x] Инициализирован монорепозиторий
- [x] Настроен Vite + React + TypeScript (frontend)
- [x] Настроен Express + TypeScript (backend)
- [x] Настроен Tailwind CSS с кастомной темой
- [x] Добавлены все зависимости
- [x] Созданы `.env.example` файлы
- [x] Настроен Git с правильными коммитами
- [x] Создана структура папок
