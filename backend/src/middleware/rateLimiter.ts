import rateLimit from 'express-rate-limit'

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMIT', message: 'Слишком много запросов. Попробуйте через 15 минут.' } },
})

export const orderLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { success: false, error: { code: 'RATE_LIMIT', message: 'Слишком много заявок. Позвоните нам напрямую.' } },
})

export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true,
  message: { success: false, error: { code: 'RATE_LIMIT', message: 'Слишком много попыток входа.' } },
})

export const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  message: { success: false, error: { code: 'RATE_LIMIT', message: 'Лимит запросов к ИИ превышен.' } },
})
