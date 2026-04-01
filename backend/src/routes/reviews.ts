import { Router, Request, Response } from 'express'
import { prisma } from '../utils/prisma'
import { successResponse, errorResponse } from '../utils/response'
import { authMiddleware, AuthRequest } from '../middleware/auth'

const router = Router()

// GET /api/v1/reviews - Public (only published)
router.get('/', async (_req: Request, res: Response) => {
  const reviews = await prisma.review.findMany({
    where: { published: true },
    orderBy: { sortOrder: 'asc' },
  })
  return successResponse(res, reviews)
})

// GET /api/v1/reviews/all - Admin
router.get('/all', authMiddleware, async (_req: AuthRequest, res: Response) => {
  const reviews = await prisma.review.findMany({ orderBy: { sortOrder: 'asc' } })
  return successResponse(res, reviews)
})

// POST /api/v1/reviews - Admin
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const review = await prisma.review.create({ data: req.body })
  return successResponse(res, review, 201)
})

// PUT /api/v1/reviews/:id - Admin
router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  const review = await prisma.review.update({
    where: { id: String(req.params.id) },
    data: req.body,
  })
  return successResponse(res, review)
})

// PATCH /api/v1/reviews/:id/publish - Admin
router.patch('/:id/publish', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { published } = req.body
  const review = await prisma.review.update({
    where: { id: String(req.params.id) },
    data: { published, publishedAt: published ? new Date() : null },
  })
  return successResponse(res, review)
})

// DELETE /api/v1/reviews/:id - Admin
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  await prisma.review.delete({ where: { id: String(req.params.id) } })
  return successResponse(res, { deleted: true })
})

export default router
