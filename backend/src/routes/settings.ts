import { Router, Request, Response } from 'express'
import { prisma } from '../utils/prisma'
import { successResponse, errorResponse } from '../utils/response'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import { sendSmtpTestEmail } from '../utils/email'
import { isOutboundNodeSmtpBlocked, MAIL_WEBHOOK_REQUIRED_RU } from '../utils/mailPolicy'
import {
  getMailWebhookDebug,
  isCloudbellMailWebhookEnabled,
  sendTestViaCloudbell,
} from '../utils/mailWebhook'

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

// GET /api/v1/settings/email/webhook-status — видно, видит ли API переменные Railway (без отправки почты)
router.get('/email/webhook-status', authMiddleware, async (_req: AuthRequest, res: Response) => {
  return successResponse(res, getMailWebhookDebug())
})

// POST /api/v1/settings/email/test - Admin
router.post('/email/test', authMiddleware, async (_req: AuthRequest, res: Response) => {
  const dbg = getMailWebhookDebug()

  if (isCloudbellMailWebhookEnabled()) {
    try {
      const result = await sendTestViaCloudbell()
      if (!result.sent) {
        return errorResponse(res, 400, 'EMAIL_INCOMPLETE', 'Webhook ответил без успеха — проверьте PHP и mail-config.php')
      }
      return successResponse(res, { sent: true, recipients: result.recipients, via: 'webhook' as const })
    } catch (e) {
      const msg = (e as Error).message
      const hint =
        dbg.hasUrl && !dbg.hasSecret
          ? ' Задайте MAIL_WEBHOOK_SECRET в Railway (как webhook_secret в mail-config.php).'
          : !dbg.hasUrl && dbg.hasSecret
            ? ' Задайте CLOUDBELL_MAIL_WEBHOOK_URL или MAIL_WEBHOOK_URL.'
            : ''
      return errorResponse(res, 500, 'EMAIL_TEST_FAILED', `Webhook: ${msg}${hint}`)
    }
  }

  if (isOutboundNodeSmtpBlocked()) {
    return errorResponse(res, 400, 'EMAIL_WEBHOOK_REQUIRED', MAIL_WEBHOOK_REQUIRED_RU)
  }

  try {
    const result = await sendSmtpTestEmail()
    if (!result.sent) {
      return errorResponse(
        res,
        400,
        'EMAIL_INCOMPLETE',
        'Заполните SMTP в админке (Host, Port, User, Password)',
      )
    }
    const recipients = 'recipients' in result && Array.isArray(result.recipients) ? result.recipients : []
    return successResponse(res, { sent: true, recipients, via: 'smtp' as const })
  } catch (e) {
    return errorResponse(
      res,
      500,
      'EMAIL_TEST_FAILED',
      `Не удалось отправить тестовое письмо: ${(e as Error).message}`,
    )
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
