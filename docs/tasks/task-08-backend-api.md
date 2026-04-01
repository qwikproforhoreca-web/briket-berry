# Задача 08: Backend API

## Статус: ✅ Выполнено

---

## API маршруты

### Orders API
```
POST   /api/v1/orders              — Создать заявку
GET    /api/v1/orders              — Список заявок (admin)
GET    /api/v1/orders/:id          — Заявка по ID (admin)
PATCH  /api/v1/orders/:id/status   — Обновить статус (admin)
DELETE /api/v1/orders/:id          — Удалить заявку (admin)
GET    /api/v1/orders/export       — Экспорт CSV (admin)
```

### Products API
```
GET    /api/v1/products            — Список продуктов
GET    /api/v1/products/:id        — Продукт по ID
POST   /api/v1/products            — Создать продукт (admin)
PUT    /api/v1/products/:id        — Обновить продукт (admin)
DELETE /api/v1/products/:id        — Удалить продукт (admin)
```

### Reviews API
```
GET    /api/v1/reviews             — Публичные отзывы
GET    /api/v1/reviews/all         — Все отзывы (admin)
POST   /api/v1/reviews             — Создать отзыв (admin)
PUT    /api/v1/reviews/:id         — Обновить отзыв (admin)
DELETE /api/v1/reviews/:id         — Удалить отзыв (admin)
PATCH  /api/v1/reviews/:id/publish — Опубликовать отзыв (admin)
```

### Payment API
```
POST   /api/v1/payment/create      — Создать платёж ЮКасса
POST   /api/v1/payment/webhook     — Webhook ЮКасса
GET    /api/v1/payment/:id/status  — Статус платежа
POST   /api/v1/payment/invoice     — Создать счёт
```

### Upload API
```
POST   /api/v1/upload/video        — Загрузить видео (admin)
POST   /api/v1/upload/image        — Загрузить изображение (admin)
DELETE /api/v1/upload/:filename    — Удалить файл (admin)
```

### Admin API
```
POST   /api/v1/admin/login         — Вход в систему
POST   /api/v1/admin/logout        — Выход
GET    /api/v1/admin/me            — Текущий пользователь
PUT    /api/v1/admin/password      — Сменить пароль
GET    /api/v1/admin/stats         — Статистика дашборда
```

### Settings API
```
GET    /api/v1/settings            — Публичные настройки
GET    /api/v1/settings/all        — Все настройки (admin)
PUT    /api/v1/settings/:key       — Обновить настройку (admin)
```

### AI Consultant API
```
POST   /api/v1/ai/chat             — Отправить сообщение
GET    /api/v1/ai/config           — Получить конфиг (admin)
PUT    /api/v1/ai/config           — Обновить конфиг (admin)
```

---

## Middleware

### authMiddleware.ts
```typescript
// Проверка JWT токена
// Устанавливает req.user = { id, email, role }
```

### rateLimiter.ts
```typescript
// Общий: 100 req / 15 min
// Форма заявки: 5 req / 1 hour (per IP)
// Вход admin: 10 req / 1 hour (per IP)
// AI чат: 30 req / 1 hour (per IP)
```

### validateMiddleware.ts
```typescript
// Принимает Zod схему, валидирует req.body
// В случае ошибки возвращает 422 + список ошибок
```

### uploadMiddleware.ts
```typescript
// Multer конфигурация
// Ограничение по размеру (видео: 100MB, фото: 5MB)
// Проверка MIME типов
```

### sanitizeMiddleware.ts
```typescript
// Очистка всех строковых полей от HTML/XSS
```

---

## Структура ответов API

### Успешный ответ
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### Ошибка
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Ошибка валидации данных",
    "details": [
      { "field": "phone", "message": "Неверный формат телефона" }
    ]
  }
}
```

---

## Коды ошибок

| Код | HTTP | Описание |
|-----|------|----------|
| `VALIDATION_ERROR` | 422 | Ошибка валидации |
| `NOT_FOUND` | 404 | Ресурс не найден |
| `UNAUTHORIZED` | 401 | Не авторизован |
| `FORBIDDEN` | 403 | Нет доступа |
| `RATE_LIMIT` | 429 | Слишком много запросов |
| `PAYMENT_ERROR` | 400 | Ошибка платежа |
| `INTERNAL_ERROR` | 500 | Внутренняя ошибка |
| `DUPLICATE` | 409 | Дублирование данных |

---

## Статусы заявок

```typescript
enum OrderStatus {
  PENDING = 'pending',                    // Новая заявка
  PENDING_PAYMENT = 'pending_payment',    // Ожидает оплаты
  PAID = 'paid',                          // Оплачено
  AWAITING_INVOICE = 'awaiting_invoice',  // Ожидает счёт
  INVOICE_SENT = 'invoice_sent',          // Счёт отправлен
  CONFIRMED = 'confirmed',                // Подтверждено менеджером
  IN_DELIVERY = 'in_delivery',            // В доставке
  DELIVERED = 'delivered',                // Доставлено
  CANCELLED = 'cancelled',                // Отменено
}
```

---

## Безопасность

1. **Helmet** — HTTP security headers
2. **CORS** — только разрешённые origins
3. **Rate Limiting** — express-rate-limit
4. **JWT** — срок жизни 7 дней, refresh не нужен (admin use)
5. **Bcrypt** — rounds: 12 для паролей
6. **Zod** — строгая валидация всех входящих данных
7. **SQL Injection** — защита через Prisma ORM (prepared statements)
8. **XSS** — sanitize-html для пользовательского ввода
9. **File Upload** — проверка MIME типа через magic bytes
10. **Webhook** — верификация подписи ЮКасса

---

## Логирование

```typescript
// Morgan для HTTP логов
// Winston для приложения
// Уровни: error, warn, info, debug
// Формат: JSON (production), pretty (development)
// Ротация: ежедневно, хранение 30 дней
```

---

## Чеклист выполнения

- [x] Все API маршруты реализованы
- [x] Middleware (auth, rate limit, validate, sanitize)
- [x] Стандартизированные ответы
- [x] Обработка ошибок
- [x] Логирование
- [x] Безопасность
- [x] Документация Swagger/OpenAPI
