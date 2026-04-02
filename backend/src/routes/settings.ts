import { Router, Request, Response } from 'express'
import { prisma } from '../utils/prisma'
import { successResponse, errorResponse } from '../utils/response'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import { sendSmtpTestEmail } from '../utils/email'

const router = Router()

// Public settings keys that can be exposed
const PUBLIC_KEYS = [
  'site.name', 'site.phone', 'site.whatsapp', 'site.telegram', 'site.max',
  'site.email', 'site.address', 'hero.videoUrl', 'tutorial.videoUrl',
  'ai.enabled', 'ai.botName',
]

// GET /api/v1/settings - Public
router.get('/', async (_req: Request, res: Response) => {
  try {
    const settings = await prisma.setting.findMany({
      where: { key: { in: PUBLIC_KEYS } },
    })
    return successResponse(res, settings)
  } catch {
    return successResponse(res, [])
  }
})

// GET /api/v1/settings/all - Admin
router.get('/all', authMiddleware, async (_req: AuthRequest, res: Response) => {
  const settings = await prisma.setting.findMany({ orderBy: { group: 'asc' } })
  return successResponse(res, settings)
})

// POST /api/v1/settings/email/test - Admin
router.post('/email/test', authMiddleware, async (_req: AuthRequest, res: Response) => {
  try {
    const result = await sendSmtpTestEmail()
    if (!result.sent) {
      return errorResponse(res, 400, 'SMTP_INCOMPLETE', 'Заполните SMTP Host/Port/User/Password и email.notifyTo')
    }
    return successResponse(res, { sent: true, recipients: result.recipients })
  } catch (e) {
    return errorResponse(res, 500, 'SMTP_TEST_FAILED', `Не удалось отправить тестовое письмо: ${(e as Error).message}`)
  }
})

// PUT /api/v1/settings/:key - Admin
router.put('/:key', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { value } = req.body
  const key = String(req.params.key)
  const setting = await prisma.setting.upsert({
    where: { key },
    update: { value },
    create: {
      key,
      value,
      label: key,
      type: 'STRING',
      group: 'general',
    },
  })
  return successResponse(res, setting)
})

export default router
