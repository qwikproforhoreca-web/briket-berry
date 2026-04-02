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
  const body = req.body || {}

  // Backward-compatible normalization for different frontend payloads.
  type PrismaProductCategory = 'BRIQUETTES' | 'FIRESTARTERS'

  const toSlug = (input: unknown) => {
    const s = String(input || '')
    return s
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9а-яё]+/gi, '-')
      .replace(/(^-|-$)/g, '')
  }

  const normalizeCategory = (value: unknown): PrismaProductCategory | undefined => {
    const v = String(value || '').trim().toLowerCase()
    if (v === 'briquettes') return 'BRIQUETTES'
    if (v === 'firestarters') return 'FIRESTARTERS'
    if (v === 'брекеты' || v === 'брекеты pini kay') return 'BRIQUETTES'
    if (v === 'разжигатели') return 'FIRESTARTERS'
    return undefined
  }

  const normalizeNumber = (value: unknown) => {
    const n = Number(value)
    return Number.isFinite(n) ? n : undefined
  }

  const name = String(body.name || '').trim()
  const sku = String(body.sku || '').trim()
  const description = String(body.description || '').trim()

  const slug = body.slug ? String(body.slug) : toSlug(name)
  const shortDesc =
    body.shortDesc
      ? String(body.shortDesc)
      : (description ? description.slice(0, 140) : name)

  const category = normalizeCategory(body.category)

  const price = normalizeNumber(body.price)
  const priceWholesale = normalizeNumber(body.priceWholesale ?? body.wholesalePrice)
  const weight = normalizeNumber(body.weight) ?? 0

  const images = Array.isArray(body.images) ? body.images : []

  if (!name || !sku || !slug || !shortDesc || price === undefined || !category) {
    return errorResponse(
      res,
      400,
      'VALIDATION_ERROR',
      'Не хватает обязательных полей (name, sku, slug, shortDesc, price, category)'
    )
  }

  const product = await prisma.product.create({
    data: {
      name,
      slug,
      sku,
      description: description || name,
      shortDesc,
      price,
      ...(priceWholesale !== undefined ? { priceWholesale } : {}),
      category,
      weight,
      ...(Array.isArray(images) ? { images } : {}),
      // Prisma schema требует specs: Json (можно пустой объект)
      specs: typeof body.specs !== 'undefined' ? body.specs : {},
      ...(typeof body.inStock === 'boolean' ? { inStock: body.inStock } : {}),
      ...(typeof body.featured === 'boolean' ? { featured: body.featured } : {}),
      ...(body.sortOrder !== undefined ? { sortOrder: Number(body.sortOrder) || 0 } : {}),
    },
  })

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
