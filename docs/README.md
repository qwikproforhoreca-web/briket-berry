# 🔥 Charcoal Shop — Документация проекта

> Премиальный B2B сайт по продаже угольных брикетов Pini Kay для ресторанов, кафе, шаурмичных и хосперов

---

## 📋 Список задач (этапы разработки)

| № | Задача | Статус | Файл |
|---|--------|--------|------|
| 01 | Настройка проекта и инфраструктуры | ✅ | [task-01-project-setup.md](./tasks/task-01-project-setup.md) |
| 02 | Главная страница (Hero + Video BG) | ✅ | [task-02-home-page.md](./tasks/task-02-home-page.md) |
| 03 | Страница продуктов | ✅ | [task-03-products-page.md](./tasks/task-03-products-page.md) |
| 04 | Страница «Как использовать» | ✅ | [task-04-how-to-use-page.md](./tasks/task-04-how-to-use-page.md) |
| 05 | Страница сравнения | ✅ | [task-05-comparison-page.md](./tasks/task-05-comparison-page.md) |
| 06 | Отзывы клиентов | ✅ | [task-06-reviews.md](./tasks/task-06-reviews.md) |
| 07 | Форма заявки и оплата | ✅ | [task-07-order-form.md](./tasks/task-07-order-form.md) |
| 08 | Backend API (Express + TypeScript) | ✅ | [task-08-backend-api.md](./tasks/task-08-backend-api.md) |
| 09 | База данных (PostgreSQL + Prisma) | ✅ | [task-09-database.md](./tasks/task-09-database.md) |
| 10 | Админ-панель / CRM | ✅ | [task-10-admin-panel.md](./tasks/task-10-admin-panel.md) |
| 11 | Интеграция оплаты ЮКасса | ✅ | [task-11-payment-integration.md](./tasks/task-11-payment-integration.md) |
| 12 | SEO оптимизация | ✅ | [task-12-seo.md](./tasks/task-12-seo.md) |
| 13 | Безопасность и валидация | ✅ | [task-13-security.md](./tasks/task-13-security.md) |
| 14 | ИИ-консультант | ✅ | [task-14-ai-consultant.md](./tasks/task-14-ai-consultant.md) |
| 15 | Деплой на Рег.ру | ✅ | [task-15-deployment.md](./tasks/task-15-deployment.md) |

---

## 🏗️ Архитектура проекта

```
charcoal-shop/
├── docs/                          # Документация
│   ├── README.md                  # Этот файл
│   └── tasks/                     # Задачи по разработке
├── frontend/                      # React + TypeScript + Vite
│   ├── public/
│   │   ├── videos/                # Фоновое видео
│   │   └── images/                # Статичные изображения
│   ├── src/
│   │   ├── components/            # UI компоненты
│   │   │   ├── layout/            # Header, Footer, Layout
│   │   │   ├── home/              # Секции главной
│   │   │   ├── products/          # Карточки продуктов
│   │   │   ├── reviews/           # Отзывы
│   │   │   ├── order/             # Форма заявки
│   │   │   └── ui/                # Базовые UI элементы
│   │   ├── pages/                 # Страницы приложения
│   │   ├── hooks/                 # Custom React hooks
│   │   ├── store/                 # Zustand state management
│   │   ├── types/                 # TypeScript типы
│   │   ├── utils/                 # Утилиты
│   │   └── styles/                # Глобальные стили
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   └── tsconfig.json
└── backend/                       # Node.js + TypeScript + Express
    ├── src/
    │   ├── routes/                # API маршруты
    │   ├── controllers/           # Контроллеры
    │   ├── services/              # Бизнес-логика
    │   ├── middleware/            # Middleware
    │   ├── utils/                 # Утилиты
    │   └── types/                 # TypeScript типы
    ├── prisma/
    │   ├── schema.prisma          # Схема БД
    │   └── seed.ts                # Начальные данные
    ├── package.json
    └── tsconfig.json
```

---

## 🛠️ Технологический стек

### Frontend
- **React 18** + **TypeScript** — основной фреймворк
- **Vite** — сборщик
- **Tailwind CSS** — стилизация
- **Framer Motion** — анимации
- **GSAP** — продвинутые анимации
- **React Router v6** — маршрутизация
- **Zustand** — управление состоянием
- **React Hook Form** + **Zod** — формы и валидация
- **React Query (TanStack)** — кэширование запросов
- **React Helmet Async** — SEO мета-теги

### Backend
- **Node.js** + **TypeScript** + **Express** — сервер
- **Prisma** — ORM
- **PostgreSQL** — база данных
- **JWT** — аутентификация
- **Bcrypt** — хэширование паролей
- **Zod** — валидация входных данных
- **Multer** — загрузка файлов
- **Helmet** — HTTP заголовки безопасности
- **Rate Limiter** — ограничение запросов
- **YooKassa SDK** — оплата
- **Nodemailer** — email уведомления

---

## 🔄 Откат к рабочему коду

Каждый этап разработки коммитится отдельно. Для отката:

```bash
# Посмотреть историю коммитов
git log --oneline

# Откатиться к конкретному коммиту
git checkout <commit-hash>

# Или создать новую ветку от коммита
git checkout -b hotfix/<branch-name> <commit-hash>
```

### Именование коммитов
```
feat(setup): initial project setup
feat(home): hero section with video background
feat(products): product catalog page
feat(reviews): customer reviews section
feat(order): order form with payment options
feat(backend): REST API endpoints
feat(db): database schema and migrations
feat(admin): admin panel CRM
feat(payment): yookassa integration
feat(seo): meta tags and structured data
feat(security): input validation and rate limiting
feat(ai): AI consultant integration
feat(deploy): deployment configuration
```

---

## 🌐 Страницы сайта

| Маршрут | Страница | Описание |
|---------|----------|----------|
| `/` | Главная | Hero + видео + преимущества + статистика |
| `/products` | Продукты | Каталог брикетов и розжига |
| `/how-to-use` | Как использовать | Пошаговое руководство + видео |
| `/comparison` | Сравнение | Pini Kay vs обычный уголь |
| `/reviews` | Отзывы | Отзывы клиентов с фото |
| `/order` | Заявка | Форма заказа + выбор оплаты |
| `/admin` | Админ-панель | CRM (защищено) |
| `/admin/orders` | Заявки | Управление заявками |
| `/admin/products` | Продукты | Редактирование каталога |
| `/admin/reviews` | Отзывы | Модерация отзывов |
| `/admin/settings` | Настройки | Видео, ИИ, контакты |

---

## 📞 Контактные данные (заглушка для CMS)

- **Телефон**: +7 (XXX) XXX-XX-XX
- **WhatsApp**: +7 (XXX) XXX-XX-XX
- **Email**: info@charcoal-shop.ru
- **Адрес**: Москва, ул. Примерная, д. 1

---

## 🚀 Быстрый старт

```bash
# Клонировать репозиторий
git clone <repo-url>
cd charcoal-shop

# Запустить backend
cd backend
npm install
cp .env.example .env  # заполнить переменные окружения
npx prisma migrate dev
npm run dev

# Запустить frontend (в другом терминале)
cd frontend
npm install
npm run dev
```

---

*Последнее обновление: апрель 2026*
