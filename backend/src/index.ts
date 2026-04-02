import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config()

import { prisma } from './utils/prisma'
import { generalLimiter } from './middleware/rateLimiter'
import ordersRouter from './routes/orders'
import productsRouter from './routes/products'
import reviewsRouter from './routes/reviews'
import paymentRouter from './routes/payment'
import adminRouter from './routes/admin'
import settingsRouter from './routes/settings'
import uploadRouter from './routes/upload'
import aiRouter from './routes/ai'

const app = express()
const PORT = process.env.PORT || 5000

// Trust Railway/Nginx proxy
app.set('trust proxy', 1)

// Security
app.use(helmet({
  contentSecurityPolicy: false, // configured separately for prod
}))

// CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:3000',
  'http://localhost:5173',
]
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

// Body parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(cookieParser())

// Compression & logging
app.use(compression())
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))
}

// Rate limiting
app.use('/api/', generalLimiter)

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')))

// Routes
app.use('/api/v1/orders', ordersRouter)
app.use('/api/v1/products', productsRouter)
app.use('/api/v1/reviews', reviewsRouter)
app.use('/api/v1/payment', paymentRouter)
app.use('/api/v1/admin', adminRouter)
app.use('/api/v1/settings', settingsRouter)
app.use('/api/v1/upload', uploadRouter)
app.use('/api/v1/ai', aiRouter)

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// 404
app.use((_req, res) => {
  res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Маршрут не найден' } })
})

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err)
  res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_ERROR', message: 'Внутренняя ошибка сервера' },
  })
})

async function initAdmin() {
  try {
    const email = process.env.ADMIN_EMAIL || 'admin@briket-berry.ru'
    const password = process.env.ADMIN_PASSWORD || 'Admin123!'
    const bcrypt = await import('bcryptjs')
    const hash = await bcrypt.hash(password, 10)
    await prisma.admin.upsert({
      where: { email },
      update: { password: hash },
      create: { email, password: hash, name: 'Администратор', role: 'SUPER_ADMIN' },
    })
    console.log(`✅ Admin ready: ${email}`)
  } catch (e) {
    console.warn('⚠️ Could not init admin (DB not ready yet):', (e as Error).message)
  }
}

async function initDefaultProducts() {
  try {
    // Базовые товары, чтобы сайт и админка совпадали даже сразу после развертывания.
    // Если у вас будут другие товары — их можно управлять в админке (создание/редактирование).
    const defaults = [
      {
        sku: 'PKB-10',
        slug: 'pini-kay-10',
        category: 'BRIQUETTES',
        name: 'Угольные брикеты Pini Kay',
        shortDesc: '10 кг — 1 ящик',
        description:
          'Профессиональные угольные брикеты для хосперов, мангалов и гриль-печей. Берёзовая древесина без химических добавок.',
        price: 890,
        priceWholesale: 750,
        wholesaleMin: 20,
        weight: 10,
        inStock: true,
        featured: true,
        images: ['/images/pini-kay-10.jpg'],
        specs: {
          Вес: '10 кг',
          Форма: 'Шестигранник Pini Kay',
          'Время горения': 'До 8 часов',
          'Температура': '900°C+',
          'Зольность': '< 3%',
          'Влажность': '< 5%',
          'Применение': 'Хоспер, мангал, камадо, гриль',
        },
      },
      {
        sku: 'PFR-8',
        slug: 'firestarters-8',
        category: 'FIRESTARTERS',
        name: 'Парафиновый розжиг',
        shortDesc: '8 кубиков в упаковке',
        description:
          'Натуральный парафиновый розжиг без запаха. Поджигает уголь за 5-7 минут. Без химии.',
        price: 120,
        priceWholesale: 90,
        wholesaleMin: 50,
        weight: 8,
        inStock: true,
        featured: true,
        images: ['/images/firestarters-8.jpg'],
        specs: {
          Количество: '8 кубиков',
          'Время горения': '10 минут / кубик',
          'Состав': 'Парафин + прессованные опилки',
          'Запах': 'Отсутствует',
          'Применение': 'Уголь, камин, самовар, котёл',
        },
      },
    ] as const

    await Promise.all(
      defaults.map((p) =>
        prisma.product.upsert({
          where: { sku: p.sku },
          update: {
            slug: p.slug,
            name: p.name,
            description: p.description,
            shortDesc: p.shortDesc,
            price: p.price,
            ...(typeof p.priceWholesale === 'number' ? { priceWholesale: p.priceWholesale } : {}),
            wholesaleMin: p.wholesaleMin,
            weight: p.weight,
            category: p.category,
            inStock: p.inStock,
            featured: p.featured,
            images: [...p.images],
            specs: p.specs as any,
          },
          create: {
            slug: p.slug,
            sku: p.sku,
            category: p.category,
            name: p.name,
            shortDesc: p.shortDesc,
            description: p.description,
            price: p.price,
            ...(typeof p.priceWholesale === 'number' ? { priceWholesale: p.priceWholesale } : {}),
            wholesaleMin: p.wholesaleMin,
            weight: p.weight,
            inStock: p.inStock,
            featured: p.featured,
            images: [...p.images],
            specs: p.specs as any,
          },
        }),
      ),
    )
    console.log('✅ Default products ready')
  } catch (e) {
    console.warn('⚠️ Could not init default products (DB not ready yet):', (e as Error).message)
  }
}

app.listen(PORT, async () => {
  console.log(`🔥 Server running on http://localhost:${PORT}`)
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`)
  await initAdmin()
  await initDefaultProducts()
})

export default app
