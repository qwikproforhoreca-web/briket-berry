import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config()

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

app.listen(PORT, () => {
  console.log(`🔥 Server running on http://localhost:${PORT}`)
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`)
})

export default app
