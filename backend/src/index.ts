import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config()

import { prisma } from './utils/prisma'
import { generalLimiter } from './middleware/rateLimiter'
import ordersRouter from './routes/orders'
import clientsRouter from './routes/clients'
import productsRouter from './routes/products'
import reviewsRouter from './routes/reviews'
import paymentRouter from './routes/payment'
import adminRouter from './routes/admin'
import settingsRouter from './routes/settings'
import uploadRouter from './routes/upload'
import aiRouter from './routes/ai'
import { isOutboundNodeSmtpBlocked } from './utils/mailPolicy'
import { getMailWebhookDebug } from './utils/mailWebhook'

const app = express()
const PORT = process.env.PORT || 5000
const PRIMARY_HOST = 'www.briket-berry.ru'
const APEX_HOST = 'briket-berry.ru'
const SITE_URL = `https://${PRIMARY_HOST}`

type SeoMeta = {
  title: string
  description: string
  robots?: string
}

const SEO_META_BY_PATH: Record<string, SeoMeta> = {
  '/': {
    title: 'Угольные брикеты Pini Kay для ресторанов и кафе | Брикет-Бери',
    description: 'Профессиональные угольные брикеты Pini Kay: до 8 часов горения, высокая температура и поставки по России.',
  },
  '/products': {
    title: 'Купить угольные брикеты Pini Kay оптом | Брикет-Бери',
    description: 'Каталог брикетов и розжига Pini Kay для HoReCa: стабильный жар, чистое горение и оптовые поставки.',
  },
  '/firestarters': {
    title: 'Парафиновый розжиг для мангала и хоспера | Брикет-Бери',
    description: 'Парафиновый розжиг Pini Kay: быстрое и чистое воспламенение без запаха и лишнего дыма.',
  },
  '/how-to-use': {
    title: 'Как использовать брикеты Pini Kay | Брикет-Бери',
    description: 'Пошаговая инструкция по розжигу и работе с брикетами Pini Kay для хосперов и гриля.',
  },
  '/comparison': {
    title: 'Pini Kay vs обычный уголь — сравнение | Брикет-Бери',
    description: 'Сравнение Pini Kay с обычным углем по горению, температуре, расходу и экономике для заведений.',
  },
  '/reviews': {
    title: 'Отзывы клиентов об угольных брикетах Pini Kay | Брикет-Бери',
    description: 'Реальные отзывы и опыт заведений, использующих брикеты Pini Kay в профессиональной кухне.',
  },
  '/about': {
    title: 'О компании Брикет-Бери | Поставщик Pini Kay',
    description: 'Брикет-Бери — поставщик брикетов Pini Kay и розжига для ресторанов, кафе и гриль-заведений.',
  },
  '/prices': {
    title: 'Цены на брикеты и розжиг Pini Kay | Брикет-Бери',
    description: 'Актуальные цены и условия оптовых поставок брикетов Pini Kay и парафинового розжига.',
  },
  '/faq': {
    title: 'FAQ по брикетам Pini Kay | Брикет-Бери',
    description: 'Ответы на частые вопросы по хранению, розжигу и использованию брикетов Pini Kay.',
  },
  '/contacts': {
    title: 'Контакты Брикет-Бери | Поставки по России',
    description: 'Контакты и реквизиты продавца: ИП Чернышов Алексей Юрьевич, ИНН 262103392660. Поставки брикетов Pini Kay по России.',
  },
  '/blog': {
    title: 'Блог о брикетном угле и хосперах | Брикет-Бери',
    description: 'Экспертные статьи о выборе брикетов, работе с хоспером и снижении затрат кухни.',
  },
  '/order': {
    title: 'Оставить заявку на угольные брикеты | Брикет-Бери',
    description: 'Оформите заявку на брикеты Pini Kay и розжиг для ресторана, кафе или гриль-заведения.',
  },
  '/order/success': {
    title: 'Заявка принята | Брикет-Бери',
    description: 'Ваша заявка принята. Мы свяжемся с вами для подтверждения деталей поставки.',
    robots: 'noindex,nofollow',
  },
  '/privacy': {
    title: 'Политика конфиденциальности | Брикет-Бери',
    description: 'Политика обработки персональных данных сайта Брикет-Бери.',
  },
  '/terms': {
    title: 'Пользовательское соглашение | Брикет-Бери',
    description: 'Пользовательское соглашение и условия использования сайта Брикет-Бери.',
  },
  '/consent': {
    title: 'Согласие на обработку персональных данных | Брикет-Бери',
    description: 'Условия согласия на обработку персональных данных пользователей сайта Брикет-Бери.',
  },
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function normalizePathname(pathname: string) {
  if (!pathname || pathname === '/') return '/'
  return pathname.endsWith('/') ? pathname.slice(0, -1) : pathname
}

function getSeoMetaForPath(pathname: string): SeoMeta {
  const normalized = normalizePathname(pathname)
  if (normalized.startsWith('/blog/')) {
    return {
      title: 'Статья блога | Брикет-Бери',
      description: 'Материалы Брикет-Бери о брикетах Pini Kay, работе с хоспером и экономике кухни.',
    }
  }
  if (normalized.startsWith('/admin')) {
    return {
      title: 'Панель управления | Брикет-Бери',
      description: 'Административный раздел сайта Брикет-Бери.',
      robots: 'noindex,nofollow',
    }
  }
  return SEO_META_BY_PATH[normalized] || SEO_META_BY_PATH['/']
}

function renderSeoHtml(template: string, pathname: string) {
  const normalized = normalizePathname(pathname)
  const seo = getSeoMetaForPath(normalized)
  const canonicalUrl = `${SITE_URL}${normalized === '/' ? '/' : normalized}`
  const title = escapeHtml(seo.title)
  const description = escapeHtml(seo.description)
  const robots = escapeHtml(seo.robots || 'index,follow')

  return template
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`)
    .replace(/<meta name="description" content="[\s\S]*?" \/>/, `<meta name="description" content="${description}" />`)
    .replace(/<meta name="robots" content="[\s\S]*?" \/>/, `<meta name="robots" content="${robots}" />`)
    .replace(/<link rel="canonical" href="[\s\S]*?" \/>/, `<link rel="canonical" href="${canonicalUrl}" />`)
    .replace(/<meta property="og:title" content="[\s\S]*?" \/>/, `<meta property="og:title" content="${title}" />`)
    .replace(/<meta property="og:description" content="[\s\S]*?" \/>/, `<meta property="og:description" content="${description}" />`)
    .replace(/<meta property="og:url" content="[\s\S]*?" \/>/, `<meta property="og:url" content="${canonicalUrl}" />`)
    .replace(/<meta name="twitter:title" content="[\s\S]*?" \/>/, `<meta name="twitter:title" content="${title}" />`)
    .replace(/<meta name="twitter:description" content="[\s\S]*?" \/>/, `<meta name="twitter:description" content="${description}" />`)
}

// Trust Railway/Nginx proxy
app.set('trust proxy', 1)

// Security
app.use(helmet({
  contentSecurityPolicy: false, // configured separately for prod
}))

// Enforce secure resource loading to avoid browser "Not secure" warnings caused by mixed content.
app.use((_req, res, next) => {
  res.setHeader('Content-Security-Policy', 'upgrade-insecure-requests; block-all-mixed-content')
  next()
})

// CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://briket-berry.ru',
  'https://www.briket-berry.ru',
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

// Keep a single canonical host for SEO signals.
app.use((req, res, next) => {
  const hostHeader = req.headers.host?.split(':')[0]?.toLowerCase()
  if (process.env.NODE_ENV === 'production' && hostHeader === APEX_HOST) {
    return res.redirect(301, `https://${PRIMARY_HOST}${req.originalUrl}`)
  }
  next()
})

// Routes
app.use('/api/v1/orders', ordersRouter)
app.use('/api/v1/clients', clientsRouter)
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

// Serve frontend (SPA) from monorepo build when available.
const frontendDistCandidates = [
  process.env.FRONTEND_DIST_PATH,
  path.resolve(__dirname, '..', '..', 'frontend', 'dist'),
  path.resolve(__dirname, '..', 'frontend-dist'),
].filter((value): value is string => Boolean(value))

const frontendDistPath = frontendDistCandidates.find((candidate) =>
  fs.existsSync(path.join(candidate, 'index.html')),
)

if (frontendDistPath) {
  const indexHtmlPath = path.join(frontendDistPath, 'index.html')
  const indexHtmlTemplate = fs.readFileSync(indexHtmlPath, 'utf8')

  // Ensure crawlers always get indexability files, even with SPA fallback.
  app.get('/robots.txt', (_req, res) => {
    res.type('text/plain')
    res.sendFile(path.join(frontendDistPath, 'robots.txt'))
  })
  app.get('/sitemap.xml', (_req, res) => {
    res.type('application/xml')
    res.sendFile(path.join(frontendDistPath, 'sitemap.xml'))
  })

  app.use(express.static(frontendDistPath))
  app.get(/^\/(?!api\/).*/, (req, res) => {
    const html = renderSeoHtml(indexHtmlTemplate, req.path)
    res.status(200).type('html').send(html)
  })
  console.log(`✅ Frontend static enabled: ${frontendDistPath}`)
} else {
  console.warn('⚠️ Frontend dist not found, API-only mode is active')
}

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
    const password = process.env.ADMIN_PASSWORD
    if (!password) {
      if (process.env.NODE_ENV === 'production') {
        console.warn('⚠️ ADMIN_PASSWORD not set: skip admin bootstrap in production')
        return
      }
      console.warn('⚠️ ADMIN_PASSWORD not set: skip admin bootstrap in development')
      return
    }
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
          // Не перезаписываем данные, если товар уже есть.
          // Инициализация нужна только для первого старта (когда в БД пусто).
          update: {},
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
  const mailDbg = getMailWebhookDebug()
  console.log(
    `[mail] webhook ${mailDbg.ready ? 'ON' : 'OFF'} (hasUrl=${mailDbg.hasUrl} hasSecret=${mailDbg.hasSecret} host=${mailDbg.urlHost || '—'})`,
  )
  if (isOutboundNodeSmtpBlocked() && !mailDbg.ready) {
    console.warn('[mail] Исходящий SMTP из Node на этой платформе не используется — задайте CLOUDBELL_MAIL_WEBHOOK_URL + MAIL_WEBHOOK_SECRET')
  }
  await initAdmin()
  await initDefaultProducts()
})

export default app
