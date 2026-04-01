# Задача 09: База данных

## Статус: ✅ Выполнено

---

## Технологии
- **PostgreSQL 15+** — СУБД
- **Prisma 5** — ORM
- **Hosting**: Reg.ru PostgreSQL или Railway

---

## Схема базы данных (Prisma)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Администраторы системы
model Admin {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  name      String
  role      AdminRole @default(MANAGER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("admins")
}

enum AdminRole {
  SUPER_ADMIN
  MANAGER
}

// Продукты
model Product {
  id          String   @id @default(uuid())
  slug        String   @unique
  name        String
  description String   @db.Text
  shortDesc   String
  price       Decimal  @db.Decimal(10, 2)
  priceWholesale Decimal? @db.Decimal(10, 2)
  wholesaleMinQty Int  @default(1)
  weight      Float    // кг
  sku         String   @unique
  inStock     Boolean  @default(true)
  featured    Boolean  @default(false)
  images      String[] // URLs
  category    ProductCategory
  specs       Json     // характеристики
  sortOrder   Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  orderItems  OrderItem[]

  @@map("products")
}

enum ProductCategory {
  BRIQUETTES
  FIRESTARTERS
  ACCESSORIES
}

// Заявки (заказы)
model Order {
  id             String      @id @default(uuid())
  orderNumber    String      @unique @default(cuid())
  status         OrderStatus @default(PENDING)
  paymentMethod  PaymentMethod
  
  // Контактные данные
  name           String
  phone          String
  email          String?
  establishment  String
  establishmentType EstablishmentType
  city           String
  comment        String?     @db.Text
  
  // Для юрлиц (счёт)
  inn            String?
  organizationName String?
  directorName   String?
  legalAddress   String?
  
  // Финансы
  subtotal       Decimal     @db.Decimal(10, 2)
  discountAmount Decimal     @default(0) @db.Decimal(10, 2)
  totalAmount    Decimal     @db.Decimal(10, 2)
  
  // Метаданные
  ipAddress      String?
  userAgent      String?
  source         String?     // UTM source
  
  items          OrderItem[]
  payment        Payment?
  
  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt

  @@map("orders")
}

enum OrderStatus {
  PENDING
  PENDING_PAYMENT
  PAID
  AWAITING_INVOICE
  INVOICE_SENT
  CONFIRMED
  IN_DELIVERY
  DELIVERED
  CANCELLED
}

enum PaymentMethod {
  ONLINE
  INVOICE
}

enum EstablishmentType {
  RESTAURANT
  CAFE
  SHAWARMA
  DELIVERY
  OTHER
}

// Позиции заказа
model OrderItem {
  id        String  @id @default(uuid())
  orderId   String
  productId String
  quantity  Int
  price     Decimal @db.Decimal(10, 2)
  subtotal  Decimal @db.Decimal(10, 2)
  
  order     Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product   Product @relation(fields: [productId], references: [id])

  @@map("order_items")
}

// Платежи ЮКасса
model Payment {
  id              String        @id @default(uuid())
  orderId         String        @unique
  yookassaId      String?       @unique
  status          PaymentStatus @default(PENDING)
  amount          Decimal       @db.Decimal(10, 2)
  currency        String        @default("RUB")
  confirmationUrl String?
  paidAt          DateTime?
  metadata        Json?
  
  order           Order         @relation(fields: [orderId], references: [id])
  
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  @@map("payments")
}

enum PaymentStatus {
  PENDING
  WAITING_FOR_CAPTURE
  SUCCEEDED
  CANCELLED
  REFUNDED
}

// Отзывы
model Review {
  id          String   @id @default(uuid())
  name        String
  position    String
  company     String
  city        String
  rating      Int      @default(5)  // 1-5
  text        String   @db.Text
  photo       String?  // URL фото
  published   Boolean  @default(false)
  featured    Boolean  @default(false)  // показывать на главной
  verified    Boolean  @default(false)  // верифицирован
  sortOrder   Int      @default(0)
  publishedAt DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("reviews")
}

// Настройки системы
model Setting {
  key       String   @id
  value     String   @db.Text
  type      SettingType @default(STRING)
  label     String
  group     String   @default("general")
  updatedAt DateTime @updatedAt

  @@map("settings")
}

enum SettingType {
  STRING
  NUMBER
  BOOLEAN
  JSON
  TEXT
  URL
}

// Контактные формы (простые обращения)
model Contact {
  id        String   @id @default(uuid())
  name      String
  phone     String
  email     String?
  message   String?  @db.Text
  source    String?  // страница, с которой отправлено
  status    ContactStatus @default(NEW)
  ipAddress String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("contacts")
}

enum ContactStatus {
  NEW
  IN_PROGRESS
  RESOLVED
  SPAM
}
```

---

## Seed данные (начальные данные)

### Продукты (seed)
1. Pini Kay 10 кг — 890 ₽ (опт от 750 ₽, от 20 шт)
2. Pini Kay 20 кг — 1590 ₽ (опт от 1350 ₽, от 10 шт)
3. Розжиг парафиновый 8 шт — 120 ₽
4. Розжиг парафиновый 24 шт — 320 ₽
5. Розжиг парафиновый 48 шт — 580 ₽

### Отзывы (seed)
6 отзывов из task-06-reviews.md

### Настройки (seed)
```
site.name = "Charcoal Shop"
site.phone = "+7 (900) 000-00-00"
site.email = "info@charcoal-shop.ru"
site.address = "Москва"
site.whatsapp = "+7 (900) 000-00-00"
site.telegram = "@charcoal_shop"
hero.videoUrl = "/videos/charcoal-bg.mp4"
tutorial.videoUrl = "/videos/tutorial.mp4"
ai.enabled = "false"
ai.systemPrompt = "..."
seo.title = "Ugolnye brikety Pini Kay..."
seo.description = "..."
```

### Admin (seed)
```
email: admin@charcoal-shop.ru
password: (из .env ADMIN_PASSWORD)
name: Администратор
role: SUPER_ADMIN
```

---

## Миграции

```bash
# Создать миграцию
npx prisma migrate dev --name init

# Применить в production
npx prisma migrate deploy

# Откат к последнему рабочему (пересоздать)
npx prisma migrate reset

# Просмотр статуса
npx prisma migrate status
```

---

## Индексы для производительности

```prisma
@@index([status])           // orders
@@index([createdAt])        // orders
@@index([phone])            // orders (поиск по телефону)
@@index([published, featured]) // reviews
@@index([category, inStock])   // products
```

---

## Чеклист выполнения

- [x] Полная схема Prisma
- [x] Все модели и связи
- [x] Enum типы
- [x] Seed файл с начальными данными
- [x] Индексы
- [x] Документация по миграциям
