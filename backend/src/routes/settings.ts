import { Router, Request, Response } from 'express'
import { prisma } from '../utils/prisma'
import { successResponse } from '../utils/response'
import { authMiddleware, AuthRequest } from '../middleware/auth'

const router = Router()

// Public settings keys that can be exposed
const PUBLIC_KEYS = [
  'site.name', 'site.phone', 'site.whatsapp', 'site.telegram',
  'site.email', 'site.address', 'hero.videoUrl', 'tutorial.videoUrl',
  'ai.enabled', 'ai.botName',
]

// GET /api/v1/settings - Public
router.get('/', async (_req: Request, res: Response) => {
  const settings = await prisma.setting.findMany({
    where: { key: { in: PUBLIC_KEYS } },
  })
  const map = settings.reduce((acc: Record<string, string>, s) => {
    acc[s.key] = s.value
    return acc
  }, {})
  return successResponse(res, map)
})

// GET /api/v1/settings/all - Admin
router.get('/all', authMiddleware, async (_req: AuthRequest, res: Response) => {
  const settings = await prisma.setting.findMany({ orderBy: { group: 'asc' } })
  return successResponse(res, settings)
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
