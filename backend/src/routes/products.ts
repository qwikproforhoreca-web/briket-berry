import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { prisma } from '../utils/prisma'
import { successResponse, errorResponse } from '../utils/response'
import { authMiddleware, AuthRequest } from '../middleware/auth'

const router = Router()

// GET /api/v1/products - Public
router.get('/', async (req: Request, res: Response) => {
  const category = req.query.category as string | undefined
  const where: any = {}
  if (category) where.category = category

  const products = await prisma.product.findMany({
    where,
    orderBy: { sortOrder: 'asc' },
  })

  return successResponse(res, products)
})

// GET /api/v1/products/:id - Public
router.get('/:id', async (req: Request, res: Response) => {
  const id = String(req.params.id)
  const product = await prisma.product.findFirst({
    where: { OR: [{ id }, { slug: id }] },
  })

  if (!product) return errorResponse(res, 404, 'NOT_FOUND', 'Продукт не найден')
  return successResponse(res, product)
})

// POST /api/v1/products - Admin
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const product = await prisma.product.create({ data: req.body })
  return successResponse(res, product, 201)
})

// PUT /api/v1/products/:id - Admin
router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  const product = await prisma.product.update({
    where: { id: String(req.params.id) },
    data: req.body,
  })
  return successResponse(res, product)
})

// DELETE /api/v1/products/:id - Admin
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  await prisma.product.delete({ where: { id: String(req.params.id) } })
  return successResponse(res, { deleted: true })
})

export default router
