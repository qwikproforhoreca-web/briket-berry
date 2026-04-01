# Задача 13: Безопасность и валидация

## Статус: ✅ Выполнено

---

## HTTP Заголовки безопасности (Helmet)

```typescript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://www.google.com", "https://www.gstatic.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      mediaSrc: ["'self'", "https:"],
      connectSrc: ["'self'", "https://api.yookassa.ru"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}))
```

---

## CORS настройка

```typescript
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400, // 24 часа preflight cache
}))
```

---

## Rate Limiting

```typescript
// Общий лимит
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100,
  message: { error: { code: 'RATE_LIMIT', message: 'Слишком много запросов' } }
})

// Форма заявки (строже)
const orderLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 час
  max: 5,
  skipSuccessfulRequests: false,
})

// Вход в admin (строго)
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true, // успешные входы не считаем
})

// AI чат
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
})
```

---

## Валидация входных данных

### Телефон
```typescript
const phoneSchema = z.string()
  .transform(s => s.replace(/\D/g, ''))
  .refine(s => s.length === 11 && (s.startsWith('7') || s.startsWith('8')),
    'Неверный формат российского телефона')
  .transform(s => '+7' + s.slice(-10))
```

### Email
```typescript
const emailSchema = z.string().email().toLowerCase().trim()
```

### ИНН
```typescript
const innSchema = z.string()
  .regex(/^\d{10}(\d{2})?$/, 'ИНН должен содержать 10 или 12 цифр')
  .refine(validateInnChecksum, 'Неверная контрольная сумма ИНН')
```

### Текстовые поля
```typescript
const textFieldSchema = z.string()
  .trim()
  .transform(s => sanitizeHtml(s, { allowedTags: [], allowedAttributes: {} }))
```

### Файлы
```typescript
const fileSchema = {
  video: {
    maxSize: 100 * 1024 * 1024, // 100 MB
    mimeTypes: ['video/mp4', 'video/webm'],
    validateMagicBytes: true, // проверка реального типа файла
  },
  image: {
    maxSize: 5 * 1024 * 1024, // 5 MB
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    validateMagicBytes: true,
  }
}
```

---

## SQL Injection защита

Prisma автоматически использует prepared statements. Никаких raw SQL запросов с пользовательскими данными без параметризации.

```typescript
// ✅ Безопасно — через Prisma
const order = await prisma.order.findFirst({
  where: { phone: userPhone } // параметризованный запрос
})

// ❌ Запрещено — raw SQL с конкатенацией
await prisma.$queryRaw`SELECT * FROM orders WHERE phone = '${userPhone}'`
// ✅ Если raw SQL — только через параметры:
await prisma.$queryRaw`SELECT * FROM orders WHERE phone = ${userPhone}`
```

---

## XSS защита

```typescript
import sanitizeHtml from 'sanitize-html'

function sanitizeUserInput(input: string): string {
  return sanitizeHtml(input, {
    allowedTags: [], // никаких HTML тегов
    allowedAttributes: {},
    disallowedTagsMode: 'discard',
  })
}

// Применяется ко всем строковым полям в middleware
app.use(sanitizeRequestBody)
```

---

## Аутентификация Admin (JWT)

```typescript
// Генерация токена
const token = jwt.sign(
  { id: admin.id, email: admin.email, role: admin.role },
  process.env.JWT_SECRET!,
  { expiresIn: '7d', algorithm: 'HS256' }
)

// httpOnly cookie (защита от XSS)
res.cookie('admin_token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,
})
```

---

## Защита загрузки файлов

```typescript
// Проверка magic bytes (реальный тип файла)
import { fileTypeFromBuffer } from 'file-type'

async function validateFileType(buffer: Buffer, allowedTypes: string[]): Promise<boolean> {
  const fileType = await fileTypeFromBuffer(buffer)
  return fileType ? allowedTypes.includes(fileType.mime) : false
}

// Sanitize filename
function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/\.{2,}/g, '_')
    .slice(0, 100)
}
```

---

## Honeypot защита от ботов

```typescript
// В форме — скрытое поле (CSS: display: none)
// Пользователи не видят, боты заполняют
<input type="text" name="website" style={{display: 'none'}} />

// Backend проверка
if (req.body.website) {
  // Это бот — тихо отклоняем
  return res.status(200).json({ success: true }) // имитируем успех
}
```

---

## Логирование подозрительной активности

```typescript
// Логировать:
// - Множественные неудачные попытки входа
// - Rate limit срабатывания
// - Необычно большие запросы
// - SQL injection попытки
// - XSS попытки в полях

logger.warn('Suspicious activity', {
  ip: req.ip,
  userAgent: req.headers['user-agent'],
  path: req.path,
  body: req.body,
  type: 'RATE_LIMIT_HIT'
})
```

---

## Checklist безопасности

- [x] Helmet (HTTP security headers)
- [x] CORS настроен
- [x] Rate limiting (3 уровня)
- [x] Zod валидация всех форм
- [x] Sanitize HTML в текстовых полях
- [x] SQL Injection защита (Prisma)
- [x] XSS защита
- [x] JWT в httpOnly cookie
- [x] Bcrypt rounds 12
- [x] File upload: magic bytes + whitelist MIME
- [x] Honeypot поле
- [x] reCAPTCHA v3
- [x] HTTPS обязателен в production
- [x] Логирование подозрительной активности
- [x] Environment variables (нет секретов в коде)
