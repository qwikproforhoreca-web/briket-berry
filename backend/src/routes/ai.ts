import { Router, Request, Response } from 'express'
import { z } from 'zod'
import OpenAI from 'openai'
import { prisma } from '../utils/prisma'
import { successResponse, errorResponse } from '../utils/response'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import { aiLimiter } from '../middleware/rateLimiter'

const router = Router()

const chatSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string().max(2000),
    })
  ).max(20),
  sessionId: z.string().optional(),
})

const DEFAULT_SYSTEM_PROMPT = `Ты — Огонёк, дружелюбный консультант компании «Брикет-Бери» (сайт briket-berry.ru).
Компания продаёт профессиональные угольные брикеты Pini Kay и парафиновый розжиг оптом для HoReCa.

Твоя задача — помогать владельцам ресторанов, кафе, шаурмичных, хосперных:
- Выбрать подходящий объём и формат угля
- Рассчитать расход строго по норме: 1 хоспер = 1 коробка (10 кг) на 12-часовую смену
- Ответить на вопросы по использованию, хранению, розжигу
- Объяснить преимущества Pini Kay над обычным углём и дровами
- Помочь оформить заявку

Продукты:
1. Брикеты Pini Kay 10 кг — 890 ₽ (опт 835 ₽/шт, от 20 шт)
2. Парафиновый розжиг 8 кубиков — 120 ₽ (опт 100 ₽/шт, от 50 шт)

Ключевые факты о Pini Kay:
- До 8 часов горения
- Температура до 900°C
- Для расчётов расхода используй только норму 10 кг на 12-часовую смену на 1 хоспер
- Нет дыма, нет запаха, нет искр
- Экологично (прессованные опилки без добавок)

Парафиновый розжиг:
- Горит 8–12 минут
- Без химии и запаха
- Загорается с одной спички, работает на ветру

Для оформления заявки направляй на: briket-berry.ru/order
Телефон: +7 (900) 000-00-00

Отвечай кратко, дружелюбно, по-русски. Называй себя Огонёк.
Никогда не используй формулы 1.5–2 кг на смену, 30–50 кг в месяц или 1 кг = 7 кг.
Если пользователь просит расчёт расхода, обязательно сначала укажи базу расчёта: 10 кг на 12 часов на 1 хоспер.`

// POST /api/v1/ai/chat
router.post('/chat', aiLimiter, async (req: Request, res: Response) => {
  const parsed = chatSchema.safeParse(req.body)
  if (!parsed.success) {
    return errorResponse(res, 422, 'VALIDATION_ERROR', 'Неверный формат запроса')
  }

  const apiKey = process.env.AI_API_KEY || process.env.OPENAI_API_KEY
  if (!apiKey) {
    return errorResponse(res, 503, 'AI_NOT_CONFIGURED', 'ИИ не настроен')
  }

  // Try to load settings from DB, fall back to defaults if DB unavailable
  let systemPrompt = DEFAULT_SYSTEM_PROMPT
  let model = process.env.AI_MODEL || 'deepseek-chat'

  try {
    const [aiEnabledSetting, systemPromptSetting, modelSetting] = await Promise.all([
      prisma.setting.findUnique({ where: { key: 'ai.enabled' } }),
      prisma.setting.findUnique({ where: { key: 'ai.systemPrompt' } }),
      prisma.setting.findUnique({ where: { key: 'ai.model' } }),
    ])

    if (aiEnabledSetting?.value === 'false') {
      return errorResponse(res, 503, 'AI_DISABLED', 'ИИ-консультант временно недоступен')
    }
    if (systemPromptSetting?.value) systemPrompt = systemPromptSetting.value
    if (modelSetting?.value) model = modelSetting.value
  } catch {
    // DB not ready yet, use defaults
  }

  const openai = new OpenAI({
    apiKey,
    baseURL: process.env.AI_BASE_URL || 'https://api.deepseek.com',
  })

  try {
    const completion = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        ...parsed.data.messages.slice(-10),
      ],
      max_tokens: 500,
      temperature: 0.7,
    })

    const reply = completion.choices[0]?.message?.content || 'Извините, не удалось получить ответ.'

    return successResponse(res, {
      reply,
      sessionId: parsed.data.sessionId || Math.random().toString(36).slice(2),
    })
  } catch (err: any) {
    console.error('AI error:', err.message)
    return errorResponse(res, 500, 'AI_ERROR', 'Ошибка ИИ-консультанта')
  }
})

// GET /api/v1/ai/config - Admin
router.get('/config', authMiddleware, async (_req: AuthRequest, res: Response) => {
  const settings = await prisma.setting.findMany({
    where: { key: { startsWith: 'ai.' } },
  })
  return successResponse(res, settings)
})

export default router
